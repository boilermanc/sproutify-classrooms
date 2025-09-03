import { supabase } from '@/integrations/supabase/client';
import { 
  NetworkSettings, 
  ClassroomConnection, 
  NetworkChallenge, 
  ChallengeParticipation 
} from '@/integrations/supabase/types';

// Extended interfaces for richer data queries
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
  
  // ========================================
  // NETWORK SETTINGS MANAGEMENT
  // ========================================
  
  static async getNetworkSettings(classroomId: string): Promise<NetworkSettings | null> {
    const { data, error } = await supabase
      .from('classroom_network_settings')
      .select('*')
      .eq('classroom_id', classroomId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async upsertNetworkSettings(settings: NetworkSettings): Promise<NetworkSettings> {
    const { data, error } = await supabase
      .from('classroom_network_settings')
      .upsert(settings, { onConflict: 'classroom_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async disableNetwork(classroomId: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_network_settings')
      .update({ is_network_enabled: false })
      .eq('classroom_id', classroomId);
    
    if (error) throw error;
  }

  // ========================================
  // CLASSROOM DISCOVERY
  // ========================================
  
  static async discoverClassrooms(
    currentClassroomId: string,
    filters: ClassroomDiscoveryFilters = {}
  ): Promise<ClassroomWithProfile[]> {
    let query = supabase
      .from('classroom_network_settings')
      .select(`
        *,
        classroom:classrooms!inner (
          id,
          name,
          teacher_id,
          teacher:profiles (
            full_name,
            school_name,
            district
          )
        )
      `)
      .eq('is_network_enabled', true)
      .in('visibility_level', ['public', 'network_only'])
      .neq('classroom_id', currentClassroomId); // Exclude own classroom

    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    if (filters.grade_level) {
      query = query.eq('grade_level', filters.grade_level);
    }
    if (filters.school_type) {
      query = query.eq('school_type', filters.school_type);
    }
    if (filters.search) {
      query = query.or(`display_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;

    // If we want to exclude already connected classrooms
    if (filters.exclude_connected) {
      const connectedIds = await this.getConnectedClassroomIds(currentClassroomId);
      return data?.filter(item => 
        !connectedIds.includes(item.classroom_id)
      ).map(this.mapToClassroomWithProfile) || [];
    }

    return data?.map(this.mapToClassroomWithProfile) || [];
  }

  static async searchClassroomsByName(searchTerm: string, limit: number = 20): Promise<ClassroomWithProfile[]> {
    const { data, error } = await supabase
      .from('classroom_network_settings')
      .select(`
        *,
        classroom:classrooms!inner (
          id,
          name,
          teacher_id,
          teacher:profiles (
            full_name,
            school_name,
            district
          )
        )
      `)
      .eq('is_network_enabled', true)
      .eq('visibility_level', 'public')
      .or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) throw error;
    return data?.map(this.mapToClassroomWithProfile) || [];
  }

  // ========================================
  // CONNECTION MANAGEMENT
  // ========================================
  
  static async sendConnectionRequest(
    requesterClassroomId: string, 
    targetClassroomId: string, 
    connectionType: 'competition' | 'collaboration' | 'mentorship',
    message?: string
  ): Promise<ClassroomConnection> {
    // First check if a connection already exists
    const existing = await this.getExistingConnection(requesterClassroomId, targetClassroomId);
    if (existing) {
      throw new Error('A connection request already exists between these classrooms');
    }

    const { data, error } = await supabase
      .from('classroom_connections')
      .insert({
        requester_classroom_id: requesterClassroomId,
        target_classroom_id: targetClassroomId,
        connection_type: connectionType,
        message,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getMyConnections(classroomId: string): Promise<ConnectionWithDetails[]> {
    const { data, error } = await supabase
      .from('classroom_connections')
      .select(`
        *,
        requester_classroom:classroom_network_settings!classroom_connections_requester_classroom_id_fkey (
          classroom_id,
          display_name,
          bio,
          classroom:classrooms (name)
        ),
        target_classroom:classroom_network_settings!classroom_connections_target_classroom_id_fkey (
          classroom_id,
          display_name,
          bio,
          classroom:classrooms (name)
        )
      `)
      .or(`requester_classroom_id.eq.${classroomId},target_classroom_id.eq.${classroomId}`)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getPendingRequests(classroomId: string): Promise<{
    incoming: ConnectionWithDetails[];
    outgoing: ConnectionWithDetails[];
  }> {
    // Incoming requests (where we are the target)
    const { data: incoming, error: incomingError } = await supabase
      .from('classroom_connections')
      .select(`
        *,
        requester_classroom:classroom_network_settings!classroom_connections_requester_classroom_id_fkey (
          classroom_id,
          display_name,
          bio,
          classroom:classrooms (name)
        )
      `)
      .eq('target_classroom_id', classroomId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (incomingError) throw incomingError;

    // Outgoing requests (where we are the requester)
    const { data: outgoing, error: outgoingError } = await supabase
      .from('classroom_connections')
      .select(`
        *,
        target_classroom:classroom_network_settings!classroom_connections_target_classroom_id_fkey (
          classroom_id,
          display_name,
          bio,
          classroom:classrooms (name)
        )
      `)
      .eq('requester_classroom_id', classroomId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (outgoingError) throw outgoingError;

    return {
      incoming: incoming || [],
      outgoing: outgoing || []
    };
  }

  static async respondToConnectionRequest(
    connectionId: string, 
    status: 'accepted' | 'declined'
  ): Promise<ClassroomConnection> {
    const updateData: any = { status };
    if (status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('classroom_connections')
      .update(updateData)
      .eq('id', connectionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async removeConnection(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_connections')
      .delete()
      .eq('id', connectionId);
    
    if (error) throw error;
  }

  static async blockClassroom(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_connections')
      .update({ status: 'blocked' })
      .eq('id', connectionId);
    
    if (error) throw error;
  }

  // ========================================
  // CHALLENGE SYSTEM
  // ========================================
  
  static async getActiveChallenges(classroomId?: string): Promise<ChallengeWithParticipation[]> {
    let query = supabase
      .from('network_challenges')
      .select(`
        *,
        participation:classroom_challenge_participation(count)
      `)
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    const { data: challenges, error } = await query;
    if (error) throw error;

    if (!challenges) return [];

    // If classroomId provided, check participation status
    if (classroomId) {
      const { data: participations } = await supabase
        .from('classroom_challenge_participation')
        .select('*')
        .eq('classroom_id', classroomId);

      const participationMap = new Map(
        participations?.map(p => [p.challenge_id, p]) || []
      );

      return challenges.map(challenge => ({
        ...challenge,
        participation_count: challenge.participation?.[0]?.count || 0,
        is_participating: participationMap.has(challenge.id),
        my_participation: participationMap.get(challenge.id)
      }));
    }

    return challenges.map(challenge => ({
      ...challenge,
      participation_count: challenge.participation?.[0]?.count || 0,
      is_participating: false
    }));
  }

  static async joinChallenge(classroomId: string, challengeId: string): Promise<ChallengeParticipation> {
    const { data, error } = await supabase
      .from('classroom_challenge_participation')
      .insert({
        classroom_id: classroomId,
        challenge_id: challengeId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async leaveChallenge(classroomId: string, challengeId: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_challenge_participation')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('challenge_id', challengeId);
    
    if (error) throw error;
  }

  static async getChallengeLeaderboard(challengeId: string): Promise<any[]> {
    // This would be implemented with a more complex query or RPC function
    // For now, return basic structure
    const { data, error } = await supabase
      .from('classroom_challenge_participation')
      .select(`
        *,
        classroom:classrooms (
          name,
          network_settings:classroom_network_settings (display_name)
        )
      `)
      .eq('challenge_id', challengeId)
      .order('final_score', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return data || [];
  }

  // ========================================
  // NETWORK LEADERBOARD
  // ========================================
  
  static async getNetworkLeaderboard(
    classroomId: string,
    filters: {
      connected_only?: boolean;
      region?: string;
      grade_level?: string;
      limit?: number;
    } = {}
  ): Promise<NetworkLeaderboardEntry[]> {
    // This would ideally be implemented as a Supabase RPC function for performance
    // For now, we'll do a basic implementation
    
    let baseQuery = supabase
      .from('classroom_network_settings')
      .select(`
        classroom_id,
        display_name,
        region,
        grade_level,
        classroom:classrooms!inner (
          name,
          teacher:profiles (school_name)
        )
      `)
      .eq('is_network_enabled', true)
      .eq('share_harvest_data', true);

    if (filters.region) {
      baseQuery = baseQuery.eq('region', filters.region);
    }
    if (filters.grade_level) {
      baseQuery = baseQuery.eq('grade_level', filters.grade_level);
    }

    const { data: networkClassrooms, error } = await baseQuery.limit(filters.limit || 100);
    
    if (error) throw error;
    if (!networkClassrooms) return [];

    // Get connected classroom IDs if filtering by connections
    const connectedIds = filters.connected_only 
      ? await this.getConnectedClassroomIds(classroomId)
      : [];

    // For each classroom, we would need to aggregate their harvest data
    // This is simplified - in production this should be a database function
    const leaderboardEntries: NetworkLeaderboardEntry[] = [];
    
    for (const classroom of networkClassrooms) {
      // Skip if filtering by connections and not connected
      if (filters.connected_only && !connectedIds.includes(classroom.classroom_id)) {
        continue;
      }

      // Get harvest totals for this classroom
      const { data: harvests } = await supabase
        .from('harvests')
        .select('weight_grams, plant_quantity')
        .eq('teacher_id', (classroom.classroom as any).teacher_id);

      const totalWeight = harvests?.reduce((sum, h) => sum + h.weight_grams, 0) || 0;
      const totalPlants = harvests?.reduce((sum, h) => sum + (h.plant_quantity || 0), 0) || 0;

      // Get tower count
      const { count: towerCount } = await supabase
        .from('towers')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', (classroom.classroom as any).teacher_id);

      leaderboardEntries.push({
        classroom_id: classroom.classroom_id,
        classroom_name: (classroom.classroom as any).name,
        display_name: classroom.display_name,
        total_harvest_weight: totalWeight,
        total_harvest_plants: totalPlants,
        tower_count: towerCount || 0,
        region: classroom.region,
        grade_level: classroom.grade_level,
        school_name: (classroom.classroom as any).teacher?.school_name || null,
        is_connected: connectedIds.includes(classroom.classroom_id)
      });
    }

    // Sort by harvest weight descending
    return leaderboardEntries.sort((a, b) => b.total_harvest_weight - a.total_harvest_weight);
  }

  // ========================================
  // HELPER METHODS
  // ========================================
  
  private static async getExistingConnection(
    classroomId1: string, 
    classroomId2: string
  ): Promise<ClassroomConnection | null> {
    const { data, error } = await supabase
      .from('classroom_connections')
      .select('*')
      .or(`and(requester_classroom_id.eq.${classroomId1},target_classroom_id.eq.${classroomId2}),and(requester_classroom_id.eq.${classroomId2},target_classroom_id.eq.${classroomId1})`)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private static async getConnectedClassroomIds(classroomId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('classroom_connections')
      .select('requester_classroom_id, target_classroom_id')
      .or(`requester_classroom_id.eq.${classroomId},target_classroom_id.eq.${classroomId}`)
      .eq('status', 'accepted');
    
    if (error) throw error;
    
    return data?.map(conn => 
      conn.requester_classroom_id === classroomId 
        ? conn.target_classroom_id 
        : conn.requester_classroom_id
    ) || [];
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

  // ========================================
  // STATISTICS AND ANALYTICS
  // ========================================
  
  static async getNetworkStats(): Promise<{
    total_classrooms: number;
    total_connections: number;
    active_challenges: number;
    total_harvest_weight: number;
  }> {
    const [
      { count: classroomCount },
      { count: connectionCount },
      { count: challengeCount },
    ] = await Promise.all([
      supabase
        .from('classroom_network_settings')
        .select('*', { count: 'exact', head: true })
        .eq('is_network_enabled', true),
      supabase
        .from('classroom_connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted'),
      supabase
        .from('network_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
    ]);

    // This would need a more sophisticated query for harvest totals
    // For now, return basic stats
    return {
      total_classrooms: classroomCount || 0,
      total_connections: connectionCount || 0,
      active_challenges: challengeCount || 0,
      total_harvest_weight: 0 // Would need aggregation
    };
  }

  static async getMyNetworkActivity(classroomId: string): Promise<{
    connection_count: number;
    pending_requests: number;
    active_challenges: number;
    network_rank: number | null;
  }> {
    const [
      connections,
      pendingRequests,
      challenges
    ] = await Promise.all([
      this.getMyConnections(classroomId),
      this.getPendingRequests(classroomId),
      this.getActiveChallenges(classroomId)
    ]);

    const activeChallenges = challenges.filter(c => c.is_participating);

    return {
      connection_count: connections.length,
      pending_requests: pendingRequests.incoming.length,
      active_challenges: activeChallenges.length,
      network_rank: null // Would need leaderboard position calculation
    };
  }
}