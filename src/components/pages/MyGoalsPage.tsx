import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { WeeklyGoal, Task } from '../../types';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Book, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  Clock,
  BarChart3,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MyGoalsPageProps {
  selectedRoadmapType?: string;
  onCreateGoal?: () => void;
  onEditGoal?: (goal: WeeklyGoal) => void;
}

interface WeeklyGoalWithTasks extends WeeklyGoal {
  tasks: Task[];
  completedTasks: number;
  weekProgress: number;
}

interface RoadmapProgress {
  roadmapType: string;
  title: string;
  weeks: WeeklyGoalWithTasks[];
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
  activeWeeks: number;
  currentStreak: number;
}

export function MyGoalsPage({ selectedRoadmapType, onCreateGoal, onEditGoal }: MyGoalsPageProps) {
  const { user } = useAuth();
  const [availableRoadmaps, setAvailableRoadmaps] = useState<Array<{value: string, label: string}>>([]);
  const [currentRoadmapType, setCurrentRoadmapType] = useState(selectedRoadmapType || '');
  const [roadmapData, setRoadmapData] = useState<RoadmapProgress | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    topics: true,
    goals: true,
    deliverables: true,
    references: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAvailableRoadmaps();
    }
  }, [user]);

  useEffect(() => {
    if (user && currentRoadmapType) {
      fetchRoadmapData(currentRoadmapType);
    }
  }, [user, currentRoadmapType]);

  // Update current roadmap when selectedRoadmapType prop changes
  useEffect(() => {
    if (selectedRoadmapType && selectedRoadmapType !== currentRoadmapType) {
      setCurrentRoadmapType(selectedRoadmapType);
    }
  }, [selectedRoadmapType]);

  const fetchAvailableRoadmaps = async () => {
    if (!user) return;

    try {
      const { data: roadmaps, error } = await supabase
        .from('weekly_goals')
        .select('roadmap_type')
        .eq('user_id', user.id);

      if (error) throw error;

      const uniqueRoadmaps = [...new Set(roadmaps?.map(r => r.roadmap_type) || [])];
      const roadmapOptions = uniqueRoadmaps.map(type => ({
        value: type,
        label: getRoadmapTitle(type)
      }));

      setAvailableRoadmaps(roadmapOptions);

      // Set current roadmap if not already set
      if (!currentRoadmapType && roadmapOptions.length > 0) {
        const defaultRoadmap = selectedRoadmapType || roadmapOptions[0].value;
        setCurrentRoadmapType(defaultRoadmap);
      }
    } catch (error) {
      console.error('Error fetching available roadmaps:', error);
    }
  };

  const fetchRoadmapData = async (roadmapType: string) => {
    if (!user || !roadmapType) return;

    setLoading(true);

    try {
      // Fetch weekly goals for the selected roadmap
      const { data: weeklyGoals, error: goalsError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('roadmap_type', roadmapType)
        .order('week_number');

      if (goalsError) throw goalsError;

      // Fetch all tasks for this roadmap
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // Process data
      const weeksWithTasks: WeeklyGoalWithTasks[] = (weeklyGoals || []).map((goal: WeeklyGoal) => {
        const goalTasks = (tasks || []).filter((task: Task) => task.weekly_goal_id === goal.id);
        const completedTasks = goalTasks.filter(task => task.completed).length;
        const weekProgress = goalTasks.length > 0 ? Math.round((completedTasks / goalTasks.length) * 100) : 0;

        return {
          ...goal,
          tasks: goalTasks,
          completedTasks,
          weekProgress
        };
      });

      const totalTasks = weeksWithTasks.reduce((acc, week) => acc + week.tasks.length, 0);
      const completedTasks = weeksWithTasks.reduce((acc, week) => acc + week.completedTasks, 0);
      const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const activeWeeks = weeksWithTasks.filter(week => week.weekProgress > 0).length;

      setRoadmapData({
        roadmapType: roadmapType,
        title: getRoadmapTitle(roadmapType),
        weeks: weeksWithTasks,
        overallProgress,
        totalTasks,
        completedTasks,
        activeWeeks,
        currentStreak: calculateStreak(tasks || [])
      });

    } catch (error) {
      console.error('Error fetching roadmap data:', error);
      toast.error('Failed to load roadmap data');
    } finally {
      setLoading(false);
    }
  };

  const getRoadmapTitle = (type: string): string => {
    const titles: Record<string, string> = {
      'qiskit': 'Qiskit Quantum Programming',
      'qutip': 'QuTiP Learning Path',
      'superconductivity': 'Superconductivity Study',
      'superconducting_qubit_evolution_roadmap': 'Superconducting Qubit Evolution Roadmap',
      'custom': 'Custom Roadmap',
      'custom_python': 'Python Import Roadmap'
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

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setRoadmapData(prev => {
        if (!prev) return prev;
        
        const updatedWeeks = prev.weeks.map(week => {
          const updatedTasks = week.tasks.map(task => 
            task.id === taskId 
              ? { ...task, completed, completed_at: completed ? new Date().toISOString() : null }
              : task
          );
          const updatedCompletedTasks = updatedTasks.filter(t => t.completed).length;
          const updatedWeekProgress = updatedTasks.length > 0 
            ? Math.round((updatedCompletedTasks / updatedTasks.length) * 100)
            : 0;

          return {
            ...week,
            tasks: updatedTasks,
            completedTasks: updatedCompletedTasks,
            weekProgress: updatedWeekProgress
          };
        });

        const newTotalCompleted = updatedWeeks.reduce((acc, week) => acc + week.completedTasks, 0);
        const newOverallProgress = prev.totalTasks > 0 ? Math.round((newTotalCompleted / prev.totalTasks) * 100) : 0;

        return {
          ...prev,
          weeks: updatedWeeks,
          completedTasks: newTotalCompleted,
          overallProgress: newOverallProgress
        };
      });

      toast.success(completed ? 'Task completed!' : 'Task marked as incomplete');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRoadmapChange = (newRoadmapType: string) => {
    setCurrentRoadmapType(newRoadmapType);
    setCurrentWeek(1); // Reset to first week
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (availableRoadmaps.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Goals</h1>
          <p className="text-gray-600">No roadmaps found. Create a roadmap to get started.</p>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Goals</h1>
          <p className="text-gray-600 mb-6">Select a roadmap to view your goals</p>
          <div className="max-w-md mx-auto">
            <Select
              label="Choose Roadmap"
              options={availableRoadmaps}
              value={currentRoadmapType}
              onChange={handleRoadmapChange}
              placeholder="Select a roadmap"
            />
          </div>
        </div>
      </div>
    );
  }

  const currentWeekData = roadmapData.weeks.find(week => parseInt(week.week_number) === currentWeek);

  return (
    <div className="space-y-8">
      {/* Header with Roadmap Selection */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{roadmapData.title}</h1>
          {availableRoadmaps.length > 1 && (
            <div className="min-w-64">
              <Select
                options={availableRoadmaps}
                value={currentRoadmapType}
                onChange={handleRoadmapChange}
                placeholder="Switch roadmap"
              />
            </div>
          )}
        </div>
        <p className="text-gray-600">Track your progress through this comprehensive learning journey</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center p-6">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {roadmapData.totalTasks}
          </div>
          <div className="text-sm text-gray-600">Total Goals</div>
        </Card>

        <Card className="text-center p-6">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {roadmapData.completedTasks}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>

        <Card className="text-center p-6">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {roadmapData.overallProgress}%
          </div>
          <div className="text-sm text-gray-600">Progress</div>
        </Card>

        <Card className="text-center p-6">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {roadmapData.activeWeeks}
          </div>
          <div className="text-sm text-gray-600">Active Weeks</div>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
          <div className="text-sm text-gray-500">
            {roadmapData.completedTasks} of {roadmapData.totalTasks} tasks completed
          </div>
        </div>
        <ProgressBar
          value={roadmapData.overallProgress}
          color={roadmapData.overallProgress === 100 ? 'green' : roadmapData.overallProgress > 50 ? 'blue' : 'yellow'}
          size="lg"
          showLabel={true}
          label={`${roadmapData.title} Roadmap Completion`}
        />
      </Card>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
          disabled={currentWeek === 1}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous Week
        </Button>
        
        <div className="flex items-center space-x-2">
          {roadmapData.weeks.map((week) => {
            const weekNum = parseInt(week.week_number);
            const isActive = weekNum === currentWeek;
            const isCompleted = week.weekProgress === 100;
            
            return (
              <button
                key={week.week_number}
                onClick={() => setCurrentWeek(weekNum)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : isCompleted
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : week.weekProgress > 0
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
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
          onClick={() => setCurrentWeek(Math.min(roadmapData.weeks.length, currentWeek + 1))}
          disabled={currentWeek === roadmapData.weeks.length}
          className="flex items-center"
        >
          Next Week
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Current Week Content */}
      {currentWeekData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Week {currentWeek}: {currentWeekData.focus_area}
              </h2>
              <p className="text-gray-600">Track your progress through this week's learning objectives</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {currentWeekData.completedTasks}/{currentWeekData.tasks.length}
              </div>
              <div className="text-sm text-gray-500">tasks completed</div>
            </div>
          </div>

          <div className="mb-6">
            <ProgressBar
              value={currentWeekData.weekProgress}
              color={currentWeekData.weekProgress === 100 ? 'green' : currentWeekData.weekProgress > 50 ? 'blue' : 'yellow'}
              size="md"
              showLabel={true}
              label="Week Progress"
            />
          </div>

          {/* Topics Covered */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection('topics')}
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Book className="h-5 w-5 mr-2 text-blue-600" />
                Topics Covered
                <Badge variant="info" size="sm" className="ml-2">
                  {currentWeekData.topics.length}
                </Badge>
              </h3>
              {expandedSections.topics ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.topics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentWeekData.topics.map((topic, index) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-800 text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning Goals */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection('goals')}
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Learning Goals
                <Badge variant="success" size="sm" className="ml-2">
                  {currentWeekData.goals.length}
                </Badge>
              </h3>
              {expandedSections.goals ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.goals && (
              <div className="space-y-3">
                {currentWeekData.goals.map((goal, index) => (
                  <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-800 font-medium">{goal}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deliverables & Tasks */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection('deliverables')}
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-purple-600" />
                Deliverables & Tasks
                <Badge variant="warning" size="sm" className="ml-2">
                  {currentWeekData.completedTasks}/{currentWeekData.tasks.length}
                </Badge>
              </h3>
              {expandedSections.deliverables ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.deliverables && (
              <div className="space-y-3">
                {currentWeekData.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      task.completed 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                    }`}
                    onClick={() => handleTaskToggle(task.id, !task.completed)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-base font-medium ${
                          task.completed 
                            ? 'text-green-900 line-through' 
                            : 'text-gray-900'
                        }`}>
                          {task.title}
                        </p>
                        <span className="text-sm text-gray-500 ml-4">
                          Task {index + 1}
                        </span>
                      </div>
                      {task.completed && task.completed_at && (
                        <p className="text-sm text-green-600 mt-1 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Completed on {new Date(task.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* References & Resources */}
          {currentWeekData.reference && currentWeekData.reference.length > 0 && (
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleSection('references')}
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-gray-600" />
                  References & Resources
                  <Badge variant="info" size="sm" className="ml-2">
                    {currentWeekData.reference.length}
                  </Badge>
                </h3>
                {expandedSections.references ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              {expandedSections.references && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentWeekData.reference.map((ref: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <ExternalLink className="h-5 w-5 mt-1 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            {ref.type}: {ref.title || ref.section || ref.book || 'Reference'}
                          </p>
                          {ref.description && (
                            <p className="text-sm text-gray-600 mb-2">{ref.description}</p>
                          )}
                          {ref.chapters && Array.isArray(ref.chapters) && (
                            <p className="text-sm text-gray-600 mb-2">
                              Chapters: {ref.chapters.join(', ')}
                            </p>
                          )}
                          {ref.url && (
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Open resource
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}