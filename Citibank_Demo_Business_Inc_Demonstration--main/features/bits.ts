// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview A standard library for bitwise operations in TSAL.
 * These functions will be mapped to their corresponding WebAssembly instructions
 * by the Alchemist compiler.
 */

import type { i32 } from '../syntax/types';

/**
 * Performs a bitwise AND operation.
 * @param a The first operand.
 * @param b The second operand.
 * @returns The result of a & b.
 */
export function AND(a: i32, b: i32): i32 {
    return a & b;
}

/**
 * Performs a bitwise OR operation.
 * @param a The first operand.
 * @param b The second operand.
 * @returns The result of a | b.
 */
export function OR(a: i32, b: i32): i32 {
    return a | b;
}

/**
 * Performs a bitwise XOR operation.
 * @param a The first operand.
 * @param b The second operand.
 * @returns The result of a ^ b.
 */
export function XOR(a: i32, b: i32): i32 {
    return a ^ b;
}

/**
 * Performs a bitwise left shift.
 * @param a The value to shift.
 * @param b The number of bits to shift by.
 * @returns The result of a << b.
 */
export function SHL(a: i32, b: i32): i32 {
    return a << b;
}

/**
 * Performs a bitwise sign-propagating right shift.
 * @param a The value to shift.
 * @param b The number of bits to shift by.
 * @returns The result of a >> b.
 */
export function SHR_S(a: i32, b: i32): i32 {
    return a >> b;
}

/**
 * Performs a bitwise zero-filling right shift.
 * @param a The value to shift.
 * @param b The number of bits to shift by.
 * @returns The result of a >>> b.
 */
export function SHR_U(a: i32, b: i32): i32 {
    return a >>> b;
}

/**
 * Performs a bitwise NOT operation (one's complement).
 * @param a The operand.
 * @returns The result of ~a.
 */
export function NOT(a: i32): i32 {
    return ~a;
}

/**
 * Returns the value of a specific bit at a given position.
 * @param value The integer from which to read the bit.
 * @param position The zero-based index of the bit to get (0-31).
 * @returns 1 if the bit is set, 0 otherwise.
 */
export function BIT_GET(value: i32, position: i32): i32 {
    // JavaScript bitwise shift operators implicitly handle `position` modulo 32,
    // which aligns with WebAssembly's `i32.shl` behavior for shift amounts.
    return (value >> position) & 1;
}

/**
 * Sets a specific bit at a given position to 1.
 * @param value The integer in which to set the bit.
 * @param position The zero-based index of the bit to set (0-31).
 * @returns The new integer with the specified bit set.
 */
export function BIT_SET(value: i32, position: i32): i32 {
    return value | (1 << position);
}

/**
 * Clears a specific bit at a given position to 0.
 * @param value The integer in which to clear the bit.
 * @param position The zero-based index of the bit to clear (0-31).
 * @returns The new integer with the specified bit cleared.
 */
export function BIT_CLEAR(value: i32, position: i32): i32 {
    return value & ~(1 << position);
}

/**
 * Toggles a specific bit at a given position.
 * If the bit is 0, it becomes 1. If it's 1, it becomes 0.
 * @param value The integer in which to toggle the bit.
 * @param position The zero-based index of the bit to toggle (0-31).
 * @returns The new integer with the specified bit toggled.
 */
export function BIT_TOGGLE(value: i32, position: i32): i32 {
    return value ^ (1 << position);
}

/**
 * Counts the number of set bits (1s) in an i32 integer.
 * This is also known as "population count" or "popcount".
 * Equivalent to `i32.popcnt` in WebAssembly.
 * @param value The integer to count bits in.
 * @returns The number of set bits.
 */
export function POPCOUNT(value: i32): i32 {
    // This is a common bit twiddling hack for popcount.
    // Compilers targeting WASM are expected to replace this with a native `i32.popcnt`.
    value = value - ((value >>> 1) & 0x55555555);
    value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
    return ((value + (value >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

/**
 * Counts the number of leading zero bits in an i32 integer.
 * Equivalent to `i32.clz` in WebAssembly, which treats the value as unsigned.
 * @param value The integer to count leading zeros in.
 * @returns The number of leading zero bits (0-32). If value is 0, returns 32.
 */
export function CLZ(value: i32): i32 {
    return Math.clz32(value);
}

/**
 * Counts the number of trailing zero bits in an i32 integer.
 * Equivalent to `i32.ctz` in WebAssembly, which treats the value as unsigned.
 * @param value The integer to count trailing zeros in.
 * @returns The number of trailing zero bits (0-32). If value is 0, returns 32.
 */
export function CTZ(value: i32): i32 {
    if (value === 0) {
        return 32;
    }
    let count = 0;
    // Iterate while the least significant bit is 0
    while ((value & 1) === 0 && count < 32) {
        value >>>= 1;
        count++;
    }
    return count;
}

/**
 * Rotates the bits of an i32 integer to the left.
 * Equivalent to `i32.rotl` in WebAssembly.
 * @param value The integer to rotate.
 * @param shiftAmount The number of bits to rotate by.
 * @returns The rotated integer.
 */
export function ROTL(value: i32, shiftAmount: i32): i32 {
    const normalizedShift = shiftAmount & 31; // Shift amount is effectively modulo 32 for 32-bit rotates
    return (value << normalizedShift) | (value >>> (32 - normalizedShift));
}

/**
 * Rotates the bits of an i32 integer to the right.
 * Equivalent to `i32.rotr` in WebAssembly.
 * @param value The integer to rotate.
 * @param shiftAmount The number of bits to rotate by.
 * @returns The rotated integer.
 */
export function ROTR(value: i32, shiftAmount: i32): i32 {
    const normalizedShift = shiftAmount & 31; // Shift amount is effectively modulo 32 for 32-bit rotates
    return (value >>> normalizedShift) | (value << (32 - normalizedShift));
}

/**
 * Checks if an i32 integer is a power of two (including 1, excluding 0).
 * @param value The integer to check.
 * @returns True if the value is a power of two, false otherwise.
 */
export function IS_POWER_OF_TWO(value: i32): boolean {
    // A number is a power of two if it's positive and has only one bit set.
    return value > 0 && (value & (value - 1)) === 0;
}

/**
 * Creates an i32 bitmask with `length` bits set, starting from `offset`.
 * For example, `CREATE_MASK(0, 3)` creates `0b111` (7).
 * `CREATE_MASK(1, 2)` creates `0b0110` (6).
 * If `length` is 32, it creates a mask with all bits set (0xFFFFFFFF or -1).
 * @param offset The zero-based starting position of the mask.
 * @param length The number of bits to set in the mask.
 * @returns An i32 bitmask.
 */
export function CREATE_MASK(offset: i32, length: i32): i32 {
    if (length <= 0) {
        return 0;
    }
    // Handle the full 32-bit mask as a special case because `(1 << 32) - 1` is `(1 << 0) - 1 = 0`.
    let mask: i32;
    if (length >= 32) {
        mask = -1; // All bits set (0xFFFFFFFF)
    } else {
        mask = (1 << length) - 1;
    }
    return mask << offset;
}

/**
 * Extracts a sequence of bits (a bitfield) from an i32 integer.
 * @param value The integer from which to extract bits.
 * @param offset The zero-based starting position of the bitfield.
 * @param length The number of bits in the bitfield.
 * @returns The extracted bitfield, right-aligned.
 */
export function EXTRACT_BITS(value: i32, offset: i32, length: i32): i32 {
    if (length <= 0) {
        return 0;
    }
    // Shift right to bring the desired bits to the least significant positions,
    // then mask to clear any higher bits.
    const shiftedValue = value >>> offset;
    const mask = (length >= 32) ? -1 : (1 << length) - 1;
    return shiftedValue & mask;
}

/**
 * Inserts a sequence of bits (a bitfield) into an i32 integer.
 * The bits in `fieldValue` are inserted at `offset` for `length` bits.
 * Other bits in the original `value` remain unchanged.
 * @param value The integer into which to insert the bitfield.
 * @param fieldValue The bits to insert (right-aligned).
 * @param offset The zero-based starting position for insertion.
 * @param length The number of bits to insert.
 * @returns The new integer with the bitfield inserted.
 */
export function INSERT_BITS(value: i32, fieldValue: i32, offset: i32, length: i32): i32 {
    if (length <= 0) {
        return value;
    }
    // Create a mask for the target insertion area to clear existing bits.
    const clearMask = ~(CREATE_MASK(offset, length));

    // Clear the target bits in the original value.
    const clearedValue = value & clearMask;

    // Prepare the field value by masking it to the correct length
    // and then shifting it to the correct position.
    const fieldMask = (length >= 32) ? -1 : (1 << length) - 1;
    const preparedField = (fieldValue & fieldMask) << offset;

    // Combine the cleared value with the prepared field.
    return clearedValue | preparedField;
}

/**
 * Swaps the byte order of an i32 integer (endianness conversion).
 * For example, 0x12345678 becomes 0x78563412.
 * @param value The integer to byte-swap.
 * @returns The integer with bytes swapped.
 */
export function BYTE_SWAP_32(value: i32): i32 {
    // Perform byte swaps using shifts and masks.
    return ((value >>> 24) & 0x000000FF) |
           ((value >>>  8) & 0x0000FF00) |
           ((value <<   8) & 0x00FF0000) |
           ((value <<  24) & 0xFF000000);
}

/**
 * Computes the absolute value of an i32 integer using bitwise operations.
 * This can be faster than `Math.abs` for integer types and avoids branches.
 * @param value The integer.
 * @returns The absolute value of the integer.
 */
export function ABS_BITWISE(value: i32): i32 {
    // For two's complement, if `value` is negative, `mask` will be -1 (0xFFFFFFFF).
    // If `value` is non-negative, `mask` will be 0 (0x00000000).
    // `(value ^ mask)` flips bits if negative, leaves alone if positive.
    // `(value ^ mask) - mask` effectively negates `value` if negative, or leaves `value` if positive.
    const mask = value >> 31;
    return (value ^ mask) - mask;
}

/**
 * Determines the sign of an i32 integer.
 * @param value The integer.
 * @returns 1 for positive, -1 for negative, 0 for zero.
 */
export function SIGN_EXTRACT(value: i32): i32 {
    if (value === 0) {
        return 0;
    }
    // For positive `value`, `value >> 31` is 0. `0 | 1` is 1.
    // For negative `value`, `value >> 31` is -1. `-1 | 1` is -1.
    return (value >> 31) | 1;
}


// --- Constants for i32 properties ---

/**
 * The number of bits in an i32 integer.
 */
export const I32_BITS: i32 = 32;

/**
 * The minimum representable i32 value in two's complement (-(2^31)).
 */
export const I32_MIN: i32 = -2147483648;

/**
 * The maximum representable i32 value in two's complement (2^31 - 1).
 */
export const I32_MAX: i32 = 2147483647;

/**
 * A bitmask with all 32 bits set (0xFFFFFFFF).
 */
export const I32_ALL_ONES: i32 = -1;