import React from 'react';
import { PythonImport } from '../goals/PythonImport';

interface ImportRoadmapPageProps {
  onSuccess: () => void;
}

export function ImportRoadmapPage({ onSuccess }: ImportRoadmapPageProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Roadmap</h1>
        <p className="text-gray-600">Import goals from Python dictionary format</p>
      </div>

      {/* Import Component */}
      <PythonImport
        isOpen={true}
        onClose={() => {}} // Always open on this page
        onSuccess={onSuccess}
      />
    </div>
  );
}