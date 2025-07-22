import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Task, WeeklyGoal } from '../../types';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  Award
} from 'lucide-react';

interface StatsCardsProps {
  tasks: Task[];
  weeklyGoals: WeeklyGoal[];
}

export function StatsCards({ tasks, weeklyGoals }: StatsCardsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate streak (consecutive days with completed tasks)
  const getCompletionStreak = () => {
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

  const streak = getCompletionStreak();

  // Calculate average weekly progress
  const weeklyProgress = weeklyGoals.map(goal => {
    const weekTasks = tasks.filter(task => task.weekly_goal_id === goal.id);
    const weekCompleted = weekTasks.filter(task => task.completed).length;
    const weekTotal = weekTasks.length;
    return weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;
  });

  const averageWeeklyProgress = weeklyProgress.length > 0 
    ? Math.round(weeklyProgress.reduce((acc, curr) => acc + curr, 0) / weeklyProgress.length)
    : 0;

  const stats = [
    {
      title: 'Total Goals',
      value: totalTasks,
      icon: <Target className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: null
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${completionRate}% completion rate`
    },
    {
      title: 'In Progress',
      value: pendingTasks,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: null
    },
    {
      title: 'Weekly Average',
      value: `${averageWeeklyProgress}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: 'across all weeks'
    },
    {
      title: 'Active Weeks',
      value: weeklyGoals.length,
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: null
    },
    {
      title: 'Current Streak',
      value: `${streak} days`,
      icon: <Award className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: streak > 0 ? 'Keep it up!' : 'Start your streak today'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
              {stat.change && (
                <p className="text-sm text-gray-500 mt-1">
                  {stat.change}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </div>
          </div>
          
          {/* Achievement badges */}
          {stat.title === 'Completed' && completionRate === 100 && (
            <div className="absolute top-2 right-2">
              <Badge variant="success" size="sm">Perfect!</Badge>
            </div>
          )}
          
          {stat.title === 'Current Streak' && streak >= 7 && (
            <div className="absolute top-2 right-2">
              <Badge variant="warning" size="sm">🔥 Hot Streak!</Badge>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}