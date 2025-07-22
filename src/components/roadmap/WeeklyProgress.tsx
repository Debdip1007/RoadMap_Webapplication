import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { WeekData, Task } from '../../types';
import { CheckCircle2, Circle, ExternalLink, Book, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WeeklyProgressProps {
  weekData: WeekData;
  tasks: Task[];
  onTaskToggle: (taskId: string, completed: boolean) => void;
  weekNumber: string;
}

export function WeeklyProgress({ weekData, tasks, onTaskToggle, weekNumber }: WeeklyProgressProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    topics: true,
    goals: true,
    deliverables: true,
    references: false
  });
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Week Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Week {weekNumber}: {weekData.focus}
              </h2>
              <p className="text-gray-600">
                Track your progress through this week's learning objectives
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {completedTasks}/{totalTasks}
              </div>
              <div className="text-sm text-gray-500">
                tasks completed
              </div>
            </div>
          </div>
          
          <ProgressBar
            value={progress}
            color={progress === 100 ? 'green' : progress > 50 ? 'blue' : 'yellow'}
            size="lg"
            showLabel={true}
            label="Week Progress"
            animated={true}
          />
        </div>
      </Card>

      {/* Topics Section */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('topics')}
        >
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Book className="h-6 w-6 mr-3 text-blue-600" />
            Topics Covered
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {weekData.topics.length}
            </span>
          </h3>
          {expandedSections.topics ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.topics && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weekData.topics.map((topic, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-800 font-medium">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Goals Section */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('goals')}
        >
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="h-6 w-6 mr-3 text-green-600" />
            Learning Goals
            <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {weekData.goals.length}
            </span>
          </h3>
          {expandedSections.goals ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.goals && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {weekData.goals.map((goal, index) => (
                <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-800 font-medium">{goal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Deliverables Section */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('deliverables')}
        >
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckCircle2 className="h-6 w-6 mr-3 text-purple-600" />
            Deliverables & Tasks
            <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {completedTasks}/{totalTasks}
            </span>
          </h3>
          {expandedSections.deliverables ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.deliverables && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 italic">No deliverables defined for this week.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
                      task.completed 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                    )}
                    onClick={() => onTaskToggle(task.id, !task.completed)}
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
                        <p className={cn(
                          'text-base font-medium',
                          task.completed 
                            ? 'text-green-900 line-through' 
                            : 'text-gray-900'
                        )}>
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
            
            {/* Progress Summary */}
            {tasks.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Task Progress</span>
                  <span className="text-sm text-gray-500">{completedTasks} of {totalTasks} completed</span>
                </div>
                <ProgressBar
                  value={completedTasks}
                  max={totalTasks}
                  color="purple"
                  size="sm"
                  showLabel={false}
                  animated={true}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* References Section */}
      {weekData.reference && weekData.reference.length > 0 && (
        <Card>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('references')}
          >
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <ExternalLink className="h-6 w-6 mr-3 text-gray-600" />
              References & Resources
              <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {weekData.reference.length}
              </span>
            </h3>
            {expandedSections.references ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.references && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weekData.reference.map((ref, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <ExternalLink className="h-5 w-5 mt-1 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          {ref.type}: {ref.title || ref.section || ref.book}
                        </p>
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
            </div>
          )}
        </Card>
      )}
    </div>
  );
}