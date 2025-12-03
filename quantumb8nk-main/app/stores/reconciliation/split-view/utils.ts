// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

export function generateStoreKey(name: string) {
  const liveMode = window.gon.ui?.isLiveMode ? "true" : "false";
  const orgId = window.gon?.organization?.id || "0";
  return `${name}:${orgId}:${liveMode}`;
}
