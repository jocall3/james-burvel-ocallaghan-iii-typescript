// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview The Lexer (or Scanner/Tokenizer) for the TSAL language.
 * It takes a raw source code string and breaks it into a sequence of tokens.
 * This expanded version supports a richer set of language features,
 * including more types, operators, literals, and robust error handling.
 */

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

/**
 * Custom error class for reporting lexing errors with precise location.
 */
export class LexerError extends Error {
    constructor(message: string, public line: number, public column: number, public rawChar?: string) {
        super(`Lexer Error: ${message} at line ${line}, column ${column}` + (rawChar ? ` (char: '${rawChar}')` : ''));
        this.name = 'LexerError';
        // Restore prototype chain for proper `instanceof` checks
        Object.setPrototypeOf(this, LexerError.prototype);
    }
}

export enum TokenType {
    // Keywords
    Func = 'Func', Return = 'Return', Local = 'Local', Export = 'Export', Unsafe = 'Unsafe', Import = 'Import', From = 'From', Global = 'Global',
    If = 'If', Else = 'Else', While = 'While', For = 'For', Break = 'Break', Continue = 'Continue',
    Const = 'Const', Let = 'Let', Var = 'Var', Struct = 'Struct', Enum = 'Enum', Interface = 'Interface',
    Public = 'Public', Private = 'Private', Protected = 'Protected', Static = 'Static', This = 'This', Super = 'Super',
    New = 'New', Null = 'Null', True = 'True', False = 'False', Async = 'Async', Await = 'Await',
    Try = 'Try', Catch = 'Catch', Finally = 'Finally', Throw = 'Throw', Type = 'Type', Alias = 'Alias',
    As = 'As', Is = 'Is', Typeof = 'Typeof', Sizeof = 'Sizeof', Alignedof = 'Alignedof', Mut = 'Mut', Ref = 'Ref', Ptr = 'Ptr',
    Class = 'Class', Extends = 'Extends', Implements = 'Implements', Get = 'Get', Set = 'Set',
    Switch = 'Switch', Case = 'Case', Default = 'Default', Defer = 'Defer', Go = 'Go',
    Package = 'Package',
    
    // Types
    I8 = 'I8', I16 = 'I16', I32 = 'I32', I64 = 'I64',
    U8 = 'U8', U16 = 'U16', U32 = 'U32', U64 = 'U64',
    F32 = 'F32', F64 = 'F64', Bool = 'Bool', Char = 'Char', Void = 'Void',
    MemPtr = 'MemPtr', StringRef = 'StringRef', HostRef = 'HostRef', Any = 'Any',

    // Symbols
    Identifier = 'Identifier',
    IntegerLiteral = 'IntegerLiteral',
    FloatLiteral = 'FloatLiteral',
    StringLiteral = 'StringLiteral',
    CharLiteral = 'CharLiteral',
    BooleanLiteral = 'BooleanLiteral', // Represents 'true' or 'false' keywords when treated as literals

    // Operators
    // Arithmetic
    Plus = '+', Minus = '-', Star = '*', Slash = '/', Modulo = '%', Power = '**',
    // Assignment
    Equals = '=', PlusEquals = '+=', MinusEquals = '-=', StarEquals = '*=', SlashEquals = '/=', ModuloEquals = '%=', PowerEquals = '**=',
    // Bitwise Assignment
    BitwiseAndEquals = '&=', BitwiseOrEquals = '|=', BitwiseXorEquals = '^=',
    LeftShiftEquals = '<<=', RightShiftEquals = '>>=', UnsignedRightShiftEquals = '>>>=',
    // Comparison
    EqualsEquals = '==', NotEquals = '!=', LessThan = '<', LessThanEquals = '<=', GreaterThan = '>', GreaterThanEquals = '>=',
    // Logical
    And = '&&', Or = '||', Not = '!',
    // Bitwise
    BitwiseAnd = '&', BitwiseOr = '|', BitwiseXor = '^', BitwiseNot = '~',
    LeftShift = '<<', RightShift = '>>', UnsignedRightShift = '>>>',
    // Increment/Decrement
    Increment = '++', Decrement = '--',
    // Member Access / Nullish Coalescing / Optional Chaining
    Dot = '.', QuestionDot = '?.', NullCoalescing = '??',

    // Punctuation
    OpenParen = '(', CloseParen = ')', OpenBrace = '{', CloseBrace = '}', OpenBracket = '[', CloseBracket = ']',
    Colon = ':', SemiColon = ';', Comma = ',', Arrow = '->',
    QuestionMark = '?', Hash = '#', Backtick = '`', Ellipsis = '...', Pipe = '|',
    
    // Decorators
    Decorator = '@',

    EOF = 'EOF',
}

const KEYWORDS: Record<string, TokenType> = {
    'func': TokenType.Func, 'return': TokenType.Return, 'local': TokenType.Local,
    'export': TokenType.Export, 'unsafe': TokenType.Unsafe, 'import': TokenType.Import,
    'from': TokenType.From, 'global': TokenType.Global, 'if': TokenType.If, 'else': TokenType.Else,
    'while': TokenType.While, 'for': TokenType.For, 'break': TokenType.Break, 'continue': TokenType.Continue,
    'const': TokenType.Const, 'let': TokenType.Let, 'var': TokenType.Var, 'struct': TokenType.Struct, 'enum': TokenType.Enum, 'interface': TokenType.Interface,
    'public': TokenType.Public, 'private': TokenType.Private, 'protected': TokenType.Protected, 'static': TokenType.Static, 'this': TokenType.This, 'super': TokenType.Super,
    'new': TokenType.New, 'null': TokenType.Null, 'true': TokenType.True, 'false': TokenType.False, 'async': TokenType.Async, 'await': TokenType.Await,
    'try': TokenType.Try, 'catch': TokenType.Catch, 'finally': TokenType.Finally, 'throw': TokenType.Throw, 'type': TokenType.Type, 'alias': TokenType.Alias,
    'as': TokenType.As, 'is': TokenType.Is, 'typeof': TokenType.Typeof, 'sizeof': TokenType.Sizeof, 'alignedof': TokenType.Alignedof, 'mut': TokenType.Mut, 'ref': TokenType.Ref, 'ptr': TokenType.Ptr,
    'class': TokenType.Class, 'extends': TokenType.Extends, 'implements': TokenType.Implements, 'get': TokenType.Get, 'set': TokenType.Set,
    'switch': TokenType.Switch, 'case': TokenType.Case, 'default': TokenType.Default, 'defer': TokenType.Defer, 'go': TokenType.Go,
    'package': TokenType.Package,
};

const TYPES: Record<string, TokenType> = {
    'i8': TokenType.I8, 'i16': TokenType.I16, 'i32': TokenType.I32, 'i64': TokenType.I64,
    'u8': TokenType.U8, 'u16': TokenType.U16, 'u32': TokenType.U32, 'u64': TokenType.U64,
    'f32': TokenType.F32, 'f64': TokenType.F64, 'bool': TokenType.Bool, 'char': TokenType.Char, 'void': TokenType.Void,
    'mem_ptr': TokenType.MemPtr, 'string_ref': TokenType.StringRef, 'host_ref': TokenType.HostRef, 'any': TokenType.Any
};


export class Lexer {
    private source: string;
    private position: number = 0;
    private currentLine: number = 1;
    private currentColumn: number = 1;

    constructor(source: string) {
        this.source = source;
    }

    /** Checks if the lexer has reached the end of the source string. */
    private isAtEnd(): boolean {
        return this.position >= this.source.length;
    }

    /** Advances the lexer's position and returns the consumed character.
     * Updates line and column numbers. */
    private advance(): string {
        const char = this.source[this.position++];
        if (char === '\n') {
            this.currentLine++;
            this.currentColumn = 1;
        } else {
            this.currentColumn++;
        }
        return char;
    }

    /** Peeks at the current character without advancing the position.
     * Returns null character `\0` if at end. */
    private peek(): string {
        return this.isAtEnd() ? '\0' : this.source[this.position];
    }
    
    /** Peeks at the next character (two characters ahead) without advancing.
     * Returns null character `\0` if at end. */
    private peekNext(): string {
        return (this.position + 1) >= this.source.length ? '\0' : this.source[this.position + 1];
    }

    /** Consumes the current character if it matches the expected character. */
    private match(expected: string): boolean {
        if (this.isAtEnd() || this.peek() !== expected) {
            return false;
        }
        this.advance();
        return true;
    }
    
    /** Creates a Token object with the given type, value, and precise start location. */
    private createToken(type: TokenType, value: string, startLine: number, startColumn: number): Token {
        return { type, value, line: startLine, column: startColumn };
    }

    /** Helper: Checks if a character is a digit (0-9). */
    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    /** Helper: Checks if a character is an alphabet character or underscore. */
    private isAlpha(char: string): boolean {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
    }

    /** Helper: Checks if a character is alphanumeric (alpha or digit). */
    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }

    /** Helper: Checks if a character is a hexadecimal digit (0-9, a-f, A-F). */
    private isHexDigit(char: string): boolean {
        return this.isDigit(char) || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F');
    }

    /** Helper: Checks if a character is a binary digit (0 or 1). */
    private isBinaryDigit(char: string): boolean {
        return char === '0' || char === '1';
    }

    /** Helper: Checks if a character is an octal digit (0-7). */
    private isOctalDigit(char: string): boolean {
        return char >= '0' && char <= '7';
    }

    /** Skips whitespace characters and single-line/multi-line comments. */
    private skipWhitespaceAndComments(): void {
        while (!this.isAtEnd()) {
            const char = this.peek();
            switch (char) {
                case ' ':
                case '\r':
                case '\t':
                case '\n':
                    this.advance();
                    break;
                case '/':
                    if (this.peekNext() === '/') { // Single-line comment
                        while (!this.isAtEnd() && this.peek() !== '\n') {
                            this.advance();
                        }
                    } else if (this.peekNext() === '*') { // Multi-line comment
                        this.advance(); // Consume '/'
                        this.advance(); // Consume '*'
                        let commentClosed = false;
                        while (!this.isAtEnd()) {
                            if (this.peek() === '*' && this.peekNext() === '/') {
                                this.advance(); // Consume '*'
                                this.advance(); // Consume '/'
                                commentClosed = true;
                                break;
                            }
                            this.advance();
                        }
                        if (!commentClosed) {
                            throw new LexerError('Unterminated multi-line comment', this.currentLine, this.currentColumn);
                        }
                    } else {
                        return; // Not a comment, break out to let main loop handle '/' operator
                    }
                    break;
                default:
                    return; // Not whitespace or comment, break
            }
        }
    }

    /** Scans an identifier or a keyword. */
    private scanIdentifierOrKeyword(startLine: number, startColumn: number): Token {
        let value = this.advance(); // Consume the first char (already checked to be alpha)
        while (this.isAlphaNumeric(this.peek())) {
            value += this.advance();
        }

        const keywordType = KEYWORDS[value];
        const typeType = TYPES[value];

        if (keywordType) {
            // Treat 'true' and 'false' as BooleanLiterals, but also keywords.
            // For general parsing, it's often useful to distinguish 'true' as a keyword vs. a literal.
            // Here we prioritize it as a BooleanLiteral as it represents a data value.
            if (keywordType === TokenType.True || keywordType === TokenType.False) {
                return this.createToken(TokenType.BooleanLiteral, value, startLine, startColumn);
            }
            return this.createToken(keywordType, value, startLine, startColumn);
        } else if (typeType) {
            return this.createToken(typeType, value, startLine, startColumn);
        } else {
            return this.createToken(TokenType.Identifier, value, startLine, startColumn);
        }
    }

    /** Scans an integer or floating-point number, supporting various bases and underscores. */
    private scanNumber(startLine: number, startColumn: number): Token {
        let value = '';
        let type = TokenType.IntegerLiteral;

        // Handle base prefixes (0x, 0b, 0o)
        if (this.peek() === '0') {
            value += this.advance(); // Consume '0'
            const nextChar = this.peek();
            if (nextChar === 'x' || nextChar === 'X') { // Hexadecimal
                value += this.advance();
                while (this.isHexDigit(this.peek()) || this.peek() === '_') {
                    if (this.peek() === '_') this.advance();
                    else value += this.advance();
                }
                return this.createToken(type, value, startLine, startColumn);
            } else if (nextChar === 'b' || nextChar === 'B') { // Binary
                value += this.advance();
                while (this.isBinaryDigit(this.peek()) || this.peek() === '_') {
                    if (this.peek() === '_') this.advance();
                    else value += this.advance();
                }
                return this.createToken(type, value, startLine, startColumn);
            } else if (nextChar === 'o' || nextChar === 'O') { // Octal
                value += this.advance();
                while (this.isOctalDigit(this.peek()) || this.peek() === '_') {
                    if (this.peek() === '_') this.advance();
                    else value += this.advance();
                }
                return this.createToken(type, value, startLine, startColumn);
            }
        }

        // Standard decimal part
        while (this.isDigit(this.peek()) || this.peek() === '_') {
            if (this.peek() === '_') this.advance();
            else value += this.advance();
        }

        // Fractional part
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            type = TokenType.FloatLiteral;
            value += this.advance(); // Consume '.'
            while (this.isDigit(this.peek()) || this.peek() === '_') {
                if (this.peek() === '_') this.advance();
                else value += this.advance();
            }
        }

        // Exponent part (e.g., 1e-5, 1.2e+3)
        if ((this.peek() === 'e' || this.peek() === 'E') && (this.isDigit(this.peekNext()) || this.peekNext() === '+' || this.peekNext() === '-')) {
            type = TokenType.FloatLiteral;
            value += this.advance(); // Consume 'e' or 'E'
            if (this.peek() === '+' || this.peek() === '-') {
                value += this.advance();
            }
            while (this.isDigit(this.peek())) {
                value += this.advance();
            }
        }
        
        return this.createToken(type, value, startLine, startColumn);
    }

    /** Scans a floating-point literal that begins with a decimal point (e.g., .5, .123e-4). */
    private scanNumberPartAfterDot(initialValue: string, startLine: number, startColumn: number): Token {
        let value = initialValue; // Should be "."
        // Already validated peekNext() is a digit.
        while (this.isDigit(this.peek()) || this.peek() === '_') {
            if (this.peek() === '_') this.advance();
            else value += this.advance();
        }

        // Exponent part
        if ((this.peek() === 'e' || this.peek() === 'E') && (this.isDigit(this.peekNext()) || this.peekNext() === '+' || this.peekNext() === '-')) {
            value += this.advance(); // Consume 'e' or 'E'
            if (this.peek() === '+' || this.peek() === '-') {
                value += this.advance();
            }
            while (this.isDigit(this.peek())) {
                value += this.advance();
            }
        }
        return this.createToken(TokenType.FloatLiteral, value, startLine, startColumn);
    }

    /** Scans a string literal enclosed in double quotes. Handles basic escape sequences. */
    private scanString(startLine: number, startColumn: number): Token {
        let value = '';
        this.advance(); // Consume opening '"'
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\\') { // Handle escape sequences
                this.advance(); // Consume '\'
                const escapeChar = this.peek();
                switch (escapeChar) {
                    case 'n': value += '\n'; break;
                    case 't': value += '\t'; break;
                    case 'r': value += '\r'; break;
                    case '\\': value += '\\'; break;
                    case '"': value += '"'; break;
                    case '0': value += '\0'; break; // Null character
                    case 'b': value += '\b'; break; // Backspace
                    case 'f': value += '\f'; break; // Form feed
                    // TODO: Add support for \uXXXX (unicode) and \xXX (hex byte) escape sequences
                    default:
                        throw new LexerError(`Unrecognized or invalid escape sequence '\\${escapeChar}' in string literal`, this.currentLine, this.currentColumn -1);
                }
                this.advance(); // Consume the escaped character
            } else {
                value += this.advance(); // Consume regular character
            }
        }

        if (this.isAtEnd()) {
            throw new LexerError('Unterminated string literal', startLine, startColumn);
        }
        this.advance(); // Consume closing '"'
        return this.createToken(TokenType.StringLiteral, value, startLine, startColumn);
    }

    /** Scans a character literal enclosed in single quotes. Handles basic escape sequences. */
    private scanCharLiteral(startLine: number, startColumn: number): Token {
        let charValue = '';
        this.advance(); // Consume opening "'"

        if (this.isAtEnd()) {
            throw new LexerError('Unterminated character literal', startLine, startColumn);
        }

        if (this.peek() === '\\') { // Handle escape sequences
            this.advance(); // Consume '\'
            const escapeChar = this.peek();
            switch (escapeChar) {
                case 'n': charValue = '\n'; break;
                case 't': charValue = '\t'; break;
                case 'r': charValue = '\r'; break;
                case '\\': charValue = '\\'; break;
                case "'": charValue = "'"; break;
                case '0': charValue = '\0'; break;
                case 'b': charValue = '\b'; break;
                case 'f': charValue = '\f'; break;
                // TODO: Add support for \uXXXX (unicode) and \xXX (hex byte) escape sequences
                default:
                    throw new LexerError(`Unrecognized or invalid escape sequence '\\${escapeChar}' in char literal`, this.currentLine, this.currentColumn - 1);
            }
            this.advance(); // Consume escapeChar
        } else {
            charValue = this.advance();
        }

        if (this.peek() !== "'") {
            // After consuming the single char (or escape), if it's not a closing quote, it's an error.
            throw new LexerError('Unterminated or multi-character character literal (expected single character)', startLine, startColumn);
        }
        this.advance(); // Consume closing "'"
        return this.createToken(TokenType.CharLiteral, charValue, startLine, startColumn);
    }

    /**
     * Main tokenization method. Iterates through the source code and produces a list of tokens.
     * @returns An array of `Token` objects.
     * @throws {LexerError} If an unexpected character or unterminated literal is encountered.
     */
    public tokenize(): Token[] {
        const tokens: Token[] = [];

        while (!this.isAtEnd()) {
            const startLine = this.currentLine;
            const startColumn = this.currentColumn;

            this.skipWhitespaceAndComments();
            if (this.isAtEnd()) break; // May have skipped to EOF

            const char = this.peek(); // Peek at the current char; helper functions will advance

            if (this.isAlpha(char)) {
                tokens.push(this.scanIdentifierOrKeyword(startLine, startColumn));
            } else if (this.isDigit(char)) {
                tokens.push(this.scanNumber(startLine, startColumn));
            } else if (char === '"') {
                tokens.push(this.scanString(startLine, startColumn));
            } else if (char === "'") {
                tokens.push(this.scanCharLiteral(startLine, startColumn));
            } else {
                // Handle single and multi-character operators/punctuation
                let token: Token | null = null;
                switch (char) {
                    // Single-character tokens
                    case '(': token = this.createToken(TokenType.OpenParen, this.advance(), startLine, startColumn); break;
                    case ')': token = this.createToken(TokenType.CloseParen, this.advance(), startLine, startColumn); break;
                    case '[': token = this.createToken(TokenType.OpenBracket, this.advance(), startLine, startColumn); break;
                    case ']': token = this.createToken(TokenType.CloseBracket, this.advance(), startLine, startColumn); break;
                    case '{': token = this.createToken(TokenType.OpenBrace, this.advance(), startLine, startColumn); break;
                    case '}': token = this.createToken(TokenType.CloseBrace, this.advance(), startLine, startColumn); break;
                    case ',': token = this.createToken(TokenType.Comma, this.advance(), startLine, startColumn); break;
                    case ';': token = this.createToken(TokenType.SemiColon, this.advance(), startLine, startColumn); break;
                    case '@': token = this.createToken(TokenType.Decorator, this.advance(), startLine, startColumn); break;
                    case '#': token = this.createToken(TokenType.Hash, this.advance(), startLine, startColumn); break;
                    case '`': token = this.createToken(TokenType.Backtick, this.advance(), startLine, startColumn); break;
                    case '~': token = this.createToken(TokenType.BitwiseNot, this.advance(), startLine, startColumn); break;

                    // Multi-character token handling (longest match principle)
                    case '+':
                        this.advance(); // Consume '+'
                        if (this.match('=')) { token = this.createToken(TokenType.PlusEquals, '+=', startLine, startColumn); }
                        else if (this.match('+')) { token = this.createToken(TokenType.Increment, '++', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Plus, '+', startLine, startColumn); }
                        break;
                    case '-':
                        this.advance(); // Consume '-'
                        if (this.match('=')) { token = this.createToken(TokenType.MinusEquals, '-=', startLine, startColumn); }
                        else if (this.match('-')) { token = this.createToken(TokenType.Decrement, '--', startLine, startColumn); }
                        else if (this.match('>')) { token = this.createToken(TokenType.Arrow, '->', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Minus, '-', startLine, startColumn); }
                        break;
                    case '*':
                        this.advance(); // Consume '*'
                        if (this.match('*')) { // Now `**`
                            if (this.match('=')) { token = this.createToken(TokenType.PowerEquals, '**=', startLine, startColumn); }
                            else { token = this.createToken(TokenType.Power, '**', startLine, startColumn); }
                        } else if (this.match('=')) { token = this.createToken(TokenType.StarEquals, '*=', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Star, '*', startLine, startColumn); }
                        break;
                    case '/':
                        this.advance(); // Consume '/'
                        if (this.match('=')) { token = this.createToken(TokenType.SlashEquals, '/=', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Slash, '/', startLine, startColumn); }
                        break;
                    case '%':
                        this.advance(); // Consume '%'
                        if (this.match('=')) { token = this.createToken(TokenType.ModuloEquals, '%=', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Modulo, '%', startLine, startColumn); }
                        break;
                    case '&':
                        this.advance(); // Consume '&'
                        if (this.match('&')) { token = this.createToken(TokenType.And, '&&', startLine, startColumn); }
                        else if (this.match('=')) { token = this.createToken(TokenType.BitwiseAndEquals, '&=', startLine, startColumn); }
                        else { token = this.createToken(TokenType.BitwiseAnd, '&', startLine, startColumn); }
                        break;
                    case '|':
                        this.advance(); // Consume '|'
                        if (this.match('|')) { token = this.createToken(TokenType.Or, '||', startLine, startColumn); }
                        else if (this.match('=')) { token = this.createToken(TokenType.BitwiseOrEquals, '|=', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Pipe, '|', startLine, startColumn); } // Could be BitwiseOr or Pipe, defaulting to Pipe if not assignment/logical
                        break;
                    case '^':
                        this.advance(); // Consume '^'
                        if (this.match('=')) { token = this.createToken(TokenType.BitwiseXorEquals, '^=', startLine, startColumn); }
                        else { token = this.createToken(TokenType.BitwiseXor, '^', startLine, startColumn); }
                        break;
                    case '!':
                        this.advance(); // Consume '!'
                        if (this.match('=')) { token = this.createToken(TokenType.NotEquals, '!=', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Not, '!', startLine, startColumn); }
                        break;
                    case '=':
                        this.advance(); // Consume '='
                        if (this.match('=')) { token = this.createToken(TokenType.EqualsEquals, '==', startLine, startColumn); }
                        else { token = this.createToken(TokenType.Equals, '=', startLine, startColumn); }
                        break;
                    case '<':
                        this.advance(); // Consume '<'
                        if (this.match('=')) { token = this.createToken(TokenType.LessThanEquals, '<=', startLine, startColumn); }
                        else if (this.match('<')) { // Now `<<`
                            if (this.match('=')) { token = this.createToken(TokenType.LeftShiftEquals, '<<=', startLine, startColumn); }
                            else { token = this.createToken(TokenType.LeftShift, '<<', startLine, startColumn); }
                        }
                        else { token = this.createToken(TokenType.LessThan, '<', startLine, startColumn); }
                        break;
                    case '>':
                        this.advance(); // Consume '>'
                        if (this.match('=')) { token = this.createToken(TokenType.GreaterThanEquals, '>=', startLine, startColumn); }
                        else if (this.match('>')) { // Now `>>`
                            if (this.match('>')) { // Now `>>>`
                                if (this.match('=')) { token = this.createToken(TokenType.UnsignedRightShiftEquals, '>>>=', startLine, startColumn); }
                                else { token = this.createToken(TokenType.UnsignedRightShift, '>>>', startLine, startColumn); }
                            } else if (this.match('=')) { // Now `>>=`
                                token = this.createToken(TokenType.RightShiftEquals, '>>=', startLine, startColumn);
                            } else { // Just `>>`
                                token = this.createToken(TokenType.RightShift, '>>', startLine, startColumn);
                            }
                        }
                        else { token = this.createToken(TokenType.GreaterThan, '>', startLine, startColumn); }
                        break;
                    case '.':
                        this.advance(); // Consume '.'
                        if (this.isDigit(this.peek())) { // Float starting with . (e.g., .5)
                            token = this.scanNumberPartAfterDot('.', startLine, startColumn);
                        } else if (this.match('.')) { // Now `..`
                            if (this.match('.')) { // Now `...`
                                token = this.createToken(TokenType.Ellipsis, '...', startLine, startColumn);
                            } else {
                                // Error: `..` is not a valid token by itself
                                throw new LexerError('Unexpected token \'..\'', startLine, startColumn);
                            }
                        } else if (this.match('?')) { // Now `.?` (optional chaining)
                            token = this.createToken(TokenType.QuestionDot, '.?', startLine, startColumn);
                        }
                        else { token = this.createToken(TokenType.Dot, '.', startLine, startColumn); }
                        break;
                    case '?':
                        this.advance(); // Consume '?'
                        if (this.match('?')) { // Now `??` (nullish coalescing)
                            token = this.createToken(TokenType.NullCoalescing, '??', startLine, startColumn);
                        } else if (this.match('.')) { // Now `?.` (optional chaining), if not handled by '.' already
                            token = this.createToken(TokenType.QuestionDot, '?.', startLine, startColumn);
                        }
                        else { token = this.createToken(TokenType.QuestionMark, '?', startLine, startColumn); }
                        break;

                    default:
                        // If we reach here, it's an unexpected character.
                        const errChar = this.advance(); // Consume the invalid character for error reporting
                        throw new LexerError(`Unexpected character`, startLine, startColumn, errChar);
                }
                if (token) {
                    tokens.push(token);
                }
            }
        }
        tokens.push(this.createToken(TokenType.EOF, '', this.currentLine, this.currentColumn));
        return tokens;
    }
}

/**
 * Convenience function to tokenize a given source string.
 * @param source The source code string to tokenize.
 * @returns An array of `Token` objects.
 * @throws {LexerError} If any lexing errors occur.
 */
export function tokenizeSource(source: string): Token[] {
    const lexer = new Lexer(source);
    return lexer.tokenize();
}

/**
 * Represents a token stream that allows peeking and consuming tokens,
 * useful for parsers.
 */
export class TokenStream {
    private tokens: Token[];
    private currentIndex: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    /** Returns the token at the current position without consuming it. */
    peek(): Token {
        if (this.isAtEnd()) {
            return { type: TokenType.EOF, value: '', line: this.lastTokenLine(), column: this.lastTokenColumn() + 1 };
        }
        return this.tokens[this.currentIndex];
    }

    /** Returns the token at an offset from the current position without consuming it. */
    peekAt(offset: number): Token {
        const index = this.currentIndex + offset;
        if (index >= this.tokens.length) {
             // Return EOF token, potentially at the position after the last token.
            const lastToken = this.tokens[this.tokens.length - 1];
            return { type: TokenType.EOF, value: '', line: lastToken.line, column: lastToken.column + lastToken.value.length };
        }
        return this.tokens[index];
    }

    /** Consumes and returns the current token, advancing the stream. */
    advance(): Token {
        if (this.isAtEnd()) {
            throw new LexerError("Cannot advance past EOF", this.lastTokenLine(), this.lastTokenColumn() + 1, 'EOF');
        }
        return this.tokens[this.currentIndex++];
    }

    /** Checks if the stream has reached the end (EOF token). */
    isAtEnd(): boolean {
        return this.currentIndex >= this.tokens.length - 1; // -1 because the last token is EOF
    }

    /** Expects a token of a specific type and consumes it. Throws an error if types don't match. */
    expect(type: TokenType, message?: string): Token {
        const token = this.peek();
        if (token.type === type) {
            return this.advance();
        }
        throw new LexerError(message || `Expected token type ${type}, but got ${token.type}`, token.line, token.column, token.value);
    }

    /** Attempts to consume a token of a specific type. Returns the token if matched, null otherwise. */
    tryAdvance(type: TokenType): Token | null {
        if (this.peek().type === type) {
            return this.advance();
        }
        return null;
    }

    /** Returns the line number of the last consumed or peeked token. */
    private lastTokenLine(): number {
        if (this.tokens.length === 0) return 1;
        return this.tokens[Math.max(0, this.currentIndex - 1)].line;
    }

    /** Returns the column number of the last consumed or peeked token. */
    private lastTokenColumn(): number {
        if (this.tokens.length === 0) return 1;
        const last = this.tokens[Math.max(0, this.currentIndex - 1)];
        return last.column + last.value.length;
    }
}
