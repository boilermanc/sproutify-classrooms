import { supabase } from '@/integrations/supabase/client';
import {
  NetworkSettings,
  ClassroomConnection,
  NetworkChallenge,
  ChallengeParticipation
} from '@/integrations/supabase/types';

// ----- Schema-aware client wrapper -------------------------------------------
const SCHEMA = (import.meta as any)?.env?.VITE_DB_SCHEMA || 'public';
const db = SCHEMA && SCHEMA !== 'public' ? supabase.schema(SCHEMA) : supabase;

function ensureNo406(status?: number | null) {
  if (status === 406) {
    throw new Error(
      'Supabase 406: set VITE_DB_SCHEMA to the schema that contains your tables (e.g. "app" or "public").'
    );
  }
}

// ----- Extended interfaces ---------------------------------------------------
export interface ClassroomWithProfile {
  id: string;
  name: string;
  teacher_id: string;
  teacher?: {
    full_name: string | null;
    school_name: string | null;
    district: string | null;
  };
  network_settings?: NetworkSettings;
  harvest_stats?: {
    total_weight: number;
    total_plants: number;
    tower_count: number;
  };
}

export interface ConnectionWithDetails extends ClassroomConnection {
  requester_classroom?: {
    name: string;
    network_settings?: NetworkSettings;
  };
  target_classroom?: {
    name: string;
    network_settings?: NetworkSettings;
  };
}

export interface ChallengeWithParticipation extends NetworkChallenge {
  participation_count: number;
  is_participating: boolean;
  my_participation?: ChallengeParticipation;
}

export interface NetworkLeaderboardEntry {
  classroom_id: string;
  classroom_name: string;
  display_name: string | null;
  total_harvest_weight: number;
  total_harvest_plants: number;
  tower_count: number;
  region: string | null;
  grade_level: string | null;
  school_name: string | null;
  is_connected: boolean;
}

export interface ClassroomDiscoveryFilters {
  region?: string;
  grade_level?: string;
  school_type?: string;
  search?: string;
  exclude_connected?: boolean;
}

export class NetworkService {
  // ===========================================================================
  // NETWORK SETTINGS
  // ===========================================================================
  static async getNetworkSettings(classroomId: string): Promise<NetworkSettings | null> {
    const { data, error, status } = await db
      .from('classroom_network_settings')
      .select('*')
      .eq('classroom_id', classroomId)
      .maybeSingle();

    ensureNo406(status);
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async upsertNetworkSettings(settings: NetworkSettings): Promise<NetworkSettings> {
    const { data, error, status } = await db
      .from('classroom_network_settings')
      .upsert(settings, { onConflict: 'classroom_id' })
      .select()
      .maybeSingle();

    ensureNo406(status);
    if (error) throw error;
    return data as NetworkSettings;
  }

  static async disableNetwork(classroomId: string): Promise<void> {
    const { error, status } = await db
      .from('classroom_network_settings')
      .update({ is_network_enabled: false })
      .eq('classroom_id', classroomId);

    ensureNo406(status);
    if (error) throw error;
  }

  // ===========================================================================
  // CLASSROOM DISCOVERY
  // ===========================================================================
  static async discoverClassrooms(
    currentClassroomId: string,
    filters: ClassroomDiscoveryFilters = {}
  ): Promise<ClassroomWithProfile[]> {
    let query = db
      .from('classroom_network_settings')
      .select(
        `
        *,
        classroom:classrooms (
          id,
          name,
          teacher_id,
        teacher:profiles (
          full_name,
          district,
          schools(name)
        )
        )
      `
      )
      .eq('is_network_enabled', true)
      .in('visibility_level', ['public', 'network_only'])
      .neq('classroom_id', currentClassroomId);

    if (filters.region) query = query.eq('region', filters.region);
    if (filters.grade_level) query = query.eq('grade_level', filters.grade_level);
    if (filters.school_type) query = query.eq('school_type', filters.school_type);
    if (filters.search) {
      query = query.or(`display_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
    }

    const { data, error, status } = await query.limit(50);
    ensureNo406(status);
    if (error) throw error;

    if (!data) return [];

    if (filters.exclude_connected) {
      const connectedIds = await this.getConnectedClassroomIds(currentClassroomId);
      return data
        .filter((item: any) => !connectedIds.includes(item.classroom_id))
        .map(this.mapToClassroomWithProfile);
    }

    return data.map(this.mapToClassroomWithProfile);
  }

  static async searchClassroomsByName(
    searchTerm: string,
    limit: number = 20
  ): Promise<ClassroomWithProfile[]> {
    const { data, error, status } = await db
      .from('classroom_network_settings')
      .select(
        `
        *,
        classroom:classrooms (
          id,
          name,
          teacher_id,
        teacher:profiles (
          full_name,
          district,
          schools(name)
        )
        )
      `
      )
      .eq('is_network_enabled', true)
      .eq('visibility_level', 'public')
      .or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
      .limit(limit);

    ensureNo406(status);
    if (error) throw error;
    return (data || []).map(this.mapToClassroomWithProfile);
  }

  // ===========================================================================
  // CONNECTIONS
  // ===========================================================================
  static async sendConnectionRequest(
    requesterClassroomId: string,
    targetClassroomId: string,
    connectionType: 'competition' | 'collaboration' | 'mentorship',
    message?: string
  ): Promise<ClassroomConnection> {
    const existing = await this.getExistingConnection(requesterClassroomId, targetClassroomId);
    if (existing) throw new Error('A connection request already exists between these classrooms');

    const { data, error, status } = await db
      .from('classroom_connections')
      .insert({
        requester_classroom_id: requesterClassroomId,
        target_classroom_id: targetClassroomId,
        connection_type: connectionType,
        message,
        status: 'pending'
      })
      .select()
      .maybeSingle();

    ensureNo406(status);
    if (error) throw error;
    return data as ClassroomConnection;
  }

  static async getMyConnections(classroomId: string): Promise<ConnectionWithDetails[]> {
    // First get the connections
    const { data: connections, error: connectionsError, status: s1 } = await db
      .from('classroom_connections')
      .select('*')
      .or(`requester_classroom_id.eq.${classroomId},target_classroom_id.eq.${classroomId}`)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false });

    ensureNo406(s1);
    if (connectionsError) throw connectionsError;

    if (!connections || connections.length === 0) {
      return [];
    }

    // Get unique classroom IDs from connections
    const classroomIds = new Set<string>();
    connections.forEach(conn => {
      classroomIds.add(conn.requester_classroom_id);
      classroomIds.add(conn.target_classroom_id);
    });

    // Get network settings for all involved classrooms
    const { data: networkSettings, error: settingsError, status: s2 } = await db
      .from('classroom_network_settings')
      .select(`
        classroom_id,
        display_name,
        bio,
        classroom:classrooms (name)
      `)
      .in('classroom_id', Array.from(classroomIds));

    ensureNo406(s2);
    if (settingsError) throw settingsError;

    // Create a map for quick lookup
    const settingsMap = new Map();
    networkSettings?.forEach(setting => {
      settingsMap.set(setting.classroom_id, setting);
    });

    // Combine the data
    const result: ConnectionWithDetails[] = connections.map(conn => ({
      ...conn,
      requester_classroom: settingsMap.get(conn.requester_classroom_id),
      target_classroom: settingsMap.get(conn.target_classroom_id)
    }));

    return result;
  }

  static async getPendingRequests(classroomId: string): Promise<{
    incoming: ConnectionWithDetails[];
    outgoing: ConnectionWithDetails[];
  }> {
    // Get incoming requests
    const { data: incomingConnections, error: incomingError, status: s1 } = await db
      .from('classroom_connections')
      .select('*')
      .eq('target_classroom_id', classroomId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    ensureNo406(s1);
    if (incomingError) throw incomingError;

    // Get outgoing requests
    const { data: outgoingConnections, error: outgoingError, status: s2 } = await db
      .from('classroom_connections')
      .select('*')
      .eq('requester_classroom_id', classroomId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    ensureNo406(s2);
    if (outgoingError) throw outgoingError;

    // Get all unique classroom IDs from both incoming and outgoing requests
    const allClassroomIds = new Set<string>();
    [...(incomingConnections || []), ...(outgoingConnections || [])].forEach(conn => {
      allClassroomIds.add(conn.requester_classroom_id);
      allClassroomIds.add(conn.target_classroom_id);
    });

    // Get network settings for all involved classrooms
    const { data: networkSettings, error: settingsError, status: s3 } = await db
      .from('classroom_network_settings')
      .select(`
        classroom_id,
        display_name,
        bio,
        classroom:classrooms (name)
      `)
      .in('classroom_id', Array.from(allClassroomIds));

    ensureNo406(s3);
    if (settingsError) throw settingsError;

    // Create a map for quick lookup
    const settingsMap = new Map();
    networkSettings?.forEach(setting => {
      settingsMap.set(setting.classroom_id, setting);
    });

    // Combine the data
    const incoming: ConnectionWithDetails[] = (incomingConnections || []).map(conn => ({
      ...conn,
      requester_classroom: settingsMap.get(conn.requester_classroom_id),
      target_classroom: settingsMap.get(conn.target_classroom_id)
    }));

    const outgoing: ConnectionWithDetails[] = (outgoingConnections || []).map(conn => ({
      ...conn,
      requester_classroom: settingsMap.get(conn.requester_classroom_id),
      target_classroom: settingsMap.get(conn.target_classroom_id)
    }));

    return { incoming, outgoing };
  }

  static async respondToConnectionRequest(
    connectionId: string,
    statusValue: 'accepted' | 'declined'
  ): Promise<ClassroomConnection> {
    const updateData: any = { status: statusValue };
    if (statusValue === 'accepted') updateData.accepted_at = new Date().toISOString();

    const { data, error, status } = await db
      .from('classroom_connections')
      .update(updateData)
      .eq('id', connectionId)
      .select()
      .maybeSingle();

    ensureNo406(status);
    if (error) throw error;
    return data as ClassroomConnection;
  }

  static async removeConnection(connectionId: string): Promise<void> {
    const { error, status } = await db.from('classroom_connections').delete().eq('id', connectionId);
    ensureNo406(status);
    if (error) throw error;
  }

  static async blockClassroom(connectionId: string): Promise<void> {
    const { error, status } = await db
      .from('classroom_connections')
      .update({ status: 'blocked' })
      .eq('id', connectionId);

    ensureNo406(status);
    if (error) throw error;
  }

  // ===========================================================================
  // CHALLENGES
  // ===========================================================================
  static async getActiveChallenges(classroomId?: string): Promise<ChallengeWithParticipation[]> {
    let query = db
      .from('network_challenges')
      .select(
        `
        *,
        participation:classroom_challenge_participation(count)
      `
      )
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    const { data: challenges, error, status } = await query;
    ensureNo406(status);
    if (error) throw error;

    if (!challenges) return [];

    if (classroomId) {
      const { data: participations, status: s2 } = await db
        .from('classroom_challenge_participation')
        .select('*')
        .eq('classroom_id', classroomId);

      ensureNo406(s2);

      const participationMap = new Map(
        (participations || []).map((p: any) => [p.challenge_id, p])
      );

      return (challenges as any[]).map((challenge: any) => ({
        ...challenge,
        participation_count: challenge.participation?.[0]?.count || 0,
        is_participating: participationMap.has(challenge.id),
        my_participation: participationMap.get(challenge.id)
      }));
    }

    return (challenges as any[]).map((challenge: any) => ({
      ...challenge,
      participation_count: challenge.participation?.[0]?.count || 0,
      is_participating: false
    }));
  }

  static async joinChallenge(classroomId: string, challengeId: string): Promise<ChallengeParticipation> {
    const { data, error, status } = await db
      .from('classroom_challenge_participation')
      .insert({ classroom_id: classroomId, challenge_id: challengeId })
      .select()
      .maybeSingle();

    ensureNo406(status);
    if (error) throw error;
    return data as ChallengeParticipation;
  }

  static async leaveChallenge(classroomId: string, challengeId: string): Promise<void> {
    const { error, status } = await db
      .from('classroom_challenge_participation')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('challenge_id', challengeId);

    ensureNo406(status);
    if (error) throw error;
  }

  static async getChallengeLeaderboard(challengeId: string): Promise<any[]> {
    const { data, error, status } = await db
      .from('classroom_challenge_participation')
      .select(
        `
        *,
        classroom:classrooms (
          name,
          network_settings:classroom_network_settings (display_name)
        )
      `
      )
      .eq('challenge_id', challengeId)
      .order('final_score', { ascending: false, nullsFirst: false });

    ensureNo406(status);
    if (error) throw error;
    return data || [];
  }

  // ===========================================================================
  // LEADERBOARD
  // ===========================================================================
  static async getNetworkLeaderboard(
    classroomId: string,
    filters: {
      connected_only?: boolean;
      region?: string;
      grade_level?: string;
      limit?: number;
    } = {}
  ): Promise<NetworkLeaderboardEntry[]> {
    // Pull classrooms with network settings; include teacher_id for later aggregation
    let baseQuery = db
      .from('classroom_network_settings')
      .select(
        `
        classroom_id,
        display_name,
        region,
        grade_level,
        classroom:classrooms (
          id,
          name,
          teacher_id,
          teacher:profiles (
            schools(name)
          )
        )
      `
      )
      .eq('is_network_enabled', true)
      .eq('share_harvest_data', true);

    if (filters.region) baseQuery = baseQuery.eq('region', filters.region);
    if (filters.grade_level) baseQuery = baseQuery.eq('grade_level', filters.grade_level);

    const { data: networkClassrooms, error, status } = await baseQuery.limit(filters.limit || 100);
    ensureNo406(status);
    if (error) throw error;
    if (!networkClassrooms) return [];

    const connectedIds = filters.connected_only
      ? await this.getConnectedClassroomIds(classroomId)
      : [];

    const leaderboardEntries: NetworkLeaderboardEntry[] = [];

    for (const classroom of networkClassrooms as any[]) {
      const cls = classroom.classroom as any;
      if (!cls) continue;

      if (filters.connected_only && !connectedIds.includes(classroom.classroom_id)) continue;

      // Harvest totals (simplified; ideally via RPC)
      const { data: harvests, status: sH } = await db
        .from('harvests')
        .select('weight_grams, plant_quantity')
        .eq('teacher_id', cls.teacher_id);

      ensureNo406(sH);

      const totalWeight = (harvests || []).reduce((sum: number, h: any) => sum + (h.weight_grams || 0), 0);
      const totalPlants = (harvests || []).reduce((sum: number, h: any) => sum + (h.plant_quantity || 0), 0);

      // Tower count
      const { count: towerCount, status: sT } = await db
        .from('towers')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', cls.teacher_id);

      ensureNo406(sT);

      leaderboardEntries.push({
        classroom_id: classroom.classroom_id,
        classroom_name: cls.name,
        display_name: classroom.display_name,
        total_harvest_weight: totalWeight,
        total_harvest_plants: totalPlants,
        tower_count: towerCount || 0,
        region: classroom.region,
        grade_level: classroom.grade_level,
        school_name: cls.teacher?.schools?.name || null,
        is_connected: connectedIds.includes(classroom.classroom_id)
      });
    }

    return leaderboardEntries.sort((a, b) => b.total_harvest_weight - a.total_harvest_weight);
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================
  private static async getExistingConnection(
    classroomId1: string,
    classroomId2: string
  ): Promise<ClassroomConnection | null> {
    const { data, error, status } = await db
      .from('classroom_connections')
      .select('*')
      .or(
        `and(requester_classroom_id.eq.${classroomId1},target_classroom_id.eq.${classroomId2}),` +
          `and(requester_classroom_id.eq.${classroomId2},target_classroom_id.eq.${classroomId1})`
      )
      .maybeSingle();

    ensureNo406(status);
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  private static async getConnectedClassroomIds(classroomId: string): Promise<string[]> {
    const { data, error, status } = await db
      .from('classroom_connections')
      .select('requester_classroom_id, target_classroom_id')
      .or(`requester_classroom_id.eq.${classroomId},target_classroom_id.eq.${classroomId}`)
      .eq('status', 'accepted');

    ensureNo406(status);
    if (error) throw error;

    return (data || []).map((conn: any) =>
      conn.requester_classroom_id === classroomId ? conn.target_classroom_id : conn.requester_classroom_id
    );
  }

  private static mapToClassroomWithProfile(item: any): ClassroomWithProfile {
    return {
      id: item.classroom.id,
      name: item.classroom.name,
      teacher_id: item.classroom.teacher_id,
      teacher: item.classroom.teacher,
      network_settings: {
        id: item.id,
        classroom_id: item.classroom_id,
        is_network_enabled: item.is_network_enabled,
        visibility_level: item.visibility_level,
        share_harvest_data: item.share_harvest_data,
        share_photos: item.share_photos,
        share_growth_tips: item.share_growth_tips,
        display_name: item.display_name,
        bio: item.bio,
        region: item.region,
        grade_level: item.grade_level,
        school_type: item.school_type
      }
    };
  }

  // ===========================================================================
  // STATS (basic)
  // ===========================================================================
  static async getNetworkStats(): Promise<{
    total_classrooms: number;
    total_connections: number;
    active_challenges: number;
    total_harvest_weight: number;
  }> {
    const [{ count: classroomCount, status: s1 }, { count: connectionCount, status: s2 }, { count: challengeCount, status: s3 }] =
      await Promise.all([
        db.from('classroom_network_settings').select('*', { count: 'exact', head: true }).eq('is_network_enabled', true),
        db.from('classroom_connections').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
        db.from('network_challenges').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ]);

    ensureNo406(s1);
    ensureNo406(s2);
    ensureNo406(s3);

    return {
      total_classrooms: classroomCount || 0,
      total_connections: connectionCount || 0,
      active_challenges: challengeCount || 0,
      total_harvest_weight: 0
    };
    // NOTE: For real harvest totals, create a SQL view or RPC to aggregate server-side.
  }

  static async getMyNetworkActivity(classroomId: string): Promise<{
    connection_count: number;
    pending_requests: number;
    active_challenges: number;
    network_rank: number | null;
  }> {
    const [connections, pending, challenges] = await Promise.all([
      this.getMyConnections(classroomId),
      this.getPendingRequests(classroomId),
      this.getActiveChallenges(classroomId)
    ]);

    const activeChallenges = challenges.filter(c => c.is_participating);

    return {
      connection_count: connections.length,
      pending_requests: pending.incoming.length,
      active_challenges: activeChallenges.length,
      network_rank: null
    };
  }
}
