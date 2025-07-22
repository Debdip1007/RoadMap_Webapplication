import React, { useState, useEffect } from 'react';
import { MainNavigation } from '../navigation/MainNavigation';
import { WeeklyProgress } from '../roadmap/WeeklyProgress';
import { StatsCards } from './StatsCards';
import { ProgressCharts } from './ProgressCharts';
import { MyGoals } from '../goals/MyGoals';
import { GoalForm } from '../goals/GoalForm';
import { JsonImport } from '../goals/JsonImport';
import { CustomRoadmapCreator } from '../goals/CustomRoadmapCreator';
import { AccountDeletion } from '../auth/AccountDeletion';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useProgress } from '../../hooks/useProgress';
import { RoadmapType, WeeklyGoal, Task, RoadmapData } from '../../types';
import { supabase } from '../../lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardProps {
  selectedRoadmap: RoadmapType;
  onBackToSelection: () => void;
}

export function Dashboard({ selectedRoadmap, onBackToSelection }: DashboardProps) {
  const { user } = useAuth();
  const { progress, updateProgress } = useProgress(user?.id);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentRoadmapData, setCurrentRoadmapData] = useState<RoadmapData | null>(null);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [showAccountDeletion, setShowAccountDeletion] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'goals' | 'analytics' | 'settings'>('dashboard');

  useEffect(() => {
    if (user) {
      initializeRoadmapData();
    }
  }, [user, selectedRoadmap]);

  const initializeRoadmapData = async () => {
    if (!user) return;
    
    try {
      // Fetch weekly goals to reconstruct roadmap data
      await fetchWeeklyGoals();
      await fetchTasks();
    } catch (error) {
      console.error('Error initializing roadmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('roadmap_type', selectedRoadmap)
      .order('week_number');

    if (error) {
      console.error('Error fetching weekly goals:', error);
      return;
    }

    const goals = data || [];
    setWeeklyGoals(goals);

    // Reconstruct roadmap data from weekly goals
    if (goals.length > 0) {
      const firstGoal = goals[0];
      const reference = firstGoal.reference as any;
      
      const reconstructedRoadmap: RoadmapData = {
        title: reference?.title || selectedRoadmap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: reference?.description || 'Custom roadmap',
        weeks: goals.map(goal => ({
          week: goal.week_number,
          focus: goal.focus_area,
          topics: goal.topics as string[] || [],
          goals: goal.goals as string[] || [],
          deliverables: goal.deliverables as string[] || [],
          reference: goal.reference as string[] || []
        }))
      };
      
      setCurrentRoadmapData(reconstructedRoadmap);
    }
  };

  const fetchTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        weekly_goals!inner(week_number, roadmap_type)
      `)
      .eq('user_id', user.id)
      .eq('weekly_goals.roadmap_type', selectedRoadmap);

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    // Update local state
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed, completed_at: completed ? new Date().toISOString() : null }
        : task
    ));

    // Update overall progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.id === taskId ? completed : t.completed).length;
    await updateProgress(selectedRoadmap, completedTasks, totalTasks);
  };

  const handleGoalSuccess = () => {
    fetchWeeklyGoals();
    fetchTasks();
  };

  const handleEditGoal = (goal: WeeklyGoal) => {
    // TODO: Implement goal editing
    console.log('Edit goal:', goal);
  };

  const getBreadcrumbItems = () => {
    const items = [];
    
    if (activeView === 'dashboard') {
      items.push({ label: 'Dashboard', current: true });
    } else if (activeView === 'goals') {
      items.push(
        { label: 'Dashboard', onClick: () => setActiveView('dashboard') },
        { label: 'My Goals', current: true }
      );
    } else if (activeView === 'analytics') {
      items.push(
        { label: 'Dashboard', onClick: () => setActiveView('dashboard') },
        { label: 'Analytics', current: true }
      );
    } else if (activeView === 'settings') {
      items.push(
        { label: 'Dashboard', onClick: () => setActiveView('dashboard') },
        { label: 'Settings', current: true }
      );
    }
    
    return items;
  };

  const currentWeekData = currentRoadmapData?.weeks.find(week => week.week === String(currentWeek));
  const currentWeekTasks = tasks.filter(task => {
    const weekGoal = weeklyGoals.find(goal => goal.id === task.weekly_goal_id);
    return weekGoal?.week_number === String(currentWeek);
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading || !currentRoadmapData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <MainNavigation
        currentView={activeView}
        onViewChange={setActiveView}
        onCreateGoal={() => setShowGoalForm(true)}
        onImportGoals={() => setShowJsonImport(true)}
        breadcrumbItems={getBreadcrumbItems()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Selection Button */}
        {activeView === 'dashboard' && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToSelection}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Roadmap Selection
            </Button>
          </div>
        )}

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <>
            {/* Roadmap Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{currentRoadmapData.title}</h1>
              </div>
              <p className="text-gray-600 text-lg">
                Track your progress through this comprehensive learning journey
              </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
              <StatsCards tasks={tasks} weeklyGoals={weeklyGoals} />
            </div>

            {/* Overall Progress */}
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Overall Progress</h2>
                <div className="text-sm text-gray-500">
                  {completedTasks} of {totalTasks} tasks completed
                </div>
              </div>
              <ProgressBar
                value={overallProgress}
                color={overallProgress === 100 ? 'green' : overallProgress > 50 ? 'blue' : 'yellow'}
                size="lg"
                showLabel={true}
                label={`${currentRoadmapData.title} Completion`}
              />
            </Card>

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Week
              </Button>
              
              <div className="flex items-center space-x-2">
                {currentRoadmapData.weeks.map((week) => {
                  const weekNum = parseInt(week.week);
                  const isActive = weekNum === currentWeek;
                  const weekTasks = tasks.filter(task => {
                    const weekGoal = weeklyGoals.find(goal => goal.id === task.weekly_goal_id);
                    return weekGoal?.week_number === week.week;
                  });
                  const isCompleted = weekTasks.length > 0 && weekTasks.every(task => task.completed);
                  
                  return (
                    <button
                      key={week.week}
                      onClick={() => setCurrentWeek(weekNum)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : isCompleted
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {weekNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentWeek(Math.min(currentRoadmapData.weeks.length, currentWeek + 1))}
                disabled={currentWeek === currentRoadmapData.weeks.length}
                className="flex items-center"
              >
                Next Week
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Current Week Content */}
            {currentWeekData && (
              <WeeklyProgress
                weekData={currentWeekData}
                tasks={currentWeekTasks}
                onTaskToggle={handleTaskToggle}
                weekNumber={String(currentWeek)}
              />
            )}
          </>
        )}

        {/* Goals View */}
        {activeView === 'goals' && (
          <MyGoals
            onCreateGoal={() => setShowGoalForm(true)}
            onEditGoal={handleEditGoal}
          />
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Progress Analytics</h2>
            </div>
            <ProgressCharts tasks={tasks} weeklyGoals={weeklyGoals} />
          </div>
        )}

        {/* Settings View */}
        {activeView === 'settings' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
            </div>
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                  <p className="text-gray-600">Email: {user?.email}</p>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-gray-600 mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => setShowAccountDeletion(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <GoalForm
        isOpen={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        onSuccess={handleGoalSuccess}
      />

      <JsonImport
        isOpen={showJsonImport}
        onClose={() => setShowJsonImport(false)}
        onSuccess={handleGoalSuccess}
      />

      <CustomRoadmapCreator
        isOpen={showCustomCreator}
        onClose={() => setShowCustomCreator(false)}
        onSuccess={handleGoalSuccess}
      />

      <AccountDeletion
        isOpen={showAccountDeletion}
        onClose={() => setShowAccountDeletion(false)}
        userEmail={user?.email || ''}
      />
    </div>
  );
}