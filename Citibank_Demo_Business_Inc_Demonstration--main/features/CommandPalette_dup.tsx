// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useMemo } from 'react';
import { ALL_FEATURES } from './features/index.ts';
import type { FeatureId } from '../types.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (featureId: FeatureId) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  const commandOptions = useMemo(() => {
     return ALL_FEATURES.filter(
        (feature) =>
          feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feature.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [commandOptions.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commandOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commandOptions.length) % commandOptions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = commandOptions[selectedIndex];
        if (selected) {
          onSelect(selected.id);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commandOptions, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-surface/80 backdrop-blur-xl border border-border rounded-lg shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Type a command or search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          className="w-full p-4 bg-transparent text-text-primary text-lg focus:outline-none border-b border-border"
        />
        <ul className="max-h-96 overflow-y-auto p-2">
          {commandOptions.length > 0 ? (
            commandOptions.map((item, index) => (
              <li
                key={item.id + index}
                onMouseDown={() => {
                   onSelect(item.id);
                }}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                  selectedIndex === index ? 'bg-primary/20 text-primary' : 'hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center space-x-3">
                    <div className="text-primary">{item.icon}</div>
                    <span className="text-text-primary">{item.name}</span>
                </div>
                <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded">{item.category}</span>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-text-secondary">No results found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
