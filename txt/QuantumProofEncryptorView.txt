import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// region: Core Interfaces and Types
interface QuantumScheme {
  schemeId: string;
  publicKey: string;
  privateKeyInstructions: string;
  estimatedBitsOfSecurity: number;
  algorithm: string;
  parameters: { [key: string]: any };
  generationDate: string;
}

export interface PQCAlgorithmDefinition {
  id: string;
  name: string;
  category: 'KEM' | 'Signature' | 'Symmetric'; // Key Encapsulation Mechanism, Digital Signature
  description: string;
  securityLevels: { label: string; bits: number; params: { [key: string]: any } }[];
  isRecommended: boolean;
  status: 'standard' | 'candidate' | 'experimental';
}

export interface CryptoKey {
  keyId: string;
  algorithm: string;
  securityLevel: string;
  keyType: 'public' | 'private' | 'symmetric';
  creationDate: string;
  expirationDate?: string;
  publicKeyMaterial?: string; // Base64 or Hex encoded
  privateKeyEncrypted?: string; // Encrypted with a master key or passphrase
  symmetricKeyMaterial?: string; // Encrypted symmetric key
  metadata?: { [key: string]: any };
  isRevoked?: boolean;
}

export interface EncryptionResult {
  ciphertext: string; // Base64 encoded
  ephemeralPublicKey?: string; // For KEMs
  algorithm: string;
  keyIdUsed: string;
  iv?: string; // Initialization Vector, Base64
  tag?: string; // Authentication Tag for AEAD, Base64
  encryptedFileSize?: number;
  originalFileName?: string;
  signature?: string; // If signed during encryption
}

export interface DecryptionResult {
  plaintext: string; // Base64 decoded
  algorithm: string;
  keyIdUsed: string;
  decryptedFileSize?: number;
  verificationStatus?: 'verified' | 'unverified' | 'failed'; // For signed data
  signatureKeyId?: string; // Key used for signature verification
}

export interface SignatureResult {
  signature: string; // Base64 encoded
  algorithm: string;
  keyIdUsed: string;
  signingDate: string;
}

export interface VerificationResult {
  isVerified: boolean;
  algorithm: string;
  keyIdUsed: string;
  verificationDate: string;
  messageHash?: string; // Hash of the message used for verification
  signatureHash?: string; // Hash of the signature
}

export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  eventType: 'key_gen' | 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'key_import' | 'key_export' | 'scheme_gen' | 'error' | 'warning';
  details: string;
  relatedKeyId?: string;
  relatedSchemeId?: string;
  userId?: string; // In a multi-user system
  status: 'success' | 'failure';
}

export interface ApplicationSettings {
  defaultKEM: string;
  defaultSignature: string;
  defaultSymmetric: string;
  logRetentionDays: number;
  autoKeyRotationEnabled: boolean;
  masterKeyHash?: string; // Placeholder for a master key derivation
  apiEndpoint: string;
}

// endregion: Core Interfaces and Types

// region: Mock Data and Constants
export const PQC_ALGORITHMS: PQCAlgorithmDefinition[] = [
  {
    id: 'kyber',
    name: 'Kyber (KEM)',
    category: 'KEM',
    description: 'A lattice-based key encapsulation mechanism selected by NIST for standardization. Efficient and robust.',
    securityLevels: [
      { label: 'Kyber512', bits: 128, params: { k: 2, n: 256, q: 3329, eta1: 3, du: 10, dv: 4 } },
      { label: 'Kyber768', bits: 192, params: { k: 3, n: 256, q: 3329, eta1: 2, du: 10, dv: 4 } },
      { label: 'Kyber1024', bits: 256, params: { k: 4, n: 256, q: 3329, eta1: 2, du: 11, dv: 5 } },
    ],
    isRecommended: true,
    status: 'standard',
  },
  {
    id: 'dilithium',
    name: 'Dilithium (Signature)',
    category: 'Signature',
    description: 'A lattice-based digital signature algorithm selected by NIST for standardization. Strong security with efficient signing/verification.',
    securityLevels: [
      { label: 'Dilithium2', bits: 128, params: { k: 4, l: 4, eta: 2, beta: 78 } },
      { label: 'Dilithium3', bits: 192, params: { k: 6, l: 5, eta: 4, beta: 196 } },
      { label: 'Dilithium5', bits: 256, params: { k: 8, l: 7, eta: 2, beta: 245 } },
    ],
    isRecommended: true,
    status: 'standard',
  },
  {
    id: 'falcon',
    name: 'Falcon (Signature)',
    category: 'Signature',
    description: 'A lattice-based digital signature scheme known for its small signature sizes and strong security proofs.',
    securityLevels: [
      { label: 'Falcon512', bits: 128, params: { n: 512 } },
      { label: 'Falcon1024', bits: 256, params: { n: 1024 } },
    ],
    isRecommended: true,
    status: 'standard',
  },
  {
    id: 'sphincs+',
    name: 'SPHINCS+ (Signature)',
    category: 'Signature',
    description: 'A hash-based signature scheme. While larger key/signature sizes, it offers very strong security guarantees even against quantum computers.',
    securityLevels: [
      { label: 'SPHINCS+-128f', bits: 128, params: { n: 16, h: 64, d: 8, k: 14, w: 16 } },
      { label: 'SPHINCS+-256f', bits: 256, params: { n: 32, h: 68, d: 17, k: 14, w: 16 } },
    ],
    isRecommended: false, // Due to larger sizes
    status: 'standard',
  },
  {
    id: 'aes-256-gcm',
    name: 'AES-256-GCM',
    category: 'Symmetric',
    description: 'Advanced Encryption Standard with Galois/Counter Mode. Often used for symmetric data encryption after a KEM exchange.',
    securityLevels: [
      { label: 'AES-256', bits: 256, params: {} },
    ],
    isRecommended: true,
    status: 'standard',
  },
  {
    id: 'pqc-hybrid',
    name: 'PQC Hybrid (KEM)',
    category: 'KEM',
    description: 'Combines a classical KEM (e.g., ECDH) with a PQC KEM (e.g., Kyber) for added resilience, providing a fallback if PQC is broken.',
    securityLevels: [
      { label: 'Kyber768/X25519', bits: 192, params: { pqc: 'Kyber768', classic: 'X25519' } },
    ],
    isRecommended: true,
    status: 'experimental',
  }
];

// Helper to generate unique IDs
const generateUniqueId = (prefix: string = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock API utility
const mockApiCall = <T>(data: T, delay: number = 1500, success: boolean = true): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject(new Error('Mock API Error'));
      }
    }, delay);
  });
};
// endregion: Mock Data and Constants

// region: Global State Context
interface GlobalAppContextType {
  keys: CryptoKey[];
  setKeys: React.Dispatch<React.SetStateAction<CryptoKey[]>>;
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: AuditLogEntry) => void;
  settings: ApplicationSettings;
  setSettings: React.Dispatch<React.SetStateAction<ApplicationSettings>>;
  activeSchemes: QuantumScheme[];
  setActiveSchemes: React.Dispatch<React.SetStateAction<QuantumScheme[]>>;
  notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
}

const GlobalAppContext = createContext<GlobalAppContextType | undefined>(undefined);

export const useGlobalAppContext = () => {
  const context = useContext(GlobalAppContext);
  if (!context) {
    throw new Error('useGlobalAppContext must be used within a GlobalAppProvider');
  }
  return context;
};

export const GlobalAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<CryptoKey[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeSchemes, setActiveSchemes] = useState<QuantumScheme[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);
  const [settings, setSettings] = useState<ApplicationSettings>({
    defaultKEM: 'kyber',
    defaultSignature: 'dilithium',
    defaultSymmetric: 'aes-256-gcm',
    logRetentionDays: 90,
    autoKeyRotationEnabled: false,
    apiEndpoint: '/api/v1/pqc', // Placeholder
  });

  const addAuditLog = useCallback((entry: AuditLogEntry) => {
    setAuditLogs(prev => [
      { ...entry, logId: generateUniqueId('log'), timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = generateUniqueId('notif');
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000); // Auto-dismiss after 5 seconds
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  useEffect(() => {
    // Simulate loading initial data
    mockApiCall<CryptoKey[]>([], 500)
      .then(initialKeys => {
        setKeys(initialKeys);
        addAuditLog({ eventType: 'info', details: 'Application initialized and ready.', status: 'success' });
      })
      .catch(error => {
        addAuditLog({ eventType: 'error', details: `Failed to load initial keys: ${error.message}`, status: 'failure' });
        addNotification(`Failed to load initial data: ${error.message}`, 'error');
      });
  }, [addAuditLog, addNotification]);

  const contextValue = {
    keys,
    setKeys,
    auditLogs,
    addAuditLog,
    settings,
    setSettings,
    activeSchemes,
    setActiveSchemes,
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <GlobalAppContext.Provider value={contextValue}>
      {children}
    </GlobalAppContext.Provider>
  );
};
// endregion: Global State Context

// region: Utility Components
export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-500"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-600"></div>
  </div>
);

export const NotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useGlobalAppContext();

  const getNotificationStyles = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'info': return 'bg-blue-600';
      case 'success': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`p-3 rounded-lg shadow-lg text-white flex items-center justify-between ${getNotificationStyles(notif.type)}`}
        >
          <span>{notif.message}</span>
          <button onClick={() => removeNotification(notif.id)} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export const KeySelector: React.FC<{
  selectedKeyId: string | null;
  onSelectKey: (keyId: string) => void;
  filterType?: 'public' | 'private' | 'symmetric' | 'all';
  filterAlgorithm?: string; // e.g., 'kyber', 'dilithium'
  label: string;
}> = ({ selectedKeyId, onSelectKey, filterType = 'all', filterAlgorithm, label }) => {
  const { keys } = useGlobalAppContext();

  const filteredKeys = keys.filter(key => {
    const typeMatch = filterType === 'all' || key.keyType === filterType;
    const algoMatch = !filterAlgorithm || key.algorithm === filterAlgorithm;
    return typeMatch && algoMatch && !key.isRevoked;
  });

  return (
    <div className="mb-4">
      <label htmlFor="key-select" className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        id="key-select"
        className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
        value={selectedKeyId || ''}
        onChange={e => onSelectKey(e.target.value)}
      >
        <option value="">-- Select a Key --</option>
        {filteredKeys.map(key => (
          <option key={key.keyId} value={key.keyId}>
            {key.keyId} ({key.algorithm} - {key.securityLevel} {key.keyType.charAt(0).toUpperCase() + key.keyType.slice(1)})
          </option>
        ))}
      </select>
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

// endregion: Utility Components

// region: Feature Components

export const SchemeGenerationPanel: React.FC<{ initialDataSample: string }> = ({ initialDataSample }) => {
  const { addAuditLog, addNotification, setActiveSchemes } = useGlobalAppContext();
  const [dataSample, setDataSample] = useState(initialDataSample);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuantumScheme | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(PQC_ALGORITHMS.find(a => a.category === 'KEM' && a.isRecommended)?.id || 'kyber');
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState<string>('');

  useEffect(() => {
    const algo = PQC_ALGORITHMS.find(a => a.id === selectedAlgorithm);
    if (algo && algo.securityLevels.length > 0) {
      setSelectedSecurityLevel(algo.securityLevels[0].label);
    }
  }, [selectedAlgorithm]);

  const handleGenerateScheme = async () => {
    setIsLoading(true);
    setResult(null);
    addAuditLog({ eventType: 'scheme_gen', details: `Attempting to generate scheme for algorithm: ${selectedAlgorithm}`, status: 'success' });
    try {
      const selectedAlgoDef = PQC_ALGORITHMS.find(a => a.id === selectedAlgorithm);
      const selectedLevelDef = selectedAlgoDef?.securityLevels.find(sl => sl.label === selectedSecurityLevel);

      if (!selectedAlgoDef || !selectedLevelDef) {
        throw new Error('Invalid algorithm or security level selected.');
      }

      // MOCK API for scheme generation
      const response: QuantumScheme = await mockApiCall({
        schemeId: `SCHEME-${selectedAlgorithm.toUpperCase()}-${generateUniqueId()}`,
        publicKey: `qpub-${selectedAlgorithm}-${selectedLevelDef.label}-...[long key based on data entropy and algorithm]...`,
        privateKeyInstructions: `For scheme ${selectedAlgorithm}, use these parameters for private key derivation: ${JSON.stringify(selectedLevelDef.params)}. Store seed words securely offline.`,
        estimatedBitsOfSecurity: selectedLevelDef.bits,
        algorithm: selectedAlgorithm,
        parameters: selectedLevelDef.params,
        generationDate: new Date().toISOString(),
      }, 4000);

      setResult(response);
      setActiveSchemes(prev => [...prev, response]);
      addAuditLog({ eventType: 'scheme_gen', details: `Scheme ${response.schemeId} generated successfully.`, relatedSchemeId: response.schemeId, status: 'success' });
      addNotification(`Scheme ${response.schemeId} generated successfully!`, 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'scheme_gen', details: `Failed to generate scheme: ${error.message}`, status: 'failure' });
      addNotification(`Failed to generate scheme: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const currentAlgoDef = PQC_ALGORITHMS.find(a => a.id === selectedAlgorithm);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Generate Quantum-Resistant Encryption Scheme</h2>
      <p className="text-gray-300 mb-4">
        Input a sample of your data structure to inform the scheme generation process,
        allowing for tailored cryptographic parameters optimized for your specific data
        entropy and length characteristics.
      </p>
      <textarea
        value={dataSample}
        onChange={e => setDataSample(e.target.value)}
        placeholder='Paste a JSON sample of the data structure to protect (e.g., {"id": "uuid", "name": "string", "value": 123}). This helps determine optimal parameters.'
        rows={6}
        className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="scheme-algo-select" className="block text-sm font-medium text-gray-300 mb-1">Select KEM Algorithm:</label>
          <select
            id="scheme-algo-select"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            value={selectedAlgorithm}
            onChange={e => setSelectedAlgorithm(e.target.value)}
            disabled={isLoading}
          >
            {PQC_ALGORITHMS.filter(a => a.category === 'KEM' || a.category === 'Symmetric').map(algo => (
              <option key={algo.id} value={algo.id}>{algo.name} {algo.isRecommended ? '(Recommended)' : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="security-level-select" className="block text-sm font-medium text-gray-300 mb-1">Select Security Level:</label>
          <select
            id="security-level-select"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            value={selectedSecurityLevel}
            onChange={e => setSelectedSecurityLevel(e.target.value)}
            disabled={isLoading || !currentAlgoDef || currentAlgoDef.securityLevels.length === 0}
          >
            {currentAlgoDef?.securityLevels.map(level => (
              <option key={level.label} value={level.label}>
                {level.label} ({level.bits}-bit)
              </option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={handleGenerateScheme} disabled={isLoading || !selectedAlgorithm || !selectedSecurityLevel} className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold disabled:opacity-50 transition-colors">
        {isLoading ? <LoadingSpinner /> : 'Generate Bespoke Scheme'}
      </button>

      {isLoading && <p className="mt-4 text-center text-gray-400">Analyzing data entropy... generating cryptographic lattice...</p>}

      {result && (
        <div className="mt-6 space-y-4 bg-gray-900 p-5 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">
            Scheme Generated <span className="text-cyan-400">(ID: {result.schemeId})</span>
          </h3>
          <p className="text-gray-300"><strong>Algorithm:</strong> {result.algorithm} - {result.parameters.label || result.securityLevel}</p>
          <p className="text-gray-300"><strong>Estimated Security:</strong> {result.estimatedBitsOfSecurity}-bit vs. Quantum Attack</p>
          <p className="text-gray-300"><strong>Generation Date:</strong> {new Date(result.generationDate).toLocaleString()}</p>
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <h4 className="font-semibold text-lg text-white mb-2">Public Key:</h4>
            <pre className="text-sm bg-gray-900 p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-gray-200">{result.publicKey}</pre>
            <button
              onClick={() => { navigator.clipboard.writeText(result.publicKey); addNotification('Public Key copied!', 'info'); }}
              className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
            >Copy Public Key</button>
            <h4 className="font-semibold text-lg text-white mt-4 mb-2">Private Key Instructions:</h4>
            <p className="text-sm bg-gray-900 p-3 rounded-md text-gray-200">{result.privateKeyInstructions}</p>
          </div>
          <p className="text-sm text-yellow-400 mt-4">
            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <strong>Warning:</strong> The private key instructions are critical. Follow them precisely and store securely offline. This system does NOT store your private keys.
          </p>
        </div>
      )}
    </div>
  );
};

export const KeyManagementPanel: React.FC = () => {
  const { keys, setKeys, addAuditLog, addNotification } = useGlobalAppContext();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [selectedAlgoForGen, setSelectedAlgoForGen] = useState<string>(PQC_ALGORITHMS.find(a => a.category === 'KEM' && a.isRecommended)?.id || 'kyber');
  const [selectedLevelForGen, setSelectedLevelForGen] = useState<string>('');
  const [keyToExport, setKeyToExport] = useState<CryptoKey | null>(null);
  const [keyToImportData, setKeyToImportData] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  useEffect(() => {
    const algo = PQC_ALGORITHMS.find(a => a.id === selectedAlgoForGen);
    if (algo && algo.securityLevels.length > 0) {
      setSelectedLevelForGen(algo.securityLevels[0].label);
    }
  }, [selectedAlgoForGen]);

  const handleGenerateKeyPair = async () => {
    setIsGeneratingKey(true);
    addAuditLog({ eventType: 'key_gen', details: `Attempting to generate key pair for ${selectedAlgoForGen} (${selectedLevelForGen}).`, status: 'info' });
    try {
      const selectedAlgoDef = PQC_ALGORITHMS.find(a => a.id === selectedAlgoForGen);
      const selectedLevelDef = selectedAlgoDef?.securityLevels.find(sl => sl.label === selectedLevelForGen);

      if (!selectedAlgoDef || !selectedLevelDef) {
        throw new Error('Invalid algorithm or security level selected for key generation.');
      }

      const newKeyId = generateUniqueId('key');
      const creationDate = new Date().toISOString();

      // MOCK key generation
      const newKey: CryptoKey = await mockApiCall({
        keyId: newKeyId,
        algorithm: selectedAlgoForGen,
        securityLevel: selectedLevelForGen,
        keyType: selectedAlgoDef.category === 'Symmetric' ? 'symmetric' : 'public', // For simplicity, asymmetric generation implies public/private, but we store the public component here
        creationDate: creationDate,
        publicKeyMaterial: `mock_pub_key_${selectedAlgoForGen}_${newKeyId}_${selectedLevelForGen}_${Math.random().toString(36).substring(7)}`,
        privateKeyEncrypted: `mock_priv_key_encrypted_${selectedAlgoForGen}_${newKeyId}_${selectedLevelForGen}_${Math.random().toString(36).substring(7)}`, // In a real app, this would be user-secured.
        metadata: {
          params: selectedLevelDef.params,
          category: selectedAlgoDef.category,
        },
      }, 3000);

      // If it's an asymmetric algorithm, we'd typically have two entries: one for public, one for private (or linked).
      // For this mock, we're just creating a conceptual "key" that holds both aspects.
      // In a real system, private keys are handled *very* differently, usually never stored raw,
      // and often locally to the client or in a secure enclave.
      setKeys(prev => [...prev, newKey]);
      addAuditLog({ eventType: 'key_gen', details: `Key ${newKeyId} (${selectedAlgoForGen}) generated successfully.`, relatedKeyId: newKeyId, status: 'success' });
      addNotification(`Key ${newKeyId} generated successfully!`, 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'key_gen', details: `Failed to generate key: ${error.message}`, status: 'failure' });
      addNotification(`Failed to generate key: ${error.message}`, 'error');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleExportKey = (key: CryptoKey) => {
    setKeyToExport(key);
    // In a real app, this would involve more sophisticated export methods (e.g., password-protected JWE)
    const exportableKeyData = {
      keyId: key.keyId,
      algorithm: key.algorithm,
      securityLevel: key.securityLevel,
      keyType: key.keyType,
      creationDate: key.creationDate,
      publicKeyMaterial: key.publicKeyMaterial,
      // NOTE: Private key material should NEVER be exported without strong encryption and user passphrase.
      // For this mock, we're just showing the concept.
      privateKeyEncrypted: key.privateKeyEncrypted,
      symmetricKeyMaterial: key.symmetricKeyMaterial,
      metadata: key.metadata,
    };
    const blob = new Blob([JSON.stringify(exportableKeyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pqc_key_${key.keyId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addAuditLog({ eventType: 'key_export', details: `Key ${key.keyId} exported.`, relatedKeyId: key.keyId, status: 'success' });
    addNotification(`Key ${key.keyId} exported.`, 'info');
  };

  const handleImportKey = async () => {
    try {
      const importedKey: CryptoKey = JSON.parse(keyToImportData);
      // Basic validation
      if (!importedKey.keyId || !importedKey.algorithm || !importedKey.keyType) {
        throw new Error('Invalid key format. Missing essential fields.');
      }
      // Ensure keyId is unique, or provide an option to overwrite/generate new ID
      if (keys.some(k => k.keyId === importedKey.keyId)) {
        importedKey.keyId = generateUniqueId(`${importedKey.algorithm}-imported`);
        addNotification(`Key ID already exists, imported with new ID: ${importedKey.keyId}`, 'warning');
      }
      setKeys(prev => [...prev, { ...importedKey, creationDate: importedKey.creationDate || new Date().toISOString() }]);
      addAuditLog({ eventType: 'key_import', details: `Key ${importedKey.keyId} imported.`, relatedKeyId: importedKey.keyId, status: 'success' });
      addNotification(`Key ${importedKey.keyId} imported successfully!`, 'success');
      setKeyToImportData('');
      setIsImportModalOpen(false);
    } catch (error: any) {
      addAuditLog({ eventType: 'key_import', details: `Failed to import key: ${error.message}`, status: 'failure' });
      addNotification(`Failed to import key: ${error.message}`, 'error');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    setRevokingKeyId(keyId);
    addAuditLog({ eventType: 'key_revoke', details: `Attempting to revoke key ${keyId}.`, status: 'info' });
    try {
      await mockApiCall({}, 1000); // Simulate network call for revocation list update
      setKeys(prev => prev.map(key => key.keyId === keyId ? { ...key, isRevoked: true, expirationDate: new Date().toISOString() } : key));
      addAuditLog({ eventType: 'key_revoke', details: `Key ${keyId} revoked successfully.`, relatedKeyId: keyId, status: 'success' });
      addNotification(`Key ${keyId} revoked successfully.`, 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'key_revoke', details: `Failed to revoke key ${keyId}: ${error.message}`, status: 'failure' });
      addNotification(`Failed to revoke key ${keyId}: ${error.message}`, 'error');
    } finally {
      setRevokingKeyId(null);
    }
  };

  const currentAlgoDefForGen = PQC_ALGORITHMS.find(a => a.id === selectedAlgoForGen);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Quantum-Resistant Key Management</h2>

      {/* Key Generation Section */}
      <div className="mb-8 p-5 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Generate New Key Pair/Symmetric Key</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="gen-algo-select" className="block text-sm font-medium text-gray-300 mb-1">Select Algorithm:</label>
            <select
              id="gen-algo-select"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              value={selectedAlgoForGen}
              onChange={e => setSelectedAlgoForGen(e.target.value)}
              disabled={isGeneratingKey}
            >
              {PQC_ALGORITHMS.filter(a => a.category !== 'Symmetric').map(algo => ( // Only show KEM/Signature for KeyPair
                 <option key={algo.id} value={algo.id}>{algo.name}</option>
              ))}
              <option value="aes-256-gcm">AES-256-GCM (Symmetric)</option>
            </select>
          </div>
          <div>
            <label htmlFor="gen-level-select" className="block text-sm font-medium text-gray-300 mb-1">Select Security Level:</label>
            <select
              id="gen-level-select"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              value={selectedLevelForGen}
              onChange={e => setSelectedLevelForGen(e.target.value)}
              disabled={isGeneratingKey || !currentAlgoDefForGen || currentAlgoDefForGen.securityLevels.length === 0}
            >
              {currentAlgoDefForGen?.securityLevels.map(level => (
                <option key={level.label} value={level.label}>
                  {level.label} ({level.bits}-bit)
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerateKeyPair}
          disabled={isGeneratingKey || !selectedAlgoForGen || !selectedLevelForGen}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          {isGeneratingKey ? <LoadingSpinner /> : `Generate New ${selectedAlgoForGen === 'aes-256-gcm' ? 'Symmetric Key' : 'Key Pair'}`}
        </button>
      </div>

      {/* Key List Section */}
      <div className="mb-8 p-5 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Your Managed Keys</h3>
        {keys.length === 0 ? (
          <p className="text-gray-400 text-center">No keys managed yet. Generate one above!</p>
        ) : (
          <div className="space-y-4">
            {keys.map(key => (
              <div key={key.keyId} className={`bg-gray-800 p-4 rounded-md border ${key.isRevoked ? 'border-red-500' : 'border-gray-700'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-mono text-sm ${key.isRevoked ? 'text-red-400 line-through' : 'text-cyan-400'}`}>{key.keyId}</span>
                  {key.isRevoked && <span className="text-red-500 text-xs font-bold px-2 py-1 bg-red-900 rounded">REVOKED</span>}
                </div>
                <p className="text-sm text-gray-300"><strong>Algorithm:</strong> {key.algorithm} ({key.securityLevel})</p>
                <p className="text-sm text-gray-300"><strong>Type:</strong> {key.keyType}</p>
                <p className="text-sm text-gray-300"><strong>Created:</strong> {new Date(key.creationDate).toLocaleDateString()}</p>
                {key.isRevoked && <p className="text-sm text-gray-300"><strong>Revoked:</strong> {new Date(key.expirationDate!).toLocaleDateString()}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {!key.isRevoked && (
                    <>
                      <button
                        onClick={() => { navigator.clipboard.writeText(key.publicKeyMaterial || 'N/A'); addNotification('Public Key Material copied!', 'info'); }}
                        className="p-2 text-xs bg-blue-700 hover:bg-blue-800 rounded transition-colors disabled:opacity-50"
                      >Copy Public Key</button>
                      <button
                        onClick={() => handleExportKey(key)}
                        className="p-2 text-xs bg-green-700 hover:bg-green-800 rounded transition-colors disabled:opacity-50"
                      >Export Key</button>
                      <button
                        onClick={() => handleRevokeKey(key.keyId)}
                        disabled={revokingKeyId === key.keyId}
                        className="p-2 text-xs bg-red-700 hover:bg-red-800 rounded transition-colors disabled:opacity-50"
                      >
                        {revokingKeyId === key.keyId ? 'Revoking...' : 'Revoke Key'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Import Section */}
      <div className="mb-8 p-5 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Import Key</h3>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
        >
          Open Import Key Modal
        </button>
      </div>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Quantum Key">
        <p className="mb-3 text-gray-300">Paste your exported key JSON data below. Ensure it is valid and from a trusted source.</p>
        <textarea
          value={keyToImportData}
          onChange={e => setKeyToImportData(e.target.value)}
          placeholder="Paste key JSON here..."
          rows={10}
          className="w-full p-2 mb-4 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
        />
        <button
          onClick={handleImportKey}
          disabled={!keyToImportData.trim()}
          className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          Import Key
        </button>
      </Modal>
    </div>
  );
};

export const EncryptDecryptPanel: React.FC = () => {
  const { addAuditLog, addNotification, keys } = useGlobalAppContext();
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encrypt State
  const [plaintextInput, setPlaintextInput] = useState('');
  const [encryptFile, setEncryptFile] = useState<File | null>(null);
  const [selectedEncryptKeyId, setSelectedEncryptKeyId] = useState<string | null>(null);
  const [encryptionOutput, setEncryptionOutput] = useState<EncryptionResult | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isSigningDuringEncrypt, setIsSigningDuringEncrypt] = useState(false);
  const [selectedSignKeyId, setSelectedSignKeyId] = useState<string | null>(null);

  // Decrypt State
  const [ciphertextInput, setCiphertextInput] = useState('');
  const [decryptFile, setDecryptFile] = useState<File | null>(null);
  const [selectedDecryptKeyId, setSelectedDecryptKeyId] = useState<string | null>(null);
  const [decryptionOutput, setDecryptionOutput] = useState<DecryptionResult | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [signatureToVerify, setSignatureToVerify] = useState('');
  const [selectedVerifyKeyId, setSelectedVerifyKeyId] = useState<string | null>(null);

  const handleEncrypt = async () => {
    setIsEncrypting(true);
    setEncryptionOutput(null);
    addAuditLog({ eventType: 'encrypt', details: `Attempting encryption with key ${selectedEncryptKeyId}.`, status: 'info' });

    try {
      const key = keys.find(k => k.keyId === selectedEncryptKeyId && !k.isRevoked);
      if (!key) throw new Error('Encryption key not found or revoked.');
      if (key.keyType === 'private') throw new Error('Cannot encrypt directly with a private key.');

      const dataToEncrypt = encryptFile ? await encryptFile.text() : plaintextInput;
      if (!dataToEncrypt) throw new Error('No data provided for encryption.');

      let signatureResult: SignatureResult | undefined = undefined;
      if (isSigningDuringEncrypt && selectedSignKeyId) {
        const signKey = keys.find(k => k.keyId === selectedSignKeyId && k.keyType === 'private' && !k.isRevoked);
        if (!signKey) throw new Error('Signing key not found, not a private key, or revoked.');
        // MOCK signing
        signatureResult = await mockApiCall({
          signature: `mock_signature_for_${signKey.keyId}_${generateUniqueId()}`,
          algorithm: signKey.algorithm,
          keyIdUsed: signKey.keyId,
          signingDate: new Date().toISOString(),
        }, 800);
      }

      // MOCK encryption
      const result: EncryptionResult = await mockApiCall({
        ciphertext: `mock_ciphertext_${key.algorithm}_${key.keyId}_${generateUniqueId()}_${btoa(dataToEncrypt).slice(0, 100)}...`,
        ephemeralPublicKey: key.algorithm.includes('kyber') ? `mock_ephemeral_pub_key_${generateUniqueId()}` : undefined,
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        iv: `mock_iv_${generateUniqueId()}`,
        tag: `mock_tag_${generateUniqueId()}`,
        encryptedFileSize: dataToEncrypt.length * 1.5, // Mock increase
        originalFileName: encryptFile?.name,
        signature: signatureResult?.signature,
      }, 3000);

      setEncryptionOutput(result);
      addAuditLog({ eventType: 'encrypt', details: `Data encrypted successfully with key ${selectedEncryptKeyId}.`, relatedKeyId: selectedEncryptKeyId, status: 'success' });
      addNotification('Data encrypted successfully!', 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'encrypt', details: `Encryption failed: ${error.message}`, status: 'failure' });
      addNotification(`Encryption failed: ${error.message}`, 'error');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    setDecryptionOutput(null);
    addAuditLog({ eventType: 'decrypt', details: `Attempting decryption with key ${selectedDecryptKeyId}.`, status: 'info' });

    try {
      const key = keys.find(k => k.keyId === selectedDecryptKeyId && !k.isRevoked);
      if (!key) throw new Error('Decryption key not found or revoked.');
      if (key.keyType === 'public') throw new Error('Cannot decrypt directly with a public key. A private key is required.');

      const dataToDecrypt = decryptFile ? await decryptFile.text() : ciphertextInput;
      if (!dataToDecrypt) throw new Error('No ciphertext provided for decryption.');

      let verificationStatus: 'verified' | 'unverified' | 'failed' = 'unverified';
      if (signatureToVerify && selectedVerifyKeyId) {
        const verifyKey = keys.find(k => k.keyId === selectedVerifyKeyId && k.keyType === 'public' && !k.isRevoked);
        if (!verifyKey) throw new Error('Verification key not found, not a public key, or revoked.');
        // MOCK verification
        const isVerified = await mockApiCall(Math.random() > 0.1, 1000); // 90% success
        verificationStatus = isVerified ? 'verified' : 'failed';
        addAuditLog({ eventType: 'verify', details: `Signature verification for key ${selectedVerifyKeyId}: ${verificationStatus}.`, relatedKeyId: selectedVerifyKeyId, status: isVerified ? 'success' : 'failure' });
      }

      // MOCK decryption
      const result: DecryptionResult = await mockApiCall({
        plaintext: `mock_plaintext_for_${key.keyId}_${generateUniqueId()}_${dataToDecrypt.slice(0, 100)}`, // Simulate successful decryption
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        decryptedFileSize: dataToDecrypt.length / 1.5, // Mock decrease
        verificationStatus: verificationStatus,
        signatureKeyId: selectedVerifyKeyId,
      }, 3000);

      setDecryptionOutput(result);
      addAuditLog({ eventType: 'decrypt', details: `Data decrypted successfully with key ${selectedDecryptKeyId}.`, relatedKeyId: selectedDecryptKeyId, status: 'success' });
      addNotification('Data decrypted successfully!', 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'decrypt', details: `Decryption failed: ${error.message}`, status: 'failure' });
      addNotification(`Decryption failed: ${error.message}`, 'error');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownloadDecrypted = () => {
    if (decryptionOutput?.plaintext) {
      const blob = new Blob([decryptionOutput.plaintext], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decrypted_data_${generateUniqueId()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addNotification('Decrypted data downloaded.', 'info');
    }
  };

  const handleDownloadEncrypted = () => {
    if (encryptionOutput?.ciphertext) {
      const blob = new Blob([encryptionOutput.ciphertext], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `encrypted_data_${generateUniqueId()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addNotification('Encrypted data downloaded.', 'info');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Secure Data Operations</h2>

      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'encrypt' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveTab('encrypt')}
        >
          Encrypt Data
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'decrypt' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveTab('decrypt')}
        >
          Decrypt Data
        </button>
      </div>

      {activeTab === 'encrypt' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Encrypt Plaintext or File</h3>
          <textarea
            value={plaintextInput}
            onChange={e => setPlaintextInput(e.target.value)}
            placeholder='Enter plaintext to encrypt...'
            rows={8}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
            disabled={!!encryptFile || isEncrypting}
          />
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Or upload file:</label>
            <input
              type="file"
              onChange={e => setEncryptFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 file:cursor-pointer disabled:opacity-50"
              disabled={!!plaintextInput || isEncrypting}
            />
            {encryptFile && <span className="text-gray-400 text-sm">Selected: {encryptFile.name}</span>}
          </div>

          <KeySelector
            label="Select Encryption Key (Public/Symmetric)"
            selectedKeyId={selectedEncryptKeyId}
            onSelectKey={setSelectedEncryptKeyId}
            filterType="public" // KEM public key or symmetric key for symmetric encryption
          />
           <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="sign-during-encrypt"
              checked={isSigningDuringEncrypt}
              onChange={e => setIsSigningDuringEncrypt(e.target.checked)}
              className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              disabled={isEncrypting}
            />
            <label htmlFor="sign-during-encrypt" className="ml-2 block text-sm text-gray-300">
              Sign data during encryption (requires private key)
            </label>
          </div>
          {isSigningDuringEncrypt && (
            <KeySelector
              label="Select Signing Key (Private)"
              selectedKeyId={selectedSignKeyId}
              onSelectKey={setSelectedSignKeyId}
              filterType="private"
              filterAlgorithm={keys.find(k => k.keyId === selectedEncryptKeyId)?.algorithm === 'kyber' ? 'dilithium' : undefined} // Example: Use Dilithium for signing Kyber KEM output
            />
          )}


          <button
            onClick={handleEncrypt}
            disabled={isEncrypting || (!plaintextInput && !encryptFile) || !selectedEncryptKeyId || (isSigningDuringEncrypt && !selectedSignKeyId)}
            className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {isEncrypting ? <LoadingSpinner /> : 'Encrypt Data'}
          </button>

          {encryptionOutput && (
            <div className="mt-6 space-y-3 bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Encryption Result</h4>
              <p className="text-gray-300 text-sm"><strong>Algorithm:</strong> {encryptionOutput.algorithm}</p>
              <p className="text-gray-300 text-sm"><strong>Key Used:</strong> {encryptionOutput.keyIdUsed}</p>
              {encryptionOutput.ephemeralPublicKey && <p className="text-gray-300 text-sm"><strong>Ephemeral Public Key:</strong> <span className="font-mono break-all">{encryptionOutput.ephemeralPublicKey.slice(0, 50)}...</span></p>}
              {encryptionOutput.signature && <p className="text-gray-300 text-sm"><strong>Signature (if signed):</strong> <span className="font-mono break-all">{encryptionOutput.signature.slice(0, 50)}...</span></p>}
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="font-semibold text-md text-white mb-1">Ciphertext:</h5>
                <pre className="text-xs text-gray-200 break-all whitespace-pre-wrap">{encryptionOutput.ciphertext}</pre>
                <button
                  onClick={() => { navigator.clipboard.writeText(encryptionOutput.ciphertext); addNotification('Ciphertext copied!', 'info'); }}
                  className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >Copy Ciphertext</button>
              </div>
              <button
                onClick={handleDownloadEncrypted}
                className="mt-3 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
              >Download Encrypted Data</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'decrypt' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Decrypt Ciphertext or File</h3>
          <textarea
            value={ciphertextInput}
            onChange={e => setCiphertextInput(e.target.value)}
            placeholder='Enter ciphertext to decrypt...'
            rows={8}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
            disabled={!!decryptFile || isDecrypting}
          />
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Or upload file:</label>
            <input
              type="file"
              onChange={e => setDecryptFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 file:cursor-pointer disabled:opacity-50"
              disabled={!!ciphertextInput || isDecrypting}
            />
            {decryptFile && <span className="text-gray-400 text-sm">Selected: {decryptFile.name}</span>}
          </div>

          <KeySelector
            label="Select Decryption Key (Private/Symmetric)"
            selectedKeyId={selectedDecryptKeyId}
            onSelectKey={setSelectedDecryptKeyId}
            filterType="private" // Requires private key for asymmetric, or symmetric key for symmetric
          />

          <div className="mt-4">
            <label htmlFor="signature-to-verify" className="block text-sm font-medium text-gray-300 mb-1">Signature (optional, if data was signed):</label>
            <input
              type="text"
              id="signature-to-verify"
              value={signatureToVerify}
              onChange={e => setSignatureToVerify(e.target.value)}
              placeholder="Paste signature here..."
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isDecrypting}
            />
          </div>
          {signatureToVerify && (
            <KeySelector
              label="Select Public Key for Signature Verification"
              selectedKeyId={selectedVerifyKeyId}
              onSelectKey={setSelectedVerifyKeyId}
              filterType="public"
              filterAlgorithm={keys.find(k => k.keyId === selectedDecryptKeyId)?.algorithm === 'kyber' ? 'dilithium' : undefined} // Example: Verify Dilithium signature
            />
          )}

          <button
            onClick={handleDecrypt}
            disabled={isDecrypting || (!ciphertextInput && !decryptFile) || !selectedDecryptKeyId || (signatureToVerify && !selectedVerifyKeyId)}
            className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {isDecrypting ? <LoadingSpinner /> : 'Decrypt Data'}
          </button>

          {decryptionOutput && (
            <div className="mt-6 space-y-3 bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Decryption Result</h4>
              <p className="text-gray-300 text-sm"><strong>Algorithm:</strong> {decryptionOutput.algorithm}</p>
              <p className="text-gray-300 text-sm"><strong>Key Used:</strong> {decryptionOutput.keyIdUsed}</p>
              {decryptionOutput.verificationStatus && (
                <p className="text-gray-300 text-sm">
                  <strong>Signature Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    decryptionOutput.verificationStatus === 'verified' ? 'bg-green-700 text-green-100' :
                    decryptionOutput.verificationStatus === 'failed' ? 'bg-red-700 text-red-100' : 'bg-yellow-700 text-yellow-100'
                  }`}>
                    {decryptionOutput.verificationStatus.toUpperCase()}
                  </span>
                  {decryptionOutput.signatureKeyId && ` (with Key: ${decryptionOutput.signatureKeyId})`}
                </p>
              )}
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="font-semibold text-md text-white mb-1">Plaintext:</h5>
                <pre className="text-xs text-gray-200 break-all whitespace-pre-wrap">{decryptionOutput.plaintext}</pre>
                <button
                  onClick={() => { navigator.clipboard.writeText(decryptionOutput.plaintext); addNotification('Plaintext copied!', 'info'); }}
                  className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >Copy Plaintext</button>
              </div>
              <button
                onClick={handleDownloadDecrypted}
                className="mt-3 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
              >Download Decrypted Data</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SignVerifyPanel: React.FC = () => {
  const { addAuditLog, addNotification, keys } = useGlobalAppContext();
  const [activeTab, setActiveTab] = useState<'sign' | 'verify'>('sign');

  // Sign State
  const [messageToSign, setMessageToSign] = useState('');
  const [signFile, setSignFile] = useState<File | null>(null);
  const [selectedSignKeyId, setSelectedSignKeyId] = useState<string | null>(null);
  const [signingOutput, setSigningOutput] = useState<SignatureResult | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Verify State
  const [messageToVerify, setMessageToVerify] = useState('');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [signatureToVerify, setSignatureToVerify] = useState('');
  const [selectedVerifyKeyId, setSelectedVerifyKeyId] = useState<string | null>(null);
  const [verificationOutput, setVerificationOutput] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSign = async () => {
    setIsSigning(true);
    setSigningOutput(null);
    addAuditLog({ eventType: 'sign', details: `Attempting to sign data with key ${selectedSignKeyId}.`, status: 'info' });

    try {
      const key = keys.find(k => k.keyId === selectedSignKeyId && !k.isRevoked);
      if (!key) throw new Error('Signing key not found or revoked.');
      if (key.keyType !== 'private') throw new Error('Signing requires a private key.');
      if (key.category === 'KEM' || key.category === 'Symmetric') throw new Error('Cannot sign with a KEM or Symmetric key.');

      const dataToSign = signFile ? await signFile.text() : messageToSign;
      if (!dataToSign) throw new Error('No data provided for signing.');

      // MOCK signing
      const result: SignatureResult = await mockApiCall({
        signature: `mock_signature_${key.algorithm}_${key.keyId}_${generateUniqueId()}_${btoa(dataToSign).slice(0, 50)}...`,
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        signingDate: new Date().toISOString(),
      }, 2500);

      setSigningOutput(result);
      addAuditLog({ eventType: 'sign', details: `Data signed successfully with key ${selectedSignKeyId}.`, relatedKeyId: selectedSignKeyId, status: 'success' });
      addNotification('Data signed successfully!', 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'sign', details: `Signing failed: ${error.message}`, status: 'failure' });
      addNotification(`Signing failed: ${error.message}`, 'error');
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationOutput(null);
    addAuditLog({ eventType: 'verify', details: `Attempting to verify signature with key ${selectedVerifyKeyId}.`, status: 'info' });

    try {
      const key = keys.find(k => k.keyId === selectedVerifyKeyId && !k.isRevoked);
      if (!key) throw new Error('Verification key not found or revoked.');
      if (key.keyType !== 'public') throw new Error('Verification requires a public key.');
      if (key.category === 'KEM' || key.category === 'Symmetric') throw new Error('Cannot verify with a KEM or Symmetric key.');


      const dataToVerify = verifyFile ? await verifyFile.text() : messageToVerify;
      if (!dataToVerify) throw new Error('No data provided for verification.');
      if (!signatureToVerify) throw new Error('No signature provided for verification.');

      // MOCK verification
      const isVerified = await mockApiCall(Math.random() > 0.1, 2000); // 90% success rate

      const result: VerificationResult = {
        isVerified: isVerified,
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        verificationDate: new Date().toISOString(),
        messageHash: `mock_msg_hash_${generateUniqueId()}`,
        signatureHash: `mock_sig_hash_${generateUniqueId()}`,
      };

      setVerificationOutput(result);
      addAuditLog({ eventType: 'verify', details: `Signature verification result for key ${selectedVerifyKeyId}: ${isVerified ? 'Verified' : 'Failed'}.`, relatedKeyId: selectedVerifyKeyId, status: isVerified ? 'success' : 'failure' });
      addNotification(`Signature verification: ${isVerified ? 'SUCCESS' : 'FAILED'}!`, isVerified ? 'success' : 'error');
    } catch (error: any) {
      addAuditLog({ eventType: 'verify', details: `Verification failed: ${error.message}`, status: 'failure' });
      addNotification(`Verification failed: ${error.message}`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Digital Signatures (PQC)</h2>

      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'sign' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveTab('sign')}
        >
          Sign Data
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'verify' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveTab('verify')}
        >
          Verify Signature
        </button>
      </div>

      {activeTab === 'sign' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Sign Message or File</h3>
          <textarea
            value={messageToSign}
            onChange={e => setMessageToSign(e.target.value)}
            placeholder='Enter message to sign...'
            rows={8}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
            disabled={!!signFile || isSigning}
          />
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Or upload file:</label>
            <input
              type="file"
              onChange={e => setSignFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 file:cursor-pointer disabled:opacity-50"
              disabled={!!messageToSign || isSigning}
            />
            {signFile && <span className="text-gray-400 text-sm">Selected: {signFile.name}</span>}
          </div>

          <KeySelector
            label="Select Signing Key (Private)"
            selectedKeyId={selectedSignKeyId}
            onSelectKey={setSelectedSignKeyId}
            filterType="private"
            filterAlgorithm="dilithium" // Assuming Dilithium is preferred for signing
          />

          <button
            onClick={handleSign}
            disabled={isSigning || (!messageToSign && !signFile) || !selectedSignKeyId}
            className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {isSigning ? <LoadingSpinner /> : 'Sign Data'}
          </button>

          {signingOutput && (
            <div className="mt-6 space-y-3 bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Signing Result</h4>
              <p className="text-gray-300 text-sm"><strong>Algorithm:</strong> {signingOutput.algorithm}</p>
              <p className="text-gray-300 text-sm"><strong>Key Used:</strong> {signingOutput.keyIdUsed}</p>
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="font-semibold text-md text-white mb-1">Signature:</h5>
                <pre className="text-xs text-gray-200 break-all whitespace-pre-wrap">{signingOutput.signature}</pre>
                <button
                  onClick={() => { navigator.clipboard.writeText(signingOutput.signature); addNotification('Signature copied!', 'info'); }}
                  className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >Copy Signature</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Verify Message or File with Signature</h3>
          <textarea
            value={messageToVerify}
            onChange={e => setMessageToVerify(e.target.value)}
            placeholder='Enter original message to verify...'
            rows={8}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
            disabled={!!verifyFile || isVerifying}
          />
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Or upload original file:</label>
            <input
              type="file"
              onChange={e => setVerifyFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 file:cursor-pointer disabled:opacity-50"
              disabled={!!messageToVerify || isVerifying}
            />
            {verifyFile && <span className="text-gray-400 text-sm">Selected: {verifyFile.name}</span>}
          </div>

          <div>
            <label htmlFor="signature-input" className="block text-sm font-medium text-gray-300 mb-1">Signature to Verify:</label>
            <textarea
              id="signature-input"
              value={signatureToVerify}
              onChange={e => setSignatureToVerify(e.target.value)}
              placeholder="Paste signature here..."
              rows={4}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
              disabled={isVerifying}
            />
          </div>

          <KeySelector
            label="Select Public Key for Verification"
            selectedKeyId={selectedVerifyKeyId}
            onSelectKey={setSelectedVerifyKeyId}
            filterType="public"
            filterAlgorithm="dilithium"
          />

          <button
            onClick={handleVerify}
            disabled={isVerifying || (!messageToVerify && !verifyFile) || !signatureToVerify || !selectedVerifyKeyId}
            className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {isVerifying ? <LoadingSpinner /> : 'Verify Signature'}
          </button>

          {verificationOutput && (
            <div className="mt-6 space-y-3 bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Verification Result</h4>
              <p className="text-gray-300 text-sm"><strong>Algorithm:</strong> {verificationOutput.algorithm}</p>
              <p className="text-gray-300 text-sm"><strong>Key Used:</strong> {verificationOutput.keyIdUsed}</p>
              <p className="text-gray-300 text-sm"><strong>Verification Date:</strong> {new Date(verificationOutput.verificationDate).toLocaleString()}</p>
              <p className="text-lg font-bold">
                Status:
                <span className={`ml-2 px-3 py-1 rounded-full ${
                  verificationOutput.isVerified ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {verificationOutput.isVerified ? 'VERIFIED' : 'FAILED'}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AuditLogPanel: React.FC = () => {
  const { auditLogs } = useGlobalAppContext();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    const typeMatch = filterType === 'all' || log.eventType === filterType;
    const searchMatch = searchTerm === '' ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.relatedKeyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.relatedSchemeId?.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const getStatusColor = (status: 'success' | 'failure') => {
    return status === 'success' ? 'text-green-400' : 'text-red-400';
  };

  const getEventTypeColor = (eventType: AuditLogEntry['eventType']) => {
    switch (eventType) {
      case 'key_gen': return 'text-purple-300';
      case 'encrypt': return 'text-blue-300';
      case 'decrypt': return 'text-cyan-300';
      case 'sign': return 'text-indigo-300';
      case 'verify': return 'text-teal-300';
      case 'key_import': return 'text-yellow-300';
      case 'key_export': return 'text-orange-300';
      case 'scheme_gen': return 'text-pink-300';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-300';
    }
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">System Audit Log</h2>
      <p className="text-gray-300 mb-4">Review all cryptographic operations and system events.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="log-filter-type" className="block text-sm font-medium text-gray-300 mb-1">Filter by Event Type:</label>
          <select
            id="log-filter-type"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="key_gen">Key Generation</option>
            <option value="encrypt">Encryption</option>
            <option value="decrypt">Decryption</option>
            <option value="sign">Signing</option>
            <option value="verify">Verification</option>
            <option value="key_import">Key Import</option>
            <option value="key_export">Key Export</option>
            <option value="scheme_gen">Scheme Generation</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="log-search" className="block text-sm font-medium text-gray-300 mb-1">Search Logs:</label>
          <input
            type="text"
            id="log-search"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            placeholder="Search by details, key ID, scheme ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No matching log entries found.</p>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map(log => (
              <div key={log.logId} className="bg-gray-800 p-4 rounded-md border border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getEventTypeColor(log.eventType)} bg-opacity-20`}>
                    {log.eventType.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-gray-300 text-sm mb-1">{log.details}</p>
                <div className="flex items-center text-xs text-gray-400 space-x-4">
                  {log.relatedKeyId && <span className="flex items-center"><span className="text-cyan-400 mr-1">&#9679;</span> Key: <span className="font-mono">{log.relatedKeyId.slice(0, 8)}...</span></span>}
                  {log.relatedSchemeId && <span className="flex items-center"><span className="text-pink-400 mr-1">&#9679;</span> Scheme: <span className="font-mono">{log.relatedSchemeId.slice(0, 8)}...</span></span>}
                  <span className={`${getStatusColor(log.status)} font-semibold`}>{log.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const SettingsPanel: React.FC = () => {
  const { settings, setSettings, addNotification, addAuditLog } = useGlobalAppContext();

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    addNotification(`Setting '${name}' updated.`, 'info');
    addAuditLog({ eventType: 'info', details: `Setting '${name}' changed to ${type === 'checkbox' ? checked : value}.`, status: 'success' });
  };

  const handleSaveSettings = async () => {
    // In a real application, this would save to a backend or local storage
    addAuditLog({ eventType: 'info', details: 'Attempting to save application settings.', status: 'info' });
    try {
      await mockApiCall(settings, 1000);
      addNotification('Settings saved successfully!', 'success');
      addAuditLog({ eventType: 'info', details: 'Application settings saved.', status: 'success' });
    } catch (error: any) {
      addNotification(`Failed to save settings: ${error.message}`, 'error');
      addAuditLog({ eventType: 'error', details: `Failed to save settings: ${error.message}`, status: 'failure' });
    }
  };

  const kemAlgos = PQC_ALGORITHMS.filter(a => a.category === 'KEM');
  const signatureAlgos = PQC_ALGORITHMS.filter(a => a.category === 'Signature');
  const symmetricAlgos = PQC_ALGORITHMS.filter(a => a.category === 'Symmetric');

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Application Settings</h2>
      <p className="text-gray-300 mb-6">Configure default algorithms, logging, and other system parameters.</p>

      <div className="space-y-6">
        {/* Default Algorithm Settings */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Default Cryptographic Algorithms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultKEM" className="block text-sm font-medium text-gray-300 mb-1">Default Key Encapsulation (KEM):</label>
              <select
                id="defaultKEM"
                name="defaultKEM"
                value={settings.defaultKEM}
                onChange={handleSettingChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              >
                {kemAlgos.map(algo => (
                  <option key={algo.id} value={algo.id}>{algo.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="defaultSignature" className="block text-sm font-medium text-gray-300 mb-1">Default Digital Signature:</label>
              <select
                id="defaultSignature"
                name="defaultSignature"
                value={settings.defaultSignature}
                onChange={handleSettingChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              >
                {signatureAlgos.map(algo => (
                  <option key={algo.id} value={algo.id}>{algo.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="defaultSymmetric" className="block text-sm font-medium text-gray-300 mb-1">Default Symmetric Encryption:</label>
              <select
                id="defaultSymmetric"
                name="defaultSymmetric"
                value={settings.defaultSymmetric}
                onChange={handleSettingChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              >
                {symmetricAlgos.map(algo => (
                  <option key={algo.id} value={algo.id}>{algo.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logging and Retention */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Logging and Audit Trail</h3>
          <div>
            <label htmlFor="logRetentionDays" className="block text-sm font-medium text-gray-300 mb-1">Log Retention Days:</label>
            <input
              type="number"
              id="logRetentionDays"
              name="logRetentionDays"
              value={settings.logRetentionDays}
              onChange={handleSettingChange}
              min="7"
              max="365"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            />
            <p className="text-xs text-gray-400 mt-1">Number of days to retain audit log entries. (Min: 7, Max: 365)</p>
          </div>
        </div>

        {/* Key Rotation */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Key Rotation Policy</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoKeyRotationEnabled"
              name="autoKeyRotationEnabled"
              checked={settings.autoKeyRotationEnabled}
              onChange={handleSettingChange}
              className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
            />
            <label htmlFor="autoKeyRotationEnabled" className="ml-2 block text-sm text-gray-300">
              Enable Automatic Key Rotation (Experimental)
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            If enabled, the system will periodically suggest or initiate rotation of cryptographic keys
            based on predefined policies. This is a crucial security practice.
          </p>
        </div>

        {/* API Endpoint */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">API Configuration</h3>
          <div>
            <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-300 mb-1">PQC API Endpoint:</label>
            <input
              type="text"
              id="apiEndpoint"
              name="apiEndpoint"
              value={settings.apiEndpoint}
              onChange={handleSettingChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              placeholder="e.g., https://api.example.com/pqc"
            />
            <p className="text-xs text-gray-400 mt-1">The backend API endpoint for cryptographic operations.</p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
// endregion: Feature Components

// Main Application Component
const QuantumProofEncryptorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheme' | 'keys' | 'encrypt-decrypt' | 'sign-verify' | 'audit' | 'settings'>('scheme');
  const initialDataSample = `{
  "documentId": "DOC-2023-12-001",
  "title": "Confidential Project Report",
  "author": "Alice Smith",
  "creationDate": "2023-11-15T10:00:00Z",
  "contentHash": "sha256:abc123def456...",
  "accessLevel": "TOP_SECRET",
  "recipients": ["bob@example.com", "charlie@example.com"],
  "metadata": {
    "projectCode": "QPE-Alpha",
    "version": 1.0
  }
}`;

  return (
    <GlobalAppProvider>
      <div className="bg-gray-900 min-h-screen text-white p-8 font-sans">
        <NotificationDisplay />
        <h1 className="text-4xl font-extrabold mb-8 text-center text-cyan-400">
          Quantum-Resistant Cryptography Workbench
        </h1>

        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-1 border-b border-gray-700 mb-8 overflow-x-auto pb-2">
            <button
              className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === 'scheme' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('scheme')}
            >
              Scheme Generation
            </button>
            <button
              className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === 'keys' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('keys')}
            >
              Key Management
            </button>
            <button
              className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === 'encrypt-decrypt' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('encrypt-decrypt')}
            >
              Encrypt/Decrypt
            </button>
            <button
              className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === 'sign-verify' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('sign-verify')}
            >
              Sign/Verify
            </button>
            <button
              className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === 'audit' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('audit')}
            >
              Audit Log
            </button>
            <button
              className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === 'settings' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>

          <div className="p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            {activeTab === 'scheme' && <SchemeGenerationPanel initialDataSample={initialDataSample} />}
            {activeTab === 'keys' && <KeyManagementPanel />}
            {activeTab === 'encrypt-decrypt' && <EncryptDecryptPanel />}
            {activeTab === 'sign-verify' && <SignVerifyPanel />}
            {activeTab === 'audit' && <AuditLogPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
          </div>
        </div>
        <footer className="mt-12 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} QuantumGuard Solutions. All rights reserved.
        </footer>
      </div>
    </GlobalAppProvider>
  );
};

export default QuantumProofEncryptorView;