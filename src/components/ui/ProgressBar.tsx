import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  size = 'md', 
  color = 'blue',
  showLabel = true,
  label,
  className,
  animated = true,
  showPercentage = true
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600'
  };

  const backgroundColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
    indigo: 'bg-indigo-100'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        sizes[size],
        backgroundColors[color]
      )}>
        <div
          className={cn(
            'h-full rounded-full relative',
            animated && 'transition-all duration-700 ease-out',
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && percentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          )}
        </div>
      </div>
      
      {/* Additional info below progress bar */}
      {(value !== percentage || max !== 100) && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span>{value} of {max}</span>
          <span>{percentage.toFixed(1)}% complete</span>
        </div>
      )}
    </div>
  );
}