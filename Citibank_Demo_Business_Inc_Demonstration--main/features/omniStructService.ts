// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import type { OmniStruct } from '../types';
import { produce } from 'immer'; // A library to handle immutable updates easily

/**
 * Type definition for an OmniFunction, which takes an OmniStruct draft and arguments,
 * and returns a JSON-serializable result.
 */
type OmniFunction = (omni: OmniStruct, args: any) => any; // Returns JSON-serializable result

// --- Form Data Structure ---
/**
 * Interface representing the initial form data used to build an OmniStruct.
 * Expanded to include fields for various sections of the OmniStruct.
 */
export interface OmniStructFormData {
    purposeDesc: string;
    planMilestones: string; // e.g., "Phase1:Due 2024-01-01, Phase2:Completed"
    instructionsSteps: string; // e.g., "Step 1\nStep 2"
    useCasesScenarios: string; // e.g., "User Authentication\nData Processing Flow"
    logicDesc: string;
    classificationRiskCategories: string; // e.g., "Low-risk, Financial"
    securityLevel: string; // e.g., "HIGH", "MEDIUM"
    securityEncryptionProtocols: string; // e.g., "AES256, TLS1.3"
    ownershipCurrentOwner: string;
    ownershipAuthorizedEntities: string; // e.g., "Team A, Team B"
    integrationExternalApis: string; // e.g., "Stripe:https://api.stripe.com, Twilio:https://api.twilio.com"
    resourceDocumentationLink: string;
    resourceDatasetRepos: string; // e.g., "GitHub:https://github.com/data, S3:s3://data-bucket"
    dependenciesRequiredLibraries: string; // e.g., "react:^18.0.0, express:~4.17.1"
    dependenciesHardwareRequirements: string; // e.g., "8GB RAM, Quad-core CPU"
    aiTrainingHyperparameters: string; // e.g., "learning_rate:0.01, epochs:10"
    testingDatasetsAvailable: string; // e.g., "Unit Tests, Integration Tests"
    permissionsAccessControls: string; // e.g., "Admin:Full, User:Read"
    revocationStrategy: string; // e.g., "Manual, Automated"
    rollbackMechanismPoints: string; // e.g., "v1.0.0-baseline, v1.1.0-featureX"
    codeExampleSnippets: string; // e.g., "Auth:console.log('auth'), DB:client.query('SELECT')"
}

// --- OmniStruct Function Implementations (Production-Safe) ---

// Purpose Section Functions
const purpose_updateDescription: OmniFunction = (omni, args) => {
    const new_desc = args.description || "";
    omni.Purpose.description = new_desc;
    return { status: "ok", updatedDescription: new_desc };
};

const purpose_getPurpose: OmniFunction = (omni, args) => ({
    description: omni.Purpose.description,
    functions: omni.Purpose.functions
});

// Plan Section Functions
const plan_getPlanDetails: OmniFunction = (omni, args) => ({
    milestones: omni.Plan.milestones,
    functions: omni.Plan.functions
});

const plan_addMilestone: OmniFunction = (omni, args) => {
    const newMilestoneKey = args.key?.trim();
    const newMilestoneValue = args.value?.trim();
    if (!newMilestoneKey) return { error: "No milestone key provided." };

    omni.Plan.milestones[newMilestoneKey] = newMilestoneValue || "";
    return { status: "ok", addedMilestone: { [newMilestoneKey]: newMilestoneValue } };
};

const plan_removeMilestone: OmniFunction = (omni, args) => {
    const keyToRemove = args.key?.trim();
    if (!keyToRemove) return { error: "No milestone key provided for removal." };
    if (omni.Plan.milestones[keyToRemove]) {
        delete omni.Plan.milestones[keyToRemove];
        return { status: "ok", removedMilestone: keyToRemove };
    }
    return { status: "error", message: `Milestone '${keyToRemove}' not found.` };
};

const plan_updateMilestone: OmniFunction = (omni, args) => {
    const keyToUpdate = args.key?.trim();
    const newValue = args.value?.trim();
    if (!keyToUpdate) return { error: "No milestone key provided for update." };
    if (omni.Plan.milestones[keyToUpdate] !== undefined) {
        omni.Plan.milestones[keyToUpdate] = newValue || omni.Plan.milestones[keyToUpdate];
        return { status: "ok", updatedMilestone: { [keyToUpdate]: omni.Plan.milestones[keyToUpdate] } };
    }
    return { status: "error", message: `Milestone '${keyToUpdate}' not found.` };
};

// Instructions Section Functions
const instructions_getSteps: OmniFunction = (omni, args) => omni.Instructions.steps;

const instructions_addStep: OmniFunction = (omni, args) => {
    const newStep = args.newStep?.trim();
    if (newStep) {
        omni.Instructions.steps.push(newStep);
        return { status: "ok", addedStep: newStep };
    }
    return { error: "No newStep provided." };
};

const instructions_removeStep: OmniFunction = (omni, args) => {
    const stepIndex = typeof args.index === 'number' ? args.index : -1;
    if (stepIndex >= 0 && stepIndex < omni.Instructions.steps.length) {
        const removed = omni.Instructions.steps.splice(stepIndex, 1);
        return { status: "ok", removedStep: removed[0] };
    }
    return { error: "Invalid step index provided." };
};

const instructions_updateStep: OmniFunction = (omni, args) => {
    const stepIndex = typeof args.index === 'number' ? args.index : -1;
    const newStepValue = args.newValue?.trim();
    if (stepIndex >= 0 && stepIndex < omni.Instructions.steps.length && newStepValue) {
        omni.Instructions.steps[stepIndex] = newStepValue;
        return { status: "ok", updatedStep: newStepValue, index: stepIndex };
    }
    return { error: "Invalid index or no new value provided for step update." };
};

// UseCases Section Functions
const useCases_getScenarios: OmniFunction = (omni, args) => omni.UseCases.scenarios;

const useCases_addScenario: OmniFunction = (omni, args) => {
    const newScenario = args.newScenario?.trim();
    if (newScenario) {
        omni.UseCases.scenarios.push(newScenario);
        return { status: "ok", addedScenario: newScenario };
    }
    return { error: "No newScenario provided." };
};

const useCases_removeScenario: OmniFunction = (omni, args) => {
    const scenarioIndex = typeof args.index === 'number' ? args.index : -1;
    if (scenarioIndex >= 0 && scenarioIndex < omni.UseCases.scenarios.length) {
        const removed = omni.UseCases.scenarios.splice(scenarioIndex, 1);
        return { status: "ok", removedScenario: removed[0] };
    }
    return { error: "Invalid scenario index provided." };
};

const useCases_updateScenario: OmniFunction = (omni, args) => {
    const scenarioIndex = typeof args.index === 'number' ? args.index : -1;
    const newScenarioValue = args.newValue?.trim();
    if (scenarioIndex >= 0 && scenarioIndex < omni.UseCases.scenarios.length && newScenarioValue) {
        omni.UseCases.scenarios[scenarioIndex] = newScenarioValue;
        return { status: "ok", updatedScenario: newScenarioValue, index: scenarioIndex };
    }
    return { error: "Invalid index or no new value provided for scenario update." };
};

// Logic Section Functions
const logic_getLogicDetails: OmniFunction = (omni, args) => ({
    description: omni.Logic.description,
    decisionTrees: omni.Logic.decisionTrees,
    functions: omni.Logic.functions
});

const logic_updateDescription: OmniFunction = (omni, args) => {
    const new_desc = args.description || "";
    omni.Logic.description = new_desc;
    return { status: "ok", updatedDescription: new_desc };
};

const logic_getDecisionTrees: OmniFunction = (omni, args) => omni.Logic.decisionTrees;

const logic_addDecisionTree: OmniFunction = (omni, args) => {
    const key = args.key?.trim();
    const value = args.value?.trim();
    if (!key) return { error: "No decision tree key provided." };
    omni.Logic.decisionTrees[key] = value || "";
    return { status: "ok", addedDecisionTree: { [key]: value } };
};

const logic_removeDecisionTree: OmniFunction = (omni, args) => {
    const keyToRemove = args.key?.trim();
    if (!keyToRemove) return { error: "No decision tree key provided for removal." };
    if (omni.Logic.decisionTrees[keyToRemove]) {
        delete omni.Logic.decisionTrees[keyToRemove];
        return { status: "ok", removedDecisionTree: keyToRemove };
    }
    return { status: "error", message: `Decision tree '${keyToRemove}' not found.` };
};

const logic_runHeuristics: OmniFunction = (omni, args) => {
    // Placeholder for complex logic execution.
    // In a real scenario, this would involve intricate rule engines or AI inference.
    const input = args.input || {};
    const treeName = args.treeName;
    if (treeName && omni.Logic.decisionTrees[treeName]) {
        return { status: "simulated_ok", message: `Simulated execution of heuristic: '${treeName}' with input: ${JSON.stringify(input)}` };
    }
    return { status: "simulated_ok", message: `Simulated heuristic run with input: ${JSON.stringify(input)}` };
};

// Classification Section Functions
const classification_getRiskCategories: OmniFunction = (omni, args) => omni.Classification.riskCategories;

const classification_addRiskCategory: OmniFunction = (omni, args) => {
    const newCategory = args.category?.trim();
    if (newCategory && !omni.Classification.riskCategories.includes(newCategory)) {
        omni.Classification.riskCategories.push(newCategory);
        return { status: "ok", addedCategory: newCategory };
    }
    return { error: "Invalid or duplicate risk category." };
};

const classification_removeRiskCategory: OmniFunction = (omni, args) => {
    const categoryToRemove = args.category?.trim();
    const index = omni.Classification.riskCategories.indexOf(categoryToRemove);
    if (index > -1) {
        omni.Classification.riskCategories.splice(index, 1);
        return { status: "ok", removedCategory: categoryToRemove };
    }
    return { error: "Risk category not found." };
};

// SecurityLevel Section Functions
const securityLevel_getSecurityLevel: OmniFunction = (omni, args) => ({
    level: omni.SecurityLevel.level,
    encryptionProtocols: omni.SecurityLevel.encryptionProtocols
});

const securityLevel_updateLevel: OmniFunction = (omni, args) => {
    const newLevel = args.level?.trim();
    if (newLevel) {
        omni.SecurityLevel.level = newLevel;
        return { status: "ok", updatedLevel: newLevel };
    }
    return { error: "No new security level provided." };
};

const securityLevel_addEncryptionProtocol: OmniFunction = (omni, args) => {
    const newProtocol = args.protocol?.trim();
    if (newProtocol && !omni.SecurityLevel.encryptionProtocols.includes(newProtocol)) {
        omni.SecurityLevel.encryptionProtocols.push(newProtocol);
        return { status: "ok", addedProtocol: newProtocol };
    }
    return { error: "Invalid or duplicate encryption protocol." };
};

const securityLevel_removeEncryptionProtocol: OmniFunction = (omni, args) => {
    const protocolToRemove = args.protocol?.trim();
    const index = omni.SecurityLevel.encryptionProtocols.indexOf(protocolToRemove);
    if (index > -1) {
        omni.SecurityLevel.encryptionProtocols.splice(index, 1);
        return { status: "ok", removedProtocol: protocolToRemove };
    }
    return { error: "Encryption protocol not found." };
};

// Ownership Section Functions
const ownership_getOwnershipDetails: OmniFunction = (omni, args) => ({
    currentOwner: omni.Ownership.currentOwner,
    authorizedEntities: omni.Ownership.authorizedEntities
});

const ownership_updateOwner: OmniFunction = (omni, args) => {
    const newOwner = args.owner?.trim();
    if (newOwner) {
        omni.Ownership.currentOwner = newOwner;
        return { status: "ok", updatedOwner: newOwner };
    }
    return { error: "No new owner provided." };
};

const ownership_addAuthorizedEntity: OmniFunction = (omni, args) => {
    const newEntity = args.entity?.trim();
    if (newEntity && !omni.Ownership.authorizedEntities.includes(newEntity)) {
        omni.Ownership.authorizedEntities.push(newEntity);
        return { status: "ok", addedEntity: newEntity };
    }
    return { error: "Invalid or duplicate authorized entity." };
};

const ownership_removeAuthorizedEntity: OmniFunction = (omni, args) => {
    const entityToRemove = args.entity?.trim();
    const index = omni.Ownership.authorizedEntities.indexOf(entityToRemove);
    if (index > -1) {
        omni.Ownership.authorizedEntities.splice(index, 1);
        return { status: "ok", removedEntity: entityToRemove };
    }
    return { error: "Authorized entity not found." };
};

// Versioning Section Functions
const versioning_createNewVersion: OmniFunction = (omni, args) => {
    const version = args.version || `v${Date.now()}`; // Default to timestamp if not provided
    const changes = args.changes || "No changes description provided.";
    const new_entry = { version, changes, timestamp: new Date().toISOString() };
    omni.Versioning.changeLog.push(new_entry);
    omni.Versioning.currentVersion = version;
    return { status: "ok", newVersion: new_entry };
};

const versioning_getChangeLog: OmniFunction = (omni, args) => omni.Versioning.changeLog;

const versioning_getCurrentVersion: OmniFunction = (omni, args) => omni.Versioning.currentVersion;

const versioning_rollbackToVersion: OmniFunction = (omni, args) => {
    const targetVersion = args.version?.trim();
    if (!targetVersion) return { error: "No target version provided for rollback." };

    const versionEntry = omni.Versioning.changeLog.find(entry => entry.version === targetVersion);
    if (!versionEntry) return { error: `Version '${targetVersion}' not found in change log.` };

    // This is a simplified rollback: we only update the currentVersion and add a new log entry.
    // A full rollback would involve restoring the entire OmniStruct state from a previous snapshot.
    omni.Versioning.currentVersion = targetVersion;
    const rollbackLogEntry = {
        version: `${targetVersion}-rollback-${Date.now()}`,
        changes: `Rolled back to version '${targetVersion}'`,
        timestamp: new Date().toISOString()
    };
    omni.Versioning.changeLog.push(rollbackLogEntry);
    return { status: "ok", message: `Rolled back to version '${targetVersion}'`, currentVersion: omni.Versioning.currentVersion };
};

// IntegrationPoints Section Functions
const integrationPoints_getAPIs: OmniFunction = (omni, args) => omni.IntegrationPoints.externalAPIs;

const integrationPoints_addAPI: OmniFunction = (omni, args) => {
    const newAPI = args.api?.trim(); // Expecting "Name:URL" or just "URL"
    if (!newAPI) return { error: "No API provided." };

    let apiName = newAPI;
    let apiUrl = newAPI;

    if (newAPI.includes(":")) {
        const parts = newAPI.split(":", 2);
        apiName = parts[0].trim();
        apiUrl = parts[1].trim();
    } else {
        // If only URL, use URL as name too or a default
        apiName = new URL(newAPI).hostname || "Unnamed API";
    }

    const existingApi = omni.IntegrationPoints.externalAPIs.find(api => api.name === apiName || api.url === apiUrl);
    if (existingApi) {
        return { status: "error", message: "API with this name or URL already exists." };
    }

    omni.IntegrationPoints.externalAPIs.push({ name: apiName, url: apiUrl });
    return { status: "ok", addedAPI: { name: apiName, url: apiUrl } };
};

const integrationPoints_removeAPI: OmniFunction = (omni, args) => {
    const apiIdentifier = args.identifier?.trim(); // Can be name or URL
    if (!apiIdentifier) return { error: "No API identifier provided for removal." };

    const initialLength = omni.IntegrationPoints.externalAPIs.length;
    omni.IntegrationPoints.externalAPIs = omni.IntegrationPoints.externalAPIs.filter(
        api => api.name !== apiIdentifier && api.url !== apiIdentifier
    );
    if (omni.IntegrationPoints.externalAPIs.length < initialLength) {
        return { status: "ok", removedAPI: apiIdentifier };
    }
    return { status: "error", message: `API '${apiIdentifier}' not found.` };
};

// ResourceLinks Section Functions
const resourceLinks_getDocumentation: OmniFunction = (omni, args) => omni.ResourceLinks.documentation;

const resourceLinks_updateDocumentation: OmniFunction = (omni, args) => {
    const newLink = args.link?.trim();
    if (newLink) {
        omni.ResourceLinks.documentation = newLink;
        return { status: "ok", updatedLink: newLink };
    }
    return { error: "No new documentation link provided." };
};

const resourceLinks_getDatasetRepos: OmniFunction = (omni, args) => omni.ResourceLinks.datasetRepo;

const resourceLinks_addDatasetRepo: OmniFunction = (omni, args) => {
    const newRepo = args.repo?.trim(); // Expecting "Name:URL" or "URL"
    if (!newRepo) return { error: "No dataset repository provided." };

    let repoName = newRepo;
    let repoUrl = newRepo;

    if (newRepo.includes(":")) {
        const parts = newRepo.split(":", 2);
        repoName = parts[0].trim();
        repoUrl = parts[1].trim();
    } else {
        try {
            repoName = new URL(newRepo).hostname || "Unnamed Repo";
        } catch {
            repoName = "Unnamed Repo"; // Fallback for invalid URLs
        }
    }

    const currentRepos = typeof omni.ResourceLinks.datasetRepo === 'string' ? omni.ResourceLinks.datasetRepo.split(',').map(s => s.trim()) : [];
    const newRepoEntry = `${repoName}:${repoUrl}`;

    if (currentRepos.includes(newRepoEntry)) {
        return { status: "error", message: "Dataset repository already exists." };
    }

    omni.ResourceLinks.datasetRepo = [...currentRepos, newRepoEntry].filter(Boolean).join(", ");
    return { status: "ok", addedDatasetRepo: newRepoEntry };
};

const resourceLinks_removeDatasetRepo: OmniFunction = (omni, args) => {
    const repoIdentifier = args.identifier?.trim(); // Can be name or "Name:URL" string
    if (!repoIdentifier) return { error: "No dataset repository identifier provided for removal." };

    let currentRepos = typeof omni.ResourceLinks.datasetRepo === 'string' ? omni.ResourceLinks.datasetRepo.split(',').map(s => s.trim()) : [];
    const initialLength = currentRepos.length;

    currentRepos = currentRepos.filter(repo => {
        const [name, url] = repo.split(":", 2).map(s => s.trim());
        return !(name === repoIdentifier || url === repoIdentifier || repo === repoIdentifier);
    });

    if (currentRepos.length < initialLength) {
        omni.ResourceLinks.datasetRepo = currentRepos.join(", ");
        return { status: "ok", removedDatasetRepo: repoIdentifier };
    }
    return { status: "error", message: `Dataset repository '${repoIdentifier}' not found.` };
};


// Dependencies Section Functions
const dependencies_getLibraries: OmniFunction = (omni, args) => omni.Dependencies.requiredLibraries;

const dependencies_addLibrary: OmniFunction = (omni, args) => {
    const newLib = args.library?.trim();
    if (newLib && !omni.Dependencies.requiredLibraries.includes(newLib)) {
        omni.Dependencies.requiredLibraries.push(newLib);
        return { status: "ok", addedLibrary: newLib };
    }
    return { error: "Invalid or duplicate library." };
};

const dependencies_removeLibrary: OmniFunction = (omni, args) => {
    const libToRemove = args.library?.trim();
    const index = omni.Dependencies.requiredLibraries.indexOf(libToRemove);
    if (index > -1) {
        omni.Dependencies.requiredLibraries.splice(index, 1);
        return { status: "ok", removedLibrary: libToRemove };
    }
    return { error: "Library not found." };
};

const dependencies_getHardwareRequirements: OmniFunction = (omni, args) => omni.Dependencies.hardwareRequirements;

const dependencies_addHardwareRequirement: OmniFunction = (omni, args) => {
    const newReq = args.requirement?.trim();
    if (newReq && !omni.Dependencies.hardwareRequirements.includes(newReq)) {
        omni.Dependencies.hardwareRequirements.push(newReq);
        return { status: "ok", addedRequirement: newReq };
    }
    return { error: "Invalid or duplicate hardware requirement." };
};

const dependencies_removeHardwareRequirement: OmniFunction = (omni, args) => {
    const reqToRemove = args.requirement?.trim();
    const index = omni.Dependencies.hardwareRequirements.indexOf(reqToRemove);
    if (index > -1) {
        omni.Dependencies.hardwareRequirements.splice(index, 1);
        return { status: "ok", removedRequirement: reqToRemove };
    }
    return { error: "Hardware requirement not found." };
};

// PerformanceMetrics Section Functions
const performanceMetrics_getMetrics: OmniFunction = (omni, args) => omni.PerformanceMetrics.currentPerformance;

const performanceMetrics_updateMetric: OmniFunction = (omni, args) => {
    const key = args.key?.trim();
    const value = args.value; // Can be any type
    if (!key) return { error: "No metric key provided." };
    omni.PerformanceMetrics.currentPerformance[key] = value;
    return { status: "ok", updatedMetric: { [key]: value } };
};

const performanceMetrics_addMetric: OmniFunction = (omni, args) => {
    const key = args.key?.trim();
    const value = args.value;
    if (!key) return { error: "No metric key provided." };
    if (omni.PerformanceMetrics.currentPerformance[key] !== undefined) {
        return { status: "error", message: `Metric '${key}' already exists. Use updateMetric.` };
    }
    omni.PerformanceMetrics.currentPerformance[key] = value;
    return { status: "ok", addedMetric: { [key]: value } };
};

const performanceMetrics_removeMetric: OmniFunction = (omni, args) => {
    const keyToRemove = args.key?.trim();
    if (!keyToRemove) return { error: "No metric key provided for removal." };
    if (omni.PerformanceMetrics.currentPerformance[keyToRemove] !== undefined) {
        delete omni.PerformanceMetrics.currentPerformance[keyToRemove];
        return { status: "ok", removedMetric: keyToRemove };
    }
    return { status: "error", message: `Metric '${keyToRemove}' not found.` };
};

// AITrainingParameters Section Functions
const aiTrainingParameters_getHyperparameters: OmniFunction = (omni, args) => omni.AITrainingParameters.hyperparameters;

const aiTrainingParameters_updateHyperparameter: OmniFunction = (omni, args) => {
    const key = args.key?.trim();
    const value = args.value;
    if (!key) return { error: "No hyperparameter key provided." };
    omni.AITrainingParameters.hyperparameters[key] = value;
    return { status: "ok", updatedHyperparameter: { [key]: value } };
};

const aiTrainingParameters_addHyperparameter: OmniFunction = (omni, args) => {
    const key = args.key?.trim();
    const value = args.value;
    if (!key) return { error: "No hyperparameter key provided." };
    if (omni.AITrainingParameters.hyperparameters[key] !== undefined) {
        return { status: "error", message: `Hyperparameter '${key}' already exists. Use updateHyperparameter.` };
    }
    omni.AITrainingParameters.hyperparameters[key] = value;
    return { status: "ok", addedHyperparameter: { [key]: value } };
};

const aiTrainingParameters_removeHyperparameter: OmniFunction = (omni, args) => {
    const keyToRemove = args.key?.trim();
    if (!keyToRemove) return { error: "No hyperparameter key provided for removal." };
    if (omni.AITrainingParameters.hyperparameters[keyToRemove] !== undefined) {
        delete omni.AITrainingParameters.hyperparameters[keyToRemove];
        return { status: "ok", removedHyperparameter: keyToRemove };
    }
    return { status: "error", message: `Hyperparameter '${keyToRemove}' not found.` };
};

// TestingDatasets Section Functions
const testingDatasets_getAvailableDatasets: OmniFunction = (omni, args) => omni.TestingDatasets.availableDatasets;

const testingDatasets_addDataset: OmniFunction = (omni, args) => {
    const newDataset = args.dataset?.trim();
    if (newDataset && !omni.TestingDatasets.availableDatasets.includes(newDataset)) {
        omni.TestingDatasets.availableDatasets.push(newDataset);
        return { status: "ok", addedDataset: newDataset };
    }
    return { error: "Invalid or duplicate dataset." };
};

const testingDatasets_removeDataset: OmniFunction = (omni, args) => {
    const datasetToRemove = args.dataset?.trim();
    const index = omni.TestingDatasets.availableDatasets.indexOf(datasetToRemove);
    if (index > -1) {
        omni.TestingDatasets.availableDatasets.splice(index, 1);
        return { status: "ok", removedDataset: datasetToRemove };
    }
    return { error: "Dataset not found." };
};

// Permissions Section Functions
const permissions_getAccessControls: OmniFunction = (omni, args) => omni.Permissions.accessControls;

const permissions_addAccessControl: OmniFunction = (omni, args) => {
    const newControl = args.control?.trim();
    if (newControl && !omni.Permissions.accessControls.includes(newControl)) {
        omni.Permissions.accessControls.push(newControl);
        return { status: "ok", addedControl: newControl };
    }
    return { error: "Invalid or duplicate access control." };
};

const permissions_removeAccessControl: OmniFunction = (omni, args) => {
    const controlToRemove = args.control?.trim();
    const index = omni.Permissions.accessControls.indexOf(controlToRemove);
    if (index > -1) {
        omni.Permissions.accessControls.splice(index, 1);
        return { status: "ok", removedControl: controlToRemove };
    }
    return { error: "Access control not found." };
};

// RevocationProtocols Section Functions
const revocationProtocols_getStrategy: OmniFunction = (omni, args) => omni.RevocationProtocols.strategy;

const revocationProtocols_updateStrategy: OmniFunction = (omni, args) => {
    const newStrategy = args.strategy?.trim();
    if (newStrategy) {
        omni.RevocationProtocols.strategy = newStrategy;
        return { status: "ok", updatedStrategy: newStrategy };
    }
    return { error: "No new strategy provided." };
};

// RollbackMechanisms Section Functions
const rollbackMechanisms_getRollbackPoints: OmniFunction = (omni, args) => omni.RollbackMechanisms.rollbackPoints;

const rollbackMechanisms_addRollbackPoint: OmniFunction = (omni, args) => {
    const newPoint = args.point?.trim();
    if (newPoint && !omni.RollbackMechanisms.rollbackPoints.includes(newPoint)) {
        omni.RollbackMechanisms.rollbackPoints.push(newPoint);
        return { status: "ok", addedPoint: newPoint };
    }
    return { error: "Invalid or duplicate rollback point." };
};

const rollbackMechanisms_removeRollbackPoint: OmniFunction = (omni, args) => {
    const pointToRemove = args.point?.trim();
    const index = omni.RollbackMechanisms.rollbackPoints.indexOf(pointToRemove);
    if (index > -1) {
        omni.RollbackMechanisms.rollbackPoints.splice(index, 1);
        return { status: "ok", removedPoint: pointToRemove };
    }
    return { error: "Rollback point not found." };
};

// AuditLogs Section Functions
const auditLogs_getRecords: OmniFunction = (omni, args) => omni.AuditLogs.records;

const auditLogs_addRecord: OmniFunction = (omni, args) => {
    const newRecord = args.record || {};
    if (typeof newRecord === 'object' && newRecord !== null) {
        omni.AuditLogs.records.push({ ...newRecord, timestamp: newRecord.timestamp || new Date().toISOString() });
        return { status: "ok", addedRecord: newRecord };
    }
    return { error: "Invalid audit record provided." };
};

// CodeExamples Section Functions
const codeExamples_getSnippets: OmniFunction = (omni, args) => omni.CodeExamples.sampleSnippets;

const codeExamples_addSnippet: OmniFunction = (omni, args) => {
    const key = args.key?.trim();
    const code = args.code;
    if (!key) return { error: "No snippet key provided." };
    omni.CodeExamples.sampleSnippets[key] = code || "";
    return { status: "ok", addedSnippet: { [key]: code } };
};

const codeExamples_removeSnippet: OmniFunction = (omni, args) => {
    const keyToRemove = args.key?.trim();
    if (!keyToRemove) return { error: "No snippet key provided for removal." };
    if (omni.CodeExamples.sampleSnippets[keyToRemove] !== undefined) {
        delete omni.CodeExamples.sampleSnippets[keyToRemove];
        return { status: "ok", removedSnippet: keyToRemove };
    }
    return { status: "error", message: `Code snippet '${keyToRemove}' not found.` };
};

// --- Function Registry ---
/**
 * A map of all available OmniFunctions, keyed by their reference string.
 */
const FUNCTION_MAP: Record<string, OmniFunction> = {
    // Purpose
    "Purpose:updateDescription": purpose_updateDescription,
    "Purpose:getPurpose": purpose_getPurpose,

    // Plan
    "Plan:getPlanDetails": plan_getPlanDetails,
    "Plan:addMilestone": plan_addMilestone,
    "Plan:removeMilestone": plan_removeMilestone,
    "Plan:updateMilestone": plan_updateMilestone,

    // Instructions
    "Instructions:getSteps": instructions_getSteps,
    "Instructions:addStep": instructions_addStep,
    "Instructions:removeStep": instructions_removeStep,
    "Instructions:updateStep": instructions_updateStep,

    // UseCases
    "UseCases:getScenarios": useCases_getScenarios,
    "UseCases:addScenario": useCases_addScenario,
    "UseCases:removeScenario": useCases_removeScenario,
    "UseCases:updateScenario": useCases_updateScenario,

    // Logic
    "Logic:getLogicDetails": logic_getLogicDetails,
    "Logic:updateDescription": logic_updateDescription,
    "Logic:getDecisionTrees": logic_getDecisionTrees,
    "Logic:addDecisionTree": logic_addDecisionTree,
    "Logic:removeDecisionTree": logic_removeDecisionTree,
    "Logic:runHeuristics": logic_runHeuristics,

    // Classification
    "Classification:getRiskCategories": classification_getRiskCategories,
    "Classification:addRiskCategory": classification_addRiskCategory,
    "Classification:removeRiskCategory": classification_removeRiskCategory,

    // SecurityLevel
    "SecurityLevel:getSecurityLevel": securityLevel_getSecurityLevel,
    "SecurityLevel:updateLevel": securityLevel_updateLevel,
    "SecurityLevel:addEncryptionProtocol": securityLevel_addEncryptionProtocol,
    "SecurityLevel:removeEncryptionProtocol": securityLevel_removeEncryptionProtocol,

    // Ownership
    "Ownership:getOwnershipDetails": ownership_getOwnershipDetails,
    "Ownership:updateOwner": ownership_updateOwner,
    "Ownership:addAuthorizedEntity": ownership_addAuthorizedEntity,
    "Ownership:removeAuthorizedEntity": ownership_removeAuthorizedEntity,

    // Versioning
    "Versioning:createNewVersion": versioning_createNewVersion,
    "Versioning:getChangeLog": versioning_getChangeLog,
    "Versioning:getCurrentVersion": versioning_getCurrentVersion,
    "Versioning:rollbackToVersion": versioning_rollbackToVersion,

    // IntegrationPoints
    "IntegrationPoints:getAPIs": integrationPoints_getAPIs,
    "IntegrationPoints:addAPI": integrationPoints_addAPI,
    "IntegrationPoints:removeAPI": integrationPoints_removeAPI,

    // ResourceLinks
    "ResourceLinks:getDocumentationLink": resourceLinks_getDocumentation,
    "ResourceLinks:updateDocumentationLink": resourceLinks_updateDocumentation,
    "ResourceLinks:getDatasetRepos": resourceLinks_getDatasetRepos,
    "ResourceLinks:addDatasetRepo": resourceLinks_addDatasetRepo,
    "ResourceLinks:removeDatasetRepo": resourceLinks_removeDatasetRepo,

    // Dependencies
    "Dependencies:getLibraries": dependencies_getLibraries,
    "Dependencies:addLibrary": dependencies_addLibrary,
    "Dependencies:removeLibrary": dependencies_removeLibrary,
    "Dependencies:getHardwareRequirements": dependencies_getHardwareRequirements,
    "Dependencies:addHardwareRequirement": dependencies_addHardwareRequirement,
    "Dependencies:removeHardwareRequirement": dependencies_removeHardwareRequirement,

    // PerformanceMetrics
    "PerformanceMetrics:getMetrics": performanceMetrics_getMetrics,
    "PerformanceMetrics:updateMetric": performanceMetrics_updateMetric,
    "PerformanceMetrics:addMetric": performanceMetrics_addMetric,
    "PerformanceMetrics:removeMetric": performanceMetrics_removeMetric,

    // AITrainingParameters
    "AITrainingParameters:getHyperparameters": aiTrainingParameters_getHyperparameters,
    "AITrainingParameters:updateHyperparameter": aiTrainingParameters_updateHyperparameter,
    "AITrainingParameters:addHyperparameter": aiTrainingParameters_addHyperparameter,
    "AITrainingParameters:removeHyperparameter": aiTrainingParameters_removeHyperparameter,

    // TestingDatasets
    "TestingDatasets:getAvailableDatasets": testingDatasets_getAvailableDatasets,
    "TestingDatasets:addDataset": testingDatasets_addDataset,
    "TestingDatasets:removeDataset": testingDatasets_removeDataset,

    // Permissions
    "Permissions:getAccessControls": permissions_getAccessControls,
    "Permissions:addAccessControl": permissions_addAccessControl,
    "Permissions:removeAccessControl": permissions_removeAccessControl,

    // RevocationProtocols
    "RevocationProtocols:getStrategy": revocationProtocols_getStrategy,
    "RevocationProtocols:updateStrategy": revocationProtocols_updateStrategy,

    // RollbackMechanisms
    "RollbackMechanisms:getRollbackPoints": rollbackMechanisms_getRollbackPoints,
    "RollbackMechanisms:addRollbackPoint": rollbackMechanisms_addRollbackPoint,
    "RollbackMechanisms:removeRollbackPoint": rollbackMechanisms_removeRollbackPoint,

    // AuditLogs
    "AuditLogs:getRecords": auditLogs_getRecords,
    "AuditLogs:addRecord": auditLogs_addRecord,

    // CodeExamples
    "CodeExamples:getSnippets": codeExamples_getSnippets,
    "CodeExamples:addSnippet": codeExamples_addSnippet,
    "CodeExamples:removeSnippet": codeExamples_removeSnippet,
};

// --- Helper Functions for Parsing Form Data ---
const parseKeyValueString = (input: string): Record<string, string> => {
    const result: Record<string, string> = {};
    if (!input) return result;
    input.split(",").forEach(item => {
        const parts = item.split(":", 2).map(s => s.trim());
        if (parts.length === 2 && parts[0]) {
            result[parts[0]] = parts[1];
        } else if (parts.length === 1 && parts[0]) {
            result[parts[0]] = parts[0]; // Use key as value if no explicit value
        }
    });
    return result;
};

const parseStringList = (input: string): string[] => {
    if (!input) return [];
    return input.split("\n").map(s => s.trim()).filter(Boolean);
};

const parseCommaSeparatedList = (input: string): string[] => {
    if (!input) return [];
    return input.split(",").map(s => s.trim()).filter(Boolean);
};

// --- Build the OmniStruct ---
/**
 * Constructs an OmniStruct object from the provided form data.
 * This function initializes all the various sections of the OmniStruct.
 * @param formData The data from the form to populate the OmniStruct.
 * @returns A fully initialized OmniStruct object.
 */
export const buildOmniStruct = (formData: OmniStructFormData): OmniStruct => {
    const milestones_dict = parseKeyValueString(formData.planMilestones);
    const instructions_list = parseStringList(formData.instructionsSteps);
    const use_cases_list = parseStringList(formData.useCasesScenarios);
    const classification_risk_categories = parseCommaSeparatedList(formData.classificationRiskCategories);
    const security_encryption_protocols = parseCommaSeparatedList(formData.securityEncryptionProtocols);
    const ownership_authorized_entities = parseCommaSeparatedList(formData.ownershipAuthorizedEntities);

    const integration_external_apis: { name: string; url: string; }[] = [];
    if (formData.integrationExternalApis) {
        formData.integrationExternalApis.split(",").forEach(item => {
            const parts = item.split(":", 2).map(s => s.trim());
            if (parts.length === 2 && parts[0] && parts[1]) {
                integration_external_apis.push({ name: parts[0], url: parts[1] });
            } else if (parts.length === 1 && parts[0]) {
                try {
                    const url = new URL(parts[0]);
                    integration_external_apis.push({ name: url.hostname || "Unnamed API", url: parts[0] });
                } catch {
                    integration_external_apis.push({ name: parts[0], url: "" }); // Fallback
                }
            }
        });
    }

    const resource_dataset_repos = parseCommaSeparatedList(formData.resourceDatasetRepos).join(", "); // Keep as string for original type
    const dependencies_required_libraries = parseCommaSeparatedList(formData.dependenciesRequiredLibraries);
    const dependencies_hardware_requirements = parseCommaSeparatedList(formData.dependenciesHardwareRequirements);
    const ai_hyperparameters = parseKeyValueString(formData.aiTrainingHyperparameters);
    const testing_available_datasets = parseCommaSeparatedList(formData.testingDatasetsAvailable);
    const permissions_access_controls = parseCommaSeparatedList(formData.permissionsAccessControls);
    const rollback_mechanism_points = parseCommaSeparatedList(formData.rollbackMechanismPoints);
    const code_example_snippets = parseKeyValueString(formData.codeExampleSnippets);

    return {
        Purpose: {
            description: formData.purposeDesc || "No purpose description provided.",
            functions: {
                updateDescription: "Purpose:updateDescription",
                getPurpose: "Purpose:getPurpose"
            }
        },
        Plan: {
            milestones: milestones_dict,
            functions: {
                getPlanDetails: "Plan:getPlanDetails",
                addMilestone: "Plan:addMilestone",
                removeMilestone: "Plan:removeMilestone",
                updateMilestone: "Plan:updateMilestone"
            }
        },
        Instructions: {
            steps: instructions_list,
            functions: {
                getSteps: "Instructions:getSteps",
                addStep: "Instructions:addStep",
                removeStep: "Instructions:removeStep",
                updateStep: "Instructions:updateStep"
            }
        },
        UseCases: {
            scenarios: use_cases_list,
            functions: {
                getScenarios: "UseCases:getScenarios",
                addScenario: "UseCases:addScenario",
                removeScenario: "UseCases:removeScenario",
                updateScenario: "UseCases:updateScenario"
            }
        },
        Logic: {
            description: formData.logicDesc || "No logic description provided.",
            decisionTrees: { example: "Complex multi-branch logic for business rules." }, // Default example
            functions: {
                getLogicDetails: "Logic:getLogicDetails",
                updateDescription: "Logic:updateDescription",
                getDecisionTrees: "Logic:getDecisionTrees",
                addDecisionTree: "Logic:addDecisionTree",
                removeDecisionTree: "Logic:removeDecisionTree",
                runHeuristics: "Logic:runHeuristics"
            }
        },
        Classification: {
            riskCategories: classification_risk_categories.length > 0 ? classification_risk_categories : ["Undefined"],
            functions: {
                getRiskCategories: "Classification:getRiskCategories",
                addRiskCategory: "Classification:addRiskCategory",
                removeRiskCategory: "Classification:removeRiskCategory"
            }
        },
        SecurityLevel: {
            level: formData.securityLevel || "MEDIUM",
            encryptionProtocols: security_encryption_protocols.length > 0 ? security_encryption_protocols : ["TLS1.2"],
            functions: {
                getSecurityLevel: "SecurityLevel:getSecurityLevel",
                updateLevel: "SecurityLevel:updateLevel",
                addEncryptionProtocol: "SecurityLevel:addEncryptionProtocol",
                removeEncryptionProtocol: "SecurityLevel:removeEncryptionProtocol"
            }
        },
        Ownership: {
            currentOwner: formData.ownershipCurrentOwner || "Unknown",
            authorizedEntities: ownership_authorized_entities,
            functions: {
                getOwnershipDetails: "Ownership:getOwnershipDetails",
                updateOwner: "Ownership:updateOwner",
                addAuthorizedEntity: "Ownership:addAuthorizedEntity",
                removeAuthorizedEntity: "Ownership:removeAuthorizedEntity"
            }
        },
        Versioning: {
            currentVersion: "v1.0.0",
            changeLog: [{ version: "v1.0.0", changes: "Initial creation", timestamp: new Date().toISOString() }],
            functions: {
                createNewVersion: "Versioning:createNewVersion",
                getChangeLog: "Versioning:getChangeLog",
                getCurrentVersion: "Versioning:getCurrentVersion",
                rollbackToVersion: "Versioning:rollbackToVersion"
            }
        },
        IntegrationPoints: {
            externalAPIs: integration_external_apis,
            functions: {
                getAPIs: "IntegrationPoints:getAPIs",
                addAPI: "IntegrationPoints:addAPI",
                removeAPI: "IntegrationPoints:removeAPI"
            }
        },
        ResourceLinks: {
            documentation: formData.resourceDocumentationLink || "",
            datasetRepo: resource_dataset_repos,
            functions: {
                getDocumentationLink: "ResourceLinks:getDocumentationLink",
                updateDocumentationLink: "ResourceLinks:updateDocumentationLink",
                getDatasetRepos: "ResourceLinks:getDatasetRepos",
                addDatasetRepo: "ResourceLinks:addDatasetRepo",
                removeDatasetRepo: "ResourceLinks:removeDatasetRepo"
            }
        },
        Dependencies: {
            requiredLibraries: dependencies_required_libraries,
            hardwareRequirements: dependencies_hardware_requirements,
            functions: {
                getLibraries: "Dependencies:getLibraries",
                addLibrary: "Dependencies:addLibrary",
                removeLibrary: "Dependencies:removeLibrary",
                getHardwareRequirements: "Dependencies:getHardwareRequirements",
                addHardwareRequirement: "Dependencies:addHardwareRequirement",
                removeHardwareRequirement: "Dependencies:removeHardwareRequirement"
            }
        },
        PerformanceMetrics: {
            currentPerformance: { "startupTime_ms": 1500, "averageLatency_ms": 50, "throughput_tps": 100 },
            functions: {
                getMetrics: "PerformanceMetrics:getMetrics",
                updateMetric: "PerformanceMetrics:updateMetric",
                addMetric: "PerformanceMetrics:addMetric",
                removeMetric: "PerformanceMetrics:removeMetric"
            }
        },
        AITrainingParameters: {
            hyperparameters: ai_hyperparameters,
            functions: {
                getHyperparameters: "AITrainingParameters:getHyperparameters",
                updateHyperparameter: "AITrainingParameters:updateHyperparameter",
                addHyperparameter: "AITrainingParameters:addHyperparameter",
                removeHyperparameter: "AITrainingParameters:removeHyperparameter"
            }
        },
        TestingDatasets: {
            availableDatasets: testing_available_datasets,
            functions: {
                getAvailableDatasets: "TestingDatasets:getAvailableDatasets",
                addDataset: "TestingDatasets:addDataset",
                removeDataset: "TestingDatasets:removeDataset"
            }
        },
        Permissions: {
            accessControls: permissions_access_controls,
            functions: {
                getAccessControls: "Permissions:getAccessControls",
                addAccessControl: "Permissions:addAccessControl",
                removeAccessControl: "Permissions:removeAccessControl"
            }
        },
        RevocationProtocols: {
            strategy: formData.revocationStrategy || "Manual",
            functions: {
                getStrategy: "RevocationProtocols:getStrategy",
                updateStrategy: "RevocationProtocols:updateStrategy"
            }
        },
        RollbackMechanisms: {
            rollbackPoints: rollback_mechanism_points,
            functions: {
                getRollbackPoints: "RollbackMechanisms:getRollbackPoints",
                addRollbackPoint: "RollbackMechanisms:addRollbackPoint",
                removeRollbackPoint: "RollbackMechanisms:removeRollbackPoint"
            }
        },
        AuditLogs: {
            records: [],
            functions: {
                getRecords: "AuditLogs:getRecords",
                addRecord: "AuditLogs:addRecord"
            }
        },
        CodeExamples: {
            sampleSnippets: code_example_snippets,
            functions: {
                getSnippets: "CodeExamples:getSnippets",
                addSnippet: "CodeExamples:addSnippet",
                removeSnippet: "CodeExamples:removeSnippet"
            }
        }
    };
};

// --- Execution Handler ---
/**
 * Executes a specific OmniFunction referenced by a string.
 * It uses Immer to ensure immutable updates to the OmniStruct.
 * @param omnistruct The current state of the OmniStruct.
 * @param ref The reference string of the function to execute (e.g., "Purpose:updateDescription").
 * @param args The arguments to pass to the OmniFunction.
 * @returns An object containing the new (updated) OmniStruct and the result of the function execution.
 */
export const executeReference = (omnistruct: OmniStruct, ref: string, args: any): { newOmniStruct: OmniStruct, result: any } => {
    if (!FUNCTION_MAP[ref]) {
        return { newOmniStruct: omnistruct, result: { error: `Unknown reference '${ref}'` } };
    }
    const func = FUNCTION_MAP[ref];

    // Use Immer to handle immutable updates safely
    let result: any;
    const newOmniStruct = produce(omnistruct, draft => {
        // The draft is mutable within the producer, but Immer ensures a new immutable state is returned.
        result = func(draft as OmniStruct, args);
    });

    return { newOmniStruct, result };
};

// --- OmniStruct Manager Class ---
/**
 * Manages an OmniStruct instance, providing a more object-oriented interface
 * for interaction and state management. Encapsulates the immutable update logic.
 */
export class OmniStructManager {
    private currentOmniStruct: OmniStruct;

    /**
     * Initializes a new OmniStructManager instance.
     * @param initialOmniStruct The initial OmniStruct object.
     */
    constructor(initialOmniStruct: OmniStruct) {
        this.currentOmniStruct = initialOmniStruct;
    }

    /**
     * Gets the current immutable state of the OmniStruct.
     * @returns The current OmniStruct.
     */
    public getOmniStruct(): OmniStruct {
        return this.currentOmniStruct;
    }

    /**
     * Executes an OmniFunction identified by its reference string and updates the internal OmniStruct state.
     * @param ref The reference string of the function to execute (e.g., "Purpose:updateDescription").
     * @param args The arguments to pass to the OmniFunction.
     * @returns The result returned by the executed OmniFunction.
     */
    public execute(ref: string, args: any = {}): any {
        const { newOmniStruct, result } = executeReference(this.currentOmniStruct, ref, args);
        this.currentOmniStruct = newOmniStruct; // Update the manager's internal state
        return result;
    }

    /**
     * Executes a function and returns the updated OmniStruct and result.
     * This is useful if you want to explicitly work with the new state object
     * without updating the manager's internal state immediately.
     * @param ref The reference string of the function to execute.
     * @param args The arguments for the function.
     * @returns An object containing the `newOmniStruct` and the `result` of the operation.
     */
    public previewExecute(ref: string, args: any = {}): { newOmniStruct: OmniStruct, result: any } {
        return executeReference(this.currentOmniStruct, ref, args);
    }

    // --- Convenience Methods for Common Operations ---
    // These methods wrap common OmniFunctions for easier use without direct reference string manipulation.

    /**
     * Updates the description of the OmniStruct's purpose.
     * @param description The new purpose description.
     * @returns The result of the update operation.
     */
    public updatePurposeDescription(description: string): any {
        return this.execute("Purpose:updateDescription", { description });
    }

    /**
     * Adds a new milestone to the plan.
     * @param key The key for the milestone (e.g., "Phase3").
     * @param value The value/description for the milestone (e.g., "Complete Beta Testing").
     * @returns The result of the add operation.
     */
    public addPlanMilestone(key: string, value: string): any {
        return this.execute("Plan:addMilestone", { key, value });
    }

    /**
     * Adds a new instruction step.
     * @param step The new step to add.
     * @returns The result of the add operation.
     */
    public addInstructionStep(step: string): any {
        return this.execute("Instructions:addStep", { newStep: step });
    }

    /**
     * Adds a new use case scenario.
     * @param scenario The new scenario to add.
     * @returns The result of the add operation.
     */
    public addUseCaseScenario(scenario: string): any {
        return this.execute("UseCases:addScenario", { newScenario: scenario });
    }

    /**
     * Creates a new version entry in the versioning log.
     * @param version The version string (e.g., "v1.0.1").
     * @param changes A description of changes in this version.
     * @returns The result of the version creation.
     */
    public createNewVersion(version: string, changes: string): any {
        return this.execute("Versioning:createNewVersion", { version, changes });
    }

    /**
     * Adds an external API integration point.
     * @param apiIdentifier Can be "Name:URL" or just "URL".
     * @returns The result of the add operation.
     */
    public addIntegrationAPI(apiIdentifier: string): any {
        return this.execute("IntegrationPoints:addAPI", { api: apiIdentifier });
    }

    /**
     * Adds a new audit log record.
     * @param record The audit record object (e.g., { user: "admin", action: "login", success: true }).
     * @returns The result of the add operation.
     */
    public addAuditRecord(record: object): any {
        return this.execute("AuditLogs:addRecord", { record });
    }

    // --- Getter Convenience Methods (read-only, no state change) ---
    /**
     * Retrieves the description from the Purpose section.
     * @returns The purpose description.
     */
    public getPurposeDescription(): string {
        return this.currentOmniStruct.Purpose.description;
    }

    /**
     * Retrieves all milestones from the Plan section.
     * @returns A record of milestones.
     */
    public getPlanMilestones(): Record<string, string> {
        return this.currentOmniStruct.Plan.milestones;
    }

    /**
     * Retrieves all instruction steps.
     * @returns An array of instruction steps.
     */
    public getInstructionSteps(): string[] {
        return this.currentOmniStruct.Instructions.steps;
    }

    /**
     * Retrieves the current version from the Versioning section.
     * @returns The current version string.
     */
    public getCurrentVersion(): string {
        return this.currentOmniStruct.Versioning.currentVersion;
    }
}<ctrl63>