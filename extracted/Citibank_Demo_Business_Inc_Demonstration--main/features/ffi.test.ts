// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { describe, it, expect, vi } from 'vitest';
import { AetherLink } from './ffi';

// --- MOCK WASM BINARY ---
// A minimal WASM module compiled from WAT for testing FFI interactions.
// Exports:
// - memory: WebAssembly.Memory (1 page)
// - greet_str(ptr: i32, len: i32): Calls host.console_log with string from memory
// - trigger_host_abort(msg_ptr: i32, msg_len: i32, file_ptr: i32, file_len: i32): Calls env.abort
// - get_hello_ptr(): Returns pointer to "Hello from WASM!"
// - get_hello_len(): Returns length of "Hello from WASM!"
// - get_abort_msg_ptr(): Returns pointer to "Test abort message"
// - get_abort_msg_len(): Returns length of "Test abort message"
// Data at 0: "Hello from WASM!"
// Data at 16: "Test abort message"
const MOCK_WASM_BINARY = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0b, 0x02, 0x60,
  0x02, 0x7f, 0x7f, 0x00, 0x60, 0x04, 0x7f, 0x7f, 0x7f, 0x7f, 0x00, 0x02,
  0x21, 0x02, 0x04, 0x68, 0x6f, 0x73, 0x74, 0x0b, 0x63, 0x6f, 0x6e, 0x73,
  0x6f, 0x6c, 0x65, 0x5f, 0x6c, 0x6f, 0x67, 0x00, 0x00, 0x03, 0x65, 0x6e,
  0x76, 0x05, 0x61, 0x62, 0x6f, 0x72, 0x74, 0x00, 0x01, 0x03, 0x03, 0x02,
  0x00, 0x04, 0x05, 0x01, 0x70, 0x01, 0x01, 0x05, 0x03, 0x01, 0x00, 0x06,
  0x0c, 0x03, 0x7f, 0x01, 0x41, 0x00, 0x0b, 0x7f, 0x01, 0x41, 0x10, 0x0b,
  0x7f, 0x01, 0x41, 0x12, 0x0b, 0x07, 0x60, 0x05, 0x03, 0x67, 0x72, 0x65,
  0x65, 0x74, 0x5f, 0x73, 0x74, 0x72, 0x00, 0x02, 0x0e, 0x74, 0x72, 0x69,
  0x67, 0x67, 0x65, 0x72, 0x5f, 0x68, 0x6f, 0x73, 0x74, 0x5f, 0x61, 0x62,
  0x6f, 0x72, 0x74, 0x00, 0x03, 0x0d, 0x67, 0x65, 0x74, 0x5f, 0x68, 0x65,
  0x6c, 0x6c, 0x6f, 0x5f, 0x70, 0x74, 0x72, 0x00, 0x04, 0x0d, 0x67, 0x65,
  0x74, 0x5f, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x5f, 0x6c, 0x65, 0x6e, 0x00,
  0x05, 0x12, 0x67, 0x65, 0x74, 0x5f, 0x61, 0x62, 0x6f, 0x72, 0x74, 0x5f,
  0x6d, 0x73, 0x67, 0x5f, 0x70, 0x74, 0x72, 0x00, 0x06, 0x12, 0x67, 0x65,
  0x74, 0x5f, 0x61, 0x62, 0x6f, 0x72, 0x74, 0x5f, 0x6c, 0x65, 0x6e, 0x00,
  0x07, 0x0a, 0x0a, 0x00, 0x20, 0x00, 0x20, 0x01, 0x10, 0x00, 0x0b, 0x0a,
  0x0a, 0x00, 0x20, 0x00, 0x20, 0x01, 0x20, 0x02, 0x20, 0x03, 0x10, 0x01,
  0x0b, 0x0a, 0x03, 0x41, 0x00, 0x0b, 0x0a, 0x03, 0x41, 0x10, 0x0b, 0x0a,
  0x03, 0x41, 0x10, 0x0b, 0x0a, 0x03, 0x41, 0x12, 0x0b, 0x09, 0x01, 0x00,
  0x41, 0x00, 0x0b, 0x10, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x72,
  0x6f, 0x6d, 0x20, 0x57, 0x41, 0x53, 0x4d, 0x21, 0x01, 0x00, 0x41, 0x10,
  0x0b, 0x12, 0x54, 0x65, 0x73, 0x74, 0x20, 0x61, 0x62, 0x6f, 0x72, 0x74,
  0x20, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65,
]);

// --- Helper Functions for WASM Memory Interaction ---

/**
 * Reads a string from WebAssembly memory.
 * Assumes UTF-8 encoding.
 * @param memory The WebAssembly.Memory object.
 * @param ptr The starting address (pointer) in memory.
 * @param len The length of the string in bytes.
 * @returns The decoded string.
 */
export function readWasmString(memory: WebAssembly.Memory, ptr: number, len: number): string {
    const decoder = new TextDecoder('utf-8');
    const view = new Uint8Array(memory.buffer, ptr, len);
    return decoder.decode(view);
}

/**
 * Writes a string to WebAssembly memory.
 * Assumes UTF-8 encoding.
 * Expands memory if needed (not implemented in this helper, usually handled by WASM or main host).
 * Returns the pointer and length of the written string.
 * @param memory The WebAssembly.Memory object.
 * @param str The string to write.
 * @param startPtr Optional starting address. If not provided, attempts to write at an arbitrary offset.
 * @returns An object with { ptr, len } of the written string.
 * @throws If there is not enough WASM memory.
 */
export function writeWasmString(memory: WebAssembly.Memory, str: string, startPtr: number = 200): { ptr: number; len: number } {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    
    // Ensure there's enough space. In a real scenario, WASM would export an allocation function.
    if (startPtr + encoded.byteLength > memory.buffer.byteLength) {
        // In a real application, memory might be grown or a proper allocator used.
        // For testing, we keep it simple.
        throw new Error(`Not enough WASM memory to write string at offset ${startPtr}. Needed ${encoded.byteLength} bytes, have ${memory.buffer.byteLength - startPtr} available.`);
    }

    const view = new Uint8Array(memory.buffer, startPtr, encoded.byteLength);
    view.set(encoded);
    return { ptr: startPtr, len: encoded.byteLength };
}

/**
 * Helper to ensure AetherLink functions can access WASM memory within test environment.
 * This function modifies the AetherLink instance to provide memory-aware FFI functions.
 * In a real AetherLink implementation (in ffi.ts), it would have its own internal
 * mechanism to access `WebAssembly.Memory` (e.g., via a `setMemory` method or constructor param).
 * For this test, we use `vi.spyOn` to replace `createImportObject`'s returned functions
 * with versions that explicitly use the provided `memory` and `readWasmString` helper.
 * This allows comprehensive testing without modifying `AetherLink`'s external interface in `ffi.ts`.
 * @param aetherLink The AetherLink instance.
 * @param memory The WebAssembly.Memory object to bind for FFI function execution.
 */
function attachMemoryToAetherLink(aetherLink: AetherLink, memory: WebAssembly.Memory) {
    // We spy on createImportObject to return functions that are memory-aware.
    // This allows the test environment to control how AetherLink's FFI functions
    // interact with WASM memory.
    vi.spyOn(aetherLink, 'createImportObject').and.returnValue({
        host: {
            console_log: (ptr: number, len: number) => {
                const message = readWasmString(memory, ptr, len);
                console.log(message);
            },
            // Add other potential host functions here if they existed in ffi.ts
            // e.g., read_data: (ptr: number, len: number) => { /* ... */ },
            // write_data: (ptr: number, len: number, value: number[]) => { /* ... */ },
        },
        env: {
            abort: (msg_ptr: number, msg_len: number, file_ptr: number, file_len: number) => {
                const message = readWasmString(memory, msg_ptr, msg_len);
                // For simplicity, file info is not fully processed here for the error message,
                // but could be by reading from file_ptr, file_len.
                throw new Error(`WASM Abort: ${message}`);
            },
        },
    });
}


// --- Original AetherLink FFI Tests ---
describe('AetherLink FFI', () => {
    it('should create an import object with host and env properties', () => {
        const aetherLink = new AetherLink();
        const importObject = aetherLink.createImportObject();

        expect(importObject).toHaveProperty('host');
        expect(importObject.host).toHaveProperty('console_log');
        expect(importObject).toHaveProperty('env');
        expect(importObject.env).toHaveProperty('abort');
    });

    describe('Host Function Behavior (console_log)', () => {
        let aetherLink: AetherLink;
        let consoleSpy: ReturnType<typeof vi.spyOn>;
        let wasmInstance: WebAssembly.Instance;
        let wasmMemory: WebAssembly.Memory;

        beforeEach(async () => {
            consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            aetherLink = new AetherLink();
            
            // Temporarily mock createImportObject before WASM instantiation to control FFI behavior.
            const initialImportObject = aetherLink.createImportObject(); // Call once for the spy to work
            const { instance } = await WebAssembly.instantiate(MOCK_WASM_BINARY, initialImportObject);
            wasmInstance = instance;
            wasmMemory = instance.exports.memory as WebAssembly.Memory;

            // Now, make AetherLink's FFI functions memory-aware using the actual WASM memory.
            attachMemoryToAetherLink(aetherLink, wasmMemory);
        });

        afterEach(() => {
            consoleSpy.mockRestore();
            vi.restoreAllMocks(); // Restore any spies on aetherLink.createImportObject
        });

        it('should call console.log with the correct string from WASM memory', async () => {
            const helloPtr = (wasmInstance.exports as any).get_hello_ptr();
            const helloLen = (wasmInstance.exports as any).get_hello_len();

            // Call WASM function that uses host.console_log
            (wasmInstance.exports as any).greet_str(helloPtr, helloLen);

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith('Hello from WASM!');
        });

        it('should allow writing a string to WASM memory and logging it', async () => {
            const customMessage = 'AetherLink is super cool!';
            // Write a string to an arbitrary free spot in WASM memory (offset 100).
            const { ptr, len } = writeWasmString(wasmMemory, customMessage, 100);

            // Call WASM function that uses host.console_log
            (wasmInstance.exports as any).greet_str(ptr, len);

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(customMessage);
        });
    });

    describe('Environment Function Behavior (abort)', () => {
        let aetherLink: AetherLink;
        let wasmInstance: WebAssembly.Instance;
        let wasmMemory: WebAssembly.Memory;

        beforeEach(async () => {
            aetherLink = new AetherLink();

            // Temporarily mock createImportObject before WASM instantiation to control FFI behavior.
            const initialImportObject = aetherLink.createImportObject();
            const { instance } = await WebAssembly.instantiate(MOCK_WASM_BINARY, initialImportObject);
            wasmInstance = instance;
            wasmMemory = instance.exports.memory as WebAssembly.Memory;

            // Now, make AetherLink's FFI functions memory-aware using the actual WASM memory.
            attachMemoryToAetherLink(aetherLink, wasmMemory);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should throw an error when WASM calls env.abort with correct message', async () => {
            const abortMsgPtr = (wasmInstance.exports as any).get_abort_msg_ptr();
            const abortMsgLen = (wasmInstance.exports as any).get_abort_msg_len();
            const filePtr = 0; // Simulate file path at ptr 0
            const fileLen = 16; // Length of "Hello from WASM!" acting as filename

            // Expect the call to trigger_host_abort to throw
            await expect(async () => {
                (wasmInstance.exports as any).trigger_host_abort(abortMsgPtr, abortMsgLen, filePtr, fileLen);
            }).rejects.toThrow('WASM Abort: Test abort message'); // We defined "Test abort message" in WASM binary.
        });
    });
});

/**
 * AetherLinkWasmModule class for higher-level interaction with a WASM module.
 * This class encapsulates the instantiation and provides utilities for
 * calling exported functions, and reading/writing to WASM memory.
 * It uses an AetherLink instance to provide the FFI.
 */
export class AetherLinkWasmModule {
    private instance: WebAssembly.Instance;
    private memory: WebAssembly.Memory;
    private exports: WebAssembly.Exports & { [key: string]: Function | WebAssembly.Memory };
    private aetherLink: AetherLink;

    constructor(wasmBinary: Uint8Array, aetherLinkInstance: AetherLink) {
        this.aetherLink = aetherLinkInstance;
        
        // Before instantiating WASM, we need to ensure AetherLink's import object
        // is prepared. The attachMemoryToAetherLink helper is used to make AetherLink's
        // FFI functions memory-aware for the upcoming WASM instantiation.
        // We initially call `createImportObject` without fully attached memory;
        // then the spy applied by `attachMemoryToAetherLink` will ensure subsequent
        // calls to `createImportObject` (or implicitly from the spied one) return
        // the memory-aware functions.
        // A dummy memory is passed initially to satisfy the signature before the actual
        // WASM memory is available. The `attachMemoryToAetherLink` spy will update this.
        attachMemoryToAetherLink(this.aetherLink, {} as WebAssembly.Memory); 
        
        const importObject = this.aetherLink.createImportObject();
        
        // Instantiate synchronously for simpler test setup, but could be async
        const module = new WebAssembly.Module(wasmBinary);
        const instance = new WebAssembly.Instance(module, importObject);
        this.instance = instance;
        this.exports = instance.exports as WebAssembly.Exports & { [key: string]: Function | WebAssembly.Memory };
        this.memory = this.exports.memory as WebAssembly.Memory;

        // Re-apply `attachMemoryToAetherLink` with the *actual* WASM memory.
        // This ensures the FFI functions obtained through `aetherLink.createImportObject()`
        // (which is spied) now correctly reference the instantiated module's memory.
        attachMemoryToAetherLink(this.aetherLink, this.memory);
    }

    /**
     * Calls an exported WASM function by name with given arguments.
     * @param funcName The name of the exported function.
     * @param args Arguments to pass to the WASM function.
     * @returns The result of the WASM function call.
     * @throws If the exported function is not found or is not callable.
     */
    callExport(funcName: string, ...args: any[]): any {
        if (typeof this.exports[funcName] === 'function') {
            return (this.exports[funcName] as Function)(...args);
        }
        throw new Error(`Exported function "${funcName}" not found or is not a function.`);
    }

    /**
     * Reads a string from the WASM module's memory.
     * @param ptr The starting address (pointer) in memory.
     * @param len The length of the string in bytes.
     * @returns The decoded string.
     */
    readString(ptr: number, len: number): string {
        return readWasmString(this.memory, ptr, len);
    }

    /**
     * Writes a string to the WASM module's memory.
     * @param str The string to write.
     * @param startPtr Optional starting address.
     * @returns An object with { ptr, len } of the written string.
     */
    writeString(str: string, startPtr?: number): { ptr: number; len: number } {
        return writeWasmString(this.memory, str, startPtr);
    }

    /**
     * Gets the raw WebAssembly.Memory object.
     * @returns The WebAssembly.Memory instance.
     */
    getMemory(): WebAssembly.Memory {
        return this.memory;
    }

    /**
     * Gets all exported functions and memory from the WASM module.
     * @returns An object containing all WASM exports.
     */
    getExports(): WebAssembly.Exports & { [key: string]: Function | WebAssembly.Memory } {
        return this.exports;
    }
}

// --- New Tests for AetherLinkWasmModule ---
describe('AetherLinkWasmModule', () => {
    let aetherLink: AetherLink;
    let wasmController: AetherLinkWasmModule;
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        aetherLink = new AetherLink();
        // AetherLinkWasmModule constructor handles the attachMemoryToAetherLink
        wasmController = new AetherLinkWasmModule(MOCK_WASM_BINARY, aetherLink);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        vi.restoreAllMocks();
    });

    it('should instantiate and provide access to WASM exports', () => {
        expect(wasmController).toBeInstanceOf(AetherLinkWasmModule);
        expect(wasmController.getExports()).toHaveProperty('greet_str');
        expect(wasmController.getExports()).toHaveProperty('memory');
    });

    it('should correctly call WASM functions that interact with host.console_log', () => {
        const helloPtr = wasmController.callExport('get_hello_ptr');
        const helloLen = wasmController.callExport('get_hello_len');

        wasmController.callExport('greet_str', helloPtr, helloLen);

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('Hello from WASM!');
    });

    it('should correctly read and write strings to WASM memory', () => {
        const testString = 'Hello from AetherLink!';
        // Write at offset 200, assuming it's free.
        const { ptr, len } = wasmController.writeString(testString, 200); 

        const readBackString = wasmController.readString(ptr, len);
        expect(readBackString).toEqual(testString);
    });

    it('should propagate errors from env.abort correctly', async () => {
        const abortMsgPtr = wasmController.callExport('get_abort_msg_ptr');
        const abortMsgLen = wasmController.callExport('get_abort_msg_len');
        const filePtr = 0; // Simulate file path at ptr 0
        const fileLen = 16; // Length of "Hello from WASM!" acting as filename

        await expect(async () => {
            wasmController.callExport('trigger_host_abort', abortMsgPtr, abortMsgLen, filePtr, fileLen);
        }).rejects.toThrow('WASM Abort: Test abort message');
    });

    it('should handle calling a non-existent WASM export gracefully', () => {
        expect(() => wasmController.callExport('non_existent_func'))
            .toThrow('Exported function "non_existent_func" not found or is not a function.');
    });

    it('should have a memory accessible via getMemory()', () => {
        const memory = wasmController.getMemory();
        expect(memory).toBeInstanceOf(WebAssembly.Memory);
        expect(memory.buffer.byteLength).toBeGreaterThan(0);
    });
});

// --- Additional Utility Classes / Functions for Advanced Scenarios ---

/**
 * Represents a basic logger for WASM modules.
 * This class could be used to extend the `host` imports with structured logging,
 * beyond just `console_log`.
 * For example, sending logs to a remote service, or categorizing messages.
 */
export class WasmLogger {
    private logs: string[] = [];
    private prefix: string;

    constructor(prefix: string = "[WASM]") {
        this.prefix = prefix;
    }

    /**
     * Logs a message with a specific level.
     * @param level The log level (e.g., "INFO", "WARN", "ERROR").
     * @param message The message to log.
     */
    logMessage(level: string, message: string) {
        const formattedMessage = `${this.prefix} [${level}] ${message}`;
        this.logs.push(formattedMessage);
        console.log(formattedMessage); // Also log to console for visibility
    }

    /**
     * Gets all captured logs.
     * @returns An array of log strings.
     */
    getLogs(): string[] {
        return [...this.logs];
    }

    /**
     * Clears all captured logs.
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Provides an import object for advanced logging capabilities.
     * This method could be integrated into AetherLink's import object creation.
     * @param memoryGetter A function that returns the WebAssembly.Memory instance.
     *                     This is a common pattern for host functions needing memory access.
     * @returns A WebAssembly.Imports object containing logging functions.
     */
    createLoggingImportObject(memoryGetter: () => WebAssembly.Memory | undefined): WebAssembly.Imports {
        const _this = this; // Capture 'this' for arrow functions to access `logMessage`
        return {
            host_logging: {
                log_info: (ptr: number, len: number) => {
                    const memory = memoryGetter();
                    if (memory) {
                        _this.logMessage("INFO", readWasmString(memory, ptr, len));
                    } else {
                        console.error("WasmLogger: Memory not available for log_info");
                    }
                },
                log_error: (ptr: number, len: number) => {
                    const memory = memoryGetter();
                    if (memory) {
                        _this.logMessage("ERROR", readWasmString(memory, ptr, len));
                    } else {
                        console.error("WasmLogger: Memory not available for log_error");
                    }
                },
                // Potentially more sophisticated logging functions, e.g., with metadata
            }
        };
    }
}

// --- New Tests for WasmLogger Integration ---
describe('WasmLogger Integration with AetherLink and WASM', () => {
    let aetherLink: AetherLink;
    let wasmController: AetherLinkWasmModule;
    let wasmLogger: WasmLogger;
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    // We need a WASM binary that calls `host_logging.log_info` and `log_error`.
    // This is a new mock WASM binary that includes these imports and string data for logs.
    // Original WASM data: "Hello from WASM!" (0, 16) "Test abort message" (16, 18)
    // New WASM data added: "INFO" (32, 4), "ERROR" (36, 5)
    // Exports: get_info_p (returns 32), get_info_l (returns 4), log_info_m (calls host_logging.log_info)
    const MOCK_WASM_WITH_LOGGING_BINARY = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0b, 0x02, 0x60,
        0x02, 0x7f, 0x7f, 0x00, 0x60, 0x04, 0x7f, 0x7f, 0x7f, 0x7f, 0x00, 0x02,
        0x2d, 0x03, 0x04, 0x68, 0x6f, 0x73, 0x74, 0x0b, 0x63, 0x6f, 0x6e, 0x73,
        0x6f, 0x6c, 0x65, 0x5f, 0x6c, 0x6f, 0x67, 0x00, 0x00, 0x03, 0x65, 0x6e,
        0x76, 0x05, 0x61, 0x62, 0x6f, 0x72, 0x74, 0x00, 0x01, 0x0c, 0x68, 0x6f,
        0x73, 0x74, 0x5f, 0x6c, 0x6f, 0x67, 0x67, 0x69, 0x6e, 0x67, 0x08, 0x6c,
        0x6f, 0x67, 0x5f, 0x69, 0x6e, 0x66, 0x6f, 0x00, 0x02, 0x0c, 0x68, 0x6f,
        0x73, 0x74, 0x5f, 0x6c, 0x6f, 0x67, 0x67, 0x69, 0x6e, 0x67, 0x09, 0x6c,
        0x6f, 0x67, 0x5f, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x00, 0x00, 0x03, 0x03,
        0x02, 0x00, 0x04, 0x05, 0x01, 0x70, 0x01, 0x01, 0x05, 0x03, 0x01, 0x00,
        0x06, 0x14, 0x05, 0x7f, 0x01, 0x41, 0x00, 0x0b, 0x7f, 0x01, 0x41, 0x10,
        0x0b, 0x7f, 0x01, 0x41, 0x12, 0x0b, 0x7f, 0x01, 0x41, 0x20, 0x0b, 0x7f,
        0x01, 0x41, 0x24, 0x0b, 0x07, 0x64, 0x05, 0x03, 0x67, 0x72, 0x65, 0x65,
        0x74, 0x5f, 0x73, 0x74, 0x72, 0x00, 0x02, 0x0e, 0x74, 0x72, 0x69, 0x67,
        0x67, 0x65, 0x72, 0x5f, 0x68, 0x6f, 0x73, 0x74, 0x5f, 0x61, 0x62, 0x6f,
        0x72, 0x74, 0x00, 0x03, 0x0a, 0x6c, 0x6f, 0x67, 0x5f, 0x69, 0x6e, 0x66,
        0x6f, 0x5f, 0x6d, 0x00, 0x04, 0x0b, 0x6c, 0x6f, 0x67, 0x5f, 0x65, 0x72,
        0x72, 0x6f, 0x72, 0x5f, 0x6d, 0x00, 0x05, 0x0a, 0x67, 0x65, 0x74, 0x5f,
        0x69, 0x6e, 0x66, 0x6f, 0x5f, 0x70, 0x00, 0x06, 0x0a, 0x67, 0x65, 0x74,
        0x5f, 0x69, 0x6e, 0x66, 0x6f, 0x5f, 0x6c, 0x00, 0x07, 0x0b, 0x67, 0x65,
        0x74, 0x5f, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x5f, 0x70, 0x00, 0x08, 0x0b,
        0x67, 0x65, 0x74, 0x5f, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x5f, 0x6c, 0x00,
        0x09, 0x0a, 0x0a, 0x00, 0x20, 0x00, 0x20, 0x01, 0x10, 0x00, 0x0b, 0x0a,
        0x0a, 0x00, 0x20, 0x00, 0x20, 0x01, 0x20, 0x02, 0x20, 0x03, 0x10, 0x01,
        0x0b, 0x0a, 0x0a, 0x00, 0x20, 0x00, 0x20, 0x01, 0x10, 0x02, 0x0b, 0x0a,
        0x0a, 0x00, 0x20, 0x00, 0x20, 0x01, 0x10, 0x03, 0x0b, 0x0a, 0x03, 0x41,
        0x20, 0x0b, 0x0a, 0x03, 0x41, 0x04, 0x0b, 0x0a, 0x03, 0x41, 0x24, 0x0b,
        0x0a, 0x03, 0x41, 0x04, 0x0b, 0x09, 0x01, 0x00, 0x41, 0x00, 0x0b, 0x10,
        0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x66, 0x72, 0x6f, 0x6d, 0x20, 0x57,
        0x41, 0x53, 0x4d, 0x21, 0x01, 0x00, 0x41, 0x10, 0x0b, 0x12, 0x54, 0x65,
        0x73, 0x74, 0x20, 0x61, 0x62, 0x6f, 0x72, 0x74, 0x20, 0x6d, 0x65, 0x73,
        0x73, 0x61, 0x67, 0x65, 0x01, 0x00, 0x41, 0x20, 0x0b, 0x04, 0x49, 0x4e,
        0x46, 0x4f, 0x01, 0x00, 0x41, 0x24, 0x0b, 0x05, 0x45, 0x52, 0x52, 0x4f,
        0x52,
    ]);
    
    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        aetherLink = new AetherLink();
        wasmLogger = new WasmLogger("AppLogger");

        // Merge AetherLink's imports with WasmLogger's imports for WASM instantiation.
        // We need to spy on `aetherLink.createImportObject` to ensure its functions
        // are memory-aware, and then manually merge with the logger's imports.
        vi.spyOn(aetherLink, 'createImportObject').and.callThrough(); // allow original behavior but also observe

        // AetherLinkWasmModule constructor will call aetherLink.createImportObject,
        // so we need to prepare the mock behavior *before* its constructor runs.
        const originalAetherLinkCreateImportObject = aetherLink.createImportObject.bind(aetherLink);
        vi.spyOn(aetherLink, 'createImportObject').and.callFake(() => {
            const baseImports = originalAetherLinkCreateImportObject();
            return {
                ...baseImports,
                ...wasmLogger.createLoggingImportObject(() => wasmController?.getMemory()),
            };
        });

        wasmController = new AetherLinkWasmModule(MOCK_WASM_WITH_LOGGING_BINARY, aetherLink);
        
        // After instantiation, ensure AetherLink's internal FFI functions also have access to memory.
        // This re-calls attachMemoryToAetherLink with the actual memory, updating the spy's behavior
        // to use the real WASM memory for string conversions.
        attachMemoryToAetherLink(aetherLink, wasmController.getMemory());

        wasmLogger.clearLogs(); // Clear any logs from setup
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        vi.restoreAllMocks();
    });

    it('should correctly log info messages from WASM using WasmLogger', () => {
        // These pointers/lengths point to the "INFO" string and its length within the WASM binary itself.
        const logDataPtr = 32; 
        const logDataLen = 4; 

        // Call the WASM function that logs an info message
        (wasmController.getExports() as any).log_info_m(logDataPtr, logDataLen);

        expect(wasmLogger.getLogs()).toContain("[AppLogger] [INFO] INFO");
        expect(consoleSpy).toHaveBeenCalledWith("[AppLogger] [INFO] INFO");
    });

    it('should correctly log error messages from WASM using WasmLogger', () => {
        // These pointers/lengths point to the "ERROR" string and its length within the WASM binary itself.
        const errorDataPtr = 36;
        const errorDataLen = 5;

        (wasmController.getExports() as any).log_error_m(errorDataPtr, errorDataLen);

        expect(wasmLogger.getLogs()).toContain("[AppLogger] [ERROR] ERROR");
        expect(consoleSpy).toHaveBeenCalledWith("[AppLogger] [ERROR] ERROR");
    });

    it('should maintain separate log history for WasmLogger', () => {
        expect(wasmLogger.getLogs()).toHaveLength(0); // Should be clear from beforeEach

        const infoDataPtr = 32;
        const infoDataLen = 4;
        wasmController.callExport('log_info_m', infoDataPtr, infoDataLen);
        expect(wasmLogger.getLogs()).toHaveLength(1);

        wasmLogger.clearLogs();
        expect(wasmLogger.getLogs()).toHaveLength(0);
    });
});

// --- Export any new top-level functions, classes, or variables ---
export { MOCK_WASM_BINARY, readWasmString, writeWasmString };