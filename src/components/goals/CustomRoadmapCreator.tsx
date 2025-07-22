import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase'; // Assuming supabase is correctly configured
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth provides user object
import { Plus, X, Save, BookOpen, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is installed and configured

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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm<RoadmapFormData>({
    defaultValues: {
      title: '',
      description: '',
      weeks: [
        {
          week_number: '1',
          focus_area: '',
          topics: [''],
          goals: [''],
          deliverables: [''],
        },
      ],
    },
    // Adding `mode: 'onChange'` or `onBlur` can help with real-time validation feedback
    // mode: 'onBlur',
  });

  const { fields: weekFields, append: appendWeek, remove: removeWeek } = useFieldArray({
    control,
    name: 'weeks',
  });

  const addWeek = () => {
    const nextWeekNumber = String(weekFields.length + 1);
    appendWeek({
      week_number: nextWeekNumber,
      focus_area: '',
      topics: [''],
      goals: [''],
      deliverables: [''],
    });
  };

  const addArrayItem = (weekIndex: number, fieldName: 'topics' | 'goals' | 'deliverables') => {
    const currentWeeks = getValues('weeks');
    const updatedWeeks = [...currentWeeks];
    updatedWeeks[weekIndex][fieldName].push('');
    setValue('weeks', updatedWeeks);
  };

  const removeArrayItem = (weekIndex: number, fieldName: 'topics' | 'goals' | 'deliverables', itemIndex: number) => {
    const currentWeeks = getValues('weeks');
    const updatedWeeks = [...currentWeeks];
    if (updatedWeeks[weekIndex][fieldName].length > 1) {
      updatedWeeks[weekIndex][fieldName].splice(itemIndex, 1);
      setValue('weeks', updatedWeeks);
    }
  };

  const updateArrayItem = (weekIndex: number, fieldName: 'topics' | 'goals' | 'deliverables', itemIndex: number, value: string) => {
    const currentWeeks = getValues('weeks');
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

      for (const week of data.weeks) {
        const cleanTopics = week.topics.filter(t => t.trim());
        const cleanGoals = week.goals.filter(g => g.trim());
        const cleanDeliverables = week.deliverables.filter(d => d.trim());

        if (!week.focus_area.trim()) throw new Error(`Week ${week.week_number} must have a focus area`);
        if (cleanTopics.length === 0) throw new Error(`Week ${week.week_number} must have at least one topic`);
        if (cleanGoals.length === 0) throw new Error(`Week ${week.week_number} must have at least one goal`);
        if (cleanDeliverables.length === 0) throw new Error(`Week ${week.week_number} must have at least one deliverable`);

        const { data: weeklyGoal, error: goalError } = await supabase
          .from('weekly_goals')
          .insert({
            user_id: user.id,
            roadmap_type: 'custom',
            week_number: week.week_number,
            focus_area: week.focus_area,
            topics: cleanTopics,
            goals: cleanGoals,
            deliverables: cleanDeliverables,
            reference: [{
              type: 'Custom Roadmap',
              title: data.title,
              description: data.description,
            }],
          })
          .select()
          .single();

        if (goalError) throw new Error(`Failed to create week ${week.week_number}: ${goalError.message}`);
        createdGoalsCount++;

        for (const deliverable of cleanDeliverables) {
          const { error: taskError } = await supabase
            .from('tasks')
            .insert({
              user_id: user.id,
              weekly_goal_id: weeklyGoal.id,
              title: deliverable,
              completed: false,
            });

          if (!taskError) createdTasksCount++;
        }
      }

      toast.success(`Custom roadmap "${data.title}" created successfully!`);
      reset();
      setCurrentStep(1);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create roadmap');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    // Validate only title and description for Step 1
    const isValid = await trigger(['title', 'description']);

    // Additionally, check if the trimmed values are truly non-empty
    const titleValue = (getValues('title') || '').trim();
    const descriptionValue = (getValues('description') || '').trim();

    if (!titleValue) {
        setValue('title', ''); // Ensure the field is marked empty for visual feedback
        toast.error('Roadmap Title is required.');
        return;
    }
    if (!descriptionValue) {
        setValue('description', ''); // Ensure the field is marked empty for visual feedback
        toast.error('Description is required.');
        return;
    }

    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => setCurrentStep(1);

  const handleClose = () => {
    if (loading) return;
    reset(); // Reset form state when closing
    setCurrentStep(1); // Reset step to 1
    onClose();
  };

  // Helper to get current weeks data for rendering dynamic fields
  const getCurrentWeeks = () => getValues('weeks') || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Custom Roadmap" size="xl">
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

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Let's start with the basics</h3>
              <p className="text-gray-600">Give your custom roadmap a name and description</p>
            </div>

            <Input
              label="Roadmap Title"
              {...register('title', {
                required: 'Roadmap Title is required',
                // Add a custom validation rule to trim and check for emptiness
                validate: (value) => value.trim() !== '' || 'Roadmap Title cannot be empty or just spaces'
              })}
              error={errors.title?.message}
              placeholder="e.g., Advanced Machine Learning Path"
              helperText="Leading and trailing spaces will be preserved. Must not be empty."
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
              <textarea
                id="description"
                {...register('description', {
                  required: 'Description is required',
                  // Add a custom validation rule to trim and check for emptiness
                  validate: (value) => value.trim() !== '' || 'Description cannot be empty or just spaces'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe what this roadmap covers and who it's for..."
              />
              <p className="text-sm text-gray-500 mt-1">Leading and trailing spaces will be preserved. Must not be empty.</p>
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="button" onClick={nextStep}>
                Next: Weekly Structure
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Structure your weeks</h3>
              <p className="text-gray-600">Define the focus, topics, goals, and deliverables for each week</p>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar */}
              {weekFields.map((field, weekIndex) => {
                const currentWeek = watch(`weeks.${weekIndex}`); // Use watch to get the latest values for rendering

                return (
                  <Card key={field.id} className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Week {weekIndex + 1}</h4>
                      {weekFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWeek(weekIndex)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Focus Area"
                        {...register(`weeks.${weekIndex}.focus_area`, {
                          required: 'Focus area is required',
                          validate: (value) => value.trim() !== '' || 'Focus area cannot be empty or just spaces'
                        })}
                        error={errors.weeks?.[weekIndex]?.focus_area?.message}
                        placeholder="e.g., Intro to Superconductivity"
                      />

                      {['topics', 'goals', 'deliverables'].map((fieldName) => (
                        <div key={fieldName}>
                          <label className="block text-sm font-medium mb-2">
                            {fieldName === 'topics'
                              ? 'Topics to Cover'
                              : fieldName === 'goals'
                              ? 'Learning Goals'
                              : 'Deliverables/Tasks'}
                          </label>
                          {(currentWeek?.[fieldName as keyof WeekFormData] as string[]).map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                // Use register with `onChange` and `onBlur` for better RHF integration
                                {...register(`weeks.${weekIndex}.${fieldName}.${idx}`, {
                                    required: `${fieldName.slice(0, -1)} is required`,
                                    validate: (value) => value.trim() !== '' || `${fieldName.slice(0, -1)} cannot be empty or just spaces`
                                })}
                                placeholder={`Enter a ${fieldName.slice(0, -1)}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              />
                              {(currentWeek?.[fieldName as keyof WeekFormData] as string[]).length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeArrayItem(
                                      weekIndex,
                                      fieldName as 'topics' | 'goals' | 'deliverables',
                                      idx
                                    )
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                            {/* Display error for array fields (e.g., if all items are empty after filtering) */}
                            {errors.weeks?.[weekIndex]?.[fieldName as keyof WeekFormData] && (
                                <p className="text-sm text-red-600 mt-1">
                                    {`At least one ${fieldName.slice(0, -1)} is required for Week ${weekIndex + 1}.`}
                                </p>
                            )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addArrayItem(weekIndex, fieldName as 'topics' | 'goals' | 'deliverables')}
                            className="text-blue-600"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add {fieldName.slice(0, -1).charAt(0).toUpperCase() + fieldName.slice(1, -1).slice(1)}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button type="button" variant="secondary" onClick={addWeek} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Week
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={prevStep} disabled={loading}>
                  Previous
                </Button>
                <Button type="submit" disabled={loading} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Roadmap'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
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