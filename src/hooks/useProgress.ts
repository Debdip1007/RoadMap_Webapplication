import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProgress } from '../types';

export function useProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        setProgress(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  const updateProgress = async (roadmapType: string, completedTasks: number, totalTasks: number) => {
    if (!userId) return;

    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          roadmap_type: roadmapType,
          completed_tasks: completedTasks,
          total_tasks: totalTasks,
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,roadmap_type'
        })
        .select()
        .single();

      if (error) throw error;

      setProgress(prev => {
        const existing = prev.find(p => p.roadmap_type === roadmapType);
        if (existing) {
          return prev.map(p => p.roadmap_type === roadmapType ? data : p);
        }
        return [...prev, data];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    }
  };

  return { progress, loading, error, updateProgress };
}