import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card } from '../ui/Card';
import { Task, WeeklyGoal } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ProgressChartsProps {
  tasks: Task[];
  weeklyGoals: WeeklyGoal[];
}

export function ProgressCharts({ tasks, weeklyGoals }: ProgressChartsProps) {
  // Weekly progress data
  const weeklyProgressData = weeklyGoals.map(goal => {
    const weekTasks = tasks.filter(task => task.weekly_goal_id === goal.id);
    const completedTasks = weekTasks.filter(task => task.completed).length;
    const totalTasks = weekTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      week: `Week ${goal.week_number}`,
      progress: Math.round(progress),
      completed: completedTasks,
      total: totalTasks
    };
  });

  // Overall completion stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const barChartData = {
    labels: weeklyProgressData.map(data => data.week),
    datasets: [
      {
        label: 'Progress %',
        data: weeklyProgressData.map(data => data.progress),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Progress Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedTasks, pendingTasks],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Overall Task Completion',
      },
    },
  };

  // Progress over time (simulated data)
  const progressOverTime = weeklyProgressData.map((data, index) => ({
    week: data.week,
    cumulative: weeklyProgressData.slice(0, index + 1).reduce((acc, curr) => acc + curr.completed, 0)
  }));

  const lineChartData = {
    labels: progressOverTime.map(data => data.week),
    datasets: [
      {
        label: 'Cumulative Tasks Completed',
        data: progressOverTime.map(data => data.cumulative),
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Progress Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <Bar data={barChartData} options={barChartOptions} />
      </Card>
      
      <Card>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </Card>
      
      <Card className="lg:col-span-2">
        <Line data={lineChartData} options={lineChartOptions} />
      </Card>
    </div>
  );
}