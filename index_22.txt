// types/index.ts
// This file has been refactored to act as a central barrel file.
// It aggregates and exports all type definitions from the new, modularized
// files located in the `/types/models` directory. This approach improves organization
// and maintainability while ensuring that all existing component imports
// continue to work without any changes.

export * from './models';
export * from './models/megadashboard';
export * from './models/integration';