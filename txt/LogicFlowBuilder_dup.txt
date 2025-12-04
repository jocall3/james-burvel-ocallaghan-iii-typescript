// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


import React, { useState, useCallback, useRef } from 'react';
import { ALL_FEATURES } from './index.ts';
// FIX: Import FEATURE_TAXONOMY from services/index.ts where it is now exported.
import { FEATURE_TAXONOMY, generatePipelineCode } from '../../services/index.ts';
import { featureToFunctionMap } from '../../services/pipelineTools.ts';
import type { Feature } from '../../types.ts';
import { MapIcon, SparklesIcon, XMarkIcon, Bars3Icon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';

interface PipelineNode {
    id: number;
    featureId: string;
}

const featuresMap = new Map(ALL_FEATURES.map(f => [f.id, f]));
const taxonomyMap = new Map(FEATURE_TAXONOMY.map(f => [f.id, f]));

const FeaturePaletteItem: React.FC<{ feature: Feature, onDragStart: (e: React.DragEvent, featureId: string) => void }> = ({ feature, onDragStart }) => (
    <div
        draggable
        onDragStart={e => onDragStart(e, feature.id)}
        className="p-3 rounded-md bg-gray-50 border border-border flex items-center gap-3 cursor-grab hover:bg-gray-100 transition-colors"
    >
        <div className="text-primary flex-shrink-0">{feature.icon}</div>
        <div>
            <h4 className="font-bold text-sm text-text-primary">{feature.name}</h4>
            <p className="text-xs text-text-secondary">{feature.category}</p>
        </div>
    </div>
);

const PipelineNodeComponent: React.FC<{
    node: PipelineNode;
    feature: Feature;
    index: number;
    onDragStart: () => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    onRemove: () => void;
}> = ({ node, feature, index, onDragStart, onDragEnter, onDragEnd, onRemove }) => (
    <div
        draggable
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        className="w-full bg-surface rounded-lg shadow-md border-2 border-border cursor-grab active:cursor-grabbing flex items-center p-3 gap-4"
    >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">{index + 1}</div>
        <div className="w-6 h-6 text-text-secondary">{feature.icon}</div>
        <span className="flex-grow font-semibold truncate text-text-primary">{feature.name}</span>
        <button onClick={onRemove} className="p-1 text-text-secondary hover:text-red-500"><XMarkIcon /></button>
        <div className="p-1 text-text-secondary cursor-grab"><Bars3Icon /></div>
    </div>
);

export const LogicFlowBuilder: React.FC = () => {
    const [pipeline, setPipeline] = useState<PipelineNode[]>([]);
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const draggedItem = useRef<PipelineNode | null>(null);
    const dragOverItem = useRef<PipelineNode | null>(null);

    const handleGenerateCode = useCallback(async () => {
        setIsGenerating(true);
        setGeneratedCode('');

        const flowDescription = pipeline.map((node, index) => {
            const featureInfo = taxonomyMap.get(node.featureId);
            // FIX: Added a check for featureInfo to prevent runtime errors and fix TypeScript error
            if (!featureInfo) {
                return `Step ${index + 1}: Unknown tool with ID ${node.featureId}`;
            }
            const functionName = featureToFunctionMap[node.featureId] || 'unknownTool';
            return `Step ${index + 1}: Execute the '${featureInfo.name}' tool (function: ${functionName}). Description: ${featureInfo.description}. Inputs: ${featureInfo.inputs}.`;
        }).join('\n');


        try {
            const code = await generatePipelineCode(flowDescription);
            setGeneratedCode(code);
        } catch (e) {
            setGeneratedCode(`// Error generating code: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    }, [pipeline]);

    const handlePaletteDragStart = (e: React.DragEvent, featureId: string) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ featureId }));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (!data) return; // Not a drop from the palette

        const { featureId } = JSON.parse(data);
        const newNode: PipelineNode = {
            id: Date.now(),
            featureId,
        };
        setPipeline(prev => [...prev, newNode]);
    };
    
    const handleNodeDragStart = (node: PipelineNode) => {
        draggedItem.current = node;
    };
    
    const handleNodeDragEnter = (node: PipelineNode) => {
        dragOverItem.current = node;
    };

    const handleNodeDragEnd = () => {
        if (draggedItem.current && dragOverItem.current && draggedItem.current.id !== dragOverItem.current.id) {
            const newPipeline = [...pipeline];
            const draggedIndex = pipeline.findIndex(p => p.id === draggedItem.current!.id);
            const targetIndex = pipeline.findIndex(p => p.id === dragOverItem.current!.id);

            const [removed] = newPipeline.splice(draggedIndex, 1);
            newPipeline.splice(targetIndex, 0, removed);
            setPipeline(newPipeline);
        }
        draggedItem.current = null;
        dragOverItem.current = null;
    };

    const handleRemoveNode = (id: number) => {
        setPipeline(prev => prev.filter(node => node.id !== id));
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold flex items-center"><MapIcon /><span className="ml-3">Logic Flow Builder</span></h1>
                    <p className="text-text-secondary mt-1">Visually build application logic flows and generate pipeline code.</p>
                </div>
                <button onClick={handleGenerateCode} disabled={isGenerating || pipeline.length === 0} className="btn-primary flex items-center gap-2 px-4 py-2">
                    <SparklesIcon /> {isGenerating ? 'Generating...' : 'Generate Code'}
                </button>
            </header>
            <div className="flex-grow flex gap-6 min-h-0">
                <aside className="w-72 flex-shrink-0 bg-surface border border-border p-4 rounded-lg flex flex-col">
                    <h3 className="font-bold mb-3 text-lg">Features</h3>
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                        {ALL_FEATURES.map(feature => <FeaturePaletteItem key={feature.id} feature={feature} onDragStart={handlePaletteDragStart} />)}
                    </div>
                </aside>
                <main
                    className={`flex-grow relative bg-background border-2 ${isDraggingOver ? 'border-primary' : 'border-dashed border-border'} rounded-lg overflow-y-auto p-4 transition-colors`}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
                    onDragLeave={() => setIsDraggingOver(false)}
                >
                    {pipeline.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary">
                            <p>Drag features here to build your pipeline</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-w-lg mx-auto">
                           {pipeline.map((node, index) => {
                                const feature = featuresMap.get(node.featureId);
                                if (!feature) return null;
                                return (
                                    <div key={node.id} className="flex flex-col items-center">
                                         <PipelineNodeComponent
                                            node={node}
                                            feature={feature}
                                            index={index}
                                            onDragStart={() => handleNodeDragStart(node)}
                                            onDragEnter={() => handleNodeDragEnter(node)}
                                            onDragEnd={handleNodeDragEnd}
                                            onRemove={() => handleRemoveNode(node.id)}
                                        />
                                        {index < pipeline.length - 1 && (
                                            <div className="w-0.5 h-6 bg-border my-1" />
                                        )}
                                    </div>
                                );
                           })}
                        </div>
                    )}
                </main>
            </div>
             {(isGenerating || generatedCode) && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setGeneratedCode('')}>
                    <div className="w-full max-w-3xl h-3/4 bg-surface border border-border rounded-lg shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Generated Pipeline Code</h2>
                             <button onClick={() => setGeneratedCode('')} className="p-1 text-text-secondary hover:text-text-primary"><XMarkIcon/></button>
                        </div>
                        <div className="flex-grow bg-background border border-border rounded-md overflow-auto">
                            {isGenerating && !generatedCode ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={'```javascript\n' + generatedCode.replace(/^```(javascript)?|```$/g, '') + '\n```'} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
