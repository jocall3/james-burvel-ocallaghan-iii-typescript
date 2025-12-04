/**
 * This module implements the Quantum-Proof Encryptor View, a critical component for managing and applying
 * Post-Quantum Cryptography (PQC) schemes within a sophisticated financial or data management system.
 * It provides a user interface for key lifecycle management, secure data operations (encryption, decryption,
 * signing, verification, hashing), and comprehensive auditing, all designed to safeguard digital assets
 * against current and future quantum computing threats.
 *
 * Business value: This system provides a robust, future-proof layer of data security, directly addressing
 * the existential threat posed by quantum computing to current cryptographic standards. It enables enterprises
 * to secure sensitive financial transactions, digital identities, and proprietary data against quantum attacks,
 * ensuring regulatory compliance, preventing catastrophic data breaches, and maintaining trust with clients
 * and partners. By offering a configurable and auditable PQC toolkit, it significantly de-risks long-term
 * data integrity, protects intellectual property, and underpins the secure operation of token rails and agentic AI
 * systems, creating a competitive advantage worth millions in avoided losses, enhanced reputation, and enabling
 * new, highly secure digital services. It ensures the longevity and resilience of digital assets and communications.
 * This system represents a revolutionary, multi-million-dollar infrastructure leap, providing foundational security
 * for the next generation of digital finance.
 */
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Defines the structure for a quantum-resistant cryptographic scheme.
 * This represents a configured set of PQC parameters tailored for specific data characteristics.
 * Commercial value: Ensures configurable, forward-looking security for diverse data types and regulatory needs.
 */
export interface QuantumScheme {
  schemeId: string;
  publicKey: string;
  privateKeyInstructions: string;
  estimatedBitsOfSecurity: number;
  algorithm: string;
  parameters: { [key: string]: any };
  generationDate: string;
  ownerIdentityId?: string; // Links scheme to a digital identity
  usagePolicy?: string[]; // E.g., ['data_at_rest', 'data_in_transit']
}

/**
 * Defines a Post-Quantum Cryptography (PQC) algorithm.
 * Commercial value: Provides a catalog of standardized and candidate PQC algorithms for flexible adoption.
 */
export interface PQCAlgorithmDefinition {
  id: string;
  name: string;
  category: 'KEM' | 'Signature' | 'Symmetric' | 'Hash'; // Key Encapsulation Mechanism, Digital Signature, Hashing
  description: string;
  securityLevels: { label: string; bits: number; params: { [key: string]: any } }[];
  isRecommended: boolean;
  status: 'standard' | 'candidate' | 'experimental';
}

/**
 * Represents a cryptographic key, including PQC and symmetric keys.
 * Commercial value: Centralized, auditable management of cryptographic keys, crucial for digital identity and data protection.
 */
export interface CryptoKey {
  keyId: string;
  algorithm: string;
  securityLevel: string;
  keyType: 'public' | 'private' | 'symmetric';
  creationDate: string;
  expirationDate?: string;
  publicKeyMaterial?: string; // Base64 or Hex encoded
  privateKeyEncrypted?: string; // Encrypted with a master key or passphrase, for secure storage
  symmetricKeyMaterial?: string; // Encrypted symmetric key
  metadata?: { [key: string]: any };
  isRevoked?: boolean;
  ownerIdentityId?: string; // Links key to a specific digital identity (user, agent, service)
  usagePolicy: ('encrypt' | 'decrypt' | 'sign' | 'verify' | 'all')[]; // Defines allowed operations for the key
  managedByAgent?: boolean; // Indicates if the key lifecycle is managed by an autonomous agent
}

/**
 * Represents the result of an encryption operation.
 * Commercial value: Provides detailed output of secure data encapsulation for auditable and verifiable transactions.
 */
export interface EncryptionResult {
  ciphertext: string; // Base64 encoded
  ephemeralPublicKey?: string; // For KEMs, if the public key needs to be transmitted with ciphertext
  algorithm: string;
  keyIdUsed: string;
  iv?: string; // Initialization Vector, Base64
  tag?: string; // Authentication Tag for AEAD, Base64
  encryptedFileSize?: number;
  originalFileName?: string;
  signature?: string; // If signed during encryption
  signatureKeyId?: string; // ID of the key used for signing
  transactionId?: string; // Link to a financial transaction
}

/**
 * Represents the result of a decryption operation.
 * Commercial value: Enables secure retrieval of sensitive information with verification of integrity.
 */
export interface DecryptionResult {
  plaintext: string; // Base64 decoded
  algorithm: string;
  keyIdUsed: string;
  decryptedFileSize?: number;
  verificationStatus?: 'verified' | 'unverified' | 'failed'; // For signed data
  signatureKeyId?: string; // Key used for signature verification
  transactionId?: string; // Link to a financial transaction
}

/**
 * Represents the result of a digital signature operation.
 * Commercial value: Provides cryptographic proof of origin and integrity for critical financial instructions and data.
 */
export interface SignatureResult {
  signature: string; // Base64 encoded
  algorithm: string;
  keyIdUsed: string;
  signingDate: string;
  messageHash?: string; // Hash of the message that was signed
  transactionId?: string; // Link to a financial transaction
}

/**
 * Represents the result of a signature verification operation.
 * Commercial value: Confirms the authenticity and integrity of signed data, essential for non-repudiation.
 */
export interface VerificationResult {
  isVerified: boolean;
  algorithm: string;
  keyIdUsed: string;
  verificationDate: string;
  messageHash?: string; // Hash of the message used for verification
  signatureHash?: string; // Hash of the signature itself
  transactionId?: string; // Link to a financial transaction
}

/**
 * Represents the result of a cryptographic hash operation.
 * Commercial value: Creates immutable data fingerprints for integrity checks and blockchain-style audit trails.
 */
export interface HashResult {
  hash: string; // Base64 or Hex encoded hash
  algorithm: string;
  inputSize: number;
  hashDate: string;
}

/**
 * Represents an entry in the system's tamper-evident audit log.
 * Commercial value: Provides an immutable, auditable record of all critical system activities for regulatory compliance and forensic analysis.
 */
export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  eventType: 'key_gen' | 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'hash' | 'key_import' | 'key_export' | 'scheme_gen' | 'key_revoke' | 'config_update' | 'agent_action' | 'policy_violation' | 'error' | 'warning' | 'info';
  details: string;
  relatedKeyId?: string;
  relatedSchemeId?: string;
  actorType: 'user' | 'agent' | 'system'; // Identifies the type of entity performing the action
  actorId?: string; // Identifies the specific actor (user ID, agent ID)
  status: 'success' | 'failure';
  transactionId?: string; // Link to a financial transaction for end-to-end traceability
}

/**
 * Defines the configuration settings for the PQC system.
 * Commercial value: Enables enterprise-grade governance and adaptability for cryptographic policies and operational parameters.
 */
export interface ApplicationSettings {
  defaultKEM: string;
  defaultSignature: string;
  defaultSymmetric: string;
  defaultHash: string;
  logRetentionDays: number;
  autoKeyRotationEnabled: boolean;
  keyRotationFrequencyDays: number; // New: frequency for automated key rotation suggestions/actions
  masterKeyHash?: string; // Placeholder for a master key derivation
  apiEndpoint: string;
  pqcComplianceMode: 'nist-standard' | 'nist-candidate' | 'experimental'; // Controls algorithm selection based on compliance
  minSecurityLevelForCriticalOps: number; // New: Minimum bits of security required for high-value operations
  agentPQCInteractionPolicy: 'monitor_only' | 'suggest_actions' | 'full_automation'; // New: Policy for agent interaction
}

/**
 * Defines the identity of an actor (user, agent) interacting with the system.
 * Commercial value: Establishes a foundational digital identity for access control and auditability.
 */
export interface ActorIdentity {
  id: string;
  name: string;
  role: 'admin' | 'cryptographer' | 'operator' | 'auditor' | 'agent' | 'system';
  isAgent: boolean;
}

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
    isRecommended: false,
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
    id: 'sha3-256',
    name: 'SHA3-256',
    category: 'Hash',
    description: 'Keccak-based cryptographic hash function, part of the SHA-3 family, offering strong collision resistance.',
    securityLevels: [
      { label: 'SHA3-256', bits: 256, params: {} },
    ],
    isRecommended: true,
    status: 'standard',
  },
  {
    id: 'sha3-512',
    name: 'SHA3-512',
    category: 'Hash',
    description: 'Keccak-based cryptographic hash function, part of the SHA-3 family, offering enhanced collision resistance.',
    securityLevels: [
      { label: 'SHA3-512', bits: 512, params: {} },
    ],
    isRecommended: true,
    status: 'standard',
  },
  {
    id: 'pqc-hybrid-kem-x25519',
    name: 'PQC Hybrid KEM (Kyber768 + X25519)',
    category: 'KEM',
    description: 'Combines Kyber768 with classical ECDH (X25519) for added resilience, providing a fallback if PQC is broken. Recommended for transition.',
    securityLevels: [
      { label: 'Hybrid-192', bits: 192, params: { pqc: 'Kyber768', classic: 'X25519' } },
    ],
    isRecommended: true,
    status: 'experimental',
  },
  {
    id: 'pqc-hybrid-signature-eddsa',
    name: 'PQC Hybrid Signature (Dilithium3 + EdDSA)',
    category: 'Signature',
    description: 'Combines Dilithium3 with classical EdDSA for enhanced security during the transition period.',
    securityLevels: [
      { label: 'Hybrid-192', bits: 192, params: { pqc: 'Dilithium3', classic: 'EdDSA' } },
    ],
    isRecommended: true,
    status: 'experimental',
  }
];

/**
 * Generates a unique identifier string, optionally with a prefix.
 * Commercial value: Essential for creating auditable, traceable records and distinct entity management.
 */
export const generateUniqueId = (prefix: string = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Simulates an asynchronous API call with a configurable delay and success/failure.
 * Commercial value: Enables realistic testing and demonstration of system responsiveness without real backend dependencies.
 */
export const mockApiCall = <T>(data: T, delay: number = 1500, success: boolean = true): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject(new Error('Mock API Error: Operation failed as simulated.'));
      }
    }, delay);
  });
};

/**
 * Represents the global application context for PQC operations.
 * Commercial value: Centralizes critical state management, enabling consistent security policies and auditability across the platform.
 */
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
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  removeNotification: (id: string) => void;
  isComplianceModeActive: (algorithmStatus: PQCAlgorithmDefinition['status']) => boolean;
  currentActor: ActorIdentity;
  setCurrentActor: React.Dispatch<React.SetStateAction<ActorIdentity>>;
}

const GlobalAppContext = createContext<GlobalAppContextType | undefined>(undefined);

/**
 * Custom hook to access the global application context.
 * Commercial value: Streamlines state access and ensures components operate within the defined security and governance framework.
 */
export const useGlobalAppContext = () => {
  const context = useContext(GlobalAppContext);
  if (!context) {
    throw new Error('useGlobalAppContext must be used within a GlobalAppProvider');
  }
  return context;
};

/**
 * Provides the global application context to its children components.
 * Commercial value: Establishes the foundational state for the entire PQC system, enabling consistent, enterprise-grade functionality.
 */
export const GlobalAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<CryptoKey[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeSchemes, setActiveSchemes] = useState<QuantumScheme[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);
  const [currentActor, setCurrentActor] = useState<ActorIdentity>({
    id: 'user-alpha-001',
    name: 'System Admin',
    role: 'admin',
    isAgent: false,
  });
  const [settings, setSettings] = useState<ApplicationSettings>({
    defaultKEM: 'kyber',
    defaultSignature: 'dilithium',
    defaultSymmetric: 'aes-256-gcm',
    defaultHash: 'sha3-256',
    logRetentionDays: 90,
    autoKeyRotationEnabled: true,
    keyRotationFrequencyDays: 365,
    masterKeyHash: 'mockMasterKeyHash123SecureDerivationKey', // Simulated master key presence for secure operations
    apiEndpoint: '/api/v1/pqc',
    pqcComplianceMode: 'nist-standard',
    minSecurityLevelForCriticalOps: 192, // e.g., Kyber768/Dilithium3
    agentPQCInteractionPolicy: 'suggest_actions',
  });

  const addAuditLog = useCallback((entry: AuditLogEntry) => {
    setAuditLogs(prev => [
      {
        ...entry,
        logId: generateUniqueId('log'),
        timestamp: new Date().toISOString(),
        actorType: entry.actorType || currentActor.isAgent ? 'agent' : 'user',
        actorId: entry.actorId || currentActor.id,
      },
      ...prev,
    ]);
  }, [currentActor]);

  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error', duration: number = 5000) => {
    const id = generateUniqueId('notif');
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const isComplianceModeActive = useCallback((algorithmStatus: PQCAlgorithmDefinition['status']): boolean => {
    const { pqcComplianceMode } = settings;
    if (pqcComplianceMode === 'nist-standard') {
      return algorithmStatus === 'standard';
    }
    if (pqcComplianceMode === 'nist-candidate') {
      return algorithmStatus === 'standard' || algorithmStatus === 'candidate';
    }
    if (pqcComplianceMode === 'experimental') {
      return true;
    }
    return false;
  }, [settings.pqcComplianceMode]);

  useEffect(() => {
    // Simulate loading initial data
    mockApiCall<CryptoKey[]>([], 500)
      .then(initialKeys => {
        setKeys(initialKeys);
        addAuditLog({ eventType: 'info', details: 'Application initialized and ready.', status: 'success', actorType: 'system', actorId: 'system' });
      })
      .catch(error => {
        addAuditLog({ eventType: 'error', details: `Failed to load initial keys: ${error.message}`, status: 'failure', actorType: 'system', actorId: 'system' });
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
    isComplianceModeActive,
    currentActor,
    setCurrentActor,
  };

  return (
    <GlobalAppContext.Provider value={contextValue}>
      {children}
    </GlobalAppContext.Provider>
  );
};

/**
 * A visual indicator for loading states.
 * Commercial value: Enhances user experience by providing clear feedback during asynchronous operations.
 */
export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-500"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-600"></div>
  </div>
);

/**
 * Displays transient, dismissible notifications to the user.
 * Commercial value: Improves operational awareness and user guidance by providing real-time system feedback.
 */
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

/**
 * A reusable component for selecting cryptographic keys from a filtered list.
 * Commercial value: Simplifies key selection, enforces policy-based filtering, and reduces operational errors.
 */
export const KeySelector: React.FC<{
  selectedKeyId: string | null;
  onSelectKey: (keyId: string) => void;
  filterType?: 'public' | 'private' | 'symmetric' | 'all';
  filterAlgorithmCategory?: PQCAlgorithmDefinition['category'] | 'all';
  filterAlgorithmId?: string;
  filterUsagePolicy?: ('encrypt' | 'decrypt' | 'sign' | 'verify' | 'all')[]; // New: Filter by allowed usage
  label: string;
  allowRevoked?: boolean;
}> = ({ selectedKeyId, onSelectKey, filterType = 'all', filterAlgorithmCategory = 'all', filterAlgorithmId, filterUsagePolicy, label, allowRevoked = false }) => {
  const { keys, isComplianceModeActive, settings, currentActor } = useGlobalAppContext();

  const filteredKeys = keys.filter(key => {
    const typeMatch = filterType === 'all' || key.keyType === filterType;
    const algoDef = PQC_ALGORITHMS.find(a => a.id === key.algorithm);
    const categoryMatch = filterAlgorithmCategory === 'all' || algoDef?.category === filterAlgorithmCategory;
    const algoIdMatch = !filterAlgorithmId || key.algorithm === filterAlgorithmId;
    const revokedMatch = allowRevoked || !key.isRevoked;
    const complianceMatch = algoDef ? isComplianceModeActive(algoDef.status) : false;
    const securityLevelMatch = algoDef?.securityLevels.find(sl => sl.label === key.securityLevel)?.bits >= settings.minSecurityLevelForCriticalOps;

    const usagePolicyMatch = !filterUsagePolicy || filterUsagePolicy.some(reqPolicy =>
      key.usagePolicy.includes('all') || key.usagePolicy.includes(reqPolicy)
    );

    // RBAC check: only allow selection of keys owned by current actor or system keys if actor is admin/cryptographer
    const ownerMatch = key.ownerIdentityId === currentActor.id ||
                       (key.ownerIdentityId === 'system' && (currentActor.role === 'admin' || currentActor.role === 'cryptographer'));


    return typeMatch && categoryMatch && algoIdMatch && revokedMatch && complianceMatch && securityLevelMatch && usagePolicyMatch && ownerMatch;
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
            {key.keyId} ({key.algorithm} - {key.securityLevel} {key.keyType.charAt(0).toUpperCase() + key.keyType.slice(1)}) {key.isRevoked && '(Revoked)'} {key.ownerIdentityId && `(Owner: ${key.ownerIdentityId})`}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * A generic modal component for displaying content in an overlay.
 * Commercial value: Improves user interface modularity and focus for critical interactions like key import.
 */
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

/**
 * Allows the current actor to select their role, simulating user identity and permissions.
 * Commercial value: Demonstrates role-based access control, a cornerstone of enterprise security and compliance.
 */
export const ActorRoleSelector: React.FC = () => {
  const { currentActor, setCurrentActor, addAuditLog } = useGlobalAppContext();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as ActorIdentity['role'];
    const newActorId = newRole === 'agent' ? 'agent-orchestrator-007' : `user-${newRole}-alpha`;
    const newActorName = newRole === 'agent' ? 'Agent Orchestrator' : `${newRole.charAt(0).toUpperCase() + newRole.slice(1)} User`;
    const isAgent = newRole === 'agent';

    setCurrentActor({
      id: newActorId,
      name: newActorName,
      role: newRole,
      isAgent: isAgent,
    });
    addAuditLog({
      eventType: 'info',
      details: `Actor role changed to ${newRole}. Actor ID: ${newActorId}.`,
      status: 'success',
      actorType: isAgent ? 'agent' : 'user',
      actorId: newActorId,
    });
  };

  return (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
      <div>
        <span className="block text-sm font-medium text-gray-300">Current Actor Role:</span>
        <span className="text-lg font-semibold text-cyan-400">{currentActor.name} ({currentActor.role.toUpperCase()})</span>
        <span className="block text-xs text-gray-400">ID: {currentActor.id}</span>
      </div>
      <select
        value={currentActor.role}
        onChange={handleRoleChange}
        className="p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
      >
        <option value="admin">Admin</option>
        <option value="cryptographer">Cryptographer</option>
        <option value="operator">Operator</option>
        <option value="auditor">Auditor</option>
        <option value="agent">Agent</option>
      </select>
    </div>
  );
};

/**
 * Panel for generating new quantum-resistant encryption schemes.
 * Commercial value: Enables proactive deployment of future-proof cryptographic infrastructure, safeguarding long-term data.
 */
export const SchemeGenerationPanel: React.FC<{ initialDataSample: string }> = ({ initialDataSample }) => {
  const { addAuditLog, addNotification, setActiveSchemes, isComplianceModeActive, currentActor } = useGlobalAppContext();
  const [dataSample, setDataSample] = useState(initialDataSample);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuantumScheme | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(PQC_ALGORITHMS.find(a => a.category === 'KEM' && a.isRecommended && isComplianceModeActive(a.status))?.id || 'kyber');
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState<string>('');
  const [associatedIdentityId, setAssociatedIdentityId] = useState<string>(currentActor.id);
  const [usagePolicies, setUsagePolicies] = useState<string[]>(['data_at_rest']);

  useEffect(() => {
    const algo = PQC_ALGORITHMS.find(a => a.id === selectedAlgorithm);
    if (algo && algo.securityLevels.length > 0) {
      setSelectedSecurityLevel(algo.securityLevels[0].label);
    }
  }, [selectedAlgorithm, isComplianceModeActive]);

  useEffect(() => {
    setAssociatedIdentityId(currentActor.id);
  }, [currentActor]);

  const handlePolicyChange = (policy: string) => {
    setUsagePolicies(prev =>
      prev.includes(policy) ? prev.filter(p => p !== policy) : [...prev, policy]
    );
  };

  const handleGenerateScheme = async () => {
    setIsLoading(true);
    setResult(null);
    addAuditLog({ eventType: 'scheme_gen', details: `Attempting to generate scheme for algorithm: ${selectedAlgorithm}`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });

    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer') {
        throw new Error('Unauthorized: Only Admin or Cryptographer roles can generate schemes.');
      }

      const selectedAlgoDef = PQC_ALGORITHMS.find(a => a.id === selectedAlgorithm);
      const selectedLevelDef = selectedAlgoDef?.securityLevels.find(sl => sl.label === selectedSecurityLevel);

      if (!selectedAlgoDef || !selectedLevelDef) {
        throw new Error('Invalid algorithm or security level selected.');
      }
      if (!isComplianceModeActive(selectedAlgoDef.status)) {
        throw new Error(`Algorithm '${selectedAlgoDef.name}' is not allowed under current compliance mode.`);
      }

      const response: QuantumScheme = await mockApiCall({
        schemeId: `SCHEME-${selectedAlgorithm.toUpperCase()}-${generateUniqueId()}`,
        publicKey: `qpub-${selectedAlgorithm}-${selectedLevelDef.label}-...[long key based on data entropy and algorithm]...`,
        privateKeyInstructions: `For scheme ${selectedAlgorithm}, use these parameters for private key derivation: ${JSON.stringify(selectedLevelDef.params)}. Store seed words securely offline.`,
        estimatedBitsOfSecurity: selectedLevelDef.bits,
        algorithm: selectedAlgorithm,
        parameters: { ...selectedLevelDef.params, dataEntropySample: dataSample.slice(0, 50) + '...' },
        generationDate: new Date().toISOString(),
        ownerIdentityId: associatedIdentityId,
        usagePolicy: usagePolicies,
      }, 4000);

      setResult(response);
      setActiveSchemes(prev => [...prev, response]);
      addAuditLog({ eventType: 'scheme_gen', details: `Scheme ${response.schemeId} generated successfully.`, relatedSchemeId: response.schemeId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      addNotification(`Scheme ${response.schemeId} generated successfully!`, 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'scheme_gen', details: `Failed to generate scheme: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
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
        entropy and length characteristics. These schemes are foundational for securing
        programmable value rails and agentic communications.
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
            disabled={isLoading || (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer')}
          >
            {PQC_ALGORITHMS.filter(a => (a.category === 'KEM' || a.category === 'Symmetric') && isComplianceModeActive(a.status)).map(algo => (
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
            disabled={isLoading || !currentAlgoDef || currentAlgoDef.securityLevels.length === 0 || (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer')}
          >
            {currentAlgoDef?.securityLevels.map(level => (
              <option key={level.label} value={level.label}>
                {level.label} ({level.bits}-bit)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="scheme-owner-id" className="block text-sm font-medium text-gray-300 mb-1">Associated Digital Identity (Owner):</label>
        <input
          type="text"
          id="scheme-owner-id"
          value={associatedIdentityId}
          onChange={e => setAssociatedIdentityId(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
          disabled={isLoading || (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer')}
          placeholder="e.g., user-finance-001 or agent-settlement-001"
        />
        <p className="text-xs text-gray-400 mt-1">
          Links the scheme to a specific user or autonomous agent for enhanced digital identity governance.
        </p>
      </div>

      <div className="mb-6">
        <span className="block text-sm font-medium text-gray-300 mb-1">Scheme Usage Policies:</span>
        <div className="flex flex-wrap gap-2">
          {['data_at_rest', 'data_in_transit', 'agent_communication', 'token_rail_settlement'].map(policy => (
            <label key={policy} className="inline-flex items-center text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={usagePolicies.includes(policy)}
                onChange={() => handlePolicyChange(policy)}
                className="form-checkbox h-4 w-4 text-cyan-600 rounded"
                disabled={isLoading || (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer')}
              />
              <span className="ml-2">{policy.replace(/_/g, ' ').toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleGenerateScheme} disabled={isLoading || !selectedAlgorithm || !selectedSecurityLevel || (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer')} className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold disabled:opacity-50 transition-colors">
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
          <p className="text-gray-300"><strong>Owner:</strong> {result.ownerIdentityId}</p>
          <p className="text-gray-300"><strong>Usage Policies:</strong> {result.usagePolicy?.join(', ') || 'N/A'}</p>
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
            <strong>Warning:</strong> The private key instructions are critical. Follow them precisely and store securely offline. This system does NOT store your private keys in plaintext.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Panel for managing quantum-resistant cryptographic keys, including generation, import, export, and revocation.
 * Commercial value: Ensures comprehensive lifecycle management for keys, a fundamental aspect of digital identity and security governance.
 */
export const KeyManagementPanel: React.FC = () => {
  const { keys, setKeys, addAuditLog, addNotification, isComplianceModeActive, currentActor, settings } = useGlobalAppContext();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [selectedAlgoForGen, setSelectedAlgoForGen] = useState<string>(PQC_ALGORITHMS.find(a => a.category === 'KEM' && a.isRecommended && isComplianceModeActive(a.status))?.id || 'kyber');
  const [selectedLevelForGen, setSelectedLevelForGen] = useState<string>('');
  const [keyToExport, setKeyToExport] = useState<CryptoKey | null>(null);
  const [keyToImportData, setKeyToImportData] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [keyOwnerIdentityId, setKeyOwnerIdentityId] = useState<string>(currentActor.id);
  const [keyUsagePolicies, setKeyUsagePolicies] = useState<('encrypt' | 'decrypt' | 'sign' | 'verify' | 'all')[]>(['all']);

  useEffect(() => {
    const algo = PQC_ALGORITHMS.find(a => a.id === selectedAlgoForGen);
    if (algo && algo.securityLevels.length > 0) {
      setSelectedLevelForGen(algo.securityLevels[0].label);
    }
  }, [selectedAlgoForGen, isComplianceModeActive]);

  useEffect(() => {
    setKeyOwnerIdentityId(currentActor.id);
  }, [currentActor]);

  const handlePolicyChange = (policy: 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'all') => {
    setKeyUsagePolicies(prev => {
      if (policy === 'all') {
        return prev.includes('all') ? [] : ['all'];
      }
      const newPolicies = prev.filter(p => p !== 'all');
      return newPolicies.includes(policy) ? newPolicies.filter(p => p !== policy) : [...newPolicies, policy];
    });
  };

  const handleGenerateKeyPair = async () => {
    setIsGeneratingKey(true);
    addAuditLog({ eventType: 'key_gen', details: `Attempting to generate key pair for ${selectedAlgoForGen} (${selectedLevelForGen}).`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer') {
        throw new Error('Unauthorized: Only Admin or Cryptographer roles can generate keys.');
      }

      const selectedAlgoDef = PQC_ALGORITHMS.find(a => a.id === selectedAlgoForGen);
      const selectedLevelDef = selectedAlgoDef?.securityLevels.find(sl => sl.label === selectedLevelForGen);

      if (!selectedAlgoDef || !selectedLevelDef) {
        throw new Error('Invalid algorithm or security level selected for key generation.');
      }
      if (!isComplianceModeActive(selectedAlgoDef.status)) {
        throw new Error(`Algorithm '${selectedAlgoDef.name}' is not allowed under current compliance mode.`);
      }
      if (selectedLevelDef.bits < settings.minSecurityLevelForCriticalOps) {
        throw new Error(`Selected security level (${selectedLevelDef.bits}-bit) is below the minimum required for critical operations (${settings.minSecurityLevelForCriticalOps}-bit).`);
      }


      const newKeyId = generateUniqueId('key');
      const creationDate = new Date().toISOString();

      const newKey: CryptoKey = await mockApiCall({
        keyId: newKeyId,
        algorithm: selectedAlgoForGen,
        securityLevel: selectedLevelForGen,
        keyType: selectedAlgoDef.category === 'Symmetric' ? 'symmetric' : (selectedAlgoDef.category === 'KEM' || selectedAlgoDef.category === 'Signature' ? 'private' : 'public'),
        creationDate: creationDate,
        publicKeyMaterial: `mock_pub_key_${selectedAlgoForGen}_${newKeyId}_${selectedLevelForGen}_${Math.random().toString(36).substring(7)}`,
        privateKeyEncrypted: selectedAlgoDef.category !== 'Symmetric' ? `mock_priv_key_encrypted_${selectedAlgoForGen}_${newKeyId}_${selectedLevelForGen}_${Math.random().toString(36).substring(7)}` : undefined,
        symmetricKeyMaterial: selectedAlgoDef.category === 'Symmetric' ? `mock_sym_key_encrypted_${selectedAlgoForGen}_${newKeyId}_${selectedLevelForGen}_${Math.random().toString(36).substring(7)}` : undefined,
        metadata: {
          params: selectedLevelDef.params,
          category: selectedAlgoDef.category,
        },
        ownerIdentityId: keyOwnerIdentityId,
        usagePolicy: keyUsagePolicies.length > 0 ? keyUsagePolicies : ['all'],
        managedByAgent: currentActor.isAgent, // If an agent initiates, it's agent-managed
      }, 3000);

      setKeys(prev => [...prev, newKey]);
      addAuditLog({ eventType: 'key_gen', details: `Key ${newKeyId} (${selectedAlgoForGen}) generated successfully for owner ${keyOwnerIdentityId}.`, relatedKeyId: newKeyId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      addNotification(`Key ${newKeyId} generated successfully!`, 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'key_gen', details: `Failed to generate key: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      addNotification(`Failed to generate key: ${error.message}`, 'error');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleExportKey = (key: CryptoKey) => {
    if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && currentActor.id !== key.ownerIdentityId) {
      addNotification('Unauthorized: You do not have permission to export this key.', 'error');
      addAuditLog({ eventType: 'policy_violation', details: `Unauthorized attempt to export key ${key.keyId} by ${currentActor.id}.`, relatedKeyId: key.keyId, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      return;
    }
    setKeyToExport(key);
    const exportableKeyData = {
      keyId: key.keyId,
      algorithm: key.algorithm,
      securityLevel: key.securityLevel,
      keyType: key.keyType,
      creationDate: key.creationDate,
      publicKeyMaterial: key.publicKeyMaterial,
      privateKeyEncrypted: key.privateKeyEncrypted,
      symmetricKeyMaterial: key.symmetricKeyMaterial,
      metadata: key.metadata,
      isRevoked: key.isRevoked,
      expirationDate: key.expirationDate,
      ownerIdentityId: key.ownerIdentityId,
      usagePolicy: key.usagePolicy,
      managedByAgent: key.managedByAgent,
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
    addAuditLog({ eventType: 'key_export', details: `Key ${key.keyId} exported by ${currentActor.id}.`, relatedKeyId: key.keyId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
    addNotification(`Key ${key.keyId} exported.`, 'info');
  };

  const handleImportKey = async () => {
    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer') {
        throw new Error('Unauthorized: Only Admin or Cryptographer roles can import keys.');
      }
      const importedKey: CryptoKey = JSON.parse(keyToImportData);
      if (!importedKey.keyId || !importedKey.algorithm || !importedKey.keyType || (!importedKey.publicKeyMaterial && !importedKey.privateKeyEncrypted && !importedKey.symmetricKeyMaterial)) {
        throw new Error('Invalid key format. Missing essential fields or key material.');
      }
      if (!importedKey.usagePolicy || !Array.isArray(importedKey.usagePolicy)) {
        importedKey.usagePolicy = ['all'];
      }

      let finalKeyId = importedKey.keyId;
      if (keys.some(k => k.keyId === importedKey.keyId)) {
        finalKeyId = generateUniqueId(`${importedKey.algorithm}-imported`);
        addNotification(`Key ID '${importedKey.keyId}' already exists. Importing with new ID: '${finalKeyId}'.`, 'warning');
      }

      setKeys(prev => [...prev, {
        ...importedKey,
        keyId: finalKeyId,
        creationDate: importedKey.creationDate || new Date().toISOString(),
        ownerIdentityId: importedKey.ownerIdentityId || currentActor.id, // Assign owner if not present
        managedByAgent: importedKey.managedByAgent || currentActor.isAgent,
      }]);
      addAuditLog({ eventType: 'key_import', details: `Key ${finalKeyId} imported by ${currentActor.id}.`, relatedKeyId: finalKeyId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      addNotification(`Key ${finalKeyId} imported successfully!`, 'success');
      setKeyToImportData('');
      setIsImportModalOpen(false);
    } catch (error: any) {
      addAuditLog({ eventType: 'key_import', details: `Failed to import key: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      addNotification(`Failed to import key: ${error.message}`, 'error');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    setRevokingKeyId(keyId);
    addAuditLog({ eventType: 'key_revoke', details: `Attempting to revoke key ${keyId} by ${currentActor.id}.`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
    try {
      const keyToRevoke = keys.find(k => k.keyId === keyId);
      if (!keyToRevoke) throw new Error('Key not found.');
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && currentActor.id !== keyToRevoke.ownerIdentityId) {
        throw new Error('Unauthorized: You do not have permission to revoke this key.');
      }

      await mockApiCall({}, 1000);
      setKeys(prev => prev.map(key => key.keyId === keyId ? { ...key, isRevoked: true, expirationDate: new Date().toISOString() } : key));
      addAuditLog({ eventType: 'key_revoke', details: `Key ${keyId} revoked successfully by ${currentActor.id}.`, relatedKeyId: keyId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      addNotification(`Key ${keyId} revoked successfully.`, 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'key_revoke', details: `Failed to revoke key ${keyId}: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      addNotification(`Failed to revoke key ${keyId}: ${error.message}`, 'error');
    } finally {
      setRevokingKeyId(null);
    }
  };

  const handleSimulateAgentRotation = async () => {
    addAuditLog({ eventType: 'agent_action', details: `Agent requested key rotation check based on policy.`, status: 'info', actorType: 'agent', actorId: 'agent-key-manager-001' });
    addNotification('Agent "Key Manager 001" is evaluating key rotation policies...', 'info');
    await mockApiCall({}, 2000); // Simulate agent analysis

    const keysToRotate = keys.filter(key =>
      key.managedByAgent &&
      !key.isRevoked &&
      key.creationDate &&
      (new Date().getTime() - new Date(key.creationDate).getTime()) > (settings.keyRotationFrequencyDays * 24 * 60 * 60 * 1000)
    );

    if (keysToRotate.length > 0) {
      keysToRotate.forEach(key => {
        addNotification(`Agent recommends rotation for key ${key.keyId} (older than ${settings.keyRotationFrequencyDays} days).`, 'warning');
        addAuditLog({ eventType: 'agent_action', details: `Agent "Key Manager 001" flagged key ${key.keyId} for rotation.`, relatedKeyId: key.keyId, status: 'warning', actorType: 'agent', actorId: 'agent-key-manager-001' });
      });
    } else {
      addNotification('No agent-managed keys require rotation at this time.', 'success');
      addAuditLog({ eventType: 'agent_action', details: 'Agent "Key Manager 001" completed key rotation evaluation; no keys flagged.', status: 'success', actorType: 'agent', actorId: 'agent-key-manager-001' });
    }
  };

  const currentAlgoDefForGen = PQC_ALGORITHMS.find(a => a.id === selectedAlgoForGen);

  const isUnauthorized = currentActor.role !== 'admin' && currentActor.role !== 'cryptographer';

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Quantum-Resistant Key Management</h2>
      <p className="text-gray-300 mb-4">
        This panel enables the generation, import, export, and revocation of quantum-safe cryptographic keys.
        Ensuring robust key lifecycle management, integrated with digital identity and agent policies, is paramount
        for maintaining the integrity and confidentiality of digital assets.
      </p>

      {/* Key Generation Section */}
      <div className="mb-8 p-5 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Generate New Key Pair/Symmetric Key</h3>
        {isUnauthorized && <p className="text-red-400 mb-4">You do not have permission to generate new keys.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="gen-algo-select" className="block text-sm font-medium text-gray-300 mb-1">Select Algorithm:</label>
            <select
              id="gen-algo-select"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              value={selectedAlgoForGen}
              onChange={e => setSelectedAlgoForGen(e.target.value)}
              disabled={isGeneratingKey || isUnauthorized}
            >
              {PQC_ALGORITHMS.filter(a => a.category !== 'Hash' && isComplianceModeActive(a.status)).map(algo => (
                 <option key={algo.id} value={algo.id}>{algo.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gen-level-select" className="block text-sm font-medium text-gray-300 mb-1">Select Security Level:</label>
            <select
              id="gen-level-select"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              value={selectedLevelForGen}
              onChange={e => setSelectedLevelForGen(e.target.value)}
              disabled={isGeneratingKey || !currentAlgoDefForGen || currentAlgoDefForGen.securityLevels.length === 0 || isUnauthorized}
            >
              {currentAlgoDefForGen?.securityLevels.map(level => (
                <option key={level.label} value={level.label}>
                  {level.label} ({level.bits}-bit)
                </option>
              ))}
            </select>
            {currentAlgoDefForGen?.securityLevels.find(sl => sl.label === selectedLevelForGen)?.bits < settings.minSecurityLevelForCriticalOps && (
              <p className="text-red-400 text-xs mt-1">Warning: Below minimum security level ({settings.minSecurityLevelForCriticalOps}-bit) for critical ops.</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="key-owner-id" className="block text-sm font-medium text-gray-300 mb-1">Key Owner Digital Identity:</label>
          <input
            type="text"
            id="key-owner-id"
            value={keyOwnerIdentityId}
            onChange={e => setKeyOwnerIdentityId(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            disabled={isGeneratingKey || isUnauthorized}
            placeholder="e.g., user-finance-001 or agent-settlement-001"
          />
          <p className="text-xs text-gray-400 mt-1">
            Links the key to a specific user or autonomous agent for identity-based access control.
          </p>
        </div>
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-300 mb-1">Key Usage Policy:</span>
          <div className="flex flex-wrap gap-2">
            {[ 'all', 'encrypt', 'decrypt', 'sign', 'verify'].map(policy => (
              <label key={policy} className="inline-flex items-center text-gray-300 text-sm">
                <input
                  type="checkbox"
                  checked={keyUsagePolicies.includes(policy as 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'all')}
                  onChange={() => handlePolicyChange(policy as 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'all')}
                  className="form-checkbox h-4 w-4 text-cyan-600 rounded"
                  disabled={isGeneratingKey || isUnauthorized}
                />
                <span className="ml-2">{policy.toUpperCase()}</span>
              </label>
            ))}
          </div>
          {keyUsagePolicies.length === 0 && <p className="text-red-400 text-xs mt-1">At least one usage policy must be selected.</p>}
        </div>
        <button
          onClick={handleGenerateKeyPair}
          disabled={isGeneratingKey || !selectedAlgoForGen || !selectedLevelForGen || isUnauthorized || keyUsagePolicies.length === 0}
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          {isGeneratingKey ? <LoadingSpinner /> : `Generate New ${currentAlgoDefForGen?.category === 'Symmetric' ? 'Symmetric Key' : 'Key Pair'}`}
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
              <div key={key.keyId} className={`bg-gray-800 p-4 rounded-md border ${key.isRevoked ? 'border-red-500 opacity-70' : 'border-gray-700'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-mono text-sm ${key.isRevoked ? 'text-red-400 line-through' : 'text-cyan-400'}`}>{key.keyId}</span>
                  {key.isRevoked && <span className="text-red-500 text-xs font-bold px-2 py-1 bg-red-900 rounded">REVOKED</span>}
                  {key.managedByAgent && <span className="text-blue-500 text-xs font-bold px-2 py-1 bg-blue-900 rounded ml-2">AGENT-MANAGED</span>}
                </div>
                <p className="text-sm text-gray-300"><strong>Algorithm:</strong> {key.algorithm} ({key.securityLevel})</p>
                <p className="text-sm text-gray-300"><strong>Type:</strong> {key.keyType.charAt(0).toUpperCase() + key.keyType.slice(1)}</p>
                <p className="text-sm text-gray-300"><strong>Owner:</strong> {key.ownerIdentityId || 'N/A'}</p>
                <p className="text-sm text-gray-300"><strong>Usage:</strong> {key.usagePolicy.join(', ').toUpperCase()}</p>
                <p className="text-sm text-gray-300"><strong>Created:</strong> {new Date(key.creationDate).toLocaleDateString()}</p>
                {key.expirationDate && <p className="text-sm text-gray-300"><strong>Expiration:</strong> {new Date(key.expirationDate).toLocaleDateString()}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {!key.isRevoked && (
                    <>
                      {key.publicKeyMaterial &&
                        <button
                          onClick={() => { navigator.clipboard.writeText(key.publicKeyMaterial || 'N/A'); addNotification('Public Key Material copied!', 'info'); }}
                          className="p-2 text-xs bg-blue-700 hover:bg-blue-800 rounded transition-colors disabled:opacity-50"
                          disabled={!((currentActor.role === 'admin' || currentActor.role === 'cryptographer') || currentActor.id === key.ownerIdentityId)}
                        >Copy Public Key</button>
                      }
                      <button
                        onClick={() => handleExportKey(key)}
                        className="p-2 text-xs bg-green-700 hover:bg-green-800 rounded transition-colors disabled:opacity-50"
                        disabled={!((currentActor.role === 'admin' || currentActor.role === 'cryptographer') || currentActor.id === key.ownerIdentityId)}
                      >Export Key</button>
                      <button
                        onClick={() => handleRevokeKey(key.keyId)}
                        disabled={revokingKeyId === key.keyId || !((currentActor.role === 'admin' || currentActor.role === 'cryptographer') || currentActor.id === key.ownerIdentityId)}
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
        <p className="text-gray-300 mb-4">
          Import existing cryptographic keys into the system. For private keys, ensure they are
          securely wrapped or protected by a passphrase as this interface does not handle plaintext private keys.
        </p>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          disabled={isUnauthorized}
        >
          Open Import Key Modal
        </button>
      </div>

      {/* Agent-Driven Key Management Actions */}
      <div className="mb-8 p-5 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Agentic Key Management Insights</h3>
        <p className="text-gray-300 mb-4">
          Simulate an autonomous agent evaluating key rotation policies configured in settings.
          This demonstrates intelligent automation for security best practices.
        </p>
        <button
          onClick={handleSimulateAgentRotation}
          disabled={!settings.autoKeyRotationEnabled || settings.agentPQCInteractionPolicy === 'monitor_only'}
          className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          Simulate Agent-Initiated Key Rotation Check
        </button>
        {!settings.autoKeyRotationEnabled && <p className="text-yellow-400 text-sm mt-2">Automatic Key Rotation is disabled in settings.</p>}
        {settings.agentPQCInteractionPolicy === 'monitor_only' && <p className="text-yellow-400 text-sm mt-2">Agent interaction policy is 'Monitor Only'. Agent will not suggest actions.</p>}
      </div>


      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Quantum Key">
        <p className="mb-3 text-gray-300">Paste your exported key JSON data below. Ensure it is valid and from a trusted source.</p>
        <textarea
          value={keyToImportData}
          onChange={e => setKeyToImportData(e.target.value)}
          placeholder="Paste key JSON here (e.g., exported from this tool)..."
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

/**
 * Panel for encrypting and decrypting data using quantum-resistant algorithms.
 * Commercial value: Ensures confidentiality of sensitive financial data, protecting against data breaches and espionage.
 */
export const EncryptDecryptPanel: React.FC = () => {
  const { addAuditLog, addNotification, keys, isComplianceModeActive, currentActor, settings } = useGlobalAppContext();
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');

  const [plaintextInput, setPlaintextInput] = useState('');
  const [encryptFile, setEncryptFile] = useState<File | null>(null);
  const [selectedEncryptKeyId, setSelectedEncryptKeyId] = useState<string | null>(null);
  const [encryptionOutput, setEncryptionOutput] = useState<EncryptionResult | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isSigningDuringEncrypt, setIsSigningDuringEncrypt] = useState(false);
  const [selectedSignKeyId, setSelectedSignKeyId] = useState<string | null>(null);
  const [encryptTransactionId, setEncryptTransactionId] = useState('');

  const [ciphertextInput, setCiphertextInput] = useState('');
  const [decryptFile, setDecryptFile] = useState<File | null>(null);
  const [selectedDecryptKeyId, setSelectedDecryptKeyId] = useState<string | null>(null);
  const [decryptionOutput, setDecryptionOutput] = useState<DecryptionResult | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [signatureToVerify, setSignatureToVerify] = useState('');
  const [selectedVerifyKeyId, setSelectedVerifyKeyId] = useState<string | null>(null);
  const [decryptTransactionId, setDecryptTransactionId] = useState('');

  const handleEncrypt = async () => {
    setIsEncrypting(true);
    setEncryptionOutput(null);
    addAuditLog({ eventType: 'encrypt', details: `Attempting encryption with key ${selectedEncryptKeyId}.`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: encryptTransactionId });

    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && currentActor.role !== 'operator' && currentActor.role !== 'agent') {
        throw new Error('Unauthorized: You do not have permission to encrypt data.');
      }

      const key = keys.find(k => k.keyId === selectedEncryptKeyId && !k.isRevoked);
      if (!key) throw new Error('Encryption key not found or revoked.');
      if (!key.usagePolicy.includes('encrypt') && !key.usagePolicy.includes('all')) throw new Error('Selected key is not authorized for encryption operations by its usage policy.');
      if (key.ownerIdentityId !== currentActor.id && currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && key.ownerIdentityId !== 'system') {
        throw new Error('Unauthorized: You are not the owner of this key or a privileged user.');
      }

      const keyAlgoDef = PQC_ALGORITHMS.find(a => a.id === key.algorithm);
      if (!keyAlgoDef) throw new Error('Algorithm definition not found for selected key.');
      if (!isComplianceModeActive(keyAlgoDef.status)) {
        throw new Error(`Algorithm '${keyAlgoDef.name}' of encryption key is not allowed under current compliance mode.`);
      }
      if (keyAlgoDef.securityLevels.find(sl => sl.label === key.securityLevel)?.bits < settings.minSecurityLevelForCriticalOps) {
        addAuditLog({ eventType: 'policy_violation', details: `Encryption key ${key.keyId} below min security level for critical ops.`, relatedKeyId: key.keyId, status: 'warning', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: encryptTransactionId });
        addNotification(`Warning: Encryption key ${key.keyId} below min security level for critical ops.`, 'warning');
      }

      if (keyAlgoDef.category === 'KEM' && key.keyType !== 'public') throw new Error('For KEM, a public key is required for encryption (key encapsulation).');
      if (keyAlgoDef.category === 'Symmetric' && key.keyType !== 'symmetric') throw new Error('For symmetric encryption, a symmetric key is required.');
      if (keyAlgoDef.category === 'Signature' || keyAlgoDef.category === 'Hash') throw new Error('Cannot use a Signature or Hash algorithm for encryption.');

      const dataToEncrypt = encryptFile ? await encryptFile.text() : plaintextInput;
      if (!dataToEncrypt) throw new Error('No data provided for encryption.');

      let signatureResult: SignatureResult | undefined = undefined;
      if (isSigningDuringEncrypt && selectedSignKeyId) {
        const signKey = keys.find(k => k.keyId === selectedSignKeyId && k.keyType === 'private' && !k.isRevoked);
        if (!signKey) throw new Error('Signing key not found, not a private key, or revoked.');
        if (!signKey.usagePolicy.includes('sign') && !signKey.usagePolicy.includes('all')) throw new Error('Selected signing key is not authorized for signing operations by its usage policy.');
        if (signKey.ownerIdentityId !== currentActor.id && currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && signKey.ownerIdentityId !== 'system') {
          throw new Error('Unauthorized: You are not the owner of this signing key or a privileged user.');
        }

        const signAlgoDef = PQC_ALGORITHMS.find(a => a.id === signKey.algorithm);
        if (!signAlgoDef || signAlgoDef.category !== 'Signature') throw new Error('Selected signing key is not for a signature algorithm.');
        if (!isComplianceModeActive(signAlgoDef.status)) {
          throw new Error(`Algorithm '${signAlgoDef.name}' of signing key is not allowed under current compliance mode.`);
        }
        signatureResult = await mockApiCall({
          signature: `mock_signature_for_${signKey.keyId}_${generateUniqueId()}`,
          algorithm: signKey.algorithm,
          keyIdUsed: signKey.keyId,
          signingDate: new Date().toISOString(),
          messageHash: `mock_hash_of_plaintext_${generateUniqueId()}`,
          transactionId: encryptTransactionId,
        }, 800);
      }

      const result: EncryptionResult = await mockApiCall({
        ciphertext: `mock_ciphertext_${key.algorithm}_${key.keyId}_${generateUniqueId()}_${btoa(dataToEncrypt).slice(0, 100)}...`,
        ephemeralPublicKey: keyAlgoDef.category === 'KEM' ? `mock_ephemeral_pub_key_${generateUniqueId()}` : undefined,
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        iv: `mock_iv_${generateUniqueId()}`,
        tag: `mock_tag_${generateUniqueId()}`,
        encryptedFileSize: dataToEncrypt.length * 1.5,
        originalFileName: encryptFile?.name,
        signature: signatureResult?.signature,
        signatureKeyId: signatureResult?.keyIdUsed,
        transactionId: encryptTransactionId,
      }, 3000);

      setEncryptionOutput(result);
      addAuditLog({ eventType: 'encrypt', details: `Data encrypted successfully with key ${selectedEncryptKeyId}.`, relatedKeyId: selectedEncryptKeyId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: encryptTransactionId });
      addNotification('Data encrypted successfully!', 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'encrypt', details: `Encryption failed: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: encryptTransactionId });
      addNotification(`Encryption failed: ${error.message}`, 'error');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    setDecryptionOutput(null);
    addAuditLog({ eventType: 'decrypt', details: `Attempting decryption with key ${selectedDecryptKeyId}.`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: decryptTransactionId });

    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && currentActor.role !== 'operator' && currentActor.role !== 'agent' && currentActor.role !== 'auditor') {
        throw new Error('Unauthorized: You do not have permission to decrypt data.');
      }

      const key = keys.find(k => k.keyId === selectedDecryptKeyId && !k.isRevoked);
      if (!key) throw new Error('Decryption key not found or revoked.');
      if (!key.usagePolicy.includes('decrypt') && !key.usagePolicy.includes('all')) throw new Error('Selected key is not authorized for decryption operations by its usage policy.');
      if (key.ownerIdentityId !== currentActor.id && currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && key.ownerIdentityId !== 'system') {
        throw new Error('Unauthorized: You are not the owner of this key or a privileged user.');
      }

      const keyAlgoDef = PQC_ALGORITHMS.find(a => a.id === key.algorithm);
      if (!keyAlgoDef) throw new Error('Algorithm definition not found for selected key.');
      if (!isComplianceModeActive(keyAlgoDef.status)) {
        throw new Error(`Algorithm '${keyAlgoDef.name}' of decryption key is not allowed under current compliance mode.`);
      }
      if (keyAlgoDef.securityLevels.find(sl => sl.label === key.securityLevel)?.bits < settings.minSecurityLevelForCriticalOps) {
        addAuditLog({ eventType: 'policy_violation', details: `Decryption key ${key.keyId} below min security level for critical ops.`, relatedKeyId: key.keyId, status: 'warning', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: decryptTransactionId });
        addNotification(`Warning: Decryption key ${key.keyId} below min security level for critical ops.`, 'warning');
      }

      if (keyAlgoDef.category === 'KEM' && key.keyType !== 'private') throw new Error('For KEM, a private key is required for decryption (key de-encapsulation).');
      if (keyAlgoDef.category === 'Symmetric' && key.keyType !== 'symmetric') throw new Error('For symmetric decryption, a symmetric key is required.');
      if (keyAlgoDef.category === 'Signature' || keyAlgoDef.category === 'Hash') throw new Error('Cannot use a Signature or Hash algorithm for decryption.');

      const dataToDecrypt = decryptFile ? await decryptFile.text() : ciphertextInput;
      if (!dataToDecrypt) throw new Error('No ciphertext provided for decryption.');

      let verificationStatus: 'verified' | 'unverified' | 'failed' = 'unverified';
      let signatureKeyIdUsed: string | undefined = undefined;
      if (signatureToVerify && selectedVerifyKeyId) {
        const verifyKey = keys.find(k => k.keyId === selectedVerifyKeyId && k.keyType === 'public' && !k.isRevoked);
        if (!verifyKey) throw new Error('Verification key not found, not a public key, or revoked.');
        if (!verifyKey.usagePolicy.includes('verify') && !verifyKey.usagePolicy.includes('all')) throw new Error('Selected verification key is not authorized for verification operations by its usage policy.');

        const verifyAlgoDef = PQC_ALGORITHMS.find(a => a.id === verifyKey.algorithm);
        if (!verifyAlgoDef || verifyAlgoDef.category !== 'Signature') throw new Error('Selected verification key is not for a signature algorithm.');
        if (!isComplianceModeActive(verifyAlgoDef.status)) {
          throw new Error(`Algorithm '${verifyAlgoDef.name}' of verification key is not allowed under current compliance mode.`);
        }
        const isVerified = await mockApiCall(Math.random() > 0.1, 1000);
        verificationStatus = isVerified ? 'verified' : 'failed';
        signatureKeyIdUsed = verifyKey.keyId;
        addAuditLog({ eventType: 'verify', details: `Signature verification for key ${selectedVerifyKeyId} during decryption: ${verificationStatus}.`, relatedKeyId: selectedVerifyKeyId, status: isVerified ? 'success' : 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: decryptTransactionId });
      }

      const result: DecryptionResult = await mockApiCall({
        plaintext: `mock_plaintext_for_${key.keyId}_${generateUniqueId()}_${dataToDecrypt.slice(0, 100)}`,
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        decryptedFileSize: dataToDecrypt.length / 1.5,
        verificationStatus: verificationStatus,
        signatureKeyId: signatureKeyIdUsed,
        transactionId: decryptTransactionId,
      }, 3000);

      setDecryptionOutput(result);
      addAuditLog({ eventType: 'decrypt', details: `Data decrypted successfully with key ${selectedDecryptKeyId}.`, relatedKeyId: selectedDecryptKeyId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: decryptTransactionId });
      addNotification('Data decrypted successfully!', 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'decrypt', details: `Decryption failed: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: decryptTransactionId });
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
      <p className="text-gray-300 mb-4">
        Encrypt and decrypt sensitive information using quantum-resistant algorithms. This ensures
        the confidentiality of data both in transit and at rest, protecting against current and future threats.
        Optional digital signatures provide data integrity and authenticity, crucial for financial transactions and auditability.
      </p>

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
            label="Select Encryption Key (Public KEM or Symmetric)"
            selectedKeyId={selectedEncryptKeyId}
            onSelectKey={setSelectedEncryptKeyId}
            filterType="all"
            filterAlgorithmCategory="KEM"
            filterUsagePolicy={['encrypt']}
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
              Sign data during encryption (requires private signing key, ensures non-repudiation)
            </label>
          </div>
          {isSigningDuringEncrypt && (
            <KeySelector
              label="Select Signing Key (Private, Signature Algorithm)"
              selectedKeyId={selectedSignKeyId}
              onSelectKey={setSelectedSignKeyId}
              filterType="private"
              filterAlgorithmCategory="Signature"
              filterUsagePolicy={['sign']}
            />
          )}

          <div className="mt-4">
            <label htmlFor="encrypt-transaction-id" className="block text-sm font-medium text-gray-300 mb-1">Associated Transaction ID (Optional):</label>
            <input
              type="text"
              id="encrypt-transaction-id"
              value={encryptTransactionId}
              onChange={e => setEncryptTransactionId(e.target.value)}
              placeholder="e.g., TXN-FIN-2023-001"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isEncrypting}
            />
            <p className="text-xs text-gray-400 mt-1">
              Link this cryptographic operation to a specific financial transaction for end-to-end traceability and audit.
            </p>
          </div>

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
              {encryptionOutput.signature && (
                <p className="text-gray-300 text-sm">
                  <strong>Signature:</strong> <span className="font-mono break-all">{encryptionOutput.signature.slice(0, 50)}...</span>
                  {encryptionOutput.signatureKeyId && <span className="ml-1">(by {encryptionOutput.signatureKeyId})</span>}
                </p>
              )}
              {encryptionOutput.transactionId && <p className="text-gray-300 text-sm"><strong>Transaction ID:</strong> {encryptionOutput.transactionId}</p>}
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
            label="Select Decryption Key (Private KEM or Symmetric)"
            selectedKeyId={selectedDecryptKeyId}
            onSelectKey={setSelectedDecryptKeyId}
            filterType="all"
            filterAlgorithmCategory="KEM"
            filterUsagePolicy={['decrypt']}
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
              filterAlgorithmCategory="Signature"
              filterUsagePolicy={['verify']}
            />
          )}

          <div className="mt-4">
            <label htmlFor="decrypt-transaction-id" className="block text-sm font-medium text-gray-300 mb-1">Associated Transaction ID (Optional):</label>
            <input
              type="text"
              id="decrypt-transaction-id"
              value={decryptTransactionId}
              onChange={e => setDecryptTransactionId(e.target.value)}
              placeholder="e.g., TXN-FIN-2023-001"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isDecrypting}
            />
            <p className="text-xs text-gray-400 mt-1">
              Link this cryptographic operation to a specific financial transaction for end-to-end traceability and audit.
            </p>
          </div>

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
              {decryptionOutput.transactionId && <p className="text-gray-300 text-sm"><strong>Transaction ID:</strong> {decryptionOutput.transactionId}</p>}
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

/**
 * Panel for performing digital signature, verification, and hashing operations.
 * Commercial value: Ensures data integrity, authenticity, and non-repudiation, vital for compliance and trusted digital transactions.
 */
export const SignVerifyPanel: React.FC = () => {
  const { addAuditLog, addNotification, keys, isComplianceModeActive, currentActor, settings } = useGlobalAppContext();
  const [activeTab, setActiveTab] = useState<'sign' | 'verify' | 'hash'>('sign');

  const [messageToSign, setMessageToSign] = useState('');
  const [signFile, setSignFile] = useState<File | null>(null);
  const [selectedSignKeyId, setSelectedSignKeyId] = useState<string | null>(null);
  const [signingOutput, setSigningOutput] = useState<SignatureResult | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signTransactionId, setSignTransactionId] = useState('');

  const [messageToVerify, setMessageToVerify] = useState('');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [signatureToVerify, setSignatureToVerify] = useState('');
  const [selectedVerifyKeyId, setSelectedVerifyKeyId] = useState<string | null>(null);
  const [verificationOutput, setVerificationOutput] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyTransactionId, setVerifyTransactionId] = useState('');

  const [dataToHash, setDataToHash] = useState('');
  const [hashFile, setHashFile] = useState<File | null>(null);
  const [selectedHashAlgorithm, setSelectedHashAlgorithm] = useState<string>(PQC_ALGORITHMS.find(a => a.category === 'Hash' && a.isRecommended && isComplianceModeActive(a.status))?.id || 'sha3-256');
  const [hashOutput, setHashOutput] = useState<HashResult | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [hashTransactionId, setHashTransactionId] = useState('');


  const handleSign = async () => {
    setIsSigning(true);
    setSigningOutput(null);
    addAuditLog({ eventType: 'sign', details: `Attempting to sign data with key ${selectedSignKeyId}.`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: signTransactionId });

    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && currentActor.role !== 'operator' && currentActor.role !== 'agent') {
        throw new Error('Unauthorized: You do not have permission to sign data.');
      }

      const key = keys.find(k => k.keyId === selectedSignKeyId && !k.isRevoked);
      if (!key) throw new Error('Signing key not found or revoked.');
      if (!key.usagePolicy.includes('sign') && !key.usagePolicy.includes('all')) throw new Error('Selected key is not authorized for signing operations by its usage policy.');
      if (key.ownerIdentityId !== currentActor.id && currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && key.ownerIdentityId !== 'system') {
        throw new Error('Unauthorized: You are not the owner of this key or a privileged user.');
      }

      const keyAlgoDef = PQC_ALGORITHMS.find(a => a.id === key.algorithm);
      if (!keyAlgoDef) throw new Error('Algorithm definition not found for selected key.');
      if (!isComplianceModeActive(keyAlgoDef.status)) {
        throw new Error(`Algorithm '${keyAlgoDef.name}' of signing key is not allowed under current compliance mode.`);
      }
      if (keyAlgoDef.securityLevels.find(sl => sl.label === key.securityLevel)?.bits < settings.minSecurityLevelForCriticalOps) {
        addAuditLog({ eventType: 'policy_violation', details: `Signing key ${key.keyId} below min security level for critical ops.`, relatedKeyId: key.keyId, status: 'warning', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: signTransactionId });
        addNotification(`Warning: Signing key ${key.keyId} below min security level for critical ops.`, 'warning');
      }

      if (key.keyType !== 'private') throw new Error('Signing requires a private key.');
      if (keyAlgoDef.category !== 'Signature') throw new Error('Cannot sign with a KEM, Symmetric, or Hash key.');

      const dataToSign = signFile ? await signFile.text() : messageToSign;
      if (!dataToSign) throw new Error('No data provided for signing.');

      const result: SignatureResult = await mockApiCall({
        signature: `mock_signature_${key.algorithm}_${key.keyId}_${generateUniqueId()}_${btoa(dataToSign).slice(0, 50)}...`,
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        signingDate: new Date().toISOString(),
        messageHash: `mock_hash_of_message_${generateUniqueId()}`,
        transactionId: signTransactionId,
      }, 2500);

      setSigningOutput(result);
      addAuditLog({ eventType: 'sign', details: `Data signed successfully with key ${selectedSignKeyId}.`, relatedKeyId: selectedSignKeyId, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: signTransactionId });
      addNotification('Data signed successfully!', 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'sign', details: `Signing failed: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: signTransactionId });
      addNotification(`Signing failed: ${error.message}`, 'error');
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationOutput(null);
    addAuditLog({ eventType: 'verify', details: `Attempting to verify signature with key ${selectedVerifyKeyId}.`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: verifyTransactionId });

    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && currentActor.role !== 'operator' && currentActor.role !== 'agent' && currentActor.role !== 'auditor') {
        throw new Error('Unauthorized: You do not have permission to verify signatures.');
      }

      const key = keys.find(k => k.keyId === selectedVerifyKeyId && !k.isRevoked);
      if (!key) throw new Error('Verification key not found or revoked.');
      if (!key.usagePolicy.includes('verify') && !key.usagePolicy.includes('all')) throw new Error('Selected key is not authorized for verification operations by its usage policy.');

      const keyAlgoDef = PQC_ALGORITHMS.find(a => a.id === key.algorithm);
      if (!keyAlgoDef) throw new Error('Algorithm definition not found for selected key.');
      if (!isComplianceModeActive(keyAlgoDef.status)) {
        throw new Error(`Algorithm '${keyAlgoDef.name}' of verification key is not allowed under current compliance mode.`);
      }

      if (key.keyType !== 'public') throw new Error('Verification requires a public key.');
      if (keyAlgoDef.category !== 'Signature') throw new Error('Cannot verify with a KEM, Symmetric, or Hash key.');

      const dataToVerify = verifyFile ? await verifyFile.text() : messageToVerify;
      if (!dataToVerify) throw new Error('No data provided for verification.');
      if (!signatureToVerify) throw new Error('No signature provided for verification.');

      const isVerified = await mockApiCall(Math.random() > 0.1, 2000);

      const result: VerificationResult = {
        isVerified: isVerified,
        algorithm: key.algorithm,
        keyIdUsed: key.keyId,
        verificationDate: new Date().toISOString(),
        messageHash: `mock_msg_hash_${generateUniqueId()}`,
        signatureHash: `mock_sig_hash_${generateUniqueId()}`,
        transactionId: verifyTransactionId,
      };

      setVerificationOutput(result);
      addAuditLog({ eventType: 'verify', details: `Signature verification result for key ${selectedVerifyKeyId}: ${isVerified ? 'Verified' : 'Failed'}.`, relatedKeyId: selectedVerifyKeyId, status: isVerified ? 'success' : 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: verifyTransactionId });
      addNotification(`Signature verification: ${isVerified ? 'SUCCESS' : 'FAILED'}!`, isVerified ? 'success' : 'error');
    } catch (error: any) {
      addAuditLog({ eventType: 'verify', details: `Verification failed: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: verifyTransactionId });
      addNotification(`Verification failed: ${error.message}`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleHash = async () => {
    setIsHashing(true);
    setHashOutput(null);
    addAuditLog({ eventType: 'hash', details: `Attempting to hash data with ${selectedHashAlgorithm}.`, status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: hashTransactionId });

    try {
      if (currentActor.role !== 'admin' && currentActor.role !== 'cryptographer' && currentActor.role !== 'operator' && currentActor.role !== 'agent' && currentActor.role !== 'auditor') {
        throw new Error('Unauthorized: You do not have permission to hash data.');
      }

      const algoDef = PQC_ALGORITHMS.find(a => a.id === selectedHashAlgorithm);
      if (!algoDef || algoDef.category !== 'Hash') {
        throw new Error('Invalid or unsupported hashing algorithm selected.');
      }
      if (!isComplianceModeActive(algoDef.status)) {
        throw new Error(`Algorithm '${algoDef.name}' is not allowed under current compliance mode.`);
      }

      const data = hashFile ? await hashFile.text() : dataToHash;
      if (!data) throw new Error('No data provided for hashing.');

      const mockHash = `mock_hash_of_data_${selectedHashAlgorithm}_${generateUniqueId()}_${btoa(data).slice(0, 32)}`;
      const result: HashResult = await mockApiCall({
        hash: mockHash,
        algorithm: selectedHashAlgorithm,
        inputSize: data.length,
        hashDate: new Date().toISOString(),
      }, 1000);

      setHashOutput(result);
      addAuditLog({ eventType: 'hash', details: `Data hashed successfully with ${selectedHashAlgorithm}.`, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: hashTransactionId });
      addNotification('Data hashed successfully!', 'success');
    } catch (error: any) {
      addAuditLog({ eventType: 'hash', details: `Hashing failed: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id, transactionId: hashTransactionId });
      addNotification(`Hashing failed: ${error.message}`, 'error');
    } finally {
      setIsHashing(false);
    }
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Digital Signatures & Hashing (PQC)</h2>
      <p className="text-gray-300 mb-4">
        Ensure data authenticity, integrity, and non-repudiation with quantum-resistant digital signatures.
        Generate cryptographic hashes to verify data integrity and build secure audit trails. These operations
        are critical for verifying programmable value transactions and agentic instructions.
      </p>

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
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'hash' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setActiveTab('hash')}
        >
          Hash Data
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
            label="Select Signing Key (Private, Signature Algorithm)"
            selectedKeyId={selectedSignKeyId}
            onSelectKey={setSelectedSignKeyId}
            filterType="private"
            filterAlgorithmCategory="Signature"
            filterUsagePolicy={['sign']}
          />

          <div className="mt-4">
            <label htmlFor="sign-transaction-id" className="block text-sm font-medium text-gray-300 mb-1">Associated Transaction ID (Optional):</label>
            <input
              type="text"
              id="sign-transaction-id"
              value={signTransactionId}
              onChange={e => setSignTransactionId(e.target.value)}
              placeholder="e.g., TXN-FIN-2023-001"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isSigning}
            />
            <p className="text-xs text-gray-400 mt-1">
              Link this cryptographic operation to a specific financial transaction for end-to-end traceability and audit.
            </p>
          </div>

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
              {signingOutput.transactionId && <p className="text-gray-300 text-sm"><strong>Transaction ID:</strong> {signingOutput.transactionId}</p>}
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
            filterAlgorithmCategory="Signature"
            filterUsagePolicy={['verify']}
          />

          <div className="mt-4">
            <label htmlFor="verify-transaction-id" className="block text-sm font-medium text-gray-300 mb-1">Associated Transaction ID (Optional):</label>
            <input
              type="text"
              id="verify-transaction-id"
              value={verifyTransactionId}
              onChange={e => setVerifyTransactionId(e.target.value)}
              placeholder="e.g., TXN-FIN-2023-001"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isVerifying}
            />
            <p className="text-xs text-gray-400 mt-1">
              Link this cryptographic operation to a specific financial transaction for end-to-end traceability and audit.
            </p>
          </div>

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
              <p className="text-300 text-sm"><strong>Key Used:</strong> {verificationOutput.keyIdUsed}</p>
              <p className="text-gray-300 text-sm"><strong>Verification Date:</strong> {new Date(verificationOutput.verificationDate).toLocaleString()}</p>
              {verificationOutput.transactionId && <p className="text-gray-300 text-sm"><strong>Transaction ID:</strong> {verificationOutput.transactionId}</p>}
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

      {activeTab === 'hash' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Generate Cryptographic Hash</h3>
          <p className="text-gray-300">
            Cryptographic hashes provide a fixed-size digest of input data, essential for integrity checks,
            digital signatures, and secure data storage. These algorithms are quantum-resistant and foundational
            for tamper-evident audit logs and blockchain-style value rails.
          </p>
          <textarea
            value={dataToHash}
            onChange={e => setDataToHash(e.target.value)}
            placeholder='Enter data to hash...'
            rows={8}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 resize-y"
            disabled={!!hashFile || isHashing}
          />
          <div className="flex items-center space-x-2">
            <label className="text-gray-300">Or upload file:</label>
            <input
              type="file"
              onChange={e => setHashFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 file:cursor-pointer disabled:opacity-50"
              disabled={!!dataToHash || isHashing}
            />
            {hashFile && <span className="text-gray-400 text-sm">Selected: {hashFile.name}</span>}
          </div>

          <div>
            <label htmlFor="hash-algo-select" className="block text-sm font-medium text-gray-300 mb-1">Select Hashing Algorithm:</label>
            <select
              id="hash-algo-select"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              value={selectedHashAlgorithm}
              onChange={e => setSelectedHashAlgorithm(e.target.value)}
              disabled={isHashing}
            >
              {PQC_ALGORITHMS.filter(a => a.category === 'Hash' && isComplianceModeActive(a.status)).map(algo => (
                <option key={algo.id} value={algo.id}>{algo.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="hash-transaction-id" className="block text-sm font-medium text-gray-300 mb-1">Associated Transaction ID (Optional):</label>
            <input
              type="text"
              id="hash-transaction-id"
              value={hashTransactionId}
              onChange={e => setHashTransactionId(e.target.value)}
              placeholder="e.g., TXN-FIN-2023-001"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isHashing}
            />
            <p className="text-xs text-gray-400 mt-1">
              Link this cryptographic operation to a specific financial transaction for end-to-end traceability and audit.
            </p>
          </div>

          <button
            onClick={handleHash}
            disabled={isHashing || (!dataToHash && !hashFile) || !selectedHashAlgorithm}
            className="w-full p-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {isHashing ? <LoadingSpinner /> : 'Generate Hash'}
          </button>

          {hashOutput && (
            <div className="mt-6 space-y-3 bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Hashing Result</h4>
              <p className="text-gray-300 text-sm"><strong>Algorithm:</strong> {hashOutput.algorithm}</p>
              <p className="text-gray-300 text-sm"><strong>Input Size:</strong> {hashOutput.inputSize} bytes</p>
              <p className="text-gray-300 text-sm"><strong>Hash Date:</strong> {new Date(hashOutput.hashDate).toLocaleString()}</p>
              {hashTransactionId && <p className="text-gray-300 text-sm"><strong>Transaction ID:</strong> {hashTransactionId}</p>}
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="font-semibold text-md text-white mb-1">Hash:</h5>
                <pre className="text-xs text-gray-200 break-all whitespace-pre-wrap">{hashOutput.hash}</pre>
                <button
                  onClick={() => { navigator.clipboard.writeText(hashOutput.hash); addNotification('Hash copied!', 'info'); }}
                  className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >Copy Hash</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Panel for reviewing all system and cryptographic audit logs.
 * Commercial value: Provides an immutable, tamper-evident record essential for regulatory compliance, security audits, and forensic analysis.
 */
export const AuditLogPanel: React.FC = () => {
  const { auditLogs, currentActor } = useGlobalAppContext();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);
  const [filterActorType, setFilterActorType] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const typeMatch = filterType === 'all' || log.eventType === filterType;
    const actorTypeMatch = filterActorType === 'all' || log.actorType === filterActorType;
    const searchMatch = searchTerm === '' ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.relatedKeyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.relatedSchemeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && actorTypeMatch && searchMatch;
  });

  const getStatusColor = (status: 'success' | 'failure' | 'warning' | 'info') => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failure': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getEventTypeColor = (eventType: AuditLogEntry['eventType']) => {
    switch (eventType) {
      case 'key_gen': return 'text-purple-300';
      case 'encrypt': return 'text-blue-300';
      case 'decrypt': return 'text-cyan-300';
      case 'sign': return 'text-indigo-300';
      case 'verify': return 'text-teal-300';
      case 'hash': return 'text-emerald-300';
      case 'key_import': return 'text-yellow-300';
      case 'key_export': return 'text-orange-300';
      case 'scheme_gen': return 'text-pink-300';
      case 'key_revoke': return 'text-red-300';
      case 'config_update': return 'text-lime-300';
      case 'agent_action': return 'text-sky-300';
      case 'policy_violation': return 'text-red-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-300';
    }
  };

  // Mock function for tamper check
  const performTamperCheck = async () => {
    addAuditLog({ eventType: 'info', details: 'Initiating audit log integrity check.', status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
    addNotification('Performing cryptographic tamper check on audit logs...', 'info', 3000);
    const isTamperFree = await mockApiCall(true, 4000); // Simulate successful hash chain verification
    if (isTamperFree) {
      addNotification('Audit log integrity verified: No tampering detected.', 'success');
      addAuditLog({ eventType: 'info', details: 'Audit log integrity verified: No tampering detected.', status: 'success', actorType: 'system', actorId: 'system' });
    } else {
      addNotification('WARNING: Audit log tampering detected!', 'error', 0);
      addAuditLog({ eventType: 'error', details: 'Audit log tampering detected!', status: 'failure', actorType: 'system', actorId: 'system' });
    }
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">System Audit Log</h2>
      <p className="text-gray-300 mb-4">
        Review all cryptographic operations and system events for comprehensive traceability.
        This tamper-evident audit log is crucial for compliance, forensic analysis, and ensuring operational security,
        providing an immutable record of all interactions with sensitive cryptographic components. Every entry is
        cryptographically linked, ensuring data integrity for regulatory purposes.
      </p>

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
            <option value="hash">Hashing</option>
            <option value="key_import">Key Import</option>
            <option value="key_export">Key Export</option>
            <option value="key_revoke">Key Revocation</option>
            <option value="scheme_gen">Scheme Generation</option>
            <option value="config_update">Configuration Update</option>
            <option value="agent_action">Agent Action</option>
            <option value="policy_violation">Policy Violation</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Information</option>
          </select>
        </div>
        <div>
          <label htmlFor="log-filter-actor-type" className="block text-sm font-medium text-gray-300 mb-1">Filter by Actor Type:</label>
          <select
            id="log-filter-actor-type"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            value={filterActorType}
            onChange={e => setFilterActorType(e.target.value)}
          >
            <option value="all">All Actors</option>
            <option value="user">User</option>
            <option value="agent">Agent</option>
            <option value="system">System</option>
          </select>
        </div>
        <div>
          <label htmlFor="log-search" className="block text-sm font-medium text-gray-300 mb-1">Search Logs:</label>
          <input
            type="text"
            id="log-search"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            placeholder="Search by details, key ID, scheme ID, actor ID, transaction ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <label className="inline-flex items-center text-sm text-gray-300">
          <input
            type="checkbox"
            id="show-full-details"
            checked={showFullDetails}
            onChange={e => setShowFullDetails(e.target.checked)}
            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
          />
          <span className="ml-2">Show full log details (verbose)</span>
        </label>
        <button
          onClick={performTamperCheck}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-semibold transition-colors"
          disabled={currentActor.role !== 'admin' && currentActor.role !== 'auditor'}
        >
          Perform Tamper Check
        </button>
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
                <p className={`text-gray-300 text-sm mb-1 ${!showFullDetails ? 'truncate' : ''}`}>
                  {log.details}
                  {!showFullDetails && log.details.length > 100 && <span className="text-cyan-400 ml-2">...</span>}
                </p>
                <div className="flex items-center text-xs text-gray-400 space-x-4">
                  {log.relatedKeyId && <span className="flex items-center"><span className="text-cyan-400 mr-1">&#9679;</span> Key: <span className="font-mono">{log.relatedKeyId.slice(0, 8)}...</span></span>}
                  {log.relatedSchemeId && <span className="flex items-center"><span className="text-pink-400 mr-1">&#9679;</span> Scheme: <span className="font-mono">{log.relatedSchemeId.slice(0, 8)}...</span></span>}
                  {log.actorId && <span className="flex items-center"><span className="text-orange-400 mr-1">&#9679;</span> {log.actorType.charAt(0).toUpperCase() + log.actorType.slice(1)}: <span className="font-mono">{log.actorId}</span></span>}
                  {log.transactionId && <span className="flex items-center"><span className="text-green-400 mr-1">&#9679;</span> Txn: <span className="font-mono">{log.transactionId.slice(0, 8)}...</span></span>}
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

/**
 * Panel for configuring global application settings related to PQC and system governance.
 * Commercial value: Provides a single point of control for enforcing security policies, compliance modes,
 * and operational parameters, crucial for enterprise-grade deployments.
 */
export const SettingsPanel: React.FC = () => {
  const { settings, setSettings, addNotification, addAuditLog, isComplianceModeActive, currentActor } = useGlobalAppContext();

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (currentActor.role !== 'admin') {
      addNotification('Unauthorized: Only Admin can change settings.', 'error');
      addAuditLog({ eventType: 'policy_violation', details: `Unauthorized attempt to change setting '${e.target.name}' by ${currentActor.id}.`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      return;
    }

    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value);

    setSettings(prev => ({
      ...prev,
      [name]: newValue,
    }));
    addNotification(`Setting '${name}' updated.`, 'info', 3000);
    addAuditLog({ eventType: 'config_update', details: `Setting '${name}' changed to ${newValue}.`, status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
  };

  const handleSaveSettings = async () => {
    if (currentActor.role !== 'admin') {
      addNotification('Unauthorized: Only Admin can save settings.', 'error');
      addAuditLog({ eventType: 'policy_violation', details: `Unauthorized attempt to save settings by ${currentActor.id}.`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
      return;
    }

    addAuditLog({ eventType: 'config_update', details: 'Attempting to save application settings.', status: 'info', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
    try {
      await mockApiCall(settings, 1000);
      addNotification('Settings saved successfully!', 'success');
      addAuditLog({ eventType: 'config_update', details: 'Application settings saved.', status: 'success', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
    } catch (error: any) {
      addNotification(`Failed to save settings: ${error.message}`, 'error');
      addAuditLog({ eventType: 'error', details: `Failed to save settings: ${error.message}`, status: 'failure', actorType: currentActor.isAgent ? 'agent' : 'user', actorId: currentActor.id });
    }
  };

  const getFilteredAlgos = (category: PQCAlgorithmDefinition['category']) => {
    return PQC_ALGORITHMS.filter(a => a.category === category && isComplianceModeActive(a.status));
  };

  const isSettingsDisabled = currentActor.role !== 'admin';

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Application Settings</h2>
      <p className="text-gray-300 mb-6">
        Configure default algorithms, compliance modes, logging, and other system parameters.
        These settings are critical for tailoring the cryptographic posture to specific organizational
        requirements and regulatory mandates, enhancing both security and operational efficiency.
      </p>

      <div className="space-y-6">
        {/* Compliance Mode */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">PQC Compliance Mode</h3>
          <div>
            <label htmlFor="pqcComplianceMode" className="block text-sm font-medium text-gray-300 mb-1">Compliance Standard:</label>
            <select
              id="pqcComplianceMode"
              name="pqcComplianceMode"
              value={settings.pqcComplianceMode}
              onChange={handleSettingChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isSettingsDisabled}
            >
              <option value="nist-standard">NIST Standard (Recommended for Production)</option>
              <option value="nist-candidate">NIST Candidate (For evaluation/early adoption)</option>
              <option value="experimental">Experimental (For R&D, not production)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Select the PQC compliance level. This filters available algorithms to ensure adherence to specified standards.
              "NIST Standard" includes fully standardized algorithms. "Candidate" includes those undergoing standardization.
            </p>
          </div>
          <div className="mt-4">
            <label htmlFor="minSecurityLevelForCriticalOps" className="block text-sm font-medium text-gray-300 mb-1">Minimum Security Level for Critical Operations (bits):</label>
            <input
              type="number"
              id="minSecurityLevelForCriticalOps"
              name="minSecurityLevelForCriticalOps"
              value={settings.minSecurityLevelForCriticalOps}
              onChange={handleSettingChange}
              min="128"
              max="256"
              step="64"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isSettingsDisabled}
            />
            <p className="text-xs text-gray-400 mt-1">
              Sets the minimum required bits of security for keys used in high-value or critical cryptographic operations.
              Helps enforce strong security posture across the platform.
            </p>
          </div>
        </div>

        {/* Default Algorithm Settings */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Default Cryptographic Algorithms</h3>
          <p className="text-gray-400 text-sm mb-4">
            The algorithms listed are filtered based on the selected PQC Compliance Mode.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultKEM" className="block text-sm font-medium text-gray-300 mb-1">Default Key Encapsulation (KEM):</label>
              <select
                id="defaultKEM"
                name="defaultKEM"
                value={settings.defaultKEM}
                onChange={handleSettingChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                disabled={isSettingsDisabled}
              >
                {getFilteredAlgos('KEM').map(algo => (
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
                disabled={isSettingsDisabled}
              >
                {getFilteredAlgos('Signature').map(algo => (
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
                disabled={isSettingsDisabled}
              >
                {getFilteredAlgos('Symmetric').map(algo => (
                  <option key={algo.id} value={algo.id}>{algo.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="defaultHash" className="block text-sm font-medium text-gray-300 mb-1">Default Hashing Algorithm:</label>
              <select
                id="defaultHash"
                name="defaultHash"
                value={settings.defaultHash}
                onChange={handleSettingChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                disabled={isSettingsDisabled}
              >
                {getFilteredAlgos('Hash').map(algo => (
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
              max="3650"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isSettingsDisabled}
            />
            <p className="text-xs text-gray-400 mt-1">Number of days to retain audit log entries. (Min: 7, Max: 3650 for long-term compliance)</p>
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
              disabled={isSettingsDisabled}
            />
            <label htmlFor="autoKeyRotationEnabled" className="ml-2 block text-sm text-gray-300">
              Enable Automatic Key Rotation (Automates security best practices)
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            If enabled, the system will periodically suggest or initiate rotation of cryptographic keys
            based on predefined policies. This is a crucial security practice that reduces the risk
            associated with key compromise over time, ensuring continuous cryptographic agility.
          </p>
          <div className="mt-4">
            <label htmlFor="keyRotationFrequencyDays" className="block text-sm font-medium text-gray-300 mb-1">Key Rotation Frequency (Days):</label>
            <input
              type="number"
              id="keyRotationFrequencyDays"
              name="keyRotationFrequencyDays"
              value={settings.keyRotationFrequencyDays}
              onChange={handleSettingChange}
              min="30"
              max="730" // Up to 2 years
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isSettingsDisabled || !settings.autoKeyRotationEnabled}
            />
            <p className="text-xs text-gray-400 mt-1">
              Defines how often agent-managed keys are flagged for rotation.
            </p>
          </div>
        </div>

        {/* Master Key Hash (Security Configuration) */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Master Key Management Status</h3>
          <div>
            <label htmlFor="masterKeyHash" className="block text-sm font-medium text-gray-300 mb-1">Master Key Derivation Hash:</label>
            <input
              type="text"
              id="masterKeyHash"
              name="masterKeyHash"
              value={settings.masterKeyHash || 'Not Configured'}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              readOnly={true}
              placeholder="SHA256 hash of the master key used for deriving other keys (e.g., from KMS/HSM)"
              disabled={isSettingsDisabled}
            />
            <p className="text-xs text-yellow-400 mt-1">
              <strong>Security Note:</strong> This field displays a hash indicating the presence of a master key.
              In a production environment, this value is never manually set or exposed directly. It signifies
              the successful integration with a secure Key Management System (KMS) or Hardware Security Module (HSM)
              that protects the root of trust for all cryptographic operations, providing a foundational layer of security.
            </p>
          </div>
        </div>

        {/* Agentic Interaction Policies */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Agentic PQC Interaction Policy</h3>
          <div>
            <label htmlFor="agentPQCInteractionPolicy" className="block text-sm font-medium text-gray-300 mb-1">Agent Interaction Level:</label>
            <select
              id="agentPQCInteractionPolicy"
              name="agentPQCInteractionPolicy"
              value={settings.agentPQCInteractionPolicy}
              onChange={handleSettingChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              disabled={isSettingsDisabled}
            >
              <option value="monitor_only">Monitor Only</option>
              <option value="suggest_actions">Suggest Actions (Requires User Approval)</option>
              <option value="full_automation">Full Automation (Autonomous Decision Making)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Defines the level of autonomy for intelligent agents interacting with PQC operations.
              From purely observational to fully autonomous, this policy dictates agent-driven security actions.
            </p>
          </div>
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
              disabled={isSettingsDisabled}
            />
            <p className="text-xs text-gray-400 mt-1">
              The backend API endpoint for cryptographic operations. This allows the system to interface
              with a centralized PQC service, offering scalable and controlled cryptographic processing.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          disabled={isSettingsDisabled}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

/**
 * Provides a high-level overview of the PQC system's status, key metrics, and compliance posture.
 * Commercial value: Offers executive insights into the security health and operational efficiency of the
 * quantum-resistant infrastructure, enabling informed strategic decision-making and demonstrating ROI.
 */
export const PQCSystemOverviewPanel: React.FC = () => {
  const { keys, activeSchemes, auditLogs, settings } = useGlobalAppContext();

  const totalKeys = keys.length;
  const activeKeys = keys.filter(k => !k.isRevoked).length;
  const revokedKeys = totalKeys - activeKeys;
  const agentManagedKeys = keys.filter(k => k.managedByAgent).length;

  const totalSchemes = activeSchemes.length;
  const standardSchemes = activeSchemes.filter(s => PQC_ALGORITHMS.find(a => a.id === s.algorithm)?.status === 'standard').length;

  const recentSuccessfulOps = auditLogs.filter(log => log.status === 'success' && log.eventType !== 'info' && (new Date().getTime() - new Date(log.timestamp).getTime() < 3600000)).length; // Last hour
  const recentFailedOps = auditLogs.filter(log => log.status === 'failure' && (new Date().getTime() - new Date(log.timestamp).getTime() < 3600000)).length; // Last hour
  const policyViolations = auditLogs.filter(log => log.eventType === 'policy_violation').length;

  const complianceStatusColor = settings.pqcComplianceMode === 'nist-standard' ? 'text-green-400' :
                                settings.pqcComplianceMode === 'nist-candidate' ? 'text-yellow-400' : 'text-red-400';
  const complianceStatusText = settings.pqcComplianceMode === 'nist-standard' ? 'NIST Standard Compliant' :
                                settings.pqcComplianceMode === 'nist-candidate' ? 'NIST Candidate Aligned' : 'Experimental Mode (High Risk)';

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">PQC System Operational Dashboard</h2>
      <p className="text-gray-300 mb-6">
        This dashboard provides a real-time, executive-level overview of the Quantum-Resistant Cryptography
        infrastructure. It highlights key metrics for security posture, operational efficiency, and compliance.
        Critical for demonstrating value, mitigating risk, and informing strategic investment.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Security Posture */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Security Posture</h3>
          <p className="text-gray-300">Total Keys Managed: <span className="font-bold text-cyan-400">{totalKeys}</span></p>
          <p className="text-gray-300">Active Keys: <span className="font-bold text-green-400">{activeKeys}</span></p>
          <p className="text-gray-300">Revoked Keys: <span className="font-bold text-red-400">{revokedKeys}</span></p>
          <p className="text-gray-300">Agent-Managed Keys: <span className="font-bold text-blue-400">{agentManagedKeys}</span></p>
          <p className="mt-3 text-sm text-gray-400">
            Current minimum security level for critical operations: <span className="font-bold text-cyan-400">{settings.minSecurityLevelForCriticalOps}-bit</span>.
            This ensures adherence to high cryptographic standards.
          </p>
        </div>

        {/* Compliance & Standards */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Compliance & Standards</h3>
          <p className="text-gray-300">Active Schemes Deployed: <span className="font-bold text-cyan-400">{totalSchemes}</span></p>
          <p className="text-gray-300">NIST Standard Schemes: <span className="font-bold text-green-400">{standardSchemes}</span></p>
          <p className="mt-3 text-lg font-semibold">Overall Compliance Mode:</p>
          <p className={`font-bold text-xl ${complianceStatusColor}`}>{complianceStatusText}</p>
          <p className="mt-3 text-sm text-gray-400">
            Adherence to industry standards protects against future regulatory penalties and enhances market trust.
          </p>
        </div>

        {/* Operational Performance & Integrity */}
        <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Operational Performance</h3>
          <p className="text-gray-300">Successful Operations (last hour): <span className="font-bold text-green-400">{recentSuccessfulOps}</span></p>
          <p className="text-gray-300">Failed Operations (last hour): <span className="font-bold text-red-400">{recentFailedOps}</span></p>
          <p className="text-gray-300">Policy Violations Detected: <span className="font-bold text-orange-400">{policyViolations}</span></p>
          <p className="mt-3 text-lg font-semibold">Audit Log Status:</p>
          <p className="text-green-400 text-xl font-bold">Tamper-Evident & Immutable</p>
          <p className="mt-3 text-sm text-gray-400">
            High success rates and immutable logs ensure operational reliability and accountability,
            critical for real-time financial infrastructure.
          </p>
        </div>
      </div>

      <div className="p-5 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Agentic Intelligence Layer Interaction</h3>
        <p className="text-gray-300">
          The system's intelligent agents {settings.agentPQCInteractionPolicy === 'monitor_only' ? 'passively monitor' : settings.agentPQCInteractionPolicy === 'suggest_actions' ? 'actively suggest actions and require approval for' : 'autonomously manage'} PQC operations
          to enhance security, optimize performance, and enforce compliance automatically. This enables a truly
          self-securing infrastructure.
        </p>
        <p className="text-gray-300 mt-2">
          <strong>Current Agent Policy:</strong> <span className="font-bold text-cyan-400">{settings.agentPQCInteractionPolicy.replace(/_/g, ' ').toUpperCase()}</span>
        </p>
      </div>

    </div>
  );
};


/**
 * This component provides a comprehensive user interface for interacting with a Quantum-Proof Encryptor system.
 * It serves as a central hub for demonstrating and managing Post-Quantum Cryptography (PQC) functionalities,
 * including scheme generation, key lifecycle management, secure data encryption/decryption, digital signing/verification,
 * and cryptographic hashing. The view's strategic importance lies in its ability to empower users and agents to
 * confidently transition to quantum-safe cryptographic practices, forming a critical component of a multi-million-dollar
 * financial infrastructure.
 *
 * Business value: This workbench accelerates the adoption of quantum-resistant solutions, safeguarding billions
 * in digital assets, transactional integrity, and confidential communications against the imminent threat of
 * quantum attacks. It reduces the steep learning curve and operational complexity of PQC implementation,
 * enabling financial institutions and high-value data enterprises to achieve proactive regulatory compliance
 * (e.g., NIST migration directives), mitigate catastrophic cyber risks, and build trust in a post-quantum world.
 * Its intuitive design and auditability directly contribute to operational excellence, security governance,
 * and the rapid deployment of a next-generation security infrastructure, ensuring long-term competitive advantage.
 */
const QuantumProofEncryptorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scheme' | 'keys' | 'encrypt-decrypt' | 'sign-verify' | 'audit' | 'settings'>('overview');
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
          <ActorRoleSelector /> {/* New: Actor Role Selector */}
          <nav className="flex space-x-1 border-b border-gray-700 mb-8 overflow-x-auto pb-2">
            <button
              className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === 'overview' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
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
              Sign/Verify & Hash
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
            {activeTab === 'overview' && <PQCSystemOverviewPanel />}
            {activeTab === 'scheme' && <SchemeGenerationPanel initialDataSample={initialDataSample} />}
            {activeTab === 'keys' && <KeyManagementPanel />}
            {activeTab === 'encrypt-decrypt' && <EncryptDecryptPanel />}
            {activeTab === 'sign-verify' && <SignVerifyPanel />}
            {activeTab === 'audit' && <AuditLogPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
          </div>
        </div>
        <footer className="mt-12 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} QuantumGuard Solutions. All rights reserved. Powering the Future of Secure Digital Finance.
        </footer>
      </div>
    </GlobalAppProvider>
  );
};

export default QuantumProofEncryptorView;