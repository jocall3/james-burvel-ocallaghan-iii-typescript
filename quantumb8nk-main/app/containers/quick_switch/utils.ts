// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

export function containsUUID(inputString: string | undefined): string | null {
  if (!inputString) return null;
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match: RegExpExecArray | null = uuidRegex.exec(inputString);
  return match ? match[1] : null;
}
