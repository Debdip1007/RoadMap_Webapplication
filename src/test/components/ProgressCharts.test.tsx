import { render, screen } from '@testing-library/react';
import { ProgressCharts } from '../../components/dashboard/ProgressCharts';
import { Task, WeeklyGoal } from '../../types';

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: ({ data, options }: any) => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Line: ({ data, options }: any) => <div data-testid="line-chart">Line Chart</div>
}));

describe('ProgressCharts', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      user_id: 'user1',
      weekly_goal_id: 'goal1',
      title: 'Task 1',
      completed: true,
      completed_at: '2023-01-01',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    },
    {
      id: '2',
      user_id: 'user1',
      weekly_goal_id: 'goal1',
      title: 'Task 2',
      completed: false,
      completed_at: null,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }
  ];

  const mockWeeklyGoals: WeeklyGoal[] = [
    {
      id: 'goal1',
      user_id: 'user1',
      roadmap_type: 'qiskit',
      week_number: '1',
      focus_area: 'Setup',
      topics: ['Installation'],
      goals: ['Install Qiskit'],
      deliverables: ['Task 1', 'Task 2'],
      reference: [],
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }
  ];

  it('renders all chart components', () => {
    render(
      <ProgressCharts
        tasks={mockTasks}
        weeklyGoals={mockWeeklyGoals}
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <ProgressCharts
        tasks={[]}
        weeklyGoals={[]}
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});