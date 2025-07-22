import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { WeeklyGoal, Task, UserProgress } from '../../types';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Trash2,
  BarChart3,
  Clock,
  Award,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RoadmapSummary {
  roadmapType: string;
  title: string;
  totalWeeks: number;
  completedWeeks: number;
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
  weeklyProgress: number;
  lastUpdated: string;
}

interface HomePageProps {
  onViewChange: (view: string) => void;
  onOpenRoadmap: (roadmapType: string) => void;
}

export default function HomePage({ onViewChange, onOpenRoadmap }: HomePageProps) {
  const { user } = useAuth();
  const [roadmapSummaries, setRoadmapSummaries] = useState<RoadmapSummary[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    totalRoadmaps: 0,
    averageProgress: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  const handleOpenRoadmap = (roadmapType: string) => {
    onOpenRoadmap(roadmapType);
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all weekly goals
      const { data: weeklyGoals, error: goalsError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      // Fetch all tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // Process data to create roadmap summaries
      const roadmapMap = new Map<string, RoadmapSummary>();

      weeklyGoals?.forEach((goal: WeeklyGoal) => {
        const goalTasks = tasks?.filter((task: Task) => task.weekly_goal_id === goal.id) || [];
        const completedTasks = goalTasks.filter(task => task.completed).length;
        
        if (!roadmapMap.has(goal.roadmap_type)) {
          roadmapMap.set(goal.roadmap_type, {
            roadmapType: goal.roadmap_type,
            title: getRoadmapTitle(goal.roadmap_type),
            totalWeeks: 0,
            completedWeeks: 0,
            totalTasks: 0,
            completedTasks: 0,
            overallProgress: 0,
            weeklyProgress: 0,
            lastUpdated: goal.updated_at
          });
        }

        const summary = roadmapMap.get(goal.roadmap_type)!;
        summary.totalWeeks++;
        summary.totalTasks += goalTasks.length;
        summary.completedTasks += completedTasks;
        
        if (goalTasks.length > 0 && completedTasks === goalTasks.length) {
          summary.completedWeeks++;
        }

        if (new Date(goal.updated_at) > new Date(summary.lastUpdated)) {
          summary.lastUpdated = goal.updated_at;
        }
      });

      // Calculate progress percentages
      const summaries = Array.from(roadmapMap.values()).map(summary => ({
        ...summary,
        overallProgress: summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0,
        weeklyProgress: summary.totalWeeks > 0 ? Math.round((summary.completedWeeks / summary.totalWeeks) * 100) : 0
      }));

      setRoadmapSummaries(summaries);

      // Calculate overall stats
      const totalGoals = tasks?.length || 0;
      const completedGoals = tasks?.filter((task: Task) => task.completed).length || 0;
      const averageProgress = summaries.length > 0 
        ? Math.round(summaries.reduce((acc, curr) => acc + curr.overallProgress, 0) / summaries.length)
        : 0;

      setOverallStats({
        totalGoals,
        completedGoals,
        totalRoadmaps: summaries.length,
        averageProgress,
        streak: calculateStreak(tasks || [])
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRoadmapTitle = (type: string): string => {
    const titles: Record<string, string> = {
      'qiskit': 'Qiskit Quantum Programming',
      'qutip': 'QuTiP Learning Path',
      'superconductivity': 'Superconductivity Study',
      'superconductivity_study_roadmap': 'Superconductivity Study Roadmap',
      'custom': 'Custom Roadmap',
      'custom_python': 'Python Import Roadmap',
      'json_import': 'JSON Import Roadmap'
    };
    return titles[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const calculateStreak = (tasks: Task[]): number => {
    const completedDates = tasks
      .filter(task => task.completed && task.completed_at)
      .map(task => new Date(task.completed_at!).toDateString())
      .sort();
    
    const uniqueDates = [...new Set(completedDates)];
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[uniqueDates.length - 1 - i]);
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleDeleteRoadmap = async (roadmapType: string) => {
    if (!confirm(`Are you sure you want to delete all goals from the "${getRoadmapTitle(roadmapType)}" roadmap? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete all weekly goals for this roadmap type
      const { error } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('user_id', user?.id)
        .eq('roadmap_type', roadmapType);

      if (error) throw error;

      toast.success('Roadmap deleted successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete roadmap');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Track your progress across all goals and roadmaps</p>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {overallStats.totalGoals}
          </div>
          <div className="text-sm text-gray-600">Total Goals</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {overallStats.completedGoals}
          </div>
          <div className="text-sm text-gray-600">Completed Goals</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {overallStats.averageProgress}%
          </div>
          <div className="text-sm text-gray-600">Average Progress</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {overallStats.streak}
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </Card>
      </div>

      {/* Roadmaps Overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Roadmaps</h2>
          <div className="text-sm text-gray-500">
            {roadmapSummaries.length} active roadmap{roadmapSummaries.length !== 1 ? 's' : ''}
          </div>
        </div>

        {roadmapSummaries.length === 0 ? (
          <Card className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Roadmaps Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your learning journey by creating a new roadmap or importing an existing one.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roadmapSummaries.map((roadmap) => (
              <Card 
                key={roadmap.roadmapType} 
                className="relative hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {roadmap.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {roadmap.totalWeeks} weeks
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {roadmap.totalTasks} tasks
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(roadmap.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoadmap(roadmap.roadmapType);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <div>
                    <ProgressBar
                      value={roadmap.overallProgress}
                      color={roadmap.overallProgress === 100 ? 'green' : roadmap.overallProgress > 50 ? 'blue' : 'yellow'}
                      size="md"
                      showLabel={true}
                      label="Overall Progress"
                      showPercentage={true}
                    />
                  </div>
                  
                  <div>
                    <ProgressBar
                      value={roadmap.weeklyProgress}
                      color={roadmap.weeklyProgress === 100 ? 'green' : roadmap.weeklyProgress > 50 ? 'purple' : 'orange'}
                      size="md"
                      showLabel={true}
                      label="Weekly Completion"
                      showPercentage={true}
                    />
                  </div>
                </div>

                {/* Statistics */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {roadmap.completedTasks}/{roadmap.totalTasks}
                      </div>
                      <div className="text-xs text-gray-600">Tasks Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {roadmap.completedWeeks}/{roadmap.totalWeeks}
                      </div>
                      <div className="text-xs text-gray-600">Weeks Completed</div>
                    </div>
                  </div>
                </div>

                {/* Click to Open Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleOpenRoadmap(roadmap.roadmapType)}
                    className="w-full"
                    variant="primary"
                  >
                    Open Roadmap
                  </Button>
                </div>

                {/* Achievement Badge */}
                {roadmap.overallProgress === 100 && (
                  <div className="absolute top-4 right-12">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      Complete
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}