import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StudentTowerOverviewProps {
  towerId: string;
}

interface OverviewData {
  activePlants: number;
  recentPh: number | null;
  recentEc: number | null;
  pestIssues: number;
  nextHarvest: string | null;
  lastVitalsDate: string | null;
  totalHarvests: number;
}

export function StudentTowerOverview({ towerId }: StudentTowerOverviewProps) {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Get classroom ID from localStorage to find teacher
        const classroomId = localStorage.getItem('student_classroom_id');
        if (!classroomId) return;

        // Get teacher ID from classroom
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('teacher_id')
          .eq('id', classroomId)
          .single();

        if (!classroom?.teacher_id) return;

        const teacherId = classroom.teacher_id;

        // Fetch active plantings
        const { data: plantings } = await supabase
          .from('plantings')
          .select('id, planted_at, harvest_date')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .is('harvest_date', null);

        // Fetch recent vitals (pH and EC)
        const { data: vitals } = await supabase
          .from('tower_vitals')
          .select('ph, ec, created_at')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false })
          .limit(1);

        // Fetch pest issues from scouting
        const { data: pestData } = await supabase
          .from('scouting')
          .select('id')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        // Fetch next harvest
        const { data: nextHarvestData } = await supabase
          .from('plantings')
          .select('harvest_date')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId)
          .not('harvest_date', 'is', null)
          .gte('harvest_date', new Date().toISOString())
          .order('harvest_date', { ascending: true })
          .limit(1);

        // Fetch total harvests
        const { data: harvests } = await supabase
          .from('harvests')
          .select('id')
          .eq('tower_id', towerId)
          .eq('teacher_id', teacherId);

        const activePlants = plantings?.length || 0;
        const recentPh = vitals?.[0]?.ph || null;
        const recentEc = vitals?.[0]?.ec || null;
        const pestIssues = pestData?.length || 0;
        const nextHarvest = nextHarvestData?.[0]?.harvest_date || null;
        const lastVitalsDate = vitals?.[0]?.created_at || null;
        const totalHarvests = harvests?.length || 0;

        setOverviewData({
          activePlants,
          recentPh,
          recentEc,
          pestIssues,
          nextHarvest,
          lastVitalsDate,
          totalHarvests
        });
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [towerId]);

  if (loading) {
    return (
      <div className="prose max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          <em className="text-xs text-muted-foreground">[Loading tower data...]</em>
        </p>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="prose max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          <em className="text-xs text-muted-foreground">[Unable to load tower data]</em>
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPhStatus = (ph: number | null) => {
    if (ph === null) return 'unknown';
    if (ph >= 5.5 && ph <= 6.5) return 'optimal';
    if (ph < 5.5) return 'low';
    return 'high';
  };

  const getEcStatus = (ec: number | null) => {
    if (ec === null) return 'unknown';
    if (ec >= 1.0 && ec <= 2.5) return 'good';
    if (ec < 1.0) return 'low';
    return 'high';
  };

  const phStatus = getPhStatus(overviewData.recentPh);
  const ecStatus = getEcStatus(overviewData.recentEc);

  // Generate the summary text based on actual data
  const generateSummaryText = () => {
    const parts = [];
    
    // Plant status
    if (overviewData.activePlants > 0) {
      parts.push(`Your tower is currently growing <strong>${overviewData.activePlants} active plant${overviewData.activePlants !== 1 ? 's' : ''}</strong> with <strong>healthy growth patterns</strong>.`);
    } else {
      parts.push(`Your tower currently has <strong>no active plants</strong>.`);
    }

    // pH and EC status
    if (overviewData.recentPh && overviewData.recentEc) {
      const phText = phStatus === 'optimal' ? 'optimal levels' : `${phStatus} levels`;
      const ecText = ecStatus === 'good' ? 'good nutrient balance' : `${ecStatus} nutrient balance`;
      parts.push(`Recent pH readings show <strong>${phText}</strong> at ${overviewData.recentPh.toFixed(1)}, and EC measurements indicate <strong>${ecText}</strong>.`);
    } else if (overviewData.recentPh) {
      const phText = phStatus === 'optimal' ? 'optimal levels' : `${phStatus} levels`;
      parts.push(`Recent pH readings show <strong>${phText}</strong> at ${overviewData.recentPh.toFixed(1)}.`);
    } else if (overviewData.recentEc) {
      const ecText = ecStatus === 'good' ? 'good nutrient balance' : `${ecStatus} nutrient balance`;
      parts.push(`Recent EC measurements indicate <strong>${ecText}</strong> at ${overviewData.recentEc.toFixed(1)}.`);
    } else {
      parts.push(`No recent pH or EC readings are available.`);
    }

    // Pest status
    if (overviewData.pestIssues === 0) {
      parts.push(`No pest issues have been detected in the last week.`);
    } else {
      parts.push(`<strong>${overviewData.pestIssues} pest issue${overviewData.pestIssues !== 1 ? 's' : ''}</strong> have been detected in the last week.`);
    }

    // Harvest schedule
    if (overviewData.nextHarvest) {
      parts.push(`Your next harvest is scheduled for <strong>${formatDate(overviewData.nextHarvest)}</strong>.`);
    } else {
      parts.push(`No upcoming harvests are scheduled.`);
    }

    return parts.join(' ');
  };

  return (
    <div className="prose max-w-none">
      <p className="text-muted-foreground leading-relaxed">
        <em className="text-xs text-muted-foreground">[AI-generated summary will appear here]</em><br/><br/>
        <span dangerouslySetInnerHTML={{ __html: generateSummaryText() }} />
      </p>
    </div>
  );
}
