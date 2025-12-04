// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { openDB, DBSchema } from 'idb';
import type { GeneratedFile } from '../types.ts';

const DB_NAME = 'devcore-db';
const DB_VERSION = 2; // FIX: Incremented version to resolve error
const STORE_NAME = 'generated-files';

/**
 * Defines the schema for the DevCore IndexedDB database.
 * This interface extends `DBSchema` to type-safely define object stores and their indexes.
 */
interface DevCoreDB extends DBSchema {
  [STORE_NAME]: {
    key: string; // The primary key for the store, which is 'filePath' in this case.
    value: GeneratedFile; // The type of data stored in this object store.
    indexes: { 'by-filePath': string }; // Defines an index on the 'filePath' property.
  };
}

/**
 * Global promise that resolves to the IndexedDB database instance.
 * This promise handles database opening and schema upgrades.
 */
const dbPromise = openDB<DevCoreDB>(DB_NAME, DB_VERSION, {
  /**
   * Handles database schema upgrades when `DB_VERSION` changes.
   * This function ensures that object stores and indexes are set up correctly.
   * @param db The IDBPDatabase instance.
   * @param oldVersion The old version number of the database.
   * @param newVersion The new version number of the database.
   * @param transaction The transaction object for the upgrade process.
   * @param event The original IDBVersionChangeEvent.
   */
  upgrade(db, oldVersion, newVersion, transaction, event) {
    console.info(`[DB Service] Initiating database upgrade from version ${oldVersion} to ${newVersion}.`);

    // Example migration: If upgrading from a version before 2,
    // we might need to recreate the store or update its schema.
    if (oldVersion < 2) {
      // If the object store already exists, delete it to ensure a clean recreation
      // with the new schema, especially if keyPath or indexes change significantly.
      // This is a destructive operation; real-world apps might migrate data.
      if (db.objectStoreNames.contains(STORE_NAME)) {
        console.warn(`[DB Service] Deleting existing object store: '${STORE_NAME}' for upgrade.`);
        db.deleteObjectStore(STORE_NAME);
      }
    }

    // Create the 'generated-files' object store if it does not exist.
    // This ensures it's created on first access or after a destructive upgrade.
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      console.info(`[DB Service] Creating object store: '${STORE_NAME}' with keyPath 'filePath'.`);
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'filePath', // 'filePath' is designated as the primary key.
      });
      // Create an index on 'filePath' for efficient lookups.
      // `unique: true` ensures no two files can have the same filePath.
      store.createIndex('by-filePath', 'filePath', { unique: true });
      console.info(`[DB Service] Index 'by-filePath' created on '${STORE_NAME}'.`);
    }

    console.info(`[DB Service] Database upgrade to version ${newVersion} completed.`);
  },
  /**
   * Event handler for when a database upgrade is blocked by an older connection.
   */
  blocked() {
    console.error('[DB Service] Database upgrade blocked! Please close all other tabs using this application to allow for a necessary database upgrade.');
    // Optionally alert the user, as this can prevent the app from functioning correctly.
    alert('Application update required: Please close all other tabs using this application to complete a necessary database upgrade.');
  },
  /**
   * Event handler for when this connection is blocking an upgrade from another connection.
   */
  blocking() {
    console.warn('[DB Service] This connection is blocking another version of the database from upgrading. Consider refreshing this page if issues occur.');
  }
});

/**
 * Provides a comprehensive service for interacting with the IndexedDB database.
 * Encapsulates all data access logic for `GeneratedFile` entities,
 * offering methods for CRUD operations and advanced querying.
 * Designed as a singleton to manage a single, persistent database connection.
 */
export class DevCoreDbService {
  private _dbPromise: Promise<import('idb').IDBPDatabase<DevCoreDB>>;

  /**
   * Constructs the DevCoreDbService.
   * @param dbPromise The promise that resolves to the IndexedDB database instance.
   */
  constructor(dbPromise: Promise<import('idb').IDBPDatabase<DevCoreDB>>) {
    this._dbPromise = dbPromise;
    console.info('[DB Service] DevCoreDbService initialized.');
  }

  /**
   * Retrieves the database instance. This method ensures the database is open
   * before any operation and centralizes connection error handling.
   * @returns A promise that resolves to the IndexedDB database instance.
   * @throws {Error} If the database connection fails.
   */
  private async getDb(): Promise<import('idb').IDBPDatabase<DevCoreDB>> {
    try {
      return await this._dbPromise;
    } catch (error) {
      console.error('[DB Service] Failed to open database connection:', error);
      throw new Error('Database connection error. Please try again.');
    }
  }

  /**
   * Saves a single generated file to the database.
   * If a file with the same `filePath` already exists, it will be updated (put operation).
   * @param file The `GeneratedFile` object to save.
   * @returns A promise that resolves when the file is successfully saved.
   * @throws {Error} If the file could not be saved.
   */
  public async saveFile(file: GeneratedFile): Promise<void> {
    const db = await this.getDb();
    try {
      await db.put(STORE_NAME, file);
      console.debug(`[DB Service] File saved/updated successfully: ${file.filePath}`);
    } catch (error) {
      console.error(`[DB Service] Error saving file ${file.filePath}:`, error);
      throw new Error(`Could not save file '${file.filePath}'.`);
    }
  }

  /**
   * Saves multiple generated files to the database in a single transaction.
   * Existing files with matching `filePath`s will be updated. This method
   * is more efficient for batch operations than saving files individually.
   * @param files An array of `GeneratedFile` objects to save.
   * @returns A promise that resolves when all files are saved.
   * @throws {Error} If any file in the batch could not be saved, the transaction will be aborted.
   */
  public async saveFiles(files: GeneratedFile[]): Promise<void> {
    if (files.length === 0) {
      console.debug('[DB Service] No files to save. Skipping batch save operation.');
      return;
    }
    const db = await this.getDb();
    // Use a transaction for batch operations to ensure atomicity and performance.
    const tx = db.transaction(STORE_NAME, 'readwrite');
    try {
      await Promise.all(files.map(file => tx.store.put(file)));
      await tx.done; // Wait for the transaction to complete.
      console.debug(`[DB Service] Successfully saved ${files.length} files in a batch operation.`);
    } catch (error) {
      // Abort the transaction on error to roll back all changes.
      tx.abort();
      console.error(`[DB Service] Error saving multiple files:`, error);
      throw new Error(`Could not save ${files.length} files in batch.`);
    }
  }

  /**
   * Retrieves a single generated file by its unique `filePath`.
   * @param filePath The unique path of the file to retrieve.
   * @returns A promise that resolves to the `GeneratedFile` object, or `null` if not found.
   * @throws {Error} If there was an error retrieving the file.
   */
  public async getFileByPath(filePath: string): Promise<GeneratedFile | null> {
    const db = await this.getDb();
    try {
      const file = await db.get(STORE_NAME, filePath);
      console.debug(`[DB Service] Retrieved file by path '${filePath}': ${file ? 'found' : 'not found'}.`);
      return file || null;
    } catch (error) {
      console.error(`[DB Service] Error getting file by path '${filePath}':`, error);
      throw new Error(`Could not retrieve file by path '${filePath}'.`);
    }
  }

  /**
   * Retrieves all generated files currently stored in the database.
   * @returns A promise that resolves to an array of all `GeneratedFile` objects.
   * @throws {Error} If there was an error retrieving all files.
   */
  public async getAllFiles(): Promise<GeneratedFile[]> {
    const db = await this.getDb();
    try {
      const files = await db.getAll(STORE_NAME);
      console.debug(`[DB Service] Retrieved ${files.length} total files.`);
      return files;
    } catch (error) {
      console.error('[DB Service] Error getting all files:', error);
      throw new Error('Could not retrieve all files.');
    }
  }

  /**
   * Retrieves multiple generated files by their unique `filePath`s.
   * Files not found will simply be omitted from the results.
   * @param filePaths An array of `filePath` strings to retrieve.
   * @returns A promise that resolves to an array of `GeneratedFile` objects that were found.
   * @throws {Error} If there was an error during the retrieval process.
   */
  public async getFilesByPaths(filePaths: string[]): Promise<GeneratedFile[]> {
    if (filePaths.length === 0) {
      console.debug('[DB Service] No file paths provided for batch retrieval. Returning empty array.');
      return [];
    }
    const db = await this.getDb();
    const results: GeneratedFile[] = [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    try {
      for (const path of filePaths) {
        const file = await tx.store.get(path);
        if (file) {
          results.push(file);
        }
      }
      await tx.done;
      console.debug(`[DB Service] Retrieved ${results.length} out of ${filePaths.length} specified files.`);
      return results;
    } catch (error) {
      console.error(`[DB Service] Error getting files by paths ${filePaths.join(', ')}:`, error);
      throw new Error(`Could not retrieve files by specified paths.`);
    }
  }

  /**
   * Deletes a single generated file from the database by its unique `filePath`.
   * @param filePath The unique path of the file to delete.
   * @returns A promise that resolves when the file is deleted.
   * @throws {Error} If the file could not be deleted.
   */
  public async deleteFileByPath(filePath: string): Promise<void> {
    const db = await this.getDb();
    try {
      await db.delete(STORE_NAME, filePath);
      console.debug(`[DB Service] File deleted successfully: ${filePath}`);
    } catch (error) {
      console.error(`[DB Service] Error deleting file ${filePath}:`, error);
      throw new Error(`Could not delete file '${filePath}'.`);
    }
  }

  /**
   * Deletes multiple generated files from the database by their unique `filePath`s
   * in a single transaction.
   * @param filePaths An array of `filePath` strings to delete.
   * @returns A promise that resolves when all specified files are deleted.
   * @throws {Error} If any file in the batch could not be deleted, the transaction will be aborted.
   */
  public async deleteFilesByPaths(filePaths: string[]): Promise<void> {
    if (filePaths.length === 0) {
      console.debug('[DB Service] No file paths provided for batch deletion. Skipping operation.');
      return;
    }
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    try {
      await Promise.all(filePaths.map(filePath => tx.store.delete(filePath)));
      await tx.done;
      console.debug(`[DB Service] Successfully deleted ${filePaths.length} files in a batch operation.`);
    } catch (error) {
      tx.abort();
      console.error(`[DB Service] Error deleting multiple files by paths:`, error);
      throw new Error(`Could not delete multiple files by paths.`);
    }
  }

  /**
   * Clears all generated files from the database.
   * Use with extreme caution as this operation is destructive and irreversible.
   * @returns A promise that resolves when the store is cleared.
   * @throws {Error} If the store could not be cleared.
   */
  public async clearAllFiles(): Promise<void> {
    const db = await this.getDb();
    try {
      await db.clear(STORE_NAME);
      console.warn('[DB Service] All generated files have been cleared from the database. This operation is destructive.');
    } catch (error) {
      console.error('[DB Service] Error clearing all files:', error);
      throw new Error('Could not clear all files from the database.');
    }
  }

  /**
   * Counts the number of generated files currently stored in the database.
   * @returns A promise that resolves to the count of files.
   * @throws {Error} If there was an error counting the files.
   */
  public async countFiles(): Promise<number> {
    const db = await this.getDb();
    try {
      const count = await db.count(STORE_NAME);
      console.debug(`[DB Service] Current file count: ${count}`);
      return count;
    } catch (error) {
      console.error('[DB Service] Error counting files:', error);
      throw new Error('Could not count files in the database.');
    }
  }

  /**
   * Finds files whose `filePath` starts with a given prefix.
   * This is useful for querying files within a specific "directory" or module path structure.
   * @param pathPrefix The prefix string to match against the beginning of file paths.
   * @returns A promise that resolves to an array of `GeneratedFile` objects matching the prefix.
   * @throws {Error} If there was an error during the search operation.
   */
  public async findFilesByPathPrefix(pathPrefix: string): Promise<GeneratedFile[]> {
    const db = await this.getDb();
    const results: GeneratedFile[] = [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    try {
      const index = tx.store.index('by-filePath');
      // Create a key range that starts from `pathPrefix` and extends to the "end" of strings
      // that begin with `pathPrefix`. '\uffff' is a high Unicode character often used
      // to signify the upper bound of a string range.
      const range = IDBKeyRange.bound(pathPrefix, pathPrefix + '\uffff', false, false);

      let cursor = await index.openCursor(range);
      while (cursor) {
        results.push(cursor.value);
        cursor = await cursor.continue();
      }
      await tx.done;
      console.debug(`[DB Service] Found ${results.length} files with path prefix '${pathPrefix}'.`);
      return results;
    } catch (error) {
      console.error(`[DB Service] Error finding files by path prefix '${pathPrefix}':`, error);
      throw new Error(`Could not find files by path prefix '${pathPrefix}'.`);
    }
  }

  /**
   * Checks if a file with the given filePath exists in the database.
   * @param filePath The path of the file to check.
   * @returns A promise that resolves to `true` if the file exists, `false` otherwise.
   * @throws {Error} If there was an error accessing the database.
   */
  public async fileExists(filePath: string): Promise<boolean> {
    const db = await this.getDb();
    try {
      const file = await db.get(STORE_NAME, filePath);
      console.debug(`[DB Service] File existence check for '${filePath}': ${!!file}.`);
      return !!file;
    } catch (error) {
      console.error(`[DB Service] Error checking existence for file '${filePath}':`, error);
      throw new Error(`Could not check existence for file '${filePath}'.`);
    }
  }
}

/**
 * Exports a singleton instance of `DevCoreDbService`.
 * This instance should be imported and used throughout the application
 * to ensure a single, consistent access point to the database.
 *
 * Example usage:
 * `import { dbService } from './services/dbService';`
 * `await dbService.saveFile(myFile);`
 * `const allFiles = await dbService.getAllFiles();`
 */
export const dbService = new DevCoreDbService(dbPromise);

// The original exported functions are commented out as the intent is to use the
// exported `dbService` instance directly for a more structured and extensible API.
// If backward compatibility is strictly required, these could be uncommented and
// delegate calls to the `dbService` instance.

/*
export const saveFile = async (file: GeneratedFile): Promise<void> => {
  return dbService.saveFile(file);
};

export const getAllFiles = async (): Promise<GeneratedFile[]> => {
  return dbService.getAllFiles();
};

export const clearAllFiles = async (): Promise<void> => {
  return dbService.clearAllFiles();
};
*/