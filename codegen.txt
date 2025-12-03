// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview The Code Generator for the Alchemist compiler.
 * It takes a validated AST and emits WebAssembly Text Format (WAT) code.
 * This class provides comprehensive generation capabilities for various language constructs
 * including variables, control flow, functions, and basic memory operations,
 * adhering to high-quality coding standards.
 */

import * as AST from '../../tsal/syntax/ast';

/**
 * Interface for symbol table entries.
 * Represents information about variables, functions, and other entities in the WAT code.
 */
interface SymbolEntry {
    kind: 'local' | 'global' | 'function' | 'param';
    name: string;
    wasmType: string; // The Wasm type string (e.g., 'i32', 'f64')
    index?: number; // For locals, globals, params, functions (table index)
    isMutable?: boolean; // For globals, locals
    signature?: { paramTypes: string[], returnType: string }; // For functions
}

export class CodeGenerator {
    private wat: string = '';
    private indentLevel: number = 0;

    // Symbol table management
    private globalSymbols: Map<string, SymbolEntry> = new Map(); // Stores global variables and function declarations
    private scopeStack: Array<Map<string, SymbolEntry>> = []; // Stack of local scopes
    private currentScope: Map<string, SymbolEntry> = new Map(); // Current active local scope

    // Function-specific context
    private nextLocalIndex: number = 0; // Counter for local variable indices within current function
    private currentFunctionReturnType: AST.TypeAnnotationNode | null = null;
    private currentFunctionLocalsDeclaration: string[] = []; // Collects '(local $name type)' declarations

    // Global counters
    private nextGlobalIndex: number = 0; // Counter for global variable indices
    private nextFunctionTableIndex: number = 0; // Counter for function indices in the table (if using call_indirect)
    // private nextMemoryIndex: number = 0; // Counter for memory sections (currently just 0, default exported)

    // Control flow labels
    private loopLabels: { blockLabel: string; loopLabel: string }[] = []; // Stack for loop labels (for break/continue)
    private labelCounter: number = 0; // For generating unique labels

    /**
     * Generates WebAssembly Text Format (WAT) code from the given AST ProgramNode.
     * @param node The root ProgramNode of the Abstract Syntax Tree.
     * @returns The generated WAT code as a string.
     */
    public generate(node: AST.ProgramNode): string {
        this.reset(); // Clear state for a new generation pass

        this.emit('(module');
        this.indent();

        // Standard library imports could go here, e.g., for console logging, environment memory.
        // For demonstration, we assume a default memory export.
        this.emit(`(memory (export "memory") 1)`); // Export 1 page (64KB) of memory by default

        // Process all top-level statements. Function bodies will be handled within visitFunctionDeclaration.
        node.body.forEach(n => {
            this.visit(n);
        });

        this.dedent();
        this.emit(')');
        return this.wat;
    }

    /**
     * Resets the code generator's internal state for a new generation process.
     * This ensures a clean slate for each compilation.
     */
    private reset(): void {
        this.wat = '';
        this.indentLevel = 0;
        this.globalSymbols.clear();
        this.scopeStack = [];
        this.currentScope = new Map();
        this.nextLocalIndex = 0;
        this.nextGlobalIndex = 0;
        this.nextFunctionTableIndex = 0;
        // this.nextMemoryIndex = 0; // Not strictly needed as we just export one default memory
        this.currentFunctionReturnType = null;
        this.currentFunctionLocalsDeclaration = [];
        this.loopLabels = [];
        this.labelCounter = 0;
    }

    /**
     * Dispatches the AST node to the appropriate visit method for code generation.
     * Ensures all known AST node types are handled or an error is thrown for unknown types.
     * @param node The AST node to visit.
     */
    private visit(node: AST.ASTNode): void {
        switch (node.type) {
            case 'FunctionDeclaration': return this.visitFunctionDeclaration(node as AST.FunctionDeclarationNode);
            case 'BlockStatement': return this.visitBlockStatement(node as AST.BlockStatementNode);
            case 'ReturnStatement': return this.visitReturnStatement(node as AST.ReturnStatementNode);
            case 'VariableDeclaration': return this.visitVariableDeclaration(node as AST.VariableDeclarationNode);
            case 'AssignmentExpression': return this.visitAssignmentExpression(node as AST.AssignmentExpressionNode);
            case 'IfStatement': return this.visitIfStatement(node as AST.IfStatementNode);
            case 'WhileStatement': return this.visitWhileStatement(node as AST.WhileStatementNode);
            case 'BreakStatement': return this.visitBreakStatement(node as AST.BreakStatementNode);
            case 'ContinueStatement': return this.visitContinueStatement(node as AST.ContinueStatementNode);
            case 'CallExpression': return this.visitCallExpression(node as AST.CallExpressionNode);
            case 'GlobalDeclaration': return this.visitGlobalDeclaration(node as AST.GlobalDeclarationNode);
            case 'BinaryExpression': return this.visitBinaryExpression(node as AST.BinaryExpressionNode);
            case 'UnaryExpression': return this.visitUnaryExpression(node as AST.UnaryExpressionNode);
            case 'Identifier': return this.visitIdentifier(node as AST.IdentifierNode);
            case 'Literal': return this.visitLiteral(node as AST.LiteralNode);
            case 'ExpressionStatement': return this.visitExpressionStatement(node as AST.ExpressionStatementNode);
            default: throw new Error(`CodeGenerator: Unknown or unhandled AST node type: ${node.type}`);
        }
    }

    /**
     * Handles function declarations, including parameters, return types, and body generation.
     * This method buffers the function body's WAT to correctly place local declarations.
     * @param node The FunctionDeclarationNode.
     */
    private visitFunctionDeclaration(node: AST.FunctionDeclarationNode) {
        // Register function signature in global symbols if not already present
        if (this.globalSymbols.has(node.id.name) && this.globalSymbols.get(node.id.name)?.kind === 'function') {
             // Already registered (e.g., from an earlier pass or forward declaration)
        } else {
            const paramTypes = node.parameters.map(p => this.mapType(p.paramType));
            const returnType = this.mapType(node.returnType);
            this.globalSymbols.set(node.id.name, {
                kind: 'function',
                name: node.id.name,
                wasmType: 'func', // Wasm doesn't have a 'func' type per se, but it indicates kind
                index: this.nextFunctionTableIndex++,
                signature: { paramTypes, returnType }
            });
        }

        let funcHeader = `(func $${node.id.name}`;
        if (node.modifiers.includes('export')) {
            funcHeader += ` (export "${node.id.name}")`;
        }

        // --- Prepare function context and parameters ---
        this.pushScope(); // New scope for function parameters and locals
        this.nextLocalIndex = 0; // Reset local index for each function
        this.currentFunctionLocalsDeclaration = []; // Clear collected local declarations for THIS function
        this.currentFunctionReturnType = node.returnType;

        node.parameters.forEach(p => {
            const wasmType = this.mapType(p.paramType);
            funcHeader += ` (param $${p.id.name} ${wasmType})`;
            this.declareSymbol(p.id.name, {
                kind: 'param',
                name: p.id.name,
                wasmType: wasmType,
                index: this.nextLocalIndex++
            });
        });

        const returnWasmType = this.mapType(node.returnType);
        if (returnWasmType !== 'void') { // Wasm functions can have no result
            funcHeader += ` (result ${returnWasmType})`;
        }
        this.emit(funcHeader); // Emit the function header

        this.indent();

        // --- Generate body content into a temporary buffer ---
        const originalWat = this.wat; // Save current WAT content
        this.wat = ''; // Clear wat to capture only function body instructions

        this.visit(node.body); // This call will recursively generate instructions and populate `currentFunctionLocalsDeclaration`

        const bodyWat = this.wat; // Store the generated body instructions
        this.wat = originalWat; // Restore the original WAT content builder

        // --- Assemble full function WAT ---
        // Emit local variable declarations, which must appear before any instructions
        this.currentFunctionLocalsDeclaration.forEach(localDecl => this.emit(localDecl));
        
        // Emit the actual function body instructions
        bodyWat.split('\n').filter(line => line.trim() !== '').forEach(line => this.emit(line));

        this.dedent();
        this.emit(')'); // Close func

        // --- Clean up function context ---
        this.popScope(); // Exit function scope
        this.currentFunctionReturnType = null;
        this.currentFunctionLocalsDeclaration = [];
    }

    /**
     * Handles block statements, managing scope for variables declared within.
     * @param node The BlockStatementNode.
     */
    private visitBlockStatement(node: AST.BlockStatementNode) {
        this.pushScope(); // New scope for the block
        node.body.forEach(s => this.visit(s));
        this.popScope(); // Exit block scope
    }
    
    /**
     * Handles return statements. An explicit 'return' opcode is emitted.
     * @param node The ReturnStatementNode.
     */
    private visitReturnStatement(node: AST.ReturnStatementNode) {
        if (node.argument) {
            this.visit(node.argument); // Push return value onto the stack
        }
        // An explicit 'return' opcode ensures an early exit or correct value propagation.
        this.emit('return');
    }

    /**
     * Handles variable declarations (local variables within functions).
     * @param node The VariableDeclarationNode.
     */
    private visitVariableDeclaration(node: AST.VariableDeclarationNode) {
        const wasmType = this.mapType(node.varType);
        const name = node.id.name;

        // Check for redeclaration in the immediate scope (excluding shadowing in outer scopes)
        if (this.currentScope.has(name) && 
            (this.currentScope.get(name)?.kind === 'local' || this.currentScope.get(name)?.kind === 'param')) {
            throw new Error(`CodeGenerator: Redeclaration of local or parameter '${name}' in the same function scope.`);
        }

        // Declare the symbol and assign its local index
        this.declareSymbol(name, {
            kind: 'local',
            name: name,
            wasmType: wasmType,
            index: this.nextLocalIndex++,
            isMutable: true // All locals are mutable in Wasm
        });

        // Collect the local declaration string to be emitted at the function's top.
        this.currentFunctionLocalsDeclaration.push(`(local $${name} ${wasmType})`);

        // If there's an initializer, generate code for the initializer and then set the local.
        if (node.init) {
            this.visit(node.init);
            this.emit(`(local.set $${name})`);
        }
    }

    /**
     * Handles assignment expressions (e.g., `x = 5;`).
     * @param node The AssignmentExpressionNode.
     */
    private visitAssignmentExpression(node: AST.AssignmentExpressionNode) {
        if (node.left.type !== 'Identifier') {
            throw new Error(`CodeGenerator: Invalid left-hand side of assignment. Expected Identifier, got: ${node.left.type}`);
        }
        const targetName = (node.left as AST.IdentifierNode).name;
        const symbol = this.resolveSymbol(targetName);

        if (!symbol) {
            throw new Error(`CodeGenerator: Cannot assign to undeclared identifier: '${targetName}'.`);
        }
        if (symbol.kind === 'function') {
             throw new Error(`CodeGenerator: Cannot assign to a function identifier: '${targetName}'.`);
        }
        if (!symbol.isMutable) {
            throw new Error(`CodeGenerator: Cannot assign to immutable identifier: '${targetName}'.`);
        }

        this.visit(node.right); // Generate code for the value to be assigned
        
        if (symbol.kind === 'local' || symbol.kind === 'param') {
            this.emit(`(local.set $${targetName})`);
        } else if (symbol.kind === 'global') {
            this.emit(`(global.set $${targetName})`);
        } else {
            // This case should ideally not be reached due to earlier checks.
            throw new Error(`CodeGenerator: Assignment target '${targetName}' is not a mutable variable.`);
        }
    }

    /**
     * Handles if-else statements.
     * Emits `(if (then ... ) (else ... ))` WAT structure.
     * @param node The IfStatementNode.
     */
    private visitIfStatement(node: AST.IfStatementNode) {
        this.visit(node.test); // Evaluate the condition, leaving a boolean (i32) on the stack

        // If blocks can have results, but for a general statement, we treat it as void
        // unless explicitly typed to return a value. Here, we assume statement context.
        this.emit('(if');
        this.indent();
        this.emit('(then');
        this.indent();
        this.visit(node.consequent);
        this.dedent();
        this.emit(')'); // close then block

        if (node.alternate) {
            this.emit('(else');
            this.indent();
            this.visit(node.alternate);
            this.dedent();
            this.emit(')'); // close else block
        }
        this.dedent();
        this.emit(')'); // close if block
    }

    /**
     * Handles while loop statements.
     * Emits `(block $blockLabel (loop $loopLabel ...))` WAT structure.
     * @param node The WhileStatementNode.
     */
    private visitWhileStatement(node: AST.WhileStatementNode) {
        const blockLabel = this.getNextLabel();
        const loopLabel = this.getNextLabel();
        this.loopLabels.push({ blockLabel, loopLabel }); // Push labels onto stack for break/continue

        this.emit(`(block $${blockLabel}`);
        this.indent();
        this.emit(`(loop $${loopLabel}`);
        this.indent();

        this.visit(node.test); // Evaluate loop condition
        this.emit('i32.eqz'); // If condition is false (0), the result is 1 (true)
        this.emit(`(br_if $${blockLabel})`); // If condition is false, break out of the outer block (loop exit)

        this.visit(node.body); // Generate code for the loop body

        this.emit(`(br $${loopLabel})`); // Unconditionally jump back to the start of the loop
        
        this.dedent();
        this.emit(')'); // Close loop
        this.dedent();
        this.emit(')'); // Close block

        this.loopLabels.pop(); // Pop labels when exiting the loop scope
    }

    /**
     * Handles break statements within loops. Jumps to the associated block label.
     * @param node The BreakStatementNode.
     */
    private visitBreakStatement(node: AST.BreakStatementNode) {
        if (this.loopLabels.length === 0) {
            throw new Error(`CodeGenerator: 'break' statement found outside of a loop context.`);
        }
        // 'break' exits the entire block associated with the loop
        this.emit(`(br $${this.loopLabels[this.loopLabels.length - 1].blockLabel})`);
    }

    /**
     * Handles continue statements within loops. Jumps to the associated loop label.
     * @param node The ContinueStatementNode.
     */
    private visitContinueStatement(node: AST.ContinueStatementNode) {
        if (this.loopLabels.length === 0) {
            throw new Error(`CodeGenerator: 'continue' statement found outside of a loop context.`);
        }
        // 'continue' jumps back to the start of the current loop iteration
        this.emit(`(br $${this.loopLabels[this.loopLabels.length - 1].loopLabel})`);
    }

    /**
     * Handles function call expressions.
     * Pushes arguments onto the stack and then emits the `call` instruction.
     * @param node The CallExpressionNode.
     */
    private visitCallExpression(node: AST.CallExpressionNode) {
        if (node.callee.type !== 'Identifier') {
            throw new Error(`CodeGenerator: Invalid callee type in call expression. Expected Identifier, got: ${node.callee.type}`);
        }

        const funcName = node.callee.name;
        const funcSymbol = this.resolveSymbol(funcName);

        if (!funcSymbol || funcSymbol.kind !== 'function') {
            throw new Error(`CodeGenerator: Call to undeclared or non-function identifier: '${funcName}'.`);
        }

        // Emit arguments onto the stack in order
        node.arguments.forEach(arg => this.visit(arg));

        this.emit(`(call $${funcName})`);
    }

    /**
     * Handles global variable declarations.
     * Emits `(global $name (mut type) (init_expr))` WAT structure.
     * @param node The GlobalDeclarationNode.
     */
    private visitGlobalDeclaration(node: AST.GlobalDeclarationNode) {
        const wasmType = this.mapType(node.globalType);
        const name = node.id.name;

        if (this.globalSymbols.has(name)) {
            throw new Error(`CodeGenerator: Global variable '${name}' already declared.`);
        }

        this.globalSymbols.set(name, {
            kind: 'global',
            name: name,
            wasmType: wasmType,
            index: this.nextGlobalIndex++,
            isMutable: node.mutable
        });

        let globalDef = `(global $${name}`;
        if (node.mutable) {
            globalDef += ` (mut ${wasmType})`;
        } else {
            globalDef += ` ${wasmType}`;
        }
        this.emit(globalDef);
        this.indent();
        this.visit(node.init); // Initializer expression, must produce a constant value
        this.dedent();
        this.emit(')');
    }
    
    /**
     * Handles binary expressions (arithmetic, comparison, logical).
     * Automatically infers and uses appropriate Wasm operators.
     * @param node The BinaryExpressionNode.
     */
    private visitBinaryExpression(node: AST.BinaryExpressionNode) {
        this.visit(node.left);
        this.visit(node.right);

        // Simplified type inference: assumes both operands are of the same Wasm type.
        // A full compiler would have a type checker determining this rigorously.
        const type = this.determineExpressionType(node.left); 

        switch(node.operator) {
            case '+': this.emit(`${type}.add`); break;
            case '-': this.emit(`${type}.sub`); break;
            case '*': this.emit(`${type}.mul`); break;
            case '/': this.emit(`${type}.div_s`); break; // Signed division for integers, float division for floats
            case '%': this.emit(`${type}.rem_s`); break; // Remainder for integers (no float remainder in Wasm)
            case '==': this.emit(`${type}.eq`); break;
            case '!=': this.emit(`${type}.ne`); break;
            case '<': this.emit(`${type}.lt_s`); break; // Signed less than for integers, standard for floats
            case '<=': this.emit(`${type}.le_s`); break; // Signed less than or equal
            case '>': this.emit(`${type}.gt_s`); break; // Signed greater than
            case '>=': this.emit(`${type}.ge_s`); break; // Signed greater than or equal
            case '&&': this.emit(`${type}.and`); break; // Bitwise AND, common for logical AND with 0/1 integers
            case '||': this.emit(`${type}.or`); break;  // Bitwise OR, common for logical OR with 0/1 integers
            default: throw new Error(`CodeGenerator: Unsupported binary operator: ${node.operator}`);
        }
    }

    /**
     * Handles unary expressions (e.g., negation, logical NOT).
     * @param node The UnaryExpressionNode.
     */
    private visitUnaryExpression(node: AST.UnaryExpressionNode) {
        this.visit(node.argument);
        const type = this.determineExpressionType(node.argument); // Simplified type inference

        switch (node.operator) {
            case '-': // Numeric negation
                if (type === 'i32') {
                    this.emit('(i32.const 0)'); // Push 0 onto stack
                    this.emit('i32.sub'); // Subtract original value from 0
                } else if (type === 'f32') {
                    this.emit('f32.neg');
                } else if (type === 'f64') {
                    this.emit('f64.neg');
                } else {
                    throw new Error(`CodeGenerator: Unsupported type for unary negation: '${type}'.`);
                }
                break;
            case '!': // Logical NOT (operates on i32 as boolean 0/1)
                this.emit('i32.eqz'); // Compare with zero (returns 1 if 0, 0 if non-zero)
                break;
            default:
                throw new Error(`CodeGenerator: Unsupported unary operator: ${node.operator}`);
        }
    }

    /**
     * Handles identifier references (getting local or global variable values).
     * @param node The IdentifierNode.
     */
    private visitIdentifier(node: AST.IdentifierNode) {
        const symbol = this.resolveSymbol(node.name);
        if (!symbol) {
            throw new Error(`CodeGenerator: Undefined identifier: '${node.name}'.`);
        }

        if (symbol.kind === 'local' || symbol.kind === 'param') {
            this.emit(`(local.get $${node.name})`);
        } else if (symbol.kind === 'global') {
            this.emit(`(global.get $${node.name})`);
        } else {
            // Function identifiers are handled in CallExpression, not here for 'get' operations.
            throw new Error(`CodeGenerator: Cannot 'get' value for non-variable identifier: '${node.name}'.`);
        }
    }

    /**
     * Handles literal values (numbers, booleans).
     * String literals would require memory management not implemented here.
     * @param node The LiteralNode.
     */
    private visitLiteral(node: AST.LiteralNode) {
        if (typeof node.value === 'number') {
            // Default to i32 for number literals, could be refined by type inference
            this.emit(`(i32.const ${node.value})`);
        } else if (typeof node.value === 'boolean') {
            this.emit(`(i32.const ${node.value ? 1 : 0})`); // Booleans represented as i32 (1 for true, 0 for false)
        }
        else {
            throw new Error(`CodeGenerator: Unsupported literal type: ${typeof node.value} with value '${node.value}'.`);
        }
    }

    /**
     * Handles expression statements (an expression used as a statement, e.g., a function call without assignment).
     * If the expression produces a result, it is dropped from the stack.
     * @param node The ExpressionStatementNode.
     */
    private visitExpressionStatement(node: AST.ExpressionStatementNode) {
        this.visit(node.expression);
        // If an expression used as a statement leaves a value on the stack, it must be dropped.
        // Otherwise, it accumulates and can lead to validation errors or unexpected behavior.
        const exprType = this.determineExpressionType(node.expression);
        if (exprType !== 'void') { // If the expression produces a result, drop it
            this.emit('drop');
        }
    }

    /**
     * Maps an AST type annotation node to its corresponding WebAssembly Text Format type string.
     * @param typeNode The AST TypeAnnotationNode.
     * @returns The WAT type string (e.g., 'i32', 'f64', 'void').
     */
    private mapType(typeNode: AST.TypeAnnotationNode): string {
        switch (typeNode.type) {
            case 'I32Type': return 'i32';
            case 'I64Type': return 'i64';
            case 'F32Type': return 'f32';
            case 'F64Type': return 'f64';
            case 'VoidType': return 'void'; // Special handling for Wasm functions with no result type
            case 'BooleanType': return 'i32'; // Booleans are represented as i32 in Wasm (0 or 1)
            case 'StringType': throw new Error(`CodeGenerator: String type '${typeNode.type}' is not directly representable as a Wasm value type for operations. Requires memory management.`);
            default: throw new Error(`CodeGenerator: Unsupported type for Wasm: '${typeNode.type}'.`);
        }
    }

    /**
     * A simplified method to determine the Wasm type for an expression.
     * In a production compiler, this would come from a comprehensive type checker.
     * For now, it makes assumptions based on node types.
     * @param node The expression node.
     * @returns The estimated Wasm type string.
     */
    private determineExpressionType(node: AST.ExpressionNode): string {
        switch (node.type) {
            case 'Literal':
                const literalNode = node as AST.LiteralNode;
                if (typeof literalNode.value === 'number') return 'i32'; // Default to i32 for numbers
                if (typeof literalNode.value === 'boolean') return 'i32'; // Booleans as i32
                break;
            case 'Identifier':
                const symbol = this.resolveSymbol((node as AST.IdentifierNode).name);
                if (symbol) return symbol.wasmType;
                break;
            case 'BinaryExpression':
                // For binary ops, assume result type is same as operands (e.g., i32 + i32 = i32).
                // This requires a strong type system to ensure operands are compatible.
                return this.determineExpressionType((node as AST.BinaryExpressionNode).left);
            case 'UnaryExpression':
                return this.determineExpressionType((node as AST.UnaryExpressionNode).argument);
            case 'CallExpression':
                const funcName = (node as AST.CallExpressionNode).callee.name;
                const funcSymbol = this.resolveSymbol(funcName);
                if (funcSymbol?.kind === 'function' && funcSymbol.signature) {
                    return funcSymbol.signature.returnType;
                }
                break;
            // Add more cases for other expression types as needed (e.g., MemberExpression for objects)
        }
        // Fallback: If type cannot be determined, default to 'i32' but log an error or warning.
        // This is a simplification; a robust compiler would error out if a type is unknown.
        console.warn(`CodeGenerator: Could not determine type for expression node '${node.type}'. Defaulting to i32.`);
        return 'i32';
    }

    /**
     * Pushes a new scope onto the scope stack.
     * New symbols declared will belong to this scope.
     */
    private pushScope() {
        this.scopeStack.push(this.currentScope);
        this.currentScope = new Map(this.currentScope); // Inherit symbols from parent scope
    }

    /**
     * Pops the current scope from the scope stack.
     * Exiting a scope removes its local symbols from resolution.
     */
    private popScope() {
        this.currentScope = this.scopeStack.pop() || new Map();
    }

    /**
     * Declares a symbol in the current active scope.
     * Throws an error if a local/parameter symbol is already declared in the same scope.
     * @param name The name of the symbol.
     * @param entry The SymbolEntry object describing the symbol.
     */
    private declareSymbol(name: string, entry: SymbolEntry) {
        if (this.currentScope.has(name) && 
            (entry.kind === 'local' || entry.kind === 'param') &&
            (this.currentScope.get(name)?.kind === 'local' || this.currentScope.get(name)?.kind === 'param')) {
            throw new Error(`CodeGenerator: Redeclaration of local variable or parameter '${name}' in the current function scope.`);
        }
        this.currentScope.set(name, entry);
    }

    /**
     * Resolves a symbol, searching from the current local scope up through parent scopes to global symbols.
     * @param name The name of the symbol to resolve.
     * @returns The SymbolEntry if found, otherwise undefined.
     */
    private resolveSymbol(name: string): SymbolEntry | undefined {
        // Check current local scope first
        if (this.currentScope.has(name)) {
            return this.currentScope.get(name);
        }
        // Then check global symbols (functions and global variables)
        return this.globalSymbols.get(name);
    }

    /**
     * Generates a unique label string for Wasm blocks or loops, ensuring no naming conflicts.
     * @returns A unique label string, prefixed with '$label'.
     */
    private getNextLabel(): string {
        return `$label${this.labelCounter++}`;
    }

    /**
     * Appends a string to the WAT output, automatically applying the current indentation level.
     * @param str The string (WAT instruction or directive) to emit.
     */
    private emit(str: string) {
        this.wat += `${'  '.repeat(this.indentLevel)}${str}\n`;
    }

    /**
     * Increases the current indentation level for pretty-printing the WAT output.
     */
    private indent() { this.indentLevel++; }

    /**
     * Decreases the current indentation level.
     * Throws an error if indentation goes below zero, indicating a structural issue.
     */
    private dedent() { 
        if (this.indentLevel <= 0) {
            throw new Error('CodeGenerator: Indentation level fell below zero, indicating a mismatched block structure.');
        }
        this.indentLevel--; 
    }
}