import React, { useState } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { Button } from './components/ui/Button';
import { AuthForm } from './components/auth/AuthForm';
import { MainNavigation } from './components/navigation/MainNavigation';
import HomePage from './components/pages/HomePage';
import { MyGoalsPage } from './components/pages/MyGoalsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { JsonImport } from './components/goals/JsonImport';
import { CustomRoadmapCreator } from './components/goals/CustomRoadmapCreator';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { useAuth } from './hooks/useAuth';
import { RoadmapType } from './types';

function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapType | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingRoadmap, setViewingRoadmap] = useState<string | null>(null);

  const handleToggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };

  const handleSelectRoadmap = (type: RoadmapType) => {
    setSelectedRoadmap(type);
    setShowLanding(false);
    setCurrentView('my-goals');
  };

  const handleCreateCustom = () => {
    setShowLanding(false);
    setCurrentView('create-roadmap');
  };

  const handleOpenRoadmap = (roadmapType: string) => {
    setSelectedRoadmap(roadmapType as RoadmapType);
    setCurrentView('my-goals');
  };

  const handleSignIn = () => {
    setShowLanding(false);
  };

  const handleSuccess = () => {
    // Refresh data and navigate to appropriate view
    setCurrentView('home');
    setShowImportModal(false);
    setShowCreateModal(false);
    setViewingRoadmap(null);
  };

  // Check if we're viewing a specific roadmap
  React.useEffect(() => {
    const path = window.location.pathname;
    const roadmapMatch = path.match(/^\/roadmap\/(.+)$/);
    if (roadmapMatch) {
      setViewingRoadmap(roadmapMatch[1]);
      setShowLanding(false);
      setCurrentView('dashboard'); // Ensure we're in dashboard view
    }
  }, []);

  const handleBackToHome = () => {
    setViewingRoadmap(null);
    setCurrentView('home');
    // Use proper navigation instead of pushState
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return (
        <>
          <LandingPage
            onSelectRoadmap={handleSelectRoadmap}
            onCreateCustom={handleCreateCustom}
            onSignIn={handleSignIn}
          />
          <ToastProvider />
        </>
      );
    }

    return (
      <>
        <AuthForm
          mode={authMode}
          onToggleMode={handleToggleAuthMode}
        />
        <ToastProvider />
      </>
    );
  }

  // If viewing a specific roadmap, show the dashboard
  if (viewingRoadmap) {
    return (
      <>
        <Dashboard
          selectedRoadmap={viewingRoadmap as RoadmapType}
          onBackToSelection={handleBackToHome}
        />
        <ToastProvider />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onViewChange={setCurrentView} onOpenRoadmap={handleOpenRoadmap} />;
      case 'my-goals':
        return (
          <MyGoalsPage 
            selectedRoadmapType={selectedRoadmap}
            onCreateGoal={() => setShowCreateModal(true)}
            onEditGoal={(goal) => console.log('Edit goal:', goal)}
          />
        );
      case 'settings':
        return <SettingsPage />;
      case 'import-roadmap':
        return (
          <>
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Roadmap</h1>
                <p className="text-gray-600">Import goals from Python dictionary format</p>
              </div>
              <div className="text-center">
                <Button onClick={() => setShowImportModal(true)}>
                  Open Import Dialog
                </Button>
              </div>
            </div>
            <JsonImport
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onSuccess={handleSuccess}
            />
          </>
        );
      case 'create-roadmap':
        return (
          <>
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Roadmap</h1>
                <p className="text-gray-600">Design your custom learning roadmap</p>
              </div>
              <div className="text-center">
                <Button onClick={() => setShowCreateModal(true)}>
                  Open Roadmap Creator
                </Button>
              </div>
            </div>
            <CustomRoadmapCreator
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSuccess={handleSuccess}
            />
          </>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
      <ToastProvider />
    </div>
  );
}

export default App;