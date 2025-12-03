// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview The Parser for the TSAL language.
 * This implementation uses a recursive descent parser, which is straightforward
 * for the defined TSAL grammar. It takes tokens from the Lexer and constructs an
 * Abstract Syntax Tree (AST). It supports a rich set of language features
 * including functions, classes, variables, control flow, and a comprehensive
 * expression grammar with proper operator precedence.
 */

import { Token, TokenType } from './lexer';
import * as AST from '../../tsal/syntax/ast';

/**
 * Custom error class for parser-specific errors, providing detailed context.
 */
export class ParserError extends Error {
    constructor(message: string, token: Token) {
        super(`[Parser Error] line ${token.line}, col ${token.column}: ${message}`);
        this.name = 'ParserError';
    }
}

/**
 * The main Parser class responsible for converting a stream of tokens
 * into an Abstract Syntax Tree (AST) representing the TSAL program.
 * It implements a recursive descent parsing strategy.
 */
export class Parser {
    private tokens: Token[];
    private position: number = 0;
    // This could be expanded into a full symbol table for more complex semantic analysis
    // For now, it's a simple placeholder to demonstrate scope concept.
    private currentScope: Set<string> = new Set(); 

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    /**
     * Initiates the parsing process and returns the root of the AST.
     * This is the entry point for parsing a complete TSAL program.
     * @returns The root ProgramNode of the AST.
     */
    public parse(): AST.ProgramNode {
        const programNode: AST.ProgramNode = { type: 'Program', body: [] };
        while (!this.isAtEnd()) {
            programNode.body.push(this.parseTopLevelDeclaration());
        }
        return programNode;
    }

    /**
     * Parses a top-level declaration in the program.
     * This can be a function, class, or variable declaration, optionally with modifiers like 'export'.
     * @returns An AST node representing a top-level declaration.
     */
    private parseTopLevelDeclaration(): AST.TopLevelNode {
        let modifiers: string[] = []; 
        while (this.check(TokenType.Export) || this.check(TokenType.Public) || this.check(TokenType.Static)) {
            modifiers.push(this.advance().value);
        }

        if (this.check(TokenType.Func)) {
            return this.parseFunctionDeclaration(modifiers);
        }
        if (this.check(TokenType.Class)) {
            return this.parseClassDeclaration(modifiers);
        }
        if (this.check(TokenType.Let) || this.check(TokenType.Const)) {
            // Top-level variable declaration needs a semicolon
            const varDecl = this.parseVariableDeclaration(modifiers);
            this.consume(TokenType.Semicolon, "Expected ';' after top-level variable declaration.");
            return varDecl;
        }
        
        throw this.error("Expected 'export', 'func', 'class', 'let', or 'const' at top level.");
    }

    /**
     * Parses a class declaration.
     * Example: `export class MyClass extends BaseClass implements IMyInterface { ... }`
     * @param modifiers Modifiers like 'export', 'public'.
     * @returns An AST node representing a class declaration.
     */
    private parseClassDeclaration(modifiers: string[]): AST.ClassDeclarationNode {
        this.consume(TokenType.Class, "Expected 'class' keyword.");
        const id = this.parseIdentifier();
        let superClass: AST.Identifier | undefined = undefined;
        let implementsClauses: AST.Identifier[] = []; 

        if (this.match(TokenType.Extends)) {
            superClass = this.parseIdentifier();
        }

        if (this.match(TokenType.Implements)) {
            do {
                implementsClauses.push(this.parseIdentifier());
            } while (this.match(TokenType.Comma));
        }

        this.consume(TokenType.OpenBrace, "Expected '{' to start class body.");
        const body: (AST.MethodDeclarationNode | AST.PropertyDeclarationNode)[] = [];
        while (!this.check(TokenType.CloseBrace) && !this.isAtEnd()) {
            body.push(this.parseClassMember());
        }
        this.consume(TokenType.CloseBrace, "Expected '}' to end class body.");

        return {
            type: 'ClassDeclaration',
            id: id,
            modifiers: modifiers,
            superClass: superClass,
            implements: implementsClauses,
            body: body,
            decorators: [] 
        };
    }

    /**
     * Parses a member of a class (either a method or a property).
     * This method handles distinguishing between property and method syntax.
     * @returns An AST node representing a method or property declaration.
     */
    private parseClassMember(): AST.MethodDeclarationNode | AST.PropertyDeclarationNode {
        let modifiers: string[] = [];
        while (this.check(TokenType.Public) || this.check(TokenType.Private) || this.check(TokenType.Protected) ||
               this.check(TokenType.Static) || this.check(TokenType.Readonly) || this.check(TokenType.Async)) {
            modifiers.push(this.advance().value);
        }

        const name = this.parseIdentifier();

        // If the next token is '(', it's a method. Otherwise, it's a property.
        if (this.check(TokenType.OpenParen)) {
            // It's a method declaration
            const typeParameters = this.parseTypeParameters(); 
            const parameters: AST.ParameterNode[] = this.parseParameterList();
            this.consume(TokenType.Colon, "Expected ':' for return type annotation.");
            const returnType = this.parseTypeAnnotation();
            const body = this.parseBlockStatement();

            return {
                type: 'MethodDeclaration',
                id: name,
                modifiers: modifiers,
                decorators: [],
                typeParameters: typeParameters,
                parameters: parameters,
                returnType: returnType,
                body: body,
            };
        } else {
            // It's a property declaration
            this.consume(TokenType.Colon, "Expected ':' for property type annotation.");
            const propType = this.parseTypeAnnotation();
            let initializer: AST.ExpressionNode | undefined = undefined;
            if (this.match(TokenType.Equal)) {
                initializer = this.parseExpression();
            }
            this.consume(TokenType.Semicolon, "Expected ';' after property declaration.");
            return {
                type: 'PropertyDeclaration',
                id: name,
                modifiers: modifiers,
                decorators: [],
                propertyType: propType,
                initializer: initializer,
            };
        }
    }


    /**
     * Parses a function declaration.
     * Example: `export func <T> myFunc(param: i32): i32 { ... }`
     * @param modifiers Modifiers like 'export'.
     * @returns An AST node representing a function declaration.
     */
    private parseFunctionDeclaration(modifiers: string[]): AST.FunctionDeclarationNode {
        this.consume(TokenType.Func, "Expected 'func' keyword.");
        const typeParameters = this.parseTypeParameters(); 
        const id = this.parseIdentifier();
        const parameters: AST.ParameterNode[] = this.parseParameterList();
        this.consume(TokenType.Colon, "Expected ':' for return type annotation.");
        const returnType = this.parseTypeAnnotation();
        const body = this.parseBlockStatement();

        return {
            type: 'FunctionDeclaration',
            id: id,
            modifiers: modifiers,
            decorators: [], 
            typeParameters: typeParameters,
            parameters,
            returnType,
            body,
        };
    }

    /**
     * Parses a list of type parameters for generics.
     * Example: `<T, U extends MyType>`
     * @returns An array of Identifier nodes representing type parameters.
     */
    private parseTypeParameters(): AST.Identifier[] {
        const typeParams: AST.Identifier[] = [];
        if (this.match(TokenType.Less)) { // '<' indicates start of type parameters
            do {
                const param = this.parseIdentifier();
                // Optionally handle `extends` constraint for type parameters: `<T extends MyType>`
                if (this.match(TokenType.Extends)) {
                    this.parseTypeAnnotation(); // Consume the constraint type
                }
                typeParams.push(param);
            } while (this.match(TokenType.Comma));
            this.consume(TokenType.Greater, "Expected '>' after type parameters.");
        }
        return typeParams;
    }

    /**
     * Parses the parameter list for a function or method.
     * Example: `(param1: i32, param2: string)`
     * @returns An array of ParameterNode.
     */
    private parseParameterList(): AST.ParameterNode[] {
        this.consume(TokenType.OpenParen, "Expected '(' after function/method name.");
        const parameters: AST.ParameterNode[] = [];
        if (!this.check(TokenType.CloseParen)) {
            do {
                parameters.push(this.parseParameter());
            } while (this.match(TokenType.Comma));
        }
        this.consume(TokenType.CloseParen, "Expected ')' after parameters.");
        return parameters;
    }

    /**
     * Parses a single function/method parameter.
     * Example: `name: i32`
     * @returns A ParameterNode.
     */
    private parseParameter(): AST.ParameterNode {
        const name = this.parseIdentifier();
        this.consume(TokenType.Colon, "Expected ':' for parameter type annotation.");
        const type = this.parseTypeAnnotation();
        return { type: 'Parameter', id: name, paramType: type };
    }

    /**
     * Parses a type annotation.
     * Examples: `i32`, `string`, `MyClass`, `i32[]`, `Array<string>`, `i32?`
     * @returns A TypeAnnotationNode.
     */
    private parseTypeAnnotation(): AST.TypeAnnotationNode {
        let baseType: AST.TypeAnnotationNode;

        if (this.match(TokenType.I32)) baseType = { type: 'I32Type' };
        else if (this.match(TokenType.String)) baseType = { type: 'StringType' };
        else if (this.match(TokenType.Boolean)) baseType = { type: 'BooleanType' };
        else if (this.match(TokenType.Void)) baseType = { type: 'VoidType' };
        else if (this.match(TokenType.U32)) baseType = { type: 'U32Type' };
        else if (this.match(TokenType.F32)) baseType = { type: 'F32Type' };
        else if (this.match(TokenType.F64)) baseType = { type: 'F64Type' };
        else if (this.check(TokenType.Identifier)) baseType = { type: 'CustomType', name: this.advance().value };
        else throw this.error("Expected a type annotation (e.g., i32, string, CustomType).");

        // Handle array type: `Type[]`
        if (this.match(TokenType.OpenBracket)) {
            this.consume(TokenType.CloseBracket, "Expected ']' after array type.");
            baseType = { type: 'ArrayType', elementType: baseType };
        }

        // Handle generic type: `Type<InnerType>`
        if (this.check(TokenType.Less)) { // Check for '<' indicating generic type parameters
            const typeArguments: AST.TypeAnnotationNode[] = [];
            this.advance(); // consume '<'
            do {
                typeArguments.push(this.parseTypeAnnotation());
            } while (this.match(TokenType.Comma));
            this.consume(TokenType.Greater, "Expected '>' after generic type arguments.");
            baseType = { type: 'GenericType', base: baseType, typeArguments: typeArguments };
        }

        // Handle nullable type: `Type?`
        if (this.match(TokenType.QuestionMark)) {
            baseType = { type: 'NullableType', baseType: baseType };
        }

        return baseType;
    }

    /**
     * Parses a block statement, enclosed in curly braces.
     * @returns A BlockStatementNode.
     */
    private parseBlockStatement(): AST.BlockStatementNode {
        this.consume(TokenType.OpenBrace, "Expected '{' to start a block.");
        const statements: AST.StatementNode[] = [];
        while (!this.check(TokenType.CloseBrace) && !this.isAtEnd()) {
            statements.push(this.parseStatement());
        }
        this.consume(TokenType.CloseBrace, "Expected '}' to end a block.");
        return { type: 'BlockStatement', body: statements };
    }

    /**
     * Parses a single statement.
     * @returns A StatementNode.
     */
    private parseStatement(): AST.StatementNode {
        if (this.match(TokenType.Return)) {
            const value = this.parseExpression();
            this.consume(TokenType.Semicolon, "Expected ';' after return value.");
            return { type: 'ReturnStatement', argument: value };
        }
        if (this.check(TokenType.Let) || this.check(TokenType.Const)) {
            const varDecl = this.parseVariableDeclaration([]); 
            this.consume(TokenType.Semicolon, "Expected ';' after variable declaration.");
            return varDecl;
        }
        if (this.match(TokenType.If)) {
            return this.parseIfStatement();
        }
        if (this.match(TokenType.While)) {
            return this.parseWhileStatement();
        }
        if (this.match(TokenType.For)) {
            return this.parseForStatement();
        }
        if (this.match(TokenType.Break) || this.match(TokenType.Continue)) {
            return this.parseBreakContinueStatement();
        }

        // If none of the above, it's an expression statement.
        const expr = this.parseExpression();
        this.consume(TokenType.Semicolon, "Expected ';' after expression statement.");
        return { type: 'ExpressionStatement', expression: expr };
    }

    /**
     * Parses a variable declaration statement.
     * Example: `let x: i32 = 10;`, `const y: string;`
     * Supports multiple declarations: `let a: i32 = 1, b: string;`
     * @param modifiers Modifiers for the variable (e.g., 'export', 'static').
     * @returns A VariableDeclarationNode.
     */
    private parseVariableDeclaration(modifiers: string[]): AST.VariableDeclarationNode {
        const kind: 'let' | 'const' = this.match(TokenType.Let) ? 'let' : 'const';
        if (!kind && !this.previous().type === TokenType.Const) { // Ensure one of them was matched
            throw this.error("Expected 'let' or 'const' for variable declaration.");
        }

        const declarations: AST.VariableDeclaratorNode[] = [];
        do {
            const id = this.parseIdentifier();
            this.consume(TokenType.Colon, "Expected ':' for variable type annotation.");
            const varType = this.parseTypeAnnotation();
            let initializer: AST.ExpressionNode | undefined = undefined;
            if (this.match(TokenType.Equal)) {
                initializer = this.parseExpression();
            }
            declarations.push({
                type: 'VariableDeclarator',
                id: id,
                varType: varType,
                initializer: initializer,
            });
        } while (this.match(TokenType.Comma));

        return {
            type: 'VariableDeclaration',
            kind: kind,
            modifiers: modifiers,
            declarations: declarations,
        };
    }

    /**
     * Parses an if statement.
     * Example: `if (condition) { ... } else if (another) { ... } else { ... }`
     * @returns An IfStatementNode.
     */
    private parseIfStatement(): AST.IfStatementNode {
        this.consume(TokenType.OpenParen, "Expected '(' after 'if'.");
        const test = this.parseExpression();
        this.consume(TokenType.CloseParen, "Expected ')' after if condition.");
        const consequent = this.parseStatementOrBlock(); 

        let alternate: AST.StatementNode | AST.BlockStatementNode | undefined = undefined;
        if (this.match(TokenType.Else)) {
            if (this.check(TokenType.If)) { 
                this.advance(); 
                alternate = this.parseIfStatement(); 
            } else { 
                alternate = this.parseStatementOrBlock();
            }
        }
        return { type: 'IfStatement', test, consequent, alternate };
    }

    /**
     * Parses a while loop statement.
     * Example: `while (condition) { ... }`
     * @returns A WhileStatementNode.
     */
    private parseWhileStatement(): AST.WhileStatementNode {
        this.consume(TokenType.OpenParen, "Expected '(' after 'while'.");
        const test = this.parseExpression();
        this.consume(TokenType.CloseParen, "Expected ')' after while condition.");
        const body = this.parseStatementOrBlock();
        return { type: 'WhileStatement', test, body };
    }

    /**
     * Parses a for loop statement.
     * Example: `for (let i: i32 = 0; i < 10; i = i + 1) { ... }`
     * @returns A ForStatementNode.
     */
    private parseForStatement(): AST.ForStatementNode {
        this.consume(TokenType.OpenParen, "Expected '(' after 'for'.");
        let init: AST.VariableDeclarationNode | AST.ExpressionNode | undefined = undefined;
        if (!this.check(TokenType.Semicolon)) {
            if (this.check(TokenType.Let) || this.check(TokenType.Const)) {
                init = this.parseVariableDeclaration([]); 
            } else {
                init = this.parseExpression();
            }
        }
        this.consume(TokenType.Semicolon, "Expected ';' after for loop initializer.");

        let test: AST.ExpressionNode | undefined = undefined;
        if (!this.check(TokenType.Semicolon)) {
            test = this.parseExpression();
        }
        this.consume(TokenType.Semicolon, "Expected ';' after for loop condition.");

        let update: AST.ExpressionNode | undefined = undefined;
        if (!this.check(TokenType.CloseParen)) {
            update = this.parseExpression();
        }
        this.consume(TokenType.CloseParen, "Expected ')' after for loop clauses.");

        const body = this.parseStatementOrBlock();
        return { type: 'ForStatement', init, test, update, body };
    }

    /**
     * Parses a break or continue statement.
     * @returns A BreakStatementNode or ContinueStatementNode.
     */
    private parseBreakContinueStatement(): AST.BreakStatementNode | AST.ContinueStatementNode {
        const token = this.previous(); 
        this.consume(TokenType.Semicolon, `Expected ';' after '${token.value}'.`);
        return { type: token.type === TokenType.Break ? 'BreakStatement' : 'ContinueStatement' };
    }

    /**
     * Helper to parse either a single statement or a block statement (enclosed in {}).
     */
    private parseStatementOrBlock(): AST.StatementNode | AST.BlockStatementNode {
        if (this.check(TokenType.OpenBrace)) {
            return this.parseBlockStatement();
        }
        return this.parseStatement();
    }

    /**
     * Parses any expression. This is the entry point for the expression parsing
     * hierarchy, starting with the lowest precedence (assignment).
     * @returns An ExpressionNode.
     */
    private parseExpression(): AST.ExpressionNode {
        return this.parseAssignmentExpression();
    }

    /**
     * Parses an assignment expression.
     * Example: `x = 10`, `obj.prop = value`
     * @returns An ExpressionNode.
     */
    private parseAssignmentExpression(): AST.ExpressionNode {
        let expr = this.parseLogicalOrExpression();

        if (this.match(TokenType.Equal)) {
            const operatorToken = this.previous();
            const right = this.parseAssignmentExpression(); // Assignment is right-associative
            if (expr.type === 'Identifier' || expr.type === 'MemberExpression') { 
                return { type: 'AssignmentExpression', left: expr, operator: operatorToken.value, right: right };
            }
            throw this.error("Invalid assignment target.");
        }
        return expr;
    }

    /**
     * Parses a logical OR expression (`||`).
     * @returns An ExpressionNode.
     */
    private parseLogicalOrExpression(): AST.ExpressionNode {
        let expr = this.parseLogicalAndExpression();
        while (this.match(TokenType.Or)) {
            const operator = this.previous().value;
            const right = this.parseLogicalAndExpression();
            expr = { type: 'LogicalExpression', operator, left: expr, right };
        }
        return expr;
    }

    /**
     * Parses a logical AND expression (`&&`).
     * @returns An ExpressionNode.
     */
    private parseLogicalAndExpression(): AST.ExpressionNode {
        let expr = this.parseEqualityExpression();
        while (this.match(TokenType.And)) {
            const operator = this.previous().value;
            const right = this.parseEqualityExpression();
            expr = { type: 'LogicalExpression', operator, left: expr, right };
        }
        return expr;
    }

    /**
     * Parses an equality expression (`==`, `!=`).
     * @returns An ExpressionNode.
     */
    private parseEqualityExpression(): AST.ExpressionNode {
        let expr = this.parseComparisonExpression();
        while (this.match(TokenType.EqualEqual, TokenType.BangEqual)) {
            const operator = this.previous().value;
            const right = this.parseComparisonExpression();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }
        return expr;
    }

    /**
     * Parses a comparison expression (`<`, `<=`, `>`, `>=`).
     * @returns An ExpressionNode.
     */
    private parseComparisonExpression(): AST.ExpressionNode {
        let expr = this.parseAddition();
        while (this.match(TokenType.Less, TokenType.LessEqual, TokenType.Greater, TokenType.GreaterEqual)) {
            const operator = this.previous().value;
            const right = this.parseAddition();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }
        return expr;
    }

    /**
     * Parses addition and subtraction expressions (`+`, `-`).
     * @returns An ExpressionNode.
     */
    private parseAddition(): AST.ExpressionNode {
        let expr = this.parseMultiplication();
        while (this.match(TokenType.Plus, TokenType.Minus)) {
            const operator = this.previous().value;
            const right = this.parseMultiplication();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }
        return expr;
    }

    /**
     * Parses multiplication and division expressions (`*`, `/`).
     * @returns An ExpressionNode.
     */
    private parseMultiplication(): AST.ExpressionNode {
        let expr = this.parseUnaryExpression();
        while (this.match(TokenType.Star, TokenType.Slash)) {
            const operator = this.previous().value;
            const right = this.parseUnaryExpression();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }
        return expr;
    }

    /**
     * Parses unary expressions (`-`, `!`).
     * @returns An ExpressionNode.
     */
    private parseUnaryExpression(): AST.ExpressionNode {
        if (this.match(TokenType.Bang, TokenType.Minus)) {
            const operator = this.previous().value;
            const right = this.parseUnaryExpression();
            return { type: 'UnaryExpression', operator, argument: right };
        }
        return this.parseCallMemberExpression();
    }

    /**
     * Parses call expressions, member access expressions, and array indexing.
     * This handles post-fix operators like `()` for calls, `.` for member access,
     * and `[]` for array indexing.
     * @returns An ExpressionNode.
     */
    private parseCallMemberExpression(): AST.ExpressionNode {
        let expr = this.parsePrimary();

        while (true) {
            if (this.match(TokenType.OpenParen)) {
                expr = this.parseCall(expr);
            } else if (this.match(TokenType.Dot)) {
                const property = this.parseIdentifier();
                expr = { type: 'MemberExpression', object: expr, property: property, computed: false };
            } else if (this.match(TokenType.OpenBracket)) {
                const property = this.parseExpression();
                this.consume(TokenType.CloseBracket, "Expected ']' after array index.");
                expr = { type: 'MemberExpression', object: expr, property: property, computed: true };
            } else {
                break;
            }
        }
        return expr;
    }

    /**
     * Parses a function call.
     * @param callee The expression representing the function being called.
     * @returns A CallExpressionNode.
     */
    private parseCall(callee: AST.ExpressionNode): AST.CallExpressionNode {
        const args: AST.ExpressionNode[] = [];
        if (!this.check(TokenType.CloseParen)) {
            do {
                args.push(this.parseExpression());
            } while (this.match(TokenType.Comma));
        }
        this.consume(TokenType.CloseParen, "Expected ')' after arguments.");
        return { type: 'CallExpression', callee: callee, arguments: args };
    }

    /**
     * Parses the most basic expressions: literals (integer, float, string, boolean, null),
     * identifiers, grouped expressions `(expr)`, `this`, `super`, `new` expressions,
     * array literals `[1,2,3]`, and object literals `{key: value}`.
     * @returns An ExpressionNode.
     */
    private parsePrimary(): AST.ExpressionNode {
        if (this.match(TokenType.IntegerLiteral)) {
            return { type: 'Literal', value: parseInt(this.previous().value, 10), raw: this.previous().value, valueType: 'int' };
        }
        if (this.match(TokenType.FloatLiteral)) {
            return { type: 'Literal', value: parseFloat(this.previous().value), raw: this.previous().value, valueType: 'float' };
        }
        if (this.match(TokenType.StringLiteral)) {
            return { type: 'Literal', value: this.previous().value, raw: this.previous().value, valueType: 'string' };
        }
        if (this.match(TokenType.True)) {
            return { type: 'Literal', value: true, raw: 'true', valueType: 'boolean' };
        }
        if (this.match(TokenType.False)) {
            return { type: 'Literal', value: false, raw: 'false', valueType: 'boolean' };
        }
        if (this.match(TokenType.Null)) {
            return { type: 'Literal', value: null, raw: 'null', valueType: 'null' };
        }
        if (this.match(TokenType.Identifier)) {
            return { type: 'Identifier', name: this.previous().value };
        }
        if (this.match(TokenType.This)) {
            return { type: 'ThisExpression' };
        }
        if (this.match(TokenType.Super)) {
            return { type: 'SuperExpression' };
        }
        if (this.match(TokenType.OpenParen)) {
            const expr = this.parseExpression();
            this.consume(TokenType.CloseParen, "Expected ')' after expression.");
            return { type: 'GroupingExpression', expression: expr };
        }
        if (this.match(TokenType.OpenBracket)) { // Array Literal: `[1, 2, 3]`
            const elements: AST.ExpressionNode[] = [];
            if (!this.check(TokenType.CloseBracket)) {
                do {
                    elements.push(this.parseExpression());
                } while (this.match(TokenType.Comma));
            }
            this.consume(TokenType.CloseBracket, "Expected ']' after array literal.");
            return { type: 'ArrayExpression', elements: elements };
        }
        if (this.match(TokenType.OpenBrace)) { // Object Literal: `{ key: value, ... }`
            const properties: AST.PropertyNode[] = [];
            if (!this.check(TokenType.CloseBrace)) {
                do {
                    const key = this.parseIdentifierOrStringLiteral();
                    this.consume(TokenType.Colon, "Expected ':' after property key.");
                    const value = this.parseExpression();
                    properties.push({ type: 'Property', key: key, value: value });
                } while (this.match(TokenType.Comma));
            }
            this.consume(TokenType.CloseBrace, "Expected '}' after object literal.");
            return { type: 'ObjectExpression', properties: properties };
        }
        if (this.match(TokenType.New)) {
            return this.parseNewExpression();
        }

        throw this.error("Expected an expression, literal, or identifier.");
    }

    /**
     * Parses an identifier token and returns its AST node representation.
     * @returns An IdentifierNode.
     */
    private parseIdentifier(): AST.Identifier {
        const token = this.consume(TokenType.Identifier, "Expected an identifier.");
        return { type: 'Identifier', name: token.value };
    }

    /**
     * Parses an identifier or a string literal, typically used for object property keys.
     * @returns An IdentifierNode or a StringLiteral AST node.
     */
    private parseIdentifierOrStringLiteral(): AST.Identifier | AST.Literal {
        if (this.check(TokenType.Identifier)) {
            return this.parseIdentifier();
        }
        if (this.check(TokenType.StringLiteral)) {
            return { type: 'Literal', value: this.advance().value, raw: this.previous().value, valueType: 'string' };
        }
        throw this.error("Expected a property name (identifier or string literal).");
    }

    /**
     * Parses a 'new' expression for class instantiation.
     * Example: `new MyClass(arg1, arg2)`
     * @returns A NewExpressionNode.
     */
    private parseNewExpression(): AST.NewExpressionNode {
        // Assume 'new' has just been consumed
        const callee = this.parseIdentifier(); 
        this.consume(TokenType.OpenParen, "Expected '(' after class name in 'new' expression.");
        const args: AST.ExpressionNode[] = [];
        if (!this.check(TokenType.CloseParen)) {
            do {
                args.push(this.parseExpression());
            } while (this.match(TokenType.Comma));
        }
        this.consume(TokenType.CloseParen, "Expected ')' after arguments in 'new' expression.");
        return { type: 'NewExpression', callee: callee, arguments: args };
    }


    // --- Core Parser Helper Methods ---

    /**
     * Checks if the current token matches any of the given types. If so, consumes it and returns true.
     * This advances the parser's position if a match is found.
     * @param types A list of TokenType to match.
     * @returns True if a match was found and consumed, false otherwise.
     */
    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    /**
     * Consumes the current token if its type matches the expected type.
     * If not, throws a ParserError with the provided message.
     * @param type The expected TokenType.
     * @param message The error message if the type does not match.
     * @returns The consumed Token.
     */
    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(message);
    }

    /**
     * Checks if the current token's type matches the given type without consuming it.
     * This is useful for looking ahead in the token stream.
     * @param type The TokenType to check against.
     * @returns True if the current token's type matches, false otherwise.
     */
    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    /**
     * Advances the parser position to the next token and returns the previously current token.
     * @returns The token that was at the current position before advancing.
     */
    private advance(): Token {
        if (!this.isAtEnd()) this.position++;
        return this.previous();
    }

    /**
     * Checks if the parser has reached the end of the token stream (EOF token).
     * @returns True if at the end, false otherwise.
     */
    private isAtEnd(): boolean { return this.peek().type === TokenType.EOF; }

    /**
     * Returns the current token without consuming it.
     * @returns The current Token.
     */
    private peek(): Token { return this.tokens[this.position]; }

    /**
     * Returns the token immediately preceding the current token.
     * Useful for getting the token that was just consumed by `advance()`.
     * @returns The previous Token.
     */
    private previous(): Token { return this.tokens[this.position - 1]; }

    /**
     * Creates and throws a ParserError with context from the current token.
     * This method always throws and does not return.
     * @param message The error message.
     * @throws {ParserError} Always throws a ParserError.
     */
    private error(message: string): ParserError {
        const token = this.peek();
        throw new ParserError(message, token);
    }
}