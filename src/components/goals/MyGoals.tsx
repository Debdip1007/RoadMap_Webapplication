import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { SearchBar } from '../navigation/SearchBar';
import { Select } from '../ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { WeeklyGoal, Task } from '../../types';
import { 
  Filter, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Clock,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface MyGoalsProps {
  onCreateGoal: () => void;
  onEditGoal: (goal: WeeklyGoal) => void;
}

export function MyGoals({ onCreateGoal, onEditGoal }: MyGoalsProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    if (user) {
      fetchGoalsAndTasks();
    }
  }, [user]);

  const fetchGoalsAndTasks = async () => {
    if (!user) return;

    try {
      // Fetch all goals for the user
      const { data: goalsData, error: goalsError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch all tasks for the user
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      setGoals(goalsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching goals and tasks:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const getGoalProgress = (goal: WeeklyGoal) => {
    const goalTasks = tasks.filter(task => task.weekly_goal_id === goal.id);
    const completedTasks = goalTasks.filter(task => task.completed).length;
    const totalTasks = goalTasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getGoalStatus = (goal: WeeklyGoal) => {
    const progress = getGoalProgress(goal);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  // Filter and sort goals
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.focus_area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         goal.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || goal.roadmap_type === filterCategory;
    
    const status = getGoalStatus(goal);
    const matchesStatus = filterStatus === 'all' || status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return getGoalProgress(b) - getGoalProgress(a);
      case 'alphabetical':
        return a.focus_area.localeCompare(b.focus_area);
      case 'created_at':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'qiskit', label: 'Qiskit' },
    { value: 'qutip', label: 'QuTiP' },
    { value: 'superconductivity', label: 'Superconductivity' },
    { value: 'custom', label: 'Custom' },
    { value: 'custom_python', label: 'Python Import' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Recently Created' },
    { value: 'progress', label: 'Progress' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your learning goals in one place
          </p>
        </div>
        <Button onClick={onCreateGoal} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create New Goal
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search goals by title or topics..."
            />
          </div>
          <Select
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
            placeholder="Filter by category"
          />
          <div className="flex space-x-2">
            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Filter by status"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
            />
          </div>
        </div>
      </Card>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Card className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {goals.length === 0 
              ? 'Create your first goal to start tracking your progress'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {goals.length === 0 && (
            <Button onClick={onCreateGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const progress = getGoalProgress(goal);
            const status = getGoalStatus(goal);
            const goalTasks = tasks.filter(task => task.weekly_goal_id === goal.id);

            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {goal.focus_area}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant={goal.roadmap_type === 'custom' ? 'primary' : 'secondary'}
                        size="sm"
                      >
                        {goal.roadmap_type}
                      </Badge>
                      <Badge 
                        variant={
                          status === 'completed' ? 'success' : 
                          status === 'in-progress' ? 'warning' : 'default'
                        }
                        size="sm"
                      >
                        {status === 'completed' ? 'Completed' : 
                         status === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditGoal(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <ProgressBar
                    value={progress}
                    color={progress === 100 ? 'green' : progress > 50 ? 'blue' : 'yellow'}
                    showLabel={true}
                    label="Progress"
                  />
                </div>

                {/* Topics */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Topics:</h4>
                  <div className="flex flex-wrap gap-1">
                    {goal.topics.slice(0, 3).map((topic, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                    {goal.topics.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{goal.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {goalTasks.filter(t => t.completed).length}/{goalTasks.length} tasks
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Week {goal.week_number}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}