// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import type { FileNode, OrganizationSuggestion, StorableFileNode } from '../types';
import * as db from './database';

/**
 * Helper function to recursively copy directory contents or a single file.
 * This handles the low-level file system API operations for duplicating entries.
 * @param entry The FileSystemHandle (file or directory) to copy.
 * @param destDirHandle The destination directory handle where the entry will be copied.
 * @param newName Optional: a new name for the copied entry. If not provided, uses entry.name.
 * @returns The handle of the newly created entry.
 * @throws Error if the entry kind is unsupported or file system operations fail.
 */
async function copyEntry(
    entry: FileSystemHandle,
    destDirHandle: FileSystemDirectoryHandle,
    newName?: string
): Promise<FileSystemFileHandle | FileSystemDirectoryHandle> {
    const targetName = newName || entry.name;

    if (entry.kind === 'file') {
        const file = await (entry as FileSystemFileHandle).getFile();
        const newFileHandle = await destDirHandle.getFileHandle(targetName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        return newFileHandle;
    } else if (entry.kind === 'directory') {
        const newDirHandle = await destDirHandle.getDirectoryHandle(targetName, { create: true });
        for await (const subEntry of (entry as FileSystemDirectoryHandle).values()) {
            await copyEntry(subEntry, newDirHandle); // Recursively copy children
        }
        return newDirHandle;
    }
    throw new Error(`Unsupported entry kind for copy: ${entry.kind}`);
}

/**
 * Prompts the user to select a directory and, if successful, clears existing
 * IndexedDB entries and returns the directory handle.
 * @returns The selected FileSystemDirectoryHandle or null if cancelled/error.
 */
export async function openDirectoryAndIngest(): Promise<FileSystemDirectoryHandle | null> {
    try {
        const handle = await window.showDirectoryPicker();
        // FIX: Clear IndexedDB on new directory open only if successfully granted.
        // Assuming db.clearAllFiles is designed to clear relevant data for the current session.
        await db.clearAllFiles(); 
        return handle;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            console.log('User cancelled the directory picker.');
        } else {
            console.error('Error opening directory:', error);
        }
        return null;
    }
}

/**
 * Recursively ingests a directory's contents and metadata into IndexedDB.
 * This function also establishes the path context for children.
 * @param directoryHandle The FileSystemDirectoryHandle to ingest.
 * @param parentFullPath The full path string of the parent directory. Null if `directoryHandle` is the root.
 * @throws Error if read-write permission is denied.
 */
export async function ingestDirectory(directoryHandle: FileSystemDirectoryHandle, parentFullPath: string | null = null) {
    // FIX: Request 'readwrite' permission explicitly for root to cover all operations.
    const permissionStatus = await directoryHandle.requestPermission({ mode: 'readwrite' });
    if (permissionStatus !== 'granted') {
      throw new Error(`Read-write permission denied for directory: ${directoryHandle.name}.`);
    }

    // Determine the full path for the current directoryHandle itself.
    const currentDirectoryFullPath = parentFullPath ? `${parentFullPath}/${directoryHandle.name}` : directoryHandle.name;

    // Add the current directory to IndexedDB
    const dirNode: StorableFileNode = {
        id: directoryHandle.name, // Using name as ID for simplicity, full path could be more unique
        name: directoryHandle.name,
        isDirectory: true,
        path: currentDirectoryFullPath,
        parentId: parentFullPath, // This is the full path of its parent
        size: 0, // Directories usually have 0 size in this context
        modified: Date.now(), // Use current timestamp for directory creation/ingestion time
    };
    await db.addFile(dirNode);

    // Iterate over its children
    for await (const entry of directoryHandle.values()) {
        const entryFullPath = `${currentDirectoryFullPath}/${entry.name}`;
        if (entry.kind === 'file') {
            const file = await (entry as FileSystemFileHandle).getFile();
            const fileNode: StorableFileNode = {
                id: entry.name,
                name: entry.name,
                isDirectory: false,
                path: entryFullPath,
                parentId: currentDirectoryFullPath, // This is the full path of its parent directory
                size: file.size,
                modified: file.lastModified,
            };
            await db.addFile(fileNode);
        } else if (entry.kind === 'directory') {
            // Recursively ingest subdirectories. The current directory's full path becomes the parent path for its children.
            await ingestDirectory(entry as FileSystemDirectoryHandle, currentDirectoryFullPath);
        }
    }
}

/**
 * Creates a new directory within a given parent directory handle.
 * NOTE: For full IndexedDB consistency, consider using `FileSystemManager.createDirectory`.
 * @param parentHandle The FileSystemDirectoryHandle of the parent.
 * @param name The name of the new directory.
 */
export async function createDirectory(parentHandle: FileSystemDirectoryHandle, name: string) {
    await parentHandle.getDirectoryHandle(name, { create: true });
    console.warn("createDirectory function is intended for internal FS operations. For DB consistency, use FileSystemManager.createDirectory.");
}

/**
 * Renames a file or directory on the file system and updates its metadata in IndexedDB.
 * This function handles recursive updates for directories by re-ingesting the subtree.
 * @param parentHandle The handle of the parent directory of the item being renamed.
 * @param target The FileNode representing the item to be renamed.
 * @param newName The new name for the item.
 * @throws Error if file system operations or DB updates fail.
 */
export async function renameItem(parentHandle: FileSystemDirectoryHandle, target: FileNode, newName: string) {
    const oldFullPath = target.path;
    const newParentFullPath = target.parentId; // The parent's full path remains the same
    const newFullPath = `${newParentFullPath}/${newName}`.replace(/\/\/+/g, '/'); // Normalize path

    try {
        if (target.isDirectory) {
            const oldDirHandle = await parentHandle.getDirectoryHandle(target.name);
            // Create new directory, copy contents, then remove old one.
            const newDirHandle = await copyEntry(oldDirHandle, parentHandle, newName) as FileSystemDirectoryHandle;
            await parentHandle.removeEntry(target.name, { recursive: true });

            // Update IndexedDB: Delete old entries and re-ingest the new subtree
            await db.deleteDescendantsAndSelf(oldFullPath);
            await ingestDirectory(newDirHandle, newParentFullPath); // Re-ingest into DB
        } else { // It's a file
            const oldFileHandle = await parentHandle.getFileHandle(target.name);
            const file = await oldFileHandle.getFile();
            
            // Create new file, write content, then remove old one.
            const newFileHandle = await copyEntry(oldFileHandle, parentHandle, newName) as FileSystemFileHandle;
            await parentHandle.removeEntry(target.name);

            // Update IndexedDB: Delete old file node and add new one
            await db.deleteFileNode(oldFullPath);
            const fileNode: StorableFileNode = {
                id: newName, // Assuming name is the id for simplicity
                name: newName,
                isDirectory: false,
                path: newFullPath,
                parentId: newParentFullPath,
                size: file.size,
                modified: file.lastModified,
            };
            await db.addFile(fileNode);
        }
    } catch (error) {
        console.error(`Failed to rename item from ${target.path} to ${newName}:`, error);
        throw error; // Re-throw to allow caller to handle
    }
}

/**
 * Deletes an array of files or directories from the file system and IndexedDB.
 * @param directoryHandle The parent directory handle containing the items to delete.
 * @param filesToDelete An array of FileNode objects to be deleted.
 */
export async function deleteFiles(directoryHandle: FileSystemDirectoryHandle, filesToDelete: FileNode[]) {
    for (const file of filesToDelete) {
        try {
            await directoryHandle.removeEntry(file.name, { recursive: file.isDirectory });
            if (file.isDirectory) {
                await db.deleteDescendantsAndSelf(file.path);
            } else {
                await db.deleteFileNode(file.path);
            }
        } catch (error) {
            console.error(`Failed to delete file system entry ${file.path}:`, error);
        }
    }
}

/**
 * Applies organizational suggestions by moving specified files into target folders.
 * This involves file system operations (create folder, copy file, delete original)
 * and corresponding IndexedDB updates.
 * @param directoryHandle The root directory handle where operations will occur.
 * @param suggestions An array of OrganizationSuggestion objects.
 */
export async function applyOrganization(directoryHandle: FileSystemDirectoryHandle, suggestions: OrganizationSuggestion[]) {
    // Determine the root path for DB updates. This assumes `directoryHandle` is the root of our ingested system.
    const rootPathForDB = directoryHandle.name;

    for (const suggestion of suggestions) {
        let newFolderHandle: FileSystemDirectoryHandle | undefined;
        let newFolderPath: string | undefined;

        try {
            newFolderHandle = await directoryHandle.getDirectoryHandle(suggestion.folderName, { create: true });
            newFolderPath = `${rootPathForDB}/${suggestion.folderName}`.replace(/\/\/+/g, '/');

            // Add new folder to DB if it's genuinely new
            const existingFolderNode = await db.getFileNodeByPath(newFolderPath);
            if (!existingFolderNode) {
                 const folderNode: StorableFileNode = {
                    id: suggestion.folderName,
                    name: suggestion.folderName,
                    isDirectory: true,
                    path: newFolderPath,
                    parentId: rootPathForDB,
                    size: 0,
                    modified: Date.now(),
                 };
                 await db.addFile(folderNode);
            }

        } catch (error) {
            console.error(`Failed to create folder ${suggestion.folderName}:`, error);
            continue; // Skip this suggestion if folder creation fails
        }

        for (const fileName of suggestion.fileNames) {
            try {
                if (!newFolderHandle) {
                    throw new Error("New folder handle is undefined, cannot move file.");
                }

                const fileHandle = await directoryHandle.getFileHandle(fileName);
                const oldFilePath = `${rootPathForDB}/${fileName}`.replace(/\/\/+/g, '/');
                const newFilePath = `${newFolderPath}/${fileName}`.replace(/\/\/+/g, '/');
                
                // Copy to new location
                await copyEntry(fileHandle, newFolderHandle);
    
                // Delete from old location
                await directoryHandle.removeEntry(fileName);

                // Update IndexedDB entry: Delete old and add new
                await db.deleteFileNode(oldFilePath);
                const file = await fileHandle.getFile(); // Get file for metadata
                const newFileNode: StorableFileNode = {
                    id: fileName,
                    name: fileName,
                    isDirectory: false,
                    path: newFilePath,
                    parentId: newFolderPath,
                    size: file.size,
                    modified: file.lastModified,
                };
                await db.addFile(newFileNode);

            } catch (e) {
                console.error(`Failed to move file ${fileName} to ${suggestion.folderName}:`, e);
                // Attempt to clean up partially created file in the new folder if something went wrong during write/close.
                if (newFolderHandle) {
                    try {
                        await newFolderHandle.removeEntry(fileName);
                        console.warn(`Cleaned up partially moved file: ${fileName} in ${suggestion.folderName}`);
                    } catch (cleanupError) {
                        console.error(`Failed to clean up partially moved file ${fileName}:`, cleanupError);
                    }
                }
            }
        }
    }
}

/**
 * Reads the entire text content of a given file handle.
 * @param handle The FileSystemFileHandle of the file to read.
 * @returns A promise resolving to the file's content as a string.
 */
export async function readFileContent(handle: FileSystemFileHandle): Promise<string> {
    const file = await handle.getFile();
    return file.text();
}

/**
 * Saves content to a given file handle, overwriting existing content.
 * @param handle The FileSystemFileHandle of the file to write to.
 * @param content The string content to write.
 * @returns A promise that resolves when the content has been written.
 */
export async function saveFileContent(handle: FileSystemFileHandle, content: string): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    // In a full system, you'd also want to update the IndexedDB entry's size and modified time here.
    // For simplicity, this is often handled by a higher-level 'save file' action in a manager.
    console.warn("saveFileContent: Remember to update corresponding IndexedDB metadata if called standalone.");
}


/**
 * @class FileSystemManager
 * @description Provides a comprehensive, object-oriented interface for managing a user-selected
 *              root directory using the File System Access API and maintaining consistency with
 *              an IndexedDB for file metadata. Designed for robustness and ease of use, acting
 *              as a central point for all file system operations.
 */
export class FileSystemManager {
    private rootHandle: FileSystemDirectoryHandle;
    private rootPathName: string; // The name of the root directory, used as the base path segment.

    /**
     * Initializes the FileSystemManager with a root directory handle.
     * @param rootHandle The FileSystemDirectoryHandle representing the base of all operations.
     * @throws Error if an invalid handle is provided.
     */
    constructor(rootHandle: FileSystemDirectoryHandle) {
        if (!rootHandle || rootHandle.kind !== 'directory') {
            throw new Error("Invalid root handle provided. Must be a FileSystemDirectoryHandle.");
        }
        this.rootHandle = rootHandle;
        this.rootPathName = rootHandle.name;
    }

    /**
     * Ensures the root directory handle has the necessary permissions.
     * @param mode 'read' for read-only, 'readwrite' for read and write access.
     * @returns True if permissions are granted or already exist, false otherwise.
     */
    public async ensureRootPermissions(mode: 'read' | 'readwrite' = 'readwrite'): Promise<boolean> {
        try {
            const permissionStatus = await this.rootHandle.queryPermission({ mode });
            if (permissionStatus === 'granted') {
                return true;
            }
            const requestStatus = await this.rootHandle.requestPermission({ mode });
            return requestStatus === 'granted';
        } catch (error) {
            console.error(`Failed to ensure root permissions for ${this.rootPathName}:`, error);
            return false;
        }
    }

    /**
     * Constructs the full absolute path string from a relative path, based on the root handle.
     * @param relativePath The path relative to the root (e.g., 'folder/file.txt').
     * @returns The full path (e.g., 'MyRoot/folder/file.txt').
     */
    private _getFullPath(relativePath: string): string {
        if (!relativePath || relativePath === '/' || relativePath === this.rootPathName || relativePath === '.') {
            return this.rootPathName;
        }
        return `${this.rootPathName}/${relativePath}`.replace(/\/\/+/g, '/'); // Normalize slashes
    }

    /**
     * Resolves a relative path to a FileSystemHandle within the root directory.
     * @param relativePath The path relative to the rootHandle (e.g., 'folder/subfolder/file.txt').
     * @param kind The expected kind of handle ('file', 'directory', or 'any').
     * @returns The resolved FileSystemHandle or null if not found.
     */
    private async _getHandleFromRelativePath(
        relativePath: string,
        kind: 'file' | 'directory' | 'any' = 'any'
    ): Promise<FileSystemFileHandle | FileSystemDirectoryHandle | null> {
        // Handle root path specially
        if (!relativePath || relativePath === '.' || relativePath === '/') {
            return kind === 'directory' || kind === 'any' ? this.rootHandle : null;
        }

        const pathSegments = relativePath.split('/').filter(segment => segment !== '' && segment !== '.');
        let currentHandle: FileSystemDirectoryHandle = this.rootHandle;

        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            try {
                if (i === pathSegments.length - 1) { // Last segment
                    if (kind === 'file' || kind === 'any') {
                        try {
                            return await currentHandle.getFileHandle(segment);
                        } catch (e) {
                            if (kind === 'file') return null; // Only looking for file
                        }
                    }
                    if (kind === 'directory' || kind === 'any') {
                        try {
                            return await currentHandle.getDirectoryHandle(segment);
                        } catch (e) {
                            if (kind === 'directory') return null; // Only looking for directory
                        }
                    }
                    return null; // Not found as the specified kind
                } else { // Intermediate directory
                    currentHandle = await currentHandle.getDirectoryHandle(segment);
                }
            } catch (e) {
                console.warn(`Path segment "${segment}" not found or accessible within "${relativePath}":`, e);
                return null;
            }
        }
        return currentHandle; // Should not be reached for non-empty relativePath unless it was just '.'
    }

    /**
     * Retrieves a FileSystemFileHandle for a given relative path.
     * @param relativePath The path to the file relative to the root.
     * @returns The FileSystemFileHandle or null if not found.
     */
    public async getFileHandle(relativePath: string): Promise<FileSystemFileHandle | null> {
        return this._getHandleFromRelativePath(relativePath, 'file') as Promise<FileSystemFileHandle | null>;
    }

    /**
     * Retrieves a FileSystemDirectoryHandle for a given relative path.
     * @param relativePath The path to the directory relative to the root.
     * @returns The FileSystemDirectoryHandle or null if not found.
     */
    public async getDirectoryHandle(relativePath: string): Promise<FileSystemDirectoryHandle | null> {
        return this._getHandleFromRelativePath(relativePath, 'directory') as Promise<FileSystemDirectoryHandle | null>;
    }

    /**
     * Creates a new file at the specified relative path.
     * @param relativePath The full relative path to the new file (e.g., 'folder/new_file.txt').
     * @param content Optional initial content for the file.
     * @returns The handle of the new file, or null if creation failed.
     */
    public async createFile(relativePath: string, content: string = ''): Promise<FileSystemFileHandle | null> {
        const fullPath = this._getFullPath(relativePath);
        const pathParts = relativePath.split('/');
        const fileName = pathParts.pop();
        if (!fileName) {
            console.error("Invalid file name in relative path for creation.");
            return null;
        }

        const parentDirPath = pathParts.join('/');
        const parentHandle = await this._getHandleFromRelativePath(parentDirPath, 'directory') as FileSystemDirectoryHandle;

        if (!parentHandle) {
            console.error(`Parent directory for ${relativePath} not found. Cannot create file.`);
            return null;
        }

        try {
            const fileHandle = await parentHandle.getFileHandle(fileName, { create: true });
            await saveFileContent(fileHandle, content); // Reuse global utility

            // Add/Update IndexedDB
            const file = await fileHandle.getFile();
            const parentFullPath = this._getFullPath(parentDirPath);
            const fileNode: StorableFileNode = {
                id: fileName,
                name: fileName,
                isDirectory: false,
                path: fullPath,
                parentId: parentFullPath,
                size: file.size,
                modified: file.lastModified,
            };
            await db.addFile(fileNode); // addFile will overwrite if ID/path exists.
            return fileHandle;
        } catch (error) {
            console.error(`Failed to create file ${relativePath}:`, error);
            return null;
        }
    }

    /**
     * Creates a new directory at the specified relative path.
     * @param relativePath The full relative path to the new directory (e.g., 'folder/new_subfolder').
     * @returns The handle of the new directory, or null if creation failed.
     */
    public async createDirectory(relativePath: string): Promise<FileSystemDirectoryHandle | null> {
        const fullPath = this._getFullPath(relativePath);
        const pathParts = relativePath.split('/');
        const dirName = pathParts.pop();
        if (!dirName) {
            console.error("Invalid directory name in relative path for creation.");
            return null;
        }

        const parentDirPath = pathParts.join('/');
        const parentHandle = await this._getHandleFromRelativePath(parentDirPath, 'directory') as FileSystemDirectoryHandle;

        if (!parentHandle) {
            console.error(`Parent directory for ${relativePath} not found. Cannot create directory.`);
            return null;
        }

        try {
            const dirHandle = await parentHandle.getDirectoryHandle(dirName, { create: true });
            
            // Add/Update IndexedDB
            const parentFullPath = this._getFullPath(parentDirPath);
            const dirNode: StorableFileNode = {
                id: dirName,
                name: dirName,
                isDirectory: true,
                path: fullPath,
                parentId: parentFullPath,
                size: 0,
                modified: Date.now(),
            };
            await db.addFile(dirNode);
            return dirHandle;
        } catch (error) {
            console.error(`Failed to create directory ${relativePath}:`, error);
            return null;
        }
    }

    /**
     * Deletes a file or directory at the specified relative path.
     * @param relativePath The path to the item to delete.
     * @returns True if deletion was successful, false otherwise.
     */
    public async deleteItem(relativePath: string): Promise<boolean> {
        const fullPath = this._getFullPath(relativePath);
        const itemNode = await db.getFileNodeByPath(fullPath);

        if (!itemNode) {
            console.warn(`Item not found in DB for deletion: ${relativePath}`);
            return false;
        }

        const pathParts = relativePath.split('/');
        const itemName = pathParts.pop();
        if (!itemName) {
            console.error(`Cannot delete root directory or invalid path: ${relativePath}`);
            return false;
        }
        const parentDirPath = pathParts.join('/');
        const parentHandle = await this._getHandleFromRelativePath(parentDirPath, 'directory') as FileSystemDirectoryHandle;

        if (!parentHandle) {
            console.error(`Parent directory for ${relativePath} not found for deletion.`);
            return false;
        }

        try {
            await parentHandle.removeEntry(itemName, { recursive: itemNode.isDirectory });
            // Update IndexedDB
            if (itemNode.isDirectory) {
                await db.deleteDescendantsAndSelf(fullPath);
            } else {
                await db.deleteFileNode(fullPath);
            }
            return true;
        } catch (error) {
            console.error(`Failed to delete ${relativePath}:`, error);
            return false;
        }
    }

    /**
     * Renames a file or directory using the global `renameItem` function.
     * @param oldRelativePath The current relative path of the item.
     * @param newName The new name for the item (not a full path, just the name).
     * @returns True if renamed successfully, false otherwise.
     */
    public async renameItem(oldRelativePath: string, newName: string): Promise<boolean> {
        const oldFullPath = this._getFullPath(oldRelativePath);
        const targetFileNode = await db.getFileNodeByPath(oldFullPath);
        
        if (!targetFileNode) {
            console.error(`Item not found in DB for renaming: ${oldRelativePath}`);
            return false;
        }

        const pathParts = oldRelativePath.split('/');
        pathParts.pop(); // Remove old name
        const parentDirPath = pathParts.join('/');
        const parentHandle = await this._getHandleFromRelativePath(parentDirPath, 'directory') as FileSystemDirectoryHandle;

        if (!parentHandle) {
            console.error(`Parent directory for ${oldRelativePath} not found for renaming.`);
            return false;
        }

        try {
            await renameItem(parentHandle, targetFileNode, newName); // Use the global exported function
            return true;
        } catch (error) {
            console.error(`Failed to rename ${oldRelativePath} to ${newName}:`, error);
            return false;
        }
    }

    /**
     * Moves a file or directory from a source path to a destination directory.
     * This involves copying to the new location, deleting the original, and updating IndexedDB.
     * @param sourceRelativePath The current relative path of the item to move.
     * @param destinationRelativeDirectoryPath The relative path of the *new parent directory*.
     * @returns True if moved successfully, false otherwise.
     */
    public async moveItem(sourceRelativePath: string, destinationRelativeDirectoryPath: string): Promise<boolean> {
        const sourceFullPath = this._getFullPath(sourceRelativePath);
        const sourceItemNode = await db.getFileNodeByPath(sourceFullPath);

        if (!sourceItemNode) {
            console.error(`Source item not found in DB for moving: ${sourceRelativePath}`);
            return false;
        }

        const sourcePathParts = sourceRelativePath.split('/');
        const itemName = sourcePathParts.pop()!; // Item's name (file or dir)
        const sourceParentDirPath = sourcePathParts.join('/');

        const sourceParentHandle = await this._getHandleFromRelativePath(sourceParentDirPath, 'directory') as FileSystemDirectoryHandle;
        const destinationParentHandle = await this._getHandleFromRelativePath(destinationRelativeDirectoryPath, 'directory') as FileSystemDirectoryHandle;

        if (!sourceParentHandle || !destinationParentHandle) {
            console.error(`Source parent or destination parent directory not found for moving ${sourceRelativePath}.`);
            return false;
        }

        try {
            let sourceHandle: FileSystemFileHandle | FileSystemDirectoryHandle;
            if (sourceItemNode.isDirectory) {
                sourceHandle = await sourceParentHandle.getDirectoryHandle(itemName);
            } else {
                sourceHandle = await sourceParentHandle.getFileHandle(itemName);
            }

            // Copy to new location (uses original name if not specified)
            const newEntryHandle = await copyEntry(sourceHandle, destinationParentHandle);

            // Delete from old location
            await sourceParentHandle.removeEntry(itemName, { recursive: sourceItemNode.isDirectory });

            // Update IndexedDB: Delete old entries and re-ingest the new subtree/file
            await db.deleteDescendantsAndSelf(sourceFullPath); // Covers files and their descendants
            
            const newParentFullPath = this._getFullPath(destinationRelativeDirectoryPath);
            if (sourceItemNode.isDirectory) {
                await ingestDirectory(newEntryHandle as FileSystemDirectoryHandle, newParentFullPath);
            } else {
                const newFullPath = this._getFullPath(`${destinationRelativeDirectoryPath}/${itemName}`);
                const file = await (newEntryHandle as FileSystemFileHandle).getFile();
                const fileNode: StorableFileNode = {
                    id: itemName,
                    name: itemName,
                    isDirectory: false,
                    path: newFullPath,
                    parentId: newParentFullPath,
                    size: file.size,
                    modified: file.lastModified,
                };
                await db.addFile(fileNode);
            }
            return true;
        } catch (error) {
            console.error(`Failed to move ${sourceRelativePath} to ${destinationRelativeDirectoryPath}:`, error);
            return false;
        }
    }

    /**
     * Duplicates a file or directory. The duplicated item will appear in the specified
     * destination path, potentially with a new name.
     * @param sourceRelativePath The relative path of the item to duplicate.
     * @param destinationRelativePath The relative path for the *new* duplicated item (including its new name).
     *                                 e.g., 'folder/original.txt' to 'folder/copy_of_original.txt'
     * @returns True if duplicated successfully, false otherwise.
     */
    public async duplicateItem(sourceRelativePath: string, destinationRelativePath: string): Promise<boolean> {
        const sourceFullPath = this._getFullPath(sourceRelativePath);
        const sourceItemNode = await db.getFileNodeByPath(sourceFullPath);

        if (!sourceItemNode) {
            console.error(`Source item not found in DB for duplication: ${sourceRelativePath}`);
            return false;
        }

        const sourceHandle = await this._getHandleFromRelativePath(sourceRelativePath, sourceItemNode.isDirectory ? 'directory' : 'file');
        if (!sourceHandle) {
            console.error(`File system handle not found for source item: ${sourceRelativePath}`);
            return false;
        }

        const destPathParts = destinationRelativePath.split('/');
        const destItemName = destPathParts.pop(); // The new name of the duplicated item
        if (!destItemName) {
            console.error(`Invalid destination path for duplication: ${destinationRelativePath}`);
            return false;
        }
        const destParentDirPath = destPathParts.join('/');
        const destParentHandle = await this._getHandleFromRelativePath(destParentDirPath, 'directory') as FileSystemDirectoryHandle;

        if (!destParentHandle) {
            console.error(`Destination parent directory not found for duplicating to ${destinationRelativePath}.`);
            return false;
        }

        try {
            const newEntryHandle = await copyEntry(sourceHandle, destParentHandle, destItemName);

            // Re-ingest the new subtree/file into IndexedDB
            const newParentFullPath = this._getFullPath(destParentDirPath);
            if (sourceItemNode.isDirectory) {
                await ingestDirectory(newEntryHandle as FileSystemDirectoryHandle, newParentFullPath);
            } else {
                const newFullPath = this._getFullPath(destinationRelativePath);
                const file = await (newEntryHandle as FileSystemFileHandle).getFile();
                const fileNode: StorableFileNode = {
                    id: destItemName,
                    name: destItemName,
                    isDirectory: false,
                    path: newFullPath,
                    parentId: newParentFullPath,
                    size: file.size,
                    modified: file.lastModified,
                };
                await db.addFile(fileNode);
            }
            return true;
        } catch (error) {
            console.error(`Failed to duplicate ${sourceRelativePath} to ${destinationRelativePath}:`, error);
            return false;
        }
    }

    /**
     * Reads the content of a text file.
     * @param relativePath The path to the file relative to the root.
     * @returns The content as a string, or null if reading failed.
     */
    public async readFile(relativePath: string): Promise<string | null> {
        try {
            const fileHandle = await this.getFileHandle(relativePath);
            if (!fileHandle) {
                console.error(`File not found or not a file: ${relativePath}`);
                return null;
            }
            return readFileContent(fileHandle); // Reuse existing utility
        } catch (error) {
            console.error(`Failed to read file ${relativePath}:`, error);
            return null;
        }
    }

    /**
     * Writes content to a text file. If the file doesn't exist, it will be created.
     * If it exists, its content will be overwritten, and IndexedDB metadata updated.
     * @param relativePath The path to the file relative to the root.
     * @param content The content to write.
     * @returns True if writing was successful, false otherwise.
     */
    public async writeFile(relativePath: string, content: string): Promise<boolean> {
        try {
            // This implicitly creates the file if it doesn't exist, or gets the existing handle.
            const pathParts = relativePath.split('/');
            const fileName = pathParts.pop();
            if (!fileName) {
                console.error("Invalid file name in relative path for writing.");
                return false;
            }

            const parentDirPath = pathParts.join('/');
            const parentHandle = await this._getHandleFromRelativePath(parentDirPath, 'directory') as FileSystemDirectoryHandle;
            if (!parentHandle) {
                console.error(`Parent directory for ${relativePath} not found.`);
                return false;
            }

            const fileHandle = await parentHandle.getFileHandle(fileName, { create: true });
            await saveFileContent(fileHandle, content); // Reuse global utility

            // Update IndexedDB metadata (size, modified time)
            const file = await fileHandle.getFile();
            const fullPath = this._getFullPath(relativePath);
            const parentFullPath = this._getFullPath(parentDirPath);

            // Check if file exists in DB, if so, update. If not, add (for brand new files).
            const existingNode = await db.getFileNodeByPath(fullPath);
            if (existingNode) {
                await db.updateFileMetadata(fullPath, { size: file.size, modified: file.lastModified });
            } else {
                 const fileNode: StorableFileNode = {
                    id: fileName,
                    name: fileName,
                    isDirectory: false,
                    path: fullPath,
                    parentId: parentFullPath,
                    size: file.size,
                    modified: file.lastModified,
                };
                await db.addFile(fileNode);
            }
            return true;
        } catch (error) {
            console.error(`Failed to write file ${relativePath}:`, error);
            return false;
        }
    }


    /**
     * Retrieves metadata for a file or directory from IndexedDB.
     * @param relativePath The path to the item relative to the root.
     * @returns The StorableFileNode metadata, or null if not found.
     */
    public async getMetadata(relativePath: string): Promise<StorableFileNode | null> {
        const fullPath = this._getFullPath(relativePath);
        return db.getFileNodeByPath(fullPath);
    }

    /**
     * Lists the direct children (files and directories) of a given relative directory path.
     * @param relativePath The path to the directory whose contents are to be listed. Defaults to root.
     * @returns An array of StorableFileNode for the children, or an empty array if not found or empty.
     */
    public async listContents(relativePath: string = ''): Promise<StorableFileNode[]> {
        const fullPath = this._getFullPath(relativePath);
        return db.getFilesForDirectory(fullPath);
    }

    /**
     * Searches for files and directories by name (case-insensitive).
     * @param query The search string.
     * @returns An array of StorableFileNode matching the query.
     */
    public async searchByName(query: string): Promise<StorableFileNode[]> {
        return db.searchFilesByName(query);
    }

    /**
     * Exports the entire ingested directory structure as a single ZIP file.
     * NOTE: This is a conceptual implementation as external ZIP libraries cannot be imported per instructions.
     * In a real product, a library like JSZip would be used. This implementation provides a placeholder Blob.
     * @returns A Promise resolving to a Blob representing the ZIP file, or null if an error occurs.
     */
    public async exportDirectoryAsZip(): Promise<Blob | null> {
        console.warn("exportDirectoryAsZip: Requires a client-side ZIP library (e.g., JSZip) which is not imported. Returning a conceptual placeholder Blob.");
        try {
            const allFiles = await db.getAllFiles(); // Assuming db.getAllFiles() exists and fetches all FileNodes.
            if (allFiles.length === 0) {
                console.log("No files to export in the current managed directory.");
                return null;
            }

            const zipContentLines: string[] = [`--- Simulated ZIP Content for Root: ${this.rootPathName} ---`];
            for (const fileNode of allFiles) {
                // Ensure we only process files directly under this manager's root or its descendants
                if (fileNode.path.startsWith(this.rootPathName)) {
                    const relativePath = fileNode.path.substring(this.rootPathName.length + 1); // Path relative to this manager's root
                    if (fileNode.isDirectory) {
                        zipContentLines.push(`  [DIR] ${relativePath}`);
                    } else {
                        // Attempt to read file content for a snippet (expensive, usually only metadata would be included)
                        try {
                            const fileHandle = await this.getFileHandle(relativePath);
                            const contentSnippet = fileHandle ? (await readFileContent(fileHandle)).substring(0, 100) + '...' : '[Content not read]';
                            zipContentLines.push(`  [FILE] ${relativePath} (Size: ${fileNode.size}, Modified: ${new Date(fileNode.modified).toLocaleDateString()}) - Content: "${contentSnippet}"`);
                        } catch (readError) {
                            zipContentLines.push(`  [FILE] ${relativePath} (Read Error: ${readError instanceof Error ? readError.message : String(readError)})`);
                        }
                    }
                }
            }
            zipContentLines.push(`--- End Simulated ZIP Content ---`);
            return new Blob([zipContentLines.join('\n')], { type: 'application/zip' });

        } catch (error) {
            console.error('Error during simulated ZIP export:', error);
            return null;
        }
    }

    /**
     * Triggers a full re-ingestion of the root directory. This is useful for reflecting
     * external changes made to the file system that are not captured by the API.
     * WARNING: This will clear relevant IndexedDB entries and re-populate them,
     * which can be disruptive for current sessions.
     * @returns A Promise that resolves when re-ingestion is complete.
     */
    public async reIngestRootDirectory(): Promise<void> {
        console.log(`Re-ingesting root directory: ${this.rootPathName}...`);
        // In a multi-root scenario, db.clearAllFiles() would be too broad.
        // Assuming current system manages a single root, or `db` internally handles scopes.
        // Given previous `openDirectoryAndIngest` calls `db.clearAllFiles`, I'll follow that pattern.
        await db.clearAllFiles(); 
        await ingestDirectory(this.rootHandle, null); // Reuse the global ingest function
        console.log(`Re-ingestion of ${this.rootPathName} complete.`);
    }

    /**
     * Gets file metadata (size, last modified) directly from the file system handle.
     * This bypasses IndexedDB and fetches live data.
     * @param relativePath The relative path to the file.
     * @returns An object with size and lastModified, or null if an error occurs or item is not a file.
     */
    public async getLiveFileMetadata(relativePath: string): Promise<{ size: number, lastModified: number } | null> {
        try {
            const fileHandle = await this.getFileHandle(relativePath);
            if (!fileHandle) {
                console.warn(`File not found for live metadata check: ${relativePath}`);
                return null;
            }
            const file = await fileHandle.getFile();
            return {
                size: file.size,
                lastModified: file.lastModified,
            };
        } catch (error) {
            console.error(`Failed to get live metadata for ${relativePath}:`, error);
            return null;
        }
    }
}

/**
 * Utility function to retrieve a FileNode (metadata from IndexedDB) given its full path.
 * @param fullPath The absolute path of the file/directory.
 * @returns The FileNode object or null if not found.
 */
export async function getFileNodeFromFullPath(fullPath: string): Promise<FileNode | null> {
    return db.getFileNodeByPath(fullPath);
}

/**
 * Utility function to get the parent directory's FileSystemDirectoryHandle from an item's full path.
 * This function is useful for operations that require the parent handle (e.g., renaming a child).
 * @param rootHandle The top-level FileSystemDirectoryHandle.
 * @param itemFullPath The full path of the item whose parent handle is desired.
 * @returns The FileSystemDirectoryHandle of the parent, or null if not found or item is the root.
 */
export async function getParentDirectoryHandleFromPath(
    rootHandle: FileSystemDirectoryHandle,
    itemFullPath: string
): Promise<FileSystemDirectoryHandle | null> {
    if (itemFullPath === rootHandle.name) {
        return null; // The item is the root, it has no parent handle within the managed scope.
    }

    const pathParts = itemFullPath.split('/');
    pathParts.pop(); // Remove the item's name itself to get the parent's path parts.
    const parentFullPath = pathParts.join('/');

    if (!parentFullPath || parentFullPath === rootHandle.name) {
        return rootHandle; // Parent is the root
    }

    // Reconstruct the relative path to the parent from the rootHandle.
    const relativeParentPath = parentFullPath.substring(rootHandle.name.length + 1);
    const relativePathSegments = relativeParentPath.split('/').filter(Boolean); // Filter empty segments

    let currentHandle: FileSystemDirectoryHandle = rootHandle;
    for (const segment of relativePathSegments) {
        try {
            currentHandle = await currentHandle.getDirectoryHandle(segment);
        } catch (e) {
            console.error(`Failed to navigate to parent path segment: ${segment} for ${itemFullPath}`, e);
            return null;
        }
    }
    return currentHandle;
}