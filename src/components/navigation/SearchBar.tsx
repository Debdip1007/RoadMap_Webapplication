import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'goal' | 'week' | 'task';
  description?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  results?: SearchResult[];
  onSelectResult?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  results = [], 
  onSelectResult, 
  placeholder = "Search goals, weeks, or tasks...",
  className 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult?.(result);
    setQuery(result.title);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelectResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{result.title}</div>
                  {result.description && (
                    <div className="text-sm text-gray-500 mt-1">{result.description}</div>
                  )}
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  result.type === 'goal' && 'bg-blue-100 text-blue-700',
                  result.type === 'week' && 'bg-green-100 text-green-700',
                  result.type === 'task' && 'bg-yellow-100 text-yellow-700'
                )}>
                  {result.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}