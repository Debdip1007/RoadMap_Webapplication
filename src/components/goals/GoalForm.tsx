import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  tags: string[];
}

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoalForm({ isOpen, onClose, onSuccess }: GoalFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<GoalFormData>();

  const categoryOptions = [
    { value: 'personal', label: 'Personal Development' },
    { value: 'career', label: 'Career' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'hobbies', label: 'Hobbies' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: GoalFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Create a custom goal as a weekly goal
      const { error } = await supabase
        .from('weekly_goals')
        .insert({
          user_id: user.id,
          roadmap_type: 'custom',
          week_number: `custom-${Date.now()}`,
          focus_area: data.title,
          topics: [data.description],
          goals: [data.title],
          deliverables: [`Complete: ${data.title}`],
          reference: [{
            type: 'Custom Goal',
            title: data.title,
            category: data.category,
            priority: data.priority,
            deadline: data.deadline,
            tags: tags
          }]
        });

      if (error) throw error;

      toast.success('Goal created successfully!');
      reset();
      setTags([]);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Goal" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Goal Title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
          placeholder="Enter your goal title"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Describe your goal in detail"
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            value=""
            onChange={() => {}}
            {...register('category', { required: 'Category is required' })}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value=""
            onChange={() => {}}
            {...register('priority', { required: 'Priority is required' })}
          />
        </div>

        <Input
          label="Deadline"
          type="date"
          {...register('deadline')}
          error={errors.deadline?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="primary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}