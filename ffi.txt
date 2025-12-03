/**
 * @fileoverview The AetherLink Foreign Function Interface (FFI).
 * This module acts as the bridge between the sandboxed WebAssembly environment
 * and the JavaScript host (the browser). It facilitates robust, high-performance
 * data exchange and function calls between Wasm and JS.
 */

/**
 * Configuration options for the AetherLink FFI and associated Wasm modules.
 * This allows external systems to provide contextual data to the Wasm environment.
 */
export interface AetherLinkConfig {
    /**
     * A map of key-value pairs representing application-specific settings
     * that Wasm modules might need at runtime.
     * Example: { "api_endpoint": "https://api.example.com", "debug_mode": "true" }
     */
    appSettings?: Record<string, string>;

    /**
     * A logger function that can be used by the FFI for internal diagnostics,
     * separate from Wasm's console_log.
     */
    logger?: (level: 'log' | 'warn' | 'error', message: string, ...args: any[]) => void;

    /**
     * An optional callback function that is invoked when a Wasm module explicitly
     * requests an operation to be performed on the JS host, allowing for custom
     * extensions beyond the built-in FFI functions.
     * @param operationName The name of the operation requested by Wasm.
     * @param payloadJson A JSON string representing the payload for the operation.
     * @returns A promise resolving to a JSON string result or void.
     */
    onHostOperationRequest?: (operationName: string, payloadJson: string) => Promise<string | void>;
}

/**
 * The core AetherLink Foreign Function Interface (FFI) Gateway.
 * Manages memory access, string conversions, and provides host functions
 * callable by the WebAssembly module.
 */
export class AetherLink {
    private wasmInstance: WebAssembly.Instance | null = null;
    private wasmMemory: WebAssembly.Memory | null = null;
    private textDecoder: TextDecoder = new TextDecoder('utf-8');
    private textEncoder: TextEncoder = new TextEncoder();
    private config: AetherLinkConfig;

    // State for asynchronous HTTP requests initiated by Wasm
    private nextHttpRequestId: number = 1;
    private httpResponseCache: Map<number, { status: number; headers: Record<string, string>; body: Uint8Array | null; error: string | null }> = new Map();

    constructor(config: AetherLinkConfig = {}) {
        this.config = {
            logger: (level, message, ...args) => {
                const prefix = `[AetherLink FFI] [${level.toUpperCase()}]`;
                if (level === 'error') console.error(prefix, message, ...args);
                else if (level === 'warn') console.warn(prefix, message, ...args);
                else console.log(prefix, message, ...args);
            },
            ...config,
        };
        this.config.logger!('log', "AetherLink FFI Gateway Initialized.");
    }

    /**
     * Binds the instantiated WebAssembly module and its memory to the FFI gateway.
     * This is crucial for enabling JS to read/write to Wasm memory and to call Wasm exports.
     * This method must be called after the Wasm module has been instantiated.
     * @param instance The WebAssembly.Instance object.
     */
    public setInstance(instance: WebAssembly.Instance) {
        this.wasmInstance = instance;
        // Attempt to get memory from exports, common for Wasm modules
        if (instance.exports.memory instanceof WebAssembly.Memory) {
            this.wasmMemory = instance.exports.memory;
            this.config.logger!('log', "Wasm memory bound successfully.");
        } else {
            this.config.logger!('warn', "Wasm module did not export 'memory'. Memory access might be limited or require manual setting.");
            // If `memory` is not exported, we might still be able to use a separately provided memory
            // but for simplicity, we assume `memory` is exported for direct access.
        }
    }

    /**
     * Provides a direct way to set the WebAssembly.Memory object if it's not
     * available via `instance.exports.memory` or needs to be overridden.
     * @param memory The WebAssembly.Memory object.
     */
    public setMemory(memory: WebAssembly.Memory) {
        this.wasmMemory = memory;
        this.config.logger!('log', "Wasm memory manually set.");
    }

    /**
     * Checks if Wasm memory is available and throws an error if not.
     * @private
     */
    private ensureMemoryAvailable(): WebAssembly.Memory {
        if (!this.wasmMemory) {
            throw new Error("AetherLink Error: Wasm memory not available. Call setInstance() or setMemory() first.");
        }
        return this.wasmMemory;
    }

    /**
     * Reads a UTF-8 string from Wasm memory given a pointer and length.
     * @param ptr The byte offset in Wasm memory where the string starts.
     * @param len The length of the string in bytes.
     * @returns The decoded JavaScript string.
     */
    public readStringFromWasm(ptr: number, len: number): string {
        const memory = this.ensureMemoryAvailable();
        if (ptr < 0 || len < 0 || ptr + len > memory.buffer.byteLength) {
            throw new Error(`AetherLink Error: Invalid memory access for string (ptr: ${ptr}, len: ${len}). Buffer size: ${memory.buffer.byteLength}`);
        }
        const buffer = new Uint8Array(memory.buffer, ptr, len);
        return this.textDecoder.decode(buffer);
    }

    /**
     * Writes a JavaScript string into Wasm memory at a specified pointer.
     * This function allocates memory if `allocate` is an exported Wasm function
     * and `ptr` is not provided. It returns the pointer and length of the written string in Wasm memory.
     * If `ptr` and `maxLen` are provided, it attempts to write into the given region.
     *
     * @param str The JavaScript string to write.
     * @param ptr Optional: The byte offset in Wasm memory to write to.
     * @param maxLen Optional: The maximum length available at `ptr`. If `str` exceeds this, an error is thrown.
     * @returns An object containing `ptr` and `len` of the written string in Wasm memory.
     *          If `ptr` and `maxLen` are provided, returns the provided `ptr` and actual `len`.
     * @throws Error if Wasm memory is not available, or if allocation/writing fails.
     */
    public writeStringToWasm(str: string, ptr?: number, maxLen?: number): { ptr: number, len: number } {
        const memory = this.ensureMemoryAvailable();
        const encoded = this.textEncoder.encode(str);
        const requiredLen = encoded.length;

        let targetPtr: number;
        let targetLen: number;

        if (ptr !== undefined && maxLen !== undefined) {
            // Write into pre-allocated memory
            if (requiredLen > maxLen) {
                throw new Error(`AetherLink Error: String too long for provided memory region (required: ${requiredLen}, available: ${maxLen}).`);
            }
            targetPtr = ptr;
            targetLen = requiredLen;
        } else {
            // Allocate new memory in Wasm
            const allocate = this.wasmInstance?.exports.allocate as ((size: number) => number) | undefined;
            if (typeof allocate !== 'function') {
                throw new Error("AetherLink Error: Wasm module must export an 'allocate' function for dynamic string writing.");
            }
            targetPtr = allocate(requiredLen);
            if (targetPtr === 0) { // Common indicator for allocation failure
                throw new Error(`AetherLink Error: Wasm 'allocate' function returned 0, indicating memory allocation failure for ${requiredLen} bytes.`);
            }
            targetLen = requiredLen;
        }

        if (targetPtr < 0 || targetPtr + targetLen > memory.buffer.byteLength) {
            throw new Error(`AetherLink Error: Invalid memory region for writing string (ptr: ${targetPtr}, len: ${targetLen}). Buffer size: ${memory.buffer.byteLength}`);
        }

        const view = new Uint8Array(memory.buffer);
        view.set(encoded, targetPtr);

        return { ptr: targetPtr, len: targetLen };
    }

    /**
     * Reads a 32-bit unsigned integer from Wasm memory at a given pointer.
     * @param ptr The byte offset in Wasm memory.
     * @returns The 32-bit unsigned integer.
     */
    public readUint32FromWasm(ptr: number): number {
        const memory = this.ensureMemoryAvailable();
        const view = new DataView(memory.buffer);
        if (ptr < 0 || ptr + 4 > memory.buffer.byteLength) {
            throw new Error(`AetherLink Error: Invalid memory access for Uint32 (ptr: ${ptr}). Buffer size: ${memory.buffer.byteLength}`);
        }
        return view.getUint32(ptr, true); // true for little-endian
    }

    /**
     * Writes a 32-bit unsigned integer to Wasm memory at a given pointer.
     * @param ptr The byte offset in Wasm memory.
     * @param value The 32-bit unsigned integer to write.
     */
    public writeUint32ToWasm(ptr: number, value: number): void {
        const memory = this.ensureMemoryAvailable();
        const view = new DataView(memory.buffer);
        if (ptr < 0 || ptr + 4 > memory.buffer.byteLength) {
            throw new Error(`AetherLink Error: Invalid memory access for Uint32 (ptr: ${ptr}). Buffer size: ${memory.buffer.byteLength}`);
        }
        view.setUint32(ptr, value, true); // true for little-endian
    }

    /**
     * Calls an exported function from the Wasm module.
     * Provides a type-safe way to interact with Wasm exports from JS.
     *
     * @param exportName The name of the exported Wasm function.
     * @param args Arguments to pass to the Wasm function.
     * @returns The result of the Wasm function call.
     * @throws Error if the Wasm instance is not set, or the export does not exist/is not a function.
     */
    public callWasmExport<T extends (...args: any[]) => any>(exportName: string, ...args: Parameters<T>): ReturnType<T> {
        if (!this.wasmInstance) {
            throw new Error(`AetherLink Error: Cannot call Wasm export '${exportName}'. Wasm instance not set.`);
        }
        const exportedFunc = this.wasmInstance.exports[exportName];
        if (typeof exportedFunc !== 'function') {
            throw new Error(`AetherLink Error: Wasm module does not export a function named '${exportName}'.`);
        }
        this.config.logger!('log', `Calling Wasm export: ${exportName} with args:`, args);
        return (exportedFunc as T)(...args);
    }

    /**
     * Provides the import object that the WebAssembly module will use to call
     * JavaScript host functions.
     * This object contains various utilities and bridges for Wasm to interact with JS.
     *
     * Wasm modules should define these functions in their import section.
     * Example: `(import "host" "console_log" (func $host_console_log (param i32 i32)))`
     */
    public createImportObject(): WebAssembly.Imports {
        return {
            host: {
                /**
                 * Logs a string message from Wasm to the JS console.
                 * @param ptr Pointer to the string in Wasm memory.
                 * @param len Length of the string.
                 */
                console_log: (ptr: number, len: number) => {
                    try {
                        const message = this.readStringFromWasm(ptr, len);
                        this.config.logger!('log', `[Wasm -> JS]`, message);
                    } catch (e) {
                        this.config.logger!('error', `Error in host.console_log:`, e);
                    }
                },

                /**
                 * Logs an error message from Wasm to the JS console.
                 * @param ptr Pointer to the string in Wasm memory.
                 * @param len Length of the string.
                 */
                console_error: (ptr: number, len: number) => {
                    try {
                        const message = this.readStringFromWasm(ptr, len);
                        this.config.logger!('error', `[Wasm -> JS] ERROR:`, message);
                    } catch (e) {
                        this.config.logger!('error', `Error in host.console_error:`, e);
                    }
                },

                /**
                 * Retrieves a configuration value by key from the AetherLinkConfig.
                 * Wasm provides a key, JS returns the value (or empty string if not found).
                 * Wasm must provide a pointer to write the result, and its max length.
                 * @param key_ptr Pointer to the key string in Wasm memory.
                 * @param key_len Length of the key string.
                 * @param value_dest_ptr Pointer in Wasm memory to write the result string.
                 * @param value_dest_max_len Max length of the buffer at `value_dest_ptr`.
                 * @returns The actual length of the written value, or 0 if not found/error.
                 */
                get_config_value: (key_ptr: number, key_len: number, value_dest_ptr: number, value_dest_max_len: number): number => {
                    try {
                        const key = this.readStringFromWasm(key_ptr, key_len);
                        const value = this.config.appSettings?.[key] || '';
                        const { len } = this.writeStringToWasm(value, value_dest_ptr, value_dest_max_len);
                        return len;
                    } catch (e) {
                        this.config.logger!('error', `Error in host.get_config_value for key '${this.readStringFromWasm(key_ptr, key_len)}':`, e);
                        return 0;
                    }
                },

                /**
                 * Returns the current timestamp in milliseconds (e.g., Date.now()).
                 * @returns Current timestamp as a 64-bit float.
                 */
                get_timestamp_ms: (): number => {
                    return Date.now();
                },

                /**
                 * Generates a random 64-bit floating-point number between 0 (inclusive) and 1 (exclusive).
                 * @returns A random number.
                 */
                get_random_f64: (): number => {
                    return Math.random();
                },

                /**
                 * Initiates an HTTP request from Wasm. The response will be delivered asynchronously
                 * by calling a Wasm export (e.g., `receive_http_response`).
                 *
                 * @param request_id A unique ID provided by Wasm to identify this request.
                 * @param url_ptr Pointer to the URL string.
                 * @param url_len Length of the URL string.
                 * @param method_ptr Pointer to the method string (e.g., "GET", "POST").
                 * @param method_len Length of the method string.
                 * @param headers_json_ptr Pointer to a JSON string of headers (e.g., `{"Content-Type": "application/json"}`).
                 * @param headers_json_len Length of the headers JSON string.
                 * @param body_ptr Pointer to the request body data (can be 0 if no body).
                 * @param body_len Length of the request body data.
                 */
                http_request_send: (
                    request_id: number,
                    url_ptr: number, url_len: number,
                    method_ptr: number, method_len: number,
                    headers_json_ptr: number, headers_json_len: number,
                    body_ptr: number, body_len: number
                ) => {
                    // Ensure the necessary Wasm exports are available for response delivery
                    const receiveHttpResponse = this.wasmInstance?.exports.receive_http_response as ((requestId: number, status: number) => void) | undefined;
                    const completeHttpRequestError = this.wasmInstance?.exports.complete_http_request_error as ((requestId: number, errorPtr: number, errorLen: number) => void) | undefined;

                    if (typeof receiveHttpResponse !== 'function' || typeof completeHttpRequestError !== 'function') {
                        this.config.logger!('error', `AetherLink Error: Wasm module must export 'receive_http_response' and 'complete_http_request_error' for HTTP requests.`);
                        return; // Cannot deliver response
                    }

                    try {
                        const url = this.readStringFromWasm(url_ptr, url_len);
                        const method = this.readStringFromWasm(method_ptr, method_len);
                        const headersJson = this.readStringFromWasm(headers_json_ptr, headers_json_len);
                        const headers = JSON.parse(headersJson);

                        let body: Uint8Array | null = null;
                        if (body_ptr > 0 && body_len > 0) {
                            const memory = this.ensureMemoryAvailable();
                            body = new Uint8Array(memory.buffer, body_ptr, body_len);
                        }

                        this.config.logger!('log', `Wasm initiated HTTP request ${request_id}: ${method} ${url}`);

                        fetch(url, { method, headers, body })
                            .then(async response => {
                                const responseBody = await response.arrayBuffer();
                                const responseHeaders: Record<string, string> = {};
                                response.headers.forEach((value, key) => {
                                    responseHeaders[key] = value;
                                });

                                // Cache the response data
                                this.httpResponseCache.set(request_id, {
                                    status: response.status,
                                    headers: responseHeaders,
                                    body: new Uint8Array(responseBody),
                                    error: null
                                });

                                // Notify Wasm that response data is available
                                receiveHttpResponse(request_id, response.status);
                            })
                            .catch(error => {
                                this.config.logger!('error', `HTTP request ${request_id} failed:`, error);
                                const errorMessage = String(error);
                                const { ptr, len } = this.writeStringToWasm(errorMessage); // Allocate memory for error string
                                completeHttpRequestError(request_id, ptr, len);
                                // Clean up cached error data if necessary, or let Wasm handle cleanup after reading.
                            });

                    } catch (e) {
                        this.config.logger!('error', `Error processing Wasm HTTP request ${request_id}:`, e);
                        const errorMessage = String(e);
                        try {
                            const { ptr, len } = this.writeStringToWasm(errorMessage);
                            completeHttpRequestError(request_id, ptr, len);
                        } catch (writeErr) {
                            this.config.logger!('error', `Failed to deliver HTTP request error to Wasm:`, writeErr);
                        }
                    }
                },

                /**
                 * Wasm calls this to get the length of the body for a cached HTTP response.
                 * @param request_id The ID of the completed HTTP request.
                 * @returns The length of the response body, or 0 if not found/error.
                 */
                http_response_get_body_len: (request_id: number): number => {
                    const cachedResponse = this.httpResponseCache.get(request_id);
                    if (!cachedResponse || cachedResponse.error) {
                        this.config.logger!('warn', `Wasm requested body len for unknown/error HTTP response ID ${request_id}`);
                        return 0;
                    }
                    return cachedResponse.body?.length || 0;
                },

                /**
                 * Wasm calls this to read the body of a cached HTTP response into Wasm memory.
                 * @param request_id The ID of the completed HTTP request.
                 * @param dest_ptr The pointer in Wasm memory to write the body.
                 * @param dest_max_len The maximum length available at `dest_ptr`.
                 * @returns The actual length written, or 0 if error/not found.
                 */
                http_response_read_body: (request_id: number, dest_ptr: number, dest_max_len: number): number => {
                    const cachedResponse = this.httpResponseCache.get(request_id);
                    if (!cachedResponse || !cachedResponse.body || cachedResponse.error) {
                        this.config.logger!('warn', `Wasm attempted to read body for unknown/error HTTP response ID ${request_id}`);
                        return 0;
                    }

                    const body = cachedResponse.body;
                    if (body.length > dest_max_len) {
                        this.config.logger!('error', `Wasm provided insufficient memory (${dest_max_len} bytes) for HTTP response body of length ${body.length} for request ID ${request_id}.`);
                        return 0;
                    }

                    try {
                        const memory = this.ensureMemoryAvailable();
                        const view = new Uint8Array(memory.buffer);
                        view.set(body, dest_ptr);
                        return body.length;
                    } catch (e) {
                        this.config.logger!('error', `Error writing HTTP response body for request ID ${request_id} to Wasm memory:`, e);
                        return 0;
                    } finally {
                        // Once body is read, we might want to clean up the cache if Wasm guarantees it's done.
                        // For now, keep it until explicit cleanup or a new request with the same ID.
                    }
                },

                /**
                 * Wasm calls this to get the length of the headers JSON for a cached HTTP response.
                 * @param request_id The ID of the completed HTTP request.
                 * @returns The length of the headers JSON string, or 0 if not found/error.
                 */
                http_response_get_headers_len: (request_id: number): number => {
                    const cachedResponse = this.httpResponseCache.get(request_id);
                    if (!cachedResponse || cachedResponse.error) {
                        return 0;
                    }
                    const headersJson = JSON.stringify(cachedResponse.headers);
                    return this.textEncoder.encode(headersJson).length;
                },

                /**
                 * Wasm calls this to read the headers JSON of a cached HTTP response into Wasm memory.
                 * @param request_id The ID of the completed HTTP request.
                 * @param dest_ptr The pointer in Wasm memory to write the headers JSON string.
                 * @param dest_max_len The maximum length available at `dest_ptr`.
                 * @returns The actual length written, or 0 if error/not found.
                 */
                http_response_read_headers: (request_id: number, dest_ptr: number, dest_max_len: number): number => {
                    const cachedResponse = this.httpResponseCache.get(request_id);
                    if (!cachedResponse || cachedResponse.error) {
                        return 0;
                    }

                    try {
                        const headersJson = JSON.stringify(cachedResponse.headers);
                        const { len } = this.writeStringToWasm(headersJson, dest_ptr, dest_max_len);
                        return len;
                    } catch (e) {
                        this.config.logger!('error', `Error writing HTTP response headers for request ID ${request_id} to Wasm memory:`, e);
                        return 0;
                    }
                },

                /**
                 * Wasm calls this to free the cached HTTP response data.
                 * Should be called by Wasm once it has finished processing the response.
                 * @param request_id The ID of the HTTP request to free.
                 */
                http_response_free: (request_id: number) => {
                    if (this.httpResponseCache.delete(request_id)) {
                        this.config.logger!('log', `Freed cached HTTP response for ID ${request_id}.`);
                    } else {
                        this.config.logger!('warn', `Attempted to free unknown HTTP response ID ${request_id}.`);
                    }
                },

                /**
                 * Allows Wasm to request a generic host operation defined in the AetherLinkConfig.
                 * The operation's payload is a JSON string, and the result is also expected as a JSON string.
                 * This provides a flexible extension point for Wasm-JS interactions.
                 *
                 * @param operation_name_ptr Pointer to the operation name string.
                 * @param operation_name_len Length of the operation name.
                 * @param payload_json_ptr Pointer to the JSON payload string.
                 * @param payload_json_len Length of the JSON payload string.
                 * @param callback_id An ID Wasm provides to match the asynchronous response.
                 * @returns 1 if operation successfully initiated, 0 otherwise.
                 */
                request_host_operation: async (
                    operation_name_ptr: number, operation_name_len: number,
                    payload_json_ptr: number, payload_json_len: number,
                    callback_id: number
                ): Promise<void> => {
                    const handleHostOperationResult = this.wasmInstance?.exports.receive_host_operation_result as ((callbackId: number, resultPtr: number, resultLen: number, errorPtr: number, errorLen: number) => void) | undefined;
                    if (typeof handleHostOperationResult !== 'function') {
                        this.config.logger!('error', `Wasm module must export 'receive_host_operation_result' for host operations.`);
                        return;
                    }

                    try {
                        const operationName = this.readStringFromWasm(operation_name_ptr, operation_name_len);
                        const payloadJson = this.readStringFromWasm(payload_json_ptr, payload_json_len);

                        if (!this.config.onHostOperationRequest) {
                            throw new Error(`Host operation '${operationName}' requested, but no 'onHostOperationRequest' handler is configured.`);
                        }

                        this.config.logger!('log', `Wasm requested host operation '${operationName}' with payload: ${payloadJson}`);
                        const result = await this.config.onHostOperationRequest(operationName, payloadJson);
                        const resultJson = result !== undefined ? String(result) : '';

                        const { ptr: resultPtr, len: resultLen } = this.writeStringToWasm(resultJson);
                        handleHostOperationResult(callback_id, resultPtr, resultLen, 0, 0); // 0,0 for no error
                    } catch (e) {
                        this.config.logger!('error', `Error executing host operation:`, e);
                        const errorMessage = String(e);
                        try {
                            const { ptr: errorPtr, len: errorLen } = this.writeStringToWasm(errorMessage);
                            handleHostOperationResult(callback_id, 0, 0, errorPtr, errorLen); // 0,0 for no result
                        } catch (writeError) {
                            this.config.logger!('error', `Failed to deliver host operation error to Wasm:`, writeError);
                        }
                    }
                },
            },
            // `env` is a common namespace for system-like functions
            env: {
                /**
                 * Wasm module called abort. This typically indicates a fatal error.
                 */
                abort: (messagePtr: number, messageLen: number, fileNamePtr: number, fileNameLen: number, lineNum: number, colNum: number) => {
                    const message = messagePtr > 0 ? this.readStringFromWasm(messagePtr, messageLen) : "<no message>";
                    const fileName = fileNamePtr > 0 ? this.readStringFromWasm(fileNamePtr, fileNameLen) : "<unknown file>";
                    this.config.logger!('error', `Wasm module ABORT! Message: "${message}", File: "${fileName}", Line: ${lineNum}, Col: ${colNum}`);
                    // Potentially propagate this as an exception in JS or stop execution.
                    throw new WebAssembly.RuntimeError(`Wasm Abort: ${message} at ${fileName}:${lineNum}:${colNum}`);
                },
            }
        };
    }
}

/**
 * A higher-level runtime environment for managing WebAssembly module lifecycle
 * and providing a convenient interface for interaction via AetherLink FFI.
 * This class encapsulates the instantiation and interaction logic.
 */
export class AetherLinkRuntime {
    private wasmModule: WebAssembly.Module;
    private wasmInstance: WebAssembly.Instance | null = null;
    public ffi: AetherLink;
    private config: AetherLinkConfig;

    /**
     * Creates an instance of AetherLinkRuntime.
     * @param wasmModule The compiled WebAssembly.Module object.
     * @param config Optional AetherLink configuration.
     */
    constructor(wasmModule: WebAssembly.Module, config: AetherLinkConfig = {}) {
        this.wasmModule = wasmModule;
        this.config = config;
        this.ffi = new AetherLink(this.config);
        this.config.logger!('log', "AetherLink Runtime Created with Wasm Module.");
    }

    /**
     * Instantiates the WebAssembly module, linking it with the AetherLink FFI.
     * @returns A promise that resolves to the WebAssembly.Instance.
     */
    public async instantiate(): Promise<WebAssembly.Instance> {
        this.config.logger!('log', "Instantiating Wasm module...");
        const importObject = this.ffi.createImportObject();
        this.wasmInstance = await WebAssembly.instantiate(this.wasmModule, importObject);
        this.ffi.setInstance(this.wasmInstance); // Bind the instance and its memory to the FFI gateway
        this.config.logger!('log', "Wasm module instantiated successfully.");
        return this.wasmInstance;
    }

    /**
     * Returns the raw WebAssembly.Instance object.
     * @throws Error if the Wasm module has not been instantiated yet.
     */
    public get instance(): WebAssembly.Instance {
        if (!this.wasmInstance) {
            throw new Error("AetherLinkRuntime Error: Wasm module not instantiated. Call instantiate() first.");
        }
        return this.wasmInstance;
    }

    /**
     * Returns the exports object of the instantiated Wasm module.
     * @throws Error if the Wasm module has not been instantiated yet.
     */
    public get exports(): WebAssembly.Exports {
        return this.instance.exports;
    }

    /**
     * Calls an exported function from the Wasm module through the FFI gateway.
     * This provides type safety and unified error handling.
     * @param exportName The name of the exported Wasm function.
     * @param args Arguments to pass to the Wasm function.
     * @returns The result of the Wasm function call.
     */
    public callExport<T extends (...args: any[]) => any>(exportName: string, ...args: Parameters<T>): ReturnType<T> {
        return this.ffi.callWasmExport(exportName, ...args);
    }

    /**
     * Utility method to run an `allocate` and `deallocate` cycle for string data.
     * Useful for passing strings from JS to Wasm functions that expect a pointer and length,
     * and for which Wasm handles its own memory management.
     *
     * @param data The string data to process.
     * @param callback A function that receives the Wasm pointer and length of the allocated string.
     *                 This function is expected to call a Wasm export.
     * @returns The result of the callback function.
     * @throws Error if `allocate` or `deallocate` exports are not found in Wasm.
     */
    public withWasmString<T>(data: string, callback: (ptr: number, len: number) => T): T {
        const allocate = this.exports.allocate as ((size: number) => number) | undefined;
        const deallocate = this.exports.deallocate as ((ptr: number, size: number) => void) | undefined;

        if (typeof allocate !== 'function' || typeof deallocate !== 'function') {
            throw new Error("AetherLinkRuntime Error: Wasm module must export 'allocate' and 'deallocate' functions to use withWasmString.");
        }

        const encoded = this.ffi['textEncoder'].encode(data); // Access internal encoder
        const len = encoded.length;
        const ptr = allocate(len);
        if (ptr === 0) {
            throw new Error(`AetherLinkRuntime Error: Wasm 'allocate' function returned 0 for ${len} bytes.`);
        }

        try {
            const memory = this.ffi['ensureMemoryAvailable'](); // Access internal method
            const view = new Uint8Array(memory.buffer);
            view.set(encoded, ptr);
            return callback(ptr, len);
        } finally {
            deallocate(ptr, len);
        }
    }
}