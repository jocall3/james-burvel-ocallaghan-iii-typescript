import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';

// Re-import necessary contexts from the Dashboard root.
// This assumes Dashboard.tsx is located at '../../Dashboard'.
import { UserContext, GlobalConfigContext } from '../../Dashboard';

// This function simulates the code generation logic and is specific to this component.
// In a full application, this would likely be an API call to a backend service.
interface CodeGenerationConfig {
    inputFileContent: string;
    targetLines: number;
    targetLanguage: string;
    complexityLevel: string;
    randomSeed?: string;
    outputFileName: string;
}

const mockGenerateCodeStream = async (config: CodeGenerationConfig): Promise<string> => {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // --- START MOCK CODE GENERATION LOGIC ---
    // This is a simplified mock. A real generative engine would be vastly more complex.
    const { targetLines, targetLanguage, complexityLevel, randomSeed, inputFileContent } = config;
    let generatedCodeLines: string[] = [];
    const maxLinesToAttempt = targetLines + 500; // Generate a bit more to ensure targetLines is met with formatting
    const effectiveSeed = randomSeed || Date.now().toString();

    // A simple PRNG using the seed for 'randomness'
    let seedNum = effectiveSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prng = () => {
        seedNum = (seedNum * 9301 + 49297) % 233280;
        return seedNum / 233280;
    };

    const keywordsJS = ['function', 'const', 'let', 'class', 'interface', 'import', 'export', 'if', 'else', 'for', 'while', 'return', 'async', 'await', 'try', 'catch', 'debugger', 'enum', 'type', 'switch', 'case', 'default', 'break', 'continue'];
    const typesJS = ['string', 'number', 'boolean', 'any', 'void', 'Promise', 'Array', 'Record', 'Map', 'Set', 'symbol', 'bigint', 'unknown', 'null', 'undefined', 'object'];
    const opsJS = ['+', '-', '*', '/', '%', '===', '!==', '&&', '||', '=', '+=', '++', '--', '>>', '<<', '&', '|', '^', '~', '??', '?.', '=>', 'new'];
    const methodsJS = ['.map', '.filter', '.reduce', '.forEach', '.slice', '.join', '.split', '.push', '.pop', '.shift', '.unshift', '.sort', '.reverse', '.find', '.findIndex', '.includes', '.fill', '.concat', '.some', '.every', '.bind', '.call', '.apply', '.valueOf'];

    const keywordsPy = ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'return', 'async', 'await', 'try', 'except', 'finally', 'with', 'yield', 'pass', 'break', 'continue', 'lambda', 'global', 'nonlocal', 'assert'];
    const typesPy = ['str', 'int', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'bytes', 'complex', 'None', 'object'];
    const opsPy = ['+', '-', '*', '/', '%', '//', '**', '==', '!=', 'and', 'or', 'not', '=', '+=', '-=', '*=', '/=', '<', '>', '<=', '>=', 'is', 'is not', 'in', 'not in'];
    const methodsPy = ['.append', '.pop', '.insert', '.remove', '.sort', '.reverse', '.count', '.index', '.get', '.keys', '.values', '.items', '.update', '.clear', '.copy', '.join', '.split', '.strip', '.lower', '.upper', '.replace', '.find', '.encode', '.decode'];

    const keywordsCS = ['public', 'private', 'protected', 'internal', 'class', 'interface', 'namespace', 'using', 'if', 'else', 'for', 'foreach', 'while', 'return', 'async', 'await', 'try', 'catch', 'finally', 'virtual', 'override', 'new', 'static', 'sealed', 'struct', 'enum', 'delegate', 'event', 'ref', 'out', 'this', 'base', 'where', 'get', 'set'];
    const typesCS = ['string', 'int', 'float', 'double', 'bool', 'void', 'Task', 'List', 'Dictionary', 'byte', 'short', 'long', 'decimal', 'char', 'object', 'var', 'dynamic'];
    const opsCS = ['+', '-', '*', '/', '%', '==', '!=', '&&', '||', '=', '+=', '++', '--', '>>', '<<', '&', '|', '^', '~', '??', '->', 'as', 'is', 'new'];
    const methodsCS = ['.Add', '.Remove', '.Contains', '.IndexOf', '.Sort', '.Reverse', '.ToArray', '.ToList', '.FirstOrDefault', '.Select', '.Where', '.Max', '.Min', '.Average', '.Count', '.ToString', '.Equals', '.GetType', '.Clear', '.CopyTo'];

    const identifierParts = ['data', 'service', 'handler', 'processor', 'manager', 'entity', 'model', 'utility', 'component', 'module', 'system', 'core', 'agent', 'nexus', 'quantum', 'bio', 'metaverse', 'flux', 'logic', 'operation', 'config', 'state', 'engine', 'generator', 'synthesizer', 'transcoder', 'algorithm', 'function', 'method', 'value', 'result', 'output', 'input', 'buffer', 'stream', 'pipeline', 'adapter', 'factory', 'builder', 'observer', 'strategy', 'repository', 'gateway', 'telemetry', 'orchestrator', 'optimizer', 'compiler', 'lexer', 'parser', 'transformer', 'executor', 'scheduler', 'resolver', 'mapper', 'aggregator', 'validator', 'serializer', 'deserializer', 'encoder', 'decoder', 'connector', 'integrator', 'dispatcher', 'emitter', 'listener', 'subscriber', 'publisher', 'notifier', 'alerter', 'monitor', 'reporter', 'analyzer', 'debugger', 'logger', 'tracer', 'profiler', 'recorder', 'player', 'renderer', 'viewer', 'editor', 'debugger', 'compiler', 'interpreter', 'runtime', 'virtualmachine', 'container', 'orchestrator', 'loadbalancer', 'router', 'firewall', 'security', 'vault', 'keyring', 'wallet', 'blockchain', 'ledger', 'smartcontract', 'dao', 'governance', 'protocol', 'network', 'node', 'peer', 'channel', 'message', 'event', 'command', 'query', 'response', 'request', 'payload', 'header', 'body', 'cookie', 'session', 'token', 'credential', 'certificate', 'signature', 'encryption', 'decryption', 'hashing', 'encoding', 'decoding', 'serialization', 'deserialization', 'compression', 'decompression', 'streaming', 'batching', 'polling', 'pushing', 'realtime', 'asynchronous', 'synchronous', 'distributed', 'concurrent', 'parallel', 'faulttolerant', 'resilient', 'scalable', 'performant', 'secure', 'reliable', 'available', 'maintainable', 'testable', 'deployable', 'observable', 'traceable', 'loggable', 'auditable', 'compliant', 'governed', 'ethical', 'sustainable', 'transparent', 'open', 'closed', 'hybrid', 'cloud', 'edge', 'onpremise', 'serverless', 'microservices', 'monolith', 'api', 'sdk', 'cli', 'gui', 'ux', 'ui', 'frontend', 'backend', 'fullstack', 'devops', 'gitops', 'finops', 'mlops', 'dataops', 'securityops', 'aiops', 'bizops', 'quantops', 'bioops', 'metaops', 'design', 'architecture', 'pattern', 'principle', 'practice', 'standard', 'guideline', 'convention', 'bestpractice', 'anti-pattern', 'refactor', 'optimize', 'debug', 'test', 'deploy', 'monitor', 'alert', 'scale', 'secure', 'govern', 'manage', 'orchestrate', 'automate', 'innovate', 'create', 'build', 'engineer', 'develop', 'program', 'code', 'script', 'query', 'configure', 'setup', 'install', 'update', 'upgrade', 'downgrade', 'rollback', 'revert', 'commit', 'push', 'pull', 'merge', 'rebase', 'stash', 'checkout', 'branch', 'tag', 'release', 'deploy', 'rollback', 'hotfix', 'patch', 'feature', 'bugfix', 'enhancement', 'epic', 'story', 'task', 'subtask', 'issue', 'ticket', 'defect', 'vulnerability', 'exploit', 'attack', 'defense', 'mitigation', 'remediation', 'prevention', 'detection', 'response', 'recovery', 'forensics', 'audit', 'compliance', 'governance', 'risk', 'control', 'policy', 'procedure', 'standard', 'regulation', 'law', 'ethics', 'morals', 'values', 'culture', 'team', 'organization', 'project', 'program', 'portfolio', 'strategy', 'tactic', 'objective', 'keyresult', 'initiative', 'goal', 'vision', 'mission', 'purpose', 'valueproposition', 'businessmodel', 'revenue', 'cost', 'profit', 'margin', 'growth', 'market', 'customer', 'user', 'client', 'partner', 'stakeholder', 'vendor', 'supplier', 'competitor', 'industry', 'sector', 'segment', 'niche', 'trend', 'forecast', 'prediction', 'analytics', 'reporting', 'dashboard', 'visualization', 'metric', 'indicator', 'kpi', 'sla', 'slo', 'sli', 'alert', 'event', 'log', 'trace', 'span', 'transaction', 'request', 'response', 'message', 'queue', 'topic', 'stream', 'dataflow', 'pipeline', 'workflow', 'process', 'task', 'job', 'schedule', 'trigger', 'agent', 'bot', 'robot', 'automation', 'intelligence', 'learning', 'adaptation', 'evolution', 'transformation', 'innovation', 'disruption', 'paradigm', 'shift', 'future', 'vision', 'roadmap', 'strategy', 'tactic', 'execution', 'delivery', 'outcome', 'impact', 'value', 'benefit', 'cost', 'risk', 'issue', 'dependency', 'assumption', 'constraint', 'resource', 'budget', 'time', 'scope', 'quality', 'security', 'performance', 'scalability', 'reliability', 'maintainability', 'testability', 'deployability', 'usability', 'accessibility', 'localization', 'internationalization', 'documentation', 'training', 'support', 'feedback', 'iteration', 'agile', 'scrum', 'kanban', 'lean', 'devops', 'sre', 'finops', 'mlops', 'dataops', 'securityops', 'aiops', 'bizops', 'quantops', 'bioops', 'metaops'];

    const pickRandom = (arr: string[]) => arr[Math.floor(prng() * arr.length)];
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const generateIdentifier = (capitalized = false) => {
        let id = pickRandom(identifierParts);
        if (prng() < 0.3) id += capitalize(pickRandom(identifierParts));
        if (prng() < 0.5) id += Math.floor(prng() * 100);
        return capitalized ? capitalize(id) : id;
    };
    const generateFunctionName = () => generateIdentifier(prng() > 0.3) + (prng() > 0.5 ? 'Async' : '');
    const generateClassName = () => generateIdentifier(true);

    const fileExtensionToLangMap = {
        '.js': 'typescript', '.ts': 'typescript', '.jsx': 'typescript', '.tsx': 'typescript',
        '.py': 'python',
        '.cs': 'csharp',
    };

    const determineInitialLanguage = () => {
        const inputExt = config.outputFileName.split('.').pop();
        if (inputExt && fileExtensionToLangMap[`.${inputExt}`]) {
            return fileExtensionToLangMap[`.${inputExt}`];
        }
        return targetLanguage === 'random' ? pickRandom(['typescript', 'python', 'csharp']) : targetLanguage;
    };

    let currentActiveLanguage = determineInitialLanguage();

    const generateLineForLang = (lang: string, indent: number) => {
        const indentSize = lang === 'python' ? 4 : 2;
        const indentStr = ' '.repeat(indent * indentSize);
        const rand = prng();

        if (lang === 'typescript') {
            if (rand < 0.15) return `${indentStr}${pickRandom(['import', 'export', 'declare', 'type'])} ${generateClassName()} ${prng() > 0.5 ? `from '${generateIdentifier().toLowerCase()}/${generateIdentifier().toLowerCase()}'` : ''}${prng() < 0.3 ? ';' : ''}`;
            if (rand < 0.35) return `${indentStr}${pickRandom(['const', 'let', 'var'])} ${generateIdentifier()}: ${pickRandom(typesJS)} = ${prng() > 0.5 ? Math.floor(prng() * 1000) : `'${generateIdentifier()}${Math.floor(prng()*10)}'`}${prng() < 0.7 ? ';' : ''}`;
            if (rand < 0.55) return `${indentStr}${generateFunctionName()}(${generateIdentifier()} ${pickRandom(opsJS)} ${Math.floor(prng() * 100)})${prng() < 0.7 ? ';' : ''}`;
            if (rand < 0.65) return `${indentStr}if (${generateIdentifier()} ${pickRandom(['===', '!==', '>', '<', '>=', '<='])} ${Math.floor(prng() * 100)}) {`;
            if (rand < 0.75) return `${indentStr}return ${generateIdentifier()}${pickRandom(methodsJS)}(item => item.${generateIdentifier()})${prng() < 0.7 ? ';' : ''}`;
            if (rand < 0.85) return `${indentStr}class ${generateClassName()} ${prng() > 0.5 ? `extends ${generateClassName()}` : ''} {`;
            if (rand < 0.95) return `${indentStr}// ${pickRandom(['Process', 'Optimize', 'Validate', 'Compute', 'Transform', 'Aggregate', 'Dispatch'])} ${generateIdentifier()}`;
            return `${indentStr}console.log('${generateIdentifier()} debug message: ${Math.floor(prng() * 1000)}')${prng() < 0.7 ? ';' : ''}`;
        } else if (lang === 'python') {
            if (rand < 0.15) return `${indentStr}${pickRandom(['import', 'from'])} ${generateIdentifier().toLowerCase()} ${prng() > 0.5 ? 'as ' + generateIdentifier() : ''}`;
            if (rand < 0.35) return `${indentStr}${generateIdentifier()} = ${prng() > 0.5 ? Math.floor(prng() * 1000) : `'${generateIdentifier()}${Math.floor(prng()*10)}'`}`;
            if (rand < 0.55) return `${indentStr}${generateFunctionName()}(${generateIdentifier()}, ${generateIdentifier()})`;
            if (rand < 0.65) return `${indentStr}if ${generateIdentifier()} ${pickRandom(['==', '!=', '>', '<', '>=', '<='])} ${Math.floor(prng() * 100)}:`;
            if (rand < 0.75) return `${indentStr}return [item.${generateIdentifier()} for item in ${generateIdentifier()}]`;
            if (rand < 0.85) return `${indentStr}class ${generateClassName()}(${prng() > 0.5 ? `${generateClassName()}` : 'object'}):`;
            if (rand < 0.95) return `${indentStr}# ${pickRandom(['Handle', 'Aggregate', 'Transform', 'Predict', 'Execute', 'Log'])} ${generateIdentifier()}`;
            return `${indentStr}print(f'${generateIdentifier()} status: {${generateIdentifier()}}')`;
        } else if (lang === 'csharp') {
            if (rand < 0.15) return `${indentStr}using ${generateIdentifier(true)}.${generateIdentifier(true)};`;
            if (rand < 0.35) return `${indentStr}${pickRandom(['public', 'private', 'internal'])} ${pickRandom(typesCS)} ${generateIdentifier(true)} = ${prng() > 0.5 ? Math.floor(prng() * 1000) : `"${generateIdentifier()}${Math.floor(prng()*10)}"`};`;
            if (rand < 0.55) return `${indentStr}${generateFunctionName()}(${generateIdentifier(true)});`;
            if (rand < 0.65) return `${indentStr}if (${generateIdentifier(true)} ${pickRandom(['==', '!=', '>', '<', '>=', '<='])} ${Math.floor(prng() * 100)}) {`;
            if (rand < 0.75) return `${indentStr}return ${generateIdentifier(true)}${pickRandom(methodsCS)}(item => item.${generateIdentifier(true)});`;
            if (rand < 0.85) return `${indentStr}${pickRandom(['public', 'private', 'internal'])} class ${generateClassName()} ${prng() > 0.5 ? `: ${generateClassName()}` : ''} {`;
            if (rand < 0.95) return `${indentStr}// ${pickRandom(['Initialize', 'Execute', 'Configure', 'Log', 'Audit', 'Deploy'])} ${generateIdentifier(true)}`;
            return `${indentStr}Console.WriteLine($"${generateIdentifier(true)} output: {${generateIdentifier(true)}}");`;
        }
        return `${indentStr}/* Error: Unknown language */`;
    };

    let currentIndent = 0;
    let braceStack: string[] = [];

    generatedCodeLines.push(`// --- Code Transformed by Universal Code Engine (UCE) ---`);
    generatedCodeLines.push(`// Source: "${config.outputFileName}"`);
    generatedCodeLines.push(`// Target Lines: ${targetLines}, Language Type: ${targetLanguage}, Complexity: ${complexityLevel}`);
    generatedCodeLines.push(`// Synthesis Date: ${new Date().toISOString()}`);
    generatedCodeLines.push(`// Input Hash: ${Math.floor(prng() * 1000000000).toString(16)}`);
    generatedCodeLines.push('');

    if (inputFileContent && inputFileContent.trim().length > 0 && inputFileContent.split('\n').length < 50) {
        generatedCodeLines.push('/* Original Input Context:');
        inputFileContent.split('\n').forEach(line => generatedCodeLines.push(` * ${line.trim().length > 100 ? line.trim().substring(0, 97) + '...' : line.trim()}`));
        generatedCodeLines.push('*/');
        generatedCodeLines.push('');
    }

    while (generatedCodeLines.length < maxLinesToAttempt) {
        if (targetLanguage === 'random' && prng() < 0.03) { // Occasionally switch languages if 'random'
            currentActiveLanguage = pickRandom(['typescript', 'python', 'csharp']);
        }

        const randDecision = prng();
        if (randDecision < 0.1 && braceStack.length > 0) { // Close a block
            currentIndent = Math.max(0, currentIndent - 1);
            const lastBrace = braceStack.pop();
            if (lastBrace && (currentActiveLanguage === 'typescript' || currentActiveLanguage === 'csharp')) {
                generatedCodeLines.push(' '.repeat(currentIndent * 2) + lastBrace);
            } else if (currentActiveLanguage === 'python') {
                generatedCodeLines.push(' '.repeat(currentIndent * 4) + pickRandom(['pass', '# End block']));
            }
        } else if (randDecision < 0.25) { // Open a new block statement
            const line = generateLineForLang(currentActiveLanguage, currentIndent);
            generatedCodeLines.push(line);
            if (line.includes('{')) {
                braceStack.push('}');
                currentIndent++;
            } else if (line.endsWith(':') && currentActiveLanguage === 'python') {
                braceStack.push(''); // Python block is just indent
                currentIndent++;
            }
        } else { // Normal statement or line
            let line = generateLineForLang(currentActiveLanguage, currentIndent);
            // If the generated line implicitly started a block (e.g., class/function def)
            if (line.includes('{') && (currentActiveLanguage === 'typescript' || currentActiveLanguage === 'csharp')) {
                 braceStack.push('}');
                 currentIndent++;
            } else if (line.endsWith(':') && currentActiveLanguage === 'python') {
                 braceStack.push('');
                 currentIndent++;
            }
            generatedCodeLines.push(line);
        }

        // Add some random empty lines for readability
        if (prng() < 0.05) generatedCodeLines.push('');
    }

    // Ensure any remaining open blocks are closed for stylistic reasons
    while(braceStack.length > 0) {
        currentIndent = Math.max(0, currentIndent - 1);
        const lastBrace = braceStack.pop();
        if (lastBrace && (currentActiveLanguage === 'typescript' || currentActiveLanguage === 'csharp')) {
            generatedCodeLines.push(' '.repeat(currentIndent * 2) + lastBrace);
        } else if (currentActiveLanguage === 'python') {
            generatedCodeLines.push(' '.repeat(currentIndent * 4) + '# Implicit block close');
        }
    }

    // Ensure exactly targetLines
    return generatedCodeLines.slice(0, targetLines).join('\n');
    // --- END MOCK CODE GENERATION LOGIC ---
};


export const EngineConfigurationPanel: React.FC = () => {
    const { currentUser } = useContext(UserContext)!;
    const { getFeatureFlag } = useContext(GlobalConfigContext)!;

    const [inputFileContent, setInputFileContent] = useState<string>('');
    const [outputLines, setOutputLines] = useState<number>(1000);
    const [targetLanguage, setTargetLanguage] = useState<string>('random'); // 'random', 'typescript', 'python', 'csharp'
    const [complexityLevel, setComplexityLevel] = useState<string>('complex'); // 'simple', 'medium', 'complex', 'quantum'
    const [randomSeed, setRandomSeed] = useState<string>('');
    const [outputFileName, setOutputFileName] = useState<string>('transformed_code.ts');
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Feature flag to enable/disable the generative engine based on global config
    const isEngineEnabled = getFeatureFlag('enableGenerativeCodeEngine');

    const handleGenerateCode = useCallback(async () => {
        if (!isEngineEnabled) {
            setError('Generative Code Engine is disabled by global configuration. Please activate it.');
            return;
        }
        if (!currentUser) {
            setError('User not authenticated. Please log in to generate code.');
            return;
        }

        setError(null);
        setIsLoading(true);
        setGeneratedCode('');

        try {
            const config: CodeGenerationConfig = {
                inputFileContent,
                targetLines: Math.max(1, Math.min(outputLines, 5000)), // Limit output lines for practical reasons
                targetLanguage,
                complexityLevel,
                randomSeed,
                outputFileName,
            };
            const code = await mockGenerateCodeStream(config); // Use the mock function
            setGeneratedCode(code);
        } catch (err) {
            console.error('Error during code generation:', err);
            setError('Failed to synthesize code: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [inputFileContent, outputLines, targetLanguage, complexityLevel, randomSeed, outputFileName, currentUser, isEngineEnabled]);

    const handleDownloadCode = useCallback(() => {
        if (!generatedCode) {
            alert('No code to download. Please generate code first.');
            return;
        }
        const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = outputFileName || 'generated_code.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // Clean up memory
    }, [generatedCode, outputFileName]);

    const handleInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setInputFileContent(content);
                // Try to infer output file name from input file name
                const originalFileName = file.name;
                const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
                const extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                setOutputFileName(`${baseName}_transformed${extension}`);
                // Also try to infer language
                const detectedLang = fileExtensionToLangMap[extension.toLowerCase()];
                if (detectedLang) {
                    setTargetLanguage(detectedLang);
                } else {
                    setTargetLanguage('random'); // Fallback if extension is unknown
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="generative-code-panel p-6 bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl border border-blue-700 h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">Universal Generative Code Matrix</h3>
            <p className="text-gray-300 mb-6">
                Transform any input file into randomized functional code.
                Leverage Quantum-AI Synthesis for dynamic, unpredictable, and functionally diverse outputs.
            </p>

            {!isEngineEnabled && (
                <div className="bg-red-900/40 border border-red-700 text-red-300 p-3 rounded mb-4">
                    Generative Code Engine is currently disabled in Global Settings. Please enable it to use this feature.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col">
                    <label htmlFor="inputFile" className="block text-gray-300 text-sm font-semibold mb-2">Input File (for context/naming)</label>
                    <input
                        type="file"
                        id="inputFile"
                        onChange={handleInputFileChange}
                        className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        bg-gray-800 rounded p-2 border border-gray-700 cursor-pointer"
                        disabled={isLoading || !isEngineEnabled}
                    />
                    <textarea
                        className="w-full p-3 mt-4 bg-gray-700 border border-gray-600 rounded text-white resize-y min-h-[120px] max-h-[250px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                        placeholder="Or paste input content here (e.g., a story, design spec, existing code snippet) for contextual transformation..."
                        value={inputFileContent}
                        onChange={(e) => setInputFileContent(e.target.value)}
                        rows={6}
                        disabled={isLoading || !isEngineEnabled}
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="outputLines" className="block text-gray-300 text-sm font-semibold mb-2">Target Output Lines</label>
                        <input
                            type="number"
                            id="outputLines"
                            value={outputLines}
                            onChange={(e) => setOutputLines(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            max="5000"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading || !isEngineEnabled}
                        />
                    </div>
                    <div>
                        <label htmlFor="targetLanguage" className="block text-gray-300 text-sm font-semibold mb-2">Target Language(s)</label>
                        <select
                            id="targetLanguage"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading || !isEngineEnabled}
                        >
                            <option value="random">Random / Mixed Syntax</option>
                            <option value="typescript">TypeScript / JavaScript</option>
                            <option value="python">Python</option>
                            <option value="csharp">C#</option>
                            {/* Add more languages as the engine supports them */}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="complexityLevel" className="block text-gray-300 text-sm font-semibold mb-2">Complexity Level</label>
                        <select
                            id="complexityLevel"
                            value={complexityLevel}
                            onChange={(e) => setComplexityLevel(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading || !isEngineEnabled}
                        >
                            <option value="simple">Simple</option>
                            <option value="medium">Medium</option>
                            <option value="complex">Complex</option>
                            <option value="quantum">Quantum-AI Enhanced</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="randomSeed" className="block text-gray-300 text-sm font-semibold mb-2">Randomness Seed (Optional)</label>
                        <input
                            type="text"
                            id="randomSeed"
                            value={randomSeed}
                            onChange={(e) => setRandomSeed(e.target.value)}
                            placeholder="Leave empty for dynamic seed"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading || !isEngineEnabled}
                        />
                    </div>
                    <div>
                        <label htmlFor="outputFileName" className="block text-gray-300 text-sm font-semibold mb-2">Output File Name</label>
                        <input
                            type="text"
                            id="outputFileName"
                            value={outputFileName}
                            onChange={(e) => setOutputFileName(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading || !isEngineEnabled}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleGenerateCode}
                disabled={isLoading || !isEngineEnabled}
                className="w-full px-5 py-3 mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Synthesizing Code Stream...</span>
                    </>
                ) : (
                    <>
                        <span role="img" aria-label="magic wand">✨</span>
                        <span>Generate Universal Code</span>
                    </>
                )}
            </button>

            {error && (
                <div className="bg-red-800/60 border border-red-700 text-red-200 p-3 rounded mt-4 text-sm">
                    Error: {error}
                </div>
            )}

            {generatedCode && (
                <div className="mt-8 flex-grow flex flex-col">
                    <h4 className="text-xl font-bold mb-3 text-green-400">Transformed Code Output ({generatedCode.split('\n').length} lines)</h4>
                    <pre className="flex-grow p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-50 text-sm font-mono whitespace-pre-wrap overflow-auto">
                        {generatedCode}
                    </pre>
                    <button
                        onClick={handleDownloadCode}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg self-end disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Download {outputFileName}
                    </button>
                </div>
            )}
        </div>
    );
};