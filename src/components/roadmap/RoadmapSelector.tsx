import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RoadmapType } from '../../types';
import { BookOpen, Cpu, Zap } from 'lucide-react';

interface RoadmapSelectorProps {
  onSelectRoadmap: (type: RoadmapType) => void;
}

export function RoadmapSelector({ onSelectRoadmap }: RoadmapSelectorProps) {
  const roadmaps = [
    {
      type: 'qiskit' as RoadmapType,
      title: 'Qiskit Quantum Programming',
      description: 'Learn quantum computing with IBM\'s Qiskit framework. From basic quantum gates to advanced algorithms.',
      icon: <Cpu className="h-8 w-8 text-blue-600" />,
      duration: '12 weeks',
      topics: ['Quantum Gates', 'Algorithms', 'Hardware', 'VQAs']
    },
    {
      type: 'qutip' as RoadmapType,
      title: 'QuTiP Learning Path',
      description: 'Master quantum simulations using QuTiP. From basic dynamics to advanced open quantum systems.',
      icon: <BookOpen className="h-8 w-8 text-teal-600" />,
      duration: '16 weeks',
      topics: ['Quantum Dynamics', 'Open Systems', 'Cavity QED', 'Simulations']
    },
    {
      type: 'superconductivity' as RoadmapType,
      title: 'Superconductivity Study',
      description: 'Comprehensive study of superconductivity from BCS theory to practical applications.',
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      duration: '14 weeks',
      topics: ['BCS Theory', 'Josephson Effect', 'SQUIDs', 'Qubits']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a predefined roadmap to start your journey, or create a custom study plan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {roadmaps.map((roadmap) => (
            <Card key={roadmap.type} className="relative group hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {roadmap.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {roadmap.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {roadmap.description}
                </p>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {roadmap.duration}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {roadmap.topics.map((topic) => (
                    <span 
                      key={topic}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => onSelectRoadmap(roadmap.type)}
                className="w-full"
                variant="primary"
              >
                Start This Roadmap
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="inline-block" padding="lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Want something different?
            </h3>
            <p className="text-gray-600 mb-4">
              Create your own custom learning roadmap with personalized goals and timelines.
            </p>
            <Button
              onClick={() => onSelectRoadmap('custom')}
              variant="secondary"
            >
              Create Custom Roadmap
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}