// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// @ts-ignore
import { Octokit } from "https://esm.sh/octokit@4.0.2";
import type { Repo, FileNode, User } from '../types.ts';
import { logEvent, logError, measurePerformance } from './telemetryService';

let octokit: Octokit | null = null;

export const initializeOctokit = (token: string) => {
  if (token) {
    octokit = new Octokit({ auth: token });
  } else {
    octokit = null;
  }
};

export const getOctokit = (): Octokit => {
    if (!octokit) {
        throw new Error("Octokit has not been initialized. Please connect to GitHub first.");
    }
    return octokit;
};

export const validateToken = async (token: string): Promise<User> => {
    const tempOctokit = new Octokit({ auth: token });
    const { data: user } = await tempOctokit.request('GET /user');
    return user as User;
};

export const logout = async (): Promise<void> => {
    octokit = null;
    return Promise.resolve();
};

// --- User & Organization Functions ---

export const getCurrentUser = async (): Promise<User> => {
    return measurePerformance('getCurrentUser', async () => {
        logEvent('getCurrentUser_start');
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /user');
            logEvent('getCurrentUser_success', { username: data.login });
            return data as User;
        } catch (error) {
            logError(error as Error, { context: 'getCurrentUser' });
            throw new Error(`Failed to fetch current user details: ${(error as Error).message}`);
        }
    });
};

export const getUserOrganizations = async (): Promise<any[]> => {
    return measurePerformance('getUserOrganizations', async () => {
        logEvent('getUserOrganizations_start');
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /user/orgs');
            logEvent('getUserOrganizations_success', { count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'getUserOrganizations' });
            throw new Error(`Failed to fetch user organizations: ${(error as Error).message}`);
        }
    });
};


// --- Repository-Level Functions ---

export const getRepos = async (): Promise<Repo[]> => {
    return measurePerformance('getRepos', async () => {
        logEvent('getRepos_start');
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /user/repos', {
                type: 'owner',
                sort: 'updated',
                per_page: 100,
            });
            logEvent('getRepos_success', { count: data.length });
            return data as Repo[];
        } catch (error) {
            logError(error as Error, { context: 'getRepos' });
            throw new Error(`Failed to fetch repositories: ${(error as Error).message}`);
        }
    });
};

export const createRepository = async (
    name: string,
    description: string = '',
    isPrivate: boolean = false,
    autoInit: boolean = false,
    gitignoreTemplate: string = ''
): Promise<Repo> => {
    return measurePerformance('createRepository', async () => {
        logEvent('createRepository_start', { name, isPrivate, autoInit });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('POST /user/repos', {
                name,
                description,
                private: isPrivate,
                auto_init: autoInit,
                gitignore_template: gitignoreTemplate || undefined,
            });
            logEvent('createRepository_success', { repoId: data.id, repoName: data.name });
            return data as Repo;
        } catch (error) {
            logError(error as Error, { context: 'createRepository', name });
            throw new Error(`Failed to create repository "${name}": ${(error as Error).message}`);
        }
    });
};

export const getRepositoryDetails = async (owner: string, repo: string): Promise<Repo> => {
    return measurePerformance('getRepositoryDetails', async () => {
        logEvent('getRepositoryDetails_start', { owner, repo });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}', {
                owner,
                repo,
            });
            logEvent('getRepositoryDetails_success', { repoId: data.id });
            return data as Repo;
        } catch (error) {
            logError(error as Error, { context: 'getRepositoryDetails', owner, repo });
            throw new Error(`Failed to fetch repository details for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const updateRepository = async (
    owner: string,
    repo: string,
    updates: {
        name?: string;
        description?: string;
        private?: boolean;
        default_branch?: string;
        homepage?: string;
        has_issues?: boolean;
        has_projects?: boolean;
        has_wiki?: boolean;
        allow_squash_merge?: boolean;
        allow_merge_commit?: boolean;
        allow_rebase_merge?: boolean;
    }
): Promise<Repo> => {
    return measurePerformance('updateRepository', async () => {
        logEvent('updateRepository_start', { owner, repo, updates });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('PATCH /repos/{owner}/{repo}', {
                owner,
                repo,
                ...updates,
            });
            logEvent('updateRepository_success', { repoId: data.id, newName: data.name });
            return data as Repo;
        } catch (error) {
            logError(error as Error, { context: 'updateRepository', owner, repo, updates });
            throw new Error(`Failed to update repository "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const deleteRepo = async (owner: string, repo: string): Promise<void> => {
     return measurePerformance('deleteRepo', async () => {
        logEvent('deleteRepo_start', { owner, repo });
        try {
            const octokit = getOctokit();
            await octokit.request('DELETE /repos/{owner}/{repo}', {
                owner,
                repo,
            });
            logEvent('deleteRepo_success', { owner, repo });
        } catch (error) {
            logError(error as Error, { context: 'deleteRepo', owner, repo });
            throw new Error(`Failed to delete repository: ${(error as Error).message}`);
        }
    });
};

export const listRepositoryBranches = async (owner: string, repo: string): Promise<any[]> => {
    return measurePerformance('listRepositoryBranches', async () => {
        logEvent('listRepositoryBranches_start', { owner, repo });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/branches', {
                owner,
                repo,
                per_page: 100, // Fetch up to 100 branches
            });
            logEvent('listRepositoryBranches_success', { owner, repo, count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'listRepositoryBranches', owner, repo });
            throw new Error(`Failed to list branches for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const createBranch = async (owner: string, repo: string, newBranchName: string, baseBranch: string = 'main'): Promise<any> => {
    return measurePerformance('createBranch', async () => {
        logEvent('createBranch_start', { owner, repo, newBranchName, baseBranch });
        try {
            const octokit = getOctokit();
            // 1. Get the SHA of the base branch
            const { data: refData } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner,
                repo,
                ref: `heads/${baseBranch}`,
            });
            const baseBranchSha = refData.object.sha;

            // 2. Create the new reference (branch)
            const { data } = await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
                owner,
                repo,
                ref: `refs/heads/${newBranchName}`,
                sha: baseBranchSha,
            });
            logEvent('createBranch_success', { owner, repo, newBranchName });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createBranch', owner, repo, newBranchName, baseBranch });
            throw new Error(`Failed to create branch "${newBranchName}" in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const deleteBranch = async (owner: string, repo: string, branchName: string): Promise<void> => {
    return measurePerformance('deleteBranch', async () => {
        logEvent('deleteBranch_start', { owner, repo, branchName });
        try {
            const octokit = getOctokit();
            await octokit.request('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
                owner,
                repo,
                ref: `heads/${branchName}`,
            });
            logEvent('deleteBranch_success', { owner, repo, branchName });
        } catch (error) {
            logError(error as Error, { context: 'deleteBranch', owner, repo, branchName });
            throw new Error(`Failed to delete branch "${branchName}" in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};


// --- File and Tree Functions ---

export const getRepoTree = async (owner: string, repo: string): Promise<FileNode> => {
     return measurePerformance('getRepoTree', async () => {
        logEvent('getRepoTree_start', { owner, repo });
        try {
            const octokit = getOctokit();
            const { data: repoData } = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
            const defaultBranch = repoData.default_branch;
            const { data: branch } = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', { owner, repo, branch: defaultBranch });
            const treeSha = branch.commit.commit.tree.sha;
            
            const { data: treeData } = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
                owner,
                repo,
                tree_sha: treeSha,
                recursive: 'true',
            });

            const root: FileNode = { 
                id: repo,
                name: repo, 
                isDirectory: true,
                path: '', // Root of the repo is represented by empty path in this structure.
                parentId: null,
                size: 0,
                modified: Date.now(),
                children: [] 
            };
            
            treeData.tree.forEach((item: any) => {
                if (!item.path) return;
                const pathParts = item.path.split('/');
                let currentNode = root;

                pathParts.forEach((part, index) => {
                    if (!currentNode.children) {
                        currentNode.children = [];
                    }
                    let childNode = currentNode.children.find(child => child.name === part);

                    if (!childNode) {
                        const isLastPart = index === pathParts.length - 1;
                        childNode = {
                            id: item.sha, // Use SHA as a more stable ID for tree items
                            name: part,
                            path: item.path,
                            isDirectory: isLastPart ? (item.type === 'tree') : true,
                            parentId: currentNode.path || null, // If currentNode is root, parentId is null
                            size: item.size || 0,
                            modified: Date.now(), // GitHub API doesn't provide this in the tree view directly.
                            url: item.url, // Add Git URL for blob/tree
                        };
                        if(childNode.isDirectory) childNode.children = [];
                        if (!currentNode.children) {
                            currentNode.children = [];
                        }
                        currentNode.children.push(childNode);
                    }
                    currentNode = childNode;
                });
            });

            logEvent('getRepoTree_success', { owner, repo, items: treeData.tree.length });
            return root;
        } catch (error) {
            logError(error as Error, { context: 'getRepoTree', owner, repo });
            throw new Error(`Failed to fetch repository tree: ${(error as Error).message}`);
        }
    });
};

export const getDirectoryContents = async (owner: string, repo: string, path: string = '', branch: string = 'main'): Promise<FileNode[]> => {
    return measurePerformance('getDirectoryContents', async () => {
        logEvent('getDirectoryContents_start', { owner, repo, path, branch });
        try {
            const octokit = getOctokit();
            const { data: contents } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner,
                repo,
                path,
                ref: branch,
            });

            if (!Array.isArray(contents)) {
                // If it's not an array, it's likely a single file or an error
                throw new Error(`Path "${path}" in "${owner}/${repo}" is not a directory.`);
            }

            const fileNodes: FileNode[] = contents.map((item: any) => ({
                id: item.sha, // Use SHA as a more stable ID
                name: item.name,
                path: item.path,
                isDirectory: item.type === 'dir',
                parentId: path || null,
                size: item.size || 0,
                modified: Date.now(), // Placeholder, API doesn't provide it for directory listing
                url: item.url, // Git data URL
                download_url: item.download_url, // Raw download URL
            }));

            logEvent('getDirectoryContents_success', { owner, repo, path, count: fileNodes.length });
            return fileNodes;
        } catch (error) {
            logError(error as Error, { context: 'getDirectoryContents', owner, repo, path, branch });
            throw new Error(`Failed to fetch directory contents for "${path}" in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};


export const getFileContent = async (owner: string, repo: string, path: string, branch: string = 'main'): Promise<string> => {
    return measurePerformance('getFileContent', async () => {
        logEvent('getFileContent_start', { owner, repo, path, branch });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner,
                repo,
                path,
                ref: branch,
            });

            if (Array.isArray(data) || data.type !== 'file' || typeof data.content !== 'string') {
                 throw new Error("Path did not point to a valid file or content was missing.");
            }

            // The content is Base64 encoded, so we need to decode it.
            const content = atob(data.content);
            logEvent('getFileContent_success', { owner, repo, path, size: content.length });
            return content;
        } catch (error) {
             logError(error as Error, { context: 'getFileContent', owner, repo, path, branch });
             throw new Error(`Failed to fetch file content for "${path}": ${(error as Error).message}`);
        }
    });
};

export const createOrUpdateFile = async (
    owner: string,
    repo: string,
    filePath: string,
    content: string,
    message: string,
    branch: string = 'main',
    sha?: string // Optional SHA for updating existing files to ensure optimistic locking
): Promise<any> => {
    return measurePerformance('createOrUpdateFile', async () => {
        logEvent('createOrUpdateFile_start', { owner, repo, filePath, branch, isUpdate: !!sha });
        try {
            const octokit = getOctokit();

            const requestOptions: any = {
                owner,
                repo,
                path: filePath,
                message,
                content: btoa(content), // Base64 encode the content
                branch,
            };

            if (sha) {
                requestOptions.sha = sha; // Required for updating an existing file
            } else {
                // If SHA is not provided, try to fetch it to ensure we're not overwriting by mistake
                try {
                    const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                        owner,
                        repo,
                        path: filePath,
                        ref: branch,
                    });
                    if (fileData && !Array.isArray(fileData) && fileData.sha) {
                        requestOptions.sha = fileData.sha;
                    }
                } catch (getFileError) {
                    // File probably doesn't exist, proceed with creation (sha will remain undefined)
                    // Log the event but don't throw, as creation is intended.
                    logEvent('createOrUpdateFile_check_file_not_found', { filePath, error: (getFileError as Error).message });
                }
            }
            
            const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', requestOptions);

            logEvent('createOrUpdateFile_success', { owner, repo, filePath, commitSha: data.commit.sha });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createOrUpdateFile', owner, repo, filePath, branch });
            throw new Error(`Failed to create or update file "${filePath}": ${(error as Error).message}`);
        }
    });
};

export const deleteFile = async (
    owner: string,
    repo: string,
    filePath: string,
    message: string,
    branch: string = 'main',
    sha?: string // Required for deleting an existing file
): Promise<any> => {
    return measurePerformance('deleteFile', async () => {
        logEvent('deleteFile_start', { owner, repo, filePath, branch });
        try {
            const octokit = getOctokit();

            let fileSha = sha;
            if (!fileSha) {
                // If SHA is not provided, fetch it
                const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                    owner,
                    repo,
                    path: filePath,
                    ref: branch,
                });
                if (fileData && !Array.isArray(fileData) && fileData.sha) {
                    fileSha = fileData.sha;
                } else {
                    throw new Error(`Could not find SHA for file "${filePath}". File may not exist or path is incorrect.`);
                }
            }

            const { data } = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
                owner,
                repo,
                path: filePath,
                message,
                sha: fileSha,
                branch,
            });

            logEvent('deleteFile_success', { owner, repo, filePath, commitSha: data.commit.sha });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'deleteFile', owner, repo, filePath, branch });
            throw new Error(`Failed to delete file "${filePath}": ${(error as Error).message}`);
        }
    });
};


// --- Commit and Branching Functions ---

export const commitFiles = async (
    owner: string,
    repo: string,
    files: { filePath: string; content: string; mode?: '100644' | '100755' | '040000' }[], // Added mode for files
    message: string,
    branch: string = 'main'
): Promise<string> => {
    return measurePerformance('commitFiles', async () => {
        logEvent('commitFiles_start', { owner, repo, fileCount: files.length, branch });
        const octokit = getOctokit();

        try {
            // 1. Get the latest commit SHA and base tree SHA
            const { data: refData } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner,
                repo,
                ref: `heads/${branch}`,
            });
            const latestCommitSha = refData.object.sha;
            const { data: commitData } = await octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
                owner,
                repo,
                commit_sha: latestCommitSha,
            });
            const baseTreeSha = commitData.tree.sha;

            // 2. Create blobs for all new file contents
            const blobPromises = files.map(file =>
                octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
                    owner,
                    repo,
                    content: file.content,
                    encoding: 'utf-8',
                })
            );
            const blobs = await Promise.all(blobPromises);
            
            // 3. Create the tree object
            const tree = blobs.map((blob, index) => ({
                path: files[index].filePath,
                mode: files[index].mode || '100644' as const, // file mode, default to '100644'
                type: 'blob' as const,
                sha: blob.data.sha,
            }));

            // 4. Create a new tree
            const { data: newTree } = await octokit.request('POST /repos/{owner}/{repo}/git/trees', {
                owner,
                repo,
                base_tree: baseTreeSha,
                tree,
            });

            // 5. Create a new commit
            const { data: newCommit } = await octokit.request('POST /repos/{owner}/{repo}/git/commits', {
                owner,
                repo,
                message,
                tree: newTree.sha,
                parents: [latestCommitSha],
            });

            // 6. Update the branch reference (fast-forward)
            await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
                owner,
                repo,
                ref: `heads/${branch}`,
                sha: newCommit.sha,
            });

            logEvent('commitFiles_success', { commitUrl: newCommit.html_url });
            return newCommit.html_url;

        } catch (error) {
            logError(error as Error, { context: 'commitFiles', owner, repo, branch });
            throw new Error(`Failed to commit files: ${(error as Error).message}`);
        }
    });
};


// --- Pull Request Functions ---

export const listPullRequests = async (
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    head?: string, // Filter by head (user:branch or org:branch)
    base?: string  // Filter by base (branch)
): Promise<any[]> => {
    return measurePerformance('listPullRequests', async () => {
        logEvent('listPullRequests_start', { owner, repo, state, head, base });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
                owner,
                repo,
                state,
                head,
                base,
                per_page: 100,
            });
            logEvent('listPullRequests_success', { owner, repo, state, count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'listPullRequests', owner, repo, state });
            throw new Error(`Failed to list pull requests for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const createPullRequest = async (
    owner: string,
    repo: string,
    title: string,
    head: string, // The name of the branch where your changes are implemented (e.g., 'feature-branch')
    base: string = 'main', // The name of the branch you want to merge into (e.g., 'main')
    body: string = '',
    draft: boolean = false
): Promise<any> => {
    return measurePerformance('createPullRequest', async () => {
        logEvent('createPullRequest_start', { owner, repo, title, head, base, draft });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
                owner,
                repo,
                title,
                head,
                base,
                body,
                draft,
            });
            logEvent('createPullRequest_success', { owner, repo, prId: data.number, prUrl: data.html_url });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createPullRequest', owner, repo, title, head, base });
            throw new Error(`Failed to create pull request for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const getPullRequest = async (owner: string, repo: string, pull_number: number): Promise<any> => {
    return measurePerformance('getPullRequest', async () => {
        logEvent('getPullRequest_start', { owner, repo, pull_number });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
                owner,
                repo,
                pull_number,
            });
            logEvent('getPullRequest_success', { owner, repo, pull_number });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'getPullRequest', owner, repo, pull_number });
            throw new Error(`Failed to fetch pull request #${pull_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const mergePullRequest = async (
    owner: string,
    repo: string,
    pull_number: number,
    commit_title?: string,
    commit_message?: string,
    sha?: string, // SHA of the HEAD commit of the pull request branch
    merge_method: 'merge' | 'squash' | 'rebase' = 'merge'
): Promise<any> => {
    return measurePerformance('mergePullRequest', async () => {
        logEvent('mergePullRequest_start', { owner, repo, pull_number, merge_method });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
                owner,
                repo,
                pull_number,
                commit_title,
                commit_message,
                sha,
                merge_method,
            });
            logEvent('mergePullRequest_success', { owner, repo, pull_number, merged: data.merged });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'mergePullRequest', owner, repo, pull_number });
            throw new Error(`Failed to merge pull request #${pull_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const closePullRequest = async (
    owner: string,
    repo: string,
    pull_number: number
): Promise<any> => {
    return measurePerformance('closePullRequest', async () => {
        logEvent('closePullRequest_start', { owner, repo, pull_number });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
                owner,
                repo,
                pull_number,
                state: 'closed',
            });
            logEvent('closePullRequest_success', { owner, repo, pull_number });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'closePullRequest', owner, repo, pull_number });
            throw new Error(`Failed to close pull request #${pull_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const listPullRequestComments = async (owner: string, repo: string, pull_number: number): Promise<any[]> => {
    return measurePerformance('listPullRequestComments', async () => {
        logEvent('listPullRequestComments_start', { owner, repo, pull_number });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
                owner,
                repo,
                pull_number,
                per_page: 100,
            });
            logEvent('listPullRequestComments_success', { owner, repo, pull_number, count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'listPullRequestComments', owner, repo, pull_number });
            throw new Error(`Failed to list comments for PR #${pull_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const createPullRequestComment = async (
    owner: string,
    repo: string,
    pull_number: number,
    body: string,
    commit_id?: string, // SHA of the commit to comment on
    path?: string, // Path to the file that the comment applies to
    position?: number // Line index in the diff where the comment is added
): Promise<any> => {
    return measurePerformance('createPullRequestComment', async () => {
        logEvent('createPullRequestComment_start', { owner, repo, pull_number });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
                owner,
                repo,
                pull_number,
                body,
                commit_id,
                path,
                position,
            });
            logEvent('createPullRequestComment_success', { owner, repo, pull_number, commentId: data.id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createPullRequestComment', owner, repo, pull_number });
            throw new Error(`Failed to create comment on PR #${pull_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};


// --- Issue Management Functions ---

export const listIssues = async (
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    labels?: string[],
    assignee?: string, // 'none' for issues with no assignee, 'any' for issues with any assignee
    creator?: string
): Promise<any[]> => {
    return measurePerformance('listIssues', async () => {
        logEvent('listIssues_start', { owner, repo, state, labels, assignee, creator });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
                owner,
                repo,
                state,
                labels: labels ? labels.join(',') : undefined,
                assignee: assignee === 'none' ? 'none' : (assignee === 'any' ? 'any' : assignee),
                creator,
                per_page: 100,
            });
            logEvent('listIssues_success', { owner, repo, state, count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'listIssues', owner, repo, state });
            throw new Error(`Failed to list issues for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const createIssue = async (
    owner: string,
    repo: string,
    title: string,
    body: string = '',
    labels: string[] = [],
    assignees: string[] = [],
    milestone?: number
): Promise<any> => {
    return measurePerformance('createIssue', async () => {
        logEvent('createIssue_start', { owner, repo, title, labels, assignees });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('POST /repos/{owner}/{repo}/issues', {
                owner,
                repo,
                title,
                body,
                labels,
                assignees,
                milestone,
            });
            logEvent('createIssue_success', { owner, repo, issueId: data.number, issueUrl: data.html_url });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createIssue', owner, repo, title });
            throw new Error(`Failed to create issue in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const getIssue = async (owner: string, repo: string, issue_number: number): Promise<any> => {
    return measurePerformance('getIssue', async () => {
        logEvent('getIssue_start', { owner, repo, issue_number });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
                owner,
                repo,
                issue_number,
            });
            logEvent('getIssue_success', { owner, repo, issue_number });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'getIssue', owner, repo, issue_number });
            throw new Error(`Failed to fetch issue #${issue_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const updateIssue = async (
    owner: string,
    repo: string,
    issue_number: number,
    updates: {
        title?: string;
        body?: string;
        state?: 'open' | 'closed';
        state_reason?: 'completed' | 'not_planned' | 'reopened'; // only for closed
        milestone?: number | null;
        labels?: (string | { name: string })[];
        assignees?: string[];
    }
): Promise<any> => {
    return measurePerformance('updateIssue', async () => {
        logEvent('updateIssue_start', { owner, repo, issue_number, updates });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
                owner,
                repo,
                issue_number,
                ...updates,
            });
            logEvent('updateIssue_success', { owner, repo, issueId: data.number, state: data.state });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'updateIssue', owner, repo, issue_number });
            throw new Error(`Failed to update issue #${issue_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const closeIssue = async (owner: string, repo: string, issue_number: number, state_reason?: 'completed' | 'not_planned'): Promise<any> => {
    return updateIssue(owner, repo, issue_number, { state: 'closed', state_reason });
};

export const reopenIssue = async (owner: string, repo: string, issue_number: number): Promise<any> => {
    return updateIssue(owner, repo, issue_number, { state: 'open', state_reason: 'reopened' });
};


export const listIssueComments = async (
    owner: string,
    repo: string,
    issue_number: number
): Promise<any[]> => {
    return measurePerformance('listIssueComments', async () => {
        logEvent('listIssueComments_start', { owner, repo, issue_number });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
                owner,
                repo,
                issue_number,
                per_page: 100,
            });
            logEvent('listIssueComments_success', { owner, repo, issue_number, count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'listIssueComments', owner, repo, issue_number });
            throw new Error(`Failed to list comments for issue #${issue_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const createIssueComment = async (
    owner: string,
    repo: string,
    issue_number: number,
    body: string
): Promise<any> => {
    return measurePerformance('createIssueComment', async () => {
        logEvent('createIssueComment_start', { owner, repo, issue_number });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
                owner,
                repo,
                issue_number,
                body,
            });
            logEvent('createIssueComment_success', { owner, repo, issue_number, commentId: data.id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createIssueComment', owner, repo, issue_number });
            throw new Error(`Failed to create comment on issue #${issue_number} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const updateIssueComment = async (
    owner: string,
    repo: string,
    comment_id: number,
    body: string
): Promise<any> => {
    return measurePerformance('updateIssueComment', async () => {
        logEvent('updateIssueComment_start', { owner, repo, comment_id });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
                owner,
                repo,
                comment_id,
                body,
            });
            logEvent('updateIssueComment_success', { owner, repo, comment_id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'updateIssueComment', owner, repo, comment_id });
            throw new Error(`Failed to update comment #${comment_id} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const deleteIssueComment = async (
    owner: string,
    repo: string,
    comment_id: number
): Promise<void> => {
    return measurePerformance('deleteIssueComment', async () => {
        logEvent('deleteIssueComment_start', { owner, repo, comment_id });
        try {
            const octokit = getOctokit();
            await octokit.request('DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}', {
                owner,
                repo,
                comment_id,
            });
            logEvent('deleteIssueComment_success', { owner, repo, comment_id });
            return;
        } catch (error) {
            logError(error as Error, { context: 'deleteIssueComment', owner, repo, comment_id });
            throw new Error(`Failed to delete comment #${comment_id} in "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};


// --- Gist Functions ---
export const listGists = async (username?: string): Promise<any[]> => {
    return measurePerformance('listGists', async () => {
        logEvent('listGists_start', { username });
        try {
            const octokit = getOctokit();
            const path = username ? `GET /users/{username}/gists` : `GET /gists`;
            const { data } = await octokit.request(path, { username } as any); // Type assertion for username parameter
            logEvent('listGists_success', { username, count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'listGists', username });
            throw new Error(`Failed to list gists for ${username || 'authenticated user'}: ${(error as Error).message}`);
        }
    });
};

export const getGist = async (gist_id: string): Promise<any> => {
    return measurePerformance('getGist', async () => {
        logEvent('getGist_start', { gist_id });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /gists/{gist_id}', { gist_id });
            logEvent('getGist_success', { gist_id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'getGist', gist_id });
            throw new Error(`Failed to fetch gist "${gist_id}": ${(error as Error).message}`);
        }
    });
};

export const createGist = async (
    files: { [filename: string]: { content: string } },
    description: string = '',
    isPublic: boolean = false
): Promise<any> => {
    return measurePerformance('createGist', async () => {
        logEvent('createGist_start', { fileCount: Object.keys(files).length, description, isPublic });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('POST /gists', {
                description,
                public: isPublic,
                files,
            });
            logEvent('createGist_success', { gist_id: data.id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createGist' });
            throw new Error(`Failed to create gist: ${(error as Error).message}`);
        }
    });
};

export const updateGist = async (
    gist_id: string,
    files: { [filename: string]: { content: string } | null }, // Use null to delete a file
    description?: string
): Promise<any> => {
    return measurePerformance('updateGist', async () => {
        logEvent('updateGist_start', { gist_id, fileCount: Object.keys(files).length });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('PATCH /gists/{gist_id}', {
                gist_id,
                description,
                files,
            });
            logEvent('updateGist_success', { gist_id: data.id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'updateGist', gist_id });
            throw new Error(`Failed to update gist "${gist_id}": ${(error as Error).message}`);
        }
    });
};

export const deleteGist = async (gist_id: string): Promise<void> => {
    return measurePerformance('deleteGist', async () => {
        logEvent('deleteGist_start', { gist_id });
        try {
            const octokit = getOctokit();
            await octokit.request('DELETE /gists/{gist_id}', { gist_id });
            logEvent('deleteGist_success', { gist_id });
            return;
        } catch (error) {
            logError(error as Error, { context: 'deleteGist', gist_id });
            throw new Error(`Failed to delete gist "${gist_id}": ${(error as Error).message}`);
        }
    });
};

// --- Webhooks Management ---

export const listRepositoryWebhooks = async (owner: string, repo: string): Promise<any[]> => {
    return measurePerformance('listRepositoryWebhooks', async () => {
        logEvent('listRepositoryWebhooks_start', { owner, repo });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/hooks', {
                owner,
                repo,
            });
            logEvent('listRepositoryWebhooks_success', { owner, repo, count: data.length });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'listRepositoryWebhooks', owner, repo });
            throw new Error(`Failed to list webhooks for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const createRepositoryWebhook = async (
    owner: string,
    repo: string,
    config: {
        url: string;
        content_type?: 'json' | 'form';
        secret?: string;
        insecure_ssl?: string; // "0" or "1"
    },
    events: string[] = ['push'],
    active: boolean = true
): Promise<any> => {
    return measurePerformance('createRepositoryWebhook', async () => {
        logEvent('createRepositoryWebhook_start', { owner, repo, configUrl: config.url, events, active });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('POST /repos/{owner}/{repo}/hooks', {
                owner,
                repo,
                config,
                events,
                active,
            });
            logEvent('createRepositoryWebhook_success', { owner, repo, hookId: data.id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'createRepositoryWebhook', owner, repo, configUrl: config.url });
            throw new Error(`Failed to create webhook for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const updateRepositoryWebhook = async (
    owner: string,
    repo: string,
    hook_id: number,
    config?: {
        url?: string;
        content_type?: 'json' | 'form';
        secret?: string;
        insecure_ssl?: string;
    },
    events?: string[],
    active?: boolean
): Promise<any> => {
    return measurePerformance('updateRepositoryWebhook', async () => {
        logEvent('updateRepositoryWebhook_start', { owner, repo, hook_id });
        try {
            const octokit = getOctokit();
            const { data } = await octokit.request('PATCH /repos/{owner}/{repo}/hooks/{hook_id}', {
                owner,
                repo,
                hook_id,
                config,
                events,
                active,
            });
            logEvent('updateRepositoryWebhook_success', { owner, repo, hook_id: data.id });
            return data;
        } catch (error) {
            logError(error as Error, { context: 'updateRepositoryWebhook', owner, repo, hook_id });
            throw new Error(`Failed to update webhook #${hook_id} for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};

export const deleteRepositoryWebhook = async (owner: string, repo: string, hook_id: number): Promise<void> => {
    return measurePerformance('deleteRepositoryWebhook', async () => {
        logEvent('deleteRepositoryWebhook_start', { owner, repo, hook_id });
        try {
            const octokit = getOctokit();
            await octokit.request('DELETE /repos/{owner}/{repo}/hooks/{hook_id}', {
                owner,
                repo,
                hook_id,
            });
            logEvent('deleteRepositoryWebhook_success', { owner, repo, hook_id });
            return;
        } catch (error) {
            logError(error as Error, { context: 'deleteRepositoryWebhook', owner, repo, hook_id });
            throw new Error(`Failed to delete webhook #${hook_id} for "${owner}/${repo}": ${(error as Error).message}`);
        }
    });
};