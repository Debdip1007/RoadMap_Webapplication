import React from 'react';
import { CustomRoadmapCreator } from '../goals/CustomRoadmapCreator';

interface CreateRoadmapPageProps {
  onSuccess: () => void;
}

export function CreateRoadmapPage({ onSuccess }: CreateRoadmapPageProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Roadmap</h1>
        <p className="text-gray-600">Design your custom learning roadmap</p>
      </div>

      {/* Creator Component */}
      <CustomRoadmapCreator
        isOpen={true}
        onClose={() => {}} // Always open on this page
        onSuccess={onSuccess}
      />
    </div>
  );
}