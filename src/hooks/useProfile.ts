// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
export type UserProfile = {
  id: string;
  full_name: string | null;
  school_name: string | null;
  avatar_url: string | null;
  district: string | null;
  bio: string | null;
  phone: string | null;
  timezone: string | null;
  school_image_url: string | null;
};
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        if (!user) {
          // No user logged in
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, school_name, avatar_url, district, bio, phone, timezone, school_image_url")
          .eq("id", user.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means "no rows found", which is not an error
          throw profileError;
        }
        if (mounted) {
          setProfile(profileData || {
            id: user.id,
            full_name: null,
            school_name: null,
            avatar_url: null,
            district: null,
            bio: null,
            phone: null,
            timezone: null,
            school_image_url: null,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch profile');
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await fetchProfile();
        }
      }
    );
    // Initial fetch
    fetchProfile();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  // Helper function to get first name
  const getFirstName = () => {
    if (!profile?.full_name) return null;
    return profile.full_name.split(' ')[0];
  };
  // Helper function to get greeting
  const getGreeting = () => {
    const firstName = getFirstName();
    if (!firstName) return "Welcome";
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour < 12) {
      timeGreeting = "Good morning";
    } else if (hour < 18) {
      timeGreeting = "Good afternoon";
    } else {
      timeGreeting = "Good evening";
    }
    return ${timeGreeting}, ;
  };
  return {
    profile,
    loading,
    error,
    getFirstName,
    getGreeting,
    // Refresh function for manual updates
    refresh: () => {
      // This will trigger the effect to re-run
      setLoading(true);
    }
  };
}
