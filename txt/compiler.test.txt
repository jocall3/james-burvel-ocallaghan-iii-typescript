// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { Alchemist } from './compiler';

// This function will be the *mocked* `watToWasm` from the `./wabt` module.
// By default, it returns a generic, valid Wasm header, primarily for unit tests
// where we only need to confirm that `Alchemist` calls `watToWasm` with expected WAT.
export const mockWatToWasm = vi.fn((wat: string) => {
    // This specific byte sequence represents a minimal valid Wasm module header.
    // For more advanced unit tests, this could be extended to return specific
    // Wasm bytes based on WAT input, but for most unit tests, a dummy header suffices.
    return new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b]);
});

// Mock the `./wabt` module for all tests.
// The `watToWasm` export will always refer to `mockWatToWasm`.
vi.mock('./wabt', () => ({
    watToWasm: mockWatToWasm
}));

// Store the actual `watToWasm` implementation from `./wabt` module.
// This is necessary for integration tests (like `compileInstantiateAndRun`)
// where we need real WAT to Wasm conversion for execution.
let actualWatToWasm: (wat: string) => Uint8Array;

// Use `beforeAll` to asynchronously load the actual `wabt` module once for all tests in this file.
// This ensures `vi.importActual` is called outside of a synchronous `vi.mock` factory,
// and that `actualWatToWasm` is populated before any test attempts to use it.
beforeAll(async () => {
    const wabtModule = await vi.importActual('./wabt') as typeof import('./wabt');
    actualWatToWasm = wabtModule.watToWasm;
});

/**
 * A helper function to compile TSAL source code and assert successful compilation.
 * It verifies that `Alchemist` produced some Wasm bytes and called the `watToWasm` mock
 * with a WAT string containing expected substrings.
 * @param alchemist The Alchemist compiler instance.
 * @param source The TSAL source code to compile.
 * @param expectedWatSubstrings An array of substrings expected to be found in the generated WAT.
 * @returns A Promise that resolves if compilation is successful and assertions pass.
 */
export async function expectCompilationSuccess(alchemist: Alchemist, source: string, expectedWatSubstrings: string[] = []) {
    mockWatToWasm.mockClear(); // Clear mock calls from previous tests
    // Ensure the mock uses its dummy default for these unit-style tests.
    mockWatToWasm.mockImplementation(() => new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b]));

    const result = await alchemist.compile(source);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0); // Expect some Wasm bytes to be returned

    expect(mockWatToWasm).toHaveBeenCalledTimes(1);
    const generatedWat = mockWatToWasm.mock.calls[0][0]; // Get the WAT string argument passed to the mock
    expect(generatedWat).toBeTypeOf('string');

    // Basic structural checks for generated WAT
    expect(generatedWat).toContain('(module');
    if (source.includes('func')) { // Heuristic: if 'func' keyword in source, expect a Wasm function
        expect(generatedWat).toContain('(func');
    }
    if (source.includes('export')) { // Heuristic: if 'export' keyword in source, expect a Wasm export
        expect(generatedWat).toContain('(export');
    }

    // Verify specific WAT substrings are present
    for (const sub of expectedWatSubstrings) {
        expect(generatedWat).toContain(sub);
    }
}

/**
 * A helper function to compile TSAL source code and assert that compilation fails as expected.
 * It verifies that `Alchemist` throws an error and that the `watToWasm` mock was not called,
 * indicating that the error occurred before WAT generation.
 * @param alchemist The Alchemist compiler instance.
 * @param source The TSAL source code to compile.
 * @param expectedErrorMessage An optional RegExp to match against the error message.
 * @returns A Promise that resolves if compilation fails and assertions pass.
 */
export async function expectCompilationFailure(alchemist: Alchemist, source: string, expectedErrorMessage?: RegExp) {
    mockWatToWasm.mockClear(); // Clear mock calls from previous tests
    // Ensure the mock uses its dummy default for consistency.
    mockWatToWasm.mockImplementation(() => new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b]));

    const promise = alchemist.compile(source);
    if (expectedErrorMessage) {
        await expect(promise).rejects.toThrow(expectedErrorMessage);
    } else {
        await expect(promise).rejects.toThrow();
    }
    // For compilation failures due to syntax or semantic errors, Alchemist should ideally
    // throw before attempting to convert WAT to Wasm.
    expect(mockWatToWasm).not.toHaveBeenCalled();
}

/**
 * An advanced helper function to compile TSAL source, instantiate the resulting Wasm module,
 * and return its exports. This serves as an integration test to verify the executability
 * and behavior of the compiled Wasm, not just the compilation process itself.
 * It temporarily overrides the `watToWasm` mock to use the actual `wabt` implementation.
 * @param alchemist The Alchemist compiler instance.
 * @param source The TSAL source code to compile.
 * @param imports Optional WebAssembly imports object (e.g., for host functions, memory).
 * @returns A Promise that resolves with the WebAssembly module's exports.
 * @throws If compilation or Wasm instantiation/execution fails.
 */
export async function compileInstantiateAndRun(alchemist: Alchemist, source: string, imports: WebAssembly.Imports = {}): Promise<WebAssembly.Exports> {
    mockWatToWasm.mockClear(); // Clear any previous mock calls.

    // Store the current mock implementation to restore it later, preventing side effects.
    const originalMockImplementation = mockWatToWasm.getMockImplementation();

    // Temporarily replace the mock implementation with the actual `wabt.watToWasm` for this test.
    // This allows actual WAT-to-Wasm conversion, enabling WebAssembly.instantiate to work correctly.
    mockWatToWasm.mockImplementation(actualWatToWasm);

    try {
        const wasmBytes = await alchemist.compile(source);
        expect(wasmBytes).toBeInstanceOf(Uint8Array);
        expect(wasmBytes.length).toBeGreaterThan(0);

        const { instance } = await WebAssembly.instantiate(wasmBytes, imports);
        return instance.exports;
    } catch (e: any) {
        console.error('Failed to instantiate or run Wasm module:', e);
        throw new Error(`Wasm instantiation failed: ${e.message}`);
    } finally {
        // Restore the original mock implementation after the test, regardless of pass/fail.
        mockWatToWasm.mockImplementation(originalMockImplementation!);
    }
}

describe('Alchemist Compiler', () => {
    let alchemist: Alchemist;

    beforeEach(() => {
        alchemist = new Alchemist();
        // Reset the `mockWatToWasm` to its default dummy implementation before each test.
        // This is crucial to prevent side effects from `compileInstantiateAndRun` tests
        // or other tests that might have temporarily changed the mock's behavior.
        mockWatToWasm.mockClear();
        mockWatToWasm.mockImplementation(() => new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b]));
    });

    // Original test case: basic function compilation
    it('should compile simple TSAL code without throwing', async () => {
        const source = 'export func add(a: i32, b: i32): i32 { return a + b; }';
        await expectCompilationSuccess(alchemist, source, ['(func $add (param $a i32) (param $b i32) (result i32)', 'i32.add']);
    });

    // --- New Feature & Test Cases for Comprehensive Coverage ---

    it('should compile a function with local variables', async () => {
        const source = `
            export func calculate(x: i32, y: i32): i32 {
                let temp1: i32 = x * 2;
                let temp2: i32 = y + 10;
                return temp1 - temp2;
            }
        `;
        await expectCompilationSuccess(alchemist, source, [
            '(func $calculate (param $x i32) (param $y i32) (result i32)',
            '(local $temp1 i32)', '(local $temp2 i32)',
            'i32.mul', 'i32.const 10', 'i32.add', 'i32.sub'
        ]);
    });

    it('should compile control flow statements (if-else)', async () => {
        const source = `
            export func max(a: i32, b: i32): i32 {
                if (a > b) {
                    return a;
                } else {
                    return b;
                }
            }
        `;
        await expectCompilationSuccess(alchemist, source, [
            '(func $max (param $a i32) (param $b i32) (result i32)',
            'i32.gt_s', '(if (result i32)', '(then', '(local.get $a)', '(else', '(local.get $b)'
        ]);
    });

    it('should compile control flow statements (while loop)', async () => {
        const source = `
            export func factorial(n: i32): i32 {
                let result: i32 = 1;
                let i: i32 = 1;
                while (i <= n) {
                    result = result * i;
                    i = i + 1;
                }
                return result;
            }
        `;
        await expectCompilationSuccess(alchemist, source, [
            '(func $factorial (param $n i32) (result i32)',
            '(local $result i32) (local $i i32)',
            '(loop $label$0', // Loop start label
            '(i32.le_s', '(br_if $label$1)', // Condition check and break if false
            '(i32.mul)', '(i32.const 1)', '(i32.add)', '(br $label$0)' // Increment and loop back
        ]);
    });

    it('should compile different integer types (i64)', async () => {
        const source = `
            export func add64(a: i64, b: i64): i64 { return a + b; }
        `;
        await expectCompilationSuccess(alchemist, source, ['(func $add64 (param $a i64) (param $b i64) (result i64)', 'i64.add']);
    });

    it('should compile floating point types (f32, f64)', async () => {
        const source = `
            export func sumFloats(x: f32, y: f32): f32 { return x + y; }
            export func divDoubles(a: f64, b: f64): f64 { return a / b; }
        `;
        await expectCompilationSuccess(alchemist, source, [
            '(func $sumFloats (param $x f32) (param $y f32) (result f32)', 'f32.add',
            '(func $divDoubles (param $a f64) (param $b f64) (result f64)', 'f64.div'
        ]);
    });

    it('should compile a module with multiple functions and inter-function calls', async () => {
        const source = `
            func subtract(a: i32, b: i32): i32 { return a - b; }
            export func calculate(x: i32, y: i32): i32 {
                return subtract(x * 2, y + 1);
            }
        `;
        await expectCompilationSuccess(alchemist, source, [
            '(func $subtract (param $a i32) (param $b i32) (result i32)', 'i32.sub',
            '(func $calculate (param $x i32) (param $y i32) (result i32)',
            'call $subtract'
        ]);
    });

    it('should compile global variables', async () => {
        const source = `
            global mut counter: i32 = 0;
            export func increment(): i32 {
                counter = counter + 1;
                return counter;
            }
            export func getCounter(): i32 {
                return counter;
            }
        `;
        await expectCompilationSuccess(alchemist, source, [
            '(global $counter (mut i32) (i32.const 0))',
            '(func $increment', 'global.get $counter', 'i32.const 1', 'i32.add', 'global.set $counter',
            '(func $getCounter', 'global.get $counter'
        ]);
    });

    it('should handle empty source code', async () => {
        const source = '';
        await expectCompilationSuccess(alchemist, source, ['(module']); // An empty module is valid WAT
    });

    it('should handle source code with only comments', async () => {
        const source = `
            // This is a comment
            /*
             * Another multiline comment
             */
        `;
        await expectCompilationSuccess(alchemist, source, ['(module']); // Still an empty module
    });

    // --- Error Handling Test Cases ---

    it('should throw an error for invalid TSAL syntax', async () => {
        const source = 'export func invalid_syntax { return 1; }'; // Missing type for function
        await expectCompilationFailure(alchemist, source, /Syntax error|parsing error/i);
    });

    it('should throw an error for type mismatch in return', async () => {
        const source = 'export func test(): i32 { return 1.0; }'; // Returning f64 for i32
        await expectCompilationFailure(alchemist, source, /Type mismatch|Expected i32, got f64/i);
    });

    it('should throw an error for undeclared variable usage', async () => {
        const source = 'export func test(): i32 { return undeclaredVar; }';
        await expectCompilationFailure(alchemist, source, /Undeclared variable|symbol not found/i);
    });

    it('should throw an error for incompatible argument types in function call', async () => {
        const source = `
            func helper(a: i32): void {}
            export func main(): void { helper(1.0); } // Passing f64 to i32 param
        `;
        await expectCompilationFailure(alchemist, source, /Type mismatch|Expected i32, got f64/i);
    });

    // --- Integration Tests: Compile and Run Wasm ---

    it('should correctly compile and run a simple function via WebAssembly instantiation', async () => {
        const source = 'export func sum(a: i32, b: i32): i32 { return a + b; }';
        const exports = await compileInstantiateAndRun(alchemist, source);

        expect(exports.sum).toBeTypeOf('function');
        expect((exports.sum as Function)(5, 3)).toBe(8);
        expect((exports.sum as Function)(-10, 20)).toBe(10);
    });

    it('should correctly compile and run a function with global mutable state', async () => {
        const source = `
            global mut count: i32 = 0;
            export func increment(): void {
                count = count + 1;
            }
            export func getCount(): i32 {
                return count;
            }
        `;
        const exports = await compileInstantiateAndRun(alchemist, source);

        expect(exports.increment).toBeTypeOf('function');
        expect(exports.getCount).toBeTypeOf('function');

        expect((exports.getCount as Function)()).toBe(0);
        (exports.increment as Function)();
        expect((exports.getCount as Function)()).toBe(1);
        (exports.increment as Function)();
        (exports.increment as Function)();
        expect((exports.getCount as Function)()).toBe(3);
    });

    it('should compile and run functions using memory operations', async () => {
        // This example assumes TSAL has syntax for `load` and `store` from a default memory.
        const source = `
            export func writeToMemory(address: i32, value: i32): void {
                memory[address] = value; // Assumed TSAL syntax for memory access
            }
            export func readFromMemory(address: i32): i32 {
                return memory[address]; // Assumed TSAL syntax for memory access
            }
        `;
        // We need to provide a memory import for WebAssembly.instantiate
        const memory = new WebAssembly.Memory({ initial: 1 }); // 1 page = 64KB
        const imports = { env: { memory } };

        const exports = await compileInstantiateAndRun(alchemist, source, imports);

        expect(exports.writeToMemory).toBeTypeOf('function');
        expect(exports.readFromMemory).toBeTypeOf('function');

        const dataView = new DataView(memory.buffer);

        // Test writing values
        (exports.writeToMemory as Function)(0, 123);
        expect(dataView.getInt32(0, true)).toBe(123); // true for little-endian

        (exports.writeToMemory as Function)(4, -456);
        expect(dataView.getInt32(4, true)).toBe(-456);

        // Test reading values
        expect((exports.readFromMemory as Function)(0)).toBe(123);
        expect((exports.readFromMemory as Function)(4)).toBe(-456);

        // Also assert WAT output for memory operations (separate call to avoid mock collision)
        await expectCompilationSuccess(alchemist, source, [
            '(memory (export "memory") 1)', // Assuming Alchemist implicitly declares and exports memory if used
            '(func $writeToMemory', 'i32.store',
            '(func $readFromMemory', 'i32.load'
        ]);
    });

    it('should correctly compile and run a function calling a host-imported function', async () => {
        // This example assumes TSAL has an `import func` syntax for external functions.
        const source = `
            import func logValue(val: i32): void;
            export func processAndLog(input: i32): void {
                let processed: i32 = input * 2;
                logValue(processed);
            }
        `;

        const mockLogValue = vi.fn();
        const imports = {
            env: { // Assuming 'env' is the module name for imports
                logValue: mockLogValue
            }
        };

        const exports = await compileInstantiateAndRun(alchemist, source, imports);

        expect(exports.processAndLog).toBeTypeOf('function');
        expect(mockLogValue).not.toHaveBeenCalled();

        (exports.processAndLog as Function)(10);
        expect(mockLogValue).toHaveBeenCalledTimes(1);
        expect(mockLogValue).toHaveBeenCalledWith(20); // 10 * 2

        (exports.processAndLog as Function)(5);
        expect(mockLogValue).toHaveBeenCalledTimes(2);
        expect(mockLogValue).toHaveBeenCalledWith(10); // 5 * 2

        // Also assert WAT output for imported functions (separate call to avoid mock collision)
        await expectCompilationSuccess(alchemist, source, [
            '(import "env" "logValue" (func $logValue (param i32)))',
            '(func $processAndLog', 'call $logValue'
        ]);
    });
});