import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { RoadmapType } from '../../types';
import { 
  Target, 
  BarChart3, 
  Users, 
  Zap, 
  CheckCircle, 
  TrendingUp,
  BookOpen,
  Cpu,
  ArrowRight,
  Star,
  Play,
  Shield,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onSelectRoadmap: (type: RoadmapType) => void;
  onCreateCustom: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onSelectRoadmap, onCreateCustom, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Smart Goal Setting",
      description: "Create and organize goals with intelligent categorization and priority management."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "Progress Tracking",
      description: "Visual progress bars and analytics to keep you motivated and on track."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Roadmap Templates",
      description: "Pre-built learning paths for quantum computing, superconductivity, and more."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Python Integration",
      description: "Import goals from Python dictionaries for seamless workflow integration."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and encryption."
    },
    {
      icon: <Clock className="h-8 w-8 text-indigo-600" />,
      title: "Time Management",
      description: "Set deadlines, track time, and manage your learning schedule effectively."
    }
  ];

  const roadmaps = [
    {
      type: 'qiskit' as RoadmapType,
      title: 'Qiskit Quantum Programming',
      description: 'Master quantum computing with IBM\'s Qiskit framework',
      icon: <Cpu className="h-6 w-6 text-blue-600" />,
      duration: '12 weeks',
      difficulty: 'Intermediate',
      topics: ['Quantum Gates', 'Algorithms', 'Hardware', 'VQAs']
    },
    {
      type: 'qutip' as RoadmapType,
      title: 'QuTiP Learning Path',
      description: 'Advanced quantum simulations and open quantum systems',
      icon: <BookOpen className="h-6 w-6 text-teal-600" />,
      duration: '16 weeks',
      difficulty: 'Advanced',
      topics: ['Quantum Dynamics', 'Open Systems', 'Cavity QED', 'Simulations']
    },
    {
      type: 'superconductivity' as RoadmapType,
      title: 'Superconductivity Study',
      description: 'From BCS theory to practical quantum applications',
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      duration: '14 weeks',
      difficulty: 'Advanced',
      topics: ['BCS Theory', 'Josephson Effect', 'SQUIDs', 'Qubits']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">GoalTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onSignIn}>
                Sign In
              </Button>
              <Button onClick={onSignIn}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Achieve Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                {" "}Learning Goals
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Track your progress, stay motivated, and master complex subjects with our intelligent goal-tracking platform designed for serious learners.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={onSignIn}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Learning Now
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={() => document.getElementById('roadmaps')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Roadmaps
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Goals Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Learning Paths</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you stay organized, motivated, and on track.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow p-8">
                <div className="mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmaps Section */}
      <section id="roadmaps" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with one of our expertly crafted roadmaps or create your own custom journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {roadmaps.map((roadmap) => (
              <Card key={roadmap.type} className="relative group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-600">{roadmap.difficulty}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {roadmap.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {roadmap.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {roadmap.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {roadmap.duration}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.topics.map((topic) => (
                      <span 
                        key={topic}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => onSelectRoadmap(roadmap.type)}
                  className="w-full group-hover:bg-blue-700 transition-colors"
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>

          {/* Custom Roadmap CTA */}
          <div className="text-center">
            <Card className="inline-block max-w-2xl" padding="lg">
              <div className="flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Need Something Different?
              </h3>
              <p className="text-gray-600 mb-6">
                Create your own personalized learning roadmap with custom goals, timelines, and milestones tailored to your specific needs.
              </p>
              <Button
                onClick={onCreateCustom}
                variant="secondary"
                size="lg"
                className="px-8"
              >
                Create Custom Roadmap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who have achieved their goals with our platform.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100"
            onClick={onSignIn}
          >
            Start Your Journey Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}