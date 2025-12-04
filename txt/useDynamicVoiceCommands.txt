import { useEffect, useRef } from 'react';
import { VoiceCommandDefinition, NLPService } from '../VoiceControl'; // Adjust path as necessary, assuming this is under components/hooks

/**
 * A React hook for dynamically registering and unregistering voice commands.
 * This allows components to define context-specific voice interactions that
 * are active only when the component is mounted.
 *
 * @param commands An array of VoiceCommandDefinition objects to register.
 *                 These commands will be active as long as the component using this hook is mounted.
 * @param dependencies Optional: Dependency array for when to re-register commands.
 *                     If commands change, they will be updated.
 */
export const useDynamicVoiceCommands = (
    commands: Omit<VoiceCommandDefinition, 'id'>[], // Omit ID because we'll generate it internally
    dependencies: React.DependencyList = []
): void => {
    const nlpService = useRef(NLPService.getInstance());
    const registeredCommandIds = useRef<string[]>([]);

    useEffect(() => {
        const service = nlpService.current;
        const currentIds: string[] = [];

        // Cleanup previous commands if dependencies change
        registeredCommandIds.current.forEach(id => {
            service.removeCommandDefinition(id);
        });
        registeredCommandIds.current = [];

        // Register new commands
        commands.forEach((cmd, index) => {
            // Generate a unique ID for dynamic commands, combining a stable prefix with a timestamp or hash
            // This ensures uniqueness across component instances and re-renders while allowing removal.
            const uniqueId = `dynamic_cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`;
            const fullCommand: VoiceCommandDefinition = {
                ...cmd,
                id: uniqueId,
                enabled: cmd.enabled !== false, // Ensure enabled by default if not specified
            };
            service.addCommandDefinition(fullCommand);
            currentIds.push(uniqueId);
            console.log(`useDynamicVoiceCommands: Registered command "${fullCommand.id}" for intent "${fullCommand.intent.name}"`);
        });

        registeredCommandIds.current = currentIds;

        // Cleanup function: unregister commands when the component unmounts
        return () => {
            registeredCommandIds.current.forEach(id => {
                service.removeCommandDefinition(id);
                console.log(`useDynamicVoiceCommands: Unregistered command "${id}"`);
            });
            registeredCommandIds.current = []; // Clear for next mount
        };
    }, [nlpService, ...dependencies]); // Re-run effect if commands or other dependencies change
};