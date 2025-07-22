import React from 'react';
import { cn } from '../../lib/utils'; // Assuming cn utility is correctly defined

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Wrap the functional component with React.forwardRef
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    className,
    id,
    ...props
  }, ref) => { // 'ref' is the second argument provided by forwardRef
    // Generate an ID if not provided, useful for associating label with input
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId} // Use the generated inputId for htmlFor
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId} // Assign the generated ID to the input
          ref={ref} // *** THIS IS THE CRUCIAL CHANGE: Pass the ref to the actual <input> element ***
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props} // Spread the rest of the props (name, value, onChange, onBlur, etc.)
        />
        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

// Add a display name for better debugging in React DevTools
Input.displayName = 'Input';