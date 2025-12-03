// components/views/developer/ApiContractsView.tsx
import React, { useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import Card from '../../Card'; // Assuming Card is a general-purpose UI component
// For UI elements, often a UI library like Material-UI, Ant Design, or Tailwind CSS utilities are used.
// We'll simulate these with generic elements and Tailwind classes.

// --- 0. UTILITY TYPES AND CONSTANTS (Approx. 500 lines) ---
/**
 * @typedef {('GET'|'POST'|'PUT'|'DELETE'|'PATCH'|'HEAD'|'OPTIONS'|'TRACE')} HttpMethod
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE';

/**
 * @typedef {('path'|'query'|'header'|'cookie')} ParameterIn
 */
export type ParameterIn = 'path' | 'query' | 'header' | 'cookie';

/**
 * @typedef {('string'|'number'|'integer'|'boolean'|'array'|'object')} SchemaType
 */
export type SchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

/**
 * @typedef {('api_key'|'http_basic'|'http_bearer'|'oauth2'|'openid_connect')} SecuritySchemeType
 */
export type SecuritySchemeType = 'api_key' | 'http_basic' | 'http_bearer' | 'oauth2' | 'openid_connect';

/**
 * @typedef {('pending'|'success'|'failed'|'rolled_back')} DeploymentStatusEnum
 */
export type DeploymentStatusEnum = 'pending' | 'success' | 'failed' | 'rolled_back';

/**
 * @typedef {('dev'|'staging'|'production')} Environment
 */
export type Environment = 'dev' | 'staging' | 'production';

/**
 * @typedef {('owner'|'editor'|'viewer')} Role
 */
export type Role = 'owner' | 'editor' | 'viewer';

export interface IKeyValuePair {
    key: string;
    value: string;
}

export interface IOpenApiExample {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
}

/**
 * @interface IOpenApiReference
 * @description Represents a reference to another schema object.
 */
export interface IOpenApiReference {
    $ref: string;
}

/**
 * @interface ISchemaObjectProperty
 * @description Represents a property within a JSON Schema object.
 */
export interface ISchemaObjectProperty {
    name?: string; // Not part of OpenAPI spec, but useful for UI manipulation
    type?: SchemaType | (SchemaType & string)[]; // Optional here, required in ISchemaObject
    format?: string;
    description?: string;
    example?: any;
    default?: any;
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    externalDocs?: { url: string; description?: string; };
    deprecated?: boolean;
    xml?: { name?: string; namespace?: string; prefix?: string; attribute?: boolean; wrapped?: boolean; };
    enum?: any[];
    // For number/integer types
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    // For string types
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    // For array types
    items?: ISchemaObject | IOpenApiReference;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    // For object types
    properties?: { [key: string]: ISchemaObjectProperty | IOpenApiReference };
    additionalProperties?: boolean | ISchemaObject | IOpenApiReference;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    // AllOf, OneOf, AnyOf, Not
    allOf?: (ISchemaObject | IOpenApiReference)[];
    oneOf?: (ISchemaObject | IOpenApiReference)[];
    anyOf?: (ISchemaObject | IOpenApiReference)[];
    not?: ISchemaObject | IOpenApiReference;
    // Discriminator
    discriminator?: { propertyName: string; mapping?: { [key: string]: string; }; };
    // Other JSON Schema properties
    title?: string;
    // Recursion tracking (not part of OpenAPI spec, but useful for client-side parsing)
    _isRecursive?: boolean;
    _resolvedType?: string; // For displaying resolved types in UI
}

/**
 * @interface ISchemaObject
 * @description Represents a full JSON Schema definition for a component.
 */
export interface ISchemaObject extends ISchemaObjectProperty {
    // Top-level schema properties
    type: SchemaType | (SchemaType & string)[]; // Must be defined at top level
    name?: string; // For display purposes, not part of spec
    // These are already covered by ISchemaObjectProperty inheritance
    // but explicitly listing them emphasizes their top-level relevance
    properties?: { [key: string]: ISchemaObjectProperty | IOpenApiReference };
    items?: ISchemaObject | IOpenApiReference;
    required?: string[];
    description?: string;
    // Additional OpenAPI specific schema properties
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    example?: any;
    externalDocs?: { url: string; description?: string; };
    deprecated?: boolean;
    xml?: { name?: string; namespace?: string; prefix?: string; attribute?: boolean; wrapped?: boolean; };
    // Polymorphism
    discriminator?: { propertyName: string; mapping?: { [key: string]: string; }; };
    allOf?: (ISchemaObject | IOpenApiReference)[];
    oneOf?: (ISchemaObject | IOpenApiReference)[];
    anyOf?: (ISchemaObject | IOpenApiReference)[];
    not?: ISchemaObject | IOpenApiReference;
    // Metadata for UI
    isRoot?: boolean;
    isOpen?: boolean;
    parentPath?: string; // To help navigate nested schemas in UI
    id?: string; // Client-side unique ID
}

/**
 * @interface IParameter
 * @description Represents an OpenAPI parameter.
 */
export interface IParameter {
    id: string; // Client-side unique ID
    name: string;
    in: ParameterIn;
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string; // 'matrix', 'label', 'form', 'simple', 'spaceDelimited', 'pipeDelimited', 'deepObject'
    explode?: boolean;
    allowReserved?: boolean;
    schema?: ISchemaObject | IOpenApiReference;
    example?: any;
    examples?: { [key: string]: IOpenApiExample | IOpenApiReference };
    content?: { [mediaType: string]: { schema: ISchemaObject | IOpenApiReference; examples?: { [key: string]: IOpenApiExample | IOpenApiReference }; encoding?: { [key: string]: any; }; }; };
    selected?: boolean; // For UI checkboxes
}

/**
 * @interface IHeader
 * @description Represents an OpenAPI header.
 */
export interface IHeader {
    id: string; // Client-side unique ID
    name: string;
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    schema?: ISchemaObject | IOpenApiReference;
    example?: any;
    examples?: { [key: string]: IOpenApiExample | IOpenApiReference };
    content?: { [mediaType: string]: { schema: ISchemaObject | IOpenApiReference; examples?: { [key: string]: IOpenApiExample | IOpenApiReference }; encoding?: { [key: string]: any; }; }; };
}

/**
 * @interface IRequestBody
 * @description Represents an OpenAPI request body.
 */
export interface IRequestBody {
    description?: string;
    content: { [mediaType: string]: { schema: ISchemaObject | IOpenApiReference; examples?: { [key: string]: IOpenApiExample | IOpenApiReference }; encoding?: { [key: string]: any; }; }; };
    required?: boolean;
    // UI specific
    selectedMediaType?: string;
}

/**
 * @interface IResponse
 * @description Represents an OpenAPI response.
 */
export interface IResponse {
    id: string; // Client-side unique ID
    statusCode: string; // e.g., '200', '404', 'default'
    description: string;
    headers?: { [key: string]: IHeader | IOpenApiReference };
    content?: { [mediaType: string]: { schema: ISchemaObject | IOpenApiReference; examples?: { [key: string]: IOpenApiExample | IOpenApiReference }; encoding?: { [key: string]: any; }; }; };
    links?: { [key: string]: any; }; // Future expansion
    // UI specific
    selectedMediaType?: string;
}

/**
 * @interface ISecurityScheme
 * @description Represents an OpenAPI security scheme.
 */
export interface ISecurityScheme {
    id: string; // Client-side unique ID
    name: string; // e.g., 'bearerAuth', 'api_key_auth'
    type: SecuritySchemeType;
    description?: string;
    // API Key
    in?: 'query' | 'header' | 'cookie';
    schemeName?: string; // For HTTP Basic/Bearer
    bearerFormat?: string;
    // OAuth2
    flows?: {
        implicit?: { authorizationUrl: string; refreshUrl?: string; scopes: { [scope: string]: string; }; };
        password?: { tokenUrl: string; refreshUrl?: string; scopes: { [scope: string]: string; }; };
        clientCredentials?: { tokenUrl: string; refreshUrl?: string; scopes: { [scope: string]: string; }; };
        authorizationCode?: { authorizationUrl: string; tokenUrl: string; refreshUrl?: string; scopes: { [scope: string]: string; }; };
    };
    // OpenId Connect
    openIdConnectUrl?: string;
    // UI specific
    isEnabled?: boolean;
}

/**
 * @interface IEndpoint
 * @description Represents a single API endpoint definition.
 */
export interface IEndpoint {
    id: string; // Client-side unique ID
    path: string;
    method: HttpMethod;
    summary?: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    parameters?: IParameter[];
    requestBody?: IRequestBody;
    responses?: IResponse[];
    callbacks?: { [key: string]: any; }; // Future expansion
    deprecated?: boolean;
    security?: Array<{ [scheme: string]: string[]; }>;
    servers?: Array<{ url: string; description?: string; variables?: { [key: string]: { default: string; description?: string; enum?: string[]; }; }; }>;
    externalDocs?: { url: string; description?: string; };
    // UI specific
    isActive?: boolean; // For toggling visibility in editor
    isExpanded?: boolean; // For accordion-like UI
}

/**
 * @interface IServer
 * @description Represents an OpenAPI Server Object.
 */
export interface IServer {
    id: string;
    url: string;
    description?: string;
    variables?: { [key: string]: { default: string; description?: string; enum?: string[]; }; };
}

/**
 * @interface IContact
 * @description Contact information for the API.
 */
export interface IContact {
    name?: string;
    url?: string;
    email?: string;
}

/**
 * @interface ILicense
 * @description License information for the API.
 */
export interface ILicense {
    name: string;
    url?: string;
}

/**
 * @interface IOpenApiInfo
 * @description Basic metadata about the API.
 */
export interface IOpenApiInfo {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: IContact;
    license?: ILicense;
    version: string;
}

/**
 * @interface IApiContractVersion
 * @description Represents a specific version of an API contract.
 */
export interface IApiContractVersion {
    versionId: string;
    contractId: string;
    versionNumber: string; // e.g., "1.0.0", "1.0.1-beta"
    changeLog: string; // Markdown formatted changes
    committedAt: string; // ISO date string
    committedBy: string; // User ID
    status: 'draft' | 'published' | 'deprecated';
    // The actual OpenAPI/Swagger spec could be stored here or as a reference
    // For simplicity, we'll store a string representation here
    openApiSpec: string; // YAML or JSON string
}

/**
 * @interface IDeploymentTarget
 * @description Defines an environment or target for deploying contracts.
 */
export interface IDeploymentTarget {
    id: string;
    name: string; // e.g., "Development", "Staging", "Production"
    environment: Environment;
    baseUrl: string; // e.g., https://dev.api.example.com
    authMethod?: SecuritySchemeType; // If target requires specific auth for publishing
    config?: { [key: string]: string; }; // e.g., CI/CD pipeline hook URL
}

/**
 * @interface IDeploymentRecord
 * @description Record of a contract deployment.
 */
export interface IDeploymentRecord {
    deploymentId: string;
    contractId: string;
    versionId: string;
    targetId: string;
    deployedBy: string; // User ID
    deployedAt: string; // ISO date string
    status: DeploymentStatusEnum;
    logs: string; // Deployment logs
}

/**
 * @interface IContractLintingRule
 * @description A rule used for linting API contracts.
 */
export interface IContractLintingRule {
    id: string;
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    isEnabled: boolean;
    pattern?: string; // e.g., regex for paths
    checkType: 'schema' | 'path' | 'method' | 'security' | 'response' | 'info';
    // Example: { "minLength": 3, "maxLength": 50 } for titles
    config?: { [key: string]: any; };
}

/**
 * @interface ILintingResult
 * @description Result of a contract linting run.
 */
export interface ILintingResult {
    ruleId: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    location: string; // e.g., "paths./users.get.parameters[0].name"
    suggestion?: string;
}

/**
 * @interface IAuditLogEntry
 * @description An entry in the audit log for contract changes.
 */
export interface IAuditLogEntry {
    logId: string;
    contractId: string;
    userId: string;
    action: string; // e.g., 'created', 'updated', 'deleted', 'published', 'deployed'
    timestamp: string; // ISO date string
    details: string; // JSON string of change, or summary
}

/**
 * @interface ITeam
 * @description Represents a team that manages API contracts.
 */
export interface ITeam {
    id: string;
    name: string;
    description?: string;
}

/**
 * @interface IUserProfile
 * @description User profile for access control.
 */
export interface IUserProfile {
    id: string;
    name: string;
    email: string;
    role: Role; // Global role
    teamMemberships?: { teamId: string; role: Role; }[];
}

/**
 * @interface IApiContract
 * @description The main API Contract object.
 * This represents a single API definition, potentially encompassing multiple versions.
 */
export interface IApiContract {
    id: string;
    name: string;
    description: string;
    ownerId: string; // User ID of the owner
    teamId?: string; // Optional team ownership
    status: 'draft' | 'published' | 'archived';
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    latestVersionId?: string; // ID of the latest 'published' or 'draft' version
    // The current working draft of the contract, actively being edited.
    // This could be represented as an inline OpenAPI spec, or a structured object.
    // For simplicity in this file, we'll store a string representation.
    draftOpenApiSpec: string; // YAML or JSON string of the current draft
    tags: string[];
    // UI specific flags
    isEditing?: boolean;
    isSaving?: boolean;
}

// --- Constants and Enums ---
export const DEFAULT_API_CONTRACT: IApiContract = {
    id: 'new-contract',
    name: 'New API Contract',
    description: 'A new API contract description.',
    ownerId: 'current-user-id', // Placeholder
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    draftOpenApiSpec: `openapi: 3.0.0
info:
  title: New API
  version: 1.0.0
paths: {}
components:
  schemas: {}
`,
    tags: ['new'],
};

export const DEFAULT_ENDPOINT: IEndpoint = {
    id: 'ep-' + Date.now(),
    path: '/new-path',
    method: 'GET',
    summary: 'New endpoint summary',
    description: 'Detailed description for the new endpoint.',
    parameters: [],
    responses: [{
        id: 'res-200-' + Date.now(),
        statusCode: '200',
        description: 'Successful response',
        content: {
            'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string', example: 'Success!' } } }
            }
        }
    }]
};

export const DEFAULT_PARAMETER: IParameter = {
    id: 'param-' + Date.now(),
    name: 'paramName',
    in: 'query',
    required: false,
    schema: { type: 'string' }
};

export const DEFAULT_SCHEMA_OBJECT: ISchemaObject = {
    type: 'object',
    properties: {},
    required: [],
    description: 'A new schema object definition.'
};

export const DEFAULT_SECURITY_SCHEME: ISecurityScheme = {
    id: 'sec-' + Date.now(),
    name: 'newAuth',
    type: 'api_key',
    in: 'header',
    schemeName: 'X-API-Key'
};

export const DEFAULT_SERVER: IServer = {
    id: 'srv-' + Date.now(),
    url: 'https://api.example.com/v1',
    description: 'Production API server'
};

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'];
export const PARAMETER_INS: ParameterIn[] = ['query', 'header', 'path', 'cookie'];
export const SCHEMA_TYPES: SchemaType[] = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
export const SECURITY_SCHEME_TYPES: SecuritySchemeType[] = ['api_key', 'http_basic', 'http_bearer', 'oauth2', 'openid_connect'];
export const DEPLOYMENT_ENVIRONMENTS: Environment[] = ['dev', 'staging', 'production'];

// --- 1. MOCK API SERVICE LAYER (Approx. 1000 lines) ---
// In a real application, these would be actual API calls using fetch, axios, etc.
// Here, we simulate async operations with Promises and in-memory data.

// In-memory data store for demonstration
interface MockDataStore {
    contracts: IApiContract[];
    versions: IApiContractVersion[];
    deploymentTargets: IDeploymentTarget[];
    deploymentRecords: IDeploymentRecord[];
    lintingRules: IContractLintingRule[];
    auditLogs: IAuditLogEntry[];
    users: IUserProfile[];
    teams: ITeam[];
    monitoringMetrics: { contractId: string; timestamp: string; latency: number; errorRate: number; throughput: number; }[];
}

const mockStore: MockDataStore = {
    contracts: [],
    versions: [],
    deploymentTargets: [],
    deploymentRecords: [],
    lintingRules: [],
    auditLogs: [],
    users: [],
    teams: [],
    monitoringMetrics: [],
};

// Seed initial data
const seedData = () => {
    // Users
    const user1: IUserProfile = { id: 'user-1', name: 'Alice Smith', email: 'alice@example.com', role: 'owner' };
    const user2: IUserProfile = { id: 'user-2', name: 'Bob Johnson', email: 'bob@example.com', role: 'editor' };
    mockStore.users.push(user1, user2);

    // Teams
    const team1: ITeam = { id: 'team-backend', name: 'Backend Team', description: 'Manages core APIs' };
    mockStore.teams.push(team1);
    user1.teamMemberships = [{ teamId: team1.id, role: 'owner' }];
    user2.teamMemberships = [{ teamId: team1.id, role: 'editor' }];

    // Deployment Targets
    const devTarget: IDeploymentTarget = {
        id: 'target-dev', name: 'Development', environment: 'dev', baseUrl: 'https://dev.api.example.com',
        config: { deployHook: 'https://webhook.dev.example.com/deploy' }
    };
    const stagingTarget: IDeploymentTarget = {
        id: 'target-stg', name: 'Staging', environment: 'staging', baseUrl: 'https://staging.api.example.com',
        config: { deployHook: 'https://webhook.stg.example.com/deploy' }
    };
    const prodTarget: IDeploymentTarget = {
        id: 'target-prod', name: 'Production', environment: 'production', baseUrl: 'https://api.example.com',
        config: { deployHook: 'https://webhook.prod.example.com/deploy' }
    };
    mockStore.deploymentTargets.push(devTarget, stagingTarget, prodTarget);

    // Linting Rules
    mockStore.lintingRules.push(
        { id: 'rule-1', name: 'Use kebab-case for paths', description: 'Paths should be in kebab-case.', severity: 'error', isEnabled: true, checkType: 'path', pattern: '^[a-z0-9-]+$' },
        { id: 'rule-2', name: 'Require summary for operations', description: 'All operations should have a summary.', severity: 'warning', isEnabled: true, checkType: 'method' },
        { id: 'rule-3', name: 'Require 200/201 response', description: 'Operations should define a success response.', severity: 'error', isEnabled: true, checkType: 'response' }
    );

    // Example Contracts
    const contract1Id = 'contract-user-service';
    const contract1: IApiContract = {
        id: contract1Id,
        name: 'User Service API',
        description: 'API for managing user accounts and profiles.',
        ownerId: user1.id,
        teamId: team1.id,
        status: 'published',
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2023-11-20T15:30:00Z',
        tags: ['users', 'authentication'],
        draftOpenApiSpec: `openapi: 3.0.0
info:
  title: User Service API
  version: 1.0.0
  description: API for managing user accounts and profiles.
paths:
  /users:
    get:
      summary: Get all users
      operationId: getAllUsers
      responses:
        '200':
          description: A list of users.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Create a new user
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: User created successfully.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
  /users/{userId}:
    get:
      summary: Get user by ID
      operationId: getUserById
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
          description: ID of the user to retrieve
      responses:
        '200':
          description: User found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found.
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        username:
          type: string
        email:
          type: string
          format: email
      required:
        - id
        - username
        - email
    UserCreate:
      type: object
      properties:
        username:
          type: string
        email:
          type: string
          format: email
      required:
        - username
        - email
security:
  - bearerAuth: []
`
    };
    mockStore.contracts.push(contract1);

    const contract1Version1: IApiContractVersion = {
        versionId: 'v-user-1.0.0',
        contractId: contract1Id,
        versionNumber: '1.0.0',
        changeLog: 'Initial release of User Service API.',
        committedAt: '2023-01-15T11:00:00Z',
        committedBy: user1.id,
        status: 'published',
        openApiSpec: contract1.draftOpenApiSpec // Same as draft for first version
    };
    mockStore.versions.push(contract1Version1);
    contract1.latestVersionId = contract1Version1.versionId;

    const contract2Id = 'contract-product-catalog';
    const contract2: IApiContract = {
        id: contract2Id,
        name: 'Product Catalog API',
        description: 'API for managing product listings and categories.',
        ownerId: user2.id,
        teamId: team1.id,
        status: 'draft',
        createdAt: '2023-03-01T09:00:00Z',
        updatedAt: '2023-12-01T10:00:00Z',
        tags: ['products', 'catalog'],
        draftOpenApiSpec: `openapi: 3.0.0
info:
  title: Product Catalog API
  version: 0.9.0
  description: Draft API for managing products.
paths:
  /products:
    get:
      summary: List all products
      operationId: listProducts
      responses:
        '200':
          description: Array of products
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                    name:
                      type: string
                    price:
                      type: number
components: {}
`,
    };
    mockStore.contracts.push(contract2);

    // Mock Monitoring Data
    for (let i = 0; i < 30; i++) {
        const timestamp = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString();
        mockStore.monitoringMetrics.push({
            contractId: contract1Id,
            timestamp,
            latency: Math.random() * 100 + 50, // 50-150ms
            errorRate: Math.random() * 0.05, // 0-5%
            throughput: Math.random() * 1000 + 500, // 500-1500 req/s
        });
    }

    // Mock Audit Logs
    mockStore.auditLogs.push(
        { logId: 'log-1', contractId: contract1Id, userId: user1.id, action: 'created', timestamp: '2023-01-15T10:00:00Z', details: '{"name":"User Service API"}' },
        { logId: 'log-2', contractId: contract1Id, userId: user1.id, action: 'published', timestamp: '2023-01-15T11:00:00Z', details: '{"version":"1.0.0"}' },
        { logId: 'log-3', contractId: contract1Id, userId: user1.id, action: 'deployed', timestamp: '2023-01-15T12:00:00Z', details: '{"target":"Development","version":"1.0.0"}' },
        { logId: 'log-4', contractId: contract2Id, userId: user2.id, action: 'created', timestamp: '2023-03-01T09:00:00Z', details: '{"name":"Product Catalog API"}' },
        { logId: 'log-5', contractId: contract2Id, userId: user2.id, action: 'updated', timestamp: '2023-12-01T10:00:00Z', details: '{"change":"added /products endpoint"}' },
    );
};
seedData(); // Call seed data on load

const API_CALL_DELAY = 300; // Simulate network latency

export const apiService = {
    // --- Contracts ---
    fetchApiContracts: async (filters?: { status?: string; search?: string; tags?: string[]; }): Promise<IApiContract[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...mockStore.contracts];
                if (filters?.status) {
                    filtered = filtered.filter(c => c.status === filters.status);
                }
                if (filters?.search) {
                    const searchLower = filters.search.toLowerCase();
                    filtered = filtered.filter(c =>
                        c.name.toLowerCase().includes(searchLower) ||
                        c.description.toLowerCase().includes(searchLower) ||
                        c.tags.some(tag => tag.toLowerCase().includes(searchLower))
                    );
                }
                if (filters?.tags && filters.tags.length > 0) {
                    filtered = filtered.filter(c => filters.tags!.every(tag => c.tags.includes(tag)));
                }
                resolve(filtered.map(c => ({ ...c }))); // Return clones
            }, API_CALL_DELAY);
        });
    },
    fetchApiContractById: async (contractId: string): Promise<IApiContract | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const contract = mockStore.contracts.find(c => c.id === contractId);
                resolve(contract ? { ...contract } : undefined);
            }, API_CALL_DELAY);
        });
    },
    createApiContract: async (newContract: Omit<IApiContract, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'ownerId'>, userId: string): Promise<IApiContract> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const contract: IApiContract = {
                    ...newContract,
                    id: `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    ownerId: userId,
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    draftOpenApiSpec: newContract.draftOpenApiSpec || DEFAULT_API_CONTRACT.draftOpenApiSpec,
                };
                mockStore.contracts.push(contract);
                mockStore.auditLogs.push({
                    logId: `log-${Date.now()}`, contractId: contract.id, userId, action: 'created',
                    timestamp: new Date().toISOString(), details: JSON.stringify({ name: contract.name })
                });
                resolve({ ...contract });
            }, API_CALL_DELAY);
        });
    },
    updateApiContract: async (updatedContract: IApiContract, userId: string): Promise<IApiContract> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockStore.contracts.findIndex(c => c.id === updatedContract.id);
                if (index > -1) {
                    mockStore.contracts[index] = { ...updatedContract, updatedAt: new Date().toISOString() };
                    mockStore.auditLogs.push({
                        logId: `log-${Date.now()}`, contractId: updatedContract.id, userId, action: 'updated',
                        timestamp: new Date().toISOString(), details: JSON.stringify({ name: updatedContract.name, changes: 'draft spec updated' })
                    });
                    resolve({ ...mockStore.contracts[index] });
                } else {
                    reject(new Error('Contract not found'));
                }
            }, API_CALL_DELAY);
        });
    },
    deleteApiContract: async (contractId: string, userId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const initialLength = mockStore.contracts.length;
                mockStore.contracts = mockStore.contracts.filter(c => c.id !== contractId);
                if (mockStore.contracts.length < initialLength) {
                    // Also delete related versions, deployments, logs
                    mockStore.versions = mockStore.versions.filter(v => v.contractId !== contractId);
                    mockStore.deploymentRecords = mockStore.deploymentRecords.filter(d => d.contractId !== contractId);
                    mockStore.auditLogs = mockStore.auditLogs.filter(l => l.contractId !== contractId);
                    mockStore.auditLogs.push({
                        logId: `log-${Date.now()}`, contractId, userId, action: 'deleted',
                        timestamp: new Date().toISOString(), details: 'Contract and all associated data deleted.'
                    });
                    resolve();
                } else {
                    reject(new Error('Contract not found'));
                }
            }, API_CALL_DELAY);
        });
    },

    // --- Versions ---
    fetchContractVersions: async (contractId: string): Promise<IApiContractVersion[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const versions = mockStore.versions.filter(v => v.contractId === contractId);
                resolve(versions.map(v => ({ ...v })));
            }, API_CALL_DELAY);
        });
    },
    fetchContractVersionById: async (versionId: string): Promise<IApiContractVersion | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const version = mockStore.versions.find(v => v.versionId === versionId);
                resolve(version ? { ...version } : undefined);
            }, API_CALL_DELAY);
        });
    },
    publishContractVersion: async (contractId: string, versionNumber: string, changeLog: string, openApiSpec: string, userId: string): Promise<IApiContractVersion> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const contract = mockStore.contracts.find(c => c.id === contractId);
                if (!contract) {
                    return reject(new Error('Contract not found'));
                }

                const newVersion: IApiContractVersion = {
                    versionId: `v-${contractId}-${versionNumber}`,
                    contractId,
                    versionNumber,
                    changeLog,
                    committedAt: new Date().toISOString(),
                    committedBy: userId,
                    status: 'published',
                    openApiSpec,
                };
                mockStore.versions.push(newVersion);
                contract.latestVersionId = newVersion.versionId;
                contract.status = 'published';
                contract.updatedAt = new Date().toISOString();

                mockStore.auditLogs.push({
                    logId: `log-${Date.now()}`, contractId, userId, action: 'published',
                    timestamp: new Date().toISOString(), details: JSON.stringify({ version: versionNumber, changeLog })
                });
                resolve({ ...newVersion });
            }, API_CALL_DELAY);
        });
    },
    // Mock diffing functionality (would be complex in real app)
    getContractSpecDiff: async (specA: string, specB: string): Promise<string[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate a diff tool output. In reality, a library like `jsondiffpatch` or `diff-match-patch` would be used.
                const linesA = specA.split('\n');
                const linesB = specB.split('\n');
                const diff: string[] = [];
                const maxLength = Math.max(linesA.length, linesB.length);

                for (let i = 0; i < maxLength; i++) {
                    const lineA = linesA[i] || '';
                    const lineB = linesB[i] || '';

                    if (lineA === lineB) {
                        diff.push(`   ${lineA}`); // Unchanged
                    } else {
                        if (lineA) diff.push(`-  ${lineA}`); // Removed
                        if (lineB) diff.push(`+  ${lineB}`); // Added
                    }
                }
                resolve(diff);
            }, API_CALL_DELAY * 2); // Longer delay for diff generation
        });
    },

    // --- Deployments ---
    fetchDeploymentTargets: async (): Promise<IDeploymentTarget[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockStore.deploymentTargets.map(t => ({ ...t })));
            }, API_CALL_DELAY);
        });
    },
    fetchDeploymentRecords: async (contractId: string): Promise<IDeploymentRecord[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const records = mockStore.deploymentRecords.filter(d => d.contractId === contractId);
                resolve(records.map(r => ({ ...r })));
            }, API_CALL_DELAY);
        });
    },
    deployContractVersion: async (contractId: string, versionId: string, targetId: string, userId: string): Promise<IDeploymentRecord> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const contract = mockStore.contracts.find(c => c.id === contractId);
                const version = mockStore.versions.find(v => v.versionId === versionId);
                const target = mockStore.deploymentTargets.find(t => t.id === targetId);

                if (!contract || !version || !target) {
                    return reject(new Error('Contract, version, or target not found'));
                }

                const record: IDeploymentRecord = {
                    deploymentId: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    contractId,
                    versionId,
                    targetId,
                    deployedBy: userId,
                    deployedAt: new Date().toISOString(),
                    status: 'pending',
                    logs: `Initiating deployment of ${contract.name} v${version.versionNumber} to ${target.name} (${target.environment})...`
                };
                mockStore.deploymentRecords.push(record);

                // Simulate deployment process
                setTimeout(() => {
                    record.status = Math.random() > 0.1 ? 'success' : 'failed'; // 90% success rate
                    record.logs += `\nDeployment ${record.status}. Base URL: ${target.baseUrl}`;
                    if (record.status === 'failed') {
                        record.logs += '\nError: Could not connect to deployment target.';
                    }
                    mockStore.auditLogs.push({
                        logId: `log-${Date.now()}`, contractId, userId, action: 'deployed',
                        timestamp: new Date().toISOString(), details: JSON.stringify({ version: version.versionNumber, target: target.name, status: record.status })
                    });
                    resolve({ ...record });
                }, API_CALL_DELAY * 3); // Longer delay for deployment
            }, API_CALL_DELAY);
        });
    },

    // --- Linting ---
    fetchContractLintingRules: async (): Promise<IContractLintingRule[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockStore.lintingRules.map(r => ({ ...r })));
            }, API_CALL_DELAY);
        });
    },
    updateContractLintingRule: async (rule: IContractLintingRule, userId: string): Promise<IContractLintingRule> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockStore.lintingRules.findIndex(r => r.id === rule.id);
                if (index > -1) {
                    mockStore.lintingRules[index] = { ...rule };
                    mockStore.auditLogs.push({
                        logId: `log-${Date.now()}`, contractId: 'system', userId, action: 'updated_linting_rule',
                        timestamp: new Date().toISOString(), details: JSON.stringify({ ruleId: rule.id, name: rule.name, isEnabled: rule.isEnabled })
                    });
                    resolve({ ...mockStore.lintingRules[index] });
                } else {
                    reject(new Error('Rule not found'));
                }
            }, API_CALL_DELAY);
        });
    },
    runContractLinting: async (contractId: string, openApiSpec: string): Promise<ILintingResult[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results: ILintingResult[] = [];
                const enabledRules = mockStore.lintingRules.filter(r => r.isEnabled);

                // Simulate basic linting checks
                const specLower = openApiSpec.toLowerCase();
                const specLines = openApiSpec.split('\n');

                if (!specLower.includes('info:')) {
                    results.push({ ruleId: 'rule-info', message: 'OpenAPI spec must contain an "info" object.', severity: 'error', location: 'root' });
                }
                if (!specLower.includes('version:')) {
                    results.push({ ruleId: 'rule-version', message: 'OpenAPI info object must contain a "version".', severity: 'error', location: 'info' });
                }

                // Example for 'Require summary for operations' (rule-2)
                if