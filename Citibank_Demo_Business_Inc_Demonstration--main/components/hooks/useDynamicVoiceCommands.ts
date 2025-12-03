/**
 * This module provides the `useDynamicVoiceCommands` React hook, a critical component for enabling agentic AI systems
 * to dynamically adapt human-computer interaction contexts. It allows any UI component to register
 * and unregister voice commands based on its current state and user focus. This capability is foundational
 * for building responsive and intuitive financial applications that leverage natural language processing.
 *
 * Business value: This hook is worth millions by dramatically enhancing operational efficiency and user experience
 * in complex financial applications. It transforms static interfaces into dynamic, voice-driven workflows,
 * reducing cognitive load, accelerating data entry and command execution, and minimizing errors in high-stakes environments.
 * This capability unlocks new levels of productivity for financial agents, traders, and operations staff,
 * enabling hands-free control of sophisticated systems. It fosters rapid adoption of AI-driven tools,
 * ensures regulatory compliance through precise command interpretation, and establishes a competitive advantage
 * by offering a truly cutting-edge, intuitive interaction paradigm, ultimately driving significant cost savings
 * through automation and opening avenues for novel service offerings built on seamless human-AI collaboration.
 */
import { useEffect, useRef } from 'react';
import { VoiceCommandDefinition, NLPService } from '../VoiceControl';

/**
 * Generates a stable, content-based ID for a voice command.
 * This ID is derived from the command's key properties to ensure consistency across renders
 * and facilitate traceability and potential future conflict resolution within the NLPService.
 * It is designed to be deterministic for the same command input, aiding in idempotency
 * and efficient command management.
 *
 * @param command The voice command definition (excluding the ID) for which to generate a stable identifier.
 * @returns A stable string ID derived from the command's core properties.
 */
export const generateStableVoiceCommandId = (command: Omit<VoiceCommandDefinition, 'id'>): string => {
    const commandSignature = JSON.stringify({
        intentName: command.intent.name,
        utterances: command.utterances.sort(),
        handlerType: typeof command.handler,
    });

    let hash = 0;
    for (let i = 0; i < commandSignature.length; i++) {
        const char = commandSignature.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `voice_cmd_stable_${Math.abs(hash).toString(36)}`;
};

/**
 * A React hook for dynamically registering and unregistering voice commands with the central NLPService.
 * This mechanism allows components to define context-specific voice interactions that are
 * automatically activated when the component is mounted and deactivated upon unmount.
 * This ensures that the voice command landscape remains clean and relevant to the user's current context.
 *
 * @param commands An array of VoiceCommandDefinition objects to register. These commands will be active
 *                 as long as the component using this hook is mounted and the dependencies are stable.
 *                 The 'id' property is omitted as it will be generated internally for dynamic management.
 * @param dependencies Optional: Dependency array for when to re-register commands. If commands
 *                     or other specified dependencies change, previously registered commands
 *                     will be unregistered and new ones registered.
 */
export const useDynamicVoiceCommands = (
    commands: Omit<VoiceCommandDefinition, 'id'>[],
    dependencies: React.DependencyList = []
): void => {
    const nlpService = useRef(NLPService.getInstance());
    const registeredCommandIds = useRef<string[]>([]);

    useEffect(() => {
        const service = nlpService.current;
        const currentIds: string[] = [];

        registeredCommandIds.current.forEach(id => {
            try {
                service.removeCommandDefinition(id);
            } catch (error) {
                console.error(`Error during dynamic command unregistration (cleanup phase) for ID ${id}:`, error);
            }
        });
        registeredCommandIds.current = [];

        commands.forEach((cmd, index) => {
            const stableBaseId = generateStableVoiceCommandId(cmd);
            const uniqueInstanceId = `${stableBaseId}_dynamic_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}_${index}`;
            const fullCommand: VoiceCommandDefinition = {
                ...cmd,
                id: uniqueInstanceId,
                enabled: cmd.enabled !== false,
            };
            try {
                service.addCommandDefinition(fullCommand);
                currentIds.push(uniqueInstanceId);
            } catch (error) {
                console.error(`Error during dynamic command registration for intent "${fullCommand.intent.name}" (ID: ${fullCommand.id}):`, error);
            }
        });

        registeredCommandIds.current = currentIds;

        return () => {
            registeredCommandIds.current.forEach(id => {
                try {
                    service.removeCommandDefinition(id);
                } catch (error) {
                    console.error(`Error during dynamic command unregistration (unmount phase) for ID ${id}:`, error);
                }
            });
            registeredCommandIds.current = [];
        };
    }, [nlpService, ...dependencies, commands]);
};