// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { describe, it, expect } from 'vitest';
import { Lexer, TokenType, Token } from './lexer'; // Added Token import for comprehensive testing

/**
 * Helper function to simplify writing token expectations and perform detailed assertions.
 * It automatically appends an EOF token if not explicitly provided, and checks type, value,
 * line, and column for each token.
 *
 * @param source The source code string to tokenize.
 * @param expected An array of objects defining the expected token type, value, line, and column.
 */
function expectTokens(source: string, expected: Array<{ type: TokenType, value?: string, line?: number, column?: number }>) {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    // Calculate EOF token position based on the source for robust testing
    const sourceLines = source.split('\n');
    const eofLine = sourceLines.length;
    const eofColumn = (sourceLines[sourceLines.length - 1] || '').length + 1;

    // Append EOF token if not explicitly provided in expected for completeness
    if (expected.length === 0 || expected[expected.length - 1].type !== TokenType.EOF) {
        expected.push({ type: TokenType.EOF, value: '', line: eofLine, column: eofColumn });
    }

    expect(tokens.length).toBe(expected.length);

    expected.forEach((expectedToken, index) => {
        const actualToken = tokens[index];

        // Ensure token exists before accessing properties
        expect(actualToken).toBeDefined();

        // Check token type
        expect(actualToken.type).toBe(expectedToken.type);

        // Check token value if provided in the expectation
        if (expectedToken.value !== undefined) {
            expect(actualToken.value).toBe(expectedToken.value);
        } else {
            // For tokens like OpenParen, CloseParen etc., the value should be the symbol itself.
            // If not explicitly provided, we derive it from the TokenType name for better default checks.
            const defaultExpectedValue = (expectedToken.type as string).toLowerCase().replace(/^(open|close)/, (match) => {
                switch (match) {
                    case 'open': return '';
                    case 'close': return '';
                    default: return match;
                }
            });
            // This is a heuristic. A real lexer might return different values.
            // For example, TokenType.Plus might have value '+'.
            // For simple single-character tokens, we can often infer.
            // For now, only explicitly specified values are strictly checked.
        }

        // Check line and column for accurate source mapping (crucial for error reporting)
        if (expectedToken.line !== undefined) {
            expect(actualToken.line).toBe(expectedToken.line);
        }
        if (expectedToken.column !== undefined) {
            expect(actualToken.column).toBe(expectedToken.column);
        }
    });
}

// This helper is exported to adhere to the instruction:
// "Any new top-level functions, classes, or variables you create MUST be exported."
export { expectTokens };

describe('Lexer - Comprehensive Tokenization', () => {

    describe('Original Test Case (with enhanced checks)', () => {
        it('should tokenize a simple function declaration including line/column', () => {
            const source = 'export func add(a: i32, b: i32): i32 { return a + b; }';
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();

            const expectedTokens: Token[] = [
                { type: TokenType.Export, value: 'export', line: 1, column: 1 },
                { type: TokenType.Func, value: 'func', line: 1, column: 8 },
                { type: TokenType.Identifier, value: 'add', line: 1, column: 13 },
                { type: TokenType.OpenParen, value: '(', line: 1, column: 16 },
                { type: TokenType.Identifier, value: 'a', line: 1, column: 17 },
                { type: TokenType.Colon, value: ':', line: 1, column: 18 },
                { type: TokenType.I32, value: 'i32', line: 1, column: 20 },
                { type: TokenType.Comma, value: ',', line: 1, column: 23 },
                { type: TokenType.Identifier, value: 'b', line: 1, column: 25 },
                { type: TokenType.Colon, value: ':', line: 1, column: 26 },
                { type: TokenType.I32, value: 'i32', line: 1, column: 28 },
                { type: TokenType.CloseParen, value: ')', line: 1, column: 31 },
                { type: TokenType.Colon, value: ':', line: 1, column: 32 },
                { type: TokenType.I32, value: 'i32', line: 1, column: 34 },
                { type: TokenType.OpenBrace, value: '{', line: 1, column: 38 },
                { type: TokenType.Return, value: 'return', line: 1, column: 40 },
                { type: TokenType.Identifier, value: 'a', line: 1, column: 47 },
                { type: TokenType.Plus, value: '+', line: 1, column: 49 },
                { type: TokenType.Identifier, value: 'b', line: 1, column: 51 },
                { type: TokenType.Semicolon, value: ';', line: 1, column: 52 },
                { type: TokenType.CloseBrace, value: '}', line: 1, column: 54 },
                { type: TokenType.EOF, value: '', line: 1, column: 55 },
            ];

            expect(tokens).toEqual(expectedTokens.map(t => expect.objectContaining(t)));
            expect(tokens.find(t => t.type === TokenType.Identifier && t.value === 'add')).toBeDefined();
        });
    });

    describe('Keywords and Identifiers', () => {
        it('should correctly tokenize all standard keywords', () => {
            const source = 'if else while for loop break continue func return let const var class struct enum interface type alias use from impl trait as sizeof typeof';
            expectTokens(source, [
                { type: TokenType.If, value: 'if' },
                { type: TokenType.Else, value: 'else' },
                { type: TokenType.While, value: 'while' },
                { type: TokenType.For, value: 'for' },
                { type: TokenType.Loop, value: 'loop' }, // Assuming 'loop' keyword
                { type: TokenType.Break, value: 'break' },
                { type: TokenType.Continue, value: 'continue' },
                { type: TokenType.Func, value: 'func' },
                { type: TokenType.Return, value: 'return' },
                { type: TokenType.Let, value: 'let' },
                { type: TokenType.Const, value: 'const' },
                { type: TokenType.Var, value: 'var' }, // Assuming 'var' keyword
                { type: TokenType.Class, value: 'class' },
                { type: TokenType.Struct, value: 'struct' },
                { type: TokenType.Enum, value: 'enum' },
                { type: TokenType.Interface, value: 'interface' },
                { type: TokenType.Type, value: 'type' }, // Assuming 'type' keyword
                { type: TokenType.Alias, value: 'alias' }, // Assuming 'alias' keyword
                { type: TokenType.Use, value: 'use' }, // Assuming 'use' keyword
                { type: TokenType.From, value: 'from' }, // Assuming 'from' keyword
                { type: TokenType.Impl, value: 'impl' }, // Assuming 'impl' keyword
                { type: TokenType.Trait, value: 'trait' }, // Assuming 'trait' keyword
                { type: TokenType.As, value: 'as' }, // Assuming 'as' keyword
                { type: TokenType.Sizeof, value: 'sizeof' }, // Assuming 'sizeof' keyword
                { type: TokenType.Typeof, value: 'typeof' }, // Assuming 'typeof' keyword
            ]);
        });

        it('should correctly tokenize boolean, null, and special keywords', () => {
            const source = 'true false null undefined this super new await async yield';
            expectTokens(source, [
                { type: TokenType.True, value: 'true' },
                { type: TokenType.False, value: 'false' },
                { type: TokenType.Null, value: 'null' },
                { type: TokenType.Undefined, value: 'undefined' },
                { type: TokenType.This, value: 'this' },
                { type: TokenType.Super, value: 'super' },
                { type: TokenType.New, value: 'new' },
                { type: TokenType.Await, value: 'await' },
                { type: TokenType.Async, value: 'async' },
                { type: TokenType.Yield, value: 'yield' }, // Assuming 'yield' keyword
            ]);
        });

        it('should distinguish keywords from identifiers', () => {
            const source = 'iff let_const functionName istrue _false';
            expectTokens(source, [
                { type: TokenType.Identifier, value: 'iff' },
                { type: TokenType.Identifier, value: 'let_const' },
                { type: TokenType.Identifier, value: 'functionName' },
                { type: TokenType.Identifier, value: 'istrue' },
                { type: TokenType.Identifier, value: '_false' },
            ]);
        });
    });

    describe('Literals', () => {
        it('should tokenize integer literals (decimal, binary, octal, hexadecimal)', () => {
            const source = '123 0 456789 0b1011 0o77 0xAF 1_000_000'; // Assuming underscore separators
            expectTokens(source, [
                { type: TokenType.Integer, value: '123' },
                { type: TokenType.Integer, value: '0' },
                { type: TokenType.Integer, value: '456789' },
                { type: TokenType.BinaryInteger, value: '0b1011' }, // Assuming distinct type for binary
                { type: TokenType.OctalInteger, value: '0o77' },   // Assuming distinct type for octal
                { type: TokenType.HexInteger, value: '0xAF' },     // Assuming distinct type for hex
                { type: TokenType.Integer, value: '1_000_000' },
            ]);
        });

        it('should tokenize float literals', () => {
            const source = '123.45 0.0 .5 1. 1e5 1.2e-3 1_000.001';
            expectTokens(source, [
                { type: TokenType.Float, value: '123.45' },
                { type: TokenType.Float, value: '0.0' },
                { type: TokenType.Float, value: '.5' },
                { type: TokenType.Float, value: '1.' },
                { type: TokenType.Float, value: '1e5' },
                { type: TokenType.Float, value: '1.2e-3' },
                { type: TokenType.Float, value: '1_000.001' },
            ]);
        });

        it('should tokenize string literals with various contents and escapes', () => {
            const source = `
                "hello world"
                ""
                "a long string with spaces and numbers 123!@#$"
                "line1\\nline2"
                "tab\\tspace"
                "quotes \\"inside\\""
                "backslash \\\\"
            `;
            expectTokens(source, [
                { type: TokenType.StringLiteral, value: 'hello world' },
                { type: TokenType.StringLiteral, value: '' },
                { type: TokenType.StringLiteral, value: 'a long string with spaces and numbers 123!@#$' },
                { type: TokenType.StringLiteral, value: 'line1\\nline2' },
                { type: TokenType.StringLiteral, value: 'tab\\tspace' },
                { type: TokenType.StringLiteral, value: 'quotes \\"inside\\"' },
                { type: TokenType.StringLiteral, value: 'backslash \\\\' },
            ]);
        });

        it('should tokenize char literals', () => {
            const source = `'a' 'Z' '1' '\\n' '\\t' '\\'' '\\\\'`; // Assuming single quotes for char literals
            expectTokens(source, [
                { type: TokenType.CharLiteral, value: 'a' },
                { type: TokenType.CharLiteral, value: 'Z' },
                { type: TokenType.CharLiteral, value: '1' },
                { type: TokenType.CharLiteral, value: '\\n' },
                { type: TokenType.CharLiteral, value: '\\t' },
                { type: TokenType.CharLiteral, value: '\\'' },
                { type: TokenType.CharLiteral, value: '\\\\' },
            ]);
        });
    });

    describe('Operators', () => {
        it('should tokenize arithmetic and assignment operators', () => {
            const source = '+ - * / % ++ -- = += -= *= /= %=';
            expectTokens(source, [
                { type: TokenType.Plus, value: '+' },
                { type: TokenType.Minus, value: '-' },
                { type: TokenType.Star, value: '*' },
                { type: TokenType.Slash, value: '/' },
                { type: TokenType.Percent, value: '%' },
                { type: TokenType.PlusPlus, value: '++' }, // Increment
                { type: TokenType.MinusMinus, value: '--' }, // Decrement
                { type: TokenType.Assign, value: '=' },
                { type: TokenType.PlusAssign, value: '+=' },
                { type: TokenType.MinusAssign, value: '-=' },
                { type: TokenType.StarAssign, value: '*=' },
                { type: TokenType.SlashAssign, value: '/=' },
                { type: TokenType.PercentAssign, value: '%=' },
            ]);
        });

        it('should tokenize comparison and logical operators', () => {
            const source = '== != < > <= >= && || !';
            expectTokens(source, [
                { type: TokenType.Equal, value: '==' },
                { type: TokenType.NotEqual, value: '!=' },
                { type: TokenType.LessThan, value: '<' },
                { type: TokenType.GreaterThan, value: '>' },
                { type: TokenType.LessThanOrEqual, value: '<=' },
                { type: TokenType.GreaterThanOrEqual, value: '>=' },
                { type: TokenType.And, value: '&&' },
                { type: TokenType.Or, value: '||' },
                { type: TokenType.Bang, value: '!' },
            ]);
        });

        it('should tokenize bitwise operators', () => {
            const source = '& | ^ ~ << >> >>> &= |= ^= <<= >>= >>>=';
            expectTokens(source, [
                { type: TokenType.Ampersand, value: '&' },
                { type: TokenType.Pipe, value: '|' },
                { type: TokenType.Caret, value: '^' },
                { type: TokenType.Tilde, value: '~' },
                { type: TokenType.LessThanLessThan, value: '<<' },
                { type: TokenType.GreaterThanGreaterThan, value: '>>' },
                { type: TokenType.GreaterThanGreaterThanGreaterThan, value: '>>>' },
                { type: TokenType.AmpersandAssign, value: '&=' },
                { type: TokenType.PipeAssign, value: '|=' },
                { type: TokenType.CaretAssign, value: '^=' },
                { type: TokenType.LessThanLessThanAssign, value: '<<=' },
                { type: TokenType.GreaterThanGreaterThanAssign, value: '>>=' },
                { type: TokenType.GreaterThanGreaterThanGreaterThanAssign, value: '>>>=' },
            ]);
        });

        it('should tokenize other special operators', () => {
            const source = '-> . .. ... :: ? ?? ?: =>'; // Arrow, Dot, Range, Spread, Scope, Optional, Nullish Coalescing, Ternary, Fat Arrow
            expectTokens(source, [
                { type: TokenType.Arrow, value: '->' },
                { type: TokenType.Dot, value: '.' },
                { type: TokenType.DotDot, value: '..' },
                { type: TokenType.DotDotDot, value: '...' },
                { type: TokenType.DoubleColon, value: '::' },
                { type: TokenType.Question, value: '?' },
                { type: TokenType.NullishCoalescing, value: '??' },
                { type: TokenType.Ternary, value: '?:' }, // Assuming ternary operator (Elvis operator variant)
                { type: TokenType.FatArrow, value: '=>' }, // Assuming fat arrow for lambdas/closures
            ]);
        });
    });

    describe('Punctuation', () => {
        it('should tokenize various punctuation symbols', () => {
            const source = '() {} [] ; , : @ # $ ` \\'; // Including backtick, backslash, etc.
            expectTokens(source, [
                { type: TokenType.OpenParen, value: '(' },
                { type: TokenType.CloseParen, value: ')' },
                { type: TokenType.OpenBrace, value: '{' },
                { type: TokenType.CloseBrace, value: '}' },
                { type: TokenType.OpenBracket, value: '[' },
                { type: TokenType.CloseBracket, value: ']' },
                { type: TokenType.Semicolon, value: ';' },
                { type: TokenType.Comma, value: ',' },
                { type: TokenType.Colon, value: ':' },
                { type: TokenType.At, value: '@' },
                { type: TokenType.Hash, value: '#' },
                { type: TokenType.Dollar, value: '$' },
                { type: TokenType.Backtick, value: '`' }, // Assuming backtick for template literals/special syntax
                { type: TokenType.Backslash, value: '\\' }, // For type system/paths etc.
            ]);
        });
    });

    describe('Comments', () => {
        it('should ignore single-line comments', () => {
            const source = `
                let x = 10; // This is a single-line comment.
                // Another comment line.
                const y = 20; // Last comment
            `;
            expectTokens(source, [
                { type: TokenType.Let, value: 'let', line: 2, column: 17 },
                { type: TokenType.Identifier, value: 'x', line: 2, column: 21 },
                { type: TokenType.Assign, value: '=', line: 2, column: 23 },
                { type: TokenType.Integer, value: '10', line: 2, column: 25 },
                { type: TokenType.Semicolon, value: ';', line: 2, column: 27 },
                { type: TokenType.Const, value: 'const', line: 4, column: 17 },
                { type: TokenType.Identifier, value: 'y', line: 4, column: 23 },
                { type: TokenType.Assign, value: '=', line: 4, column: 25 },
                { type: TokenType.Integer, value: '20', line: 4, column: 27 },
                { type: TokenType.Semicolon, value: ';', line: 4, column: 29 },
            ]);
        });

        it('should ignore multi-line comments', () => {
            const source = `
                /*
                 * This is a multi-line comment.
                 * It can span several lines.
                 */
                func calc() { /* inline comment */ return 1 + 2; }
                /* Another one at the end */
            `;
            expectTokens(source, [
                { type: TokenType.Func, value: 'func', line: 6, column: 17 },
                { type: TokenType.Identifier, value: 'calc', line: 6, column: 22 },
                { type: TokenType.OpenParen, value: '(', line: 6, column: 26 },
                { type: TokenType.CloseParen, value: ')', line: 6, column: 27 },
                { type: TokenType.OpenBrace, value: '{', line: 6, column: 29 },
                { type: TokenType.Return, value: 'return', line: 6, column: 49 },
                { type: TokenType.Integer, value: '1', line: 6, column: 56 },
                { type: TokenType.Plus, value: '+', line: 6, column: 58 },
                { type: TokenType.Integer, value: '2', line: 6, column: 60 },
                { type: TokenType.Semicolon, value: ';', line: 6, column: 61 },
                { type: TokenType.CloseBrace, value: '}', line: 6, column: 63 },
            ]);
        });

        it('should handle multi-line comments that start and end on the same line', () => {
            const source = `let a = 1; /* comment */ let b = 2;`;
            expectTokens(source, [
                { type: TokenType.Let, value: 'let', line: 1, column: 1 },
                { type: TokenType.Identifier, value: 'a', line: 1, column: 5 },
                { type: TokenType.Assign, value: '=', line: 1, column: 7 },
                { type: TokenType.Integer, value: '1', line: 1, column: 9 },
                { type: TokenType.Semicolon, value: ';', line: 1, column: 10 },
                { type: TokenType.Let, value: 'let', line: 1, column: 24 },
                { type: TokenType.Identifier, value: 'b', line: 1, column: 28 },
                { type: TokenType.Assign, value: '=', line: 1, column: 30 },
                { type: TokenType.Integer, value: '2', line: 1, column: 32 },
                { type: TokenType.Semicolon, value: ';', line: 1, column: 33 },
            ]);
        });
    });

    describe('Type Tokens', () => {
        it('should tokenize built-in numeric and boolean type identifiers', () => {
            const source = 'i8 u8 i16 u16 i32 u32 i64 u64 f32 f64 bool size usize';
            expectTokens(source, [
                { type: TokenType.I8, value: 'i8' },
                { type: TokenType.U8, value: 'u8' },
                { type: TokenType.I16, value: 'i16' },
                { type: TokenType.U16, value: 'u16' },
                { type: TokenType.I32, value: 'i32' },
                { type: TokenType.U32, value: 'u32' },
                { type: TokenType.I64, value: 'i64' },
                { type: TokenType.U64, value: 'u64' },
                { type: TokenType.F32, value: 'f32' },
                { type: TokenType.F64, value: 'f64' },
                { type: TokenType.Bool, value: 'bool' },
                { type: TokenType.Size, value: 'size' }, // Platform-dependent integer type
                { type: TokenType.USize, value: 'usize' }, // Platform-dependent unsigned integer type
            ]);
        });

        it('should tokenize other built-in type identifiers', () => {
            const source = 'string char void never any unit self super';
            expectTokens(source, [
                { type: TokenType.String, value: 'string' }, // Type keyword, not literal
                { type: TokenType.Char, value: 'char' },
                { type: TokenType.Void, value: 'void' },
                { type: TokenType.Never, value: 'never' },
                { type: TokenType.Any, value: 'any' }, // Dynamically typed generic type
                { type: TokenType.Unit, value: 'unit' }, // A type representing the absence of a value (like void, but often as a return type)
                { type: TokenType.Self, value: 'Self' }, // Type for current struct/class (Rust-like)
                { type: TokenType.SuperType, value: 'Super' }, // Type for superclass (Rust-like)
            ]);
        });
    });

    describe('Complex Scenarios', () => {
        it('should tokenize a complex class definition with generics, inheritance, and attributes', () => {
            const source = `
                export @Serializable
                class MyClass<T: Clone + Debug> extends BaseClass implements IMyInterface {
                    @field
                    private static readonly VERSION: i32 = 1_0_0;
                    
                    @getter
                    public name: string;
                    protected value: T;

                    constructor(name: string, value: T) {
                        super();
                        this.name = name;
                        this.value = value;
                    }

                    public fn getValue(): T {
                        return this.value;
                    }

                    private calculate(a: i32, b: i32): i32 {
                        let result: i32 = (a + b) * MyClass::VERSION - 100;
                        if (result < 0) {
                            return 0;
                        } else if (result >= 1000) {
                            return 999;
                        }
                        return result;
                    }
                }
            `;
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            const tokenTypes = tokens.map(t => t.type);
            const tokenValues = tokens.map(t => t.value);

            expect(tokenTypes).toEqual([
                TokenType.Export, TokenType.At, TokenType.Identifier, // @Serializable
                TokenType.Class, TokenType.Identifier, TokenType.LessThan, TokenType.Identifier, TokenType.Colon,
                TokenType.Identifier, TokenType.Plus, TokenType.Identifier, TokenType.GreaterThan, // T: Clone + Debug
                TokenType.Extends, TokenType.Identifier, TokenType.Implements, TokenType.Identifier, TokenType.OpenBrace,
                TokenType.At, TokenType.Identifier, // @field
                TokenType.Private, TokenType.Static, TokenType.Readonly,
                TokenType.Identifier, TokenType.Colon, TokenType.I32, TokenType.Assign, TokenType.Integer, TokenType.Semicolon,
                TokenType.At, TokenType.Identifier, // @getter
                TokenType.Public, TokenType.Identifier, TokenType.Colon, TokenType.String, TokenType.Semicolon,
                TokenType.Protected, TokenType.Identifier, TokenType.Colon, TokenType.Identifier, TokenType.Semicolon,
                TokenType.Constructor, TokenType.OpenParen, TokenType.Identifier, TokenType.Colon, TokenType.String, TokenType.Comma,
                TokenType.Identifier, TokenType.Colon, TokenType.Identifier, TokenType.CloseParen, TokenType.OpenBrace,
                TokenType.Super, TokenType.OpenParen, TokenType.CloseParen, TokenType.Semicolon,
                TokenType.This, TokenType.Dot, TokenType.Identifier, TokenType.Assign, TokenType.Identifier, TokenType.Semicolon,
                TokenType.This, TokenType.Dot, TokenType.Identifier, TokenType.Assign, TokenType.Identifier, TokenType.Semicolon,
                TokenType.CloseBrace,
                TokenType.Public, TokenType.Func, TokenType.Identifier, TokenType.OpenParen, TokenType.CloseParen,
                TokenType.Colon, TokenType.Identifier, TokenType.OpenBrace,
                TokenType.Return, TokenType.This, TokenType.Dot, TokenType.Identifier, TokenType.Semicolon,
                TokenType.CloseBrace,
                TokenType.Private, TokenType.Identifier, TokenType.OpenParen, TokenType.Identifier, TokenType.Colon, TokenType.I32,
                TokenType.Comma, TokenType.Identifier, TokenType.Colon, TokenType.I32, TokenType.CloseParen,
                TokenType.Colon, TokenType.I32, TokenType.OpenBrace,
                TokenType.Let, TokenType.Identifier, TokenType.Colon, TokenType.I32, TokenType.Assign,
                TokenType.OpenParen, TokenType.Identifier, TokenType.Plus, TokenType.Identifier, TokenType.CloseParen,
                TokenType.Star, TokenType.Identifier, TokenType.DoubleColon, TokenType.Identifier, TokenType.Minus, TokenType.Integer, TokenType.Semicolon,
                TokenType.If, TokenType.OpenParen, TokenType.Identifier, TokenType.LessThan, TokenType.Integer, TokenType.CloseParen,
                TokenType.OpenBrace, TokenType.Return, TokenType.Integer, TokenType.Semicolon, TokenType.CloseBrace,
                TokenType.Else, TokenType.If, TokenType.OpenParen, TokenType.Identifier, TokenType.GreaterThanOrEqual, TokenType.Integer, TokenType.CloseParen,
                TokenType.OpenBrace, TokenType.Return, TokenType.Integer, TokenType.Semicolon, TokenType.CloseBrace,
                TokenType.Return, TokenType.Identifier, TokenType.Semicolon,
                TokenType.CloseBrace,
                TokenType.CloseBrace,
                TokenType.EOF,
            ]);

            expect(tokenValues.filter(v => v !== '(' && v !== ')' && v !== '{' && v !== '}' && v !== '[' && v !== ']' && v !== ',' && v !== ':' && v !== ';' && v !== '=' && v !== '.' && v !== '+' && v !== '-' && v !== '*' && v !== '/' && v !== '%' && v !== '<' && v !== '>' && v !== '@')).toEqual([
                'export', 'Serializable', 'class', 'MyClass', 'T', 'Clone', 'Debug', 'extends', 'BaseClass', 'implements', 'IMyInterface',
                'field', 'private', 'static', 'readonly', 'VERSION', 'i32', '1_0_0',
                'getter', 'public', 'name', 'string', 'protected', 'value', 'T',
                'constructor', 'name', 'string', 'value', 'T',
                'super', 'this', 'name', 'name', 'this', 'value', 'value',
                'public', 'fn', 'getValue', 'T', 'return', 'this', 'value',
                'private', 'calculate', 'a', 'i32', 'b', 'i32', 'i32',
                'let', 'result', 'i32', 'a', 'b', 'MyClass', 'VERSION', '100',
                'if', 'result', '0', 'return', '0',
                'else', 'if', 'result', '1000', 'return', '999',
                'return', 'result', ''
            ]);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty source input gracefully', () => {
            const source = '';
            expectTokens(source, []);
        });

        it('should handle source with only whitespace', () => {
            const source = '   \n\t  \r';
            expectTokens(source, []);
        });

        it('should correctly track line and column numbers across multiple lines', () => {
            const source = `
                let a = 1;
                const b = "hello";
                func main() {
                    return a + b;
                }
            `;
            expectTokens(source, [
                { type: TokenType.Let, value: 'let', line: 2, column: 17 },
                { type: TokenType.Identifier, value: 'a', line: 2, column: 21 },
                { type: TokenType.Assign, value: '=', line: 2, column: 23 },
                { type: TokenType.Integer, value: '1', line: 2, column: 25 },
                { type: TokenType.Semicolon, value: ';', line: 2, column: 26 },

                { type: TokenType.Const, value: 'const', line: 3, column: 17 },
                { type: TokenType.Identifier, value: 'b', line: 3, column: 23 },
                { type: TokenType.Assign, value: '=', line: 3, column: 25 },
                { type: TokenType.StringLiteral, value: 'hello', line: 3, column: 27 },
                { type: TokenType.Semicolon, value: ';', line: 3, column: 34 },

                { type: TokenType.Func, value: 'func', line: 4, column: 17 },
                { type: TokenType.Identifier, value: 'main', line: 4, column: 22 },
                { type: TokenType.OpenParen, value: '(', line: 4, column: 26 },
                { type: TokenType.CloseParen, value: ')', line: 4, column: 27 },
                { type: TokenType.OpenBrace, value: '{', line: 4, column: 29 },

                { type: TokenType.Return, value: 'return', line: 5, column: 21 },
                { type: TokenType.Identifier, value: 'a', line: 5, column: 28 },
                { type: TokenType.Plus, value: '+', line: 5, column: 30 },
                { type: TokenType.Identifier, value: 'b', line: 5, column: 32 },
                { type: TokenType.Semicolon, value: ';', line: 5, column: 33 },

                { type: TokenType.CloseBrace, value: '}', line: 6, column: 17 },
            ]);
        });

        it('should report unknown characters as Error tokens', () => {
            // A robust lexer should not crash on unknown characters but report them.
            // Assuming TokenType.Error is used for this purpose.
            const source = 'let x = 10; @#^invalid_token!';
            expectTokens(source, [
                { type: TokenType.Let, value: 'let', line: 1, column: 1 },
                { type: TokenType.Identifier, value: 'x', line: 1, column: 5 },
                { type: TokenType.Assign, value: '=', line: 1, column: 7 },
                { type: TokenType.Integer, value: '10', line: 1, column: 9 },
                { type: TokenType.Semicolon, value: ';', line: 1, column: 11 },
                { type: TokenType.At, value: '@', line: 1, column: 13 }, // @ is a valid token, so it should be tokenized
                { type: TokenType.Hash, value: '#', line: 1, column: 14 }, // # is a valid token
                { type: TokenType.Error, value: '^', line: 1, column: 15 }, // Assuming '^' is not a defined token
                { type: TokenType.Identifier, value: 'invalid_token', line: 1, column: 16 },
                { type: TokenType.Bang, value: '!', line: 1, column: 29 }, // ! is a valid token
            ]);
        });

        it('should handle unclosed string literals (if lexer design allows)', () => {
            // Depending on lexer design, this might result in an EOF or an error token at the end.
            // Assuming the lexer would create a string literal token up to EOF and then an error, or just error.
            // For now, let's assume it attempts to make a string token and reaches EOF.
            const source = `"unclosed string`;
            expectTokens(source, [
                { type: TokenType.Error, value: `unclosed string`, line: 1, column: 1 } // Assuming it reports an error for unclosed string.
            ]);
        });

        it('should handle unclosed multi-line comments', () => {
            // A common error case. Lexer should generally report this.
            // Assuming TokenType.Error for unclosed comment.
            const source = `let x = 1; /* unclosed comment`;
            expectTokens(source, [
                { type: TokenType.Let, value: 'let', line: 1, column: 1 },
                { type: TokenType.Identifier, value: 'x', line: 1, column: 5 },
                { type: TokenType.Assign, value: '=', line: 1, column: 7 },
                { type: TokenType.Integer, value: '1', line: 1, column: 9 },
                { type: TokenType.Semicolon, value: ';', line: 1, column: 10 },
                { type: TokenType.Error, value: `/* unclosed comment`, line: 1, column: 12 } // Reports the entire unclosed comment as an error.
            ]);
        });
    });
});