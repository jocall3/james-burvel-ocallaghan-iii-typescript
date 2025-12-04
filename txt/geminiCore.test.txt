// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ai, generateContent, generateJson, streamContent } from './geminiCore';

// Mock the @google/genai library
// This mock ensures that we don't make actual API calls during tests
// and can control the responses for various scenarios.
vi.mock('@google/genai', () => {
    const mockGenerateContent = vi.fn();
    const mockGenerateContentStream = vi.fn();
    // Mock the GoogleGenAI class constructor
    const GoogleGenAI = vi.fn(() => ({
        models: {
            // Mock specific methods used by geminiCore
            generateContent: mockGenerateContent,
            generateContentStream: mockGenerateContentStream,
        },
    }));
    // We export GoogleGenAI and an empty Type object.
    // Type is often used for type definitions from the library,
    // but for runtime mocking, the class itself is sufficient.
    return { GoogleGenAI, Type: {} };
});

// Create spies on the mocked functions.
// This allows us to assert on their calls and control their return values.
const mockGenerateContent = vi.spyOn(ai.models, 'generateContent');
const mockGenerateContentStream = vi.spyOn(ai.models, 'generateContentStream');

describe('geminiCore', () => {
    // Before each test, clear all mock calls and reset their behavior.
    // This ensures tests are isolated and don't affect each other.
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock implementations to their original (mocked) state
        // This is crucial if a test specifically changed an implementation
        // e.g., mockImplementationOnce, mockImplementation
        mockGenerateContent.mockRestore();
        mockGenerateContentStream.mockRestore();
    });

    describe('generateContent', () => {
        it('should call the Gemini API and return the text content', async () => {
            const expectedResponse = 'This is a test response.';
            mockGenerateContent.mockResolvedValue({
                text: expectedResponse
            });

            const result = await generateContent('test prompt', 'test instruction');

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'test prompt',
                config: {
                    systemInstruction: 'test instruction',
                    temperature: 0.5,
                },
            });
            expect(result).toBe(expectedResponse);
        });

        it('should use default system instruction and temperature when not provided', async () => {
            const expectedResponse = 'Default content.';
            mockGenerateContent.mockResolvedValue({
                text: expectedResponse
            });

            const result = await generateContent('default prompt'); // No instruction or config provided

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'default prompt',
                config: {
                    systemInstruction: '', // Default in geminiCore
                    temperature: 0.5,      // Default in geminiCore
                },
            });
            expect(result).toBe(expectedResponse);
        });

        it('should allow custom model, instruction, and temperature', async () => {
            const expectedResponse = 'Custom settings response.';
            mockGenerateContent.mockResolvedValue({
                text: expectedResponse
            });

            const result = await generateContent(
                'custom prompt',
                'custom instruction',
                { model: 'gemini-1.5-pro', temperature: 0.9 }
            );

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-1.5-pro',
                contents: 'custom prompt',
                config: {
                    systemInstruction: 'custom instruction',
                    temperature: 0.9,
                },
            });
            expect(result).toBe(expectedResponse);
        });

        it('should handle API errors gracefully', async () => {
            const errorMessage = 'API error occurred';
            mockGenerateContent.mockRejectedValue(new Error(errorMessage));

            await expect(generateContent('error prompt')).rejects.toThrow(errorMessage);
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });

        it('should return empty string if API response text is undefined or null', async () => {
            mockGenerateContent.mockResolvedValue({ text: undefined });
            const resultUndefined = await generateContent('prompt');
            expect(resultUndefined).toBe('');

            mockGenerateContent.mockResolvedValue({ text: null });
            const resultNull = await generateContent('prompt');
            expect(resultNull).toBe('');

            expect(mockGenerateContent).toHaveBeenCalledTimes(2);
        });
    });

    describe('generateJson', () => {
        it('should call the Gemini API and return parsed JSON', async () => {
            const mockResponse = { name: 'test', value: 123 };
            mockGenerateContent.mockResolvedValue({
                text: JSON.stringify(mockResponse)
            });

            const schema = {
                type: 'object',
                properties: { name: { type: 'string' }, value: { type: 'number' } },
                required: ['name', 'value']
            };
            const result = await generateJson('json prompt', 'json instruction', schema);

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'json prompt',
                config: {
                    systemInstruction: 'json instruction',
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature: 0.2,
                },
            });
            expect(result).toEqual(mockResponse);
        });

        it('should use default instruction and temperature for JSON generation', async () => {
            const mockResponse = { success: true };
            mockGenerateContent.mockResolvedValue({
                text: JSON.stringify(mockResponse)
            });

            const result = await generateJson('default json prompt'); // No instruction or config

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'default json prompt',
                config: {
                    systemInstruction: '', // Default in geminiCore
                    responseMimeType: 'application/json',
                    responseSchema: undefined, // No schema provided
                    temperature: 0.2,          // Default in geminiCore for JSON
                },
            });
            expect(result).toEqual(mockResponse);
        });

        it('should allow custom model, instruction, and temperature for JSON generation', async () => {
            const mockResponse = { status: 'OK' };
            mockGenerateContent.mockResolvedValue({
                text: JSON.stringify(mockResponse)
            });

            const result = await generateJson(
                'custom json prompt',
                'custom json instruction',
                undefined, // No schema
                { model: 'gemini-1.5-flash', temperature: 0.8 }
            );

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-1.5-flash',
                contents: 'custom json prompt',
                config: {
                    systemInstruction: 'custom json instruction',
                    responseMimeType: 'application/json',
                    responseSchema: undefined,
                    temperature: 0.8,
                },
            });
            expect(result).toEqual(mockResponse);
        });

        it('should handle API errors during JSON generation', async () => {
            const errorMessage = 'JSON API error';
            mockGenerateContent.mockRejectedValue(new Error(errorMessage));

            await expect(generateJson('json error prompt')).rejects.toThrow(errorMessage);
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API returns invalid JSON', async () => {
            mockGenerateContent.mockResolvedValue({
                text: '{ "malformed": true, }' // Invalid JSON
            });

            await expect(generateJson('invalid json prompt')).rejects.toThrow('Failed to parse JSON response');
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });

        it('should handle empty or non-string API response text for JSON generation', async () => {
            mockGenerateContent.mockResolvedValue({ text: undefined });
            await expect(generateJson('empty json text')).rejects.toThrow('Failed to parse JSON response');
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);

            mockGenerateContent.mockResolvedValue({ text: null });
            await expect(generateJson('null json text')).rejects.toThrow('Failed to parse JSON response');
            expect(mockGenerateContent).toHaveBeenCalledTimes(2);
        });
    });

    describe('streamContent', () => {
        it('should yield text chunks from the Gemini API stream', async () => {
            async function* mockStream() {
                yield { text: 'Hello ' };
                yield { text: 'world' };
                yield { text: '!' };
            }
            mockGenerateContentStream.mockResolvedValue(mockStream());

            const stream = streamContent('stream prompt', 'stream instruction');

            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            expect(mockGenerateContentStream).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'stream prompt',
                config: {
                    systemInstruction: 'stream instruction',
                    temperature: 0.5,
                },
            });
            expect(chunks).toEqual(['Hello ', 'world', '!']);
        });

        it('should handle an empty stream gracefully', async () => {
            async function* mockEmptyStream() {
                // Yield nothing
            }
            mockGenerateContentStream.mockResolvedValue(mockEmptyStream());

            const stream = streamContent('empty stream prompt');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
            expect(chunks).toEqual([]);
        });

        it('should use default instruction and temperature for streaming', async () => {
            async function* mockStream() {
                yield { text: 'Default stream.' };
            }
            mockGenerateContentStream.mockResolvedValue(mockStream());

            const stream = streamContent('default stream prompt');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            expect(mockGenerateContentStream).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'default stream prompt',
                config: {
                    systemInstruction: '', // Default in geminiCore
                    temperature: 0.5,      // Default in geminiCore
                },
            });
            expect(chunks).toEqual(['Default stream.']);
        });

        it('should allow custom model, instruction, and temperature for streaming', async () => {
            async function* mockStream() {
                yield { text: 'Custom stream.' };
            }
            mockGenerateContentStream.mockResolvedValue(mockStream());

            const stream = streamContent(
                'custom stream prompt',
                'custom stream instruction',
                { model: 'gemini-1.5-pro', temperature: 0.9 }
            );
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            expect(mockGenerateContentStream).toHaveBeenCalledWith({
                model: 'gemini-1.5-pro',
                contents: 'custom stream prompt',
                config: {
                    systemInstruction: 'custom stream instruction',
                    temperature: 0.9,
                },
            });
            expect(chunks).toEqual(['Custom stream.']);
        });

        it('should handle API errors during stream initialization', async () => {
            const errorMessage = 'Stream API error';
            mockGenerateContentStream.mockRejectedValue(new Error(errorMessage));

            const stream = streamContent('error stream prompt');
            await expect(async () => {
                for await (const chunk of stream) {
                    // This loop will trigger the error
                }
            }).rejects.toThrow(errorMessage);
            expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
        });

        it('should handle errors occurring mid-stream', async () => {
            async function* mockErrorStream() {
                yield { text: 'Part 1 ' };
                yield { text: 'Part 2 ' };
                throw new Error('Mid-stream error');
                yield { text: 'Part 3 ' }; // This should not be reached
            }
            mockGenerateContentStream.mockResolvedValue(mockErrorStream());

            const stream = streamContent('mid-error stream prompt');
            const chunks = [];
            await expect(async () => {
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
            }).rejects.toThrow('Mid-stream error');

            expect(chunks).toEqual(['Part 1 ', 'Part 2 ']); // Ensure chunks up to the error are collected
            expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
        });

        it('should filter out non-text parts from the stream', async () => {
            async function* mockMixedStream() {
                yield { text: 'Hello' };
                yield { anotherProp: 'should be ignored' }; // Non-text part
                yield { text: ' World' };
                yield { metadata: { tokenCount: 5 } }; // Another non-text part
            }
            mockGenerateContentStream.mockResolvedValue(mockMixedStream());

            const stream = streamContent('mixed stream prompt');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            expect(chunks).toEqual(['Hello', ' World']);
            expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
        });
    });
});