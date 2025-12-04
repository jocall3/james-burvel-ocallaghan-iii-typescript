// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview Defines the Abstract Syntax Tree (AST) structure for the TSAL language.
 * Each interface represents a node in the tree that the Alchemist compiler will parse,
 * analyze, and generate code from. This AST is designed to capture the high-level,
 * physics-inspired concepts of TSAL.
 */

// --- Base Node Type ---
export interface ASTNode {
    type: string;
    loc?: { start: { line: number, column: number }, end: { line: number, column: number } };
    /**
     * Unique identifier for each node. This can be used by compiler passes
     * (e.g., symbol resolution, intermediate representation generation)
     * to refer to specific nodes without relying on object identity.
     */
    nodeId?: number;
}

// --- Type Annotations ---
/**
 * Defines the various types that can be annotated in TSAL.
 * This includes primitive types, references, shared memory buffers,
 * and new physics-inspired and structured types.
 */
export type TypeAnnotationNode =
    | { type: 'I32Type' } | { type: 'I64Type' } | { type: 'F32Type' } | { type: 'F64Type' }
    | { type: 'BoolType' } | { type: 'MemPtrType' } | { type: 'StringRefType' }
    | { type: 'HostRefType', typeName: string } // Reference to a type defined in the host environment (e.g., a JavaScript object type)
    | { type: 'SharedMemBufferType', elementType: TypeAnnotationNode } // A buffer of shared memory, for inter-process or multi-threaded communication
    | { type: 'CustomTypeRef', name: IdentifierNode } // Reference to a user-defined type (e.g., struct, enum, type alias)
    | { type: 'ArrayType', elementType: TypeAnnotationNode, size?: ExpressionNode } // Array type, optionally with a compile-time fixed size
    | { type: 'TupleType', elementTypes: TypeAnnotationNode[] } // Fixed-size ordered collection of potentially different types
    | { type: 'QuantumStateVectorType', basis: string[] } // Represents a quantum state vector in a specific basis (e.g., ["|0>", "|1>"])
    | { type: 'UnitType', unit: string }; // Represents a physical unit, e.g., "meters", "kg/s", useful for dimensional analysis

// --- Expressions (The building blocks of computation) ---
/** Represents an identifier, e.g., a variable name or function name. */
export interface IdentifierNode extends ASTNode { type: 'Identifier'; name: string; }
/** Represents a literal value, such as numbers, booleans, or strings. */
export interface LiteralNode extends ASTNode { type: 'Literal'; value: number | bigint | boolean | string; }
/** Represents a literal quantum state, e.g., "|0>", "|1>", "|psi>". */
export interface QuantumStateLiteralNode extends ASTNode { type: 'QuantumStateLiteral'; value: string; }
/** Represents a named physical constant, e.g., "PLANCKS_CONSTANT", "SPEED_OF_LIGHT". */
export interface PhysicalConstantNode extends ASTNode { type: 'PhysicalConstant'; name: string; }
/** Represents a binary operation, e.g., `a + b`, `x * y`, `p == q`. */
export interface BinaryExpressionNode extends ASTNode { type: 'BinaryExpression'; operator: string; left: ExpressionNode; right: ExpressionNode; }
/** Represents a function call, e.g., `myFunction(arg1, arg2)`. */
export interface CallExpressionNode extends ASTNode { type: 'CallExpression'; callee: IdentifierNode; arguments: ExpressionNode[]; }
/**
 * Represents a quantum entanglement operation or a specific quantum gate application.
 * This is a core physics-inspired feature of TSAL.
 */
export interface EntanglementOperationNode extends ASTNode {
    type: 'EntanglementOperation';
    callee: IdentifierNode; // The quantum gate or operation being applied (e.g., 'CNOT', 'Hadamard')
    arguments: ExpressionNode[]; // Qubits or quantum states involved in the operation
    hostNamespace: string; // Specifies the quantum host environment or simulator where the operation occurs
}
/** Represents a unary operation, e.g., `-x`, `!condition`. */
export interface UnaryExpressionNode extends ASTNode {
    type: 'UnaryExpression';
    operator: string; // e.g., '-', '!', '~', '++'
    argument: ExpressionNode;
    prefix: boolean; // True if operator comes before operand (e.g., `-x`), false if after (e.g., `x++`)
}
/** Represents an assignment operation, e.g., `x = 5`, `y += 2`. */
export interface AssignmentExpressionNode extends ASTNode {
    type: 'AssignmentExpression';
    operator: string; // e.g., '=', '+=', '-=', '*='
    left: ExpressionNode; // The target of the assignment (must be an L-value, e.g., Identifier, MemberExpression)
    right: ExpressionNode;
}
/** Represents accessing a member of an object/struct or an element of an array, e.g., `obj.property`, `arr[index]`. */
export interface MemberExpressionNode extends ASTNode {
    type: 'MemberExpression';
    object: ExpressionNode; // The object or array
    property: IdentifierNode | ExpressionNode; // Identifier for dot notation (obj.prop), Expression for bracket notation (arr[index])
    computed: boolean; // True if property is an expression (arr[expr]), false if it's an Identifier (obj.prop)
}
/** Represents the creation of a new instance of a type (e.g., a struct) or allocation of memory. */
export interface NewExpressionNode extends ASTNode {
    type: 'NewExpression';
    callee: IdentifierNode; // The type/constructor being instantiated
    arguments: ExpressionNode[]; // Arguments passed to the constructor
}
/** Represents a conditional (ternary) expression, e.g., `condition ? expr1 : expr2`. */
export interface ConditionalExpressionNode extends ASTNode {
    type: 'ConditionalExpression';
    test: ExpressionNode;
    consequent: ExpressionNode;
    alternate: ExpressionNode;
}

/** Union type for all possible expression nodes. */
export type ExpressionNode =
    | IdentifierNode
    | LiteralNode
    | QuantumStateLiteralNode
    | PhysicalConstantNode
    | BinaryExpressionNode
    | CallExpressionNode
    | EntanglementOperationNode
    | UnaryExpressionNode
    | AssignmentExpressionNode
    | MemberExpressionNode
    | NewExpressionNode
    | ConditionalExpressionNode;

// --- Statements (Instructions that perform actions) ---
/** Represents a variable declaration, potentially with an initializer. */
export interface VariableDeclarationNode extends ASTNode {
    type: 'VariableDeclaration';
    id: IdentifierNode;
    varType: TypeAnnotationNode;
    initializer?: ExpressionNode;
    memoryScope: 'local' | 'global' | 'heap'; // Where the variable is allocated
    isMutable: boolean; // Indicates if the variable's value can be reassigned
}
/** Represents a constant declaration, which must be initialized and cannot be reassigned. */
export interface ConstantDeclarationNode extends ASTNode {
    type: 'ConstantDeclaration';
    id: IdentifierNode;
    constType: TypeAnnotationNode;
    initializer: ExpressionNode; // Constants must always be initialized
}
/** Represents a return statement from a function. */
export interface ReturnStatementNode extends ASTNode {
    type: 'ReturnStatement';
    argument?: ExpressionNode; // The expression whose value is returned; optional for void functions
}
/**
 * Represents a quantum state vector collapse, akin to a quantum conditional statement.
 * If the `measurementTarget` collapses to the `expectedState`, the `consequent` block executes.
 */
export interface StateVectorCollapseNode extends ASTNode {
    type: 'StateVectorCollapse';
    measurementTarget: ExpressionNode; // The quantum state/qubit being measured
    expectedState: QuantumStateLiteralNode | LiteralNode; // The specific state or classical value that triggers the consequent
    consequent: BlockStatementNode;
    alternate?: BlockStatementNode; // Optional block for when the state does not collapse to expectedState
}
/** Represents a classical If-Else conditional statement. */
export interface IfStatementNode extends ASTNode {
    type: 'IfStatement';
    test: ExpressionNode;
    consequent: BlockStatementNode;
    alternate?: BlockStatementNode;
}
/**
 * Represents various loop constructs (e.g., `while`, `for`, `do-while`, `for-each`).
 * This provides a unified AST node for different looping mechanisms.
 */
export interface LoopStatementNode extends ASTNode {
    type: 'LoopStatement';
    loopType: 'while' | 'for' | 'do-while' | 'for-each';
    init?: VariableDeclarationNode | ExpressionStatementNode; // Initialization for 'for' loops
    test?: ExpressionNode; // Condition for 'while', 'for' loops
    update?: ExpressionNode; // Update expression for 'for' loops
    iterator?: IdentifierNode; // For 'for-each' loops, the variable holding current item
    iterable?: ExpressionNode; // For 'for-each' loops, the collection to iterate over
    body: BlockStatementNode;
}
/** Represents a `break` statement to exit a loop. */
export interface BreakStatementNode extends ASTNode { type: 'BreakStatement'; label?: IdentifierNode; }
/** Represents a `continue` statement to skip to the next iteration of a loop. */
export interface ContinueStatementNode extends ASTNode { type: 'ContinueStatement'; label?: IdentifierNode; }
/** Represents an expression that is used as a standalone statement (e.g., a function call). */
export interface ExpressionStatementNode extends ASTNode {
    type: 'ExpressionStatement';
    expression: ExpressionNode;
}
/** Represents a quantum measurement operation, projecting a quantum state into a classical result. */
export interface MeasurementStatementNode extends ASTNode {
    type: 'MeasurementStatement';
    target: ExpressionNode; // The quantum state/qubit to measure
    outputRegister: IdentifierNode; // The classical register where the measurement result (e.g., 0 or 1) is stored
}

/** Union type for all possible statement nodes. */
export type StatementNode =
    | VariableDeclarationNode
    | ConstantDeclarationNode
    | ReturnStatementNode
    | StateVectorCollapseNode
    | IfStatementNode
    | LoopStatementNode
    | BreakStatementNode
    | ContinueStatementNode
    | ExpressionStatementNode
    | MeasurementStatementNode;

// --- Blocks & Top-Level Structures ---
/** Represents a block of statements, typically enclosed in curly braces. */
export interface BlockStatementNode extends ASTNode { type: 'BlockStatement'; body: StatementNode[]; }
/** Represents a function parameter. */
export interface ParameterNode extends ASTNode {
    type: 'Parameter';
    id: IdentifierNode;
    paramType: TypeAnnotationNode;
    isMutable: boolean; // Indicates if the parameter can be reassigned within the function body
}
/**
 * Represents a decorator for functions or modules that defines required permissions.
 * This is crucial for security and resource management in the Alchemist ecosystem.
 */
export interface PermissionDecoratorNode extends ASTNode {
    type: 'PermissionDecorator';
    permissionType: 'read' | 'write' | 'network' | 'memory_alloc' | 'quantum_op' | 'host_access'; // Expanded permission types
    resourceName: string; // The specific resource this permission applies to (e.g., "shared_buffer_A", "remote_api")
    level?: 'high' | 'medium' | 'low'; // Optional security level or criticality
}
/** Represents a function declaration. */
export interface FunctionDeclarationNode extends ASTNode {
    type: 'FunctionDeclaration';
    id: IdentifierNode;
    modifiers: ('export' | 'inline' | 'async' | 'pure' | 'host_callable')[]; // Additional modifiers for function behavior
    decorators: PermissionDecoratorNode[];
    parameters: ParameterNode[];
    returnType: TypeAnnotationNode;
    body: BlockStatementNode;
}
/** Represents an import statement, bringing in definitions from other modules. */
export interface ImportDeclarationNode extends ASTNode {
    type: 'ImportDeclaration';
    specifiers: { importedName: string; localName?: string }[]; // Allows aliasing imported names (e.g., `foo as bar`)
    source: string; // The path or identifier of the module to import from
}
/** Represents a block of code marked as "unsafe", implying direct memory access or privileged operations. */
export interface UnsafeBlockNode extends ASTNode {
    type: 'UnsafeBlock';
    body: BlockStatementNode;
}
/** Represents a field within a struct declaration. */
export interface StructFieldNode extends ASTNode {
    type: 'StructField';
    id: IdentifierNode;
    fieldType: TypeAnnotationNode;
    isMutable: boolean; // Whether this field can be changed after the struct instance is created
    initializer?: ExpressionNode; // Optional default value for the field
}
/** Represents a user-defined composite data type (struct). */
export interface StructDeclarationNode extends ASTNode {
    type: 'StructDeclaration';
    id: IdentifierNode;
    fields: StructFieldNode[];
    modifiers: ('export' | 'packed' | 'aligned')[]; // 'packed' for memory layout optimization, 'aligned' for specific alignment
}
/** Represents a type alias declaration, providing a new name for an existing type. */
export interface TypeAliasDeclarationNode extends ASTNode {
    type: 'TypeAliasDeclaration';
    id: IdentifierNode;
    aliasedType: TypeAnnotationNode;
}
/** Represents a member of an enum declaration. */
export interface EnumMemberNode extends ASTNode {
    type: 'EnumMember';
    id: IdentifierNode;
    value?: ExpressionNode; // Optional explicit value for the enum member (e.g., `RED = 1`)
}
/** Represents an enumeration declaration, defining a set of named integral constants. */
export interface EnumDeclarationNode extends ASTNode {
    type: 'EnumDeclaration';
    id: IdentifierNode;
    members: EnumMemberNode[];
    baseType?: TypeAnnotationNode; // The underlying integral type for enum values (e.g., I32Type)
    modifiers: ('export')[];
}

/** Union type for all possible top-level nodes within a TSAL program. */
export type TopLevelNode =
    | FunctionDeclarationNode
    | ImportDeclarationNode
    | StructDeclarationNode
    | TypeAliasDeclarationNode
    | EnumDeclarationNode
    | ConstantDeclarationNode; // Allow top-level constants

/** Represents the entire program, serving as the root of the AST. */
export interface ProgramNode extends ASTNode {
    type: 'Program';
    body: TopLevelNode[];
    sourceFileName?: string; // Original source file name
    version?: string; // TSAL language version used
    targetArchitecture?: string; // Target architecture for compilation (e.g., 'wasm32', 'x86_64', 'quantum_sim')
}

// --- AST Visitor Pattern ---
/**
 * An abstract visitor interface for traversing the AST.
 * Implementations can override specific `visit` methods to perform actions
 * (e.g., semantic analysis, code generation) for different node types.
 * @template T The return type of the visit methods.
 */
export abstract class ASTVisitor<T = void> {
    abstract visitProgram(node: ProgramNode): T;
    abstract visitFunctionDeclaration(node: FunctionDeclarationNode): T;
    abstract visitStructDeclaration(node: StructDeclarationNode): T;
    abstract visitTypeAliasDeclaration(node: TypeAliasDeclarationNode): T;
    abstract visitEnumDeclaration(node: EnumDeclarationNode): T;
    abstract visitImportDeclaration(node: ImportDeclarationNode): T;
    abstract visitUnsafeBlock(node: UnsafeBlockNode): T;
    abstract visitBlockStatement(node: BlockStatementNode): T;
    abstract visitPermissionDecorator(node: PermissionDecoratorNode): T;
    abstract visitParameter(node: ParameterNode): T;
    abstract visitStructField(node: StructFieldNode): T;
    abstract visitEnumMember(node: EnumMemberNode): T;

    // Statements
    abstract visitVariableDeclaration(node: VariableDeclarationNode): T;
    abstract visitConstantDeclaration(node: ConstantDeclarationNode): T;
    abstract visitReturnStatement(node: ReturnStatementNode): T;
    abstract visitStateVectorCollapse(node: StateVectorCollapseNode): T;
    abstract visitIfStatement(node: IfStatementNode): T;
    abstract visitLoopStatement(node: LoopStatementNode): T;
    abstract visitBreakStatement(node: BreakStatementNode): T;
    abstract visitContinueStatement(node: ContinueStatementNode): T;
    abstract visitExpressionStatement(node: ExpressionStatementNode): T;
    abstract visitMeasurementStatement(node: MeasurementStatementNode): T;

    // Expressions
    abstract visitIdentifier(node: IdentifierNode): T;
    abstract visitLiteral(node: LiteralNode): T;
    abstract visitQuantumStateLiteral(node: QuantumStateLiteralNode): T;
    abstract visitPhysicalConstant(node: PhysicalConstantNode): T;
    abstract visitBinaryExpression(node: BinaryExpressionNode): T;
    abstract visitCallExpression(node: CallExpressionNode): T;
    abstract visitEntanglementOperation(node: EntanglementOperationNode): T;
    abstract visitUnaryExpression(node: UnaryExpressionNode): T;
    abstract visitAssignmentExpression(node: AssignmentExpressionNode): T;
    abstract visitMemberExpression(node: MemberExpressionNode): T;
    abstract visitNewExpression(node: NewExpressionNode): T;
    abstract visitConditionalExpression(node: ConditionalExpressionNode): T;

    // Type Annotations - A general entry point, specific traversal logic handled internally
    abstract visitTypeAnnotation(node: TypeAnnotationNode): T;

    /**
     * Fallback method for encountering an ASTNode type that is not explicitly handled.
     * Can be used for error reporting or to provide default behavior.
     */
    abstract visitUnknownNode(node: ASTNode): T;
}

/**
 * A concrete implementation of an ASTVisitor that provides default traversal logic.
 * Subclasses can extend this to implement specific behaviors by overriding
 * `visit` methods for nodes they care about, while relying on the base class
 * to traverse children for other node types.
 */
export class BaseASTTraverser extends ASTVisitor<void> {
    /** Helper method to dispatch to the appropriate visit method based on node type. */
    protected visitNode(node: ASTNode | undefined): void {
        if (!node) {
            return;
        }
        // Increment the next available node ID, if it's not already set
        if (node.nodeId === undefined) {
             node.nodeId = ++_nextNodeId;
        }

        switch (node.type) {
            case 'Program': this.visitProgram(node as ProgramNode); break;
            case 'FunctionDeclaration': this.visitFunctionDeclaration(node as FunctionDeclarationNode); break;
            case 'StructDeclaration': this.visitStructDeclaration(node as StructDeclarationNode); break;
            case 'TypeAliasDeclaration': this.visitTypeAliasDeclaration(node as TypeAliasDeclarationNode); break;
            case 'EnumDeclaration': this.visitEnumDeclaration(node as EnumDeclarationNode); break;
            case 'ImportDeclaration': this.visitImportDeclaration(node as ImportDeclarationNode); break;
            case 'UnsafeBlock': this.visitUnsafeBlock(node as UnsafeBlockNode); break;
            case 'BlockStatement': this.visitBlockStatement(node as BlockStatementNode); break;
            case 'PermissionDecorator': this.visitPermissionDecorator(node as PermissionDecoratorNode); break;
            case 'Parameter': this.visitParameter(node as ParameterNode); break;
            case 'StructField': this.visitStructField(node as StructFieldNode); break;
            case 'EnumMember': this.visitEnumMember(node as EnumMemberNode); break;

            case 'VariableDeclaration': this.visitVariableDeclaration(node as VariableDeclarationNode); break;
            case 'ConstantDeclaration': this.visitConstantDeclaration(node as ConstantDeclarationNode); break;
            case 'ReturnStatement': this.visitReturnStatement(node as ReturnStatementNode); break;
            case 'StateVectorCollapse': this.visitStateVectorCollapse(node as StateVectorCollapseNode); break;
            case 'IfStatement': this.visitIfStatement(node as IfStatementNode); break;
            case 'LoopStatement': this.visitLoopStatement(node as LoopStatementNode); break;
            case 'BreakStatement': this.visitBreakStatement(node as BreakStatementNode); break;
            case 'ContinueStatement': this.visitContinueStatement(node as ContinueStatementNode); break;
            case 'ExpressionStatement': this.visitExpressionStatement(node as ExpressionStatementNode); break;
            case 'MeasurementStatement': this.visitMeasurementStatement(node as MeasurementStatementNode); break;

            case 'Identifier': this.visitIdentifier(node as IdentifierNode); break;
            case 'Literal': this.visitLiteral(node as LiteralNode); break;
            case 'QuantumStateLiteral': this.visitQuantumStateLiteral(node as QuantumStateLiteralNode); break;
            case 'PhysicalConstant': this.visitPhysicalConstant(node as PhysicalConstantNode); break;
            case 'BinaryExpression': this.visitBinaryExpression(node as BinaryExpressionNode); break;
            case 'CallExpression': this.visitCallExpression(node as CallExpressionNode); break;
            case 'EntanglementOperation': this.visitEntanglementOperation(node as EntanglementOperationNode); break;
            case 'UnaryExpression': this.visitUnaryExpression(node as UnaryExpressionNode); break;
            case 'AssignmentExpression': this.visitAssignmentExpression(node as AssignmentExpressionNode); break;
            case 'MemberExpression': this.visitMemberExpression(node as MemberExpressionNode); break;
            case 'NewExpression': this.visitNewExpression(node as NewExpressionNode); break;
            case 'ConditionalExpression': this.visitConditionalExpression(node as ConditionalExpressionNode); break;

            // Type Annotations are handled by a single entry point that dispatches internally
            case 'I32Type':
            case 'I64Type':
            case 'F32Type':
            case 'F64Type':
            case 'BoolType':
            case 'MemPtrType':
            case 'StringRefType':
            case 'HostRefType':
            case 'SharedMemBufferType':
            case 'CustomTypeRef':
            case 'ArrayType':
            case 'TupleType':
            case 'QuantumStateVectorType':
            case 'UnitType':
                this.visitTypeAnnotation(node as TypeAnnotationNode);
                break;
            default:
                this.visitUnknownNode(node);
                break;
        }
    }

    // --- Default Traversal Implementations ---
    visitProgram(node: ProgramNode): void { node.body.forEach(n => this.visitNode(n)); }
    visitFunctionDeclaration(node: FunctionDeclarationNode): void {
        this.visitNode(node.id);
        node.decorators.forEach(d => this.visitNode(d));
        node.parameters.forEach(p => this.visitNode(p));
        this.visitTypeAnnotation(node.returnType);
        this.visitNode(node.body);
    }
    visitStructDeclaration(node: StructDeclarationNode): void {
        this.visitNode(node.id);
        node.fields.forEach(f => this.visitNode(f));
    }
    visitTypeAliasDeclaration(node: TypeAliasDeclarationNode): void {
        this.visitNode(node.id);
        this.visitTypeAnnotation(node.aliasedType);
    }
    visitEnumDeclaration(node: EnumDeclarationNode): void {
        this.visitNode(node.id);
        node.members.forEach(m => this.visitNode(m));
        this.visitNode(node.baseType);
    }
    visitImportDeclaration(node: ImportDeclarationNode): void {
        // Source and specifiers are primitive values or simple objects, no nested AST nodes to visit.
    }
    visitUnsafeBlock(node: UnsafeBlockNode): void { this.visitNode(node.body); }
    visitBlockStatement(node: BlockStatementNode): void { node.body.forEach(s => this.visitNode(s)); }
    visitPermissionDecorator(node: PermissionDecoratorNode): void { /* Leaf node */ }
    visitParameter(node: ParameterNode): void {
        this.visitNode(node.id);
        this.visitTypeAnnotation(node.paramType);
    }
    visitStructField(node: StructFieldNode): void {
        this.visitNode(node.id);
        this.visitTypeAnnotation(node.fieldType);
        this.visitNode(node.initializer);
    }
    visitEnumMember(node: EnumMemberNode): void {
        this.visitNode(node.id);
        this.visitNode(node.value);
    }

    // Statements
    visitVariableDeclaration(node: VariableDeclarationNode): void {
        this.visitNode(node.id);
        this.visitTypeAnnotation(node.varType);
        this.visitNode(node.initializer);
    }
    visitConstantDeclaration(node: ConstantDeclarationNode): void {
        this.visitNode(node.id);
        this.visitTypeAnnotation(node.constType);
        this.visitNode(node.initializer);
    }
    visitReturnStatement(node: ReturnStatementNode): void { this.visitNode(node.argument); }
    visitStateVectorCollapse(node: StateVectorCollapseNode): void {
        this.visitNode(node.measurementTarget);
        this.visitNode(node.expectedState);
        this.visitNode(node.consequent);
        this.visitNode(node.alternate);
    }
    visitIfStatement(node: IfStatementNode): void {
        this.visitNode(node.test);
        this.visitNode(node.consequent);
        this.visitNode(node.alternate);
    }
    visitLoopStatement(node: LoopStatementNode): void {
        this.visitNode(node.init);
        this.visitNode(node.test);
        this.visitNode(node.update);
        this.visitNode(node.iterator);
        this.visitNode(node.iterable);
        this.visitNode(node.body);
    }
    visitBreakStatement(node: BreakStatementNode): void { /* Leaf node, optional label */ }
    visitContinueStatement(node: ContinueStatementNode): void { /* Leaf node, optional label */ }
    visitExpressionStatement(node: ExpressionStatementNode): void { this.visitNode(node.expression); }
    visitMeasurementStatement(node: MeasurementStatementNode): void {
        this.visitNode(node.target);
        this.visitNode(node.outputRegister);
    }

    // Expressions
    visitIdentifier(node: IdentifierNode): void { /* Leaf node */ }
    visitLiteral(node: LiteralNode): void { /* Leaf node */ }
    visitQuantumStateLiteral(node: QuantumStateLiteralNode): void { /* Leaf node */ }
    visitPhysicalConstant(node: PhysicalConstantNode): void { /* Leaf node */ }
    visitBinaryExpression(node: BinaryExpressionNode): void {
        this.visitNode(node.left);
        this.visitNode(node.right);
    }
    visitCallExpression(node: CallExpressionNode): void {
        this.visitNode(node.callee);
        node.arguments.forEach(arg => this.visitNode(arg));
    }
    visitEntanglementOperation(node: EntanglementOperationNode): void {
        this.visitNode(node.callee);
        node.arguments.forEach(arg => this.visitNode(arg));
    }
    visitUnaryExpression(node: UnaryExpressionNode): void { this.visitNode(node.argument); }
    visitAssignmentExpression(node: AssignmentExpressionNode): void {
        this.visitNode(node.left);
        this.visitNode(node.right);
    }
    visitMemberExpression(node: MemberExpressionNode): void {
        this.visitNode(node.object);
        if (node.computed) {
            this.visitNode(node.property); // property is an Expression
        } else {
            this.visitNode(node.property as IdentifierNode); // property is an Identifier
        }
    }
    visitNewExpression(node: NewExpressionNode): void {
        this.visitNode(node.callee);
        node.arguments.forEach(arg => this.visitNode(arg));
    }
    visitConditionalExpression(node: ConditionalExpressionNode): void {
        this.visitNode(node.test);
        this.visitNode(node.consequent);
        this.visitNode(node.alternate);
    }

    // Type Annotations - Dispatch to specific type annotation visitors if needed,
    // or keep a single one if traversal logic for types is uniform.
    visitTypeAnnotation(node: TypeAnnotationNode): void {
        switch (node.type) {
            case 'SharedMemBufferType': this.visitTypeAnnotation(node.elementType); break;
            case 'CustomTypeRef': this.visitNode(node.name); break;
            case 'ArrayType':
                this.visitTypeAnnotation(node.elementType);
                this.visitNode(node.size);
                break;
            case 'TupleType': node.elementTypes.forEach(t => this.visitTypeAnnotation(t)); break;
            case 'QuantumStateVectorType': /* Leaf type */ break;
            case 'UnitType': /* Leaf type */ break;
            case 'I32Type': /* Leaf type */ break;
            case 'I64Type': /* Leaf type */ break;
            case 'F32Type': /* Leaf type */ break;
            case 'F64Type': /* Leaf type */ break;
            case 'BoolType': /* Leaf type */ break;
            case 'MemPtrType': /* Leaf type */ break;
            case 'StringRefType': /* Leaf type */ break;
            case 'HostRefType': /* Leaf type */ break;
            default:
                // Ensure exhaustive checking if possible, or provide a default for new types
                const _exhaustiveCheck: never = node;
                console.warn(`ASTTraverser: Encountered unhandled TypeAnnotationNode type: ${(_exhaustiveCheck as any).type}`);
                break;
        }
    }

    visitUnknownNode(node: ASTNode): void {
        console.warn(`ASTTraverser: Encountered unknown node type: ${node.type} at line ${node.loc?.start.line}, column ${node.loc?.start.column}`);
        // Optionally throw an error to halt processing for unsupported nodes
        // throw new Error(`Unknown AST node type encountered: ${node.type}`);
    }
}

let _nextNodeId = 0; // Simple counter for assigning unique node IDs

/**
 * A utility function to create an AST node.
 * It automatically assigns a unique `nodeId` if one is not provided.
 * @param type The specific type string of the AST node.
 * @param partialNode An object containing the properties of the AST node, excluding 'type'.
 * @returns The fully formed AST node.
 */
export function createASTNode<T extends ASTNode>(type: T['type'], partialNode: Omit<T, 'type' | 'nodeId'> & { nodeId?: number }): T {
    const nodeId = partialNode.nodeId !== undefined ? partialNode.nodeId : ++_nextNodeId;
    return { type, nodeId, ...partialNode } as T;
}