// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview A functional, simplified memory manager for the TSAL runtime.
 * This provides a concrete implementation of a bump allocator for the `heap` module.
 * In a real, production compiler, this might be replaced with a more complex allocator
 * like `wee_alloc`, but this provides a functional starting point.
 */

import type { mem_ptr } from '../syntax/types';

/**
 * Configuration options for the BumpAllocator.
 */
export interface BumpAllocatorOptions {
    /** Initial number of WebAssembly pages (1 page = 64KiB). Defaults to 1. */
    initialPages?: number;
    /** Maximum number of WebAssembly pages the memory can grow to. Defaults to unlimited. */
    maxPages?: number;
    /** Initial offset for the heap start in bytes. Defaults to 16. */
    heapStartOffset?: number;
}

/**
 * Statistics for the BumpAllocator.
 */
export interface BumpAllocatorStats {
    /** Total memory allocated in bytes since last reset. */
    allocatedBytes: number;
    /** Peak memory allocated in bytes since last reset. */
    peakAllocatedBytes: number;
    /** Current size of the WebAssembly memory in bytes. */
    totalMemoryBytes: number;
    /** Current pointer position in bytes. */
    currentPointer: number;
    /** Number of memory grow operations performed. */
    growOperations: number;
}

export class BumpAllocator {
    private memory: WebAssembly.Memory;
    private heap_start: number;
    private current_ptr: number;
    private max_pages: number;
    private allocated_bytes: number;
    private peak_allocated_bytes: number;
    private grow_operations: number;

    // Constants
    private static readonly PAGE_SIZE = 64 * 1024; // 64 KiB
    private static readonly ALIGNMENT = 8; // 8-byte alignment

    constructor(options?: BumpAllocatorOptions) {
        const initialPages = options?.initialPages ?? 1;
        this.max_pages = options?.maxPages ?? Infinity;
        this.heap_start = options?.heapStartOffset ?? 16;

        if (initialPages > this.max_pages) {
            throw new Error("[TSAL Runtime] BumpAllocator: initialPages cannot exceed maxPages.");
        }

        this.memory = new WebAssembly.Memory({ initial: initialPages, maximum: this.max_pages });
        this.current_ptr = this.heap_start;
        this.allocated_bytes = 0;
        this.peak_allocated_bytes = 0;
        this.grow_operations = 0;

        console.log(`[TSAL Runtime] BumpAllocator initialized. Initial memory: ${this.memory.buffer.byteLength} bytes.`);
        if (this.max_pages !== Infinity) {
            console.log(`[TSAL Runtime] BumpAllocator max memory: ${this.max_pages * BumpAllocator.PAGE_SIZE} bytes.`);
        }
    }

    /**
     * Replaces the current WebAssembly.Memory instance with a new one.
     * This is useful if memory is managed externally or needs to be re-initialized.
     * @param memory The new WebAssembly.Memory instance.
     */
    public setMemory(memory: WebAssembly.Memory): void {
        if (!memory || !(memory instanceof WebAssembly.Memory)) {
            console.error("[TSAL Runtime] BumpAllocator: Attempted to set an invalid memory instance.");
            throw new Error("Invalid WebAssembly.Memory instance provided.");
        }
        this.memory = memory;
        // When memory is replaced, we should ideally reset current_ptr if it's a new memory.
        // For simplicity, we'll reset here, assuming the new memory is fresh.
        this.reset();
        console.log(`[TSAL Runtime] BumpAllocator attached to new memory instance. Total memory: ${this.memory.buffer.byteLength} bytes.`);
    }

    /**
     * Returns the underlying WebAssembly.Memory instance.
     */
    public getMemory(): WebAssembly.Memory {
        return this.memory;
    }

    /**
     * Returns the underlying ArrayBuffer for direct memory access.
     */
    public getBuffer(): ArrayBuffer {
        return this.memory.buffer;
    }

    /**
     * Allocates a block of memory of the given size with 8-byte alignment.
     * @param size The number of bytes to allocate. Must be non-negative.
     * @returns A memory pointer to the start of the allocated block, or 0 if allocation fails.
     */
    public alloc(size: number): mem_ptr {
        if (size < 0) {
            console.error("[TSAL Runtime] BumpAllocator: Allocation size cannot be negative.");
            return 0;
        }
        if (size === 0) {
            return 0; // Allocate nothing, return null pointer
        }

        // 8-byte alignment
        const alignedSize = (size + BumpAllocator.ALIGNMENT - 1) & ~(BumpAllocator.ALIGNMENT - 1);
        const next_ptr = this.current_ptr + alignedSize;

        if (next_ptr > this.memory.buffer.byteLength) {
            const currentPages = this.memory.buffer.byteLength / BumpAllocator.PAGE_SIZE;
            const neededBytes = next_ptr - this.memory.buffer.byteLength;
            const neededPages = Math.ceil(neededBytes / BumpAllocator.PAGE_SIZE);
            const newTotalPages = currentPages + neededPages;

            if (newTotalPages > this.max_pages) {
                console.error(`[TSAL Runtime] Out of memory! Cannot grow beyond maxPages (${this.max_pages}). Requested size: ${size} bytes, aligned: ${alignedSize} bytes.`);
                return 0; // Allocation failed
            }

            try {
                this.memory.grow(neededPages);
                this.grow_operations++;
                console.log(`[TSAL Runtime] BumpAllocator grew memory by ${neededPages} pages. New size: ${this.memory.buffer.byteLength} bytes.`);
            } catch (e: any) {
                console.error("[TSAL Runtime] Out of memory! Failed to grow memory.", e.message);
                return 0; // Allocation failed
            }
        }

        const ptr = this.current_ptr;
        this.current_ptr = next_ptr;

        this.allocated_bytes += alignedSize;
        if (this.allocated_bytes > this.peak_allocated_bytes) {
            this.peak_allocated_bytes = this.allocated_bytes;
        }

        return ptr;
    }

    /**
     * Attempts to reallocate a previously allocated block of memory.
     * For a bump allocator, this is effectively a new allocation and potential copy.
     * @param oldPtr The pointer to the old memory block.
     * @param oldSize The original size of the block.
     * @param newSize The new size required for the block.
     * @returns A memory pointer to the new block, or 0 if reallocation fails.
     */
    public realloc(oldPtr: mem_ptr, oldSize: number, newSize: number): mem_ptr {
        if (newSize < 0) {
            console.error("[TSAL Runtime] BumpAllocator: Reallocation size cannot be negative.");
            return 0;
        }
        if (newSize === 0) {
            this.free(oldPtr); // Treat realloc to size 0 as free
            return 0;
        }
        
        // In a bump allocator, reallocation usually means new allocation + copy
        const newPtr = this.alloc(newSize);
        if (newPtr !== 0) {
            if (oldPtr !== 0 && oldSize > 0) {
                const buffer = this.getBuffer();
                const view = new Uint8Array(buffer);
                // Copy min(oldSize, newSize) bytes
                const bytesToCopy = Math.min(oldSize, newSize);
                if (bytesToCopy > 0) {
                    view.copyWithin(newPtr, oldPtr, oldPtr + bytesToCopy);
                }
                // Note: oldPtr is not 'freed' in a true bump allocator sense,
                // it just becomes unreachable.
            }
        }
        return newPtr;
    }

    /**
     * Frees a previously allocated block of memory.
     * NOTE: A simple bump allocator cannot free individual blocks.
     * This is a no-op but kept for interface compatibility with other allocators.
     * @param ptr The pointer to the memory block to free.
     */
    public free(ptr: mem_ptr): void {
        // A simple bump allocator doesn't support individual frees.
        // This is a no-op. For a real system, you'd use a more complex allocator.
        // console.warn("[TSAL Runtime] BumpAllocator: Individual free operation is a no-op.");
    }

    /**
     * Resets the entire heap, effectively freeing all allocated memory and
     * allowing subsequent allocations to reuse the memory from the `heap_start` offset.
     */
    public reset(): void {
        this.current_ptr = this.heap_start;
        this.allocated_bytes = 0;
        this.peak_allocated_bytes = 0; // Peak reset with heap reset
        this.grow_operations = 0;
        console.log("[TSAL Runtime] BumpAllocator heap has been reset.");
    }

    /**
     * Returns current memory usage statistics.
     * @returns An object containing various memory statistics.
     */
    public getStats(): BumpAllocatorStats {
        return {
            allocatedBytes: this.allocated_bytes,
            peakAllocatedBytes: this.peak_allocated_bytes,
            totalMemoryBytes: this.memory.buffer.byteLength,
            currentPointer: this.current_ptr,
            growOperations: this.grow_operations,
        };
    }
}


/**
 * @fileoverview Utility class for reading and writing various data types to/from a WebAssembly.Memory buffer.
 * Provides type-safe and bounds-checked access to raw memory.
 */
export class MemoryView {
    private memoryBuffer: ArrayBuffer;
    private dataView: DataView;

    constructor(buffer: ArrayBuffer) {
        if (!(buffer instanceof ArrayBuffer || (typeof SharedArrayBuffer !== 'undefined' && buffer instanceof SharedArrayBuffer))) {
            throw new Error("MemoryView: Provided buffer must be an ArrayBuffer or SharedArrayBuffer.");
        }
        this.memoryBuffer = buffer;
        this.dataView = new DataView(buffer);
    }

    /**
     * Updates the underlying ArrayBuffer. Useful if the WebAssembly.Memory grows.
     * @param buffer The new ArrayBuffer instance.
     */
    public updateBuffer(buffer: ArrayBuffer): void {
        if (!(buffer instanceof ArrayBuffer || (typeof SharedArrayBuffer !== 'undefined' && buffer instanceof SharedArrayBuffer))) {
            throw new Error("MemoryView: Provided buffer must be an ArrayBuffer or SharedArrayBuffer.");
        }
        this.memoryBuffer = buffer;
        this.dataView = new DataView(buffer);
    }

    /**
     * Checks if the given pointer and size are within the bounds of the memory buffer.
     * @param ptr The memory pointer (offset).
     * @param size The size of the data to access.
     * @returns True if within bounds, false otherwise.
     */
    private checkBounds(ptr: mem_ptr, size: number): boolean {
        if (ptr < 0 || size < 0 || ptr + size > this.memoryBuffer.byteLength) {
            console.error(`[TSAL Runtime] MemoryView: Access out of bounds. Ptr: ${ptr}, Size: ${size}, Buffer length: ${this.memoryBuffer.byteLength}`);
            return false;
        }
        return true;
    }

    public getUint8(ptr: mem_ptr): number {
        if (!this.checkBounds(ptr, 1)) return 0;
        return this.dataView.getUint8(ptr);
    }
    public setUint8(ptr: mem_ptr, value: number): void {
        if (!this.checkBounds(ptr, 1)) return;
        this.dataView.setUint8(ptr, value);
    }

    public getInt8(ptr: mem_ptr): number {
        if (!this.checkBounds(ptr, 1)) return 0;
        return this.dataView.getInt8(ptr);
    }
    public setInt8(ptr: mem_ptr, value: number): void {
        if (!this.checkBounds(ptr, 1)) return;
        this.dataView.setInt8(ptr, value);
    }

    public getUint16(ptr: mem_ptr, littleEndian: boolean = true): number {
        if (!this.checkBounds(ptr, 2)) return 0;
        return this.dataView.getUint16(ptr, littleEndian);
    }
    public setUint16(ptr: mem_ptr, value: number, littleEndian: boolean = true): void {
        if (!this.checkBounds(ptr, 2)) return;
        this.dataView.setUint16(ptr, value, littleEndian);
    }

    public getInt16(ptr: mem_ptr, littleEndian: boolean = true): number {
        if (!this.checkBounds(ptr, 2)) return 0;
        return this.dataView.getInt16(ptr, littleEndian);
    }
    public setInt16(ptr: mem_ptr, value: number, littleEndian: boolean = true): void {
        if (!this.checkBounds(ptr, 2)) return;
        this.dataView.setInt16(ptr, value, littleEndian);
    }

    public getUint32(ptr: mem_ptr, littleEndian: boolean = true): number {
        if (!this.checkBounds(ptr, 4)) return 0;
        return this.dataView.getUint32(ptr, littleEndian);
    }
    public setUint32(ptr: mem_ptr, value: number, littleEndian: boolean = true): void {
        if (!this.checkBounds(ptr, 4)) return;
        this.dataView.setUint32(ptr, value, littleEndian);
    }

    public getInt32(ptr: mem_ptr, littleEndian: boolean = true): number {
        if (!this.checkBounds(ptr, 4)) return 0;
        return this.dataView.getInt32(ptr, littleEndian);
    }
    public setInt32(ptr: mem_ptr, value: number, littleEndian: boolean = true): void {
        if (!this.checkBounds(ptr, 4)) return;
        this.dataView.setInt32(ptr, value, littleEndian);
    }

    public getFloat32(ptr: mem_ptr, littleEndian: boolean = true): number {
        if (!this.checkBounds(ptr, 4)) return 0;
        return this.dataView.getFloat32(ptr, littleEndian);
    }
    public setFloat32(ptr: mem_ptr, value: number, littleEndian: boolean = true): void {
        if (!this.checkBounds(ptr, 4)) return;
        this.dataView.setFloat32(ptr, value, littleEndian);
    }

    public getFloat64(ptr: mem_ptr, littleEndian: boolean = true): number {
        if (!this.checkBounds(ptr, 8)) return 0;
        return this.dataView.getFloat64(ptr, littleEndian);
    }
    public setFloat64(ptr: mem_ptr, value: number, littleEndian: boolean = true): void {
        if (!this.checkBounds(ptr, 8)) return;
        this.dataView.setFloat64(ptr, value, littleEndian);
    }

    /**
     * Reads a null-terminated UTF-8 string from memory.
     * @param ptr The starting memory pointer.
     * @param maxLength The maximum number of bytes to read to prevent unbounded reads. If 0, reads until null terminator or end of buffer.
     * @returns The decoded string.
     */
    public getString(ptr: mem_ptr, maxLength: number = 0): string {
        if (!this.checkBounds(ptr, 0)) return ""; // Check start ptr validity
        
        const bytes: number[] = [];
        let offset = 0;
        const bufferLength = this.memoryBuffer.byteLength;

        while (true) {
            const currentPtr = ptr + offset;
            if (currentPtr >= bufferLength) break; // Reached end of buffer

            const byte = this.dataView.getUint8(currentPtr);
            if (byte === 0) break; // Null terminator found
            bytes.push(byte);
            offset++;

            if (maxLength > 0 && offset >= maxLength) break; // Max length reached
        }

        const decoder = new TextDecoder('utf-8');
        return decoder.decode(new Uint8Array(bytes));
    }

    /**
     * Writes a UTF-8 string to memory, null-terminating it.
     * Allocates memory if needed (via `allocator.alloc`).
     * @param ptr The starting memory pointer.
     * @param value The string to write.
     * @returns The number of bytes written (including null terminator), or 0 if allocation/write fails.
     */
    public setString(ptr: mem_ptr, value: string): number {
        if (!this.checkBounds(ptr, 0)) return 0; // Check start ptr validity

        const encoder = new TextEncoder();
        const encoded = encoder.encode(value);
        const totalSize = encoded.byteLength + 1; // +1 for null terminator

        if (!this.checkBounds(ptr, totalSize)) {
            console.error(`[TSAL Runtime] MemoryView: Insufficient space to write string at ${ptr}. Required: ${totalSize}, Available from ptr: ${this.memoryBuffer.byteLength - ptr}`);
            return 0;
        }

        const view = new Uint8Array(this.memoryBuffer);
        view.set(encoded, ptr);
        view[ptr + encoded.byteLength] = 0; // Null-terminate

        return totalSize;
    }

    /**
     * Reads a specified number of bytes from memory as a Uint8Array.
     * @param ptr The starting memory pointer.
     * @param length The number of bytes to read.
     * @returns A new Uint8Array containing the copied bytes, or an empty array if out of bounds.
     */
    public getBytes(ptr: mem_ptr, length: number): Uint8Array {
        if (!this.checkBounds(ptr, length)) return new Uint8Array(0);
        return new Uint8Array(this.memoryBuffer, ptr, length);
    }

    /**
     * Writes a Uint8Array to memory.
     * @param ptr The starting memory pointer.
     * @param bytes The Uint8Array to write.
     * @returns The number of bytes written, or 0 if out of bounds.
     */
    public setBytes(ptr: mem_ptr, bytes: Uint8Array): number {
        if (!this.checkBounds(ptr, bytes.byteLength)) return 0;
        new Uint8Array(this.memoryBuffer).set(bytes, ptr);
        return bytes.byteLength;
    }
}


/**
 * @fileoverview Manages shared memory buffers using SharedArrayBuffer and Atomics for inter-thread communication.
 * This class provides a robust mechanism for creating, accessing, and synchronizing shared memory regions.
 * Requires appropriate COOP/COEP headers in production environments.
 */
export class SharedMemoryManager {
    private sharedBufferRegistry: Map<number, SharedArrayBuffer>;
    private nextBufferId: number;

    // A small buffer for atomic synchronization to manage sharedBufferRegistry access
    // Or just rely on single-threaded JS thread for registry access if we assume one main thread manages it.
    // For now, assume this manager is accessed by a single main thread, and the shared buffers are for workers.

    constructor() {
        if (typeof SharedArrayBuffer === 'undefined' || typeof Atomics === 'undefined') {
            console.warn("[TSAL Runtime] SharedMemoryManager: SharedArrayBuffer or Atomics are not available. Shared memory operations will fail.");
        }
        this.sharedBufferRegistry = new Map<number, SharedArrayBuffer>();
        this.nextBufferId = 1; // Start IDs from 1, 0 typically means null/invalid.
    }

    /**
     * Creates a new SharedArrayBuffer and registers it.
     * @param size The size of the shared buffer in bytes.
     * @returns A mem_ptr (which is the buffer ID) to the created shared buffer, or 0 if creation fails.
     */
    public createSharedBuffer(size: number): mem_ptr {
        if (typeof SharedArrayBuffer === 'undefined') {
            console.error("[TSAL Runtime] SharedMemoryManager: SharedArrayBuffer is not available. Cannot create shared buffer.");
            return 0;
        }
        if (size <= 0) {
            console.error("[TSAL Runtime] SharedMemoryManager: Shared buffer size must be positive.");
            return 0;
        }

        try {
            const buffer = new SharedArrayBuffer(size);
            const bufferId = this.nextBufferId++;
            this.sharedBufferRegistry.set(bufferId, buffer);
            console.log(`[TSAL Runtime] SharedMemoryManager: Created SharedArrayBuffer with ID ${bufferId}, size ${size} bytes.`);
            return bufferId;
        } catch (e) {
            console.error("[TSAL Runtime] SharedMemoryManager: Failed to create SharedArrayBuffer.", e);
            return 0;
        }
    }

    /**
     * Retrieves a registered SharedArrayBuffer by its ID.
     * @param bufferId The ID of the shared buffer.
     * @returns The SharedArrayBuffer instance, or undefined if not found.
     */
    public getSharedBuffer(bufferId: mem_ptr): SharedArrayBuffer | undefined {
        return this.sharedBufferRegistry.get(bufferId);
    }

    /**
     * Provides a DataView for a registered SharedArrayBuffer.
     * Useful for type-specific reading/writing.
     * @param bufferId The ID of the shared buffer.
     * @returns A DataView for the buffer, or undefined if the buffer is not found.
     */
    public getSharedBufferDataView(bufferId: mem_ptr): DataView | undefined {
        const buffer = this.getSharedBuffer(bufferId);
        return buffer ? new DataView(buffer) : undefined;
    }

    /**
     * Provides a Uint32Array view for a registered SharedArrayBuffer.
     * Essential for Atomics operations.
     * @param bufferId The ID of the shared buffer.
     * @returns A Uint32Array for the buffer, or undefined if the buffer is not found.
     */
    public getSharedBufferUint32Array(bufferId: mem_ptr): Uint32Array | undefined {
        const buffer = this.getSharedBuffer(bufferId);
        return buffer ? new Uint32Array(buffer) : undefined;
    }

    /**
     * Destroys (deregisters) a shared buffer. The underlying buffer might still be held by workers.
     * @param bufferId The ID of the shared buffer to destroy.
     * @returns True if the buffer was found and destroyed, false otherwise.
     */
    public destroySharedBuffer(bufferId: mem_ptr): boolean {
        const existed = this.sharedBufferRegistry.delete(bufferId);
        if (existed) {
            console.log(`[TSAL Runtime] SharedMemoryManager: Destroyed SharedArrayBuffer with ID ${bufferId}.`);
        } else {
            console.warn(`[TSAL Runtime] SharedMemoryManager: Attempted to destroy non-existent SharedArrayBuffer with ID ${bufferId}.`);
        }
        return existed;
    }

    /**
     * Perform an atomic load operation on a Uint32 value in a shared buffer.
     * @param bufferId The ID of the shared buffer.
     * @param index The index (offset in Uint32s) in the Uint32Array view.
     * @returns The value loaded, or 0 if an error occurs.
     */
    public atomicLoad(bufferId: mem_ptr, index: number): number {
        if (typeof Atomics === 'undefined') {
            console.error("[TSAL Runtime] Atomics not available for atomicLoad.");
            return 0;
        }
        const view = this.getSharedBufferUint32Array(bufferId);
        if (!view) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Buffer with ID ${bufferId} not found for atomicLoad.`);
            return 0;
        }
        if (index < 0 || index >= view.length) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Index ${index} out of bounds for atomicLoad on buffer ${bufferId}.`);
            return 0;
        }
        return Atomics.load(view, index);
    }

    /**
     * Perform an atomic store operation on a Uint32 value in a shared buffer.
     * @param bufferId The ID of the shared buffer.
     * @param index The index (offset in Uint32s) in the Uint32Array view.
     * @param value The value to store.
     * @returns The value stored.
     */
    public atomicStore(bufferId: mem_ptr, index: number, value: number): number {
        if (typeof Atomics === 'undefined') {
            console.error("[TSAL Runtime] Atomics not available for atomicStore.");
            return 0;
        }
        const view = this.getSharedBufferUint32Array(bufferId);
        if (!view) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Buffer with ID ${bufferId} not found for atomicStore.`);
            return 0;
        }
        if (index < 0 || index >= view.length) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Index ${index} out of bounds for atomicStore on buffer ${bufferId}.`);
            return 0;
        }
        return Atomics.store(view, index, value);
    }

    /**
     * Perform an atomic add operation on a Uint32 value in a shared buffer.
     * @param bufferId The ID of the shared buffer.
     * @param index The index (offset in Uint32s) in the Uint32Array view.
     * @param value The value to add.
     * @returns The old value at the index before the add.
     */
    public atomicAdd(bufferId: mem_ptr, index: number, value: number): number {
        if (typeof Atomics === 'undefined') {
            console.error("[TSAL Runtime] Atomics not available for atomicAdd.");
            return 0;
        }
        const view = this.getSharedBufferUint32Array(bufferId);
        if (!view) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Buffer with ID ${bufferId} not found for atomicAdd.`);
            return 0;
        }
        if (index < 0 || index >= view.length) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Index ${index} out of bounds for atomicAdd on buffer ${bufferId}.`);
            return 0;
        }
        return Atomics.add(view, index, value);
    }

    /**
     * Perform an atomic compare and exchange (CAS) operation on a Uint32 value.
     * @param bufferId The ID of the shared buffer.
     * @param index The index (offset in Uint32s) in the Uint32Array view.
     * @param expectedValue The expected value at the index.
     * @param replacementValue The value to write if `expectedValue` matches.
     * @returns The old value at the index.
     */
    public atomicCompareExchange(bufferId: mem_ptr, index: number, expectedValue: number, replacementValue: number): number {
        if (typeof Atomics === 'undefined') {
            console.error("[TSAL Runtime] Atomics not available for atomicCompareExchange.");
            return 0;
        }
        const view = this.getSharedBufferUint32Array(bufferId);
        if (!view) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Buffer with ID ${bufferId} not found for atomicCompareExchange.`);
            return 0;
        }
        if (index < 0 || index >= view.length) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Index ${index} out of bounds for atomicCompareExchange on buffer ${bufferId}.`);
            return 0;
        }
        return Atomics.compareExchange(view, index, expectedValue, replacementValue);
    }

    /**
     * Puts the calling agent to sleep waiting for a notification on a given address.
     * @param bufferId The ID of the shared buffer.
     * @param index The index (offset in Uint32s) in the Uint32Array view.
     * @param value The value that is expected to be at the index.
     * @param timeout The maximum time (in milliseconds) to wait.
     * @returns 'ok', 'not-equal', or 'timed-out'.
     */
    public atomicWait(bufferId: mem_ptr, index: number, value: number, timeout?: number): 'ok' | 'not-equal' | 'timed-out' {
        if (typeof Atomics === 'undefined' || typeof Atomics.wait === 'undefined') {
            console.error("[TSAL Runtime] Atomics.wait not available for atomicWait. Ensure this is in a worker or main thread with proper headers.");
            return 'not-equal'; // Return something indicating failure
        }
        const view = this.getSharedBufferUint32Array(bufferId);
        if (!view) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Buffer with ID ${bufferId} not found for atomicWait.`);
            return 'not-equal';
        }
        if (index < 0 || index >= view.length) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Index ${index} out of bounds for atomicWait on buffer ${bufferId}.`);
            return 'not-equal';
        }
        return Atomics.wait(view, index, value, timeout);
    }

    /**
     * Wakes up agents that are waiting on a given address.
     * @param bufferId The ID of the shared buffer.
     * @param index The index (offset in Uint32s) in the Uint32Array view.
     * @param count The number of agents to wake up. Infinity means all.
     * @returns The number of agents that were awoken.
     */
    public atomicNotify(bufferId: mem_ptr, index: number, count: number = Infinity): number {
        if (typeof Atomics === 'undefined' || typeof Atomics.notify === 'undefined') {
            console.error("[TSAL Runtime] Atomics.notify not available for atomicNotify.");
            return 0;
        }
        const view = this.getSharedBufferUint32Array(bufferId);
        if (!view) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Buffer with ID ${bufferId} not found for atomicNotify.`);
            return 0;
        }
        if (index < 0 || index >= view.length) {
            console.error(`[TSAL Runtime] SharedMemoryManager: Index ${index} out of bounds for atomicNotify on buffer ${bufferId}.`);
            return 0;
        }
        return Atomics.notify(view, index, count);
    }
}


/**
 * @fileoverview Main MemoryManager for the TSAL runtime.
 * This class orchestrates the primary BumpAllocator and provides an interface
 * for shared memory management and direct memory access via MemoryView.
 * It serves as the central point for all memory-related operations.
 */
export class MemoryManager {
    private bumpAllocator: BumpAllocator;
    private memoryView: MemoryView;
    private sharedMemoryManager: SharedMemoryManager;

    constructor(allocatorOptions?: BumpAllocatorOptions) {
        this.bumpAllocator = new BumpAllocator(allocatorOptions);
        this.memoryView = new MemoryView(this.bumpAllocator.getBuffer());
        this.sharedMemoryManager = new SharedMemoryManager();

        // Register a callback to update the MemoryView when the allocator grows memory
        // This is a simplified approach; in a real scenario, the MemoryView might listen to the allocator
        // or be passed the new buffer on demand. For now, we update it dynamically.
        // The current design of BumpAllocator returning a new buffer reference on grow is implicit.
        // A more robust way would be to pass `this.memory.buffer` to MemoryView methods, or have
        // the MemoryView update method be called by the allocator itself.
        // Given that `getBuffer()` returns a live ArrayBuffer for `WebAssembly.Memory`,
        // `MemoryView` automatically gets the updated buffer if `memory.grow()` reallocates it.
        // So, explicit `updateBuffer` call is not strictly needed for `WebAssembly.Memory`.
        // However, for clarity, it's good to ensure `MemoryView` always has the latest buffer.
        // A simple pattern is to always call `bumpAllocator.getBuffer()` before each access in `MemoryView` if needed.
        // But `DataView` constructor takes an `ArrayBuffer` directly, and `WebAssembly.Memory.buffer`
        // is designed to update in place for `grow`. So the initial setup is sufficient for `WebAssembly.Memory`.
        // Let's ensure the `MemoryView` always holds the latest buffer.
        // This is a subtle point, let's make `MemoryView` constructor take the `WebAssembly.Memory` directly or a getter.
        // For now, I'll stick to `updateBuffer` as it explicitly re-initializes `DataView`.
    }

    /**
     * Initializes the WebAssembly.Memory instance that the allocator will use.
     * This can be used to provide an externally created memory instance,
     * for example, one imported from a WebAssembly module.
     * @param memory The WebAssembly.Memory instance to use.
     */
    public setWebAssemblyMemory(memory: WebAssembly.Memory): void {
        this.bumpAllocator.setMemory(memory);
        this.memoryView.updateBuffer(this.bumpAllocator.getBuffer());
        console.log("[TSAL Runtime] MemoryManager: WebAssembly.Memory instance updated.");
    }

    /**
     * Allocates a block of memory from the primary heap.
     * @param size The number of bytes to allocate.
     * @returns A memory pointer to the start of the allocated block, or 0 if allocation fails.
     */
    public alloc(size: number): mem_ptr {
        const ptr = this.bumpAllocator.alloc(size);
        // The underlying ArrayBuffer reference might change if the memory grows
        // so we update the MemoryView's buffer to ensure it always operates on the latest.
        this.memoryView.updateBuffer(this.bumpAllocator.getBuffer());
        return ptr;
    }

    /**
     * Reallocates a block of memory from the primary heap.
     * @param oldPtr The pointer to the old memory block.
     * @param oldSize The original size of the block.
     * @param newSize The new size required for the block.
     * @returns A memory pointer to the new block, or 0 if reallocation fails.
     */
    public realloc(oldPtr: mem_ptr, oldSize: number, newSize: number): mem_ptr {
        const ptr = this.bumpAllocator.realloc(oldPtr, oldSize, newSize);
        this.memoryView.updateBuffer(this.bumpAllocator.getBuffer());
        return ptr;
    }

    /**
     * Frees a previously allocated block of memory. (No-op for bump allocator).
     * @param ptr The pointer to the memory block to free.
     */
    public free(ptr: mem_ptr): void {
        this.bumpAllocator.free(ptr);
    }

    /**
     * Resets the entire primary heap, effectively freeing all allocated memory.
     */
    public resetHeap(): void {
        this.bumpAllocator.reset();
        this.memoryView.updateBuffer(this.bumpAllocator.getBuffer()); // Ensure view is fresh if buffer object changed during reset (unlikely but safe)
    }

    /**
     * Returns the memory view for direct read/write access to the primary WebAssembly memory.
     */
    public get memory(): MemoryView {
        // Always return a fresh view of the buffer, in case memory grew externally or was updated.
        this.memoryView.updateBuffer(this.bumpAllocator.getBuffer());
        return this.memoryView;
    }

    /**
     * Returns statistics about the primary bump allocator.
     */
    public getHeapStats(): BumpAllocatorStats {
        return this.bumpAllocator.getStats();
    }

    /**
     * Provides access to the SharedMemoryManager for inter-thread communication.
     */
    public get sharedMemory(): SharedMemoryManager {
        return this.sharedMemoryManager;
    }
}

// Instantiate the main MemoryManager for global access.
export const memoryManager = new MemoryManager();

// Expose the core heap allocation functions through a simplified interface.
export const heap = {
    /**
     * Allocates memory from the primary heap.
     * @param size The number of bytes to allocate.
     * @returns A memory pointer.
     */
    alloc: (size: number): mem_ptr => memoryManager.alloc(size),
    /**
     * Reallocates memory from the primary heap.
     * @param oldPtr The old pointer.
     * @param oldSize The old size.
     * @param newSize The new size.
     * @returns A new memory pointer.
     */
    realloc: (oldPtr: mem_ptr, oldSize: number, newSize: number): mem_ptr => memoryManager.realloc(oldPtr, oldSize, newSize),
    /**
     * Frees memory (no-op for bump allocator).
     * @param ptr The pointer to free.
     */
    free: (ptr: mem_ptr): void => memoryManager.free(ptr),
    /**
     * Resets the entire heap.
     */
    reset: (): void => memoryManager.resetHeap(),
    /**
     * Gets current heap statistics.
     */
    getStats: (): BumpAllocatorStats => memoryManager.getHeapStats(),
};

// Replace the old `allocator` export with the full `MemoryManager` instance.
// This provides a more comprehensive interface.
export const allocator = memoryManager;

// Replace the old `shared_mem` object with the full `SharedMemoryManager` instance.
export const shared_mem = memoryManager.sharedMemory;