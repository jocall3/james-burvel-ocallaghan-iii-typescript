// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import { openDB, IDBPDatabase } from 'idb';
import type { FileNode, StorableFileNode } from '../types';

const DB_NAME = 'GeminiFileManagerDB';
const DB_VERSION = 1;
const FILE_STORE_NAME = 'files';

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Initializes the IndexedDB database, creating object stores and indexes if they don't exist.
 * This function ensures the database is ready for operations.
 * It's designed to be called internally by other database functions to ensure a connection.
 */
const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
        const store = db.createObjectStore(FILE_STORE_NAME, {
          keyPath: 'path', // 'path' is the unique identifier for each file/directory node
        });
        store.createIndex('parentId', 'parentId', { unique: false }); // Index for quickly querying children of a directory
        store.createIndex('name', 'name', { unique: false }); // Index for searching files by name
        store.createIndex('lastModified', 'lastModified', { unique: false }); // Index for retrieving recently modified files
        // Additional indexes could be added here for 'type', 'size', 'tags', etc., if needed for future features.
      }
    },
  });
  return dbPromise;
};

/**
 * Adds a single file node (metadata) to the database.
 * This operation will overwrite an existing node if a node with the same path already exists.
 * @param fileNode The StorableFileNode object to add or update.
 */
export async function addFile(fileNode: StorableFileNode): Promise<void> {
  const db = await initDB();
  await db.put(FILE_STORE_NAME, fileNode);
}

/**
 * Adds multiple file nodes (metadata) to the database in a single transaction.
 * This is more efficient than calling `addFile` for each node individually,
 * especially when dealing with a large number of files (e.g., during initial sync or bulk uploads).
 * @param fileNodes An array of StorableFileNode objects to add or update.
 */
export async function addFilesBatch(fileNodes: StorableFileNode[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = tx.store;
    await Promise.all(fileNodes.map(node => store.put(node)));
    await tx.done;
}

/**
 * Retrieves a single file node by its unique path.
 * @param path The full path of the file or directory node to retrieve.
 * @returns A Promise that resolves to the StorableFileNode if found, or undefined if not.
 */
export async function getFileNodeByPath(path: string): Promise<StorableFileNode | undefined> {
    const db = await initDB();
    return db.get(FILE_STORE_NAME, path);
}

/**
 * Retrieves all immediate children (files and subdirectories) for a given directory path.
 * @param directoryPath The path of the parent directory.
 * @returns A Promise that resolves to an array of StorableFileNode representing the immediate children.
 */
export async function getFilesForDirectory(directoryPath: string): Promise<StorableFileNode[]> {
  const db = await initDB();
  const index = db.transaction(FILE_STORE_NAME).store.index('parentId');
  return index.getAll(directoryPath);
}

/**
 * Retrieves file nodes for a given directory path and attempts to get their corresponding
 * FileSystemHandles. This function also performs a cleanup: if a file or directory node
 * exists in the database but cannot be found on the file system (e.g., it was moved or deleted
 * externally), it will be removed from the database.
 * @param directoryHandle The FileSystemDirectoryHandle of the parent directory.
 * @param directoryPath The database path of the parent directory.
 * @returns A Promise that resolves to an array of FileNode (StorableFileNode with its handle).
 */
export async function getFilesForDirectoryWithHandles(directoryHandle: FileSystemDirectoryHandle, directoryPath: string): Promise<FileNode[]> {
    const db = await initDB();
    // Use a 'readwrite' transaction to allow for potential deletions of stale entries
    const tx = db.transaction(FILE_STORE_NAME, 'readwrite'); 
    const store = tx.store;

    const storableFiles = await store.index('parentId').getAll(directoryPath); // Get files using the store within the transaction
    const liveFiles: FileNode[] = [];
    const deletionPromises: Promise<any>[] = [];

    for (const file of storableFiles) {
        try {
            const handle = file.isDirectory 
                ? await directoryHandle.getDirectoryHandle(file.name)
                : await directoryHandle.getFileHandle(file.name);
            liveFiles.push({ ...file, handle });
        } catch (e) {
            console.warn(`Could not get handle for ${file.path} (child of ${directoryPath}). It may have been moved or deleted externally. Removing from DB.`, e);
            // Schedule deletion within the current transaction
            deletionPromises.push(store.delete(file.path));
        }
    }
    await Promise.all(deletionPromises); // Execute all scheduled deletions
    await tx.done; // Ensure the transaction commits
    return liveFiles;
}

/**
 * Retrieves all file nodes (metadata) stored in the database.
 * Use with caution for very large databases as it loads everything into memory,
 * which might impact performance and memory usage.
 * @returns A Promise that resolves to an array of all StorableFileNode objects.
 */
export async function getAllFilesFromDB(): Promise<StorableFileNode[]> {
    const db = await initDB();
    return db.getAll(FILE_STORE_NAME);
}

/**
 * Clears all file nodes from the database. This effectively empties the entire file store.
 * @returns A Promise that resolves when the operation is complete.
 */
export async function clearAllFiles(): Promise<void> {
    const db = await initDB();
    await db.clear(FILE_STORE_NAME);
}

/**
 * Deletes a single file node from the database by its path.
 * This operation only removes the specific node, not its children if it's a directory.
 * For deleting a directory and its contents, use `deleteDescendantsAndSelf`.
 * @param path The unique path of the file node to delete.
 */
export async function deleteFileNode(path: string): Promise<void> {
  const db = await initDB();
  await db.delete(FILE_STORE_NAME, path);
}

/**
 * Retrieves all descendant file nodes (files and subdirectories nested at any level)
 * for a given parent path. This is done by filtering all entries, which can be
 * inefficient for extremely deep or wide hierarchies.
 * @param path The path of the parent node (e.g., a directory) for which to find descendants.
 * @returns A Promise that resolves to an array of StorableFileNode objects that are descendants.
 */
export async function getDescendants(path: string): Promise<StorableFileNode[]> {
    const db = await initDB();
    const allFiles = await db.getAll(FILE_STORE_NAME);
    // Filter by paths that start with the parent path followed by a path separator.
    // This correctly identifies all items within the specified directory heirarchy.
    return allFiles.filter(f => f.path.startsWith(`${path}/`));
}

/**
 * Deletes a file node (or directory) and all its descendant nodes in a single, atomic transaction.
 * This ensures that a partially deleted hierarchy is not left in the database if an error occurs.
 * @param path The path of the node (file or directory) to delete along with its descendants.
 */
export async function deleteDescendantsAndSelf(path: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = tx.store;
    
    // Fetch descendants outside the transaction as getAll is a read operation
    // and transactions should be kept short.
    const descendants = await getDescendants(path); 
    
    // Collect all paths to delete
    const pathsToDelete = [path, ...descendants.map(d => d.path)];
    
    // Perform all deletions within the transaction
    await Promise.all(pathsToDelete.map(p => store.delete(p)));
    
    await tx.done; // Commit the transaction
}

/**
 * Updates the path of a file or directory, effectively renaming or moving it.
 * This function also recursively updates the paths and parentIds of all its descendants
 * to maintain data integrity. All changes are performed in a single transaction.
 * @param oldPath The current, unique path of the file or directory.
 * @param newPath The desired new, unique path for the file or directory.
 */
export async function updatePath(oldPath: string, newPath: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = tx.store;

    const originalNode = await store.get(oldPath);
    if (!originalNode) {
        console.warn(`Attempted to update path for a non-existent node: ${oldPath}`);
        await tx.done; // Ensure the transaction completes even if no action is taken
        return;
    }

    // Determine descendants based on whether the original node was a directory
    const descendants = originalNode.isDirectory ? await getDescendants(oldPath) : [];
    
    const nodesToPut: StorableFileNode[] = [];
    const pathsToDelete: string[] = [];

    // 1. Prepare the updated original node
    const newParentPath = newPath.substring(0, Math.max(newPath.lastIndexOf('/'), newPath.lastIndexOf('\\'))) || null;
    const updatedOriginalNode: StorableFileNode = {
        ...originalNode,
        path: newPath,
        name: newPath.split(/[\\/]/).pop()!, // Extract the new name from the new path
        parentId: newParentPath,
        lastModified: Date.now(), // Update last modified timestamp
    };
    nodesToPut.push(updatedOriginalNode);
    pathsToDelete.push(oldPath); // Mark the old path for deletion

    // 2. Prepare updated descendant nodes
    for (const d of descendants) {
        const updatedDescendantPath = d.path.replace(oldPath, newPath);
        // Ensure parentId is updated correctly. If original parentId was oldPath, it becomes newPath.
        // If it was a sub-directory of oldPath (e.g., oldPath/sub), then the replace will also handle it.
        const updatedDescendantParentId = d.parentId ? d.parentId.replace(oldPath, newPath) : null;
        
        nodesToPut.push({
            ...d,
            path: updatedDescendantPath,
            parentId: updatedDescendantParentId,
            lastModified: Date.now(), // Update last modified timestamp for descendants
        });
        pathsToDelete.push(d.path); // Mark old descendant path for deletion
    }

    // 3. Perform all deletions and additions atomically within the transaction
    await Promise.all([
        ...pathsToDelete.map(path => store.delete(path)), // Delete old records
        ...nodesToPut.map(node => store.put(node))        // Add new records with updated paths
    ]);

    await tx.done; // Commit the transaction
}

/**
 * Updates specific non-structural metadata fields of an existing file node.
 * This function is designed for updates such as tags, description, file size, or last modified date.
 * It explicitly prevents modification of structural fields like `path`, `name`, `parentId`,
 * and `isDirectory`, which should only be changed via dedicated functions like `updatePath`.
 *
 * @param path The unique path of the file node to update.
 * @param updates A partial object containing the fields to update. The type Omit prevents
 *                accidental updates to structural properties.
 * @returns A Promise that resolves when the operation is complete.
 */
export async function updateFileMetadata(
    path: string,
    updates: Partial<Omit<StorableFileNode, 'path' | 'name' | 'parentId' | 'isDirectory'>>
): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = tx.store;

    const existingNode = await store.get(path);
    if (!existingNode) {
        console.warn(`Attempted to update metadata for a non-existent node: ${path}`);
        await tx.done;
        return;
    }

    // Apply updates, ensuring critical structural fields are explicitly retained from existingNode
    const updatedNode: StorableFileNode = {
        ...existingNode,
        ...updates,
        // Explicitly retain structural properties to prevent accidental modification
        path: existingNode.path,
        name: existingNode.name,
        parentId: existingNode.parentId,
        isDirectory: existingNode.isDirectory,
        lastModified: Date.now(), // Always update lastModified when metadata changes
    };
    
    await store.put(updatedNode); // Overwrite the existing record with the updated one
    await tx.done; // Commit the transaction
}

/**
 * Searches for file nodes whose names contain the given query string.
 * Optionally restricts the search to a specific parent directory and its descendants.
 * This function iterates through relevant nodes and performs a case-insensitive substring match.
 * @param query The string to search for within file names (case-insensitive).
 * @param parentPath Optional. The path of the directory to search within, including its subdirectories.
 * @returns A Promise that resolves to an array of StorableFileNode objects matching the query.
 */
export async function searchFiles(query: string, parentPath?: string): Promise<StorableFileNode[]> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readonly');
    const store = tx.store;
    const results: StorableFileNode[] = [];
    const lowerCaseQuery = query.toLowerCase();

    let targetNodes: StorableFileNode[];
    if (parentPath) {
        // If a parent path is specified, get its immediate children and all its descendants.
        // This ensures the search is scoped to the specified hierarchy.
        const children = await getFilesForDirectory(parentPath);
        const descendants = await getDescendants(parentPath);
        targetNodes = [...children, ...descendants];
        
        // Remove duplicates if any (though getFilesForDirectory and getDescendants should be distinct enough)
        const uniquePaths = new Set<string>();
        targetNodes = targetNodes.filter(node => {
            if (uniquePaths.has(node.path)) return false;
            uniquePaths.add(node.path);
            return true;
        });
    } else {
        // If no parent path, search across all files in the database.
        targetNodes = await db.getAll(FILE_STORE_NAME);
    }
    
    // Filter the target nodes by checking if their name includes the query string.
    for (const node of targetNodes) {
        if (node.name.toLowerCase().includes(lowerCaseQuery)) {
            results.push(node);
        }
    }
    await tx.done; // Ensure transaction completes
    return results;
}

/**
 * Retrieves a list of recently modified files, ordered by their `lastModified` timestamp in descending order.
 * This function utilizes an index on the `lastModified` property for efficient retrieval.
 * @param limit The maximum number of recent files to return. Defaults to 20.
 * @returns A Promise that resolves to an array of StorableFileNode, sorted from most to least recently modified.
 */
export async function getRecentFiles(limit: number = 20): Promise<StorableFileNode[]> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readonly');
    const store = tx.store;
    const index = store.index('lastModified');

    const recentFiles: StorableFileNode[] = [];
    // Open cursor in 'prev' direction to get most recent files first
    let cursor = await index.openCursor(null, 'prev'); 

    while (cursor && recentFiles.length < limit) {
        recentFiles.push(cursor.value);
        cursor = await cursor.continue();
    }
    await tx.done;
    return recentFiles;
}

/**
 * Calculates the total cumulative size of files within a given directory and all its descendants.
 * If no `directoryPath` is provided, it calculates the total size of all files in the entire database.
 * This function assumes `StorableFileNode` objects for files (not directories) have a `size` property.
 * @param directoryPath Optional. The path of the directory for which to calculate the total size.
 * @returns A Promise that resolves to the total size in bytes (number).
 */
export async function getDirectorySize(directoryPath?: string): Promise<number> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readonly');
    const store = tx.store;
    let totalSize = 0;

    let targetNodes: StorableFileNode[];
    if (directoryPath) {
        // Get immediate children and all descendants for the specific directoryPath
        const children = await getFilesForDirectory(directoryPath);
        const descendants = await getDescendants(directoryPath);
        targetNodes = [...children, ...descendants];
        
        // Ensure uniqueness, as a node might be returned by both getFilesForDirectory and getDescendants if the latter includes immediate children.
        const uniquePaths = new Set<string>();
        targetNodes = targetNodes.filter(node => {
            if (uniquePaths.has(node.path)) return false;
            uniquePaths.add(node.path);
            return true;
        });
    } else {
        // Calculate total size of all files across the entire database
        targetNodes = await db.getAll(FILE_STORE_NAME);
    }

    // Sum the 'size' property only for file nodes (i.e., not directories)
    for (const node of targetNodes) {
        if (!node.isDirectory && typeof node.size === 'number') {
            totalSize += node.size;
        }
    }
    await tx.done;
    return totalSize;
}