import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Code } from 'lucide-react';

interface JsonImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JsonImport({ isOpen, onClose, onSuccess }: JsonImportProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jsonCode, setJsonCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    preview?: any;
  } | null>(null);

  const sampleCode = `// Sample JSON format for goals
goals_data = {
    "roadmap_type": "custom_python",
    "title": "My Custom Learning Path",
    "weeks": [
        {
            "week": "1",
            "focus": "Getting Started",
            "topics": ["Setup environment", "Basic concepts"],
            "goals": ["Complete setup", "Understand basics"],
            "deliverables": ["Environment configured", "First project completed"],
            "reference": [
                {
                    "type": "Documentation",
                    "title": "Getting Started Guide",
                    "url": "https://example.com"
                }
            ]
        },
        {
            "week": "2",
            "focus": "Advanced Topics",
            "topics": ["Advanced concepts", "Best practices"],
            "goals": ["Master advanced features", "Apply best practices"],
            "deliverables": ["Advanced project", "Code review"],
            "reference": [
                {
                    "type": "Tutorial",
                    "title": "Advanced Guide",
                    "url": "https://example.com/advanced"
                }
            ]
        }
    ]
}`;

  const validateJsonCode = (code: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let preview = null;

    try {
      // Parse JSON directly
      const goalsData = JSON.parse(code);
      preview = goalsData;

      // Validate required fields
      if (!goalsData.title || typeof goalsData.title !== 'string') {
        errors.push('Missing or invalid title field');
      }

      if (!goalsData.weeks || !Array.isArray(goalsData.weeks)) {
        errors.push('Missing or invalid weeks array');
      } else {
        if (goalsData.weeks.length === 0) {
          errors.push('Weeks array cannot be empty');
        }

        goalsData.weeks.forEach((week: any, index: number) => {
          const weekNum = index + 1;
          
          if (!week.week) {
            errors.push(`Week ${weekNum}: Missing week number`);
          }
          
          if (!week.focus || typeof week.focus !== 'string') {
            errors.push(`Week ${weekNum}: Missing or invalid focus area`);
          }
          
          if (!week.topics || !Array.isArray(week.topics) || week.topics.length === 0) {
            errors.push(`Week ${weekNum}: Missing or empty topics array`);
          }
          
          if (!week.goals || !Array.isArray(week.goals) || week.goals.length === 0) {
            errors.push(`Week ${weekNum}: Missing or empty goals array`);
          }
          
          if (!week.deliverables || !Array.isArray(week.deliverables) || week.deliverables.length === 0) {
            errors.push(`Week ${weekNum}: Missing or empty deliverables array`);
          }

          // Warnings for optional fields
          if (!week.reference || !Array.isArray(week.reference) || week.reference.length === 0) {
            warnings.push(`Week ${weekNum}: No references provided (optional)`);
          }
        });
      }

      // Validate optional advanced sections
      if (goalsData.advanced_topics && Array.isArray(goalsData.advanced_topics)) {
        goalsData.advanced_topics.forEach((topic: any, index: number) => {
          if (!topic.topic || !topic.description) {
            warnings.push(`Advanced topic ${index + 1}: Missing topic name or description`);
          }
        });
      }

      if (goalsData.prerequisites && Array.isArray(goalsData.prerequisites)) {
        if (goalsData.prerequisites.length === 0) {
          warnings.push('Prerequisites array is empty');
        }
      }

      if (goalsData.checklist && Array.isArray(goalsData.checklist)) {
        if (goalsData.checklist.length === 0) {
          warnings.push('Checklist array is empty');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        preview
      };

    } catch (error) {
      errors.push(`JSON parsing error: ${error instanceof Error ? error.message : 'Invalid format'}`);
      return { isValid: false, errors, warnings, preview };
    }
  };

  const handleValidate = () => {
    if (!jsonCode.trim()) {
      toast.error('Please enter JSON code');
      return;
    }

    const result = validateJsonCode(jsonCode);
    setValidationResult(result);

    if (result.isValid) {
      toast.success('Code validation successful!');
    } else {
      toast.error('Code validation failed. Please check the errors below.');
    }
  };

  const parseAndImport = async () => {
    if (!user || !jsonCode.trim()) {
      toast.error('Please enter JSON code');
      return;
    }

    // Validate first if not already validated
    let result = validationResult;
    if (!result) {
      result = validateJsonCode(jsonCode);
      setValidationResult(result);
    }

    if (!result.isValid) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    setLoading(true);
    try {
      const goalsData = result.preview;
      let importedWeeksCount = 0;
      let importedTasksCount = 0;
      let importedAdvancedTopicsCount = 0;

      // Import each week
      for (const week of goalsData.weeks) {
        // Clean up arrays
        const cleanTopics = (week.topics || []).filter((topic: string) => topic.trim());
        const cleanGoals = (week.goals || []).filter((goal: string) => goal.trim());
        const cleanDeliverables = (week.deliverables || []).filter((deliverable: string) => deliverable.trim());
        
        // Process references with enhanced structure
        const cleanReferences = (week.reference || []).map((ref: any) => ({
          type: ref.type || 'Reference',
          title: ref.title || ref.book || 'Untitled',
          book: ref.book,
          chapters: ref.chapters,
          section: ref.section,
          url: ref.url,
          ...ref
        }));

        const { data: weeklyGoal, error: goalError } = await supabase
          .from('weekly_goals')
          .insert({
            user_id: user.id,
            roadmap_type: goalsData.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
            week_number: week.week,
            focus_area: week.focus,
            topics: cleanTopics,
            goals: cleanGoals,
            deliverables: cleanDeliverables,
            reference: [
              ...cleanReferences,
              // Add metadata about the roadmap
              {
                type: 'Roadmap Metadata',
                title: goalsData.title,
                description: goalsData.description || 'Imported from Python dictionary',
                prerequisites: goalsData.prerequisites || [],
                checklist: goalsData.checklist || [],
                advanced_topics: goalsData.advanced_topics || []
              }
            ]
          })
          .select()
          .single();

        if (goalError) {
          console.error('Error creating weekly goal:', goalError);
          throw new Error(`Failed to create week ${week.week}: ${goalError.message}`);
        }

        importedWeeksCount++;

        // Create tasks for deliverables
        for (const deliverable of cleanDeliverables) {
          const { error: taskError } = await supabase
            .from('tasks')
            .insert({
              user_id: user.id,
              weekly_goal_id: weeklyGoal.id,
              title: deliverable,
              completed: false
            });
          
          if (!taskError) {
            importedTasksCount++;
          } else {
            console.error('Error creating task:', taskError);
          }
        }
      }

      // Import advanced topics as additional weeks if they exist
      if (goalsData.advanced_topics && Array.isArray(goalsData.advanced_topics)) {
        for (const [index, topic] of goalsData.advanced_topics.entries()) {
          const advancedWeekNumber = `advanced-${index + 1}`;
          
          const { data: advancedGoal, error: advancedError } = await supabase
            .from('weekly_goals')
            .insert({
              user_id: user.id,
              roadmap_type: goalsData.roadmap_type || 'custom_python',
              week_number: advancedWeekNumber,
              focus_area: `Advanced Topic: ${topic.topic}`,
              topics: [topic.description],
              goals: [`Master ${topic.topic}`],
              deliverables: topic.deliverables || [`Complete study of ${topic.topic}`],
              reference: [
                ...(topic.reference || topic.references || []),
                {
                  type: 'Advanced Topic',
                  title: topic.topic,
                  description: topic.description,
                  recommended_time: topic.recommended_time || 'Variable'
                }
              ]
            })
            .select()
            .single();

          if (!advancedError) {
            importedAdvancedTopicsCount++;
            
            // Create tasks for advanced topic deliverables
            const advancedDeliverables = topic.deliverables || [`Complete study of ${topic.topic}`];
            for (const deliverable of advancedDeliverables) {
              await supabase
                .from('tasks')
                .insert({
                  user_id: user.id,
                  weekly_goal_id: advancedGoal.id,
                  title: deliverable,
                  completed: false
                });
              importedTasksCount++;
            }
          }
        }
      }

      toast.success(`Successfully imported ${importedWeeksCount} weeks with ${importedTasksCount} tasks!`);
      setJsonCode('');
      setValidationResult(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import goals');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setJsonCode('');
    setValidationResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Goals from JSON Dictionary" size="xl">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Code className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">JSON Dictionary Format</h3>
          </div>
          <p className="text-sm text-blue-700">
            Paste your comprehensive JSON object containing roadmap data. Supports weeks, advanced topics, prerequisites, checklist, and references with full metadata preservation.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              JSON Code
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleValidate}
              disabled={!jsonCode.trim() || loading}
            >
              Validate Code
            </Button>
          </div>
          <textarea
            value={jsonCode}
            onChange={(e) => {
              setJsonCode(e.target.value);
              setValidationResult(null); // Reset validation when code changes
            }}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder={sampleCode}
          />
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-3">
            {validationResult.isValid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Validation Successful</h4>
                </div>
                <p className="text-sm text-green-700">
                  Found {validationResult.preview?.weeks?.length || 0} weeks{validationResult.preview?.advanced_topics?.length ? ` and ${validationResult.preview.advanced_topics.length} advanced topics` : ''} ready for import.
                </p>
                {validationResult.preview?.prerequisites && (
                  <p className="text-sm text-green-700">
                    Prerequisites: {validationResult.preview.prerequisites.length} items
                  </p>
                )}
                {validationResult.preview?.checklist && (
                  <p className="text-sm text-green-700">
                    Checklist: {validationResult.preview.checklist.length} items
                  </p>
                )}
                {validationResult.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-800">Warnings:</p>
                    <ul className="text-sm text-green-700 list-disc list-inside">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-900">Validation Errors</h4>
                </div>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
          <h4 className="font-medium text-gray-900 mb-2">Sample Format:</h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`// Enhanced JSON format
goals_data = {
    "title": "Your Roadmap Title",
    "weeks": [
        {
            "week": "1",
            "focus": "Week Focus Area",
            "topics": ["Topic 1", "Topic 2"],
            "goals": ["Goal 1", "Goal 2"],
            "deliverables": ["Task 1", "Task 2"],
            "reference": [
                {
                    "type": "Book",
                    "book": "Book Title",
                    "chapters": ["Chapter 1"]
                }
            ]
        }
    ],
    "advanced_topics": [
        {
            "topic": "Advanced Topic Name",
            "description": "Topic description",
            "recommended_time": "2 weeks",
            "deliverables": ["Advanced task 1"],
            "reference": [{"type": "Paper", "title": "Paper Title"}]
        }
    ],
    "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
    "checklist": ["Checklist item 1", "Checklist item 2"]
}`}
          </pre>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onClose()}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={parseAndImport}
            className="flex-1 flex items-center justify-center space-x-2"
            disabled={loading || !jsonCode.trim() || (validationResult && !validationResult.isValid)}
          >
            <Upload className="h-4 w-4" />
            <span>{loading ? 'Importing...' : 'Import Goals'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}