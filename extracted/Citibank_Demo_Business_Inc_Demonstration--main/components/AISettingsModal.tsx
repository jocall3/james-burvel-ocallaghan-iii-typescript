import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card'; // Assuming Card is a shared component
import { AISettings } from './AIAdvisorView'; // Import types from AIAdvisorView

interface AISettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: AISettings; // The settings currently active in AIAdvisorView
    onSave: (newSettings: AISettings) => void; // Callback to update settings in AIAdvisorView
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    // Local state for the settings being edited in the modal
    const [editedSettings, setEditedSettings] = useState<AISettings>(currentSettings);

    // Update local state if currentSettings from parent changes (e.g., another source updates it)
    useEffect(() => {
        if (isOpen) { // Only update when the modal is opened or if the parent settings change while it's open
            setEditedSettings(currentSettings);
        }
    }, [currentSettings, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setEditedSettings(prev => {
            if (name.startsWith('accessibilityMode.')) {
                const subKey = name.split('.')[1] as keyof AISettings['accessibilityMode'];
                return {
                    ...prev,
                    accessibilityMode: {
                        ...prev.accessibilityMode,
                        [subKey]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
                    }
                };
            }
            return {
                ...prev,
                [name]: type === 'number' ? parseFloat(value) : value
            };
        });
    }, []);

    const handleSave = useCallback(() => {
        onSave(editedSettings);
        onClose();
    }, [editedSettings, onSave, onClose]);

    // Consistent dark theme and styling from AIAdvisorView.tsx
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm" aria-modal="true" role="dialog" aria-labelledby="ai-settings-modal-title">
            <Card className="max-w-3xl w-full mx-4" padding="medium">
                <h3 id="ai-settings-modal-title" className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
                    AI Advisor Settings
                </h3>

                <div className="space-y-6 text-gray-200 overflow-y-auto max-h-[70vh] custom-scrollbar pr-2"> {/* Added max height and scrollbar */}
                    {/* Persona Name */}
                    <div>
                        <label htmlFor="personaName" className="block text-sm font-medium text-gray-300 mb-1">
                            Persona Name:
                        </label>
                        <input
                            type="text"
                            id="personaName"
                            name="personaName"
                            value={editedSettings.personaName}
                            onChange={handleChange}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            aria-label="AI Persona Name"
                        />
                    </div>

                    {/* Verbosity Level */}
                    <div>
                        <label htmlFor="verbosityLevel" className="block text-sm font-medium text-gray-300 mb-1">
                            Verbosity Level:
                        </label>
                        <select
                            id="verbosityLevel"
                            name="verbosityLevel"
                            value={editedSettings.verbosityLevel}
                            onChange={handleChange}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8"
                            aria-label="AI Verbosity Level"
                        >
                            <option value="concise">Concise</option>
                            <option value="balanced">Balanced</option>
                            <option value="verbose">Verbose</option>
                        </select>
                    </div>

                    {/* Proactive Level */}
                    <div>
                        <label htmlFor="proactiveLevel" className="block text-sm font-medium text-gray-300 mb-1">
                            Proactive Interaction Level:
                        </label>
                        <select
                            id="proactiveLevel"
                            name="proactiveLevel"
                            value={editedSettings.proactiveLevel}
                            onChange={handleChange}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8"
                            aria-label="AI Proactive Interaction Level"
                        >
                            <option value="minimal">Minimal (Respond only when asked)</option>
                            <option value="suggestive">Suggestive (Offer insights and suggestions)</option>
                            <option value="action-oriented">Action-Oriented (Propose and potentially execute actions)</option>
                        </select>
                    </div>

                    {/* Response Tone */}
                    <div>
                        <label htmlFor="responseTone" className="block text-sm font-medium text-gray-300 mb-1">
                            Response Tone:
                        </label>
                        <select
                            id="responseTone"
                            name="responseTone"
                            value={editedSettings.responseTone}
                            onChange={handleChange}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8"
                            aria-label="AI Response Tone"
                        >
                            <option value="professional">Professional</option>
                            <option value="friendly">Friendly</option>
                            <option value="formal">Formal</option>
                            <option value="empathetic">Empathetic</option>
                        </select>
                    </div>

                    {/* Learning Rate */}
                    <div>
                        <label htmlFor="learningRate" className="block text-sm font-medium text-gray-300 mb-1">
                            Learning Rate (0.0 - 1.0):
                        </label>
                        <input
                            type="number"
                            id="learningRate"
                            name="learningRate"
                            value={editedSettings.learningRate}
                            onChange={handleChange}
                            min="0.0"
                            max="1.0"
                            step="0.1"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            aria-label="AI Learning Rate"
                        />
                    </div>

                    {/* Preferred Language */}
                    <div>
                        <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-300 mb-1">
                            Preferred Language:
                        </label>
                        <select
                            id="preferredLanguage"
                            name="preferredLanguage"
                            value={editedSettings.preferredLanguage}
                            onChange={handleChange}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8"
                            aria-label="AI Preferred Language"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            {/* Add more languages as needed */}
                        </select>
                    </div>

                    {/* Data Retention Policy */}
                    <div>
                        <label htmlFor="dataRetentionPolicy" className="block text-sm font-medium text-gray-300 mb-1">
                            Data Retention Policy:
                        </label>
                        <select
                            id="dataRetentionPolicy"
                            name="dataRetentionPolicy"
                            value={editedSettings.dataRetentionPolicy}
                            onChange={handleChange}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8"
                            aria-label="AI Data Retention Policy"
                        >
                            <option value="default">Default (Standard retention)</option>
                            <option value="enhanced_privacy">Enhanced Privacy (Minimal retention)</option>
                            <option value="extended_history">Extended History (Longer retention for better context)</option>
                        </select>
                    </div>

                    {/* Accessibility Mode */}
                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <h4 className="text-lg font-semibold text-cyan-300 mb-3">Accessibility Settings</h4>

                        {/* Font Size */}
                        <div className="mb-4">
                            <label htmlFor="accessibilityMode.fontSize" className="block text-sm font-medium text-gray-300 mb-1">
                                Font Size:
                            </label>
                            <select
                                id="accessibilityMode.fontSize"
                                name="accessibilityMode.fontSize"
                                value={editedSettings.accessibilityMode.fontSize}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8"
                                aria-label="Accessibility Font Size"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>

                        {/* High Contrast */}
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="accessibilityMode.highContrast"
                                name="accessibilityMode.highContrast"
                                checked={editedSettings.accessibilityMode.highContrast}
                                onChange={handleChange}
                                className="h-4 w-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                                aria-label="Enable High Contrast Mode"
                            />
                            <label htmlFor="accessibilityMode.highContrast" className="ml-2 block text-sm text-gray-300">
                                High Contrast Mode
                            </label>
                        </div>

                        {/* Speech Rate */}
                        <div>
                            <label htmlFor="accessibilityMode.speechRate" className="block text-sm font-medium text-gray-300 mb-1">
                                Speech Rate (0.5 - 2.0):
                            </label>
                            <input
                                type="number"
                                id="accessibilityMode.speechRate"
                                name="accessibilityMode.speechRate"
                                value={editedSettings.accessibilityMode.speechRate}
                                onChange={handleChange}
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                aria-label="Accessibility Speech Rate"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-gray-700 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                        aria-label="Cancel and close settings"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
                        aria-label="Save AI settings"
                    >
                        Save Settings
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default AISettingsModal;