import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Plus, X, Save, BookOpen, Target, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeekFormData {
  week_number: string;
  focus_area: string;
  topics: string[];
  goals: string[];
  deliverables: string[];
}

interface RoadmapFormData {
  title: string;
  description: string;
  weeks: WeekFormData[];
}

interface CustomRoadmapCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomRoadmapCreator({ isOpen, onClose, onSuccess }: CustomRoadmapCreatorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { register, control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<RoadmapFormData>({
    defaultValues: {
      title: '',
      description: '',
      weeks: [
        {
          week_number: '1',
          focus_area: '',
          topics: [''],
          goals: [''],
          deliverables: ['']
        }
      ]
    }
  });

  const { fields: weekFields, append: appendWeek, remove: removeWeek } = useFieldArray({
    control,
    name: 'weeks'
  });

  const addWeek = () => {
    const nextWeekNumber = String(weekFields.length + 1);
    appendWeek({
      week_number: nextWeekNumber,
      focus_area: '',
      topics: [''],
      goals: [''],
      deliverables: ['']
    });
  };

  const addArrayItem = (weekIndex: number, fieldName: 'topics' | 'goals' | 'deliverables') => {
    const currentWeeks = watch('weeks');
    const updatedWeeks = [...currentWeeks];
    updatedWeeks[weekIndex][fieldName].push('');
    setValue('weeks', updatedWeeks);
  };

  const removeArrayItem = (weekIndex: number, fieldName: 'topics' | 'goals' | 'deliverables', itemIndex: number) => {
    const currentWeeks = watch('weeks');
    const updatedWeeks = [...currentWeeks];
    if (updatedWeeks[weekIndex][fieldName].length > 1) {
      updatedWeeks[weekIndex][fieldName].splice(itemIndex, 1);
      setValue('weeks', updatedWeeks);
    }
  };

  const updateArrayItem = (weekIndex: number, fieldName: 'topics' | 'goals' | 'deliverables', itemIndex: number, value: string) => {
    const currentWeeks = watch('weeks');
    const updatedWeeks = [...currentWeeks];
    updatedWeeks[weekIndex][fieldName][itemIndex] = value;
    setValue('weeks', updatedWeeks);
  };

  const onSubmit = async (data: RoadmapFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a roadmap');
      return;
    }

    setLoading(true);
    try {
      let createdGoalsCount = 0;
      let createdTasksCount = 0;

      // Create weekly goals for each week
      for (const week of data.weeks) {
        // Filter out empty strings from arrays
        const cleanTopics = week.topics.filter(topic => topic.trim());
        const cleanGoals = week.goals.filter(goal => goal.trim());
        const cleanDeliverables = week.deliverables.filter(deliverable => deliverable.trim());

        // Validate that required fields are not empty
        if (!week.focus_area.trim()) {
          throw new Error(`Week ${week.week_number} must have a focus area`);
        }

        if (cleanTopics.length === 0) {
          throw new Error(`Week ${week.week_number} must have at least one topic`);
        }

        if (cleanGoals.length === 0) {
          throw new Error(`Week ${week.week_number} must have at least one goal`);
        }

        if (cleanDeliverables.length === 0) {
          throw new Error(`Week ${week.week_number} must have at least one deliverable`);
        }

        // Create weekly goal
        const { data: weeklyGoal, error: goalError } = await supabase
          .from('weekly_goals')
          .insert({
            user_id: user.id,
            roadmap_type: 'custom',
            week_number: week.week_number,
            focus_area: week.focus_area.trim(),
            topics: cleanTopics,
            goals: cleanGoals,
            deliverables: cleanDeliverables,
            reference: [{
              type: 'Custom Roadmap',
              title: data.title,
              description: data.description
            }]
          })
          .select()
          .single();

        if (goalError) {
          console.error('Error creating weekly goal:', goalError);
          throw new Error(`Failed to create week ${week.week_number}: ${goalError.message}`);
        }

        createdGoalsCount++;

        // Create tasks for each deliverable
        for (const deliverable of cleanDeliverables) {
          const { error: taskError } = await supabase
            .from('tasks')
            .insert({
              user_id: user.id,
              weekly_goal_id: weeklyGoal.id,
              title: deliverable,
              completed: false
            });

          if (taskError) {
            console.error('Error creating task:', taskError);
            // Don't throw error for tasks, just log it
          } else {
            createdTasksCount++;
          }
        }
      }

      toast.success(`Custom roadmap "${data.title}" created successfully! ${createdGoalsCount} weeks and ${createdTasksCount} tasks created.`);
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating custom roadmap:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create custom roadmap');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate basic info before proceeding
    const title = watch('title');
    const description = watch('description');
    
    if (!title.trim()) {
      toast.error('Please enter a roadmap title');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a roadmap description');
      return;
    }
    
    setCurrentStep(2);
  };

  const prevStep = () => setCurrentStep(1);

  const handleClose = () => {
    if (loading) return;
    reset();
    setCurrentStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Roadmap" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium">Basic Info</span>
          </div>
          <div className="w-12 h-px bg-gray-300"></div>
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium">Weekly Structure</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Let's start with the basics
              </h3>
              <p className="text-gray-600">
                Give your custom roadmap a name and description
              </p>
            </div>

            <Input
              label="Roadmap Title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
              placeholder="e.g., Advanced Machine Learning Path"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe what this roadmap covers and who it's for..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => onClose()} disabled={loading}>
                Cancel
              </Button>
              <Button type="button" onClick={nextStep}>
                Next: Weekly Structure
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Weekly Structure */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Structure your weeks
              </h3>
              <p className="text-gray-600">
                Define the focus, topics, goals, and deliverables for each week
              </p>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {weekFields.map((field, weekIndex) => (
                <Card key={field.id} className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Week {weekIndex + 1}
                    </h4>
                    {weekFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWeek(weekIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Focus Area"
                      {...register(`weeks.${weekIndex}.focus_area`, { required: 'Focus area is required' })}
                      error={errors.weeks?.[weekIndex]?.focus_area?.message}
                      placeholder="e.g., Introduction to Neural Networks"
                    />

                    {/* Topics */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topics to Cover
                      </label>
                      {watch(`weeks.${weekIndex}.topics`).map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => updateArrayItem(weekIndex, 'topics', topicIndex, e.target.value)}
                            placeholder="Enter a topic"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {watch(`weeks.${weekIndex}.topics`).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeArrayItem(weekIndex, 'topics', topicIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addArrayItem(weekIndex, 'topics')}
                        className="text-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Topic
                      </Button>
                    </div>

                    {/* Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Learning Goals
                      </label>
                      {watch(`weeks.${weekIndex}.goals`).map((goal, goalIndex) => (
                        <div key={goalIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={goal}
                            onChange={(e) => updateArrayItem(weekIndex, 'goals', goalIndex, e.target.value)}
                            placeholder="Enter a learning goal"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {watch(`weeks.${weekIndex}.goals`).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeArrayItem(weekIndex, 'goals', goalIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addArrayItem(weekIndex, 'goals')}
                        className="text-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Goal
                      </Button>
                    </div>

                    {/* Deliverables */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deliverables/Tasks
                      </label>
                      {watch(`weeks.${weekIndex}.deliverables`).map((deliverable, deliverableIndex) => (
                        <div key={deliverableIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={deliverable}
                            onChange={(e) => updateArrayItem(weekIndex, 'deliverables', deliverableIndex, e.target.value)}
                            placeholder="Enter a deliverable or task"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {watch(`weeks.${weekIndex}.deliverables`).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeArrayItem(weekIndex, 'deliverables', deliverableIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addArrayItem(weekIndex, 'deliverables')}
                        className="text-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Deliverable
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={addWeek}
                className="flex items-center"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Week
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={prevStep} disabled={loading}>
                  Previous
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Roadmap'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => onClose()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}