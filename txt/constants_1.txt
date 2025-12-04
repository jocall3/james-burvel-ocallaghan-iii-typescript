// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import type { IconName } from '../types';

export const APP_TITLE = "AI Story Scaffolding Studio";

export const CHROME_VIEW_IDS = ['features-list'] as const;

export const SLOTS = ['Core', 'AI Tools', 'Frontend', 'Testing', 'Database', 'Productivity'] as const;
export type SlotCategory = typeof SLOTS[number];

export const FEATURE_CATEGORIES = [
    'AI Command Center & Core Interaction',
    'File Management & Organization',
    'Code Editing & Development',
    'Data & Design Tools',
    'Productivity & Workflow',
    'System & Integration',
    'Advanced AI & Learning',
    'User Interface & Experience',
    'Advanced File System Operations',
    'Collaborative & Sharing',
    'Advanced Generative Capabilities',
    'Ethical AI & User Control',
    'Enterprise & DevOps',
    'Advanced Code & Architecture',
    'Business & Product',
    'Content & Creative',
    'Data Science & Analysis',
] as const;

export type FeatureCategory = typeof FEATURE_CATEGORIES[number];

interface RawFeature {
    id: string;
    name: string;
    description: string;
    icon: IconName;
    category: FeatureCategory;
}

// This is the raw data, to be "compiled" by features/index.ts
export const RAW_FEATURES: RawFeature[] = [
    // Add the new OmniStruct Framework as a feature
    { id: "omnistruct-framework", name: "OmniStruct Framework", description: "Define, manage, and interact with enterprise-grade project structures.", icon: 'Server', category: "System & Integration" },
    
    // Add the new Alchemy Studio feature
    { id: "alchemy-studio", name: "Alchemy Studio", description: "The Alchemist's workshop. Compile and run TSAL code.", icon: 'FlaskConical', category: "System & Integration" },

    // Add the new Story Scaffolding App as a feature
    { id: "ai-story-scaffolding", name: "AI Story Scaffolding", description: "Interactive AI-powered story creation studio.", icon: 'BookOpen', category: "Advanced Generative Capabilities" },
    
    // Category 1: AI Command Center & Core Interaction
    { id: "ai-command-center", name: "AI Command Center", description: "Use natural language to navigate and control the toolkit.", icon: 'Command', category: "AI Command Center & Core Interaction" },
    { id: "context-aware-command-suggestions", name: "Context-Aware Command Suggestions", description: "AI suggests commands based on active file, open editor content, and recent activity.", icon: 'Sparkles', category: "AI Command Center & Core Interaction" },
    { id: "natural-language-workflow-chaining", name: "Natural Language Workflow Chaining", description: "Execute a sequence of Toolkit features with a single natural language prompt.", icon: 'Workflow', category: "AI Command Center & Core Interaction" },
    { id: "voice-command-integration", name: "Voice Command Integration", description: "Control all Toolkit features and navigation using voice commands.", icon: 'Mic', category: "AI Command Center & Core Interaction" },
    { id: "sentiment-aware-response-generation", name: "Sentiment-Aware Response Generation", description: "AI adjusts its tone and verbosity based on inferred user sentiment.", icon: 'Smile', category: "AI Command Center & Core Interaction" },
    { id: "proactive-problem-identification", name: "Proactive Problem Identification", description: "AI monitors open files/projects and proactively suggests actions if issues are detected.", icon: 'Bug', category: "AI Command Center & Core Interaction" },
    { id: "cross-application-command-integration", name: "Cross-Application Command Integration", description: "Extend command center to interact with other local applications.", icon: 'AppWindow', category: "AI Command Center & Core Interaction" },
    { id: "undo-last-ai-action", name: "Undo Last AI Action", description: "A universal undo for any AI-driven file modification or generation.", icon: 'Undo2', category: "AI Command Center & Core Interaction" },
    { id: "ai-driven-tutorial-onboarding", name: "AI-Driven Tutorial & Onboarding", description: "AI provides interactive, context-sensitive tutorials for new features.", icon: 'Projector', category: "AI Command Center & Core Interaction" },
    { id: "personalized-shortcut-learning", name: "Personalized Shortcut Learning", description: "AI observes user's manual actions and suggests custom keyboard shortcuts.", icon: 'Keyboard', category: "AI Command Center & Core Interaction" },
    { id: "explain-this-ui-element", name: "Explain This UI Element", description: "Point to any UI element, and AI explains its function.", icon: 'HelpCircle', category: "AI Command Center & Core Interaction" },

    // Category 2: File Management & Organization
    { id: "ai-driven-content-tagging", name: "AI-Driven Content Tagging", description: "AI automatically analyzes file content and suggests relevant tags.", icon: 'Tags', category: "File Management & Organization" },
    { id: "semantic-search-with-natural-language-filters", name: "Semantic Search with NL Filters", description: "Search for files using natural language queries combined with semantic filters.", icon: 'Search', category: "File Management & Organization" },
    { id: "ai-generated-file-summaries", name: "AI-Generated File Summaries", description: "AI provides concise summaries of file content on hover or as a background process.", icon: 'AlignLeft', category: "File Management & Organization" },
    { id: "explain-this-folder-with-project-context", name: "Explain this Folder (Contextual)", description: "AI provides a high-level summary of a folder's purpose, identifying project type and key files.", icon: 'FolderOpen', category: "File Management & Organization" },
    { id: "content-based-deduplication", name: "Content-Based Deduplication", description: "AI identifies semantically similar files and suggests merging or deleting duplicates.", icon: 'CopyX', category: "File Management & Organization" },
    { id: "predictive-file-placement", name: "Predictive File Placement", description: "When a new file is created/downloaded, AI proactively suggests the optimal folder.", icon: 'Send', category: "File Management & Organization" },
    { id: "smart-archive-assistant", name: "Smart Archive Assistant", description: "AI analyzes project folders to identify old versions and unused assets, suggesting an archive structure.", icon: 'Archive', category: "File Management & Organization" },
    { id: "ai-powered-file-renaming", name: "AI-Powered File Renaming", description: "AI suggests intelligent, consistent renaming patterns for files.", icon: 'Pencil', category: "File Management & Organization" },
    { id: "dynamic-file-grouping", name: "Dynamic File Grouping", description: "AI can temporarily group files based on a user's current task or query.", icon: 'Group', category: "File Management & Organization" },
    { id: "version-history-summarization", name: "Version History Summarization", description: "For files under version control, AI summarizes changes between versions.", icon: 'GitCommit', category: "File Management & Organization" },
    { id: "ai-driven-file-access-permissions", name: "AI File Access Permissions", description: "AI suggests optimal access permissions for shared folders based on content and team roles.", icon: 'Lock', category: "File Management & Organization" },
    { id: "automated-metadata-extraction", name: "Automated Metadata Extraction", description: "AI extracts and enriches metadata from files for advanced filtering.", icon: 'FileJson', category: "File Management & Organization" },
    { id: "visual-file-relationship-mapping", name: "Visual File Relationship Mapping", description: "AI generates a visual graph of how files are related within a project.", icon: 'GitBranch', category: "File Management & Organization" },
    { id: "clean-up-downloads-assistant", name: "Clean Up Downloads Assistant", description: "AI automatically categorizes and moves files from the Downloads folder.", icon: 'Trash2', category: "File Management & Organization" },
    { id: "ai-powered-file-integrity-checks", name: "AI-Powered File Integrity Checks", description: "AI monitors files for unexpected changes or potential corruption.", icon: 'ShieldCheck', category: "File Management & Organization" },
    { id: "cross-device-file-sync-suggestions", name: "Cross-Device File Sync Suggestions", description: "AI suggests optimal files/folders for synchronization across devices.", icon: 'Cloud', category: "File Management & Organization" },
    { id: "ai-driven-file-encryption-recommendations", name: "AI File Encryption Recommendations", description: "AI recommends which sensitive files should be encrypted.", icon: 'Shield', category: "File Management & Organization" },
    { id: "find-similar-files", name: "Find Similar Files", description: "Right-click a file, and AI finds other semantically similar files.", icon: 'Copy', category: "File Management & Organization" },
    { id: "ai-powered-file-type-conversion", name: "AI File Type Conversion", description: "AI suggests converting files to different formats based on context.", icon: 'ArrowRightLeft', category: "File Management & Organization" },
    { id: "automated-screenshot-organization", name: "Automated Screenshot Organization", description: "AI automatically categorizes and renames screenshots based on content and capture time.", icon: 'Monitor', category: "File Management & Organization" },
    { id: "ai-driven-project-health-reports", name: "AI Project Health Reports", description: "AI generates reports on project file structure health.", icon: 'HeartPulse', category: "File Management & Organization" },
    { id: "whats-new-here-summary", name: "What's New Here? Summary", description: "AI provides a summary of new or recently modified files in a directory.", icon: 'FileClock', category: "File Management & Organization" },
    { id: "ai-powered-file-preview-customization", name: "AI File Preview Customization", description: "Users can customize what aspects of a file AI should prioritize in its preview.", icon: 'Eye', category: "File Management & Organization" },
    { id: "find-broken-links-scan", name: "Find Broken Links Scan", description: "AI scans documents and code for broken internal or external links.", icon: 'Link2Off', category: "File Management & Organization" },
    { id: "ai-assisted-file-tagging-for-compliance", name: "AI Compliance Tagging", description: "AI helps tag files according to regulatory compliance standards.", icon: 'ShieldAlert', category: "File Management & Organization" },
    { id: "dynamic-file-icon-generation", name: "Dynamic File Icon Generation", description: "AI generates unique, content-representative icons for files or folders.", icon: 'Image', category: "File Management & Organization" },
    { id: "ai-powered-file-sharing-recommendations", name: "AI File Sharing Recommendations", description: "AI suggests the best way to share a file based on its content and recipient.", icon: 'Share2', category: "File Management & Organization" },
    { id: "why-is-this-file-here-explanation", name: "Why is this file here?", description: "AI attempts to explain the purpose or origin of an unfamiliar file.", icon: 'HelpCircle', category: "File Management & Organization" },
    { id: "ai-driven-file-access-auditing", name: "AI File Access Auditing", description: "AI analyzes file access logs to identify unusual patterns.", icon: 'ShieldHalf', category: "File Management & Organization" },
    { id: "automated-image-captioning", name: "Automated Image Captioning", description: "AI generates descriptive captions or alt-text for images.", icon: 'ImagePlus', category: "File Management & Organization" },

    // Category 3: Code Editing & Development
    { id: "ai-code-explainer", name: "AI Code Explainer", description: "Get a structured analysis of code, including complexity.", icon: 'CodeXml', category: "Code Editing & Development" },
    { id: "ai-feature-builder", name: "AI Feature Builder", description: "Generate code, tests, and commit messages.", icon: 'Cuboid', category: "Code Editing & Development" },
    { id: "ai-code-migrator", name: "AI Code Migrator", description: "Translate code between languages & frameworks.", icon: 'ArrowRightLeft', category: "Code Editing & Development" },
    { id: "portable-snippet-vault", name: "Snippet Vault", description: "Store, search, tag, and enhance reusable code snippets with AI.", icon: 'Library', category: "Code Editing & Development" },
    { id: "ai-unit-test-generator", name: "AI Unit Test Generator", description: "Generate unit tests from source code.", icon: 'Beaker', category: "Code Editing & Development" },
    { id: "ai-commit-generator", name: "AI Commit Message Generator", description: "Smart, conventional commits via AI.", icon: 'GitCommit', category: "Code Editing & Development" },
    { id: "worker-thread-debugger", name: "AI Concurrency Analyzer", description: "Analyze JS for Web Worker issues like race conditions.", icon: 'Atom', category: "Code Editing & Development" },
    { id: "regex-sandbox", name: "RegEx Sandbox", description: "Visually test regular expressions, generate them with AI, and inspect match groups.", icon: 'Regex', category: "Code Editing & Development" },
    { id: "linter-formatter", name: "AI Code Formatter", description: "AI-powered, real-time code formatting.", icon: 'ScanLine', category: "Code Editing & Development" },
    { id: "ai-style-transfer", name: "AI Code Style Transfer", description: "Rewrite code to match a specific style guide.", icon: 'Paintbrush', category: "Code Editing & Development" },
    { id: "ai-coding-challenge", name: "AI Coding Challenge Generator", description: "Generate unique coding exercises.", icon: 'FileCode', category: "Code Editing & Development" },
    { id: "code-review-bot", name: "AI Code Review Bot", description: "Get an automated code review from an AI.", icon: 'Bot', category: "Code Editing & Development" },
    { id: "ai-pull-request-assistant", name: "AI Pull Request Assistant", description: "Generate a structured PR summary from code diffs and populate a full template.", icon: 'GitPullRequest', category: "Code Editing & Development" },
    { id: "audio-to-code", name: "AI Audio-to-Code", description: "Speak your programming ideas and watch them turn into code.", icon: 'AudioLines', category: "Code Editing & Development" },
    { id: "code-spell-checker", name: "Code Spell Checker", description: "A spell checker that finds common typos in code.", icon: 'SpellCheck', category: "Code Editing & Development" },
    { id: "real-time-ai-code-refactoring", name: "Real-time AI Code Refactoring", description: "As you code, AI provides real-time suggestions for refactoring.", icon: 'Sparkles', category: "Code Editing & Development" },
    { id: "ai-powered-code-completion", name: "AI-Powered Code Completion", description: "AI predicts entire blocks of code, functions, or architectural patterns.", icon: 'Cpu', category: "Code Editing & Development" },
    { id: "automated-code-documentation-generation", name: "Automated Code Documentation", description: "AI generates JSDoc, Python docstrings, or other documentation formats.", icon: 'FileText', category: "Code Editing & Development" },
    { id: "ai-assisted-debugging", name: "AI-Assisted Debugging", description: "Feed error logs or stack traces to AI, and it performs root cause analysis.", icon: 'Bug', category: "Code Editing & Development" },
    { id: "generate-boilerplate-context-menu", name: "Generate Boilerplate", description: "Right-click in a folder or editor, and AI generates boilerplate code.", icon: 'FilePlus', category: "Code Editing & Development" },
    { id: "semantic-code-search", name: "Semantic Code Search", description: "Search for code snippets based on their functionality or intent.", icon: 'SearchCode', category: "Code Editing & Development" },
    { id: "ai-driven-api-client-generation", name: "AI API Client Generation", description: "Provide an OpenAPI/Swagger spec, and AI generates a type-safe API client.", icon: 'Code', category: "Code Editing & Development" },
    { id: "automated-code-commenting", name: "Automated Code Commenting", description: "AI adds explanatory comments to complex or undocumented code sections.", icon: 'MessageSquarePlus', category: "Code Editing & Development" },
    { id: "ai-driven-performance-bottleneck-id", name: "AI Performance Bottleneck ID", description: "AI analyzes code for potential performance issues and suggests optimizations.", icon: 'Gauge', category: "Code Editing & Development" },
    { id: "convert-to-async-await-refactoring", name: "Convert to Async/Await", description: "AI automatically refactors callback-based code to async/await.", icon: 'ArrowRightLeft', category: "Code Editing & Development" },
    { id: "ai-powered-security-vulnerability-scanning", name: "AI Security Vulnerability Scanning", description: "AI scans code for common security vulnerabilities.", icon: 'ShieldAlert', category: "Code Editing & Development" },
    { id: "ai-driven-database-query-generation", name: "AI Database Query Generation", description: "Provide a natural language description, and AI generates SQL or ORM queries.", icon: 'Database', category: "Code Editing & Development" },
    { id: "explain-this-error-message", name: "Explain This Error Message", description: "Highlight an error message, and AI provides an explanation and fixes.", icon: 'HelpCircle', category: "Code Editing & Development" },
    { id: "ai-driven-code-complexity-visualization", name: "AI Code Complexity Visualization", description: "AI generates visual representations of code complexity.", icon: 'BarChart', category: "Code Editing & Development" },
    { id: "suggest-better-variable-names", name: "Suggest Better Variable Names", description: "AI analyzes code and suggests more descriptive names.", icon: 'Pencil', category: "Code Editing & Development" },
    { id: "ai-powered-code-generation-for-accessibility", name: "AI Accessible Code Generation", description: "AI generates accessible HTML/React components.", icon: 'Accessibility', category: "Code Editing & Development" },
    { id: "find-unused-code-scan", name: "Find Unused Code Scan", description: "AI scans the project for dead code.", icon: 'Trash', category: "Code Editing & Development" },
    { id: "refactor-this-file-command", name: "Refactor This File Command", description: "AI performs a comprehensive refactoring of an entire file.", icon: 'Sparkles', category: "Code Editing & Development" },

    // Category 4: Data & Design Tools
    { id: "theme-designer", name: "AI Theme Designer", description: "Generate, fine-tune, and export UI color themes from a text description.", icon: 'Palette', category: "Data & Design Tools" },
    { id: "json-tree-navigator", name: "JSON Tree Navigator", description: "Navigate large JSON objects as a collapsible tree.", icon: 'FileJson', category: "Data & Design Tools" },
    { id: "xbrl-converter", name: "XBRL Converter", description: "Convert JSON data to a simplified XBRL-like XML format using AI.", icon: 'FileCode2', category: "Data & Design Tools" },
    { id: "css-grid-editor", name: "CSS Grid Visual Editor", description: "Drag-based layout builder for CSS Grid.", icon: 'Grid', category: "Data & Design Tools" },
    { id: "schema-designer", name: "Schema Designer", description: "Visually design a database schema with a drag-and-drop interface and SQL export.", icon: 'Database', category: "Data & Design Tools" },
    { id: "pwa-manifest-editor", name: "PWA Manifest Editor", description: "Configure and preview Progressive Web App manifests with a home screen simulator.", icon: 'AppWindow', category: "Data & Design Tools" },
    { id: "markdown-slides-generator", name: "Markdown Slides", description: "Turn markdown into a fullscreen presentation with an interactive overlay.", icon: 'Presentation', category: "Data & Design Tools" },
    { id: "screenshot-to-component", name: "Screenshot-to-Component", description: "Turn UI screenshots into functional code via paste or upload.", icon: 'Monitor', category: "Data & Design Tools" },
    { id: "typography-lab", name: "Typography Lab", description: "Preview font pairings and get CSS import rules.", icon: 'Type', category: "Data & Design Tools" },
    { id: "svg-path-editor", name: "SVG Path Editor", description: "Visually create and manipulate SVG path data with an interactive canvas.", icon: 'PenTool', category: "Data & Design Tools" },
    { id: "async-call-tree-viewer", name: "Async Call Tree Viewer", description: "Visualize a tree of asynchronous function calls from JSON data.", icon: 'Network', category: "Data & Design Tools" },
    { id: "color-palette-generator", name: "AI Color Palette Generator", description: "Pick a base color and let Gemini design a beautiful palette.", icon: 'Palette', category: "Data & Design Tools" },
    { id: "logic-flow-builder", name: "Logic Flow Builder", description: "A visual tool for building application logic flows.", icon: 'Workflow', category: "Data & Design Tools" },
    { id: "meta-tag-editor", name: "Meta Tag Editor", description: "Generate SEO/social media meta tags with a live social card preview.", icon: 'Tags', category: "Data & Design Tools" },
    { id: "network-visualizer", name: "Network Visualizer", description: "Inspect network resources with a summary and visual waterfall chart.", icon: 'Network', category: "Data & Design Tools" },
    { id: "responsive-tester", name: "Responsive Tester", description: "Preview your web pages at different screen sizes and custom resolutions.", icon: 'Smartphone', category: "Data & Design Tools" },
    { id: "sass-scss-compiler", name: "SASS/SCSS Compiler", description: "A real-time SASS/SCSS to CSS compiler.", icon: 'FileCode', category: "Data & Design Tools" },
    { id: "ai-driven-data-transformation-pipelines", name: "AI Data Transformation Pipelines", description: "Generate code for complex data transformations.", icon: 'Workflow', category: "Data & Design Tools" },
    { id: "ai-powered-data-visualization-generation", name: "AI Data Visualization Generation", description: "Provide raw data, and AI suggests and generates various chart types.", icon: 'BarChart3', category: "Data & Design Tools" },
    { id: "generate-mock-data-command", name: "Generate Mock Data", description: "AI generates realistic mock data based on a schema or description.", icon: 'FileJson2', category: "Data & Design Tools" },
    { id: "generate-design-system-tokens", name: "Generate Design System Tokens", description: "AI generates a comprehensive set of design tokens from a brand description.", icon: 'Palette', category: "Data & Design Tools" },
    { id: "generate-color-palette-from-image", name: "Generate Color Palette from Image", description: "Provide an image, and AI extracts a harmonious color palette.", icon: 'Image', category: "Data & Design Tools" },
    { id: "generate-icon-set-command", name: "Generate Icon Set", description: "Describe a theme, and AI generates a set of SVG icons.", icon: 'Sparkles', category: "Data & Design Tools" },
    { id: "ai-driven-data-anonymization-service", name: "AI Data Anonymization Service", description: "Right-click a document, and AI creates a copy with PII redacted.", icon: 'Shield', category: "Data & Design Tools" },

    // Category 5: Productivity & Workflow
    { id: "digital-whiteboard", name: "Digital Whiteboard", description: "Organize ideas with interactive sticky notes and get AI-powered summaries.", icon: 'Clipboard', category: "Productivity & Workflow" },
    { id: "prompt-craft-pad", name: "Prompt Craft Pad", description: "Save, edit, and manage your custom AI prompts with variable testing.", icon: 'FileText', category: "Productivity & Workflow" },
    { id: "ai-driven-meeting-agenda-generation", name: "AI Meeting Agenda Generation", description: "AI generates meeting agendas based on project context and recent activity.", icon: 'FileText', category: "Productivity & Workflow" },
    { id: "automated-task-list-generation-from-notes", name: "Automated Task List Generation", description: "AI analyzes notes to extract actionable tasks.", icon: 'ClipboardList', category: "Productivity & Workflow" },
    { id: "ai-powered-email-draft-generation", name: "AI-Powered Email Draft Generation", description: "AI drafts emails based on current project context.", icon: 'Mail', category: "Productivity & Workflow" },
    { id: "summarize-my-day-report", name: "Summarize My Day Report", description: "AI generates a daily summary of user activity within the Toolkit.", icon: 'BarChart2', category: "Productivity & Workflow" },
    { id: "ai-driven-time-management-suggestions", name: "AI Time Management Suggestions", description: "AI analyzes task patterns and suggests optimal times for focused work.", icon: 'Clock', category: "Productivity & Workflow" },
    { id: "automated-project-status-reporting", name: "Automated Project Status Reporting", description: "AI generates project status reports based on git activity and file modifications.", icon: 'GitCommit', category: "Productivity & Workflow" },
    { id: "ai-powered-research-assistant", name: "AI-Powered Research Assistant", description: "AI can perform research, summarizing findings from local documents and web sources.", icon: 'Search', category: "Productivity & Workflow" },
    { id: "find-relevant-contacts", name: "Find Relevant Contacts", description: "AI identifies relevant contacts for a given project or task.", icon: 'Users', category: "Productivity & Workflow" },
    { id: "ai-driven-learning-path-suggestions", name: "AI Learning Path Suggestions", description: "Based on current project and user skills, AI suggests relevant learning resources.", icon: 'Map', category: "Productivity & Workflow" },
    { id: "automated-content-translation", name: "Automated Content Translation", description: "AI translates entire documents or code comments between languages.", icon: 'Languages', category: "Productivity & Workflow" },
    { id: "ai-powered-focus-mode-optimization", name: "AI Focus Mode Optimization", description: "AI intelligently mutes notifications or suggests closing irrelevant applications.", icon: 'BellOff', category: "Productivity & Workflow" },
    { id: "generate-presentation-outline", name: "Generate Presentation Outline", description: "Provide a topic, and AI generates a structured outline for a presentation.", icon: 'Presentation', category: "Productivity & Workflow" },
    { id: "ai-driven-project-risk-assessment", name: "AI Project Risk Assessment", description: "AI analyzes project files and activity to identify potential risks.", icon: 'ShieldAlert', category: "Productivity & Workflow" },
    { id: "automated-meeting-transcription", name: "Automated Meeting Transcription", description: "AI transcribes meetings and generates summaries and action items.", icon: 'Mic', category: "Productivity & Workflow" },
    { id: "ai-powered-brainstorm-ideas-assistant", name: "AI Brainstorming Assistant", description: "Provide a topic, and AI generates a list of creative ideas.", icon: 'Sparkles', category: "Productivity & Workflow" },
    { id: "generate-user-stories-command", name: "Generate User Stories", description: "Provide a feature description, and AI generates a set of user stories.", icon: 'UserPlus', category: "Productivity & Workflow" },
    { id: "ai-driven-project-budget-estimation", name: "AI Project Budget Estimation", description: "AI analyzes project scope and suggests budget estimates.", icon: 'CircleDollarSign', category: "Productivity & Workflow" },
    { id: "automated-report-generation", name: "Automated Report Generation", description: "Provide structured data, and AI generates a narrative report.", icon: 'FileText', category: "Productivity & Workflow" },
    { id: "ai-powered-what-if-scenario-analysis", name: "AI 'What If' Scenario Analysis", description: "AI simulates outcomes for different project decisions.", icon: 'Workflow', category: "Productivity & Workflow" },
    { id: "generate-marketing-copy", name: "Generate Marketing Copy", description: "Provide a product description, and AI generates marketing copy.", icon: 'FileText', category: "Productivity & Workflow" },

    // Category 6: System & Integration
    { id: "project-dissertations", name: "Project Dissertations", description: "Read the lore and technical design papers behind the DevCore AI project.", icon: 'BookOpen', category: "System & Integration" },
    { id: "connections", name: "Connections", description: "Connect to GitHub, Hugging Face, and other services.", icon: 'Plug', category: "System & Integration" },
    { id: "visual-git-tree", name: "Visual Git Tree", description: "Visually trace your git commit history with an interactive graph and an AI-powered summary.", icon: 'GitBranchPlus', category: "System & Integration" },
    { id: "changelog-generator", name: "AI Changelog Generator", description: "Auto-build changelogs from raw git logs.", icon: 'FileText', category: "System & Integration" },
    { id: "cron-job-builder", name: "AI Cron Job Builder", description: "Visually tool to configure cron jobs, with AI.", icon: 'Timer', category: "System & Integration" },
    { id: "code-diff-ghost", name: "Code Diff Ghost", description: "Visualize code changes with a 'ghost typing' effect.", icon: 'Ghost', category: "System & Integration" },
    { id: "ai-driven-resource-optimization", name: "AI Resource Optimization", description: "AI monitors system resources and suggests ways to optimize performance.", icon: 'Cpu', category: "System & Integration" },
    { id: "automated-cloud-storage-integration", name: "Automated Cloud Storage Integration", description: "AI suggests which files/folders to sync to cloud storage.", icon: 'Cloud', category: "System & Integration" },
    { id: "ai-powered-api-key-management", name: "AI API Key Management", description: "AI helps manage API keys securely, suggesting rotation schedules.", icon: 'Key', category: "System & Integration" },
    { id: "connect-to-new-service-assistant", name: "Connect to New Service Assistant", description: "AI guides users through connecting to new external services.", icon: 'Plug', category: "System & Integration" },
    { id: "ai-driven-backup-strategy", name: "AI Backup Strategy", description: "AI analyzes file importance and modification frequency to suggest backup strategies.", icon: 'Server', category: "System & Integration" },
    { id: "automated-software-update-management", name: "Automated Software Update Mgmt", description: "AI monitors for updates to installed software and suggests optimal times.", icon: 'Box', category: "System & Integration" },
    { id: "ai-powered-system-health-monitoring", name: "AI System Health Monitoring", description: "AI monitors local system health and provides predictive alerts.", icon: 'HeartPulse', category: "System & Integration" },
    { id: "troubleshoot-connection-assistant", name: "Troubleshoot Connection Assistant", description: "AI helps diagnose and fix issues with external service connections.", icon: 'Bug', category: "System & Integration" },
    { id: "ai-driven-data-migration", name: "AI-Driven Data Migration", description: "AI assists in migrating data between connected services.", icon: 'Database', category: "System & Integration" },
    { id: "automated-security-audit", name: "Automated Security Audit", description: "AI performs basic security audits on connected services.", icon: 'ShieldCheck', category: "System & Integration" },
    { id: "ai-powered-smart-notifications", name: "AI Smart Notifications", description: "AI filters and prioritizes notifications from connected services.", icon: 'Bell', category: "System & Integration" },
    { id: "generate-api-documentation", name: "Generate API Documentation", description: "AI generates API documentation from code or descriptions.", icon: 'FileText', category: "System & Integration" },
    { id: "ai-driven-license-compliance-checker", name: "AI License Compliance Checker", description: "AI scans project dependencies for license compliance issues.", icon: 'Lock', category: "System & Integration" },
    { id: "automated-environment-setup-assistant", name: "Automated Environment Setup", description: "AI guides users through setting up development environments.", icon: 'Terminal', category: "System & Integration" },
    { id: "whats-new-in-this-update-summary", name: "What's New in This Update", description: "AI summarizes release notes for Toolkit updates.", icon: 'Sparkles', category: "System & Integration" },
    { id: "ai-driven-data-privacy-impact-assessment", name: "AI Data Privacy Impact Assessment", description: "AI helps assess the privacy impact of data handling within a project.", icon: 'Shield', category: "System & Integration" },
    { id: "automated-dependency-vulnerability-scanning", name: "Automated Dependency Scanning", description: "AI scans project dependencies for known security vulnerabilities.", icon: 'Bug', category: "System & Integration" },
    { id: "clean-up-old-projects-assistant", name: "Clean Up Old Projects Assistant", description: "AI identifies and suggests archiving or deleting old, inactive project folders.", icon: 'Archive', category: "System & Integration" },
    { id: "generate-deployment-script", name: "Generate Deployment Script", description: "AI generates basic deployment scripts from project description.", icon: 'Send', category: "System & Integration" },
    { id: "ai-driven-cost-optimization-for-cloud", name: "AI Cloud Cost Optimization", description: "AI analyzes cloud resource usage and suggests cost-saving optimizations.", icon: 'TrendingDown', category: "System & Integration" },

    // Category 7: Advanced AI & Learning
    { id: "personalized-ai-model-fine-tuning", name: "Personalized AI Model Fine-Tuning", description: "Users can provide feedback, used to locally fine-tune specialized AI models.", icon: 'Cpu', category: "Advanced AI & Learning" },
    { id: "ai-driven-prompt-engineering-assistant", name: "AI Prompt Engineering Assistant", description: "AI helps users craft more effective prompts for generative models.", icon: 'Sparkles', category: "Advanced AI & Learning" },
    { id: "automated-ai-model-selection", name: "Automated AI Model Selection", description: "AI intelligently selects the most appropriate underlying AI model for a given task.", icon: 'Bot', category: "Advanced AI & Learning" },
    { id: "explain-ai-reasoning-feature", name: "Explain AI's Reasoning", description: "For any AI-generated output, users can ask the AI to explain its reasoning.", icon: 'HelpCircle', category: "Advanced AI & Learning" },
    { id: "ai-driven-ethical-ai-guidelines-enforcement", name: "Ethical AI Guidelines Enforcement", description: "AI monitors its own outputs for potential biases or ethical concerns.", icon: 'ShieldCheck', category: "Advanced AI & Learning" },
    { id: "automated-ai-model-performance-monitoring", name: "AI Model Performance Monitoring", description: "AI monitors the performance and accuracy of its own models.", icon: 'BarChart', category: "Advanced AI & Learning" },
    { id: "what-can-ai-do-here-contextual-help", name: "What Can AI Do Here?", description: "AI provides a list of all possible AI actions relevant to the current context.", icon: 'Sparkles', category: "Advanced AI & Learning" },
    { id: "ai-driven-feedback-loop-for-model-improvement", name: "AI Feedback Loop", description: "Users can easily provide feedback on AI outputs, aggregated for model improvement.", icon: 'Repeat', category: "Advanced AI & Learning" },
    { id: "explain-this-ai-concept-glossary", name: "Explain This AI Concept", description: "AI provides clear, concise explanations of AI concepts.", icon: 'Book', category: "Advanced AI & Learning" },
    { id: "automated-ai-model-versioning-and-rollback", name: "AI Model Versioning & Rollback", description: "The Toolkit manages different versions of local AI models.", icon: 'GitBranch', category: "Advanced AI & Learning" },
    
    // Category 8: User Interface & Experience
    { id: "ai-driven-adaptive-ui-layouts", name: "AI-Driven Adaptive UI Layouts", description: "AI dynamically adjusts the UI layout based on user's current task.", icon: 'LayoutGrid', category: "User Interface & Experience" },
    { id: "personalized-ui-theme-generation", name: "Personalized UI Theme Generation", description: "Generate full UI themes including fonts, spacing, and component styles.", icon: 'Palette', category: "User Interface & Experience" },
    { id: "automated-accessibility-audit-ui", name: "Automated Accessibility Audit", description: "AI scans the Toolkit's own UI for accessibility issues.", icon: 'Accessibility', category: "User Interface & Experience" },
    { id: "ai-driven-ui-customization-suggestions", name: "AI UI Customization Suggestions", description: "AI suggests UI customizations based on user behavior.", icon: 'Paintbrush', category: "User Interface & Experience" },
    { id: "dark-mode-ai-driven-dynamic-adjustment", name: "Dark Mode AI Dynamic Adjustment", description: "AI dynamically adjusts dark mode settings based on ambient light conditions.", icon: 'Moon', category: "User Interface & Experience" },
    { id: "ai-powered-walkthrough-for-complex-features", name: "AI Feature Walkthroughs", description: "AI provides interactive, step-by-step walkthroughs for complex features.", icon: 'Map', category: "User Interface & Experience" },
    { id: "automated-ui-performance-optimization", name: "Automated UI Performance Optimization", description: "AI monitors UI responsiveness and suggests optimizations.", icon: 'Gauge', category: "User Interface & Experience" },
    { id: "ai-driven-zen-mode-customization", name: "AI Zen Mode Customization", description: "AI helps users configure a distraction-free 'Zen Mode.'", icon: 'Sparkles', category: "User Interface & Experience" },
    { id: "explain-this-feature-ai-help", name: "Explain This Feature", description: "AI provides detailed explanations and usage examples for any Toolkit feature.", icon: 'HelpCircle', category: "User Interface & Experience" },
    
    // Category 9: Advanced File System Operations
    { id: "ai-driven-file-system-health-check", name: "AI File System Health Check", description: "AI scans the local file system for potential issues like fragmentation or inefficient storage.", icon: 'Server', category: "Advanced File System Operations" },
    { id: "automated-file-system-indexing-and-optimization", name: "Automated File System Indexing", description: "AI intelligently indexes the file system for faster search and retrieval.", icon: 'Cpu', category: "Advanced File System Operations" },
    { id: "ai-powered-predictive-disk-space-management", name: "Predictive Disk Space Management", description: "AI predicts future disk space needs and suggests proactive measures.", icon: 'BarChart', category: "Advanced File System Operations" },
    { id: "find-orphaned-files-ai-scan", name: "Find Orphaned Files", description: "AI identifies files that appear to be unlinked or irrelevant to any active project.", icon: 'SearchX', category: "Advanced File System Operations" },
    { id: "ai-driven-file-system-anomaly-detection", name: "AI File System Anomaly Detection", description: "AI monitors file system activity for unusual patterns.", icon: 'ShieldAlert', category: "Advanced File System Operations" },
    { id: "automated-file-system-cleanup-scheduled", name: "Automated File System Cleanup", description: "AI can schedule and execute automated cleanup tasks.", icon: 'Trash2', category: "Advanced File System Operations" },
    { id: "whats-taking-up-space-analysis", name: "What's Taking Up Space?", description: "AI provides a detailed breakdown of disk space usage.", icon: 'PieChart', category: "Advanced File System Operations" },
    { id: "optimize-storage-for-project", name: "Optimize Storage for Project", description: "AI analyzes a project folder and suggests ways to optimize its storage footprint.", icon: 'FolderCog', category: "Advanced File System Operations" },
    { id: "ai-driven-file-system-performance-benchmarking", name: "AI File System Benchmarking", description: "AI can run benchmarks on file system operations and suggest optimizations.", icon: 'Gauge', category: "Advanced File System Operations" },
    { id: "automated-logical-defragmentation-logical", name: "Automated Logical Defragmentation", description: "AI logically reorganizes files on disk to improve access times.", icon: 'Server', category: "Advanced File System Operations" },

    // Category 10: Collaborative & Sharing
    { id: "ai-driven-collaborative-document-editing", name: "AI Collaborative Document Editing", description: "AI suggests improvements, clarifies ambiguities, or identifies conflicts in shared documents.", icon: 'FileText', category: "Collaborative & Sharing" },
    { id: "automated-meeting-note-sharing-and-summarization", name: "Automated Meeting Note Sharing", description: "AI can automatically share meeting notes and summaries with team members.", icon: 'Send', category: "Collaborative & Sharing" },
    { id: "ai-powered-find-collaborators-assistant", name: "AI Find Collaborators Assistant", description: "AI suggests potential collaborators for a project.", icon: 'Users', category: "Collaborative & Sharing" },
    { id: "generate-team-update-command", name: "Generate Team Update", description: "AI generates a team update message based on recent project activity.", icon: 'Bell', category: "Collaborative & Sharing" },
    { id: "ai-driven-conflict-resolution-for-merges", name: "AI-Driven Merge Conflict Resolution", description: "AI analyzes merge conflicts in code and suggests optimal resolutions.", icon: 'GitBranch', category: "Collaborative & Sharing" },
    { id: "automated-project-onboarding", name: "Automated Project Onboarding", description: "AI generates personalized onboarding guides for new team members.", icon: 'Projector', category: "Collaborative & Sharing" },
    { id: "ai-powered-who-should-review-this-suggestion", name: "AI Code Reviewer Suggestion", description: "AI suggests optimal code reviewers for a pull request.", icon: 'Bot', category: "Collaborative & Sharing" },
    { id: "generate-project-brief-command", name: "Generate Project Brief", description: "AI generates a comprehensive project brief from existing documentation.", icon: 'FileText', category: "Collaborative & Sharing" },
    { id: "ai-driven-team-communication-optimization", name: "AI Team Communication Optimization", description: "AI analyzes team communication patterns and suggests improvements.", icon: 'Users', category: "Collaborative & Sharing" },
    { id: "automated-feedback-aggregation-and-summarization", name: "Automated Feedback Aggregation", description: "AI aggregates feedback from various sources and provides summaries.", icon: 'Sparkles', category: "Collaborative & Sharing" },

    // Category 11: Advanced Generative Capabilities
    { id: "ai-image-generator", name: "AI Image Generator", description: "Generate high-quality images from a text prompt.", icon: 'Image', category: "Advanced Generative Capabilities" },
    { id: "ai-driven-creative-remix-tool", name: "AI Creative Remix Tool", description: "Select assets, then prompt AI to 'Create a short video presentation'.", icon: 'Video', category: "Advanced Generative Capabilities" },
    { id: "ai-powered-generate-a-story", name: "AI Story Generator", description: "Provide images and/or text snippets, and AI generates a narrative story.", icon: 'FileText', category: "Advanced Generative Capabilities" },
    { id: "generate-music-sound-effects", name: "Generate Music/Sound Effects", description: "Describe a mood or action, and AI generates short musical pieces or sound effects.", icon: 'Music', category: "Advanced Generative Capabilities" },
    { id: "ai-driven-generate-3d-model", name: "AI 3D Model Generator", description: "Describe an object or provide an image, and AI generates a basic 3D model.", icon: 'Box', category: "Advanced Generative Capabilities" },
    { id: "automated-generate-game-assets", name: "Automated Game Asset Generation", description: "Describe game assets, and AI generates images or simple 3D models.", icon: 'Gamepad2', category: "Advanced Generative Capabilities" },
    { id: "ai-powered-generate-a-recipe", name: "AI Recipe Generator", description: "Provide a list of ingredients, and AI generates a recipe.", icon: 'CookingPot', category: "Advanced Generative Capabilities" },
    { id: "generate-a-poem-song-lyrics", name: "Generate Poem/Song Lyrics", description: "Provide a topic or mood, and AI generates a poem or song lyrics.", icon: 'FileText', category: "Advanced Generative Capabilities" },
    { id: "ai-driven-generate-a-business-plan", name: "AI Business Plan Generator", description: "Provide a business idea, and AI generates a basic business plan outline.", icon: 'Briefcase', category: "Advanced Generative Capabilities" },
    { id: "automated-generate-a-marketing-campaign", name: "Automated Marketing Campaign Generation", description: "Describe a product, and AI generates ideas for a marketing campaign.", icon: 'Sparkles', category: "Advanced Generative Capabilities" },
    { id: "ai-powered-generate-a-research-paper-outline", name: "AI Research Paper Outline Generator", description: "Provide a research topic, and AI generates a structured outline for a paper.", icon: 'FileText', category: "Advanced Generative Capabilities" },

    // Category 12: Ethical AI & User Control
    { id: "ai-driven-bias-detection", name: "AI-Driven Bias Detection", description: "AI actively scans its own generated content for potential biases.", icon: 'ShieldCheck', category: "Ethical AI & User Control" },
    { id: "user-configurable-ai-guardrails", name: "User-Configurable AI Guardrails", description: "Users can define custom ethical guidelines or content filters for AI generation.", icon: 'Lock', category: "Ethical AI & User Control" },
    { id: "explain-my-data-usage-report", name: "Explain My Data Usage Report", description: "AI provides transparent reports on how user data is used for personalization.", icon: 'FileText', category: "Ethical AI & User Control" },
    { id: "automated-ai-model-audit-trail", name: "Automated AI Model Audit Trail", description: "The Toolkit maintains a transparent log of which AI models were used for which tasks.", icon: 'GitBranch', category: "Ethical AI & User Control" },
    { id: "ai-driven-privacy-advisor-for-file-sharing", name: "AI Privacy Advisor", description: "AI advises on privacy implications before sharing files.", icon: 'Shield', category: "Ethical AI & User Control" },
    { id: "user-controlled-ai-forget-me-functionality", name: "AI 'Forget Me' Functionality", description: "Users can instruct the AI to delete specific learned preferences or interaction history.", icon: 'Trash2', category: "Ethical AI & User Control" },
    { id: "ai-powered-content-authenticity-verification", name: "AI Content Authenticity Verification", description: "AI can verify the authenticity or origin of digital content.", icon: 'ShieldCheck', category: "Ethical AI & User Control" },
    { id: "ai-driven-digital-wellbeing-monitoring", name: "AI Digital Wellbeing Monitoring", description: "AI monitors user interaction patterns and suggests breaks or alternative activities.", icon: 'HeartPulse', category: "Ethical AI & User Control" },
    { id: "automated-ai-model-explainability-reports", name: "AI Model Explainability Reports", description: "AI generates reports explaining the internal workings of its models.", icon: 'HelpCircle', category: "Ethical AI & User Control" },
    { id: "ai-powered-ethical-dilemma-simulator", name: "AI Ethical Dilemma Simulator", description: "AI can simulate ethical dilemmas related to its own use cases.", icon: 'Bug', category: "Ethical AI & User Control" },
    
    // Enterprise & DevOps
    { id: "ai-incident-post-mortem-generator", name: "AI Incident Post-mortem Generator", description: "Input incident details, get a blame-free post-mortem.", icon: 'FileText', category: "Enterprise & DevOps" },
    { id: "terraform-iac-generator", name: "Terraform/IaC Generator", description: "Describe infrastructure, get HCL code.", icon: 'Cloud', category: "Enterprise & DevOps" },
    { id: "ci-cd-pipeline-optimizer", name: "CI/CD Pipeline Optimizer", description: "Paste a CI/CD config, visualize it, and get optimization suggestions.", icon: 'Cloud', category: "Enterprise & DevOps" },
    { id: "k8s-manifest-generator", name: "K8s Manifest Generator", description: "Describe a service, get Kubernetes YAML.", icon: 'Container', category: "Enterprise & DevOps" },
    { id: "cloud-architecture-diagram-generator", name: "Cloud Architecture Diagram Generator", description: "Describe architecture, get Mermaid.js diagram for cloud services.", icon: 'Network', category: "Enterprise & DevOps" },
    { id: "log-anomaly-detection", name: "Log Anomaly Detection", description: "Paste log files, AI identifies unusual patterns.", icon: 'Bug', category: "Enterprise & DevOps" },
    { id: "slo-calculator-reporter", name: "SLA/SLO Calculator & Reporter", description: "Input metrics, generate SLO reports.", icon: 'BarChart2', category: "Enterprise & DevOps" },
    { id: "on-call-schedule-generator", name: "On-Call Schedule Generator", description: "Input team constraints, generate a fair on-call rotation.", icon: 'Bell', category: "Enterprise & DevOps" },
    { id: "disaster-recovery-plan-generator", name: "Disaster Recovery Plan Generator", description: "Describe system, AI drafts a DR plan.", icon: 'ShieldCheck', category: "Enterprise & DevOps" },
    { id: "cloud-cost-anomaly-detection", name: "Cloud Cost Anomaly Detection", description: "Paste billing data, find unexpected cost spikes.", icon: 'TrendingDown', category: "Enterprise & DevOps" },

    // Advanced Code & Architecture
    { id: "microservice-decomposer", name: "Microservice Decomposer", description: "Paste a monolith's code, AI suggests how to break it into microservices.", icon: 'Group', category: "Advanced Code & Architecture" },
    { id: "api-contract-tester", name: "API Contract Tester", description: "Provide two API specs, AI checks for breaking changes.", icon: 'FileDiff', category: "Advanced Code & Architecture" },
    { id: "code-to-architectural-pattern-identifier", name: "Architectural Pattern Identifier", description: "Analyze code, identify patterns like Singleton, Factory, etc.", icon: 'Group', category: "Advanced Code & Architecture" },
    { id: "system-design-interview-simulator", name: "System Design Interview Simulator", description: "Get a system design prompt and interact with an AI interviewer.", icon: 'GraduationCap', category: "Advanced Code & Architecture" },
    { id: "code-smell-refactorer", name: "Code Smell Refactorer", description: "Automatically refactors common code smells (long methods, large classes).", icon: 'Sparkles', category: "Advanced Code & Architecture" },
    { id: "legacy-code-modernizer", name: "Legacy Code Modernizer", description: "Advanced version of migrator for specific patterns (e.g., jQuery to React).", icon: 'ArrowRightLeft', category: "Advanced Code & Architecture" },
    { id: "graphql-schema-generator", name: "GraphQL Schema Generator", description: "Describe data entities, get a GraphQL schema.", icon: 'Database', category: "Advanced Code & Architecture" },
    { id: "ai-powered-ast-code-search", name: "AST-Based Code Search", description: "Search code by structure, not just text (e.g., 'find all fetch calls').", icon: 'SearchCode', category: "Advanced Code & Architecture" },
    { id: "event-storming-assistant", name: "Event Storming Assistant", description: "Describe a business process, AI suggests domain events, commands, and aggregates.", icon: 'Workflow', category: "Advanced Code & Architecture" },
    { id: "e2e-test-script-generator", name: "E2E Test Script Generator", description: "Describe a user flow, AI generates Playwright/Cypress code.", icon: 'Beaker', category: "Advanced Code & Architecture" },

    // Business & Product
    { id: "competitive-analysis-generator", name: "Competitive Analysis Generator", description: "Input competitor URLs, get an AI-generated analysis.", icon: 'Store', category: "Business & Product" },
    { id: "user-persona-generator", name: "User Persona Generator", description: "Describe a target audience, AI creates detailed user personas.", icon: 'User', category: "Business & Product" },
    { id: "ab-test-hypothesis-generator", name: "A/B Test Hypothesis Generator", description: "Input a feature, AI suggests A/B test ideas.", icon: 'Beaker', category: "Business & Product" },
    { id: "product-roadmap-generator", name: "Product Roadmap Generator", description: "Input goals and features, AI creates a visual roadmap.", icon: 'Map', category: "Business & Product" },
    { id: "swot-analysis-generator", name: "SWOT Analysis Generator", description: "Describe a product, AI generates a SWOT analysis.", icon: 'BarChart', category: "Business & Product" },
    { id: "press-release-writer", name: "Press Release Writer", description: "Input launch details, AI writes a professional press release.", icon: 'Newspaper', category: "Business & Product" },
    { id: "investor-pitch-deck-outline", name: "Investor Pitch Deck Outline", description: "Input a business idea, AI creates a pitch deck structure.", icon: 'Presentation', category: "Business & Product" },
    { id: "market-sizing-estimator", name: "Market Sizing Estimator", description: "Describe a product, AI provides a rough TAM/SAM/SOM estimation.", icon: 'BarChart3', category: "Business & Product" },
    { id: "gtm-strategy-brainstormer", name: "GTM Strategy Brainstormer", description: "Input a product, AI brainstorms go-to-market strategies.", icon: 'Sparkles', category: "Business & Product" },
    { id: "feature-prioritization-assistant", name: "Feature Prioritization Assistant", description: "Input features with parameters, AI scores and ranks them (RICE/ICE).", icon: 'ListOrdered', category: "Business & Product" },

    // Content & Creative
    { id: "video-script-writer", name: "Video Script Writer", description: "Describe a topic, AI writes a script for a YouTube video.", icon: 'Video', category: "Content & Creative" },
    { id: "podcast-episode-planner", name: "Podcast Episode Planner", description: "Input a topic, AI outlines segments, talking points, and questions.", icon: 'Mic', category: "Content & Creative" },
    { id: "fictional-world-builder", name: "Fictional World Builder", description: "AI assistant for creating cohesive fictional worlds (maps, history, cultures).", icon: 'Map', category: "Content & Creative" },
    { id: "game-design-document-drafter", name: "GDD Drafter", description: "Input a game concept, AI drafts a Game Design Document outline.", icon: 'FileText', category: "Content & Creative" },
    { id: "ad-copy-generator", name: "Ad Copy Generator", description: "Generate ad copy variations for Google, Facebook, etc.", icon: 'Newspaper', category: "Content & Creative" },
    { id: "seo-content-brief-generator", name: "SEO Content Brief Generator", description: "Input a keyword, AI creates a detailed brief for a writer.", icon: 'FileText', category: "Content & Creative" },
    { id: "brand-voice-tone-analyzer", name: "Brand Voice & Tone Analyzer", description: "Paste text, AI analyzes its voice and tone.", icon: 'Sparkles', category: "Content & Creative" },
    { id: "legal-document-summarizer", name: "Legal Document Summarizer", description: "Simplify complex legal text (e.g., Privacy Policy).", icon: 'FileText', category: "Content & Creative" },
    { id: "resume-cover-letter-builder", name: "Resume & Cover Letter Builder", description: "Input experience, AI crafts a resume and tailored cover letter.", icon: 'FileText', category: "Content & Creative" },
    { id: "speech-writer", name: "Speech Writer", description: "Input a topic and occasion, AI writes a compelling speech.", icon: 'Mic', category: "Content & Creative" },

    // Data Science & Analysis
    { id: "jupyter-notebook-auto-documenter", name: "Jupyter Notebook Auto-Documenter", description: "AI adds markdown explanations to a Jupyter notebook.", icon: 'Microscope', category: "Data Science & Analysis" },
    { id: "sql-optimizer", name: "SQL Query Optimizer", description: "Paste a slow SQL query, AI suggests optimizations.", icon: 'Database', category: "Data Science & Analysis" },
    { id: "data-exploration-assistant", name: "Data Exploration Assistant (Pandas)", description: "Describe a dataframe, AI suggests Pandas operations to perform.", icon: 'Microscope', category: "Data Science & Analysis" },
    { id: "statistical-model-suggester", name: "Statistical Model Suggester", description: "Describe a dataset and goal, AI suggests appropriate statistical models.", icon: 'Beaker', category: "Data Science & Analysis" },
    { id: "sentiment-trend-analysis", name: "Sentiment Trend Analysis", description: "Input time-series text data, AI analyzes sentiment trends.", icon: 'BarChart', category: "Data Science & Analysis" },
    { id: "data-cleaning-script-generator", name: "Data Cleaning Script Generator", description: "Describe a messy dataset, AI writes a Python script to clean it.", icon: 'Code', category: "Data Science & Analysis" },
    { id: "feature-engineering-suggester", name: "Feature Engineering Suggester", description: "Describe a machine learning problem, AI suggests potential features to engineer.", icon: 'Sparkles', category: "Data Science & Analysis" },
    { id: "model-evaluation-report-generator", name: "Model Evaluation Report Generator", description: "Input model metrics, AI writes an evaluation report.", icon: 'FileText', category: "Data Science & Analysis" },
    { id: "ai-ethics-statement-drafter", name: "AI Ethics Statement Drafter", description: "Describe an AI project, AI drafts an ethics and transparency statement.", icon: 'ShieldCheck', category: "Data Science & Analysis" },
    { id: "synthetic-data-generator", name: "Synthetic Data Generator", description: "Describe a schema, AI generates realistic but fake data for testing.", icon: 'FileJson', category: "Data Science & Analysis" },
    { id: 'settings', name: 'Settings', description: 'Configure application settings.', icon: 'Settings', category: 'System & Integration' },
    { id: 'project-explorer', name: 'Project Explorer', description: 'Explore your project files.', icon: 'FolderTree', category: 'File Management & Organization' },

];

export const ALL_FEATURE_IDS = RAW_FEATURES.map(f => f.id);
