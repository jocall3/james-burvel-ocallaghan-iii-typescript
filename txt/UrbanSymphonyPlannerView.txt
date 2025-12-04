import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

// --- Core Data Models: Expanded to extreme granularity for real-world application complexity ---

/**
 * Represents the detailed structure and characteristics of a city's infrastructure network.
 * This includes various forms of transport, utilities, and digital connectivity.
 * Each sub-section is further detailed to reflect real-world planning parameters.
 */
export interface InfrastructureNetwork {
  /** Detailed road network metrics, including various road types and their capacities. */
  roads: {
    majorHighways: { lengthKm: number; lanesPerDirection: number; trafficFlowIndex: number; materials: string[] }[];
    arterialRoads: { lengthKm: number; speedLimitKph: number; avgCongestionFactor: number }[];
    localStreets: { lengthKm: number; pedestrianFriendlyScore: number; cyclingLaneCoveragePercent: number }[];
    totalRoadLengthKm: number;
    roadDensityPerSqKm: number;
  };
  /** Public transport system details, covering various modes and their operational metrics. */
  publicTransport: {
    metro: { lines: number; stations: number; dailyRidership: number; networkLengthKm: number; expansionPlans: string[] }[];
    bus: { routes: number; fleetSize: number; coveragePercent: number; electrificationRate: number }[];
    tram: { lines: number; stations: number; networkLengthKm: number }[];
    commuterRail: { lines: number; stations: number; intercityConnections: number }[];
    totalCoveragePercent: number;
    accessibilityScore: number;
    integrationScore: number; // How well different modes connect
  };
  /** Critical utility infrastructure metrics for water, electricity, and waste. */
  utilities: {
    waterSupplyCapacityMillionsLitersPerDay: number;
    waterDistributionEfficiencyPercent: number; // % water not lost
    electricityGridReliabilityIndex: number; // SAIDI/SAIFI equivalent
    peakElectricityDemandMW: number;
    wasteManagementEfficiencyPercent: number; // % recycled/repurposed
    wastewaterTreatmentCapacityMillionsLitersPerDay: number;
    stormwaterManagementCapacityCubicMeters: number; // Flood resilience
  };
  /** Digital connectivity and smart city technology integration. */
  digitalConnectivity: {
    fiberOpticCoveragePercent: number;
    '5GDeploymentPercent': number;
    smartStreetlightCoveragePercent: number;
    IoTDeviceDensityPerSqKm: number;
    dataCenterCapacityTB: number;
  };
  smartCityInfrastructureIndex: number;
}

/**
 * Detailed profile of green spaces within the city, crucial for livability and environment.
 * Includes parks, urban forests, community gardens, and waterfront access.
 */
export interface GreenSpaceProfile {
  totalAreaSqKm: number;
  percentageOfCityArea: number;
  parks: { count: number; avgSizeSqM: number; features: string[]; annualVisitors: number }[];
  urbanForests: { areaSqKm: number; speciesDiversityIndex: number; carbonSequestrationTonsPerYear: number }[];
  communityGardens: { count: number; totalAreaSqM: number; publicAccessPercent: number }[];
  waterfrontAccessPercent: number; // Percentage of city waterfront accessible to public
  biodiversityIndex: number;
  canopyCoverPercent: number; // Tree canopy cover
  recreationalFacilityScore: number; // Quality and quantity of sports/leisure facilities in green spaces
}

/**
 * Detailed zoning distribution, crucial for urban planning and development control.
 * Breaks down land use into very specific categories and sub-categories.
 */
export interface ZoningDetails {
  residential: {
    lowDensity: { areaSqKm: number; housingUnits: number; avgLotSizeSqM: number };
    mediumDensity: { areaSqKm: number; housingUnits: number; avgStories: number };
    highDensity: { areaSqKm: number; housingUnits: number; buildingFootprintRatio: number };
    mixedUseResidential: { areaSqKm: number; commercialMixRatio: number };
    totalResidentialAreaSqKm: number;
    avgHousingPriceIndex: number;
  };
  commercial: {
    retail: { areaSqKm: number; storefrontCount: number; vacancyRatePercent: number };
    office: { areaSqKm: number; totalFloorSpaceSqM: number; occupancyRatePercent: number };
    mixedUseCommercial: { areaSqKm: number; residentialMixRatio: number };
    totalCommercialAreaSqKm: number;
    economicActivityIndex: number;
  };
  industrial: {
    light: { areaSqKm: number; businessCount: number; employmentImpactFactor: number };
    heavy: { areaSqKm: number; environmentalComplianceScore: number };
    logisticsHubs: { areaSqKm: number; cargoVolumeTEU: number };
    totalIndustrialAreaSqKm: number;
  };
  publicFacilities: {
    schools: { count: number; studentCapacity: number; avgClassSize: number; primarySecondaryRatio: number };
    hospitals: { count: number; bedCapacity: number; specialistAvailabilityIndex: number };
    cultural: { count: number; museumGalleries: number; theatersConcertHalls: number; attendanceRate: number };
    governmental: { areaSqKm: number; administrativeEfficiencyScore: number };
    totalPublicFacilityAreaSqKm: number;
  };
  greenSpaces: { areaSqKm: number };
  infrastructureCorridors: { areaSqKm: number; utilityLineDensity: number }; // For roads, rails, power lines
  specialZones: { type: string; areaSqKm: number; purpose: string; regulations: string }[];
  urbanGrowthBoundaryKm: number; // Distance from city center
  developmentPermitIssuanceRate: number; // Permits per 1000 residents/year
}

/**
 * Comprehensive population profile, including demographics and growth trends.
 * Crucial for planning services and infrastructure.
 */
export interface PopulationProfile {
  total: number;
  densityPerSqKm: number;
  ageDistribution: { '0-14': number; '15-64': number; '65+': number; medianAge: number }; // percentages and median
  incomeDistribution: { low: number; medium: number; high: number; giniCoefficient: number };
  growthRatePercent: number;
  migrationRatePer1000: number; // Inflow minus outflow
  ethnicDiversityIndex: number;
  educationLevelDistribution: { primary: number; secondary: number; higher: number; literacyRatePercent: number };
  householdSizeAvg: number;
}

/**
 * Detailed report on the environmental impact and sustainability metrics of the city.
 * Focuses on carbon, air/water quality, waste, and resilience.
 */
export interface EnvironmentalImpactReport {
  carbonFootprintPerCapitaTonsCO2e: number;
  totalCarbonEmissionsTonsCO2ePerYear: number;
  airQualityIndexAQI: number; // Lower is better
  waterQualityIndexWQI: number; // Higher is better
  wasteRecyclingRatePercent: number;
  renewableEnergySharePercent: number; // Percentage of total energy from renewables
  energyEfficiencyIndex: number; // Per capita energy consumption vs benchmark
  floodRiskAssessment: 'low' | 'medium' | 'high' | 'very-high';
  heatIslandEffectReductionPercent: number;
  greenBuildingCertificationRate: number; // % of new buildings certified
  noisePollutionLevelAvgDB: number; // Added here for environmental context
}

/**
 * Socio-economic health indicators, critical for community well-being and development.
 * Covers employment, housing, education, healthcare, and social equity.
 */
export interface SocioEconomicIndicators {
  employmentRatePercent: number;
  unemploymentRatePercent: number;
  housingAffordabilityIndex: number; // Ratio of median house price to median household income
  homelessnessRatePer1000: number;
  educationAccessIndex: number; // Composite score of school proximity and quality
  healthcareAccessIndex: number; // Composite score of hospital proximity and doctor-patient ratio
  culturalVibrancyIndex: number; // Number of cultural institutions per capita, event frequency
  crimeRatePer1000: number;
  socialEquityIndex: number; // Distribution of resources and opportunities
  publicSafetyScore: number;
  povertyRatePercent: number;
  digitalInclusionIndex: number; // Access to internet and digital literacy
}

/**
 * Characterization of the city's acoustic and sensory environment.
 * Helps in designing pleasant and functional urban spaces.
 */
export interface AcousticSensoryLandscape {
  noisePollutionZones: { type: 'traffic' | 'industrial' | 'construction' | 'entertainment'; areaSqKm: number; dominantSources: string[]; avgDecibelLevel: number }[];
  quietZonesAreaPercent: number; // Percentage of city area designated as quiet
  visualCorridorsCount: number; // Number of aesthetically pleasing visual paths
  sensoryDiversityScore: number; // Variety of sensory experiences (smell, sound, sight)
  lightPollutionIndex: number;
  urbanArtDensityPerSqKm: number;
  walkabilityScore: number; // Composite score for pedestrian-friendliness
}

/**
 * Detailed traffic and mobility analysis for the city plan.
 * Crucial for optimizing transport systems and reducing congestion.
 */
export interface TrafficFlowAnalysis {
  peakHourCongestionIndex: number; // Ratio of peak to off-peak travel time
  publicTransportUsagePercent: number; // % of commutes using PT
  cyclingPedestrianInfrastructureQuality: 'low' | 'medium' | 'high' | 'excellent';
  commuteTimeAvgMinutes: number;
  parkingAvailabilityIndex: number;
  modalSplit: { // Percentage breakdown of commute modes
    car: number;
    publicTransport: number;
    cycling: number;
    walking: number;
    other: number;
  };
  trafficAccidentRatePer100000: number;
  electricVehicleChargingStationDensityPerKm: number;
}

/**
 * Represents a full City Plan generated by the Urban Symphony Planner AI.
 * Now vastly expanded to include all detailed sub-interfaces.
 */
export interface CityPlan {
  planId: string;
  name: string;
  description: string;
  timestamp: string;
  version: number;
  mapImageUrl: string; // URL to a top-down city plan image
  harmonyScore: number; // How well elements blend aesthetically and functionally (0-1)
  efficiencyScore: number; // Resource use, traffic flow, service delivery (0-1)
  livabilityScore: number; // Quality of life for residents (0-1)
  overallSustainabilityScore: number; // Environmental, social, economic sustainability (0-1)
  resilienceScore: number; // Ability to withstand and recover from shocks (0-1)
  innovationScore: number; // Integration of new tech and progressive policies (0-1)

  infrastructure: InfrastructureNetwork;
  greenSpace: GreenSpaceProfile;
  zoning: ZoningDetails;
  population: PopulationProfile;
  environmentalImpact: EnvironmentalImpactReport;
  socioEconomic: SocioEconomicIndicators;
  acousticSensory: AcousticSensoryLandscape;
  trafficFlow: TrafficFlowAnalysis;

  // New metrics for visualization layers
  dataLayers: {
    residentialDensityMap: string; // URL to density heatmap image
    transportNetworkMap: string; // URL to transport network image
    greenSpaceOverlayMap: string; // URL to green space overlay image
    noiseMap: string; // URL to noise heatmap image
    socialInfrastructureMap: string; // URL to social infrastructure map
    economicZonesMap: string; // URL to map of economic activity
    environmentalQualityMap: string; // URL to map of air/water quality
    publicSafetyMap: string; // URL to crime hotspots/safety zones map
    urbanHeatIslandMap: string; // URL to UHI map
  };
  keyRecommendations: string[];
  warnings: string[];
  budgetEstimateMillionsUSD: number;
  implementationPhases: {
    phaseName: string;
    durationMonths: number;
    budgetMillionsUSD: number;
    status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
    milestones: { name: string; targetDate: string; completionPercent: number; dependencies: string[] }[];
  }[];
  riskAssessment: { type: 'environmental' | 'financial' | 'social' | 'operational'; severity: 'low' | 'medium' | 'high'; description: string; mitigationStrategy: string }[];
  stakeholderFeedbackSummary: { positive: string[]; negative: string[]; actionItems: string[] };
}

/**
 * User-defined constraints for generating and refining city plans.
 * Expanded with more precise controls and options.
 */
export interface DesignConstraints {
  populationTarget: { min: number; max: number; targetGrowthRatePercent: number };
  areaSqKm: { min: number; max: number; preferredShape: 'compact' | 'linear' | 'polycentric' };
  greenSpaceTargetPercent: number;
  publicTransportCoverageTargetPercent: number;
  carbonReductionTargetPercent: number;
  housingAffordabilityTargetIndex: number;
  zoningPreferences: {
    residentialDensityPreference: 'low' | 'medium' | 'high' | 'mixed';
    commercialFocus: 'retail' | 'office' | 'mixed' | 'innovation-hub';
    industrialPreference: 'light' | 'heavy' | 'none' | 'eco-industrial';
    mixedUseIntegrationLevel: 'low' | 'medium' | 'high'; // How integrated are different uses
  };
  environmentalFocus: 'waterfront' | 'forest' | 'desert' | 'coastal' | 'mountainous' | 'mixed';
  socioEconomicGoals: {
    employmentGrowthPercent: number;
    educationQualityImprovementPercent: number;
    healthcareAccessImprovementPercent: number;
    culturalPreservationEmphasis: 'low' | 'medium' | 'high';
    socialEquityTargetIndex: number;
  };
  budgetCapMillionsUSD: number;
  timelineMonths: number;
  priorityAreas: { name: string; type: 'residential' | 'commercial' | 'green' | 'mixed' | 'industrial' | 'public'; coordinates: string; developmentIntensity: 'low' | 'medium' | 'high' }[];
  noiseReductionTargetDB: number;
  biodiversityTargetIndex: number;
  waterEfficiencyTargetPercent: number;
  smartCityFeaturePriorities: string[]; // e.g., 'smart traffic', 'smart waste', 'public WiFi'
  citizenParticipationMechanism: 'online-platform' | 'public-forums' | 'hybrid';
  climateResilienceStrategies: string[]; // e.g., 'sea wall', 'urban greening', 'drainage improvements'
}

/**
 * Metadata for a project, managing its name, history, and associated plans.
 */
export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  currentPlanId: string | null; // ID of the currently active plan for this project
  planHistory: { planId: string; timestamp: string; notes: string; constraintsUsed: DesignConstraints }[];
  collaborators: { userId: string; role: 'viewer' | 'editor' }[]; // Mock collaboration
  status: 'active' | 'archived' | 'on-hold';
  tags: string[];
}

/**
 * User profile with preferences and access levels.
 */
export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  organization: string;
  preferences: {
    defaultUnitSystem: 'metric' | 'imperial';
    mapTheme: 'light' | 'dark';
    notificationSettings: { email: boolean; inApp: boolean; sms: boolean };
    dashboardLayout: 'compact' | 'expanded';
    dataPrivacyLevel: 'standard' | 'enhanced';
  };
  accessLevel: 'viewer' | 'editor' | 'admin' | 'super-admin';
  lastLogin: string;
}

// --- Mock API Service: Simulates a robust backend for handling complex urban planning data ---
/**
 * `UrbanSymphonyApiService` provides a mock backend for managing projects, city plans,
 * user profiles, and simulating advanced AI planning operations. It stores data in-memory.
 */
export class UrbanSymphonyApiService {
  private static instance: UrbanSymphonyApiService;
  private projects: ProjectMetadata[] = [];
  private plans: { [planId: string]: CityPlan } = {};
  private users: { [userId: string]: UserProfile } = {};
  private nextPlanId = 1;
  private nextProjectId = 1;

  private constructor() {
    // Initialize with some dummy data for demonstration
    this.users['user-001'] = {
      userId: 'user-001', username: 'Jane Doe', email: 'jane.doe@city.gov', organization: 'City Planning Department',
      preferences: { defaultUnitSystem: 'metric', mapTheme: 'dark', notificationSettings: { email: true, inApp: true, sms: false }, dashboardLayout: 'expanded', dataPrivacyLevel: 'standard' },
      accessLevel: 'admin', lastLogin: new Date().toISOString()
    };
    this.createMockProject("Default Symphony Project", {
      populationTarget: { min: 750000, max: 1200000, targetGrowthRatePercent: 1.5 },
      areaSqKm: { min: 150, max: 250, preferredShape: 'compact' },
      greenSpaceTargetPercent: 35,
      publicTransportCoverageTargetPercent: 85,
      carbonReductionTargetPercent: 45,
      housingAffordabilityTargetIndex: 0.75,
      zoningPreferences: { residentialDensityPreference: 'mixed', commercialFocus: 'mixed', industrialPreference: 'light', mixedUseIntegrationLevel: 'high' },
      environmentalFocus: 'waterfront',
      socioEconomicGoals: { employmentGrowthPercent: 5, educationQualityImprovementPercent: 10, healthcareAccessImprovementPercent: 15, culturalPreservationEmphasis: 'high', socialEquityTargetIndex: 0.8 },
      budgetCapMillionsUSD: 8000,
      timelineMonths: 180,
      priorityAreas: [
        { name: 'Riverfront Revitalization', type: 'green', coordinates: 'lat:34.05,lon:-118.25', developmentIntensity: 'medium' },
        { name: 'Tech Innovation Hub', type: 'commercial', coordinates: 'lat:34.06,lon:-118.28', developmentIntensity: 'high' }
      ],
      noiseReductionTargetDB: 5,
      biodiversityTargetIndex: 0.8,
      waterEfficiencyTargetPercent: 20,
      smartCityFeaturePriorities: ['smart traffic management', 'public safety sensors', 'digital kiosks'],
      citizenParticipationMechanism: 'hybrid',
      climateResilienceStrategies: ['green infrastructure', 'early warning systems']
    }, this.users['user-001'].userId);
  }

  /**
   * Returns the singleton instance of the UrbanSymphonyApiService.
   * @returns {UrbanSymphonyApiService} The singleton instance.
   */
  public static getInstance(): UrbanSymphonyApiService {
    if (!UrbanSymphonyApiService.instance) {
      UrbanSymphonyApiService.instance = new UrbanSymphonyApiService();
    }
    return UrbanSymphonyApiService.instance;
  }

  // --- Mock Data Generation Helpers: Highly detailed and influenced by constraints ---

  /**
   * Generates a random score within a realistic range, biased towards higher scores.
   * @returns {number} A score between 0.65 and 0.98.
   */
  private generateRandomScore(min: number = 0.65, max: number = 0.98): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  /**
   * Generates mock infrastructure data, attempting to simulate influence by constraints.
   * @param {DesignConstraints} constraints - The design constraints provided by the user.
   * @returns {InfrastructureNetwork} A mock InfrastructureNetwork object.
   */
  private generateInfrastructureBasedOnConstraints(constraints: DesignConstraints): InfrastructureNetwork {
    const ptCoverageInfluence = constraints.publicTransportCoverageTargetPercent / 100;
    const roadDensity = (constraints.areaSqKm.min + constraints.areaSqKm.max) / 200 * (1 - ptCoverageInfluence);

    return {
      roads: {
        majorHighways: [{ lengthKm: Math.floor(roadDensity * 50) + 100, lanesPerDirection: 3, trafficFlowIndex: this.generateRandomScore(0.7, 0.9), materials: ['asphalt', 'concrete'] }],
        arterialRoads: [{ lengthKm: Math.floor(roadDensity * 100) + 200, speedLimitKph: 60, avgCongestionFactor: this.generateRandomScore(0.2, 0.5) }],
        localStreets: [{ lengthKm: Math.floor(roadDensity * 300) + 500, pedestrianFriendlyScore: this.generateRandomScore(), cyclingLaneCoveragePercent: ptCoverageInfluence * 100 * 0.8 }],
        totalRoadLengthKm: Math.floor(roadDensity * 450) + 800,
        roadDensityPerSqKm: parseFloat((roadDensity * 2).toFixed(2)),
      },
      publicTransport: [{
        metro: [{ lines: Math.floor(ptCoverageInfluence * 8) + 2, stations: Math.floor(ptCoverageInfluence * 40) + 10, dailyRidership: Math.floor(ptCoverageInfluence * 500000) + 100000, networkLengthKm: Math.floor(ptCoverageInfluence * 150) + 50, expansionPlans: ['Phase 2 extension'] }],
        bus: [{ routes: Math.floor(ptCoverageInfluence * 100) + 50, fleetSize: Math.floor(ptCoverageInfluence * 300) + 100, coveragePercent: ptCoverageInfluence * 100, electrificationRate: Math.floor(ptCoverageInfluence * 50) }],
        tram: [{ lines: Math.floor(ptCoverageInfluence * 3), stations: Math.floor(ptCoverageInfluence * 15), networkLengthKm: Math.floor(ptCoverageInfluence * 30) }],
        commuterRail: [{ lines: Math.floor(ptCoverageInfluence * 2), stations: Math.floor(ptCoverageInfluence * 8), intercityConnections: Math.floor(ptCoverageInfluence * 3) }],
        totalCoveragePercent: ptCoverageInfluence * 100,
        accessibilityScore: this.generateRandomScore(0.7, 0.95),
        integrationScore: this.generateRandomScore(0.6, 0.9),
      }],
      utilities: {
        waterSupplyCapacityMillionsLitersPerDay: Math.floor(constraints.populationTarget.max / 1000 * 200) + 5000,
        waterDistributionEfficiencyPercent: 100 - (constraints.waterEfficiencyTargetPercent || 0) * 0.5,
        electricityGridReliabilityIndex: this.generateRandomScore(0.9, 0.99),
        peakElectricityDemandMW: Math.floor(constraints.populationTarget.max / 1000 * 0.5) + 200,
        wasteManagementEfficiencyPercent: constraints.carbonReductionTargetPercent * 0.8,
        wastewaterTreatmentCapacityMillionsLitersPerDay: Math.floor(constraints.populationTarget.max / 1000 * 180) + 4000,
        stormwaterManagementCapacityCubicMeters: Math.floor(constraints.areaSqKm.max * 10000) + 50000,
      },
      digitalConnectivity: {
        fiberOpticCoveragePercent: Math.min(90, 70 + (constraints.smartCityFeaturePriorities.includes('public WiFi') ? 15 : 0)),
        '5GDeploymentPercent': Math.min(80, 50 + (constraints.smartCityFeaturePriorities.includes('smart traffic management') ? 20 : 0)),
        smartStreetlightCoveragePercent: Math.min(70, 30 + (constraints.smartCityFeaturePriorities.includes('smart street lighting') ? 30 : 0)),
        IoTDeviceDensityPerSqKm: parseFloat((Math.random() * 50 + 20).toFixed(1)),
        dataCenterCapacityTB: Math.floor(Math.random() * 500) + 100,
      },
      smartCityInfrastructureIndex: this.generateRandomScore(0.7, 0.95),
    };
  }

  /**
   * Generates mock green space data, influenced by green space targets.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {GreenSpaceProfile} A mock GreenSpaceProfile object.
   */
  private generateGreenSpaceBasedOnConstraints(constraints: DesignConstraints): GreenSpaceProfile {
    const totalAreaSqKm = ((constraints.areaSqKm.min + constraints.areaSqKm.max) / 2) * (constraints.greenSpaceTargetPercent / 100);
    const canopyCover = Math.min(40, constraints.greenSpaceTargetPercent * 0.8);
    return {
      totalAreaSqKm: parseFloat(totalAreaSqKm.toFixed(1)),
      percentageOfCityArea: constraints.greenSpaceTargetPercent,
      parks: [{
        count: Math.floor(totalAreaSqKm / 5) + 5,
        avgSizeSqM: Math.floor(Math.random() * 50000) + 10000,
        features: ['playground', 'trails', 'dog park', 'botanical garden'],
        annualVisitors: Math.floor(Math.random() * 500000) + 100000
      }],
      urbanForests: [{
        areaSqKm: parseFloat((totalAreaSqKm * 0.3).toFixed(1)),
        speciesDiversityIndex: constraints.biodiversityTargetIndex || this.generateRandomScore(),
        carbonSequestrationTonsPerYear: Math.floor(totalAreaSqKm * 100) + 5000
      }],
      communityGardens: [{ count: Math.floor(totalAreaSqKm / 10) + 2, totalAreaSqM: Math.floor(Math.random() * 20000) + 5000, publicAccessPercent: 80 }],
      waterfrontAccessPercent: constraints.environmentalFocus === 'waterfront' ? 70 : 30,
      biodiversityIndex: constraints.biodiversityTargetIndex || this.generateRandomScore(),
      canopyCoverPercent: parseFloat(canopyCover.toFixed(1)),
      recreationalFacilityScore: this.generateRandomScore(0.7, 0.9),
    };
  }

  /**
   * Generates mock zoning data, heavily influenced by user zoning preferences.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {ZoningDetails} A mock ZoningDetails object.
   */
  private generateZoningBasedOnConstraints(constraints: DesignConstraints): ZoningDetails {
    const baseArea = (constraints.areaSqKm.min + constraints.areaSqKm.max) / 2;
    let residentialArea = baseArea * 0.45;
    let commercialArea = baseArea * 0.15;
    let industrialArea = baseArea * 0.10;
    let publicFacilitiesArea = baseArea * 0.08;
    let greenSpacesArea = baseArea * (constraints.greenSpaceTargetPercent / 100);
    let infrastructureArea = baseArea * 0.05;
    let remainingArea = baseArea - (residentialArea + commercialArea + industrialArea + publicFacilitiesArea + greenSpacesArea + infrastructureArea);

    if (remainingArea < 0) { // Adjust proportionally if sum exceeds total area
      const factor = baseArea / (residentialArea + commercialArea + industrialArea + publicFacilitiesArea + greenSpacesArea + infrastructureArea - remainingArea);
      residentialArea *= factor;
      commercialArea *= factor;
      industrialArea *= factor;
      publicFacilitiesArea *= factor;
      greenSpacesArea *= factor;
      infrastructureArea *= factor;
      remainingArea = 0;
    }

    const { residentialDensityPreference, commercialFocus, industrialPreference, mixedUseIntegrationLevel } = constraints.zoningPreferences;

    // Adjust residential splits based on preference
    let lowD = 0.3, mediumD = 0.4, highD = 0.2, mixedD = 0.1;
    if (residentialDensityPreference === 'low') { lowD = 0.5; mediumD = 0.3; highD = 0.1; mixedD = 0.1; }
    else if (residentialDensityPreference === 'high') { lowD = 0.1; mediumD = 0.3; highD = 0.5; mixedD = 0.1; }
    else if (residentialDensityPreference === 'mixed') { lowD = 0.2; mediumD = 0.3; highD = 0.2; mixedD = 0.3; }

    // Adjust commercial splits
    let retailF = 0.5, officeF = 0.3, mixedC = 0.2;
    if (commercialFocus === 'retail') { retailF = 0.7; officeF = 0.1; mixedC = 0.2; }
    else if (commercialFocus === 'office') { retailF = 0.1; officeF = 0.7; mixedC = 0.2; }
    else if (commercialFocus === 'innovation-hub') { retailF = 0.2; officeF = 0.4; mixedC = 0.4; }

    // Adjust industrial splits
    let lightI = 0.7, heavyI = 0.3;
    if (industrialPreference === 'none') industrialArea = 0;
    else if (industrialPreference === 'light') { lightI = 0.9; heavyI = 0.1; }
    else if (industrialPreference === 'heavy') { lightI = 0.3; heavyI = 0.7; }
    else if (industrialPreference === 'eco-industrial') { lightI = 0.8; heavyI = 0.2; } // Assume eco-industrial is primarily light

    const getHousingUnits = (area: number, densityType: string) => {
      if (densityType === 'low') return Math.floor(area * 50); // 50 units/sqkm
      if (densityType === 'medium') return Math.floor(area * 200); // 200 units/sqkm
      if (densityType === 'high') return Math.floor(area * 800); // 800 units/sqkm
      return Math.floor(area * 300); // mixed
    };

    return {
      residential: {
        lowDensity: { areaSqKm: parseFloat((residentialArea * lowD).toFixed(2)), housingUnits: getHousingUnits(residentialArea * lowD, 'low'), avgLotSizeSqM: 1000 },
        mediumDensity: { areaSqKm: parseFloat((residentialArea * mediumD).toFixed(2)), housingUnits: getHousingUnits(residentialArea * mediumD, 'medium'), avgStories: 4 },
        highDensity: { areaSqKm: parseFloat((residentialArea * highD).toFixed(2)), housingUnits: getHousingUnits(residentialArea * highD, 'high'), buildingFootprintRatio: 0.6 },
        mixedUseResidential: { areaSqKm: parseFloat((residentialArea * mixedD).toFixed(2)), commercialMixRatio: mixedUseIntegrationLevel === 'high' ? 0.4 : mixedUseIntegrationLevel === 'medium' ? 0.2 : 0.1 },
        totalResidentialAreaSqKm: parseFloat(residentialArea.toFixed(2)),
        avgHousingPriceIndex: constraints.housingAffordabilityTargetIndex ? parseFloat((1 / constraints.housingAffordabilityTargetIndex * 0.8).toFixed(2)) : 5.0,
      },
      commercial: {
        retail: { areaSqKm: parseFloat((commercialArea * retailF).toFixed(2)), storefrontCount: Math.floor(commercialArea * retailF * 10), vacancyRatePercent: parseFloat((Math.random() * 5 + 5).toFixed(1)) },
        office: { areaSqKm: parseFloat((commercialArea * officeF).toFixed(2)), totalFloorSpaceSqM: Math.floor(commercialArea * officeF * 100000), occupancyRatePercent: parseFloat((Math.random() * 10 + 70).toFixed(1)) },
        mixedUseCommercial: { areaSqKm: parseFloat((commercialArea * mixedC).toFixed(2)), residentialMixRatio: mixedUseIntegrationLevel === 'high' ? 0.3 : mixedUseIntegrationLevel === 'medium' ? 0.1 : 0.05 },
        totalCommercialAreaSqKm: parseFloat(commercialArea.toFixed(2)),
        economicActivityIndex: this.generateRandomScore(0.7, 0.95),
      },
      industrial: {
        light: { areaSqKm: parseFloat((industrialArea * lightI).toFixed(2)), businessCount: Math.floor(industrialArea * lightI * 20), employmentImpactFactor: this.generateRandomScore(0.7, 0.9) },
        heavy: { areaSqKm: parseFloat((industrialArea * heavyI).toFixed(2)), environmentalComplianceScore: industrialPreference === 'eco-industrial' ? this.generateRandomScore(0.9, 0.99) : this.generateRandomScore(0.7, 0.85) },
        logisticsHubs: { areaSqKm: parseFloat((industrialArea * 0.1).toFixed(2)), cargoVolumeTEU: Math.floor(Math.random() * 100000) + 10000 },
        totalIndustrialAreaSqKm: parseFloat(industrialArea.toFixed(2)),
      },
      publicFacilities: {
        schools: { count: Math.floor(publicFacilitiesArea * 2) + 5, studentCapacity: Math.floor(constraints.populationTarget.max * 0.15), avgClassSize: 25, primarySecondaryRatio: 0.6 },
        hospitals: { count: Math.floor(publicFacilitiesArea * 0.5) + 1, bedCapacity: Math.floor(constraints.populationTarget.max / 1000 * 2.5), specialistAvailabilityIndex: constraints.socioEconomicGoals.healthcareAccessImprovementPercent ? this.generateRandomScore(0.8, 0.95) : this.generateRandomScore(0.7, 0.8) },
        cultural: { count: Math.floor(publicFacilitiesArea * 1.5) + 3, museumGalleries: Math.floor(publicFacilitiesArea * 0.8) + 2, theatersConcertHalls: Math.floor(publicFacilitiesArea * 0.4) + 1, attendanceRate: constraints.socioEconomicGoals.culturalPreservationEmphasis === 'high' ? 0.8 : 0.6 },
        governmental: { areaSqKm: parseFloat((publicFacilitiesArea * 0.2).toFixed(2)), administrativeEfficiencyScore: this.generateRandomScore(0.7, 0.9) },
        totalPublicFacilityAreaSqKm: parseFloat(publicFacilitiesArea.toFixed(2)),
      },
      greenSpaces: { areaSqKm: parseFloat(greenSpacesArea.toFixed(2)) },
      infrastructureCorridors: { areaSqKm: parseFloat(infrastructureArea.toFixed(2)), utilityLineDensity: parseFloat((Math.random() * 5 + 10).toFixed(1)) },
      specialZones: [],
      urbanGrowthBoundaryKm: parseFloat((Math.sqrt(baseArea / Math.PI) * 2).toFixed(1)), // Mock radial boundary
      developmentPermitIssuanceRate: Math.floor(Math.random() * 20) + 80,
    };
  }

  /**
   * Generates mock population data based on constraints.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {PopulationProfile} A mock PopulationProfile object.
   */
  private generatePopulationBasedOnConstraints(constraints: DesignConstraints): PopulationProfile {
    const totalPopulation = Math.floor(Math.random() * (constraints.populationTarget.max - constraints.populationTarget.min)) + constraints.populationTarget.min;
    const avgArea = (constraints.areaSqKm.min + constraints.areaSqKm.max) / 2;
    const density = totalPopulation / avgArea;

    return {
      total: totalPopulation,
      densityPerSqKm: parseFloat(density.toFixed(2)),
      ageDistribution: { '0-14': 0.22, '15-64': 0.63, '65+': 0.15, medianAge: 38.5 },
      incomeDistribution: { low: 0.28, medium: 0.55, high: 0.17, giniCoefficient: 0.35 },
      growthRatePercent: constraints.populationTarget.targetGrowthRatePercent || parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)),
      migrationRatePer1000: parseFloat((Math.random() * 5 - 2).toFixed(1)), // -2 to 3
      ethnicDiversityIndex: this.generateRandomScore(0.5, 0.9),
      educationLevelDistribution: { primary: 0.15, secondary: 0.45, higher: 0.40, literacyRatePercent: 98.2 },
      householdSizeAvg: parseFloat((Math.random() * 0.5 + 2.5).toFixed(1)),
    };
  }

  /**
   * Generates mock environmental impact data, considering various targets.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {EnvironmentalImpactReport} A mock EnvironmentalImpactReport object.
   */
  private generateEnvironmentalImpactBasedOnConstraints(constraints: DesignConstraints): EnvironmentalImpactReport {
    const carbonFootprint = parseFloat((Math.random() * 8 + 4).toFixed(2)) * (1 - constraints.carbonReductionTargetPercent / 100);
    const wasteRecycling = Math.min(90, 40 + (constraints.carbonReductionTargetPercent / 2));
    const renewableShare = Math.min(80, 30 + (constraints.carbonReductionTargetPercent * 0.8));
    return {
      carbonFootprintPerCapitaTonsCO2e: parseFloat(carbonFootprint.toFixed(2)),
      totalCarbonEmissionsTonsCO2ePerYear: parseFloat((carbonFootprint * ((constraints.populationTarget.min + constraints.populationTarget.max) / 2)).toFixed(0)),
      airQualityIndexAQI: Math.floor(Math.random() * 50) + 20,
      waterQualityIndexWQI: Math.floor(Math.random() * 20) + 80, // Higher is better
      wasteRecyclingRatePercent: parseFloat(wasteRecycling.toFixed(1)),
      renewableEnergySharePercent: parseFloat(renewableShare.toFixed(1)),
      energyEfficiencyIndex: this.generateRandomScore(0.75, 0.95),
      floodRiskAssessment: constraints.climateResilienceStrategies.includes('drainage improvements') || constraints.climateResilienceStrategies.includes('sea wall') ? 'low' : ['low', 'medium', 'high', 'very-high'][Math.floor(Math.random() * 4)] as any,
      heatIslandEffectReductionPercent: Math.min(30, 10 + (constraints.greenSpaceTargetPercent * 0.5)),
      greenBuildingCertificationRate: Math.min(60, 15 + (constraints.carbonReductionTargetPercent * 0.7)),
      noisePollutionLevelAvgDB: Math.max(45, 65 - (constraints.noiseReductionTargetDB || 0)),
    };
  }

  /**
   * Generates mock socio-economic indicators, strongly tied to social and economic goals.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {SocioEconomicIndicators} A mock SocioEconomicIndicators object.
   */
  private generateSocioEconomicBasedOnConstraints(constraints: DesignConstraints): SocioEconomicIndicators {
    const { employmentGrowthPercent, educationQualityImprovementPercent, healthcareAccessImprovementPercent, culturalPreservationEmphasis, socialEquityTargetIndex } = constraints.socioEconomicGoals;

    return {
      employmentRatePercent: parseFloat((Math.random() * 3 + 92).toFixed(2)), // Base 92-95%
      unemploymentRatePercent: parseFloat((Math.random() * 3 + 4).toFixed(2)), // Base 4-7%
      housingAffordabilityIndex: constraints.housingAffordabilityTargetIndex || this.generateRandomScore(0.5, 0.8),
      homelessnessRatePer1000: parseFloat((Math.random() * 5 + 1).toFixed(1)),
      educationAccessIndex: this.generateRandomScore(0.7, 0.9) + (educationQualityImprovementPercent / 1000),
      healthcareAccessIndex: this.generateRandomScore(0.7, 0.9) + (healthcareAccessImprovementPercent / 1000),
      culturalVibrancyIndex: this.generateRandomScore(0.6, 0.9) + (culturalPreservationEmphasis === 'high' ? 0.1 : 0),
      crimeRatePer1000: parseFloat((Math.random() * 10 + 20).toFixed(2)),
      socialEquityIndex: socialEquityTargetIndex || this.generateRandomScore(0.6, 0.9),
      publicSafetyScore: this.generateRandomScore(0.7, 0.95),
      povertyRatePercent: parseFloat((Math.random() * 5 + 8).toFixed(1)),
      digitalInclusionIndex: this.generateRandomScore(0.7, 0.9) + (constraints.smartCityFeaturePriorities.includes('public WiFi') ? 0.05 : 0),
    };
  }

  /**
   * Generates mock acoustic and sensory landscape data.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {AcousticSensoryLandscape} A mock AcousticSensoryLandscape object.
   */
  private generateAcousticSensoryBasedOnConstraints(constraints: DesignConstraints): AcousticSensoryLandscape {
    const quietZones = Math.min(30, 10 + (constraints.noiseReductionTargetDB || 0) * 2);
    return {
      noisePollutionZones: [{ type: 'traffic', areaSqKm: Math.floor(Math.random() * 10) + 5, dominantSources: ['heavy vehicles', 'commercial traffic'], avgDecibelLevel: 75 }],
      quietZonesAreaPercent: parseFloat(quietZones.toFixed(1)),
      visualCorridorsCount: Math.floor(Math.random() * 10) + 5,
      sensoryDiversityScore: this.generateRandomScore(0.6, 0.9),
      lightPollutionIndex: this.generateRandomScore(0.3, 0.7),
      urbanArtDensityPerSqKm: parseFloat((Math.random() * 0.5 + 0.1).toFixed(1)),
      walkabilityScore: this.generateRandomScore(0.7, 0.9),
    };
  }

  /**
   * Generates mock traffic flow data, influenced by public transport and carbon targets.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {TrafficFlowAnalysis} A mock TrafficFlowAnalysis object.
   */
  private generateTrafficFlowBasedOnConstraints(constraints: DesignConstraints): TrafficFlowAnalysis {
    const ptUsage = Math.min(60, 20 + (constraints.publicTransportCoverageTargetPercent * 0.4));
    const congestion = Math.max(0.2, 0.8 - (constraints.publicTransportCoverageTargetPercent / 100 * 0.3) - (constraints.smartCityFeaturePriorities.includes('smart traffic management') ? 0.1 : 0));
    return {
      peakHourCongestionIndex: parseFloat(congestion.toFixed(2)),
      publicTransportUsagePercent: parseFloat(ptUsage.toFixed(1)),
      cyclingPedestrianInfrastructureQuality: ptUsage > 40 ? 'excellent' : ptUsage > 20 ? 'high' : 'medium',
      commuteTimeAvgMinutes: Math.floor(Math.random() * 15) + 20,
      parkingAvailabilityIndex: this.generateRandomScore(0.5, 0.8),
      modalSplit: {
        car: parseFloat((100 - ptUsage - (ptUsage / 2) - 5 - 2).toFixed(1)), // Simplified
        publicTransport: parseFloat(ptUsage.toFixed(1)),
        cycling: parseFloat((ptUsage / 2).toFixed(1)),
        walking: 5,
        other: 2,
      },
      trafficAccidentRatePer100000: parseFloat((Math.random() * 10 + 15).toFixed(1)),
      electricVehicleChargingStationDensityPerKm: parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)),
    };
  }

  /**
   * Generates a complete mock CityPlan based on given constraints and project name.
   * Integrates all the sub-generation functions and calculates overall scores.
   * @param {DesignConstraints} constraints - The design constraints for the plan.
   * @param {string} projectName - The name of the associated project.
   * @param {string} currentPlanIdForRefinement - Optional. If refining, the ID of the plan being refined.
   * @returns {CityPlan} A comprehensive CityPlan object.
   */
  private generateMockPlan(constraints: DesignConstraints, projectName: string = "Generated Plan", currentPlanIdForRefinement?: string): CityPlan {
    const planId = currentPlanIdForRefinement ? `${currentPlanIdForRefinement}-R${new Date().getTime()}` : `USP-Plan-${this.nextPlanId++}`;
    const baseScore = this.generateRandomScore();
    const mapImageIndex = Math.floor(Math.random() * 5);
    const mapImages = [
      "https://images.unsplash.com/photo-1542345336-221c5b6b1078?q=80&w=2000",
      "https://images.unsplash.com/photo-1518005213695-dd71f30e61d8?q=80&w=2000",
      "https://images.unsplash.com/photo-1518832049454-e0546123ed4e?q=80&w=2000",
      "https://images.unsplash.com/photo-1534067980076-a4c0a5263657?q=80&w=2000",
      "https://images.unsplash.com/photo-1582239100185-3b95a896d85a?q=80&w=2000"
    ];

    const infrastructure = this.generateInfrastructureBasedOnConstraints(constraints);
    const greenSpace = this.generateGreenSpaceBasedOnConstraints(constraints);
    const zoning = this.generateZoningBasedOnConstraints(constraints);
    const population = this.generatePopulationBasedOnConstraints(constraints);
    const environmentalImpact = this.generateEnvironmentalImpactBasedOnConstraints(constraints);
    const socioEconomic = this.generateSocioEconomicBasedOnConstraints(constraints);
    const acousticSensory = this.generateAcousticSensoryBasedOnConstraints(constraints);
    const trafficFlow = this.generateTrafficFlowBasedOnConstraints(constraints);

    // Score calculations based on generated data and constraints
    let harmonyScore = (greenSpace.biodiversityIndex + acousticSensory.sensoryDiversityScore + socioEconomic.culturalVibrancyIndex) / 3;
    let efficiencyScore = (infrastructure.smartCityInfrastructureIndex + environmentalImpact.energyEfficiencyIndex + trafficFlow.peakHourCongestionIndex) / 3;
    let livabilityScore = (socioEconomic.housingAffordabilityIndex + socioEconomic.educationAccessIndex + socioEconomic.healthcareAccessIndex + acousticSensory.walkabilityScore) / 4;
    let sustainabilityScore = (environmentalImpact.renewableEnergySharePercent / 100 + environmentalImpact.wasteRecyclingRatePercent / 100 + greenSpace.biodiversityIndex) / 3;
    let resilienceScore = (1 - environmentalImpact.floodRiskAssessment.length / 10) + (greenSpace.canopyCoverPercent / 100 * 0.5); // Simplified
    let innovationScore = (infrastructure.digitalConnectivity['5GDeploymentPercent'] / 100 + infrastructure.digitalConnectivity.IoTDeviceDensityPerSqKm / 100);

    harmonyScore = parseFloat(Math.min(0.99, harmonyScore + Math.random() * 0.1 - 0.05).toFixed(2));
    efficiencyScore = parseFloat(Math.min(0.99, efficiencyScore + Math.random() * 0.1 - 0.05).toFixed(2));
    livabilityScore = parseFloat(Math.min(0.99, livabilityScore + Math.random() * 0.1 - 0.05).toFixed(2));
    sustainabilityScore = parseFloat(Math.min(0.99, sustainabilityScore + Math.random() * 0.1 - 0.05).toFixed(2));
    resilienceScore = parseFloat(Math.min(0.99, resilienceScore + Math.random() * 0.1 - 0.05).toFixed(2));
    innovationScore = parseFloat(Math.min(0.99, innovationScore + Math.random() * 0.1 - 0.05).toFixed(2));

    const keyRecommendations: string[] = [];
    const warnings: string[] = [];

    if (harmonyScore < 0.75) keyRecommendations.push("Enhance public art installations and cultural event programming.");
    if (efficiencyScore < 0.7) warnings.push("Potential for traffic congestion or resource management inefficiencies detected.");
    if (livabilityScore < 0.8) keyRecommendations.push("Invest in affordable housing programs and improve access to green spaces.");
    if (environmentalImpact.carbonFootprintPerCapitaTonsCO2e > 7) warnings.push("High carbon footprint identified. Prioritize renewable energy and public transport.");
    if (trafficFlow.peakHourCongestionIndex > 0.6) keyRecommendations.push("Implement intelligent traffic light systems and promote off-peak travel.");

    return {
      planId,
      name: `${projectName} - ${planId}`,
      description: `A highly detailed city plan generated by the Urban Symphony AI, meticulously balancing sustainability, livability, and efficiency. Based on project constraints and comprehensive urban data models.`,
      timestamp: new Date().toISOString(),
      version: currentPlanIdForRefinement ? (this.plans[currentPlanIdForRefinement]?.version || 0) + 1 : 1,
      mapImageUrl: mapImages[mapImageIndex],
      harmonyScore,
      efficiencyScore,
      livabilityScore,
      overallSustainabilityScore: sustainabilityScore,
      resilienceScore,
      innovationScore,
      infrastructure,
      greenSpace,
      zoning,
      population,
      environmentalImpact,
      socioEconomic,
      acousticSensory,
      trafficFlow,
      dataLayers: {
        residentialDensityMap: "https://via.placeholder.com/1200x800/FF5733/FFFFFF?text=Residential+Density+Map",
        transportNetworkMap: "https://via.placeholder.com/1200x800/33FF57/FFFFFF?text=Transport+Network+Map",
        greenSpaceOverlayMap: "https://via.placeholder.com/1200x800/3357FF/FFFFFF?text=Green+Space+Overlay",
        noiseMap: "https://via.placeholder.com/1200x800/FF33CC/FFFFFF?text=Noise+Map",
        socialInfrastructureMap: "https://via.placeholder.com/1200x800/33CCFF/FFFFFF?text=Social+Infrastructure+Map",
        economicZonesMap: "https://via.placeholder.com/1200x800/FFCC33/FFFFFF?text=Economic+Zones+Map",
        environmentalQualityMap: "https://via.placeholder.com/1200x800/66FF66/FFFFFF?text=Environmental+Quality+Map",
        publicSafetyMap: "https://via.placeholder.com/1200x800/CC3333/FFFFFF?text=Public+Safety+Map",
        urbanHeatIslandMap: "https://via.placeholder.com/1200x800/FF9933/FFFFFF?text=Urban+Heat+Island+Map",
      },
      keyRecommendations,
      warnings,
      budgetEstimateMillionsUSD: constraints.budgetCapMillionsUSD || Math.floor(Math.random() * 10000) + 2000,
      implementationPhases: [
        {
          phaseName: 'Phase 1: Strategic Planning & Governance Setup',
          durationMonths: 12, budgetMillionsUSD: 500, status: 'completed',
          milestones: [{ name: 'Master Plan Finalized', targetDate: '2024-12-31', completionPercent: 100, dependencies: [] }]
        },
        {
          phaseName: 'Phase 2: Core Infrastructure Development',
          durationMonths: 36, budgetMillionsUSD: 3000, status: 'in-progress',
          milestones: [{ name: 'New Metro Line 1 Construction', targetDate: '2026-06-30', completionPercent: 45, dependencies: [] }]
        },
        {
          phaseName: 'Phase 3: Community & Environmental Enhancement',
          durationMonths: 24, budgetMillionsUSD: 1000, status: 'planned',
          milestones: [{ name: 'Central Park Expansion Design', targetDate: '2025-03-31', completionPercent: 0, dependencies: ['Master Plan Finalized'] }]
        },
        {
          phaseName: 'Phase 4: Smart City Integration & Digital Transformation',
          durationMonths: 18, budgetMillionsUSD: 750, status: 'planned',
          milestones: [{ name: 'IoT Sensor Network Deployment Plan', targetDate: '2025-09-30', completionPercent: 0, dependencies: ['Master Plan Finalized'] }]
        }
      ],
      riskAssessment: [
        { type: 'environmental', severity: 'medium', description: 'Increased flood risk due to climate change.', mitigationStrategy: 'Develop robust green infrastructure and enhanced drainage systems.' },
        { type: 'financial', severity: 'low', description: 'Potential for budget overruns in phase 2.', mitigationStrategy: 'Implement strict financial oversight and staged funding releases.' }
      ],
      stakeholderFeedbackSummary: {
        positive: ['Strong focus on green spaces.', 'Improved public transport proposed.'],
        negative: ['Concerns about housing affordability in high-density zones.', 'Request for more community engagement platforms.'],
        actionItems: ['Review affordable housing incentives.', 'Launch new online public feedback portal.']
      }
    };
  }

  // --- API Methods (Asynchronous operations with mock delays) ---

  /**
   * Retrieves all projects from the mock database.
   * @returns {Promise<ProjectMetadata[]>} A promise that resolves to an array of projects.
   */
  public async getProjects(): Promise<ProjectMetadata[]> {
    return new Promise(res => setTimeout(() => res([...this.projects.filter(p => p.status === 'active')]), 500));
  }

  /**
   * Retrieves a single project by its ID.
   * @param {string} projectId - The ID of the project to retrieve.
   * @returns {Promise<ProjectMetadata | undefined>} A promise that resolves to the project or undefined if not found.
   */
  public async getProjectById(projectId: string): Promise<ProjectMetadata | undefined> {
    return new Promise(res => setTimeout(() => res(this.projects.find(p => p.id === projectId)), 300));
  }

  /**
   * Creates a new project with initial constraints and associates it with a user.
   * @param {string} name - The name of the new project.
   * @param {DesignConstraints} initialConstraints - The initial design constraints for the project.
   * @param {string} userId - The ID of the user creating the project.
   * @returns {Promise<ProjectMetadata>} A promise that resolves to the newly created project.
   */
  public async createProject(name: string, initialConstraints: DesignConstraints, userId: string): Promise<ProjectMetadata> {
    return new Promise(res => {
      setTimeout(() => {
        const newProject: ProjectMetadata = {
          id: `PROJ-${this.nextProjectId++}`,
          name,
          description: `Project for '${name}' initiated by ${this.users[userId]?.username || 'Unknown User'}.`,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          currentPlanId: null,
          planHistory: [],
          collaborators: [{ userId: userId, role: 'admin' }],
          status: 'active',
          tags: ['new-project', 'urban-planning']
        };
        this.projects.push(newProject);

        // Generate an initial plan for the new project
        this.generateCityPlan(newProject.id, initialConstraints, newProject.name, userId).then(initialPlan => {
          newProject.currentPlanId = initialPlan.planId;
          newProject.planHistory.push({ planId: initialPlan.planId, timestamp: initialPlan.timestamp, notes: 'Initial plan generation', constraintsUsed: initialConstraints });
          res({ ...newProject });
        });
      }, 1500);
    });
  }

  /**
   * Updates an existing project with new metadata.
   * @param {string} projectId - The ID of the project to update.
   * @param {Partial<ProjectMetadata>} updates - The partial object containing fields to update.
   * @returns {Promise<ProjectMetadata | undefined>} A promise that resolves to the updated project or undefined.
   */
  public async updateProject(projectId: string, updates: Partial<ProjectMetadata>): Promise<ProjectMetadata | undefined> {
    return new Promise(res => {
      setTimeout(() => {
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
          this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...updates,
            lastModified: new Date().toISOString(),
          };
          res({ ...this.projects[projectIndex] });
        } else {
          res(undefined);
        }
      }, 700);
    });
  }

  /**
   * Deletes a project by its ID, including all associated plans.
   * @param {string} projectId - The ID of the project to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if deleted, false otherwise.
   */
  public async deleteProject(projectId: string): Promise<boolean> {
    return new Promise(res => {
      setTimeout(() => {
        const initialLength = this.projects.length;
        this.projects = this.projects.filter(p => p.id !== projectId);
        Object.keys(this.plans).forEach(planId => {
          if (planId.startsWith(projectId)) { // Naive way to link plans, in real app, projects would hold plan IDs.
            delete this.plans[planId];
          }
        });
        res(this.projects.length < initialLength);
      }, 1000);
    });
  }

  /**
   * Generates a new city plan based on provided constraints for a specific project.
   * Simulates a complex AI generation process.
   * @param {string} projectId - The ID of the project.
   * @param {DesignConstraints} constraints - The design constraints for the new plan.
   * @param {string} planName - The name for the new plan.
   * @param {string} userId - The ID of the user requesting the plan.
   * @returns {Promise<CityPlan>} A promise that resolves to the newly generated CityPlan.
   */
  public async generateCityPlan(projectId: string, constraints: DesignConstraints, planName?: string, userId?: string): Promise<CityPlan> {
    return new Promise(res => setTimeout(() => {
      const project = this.projects.find(p => p.id === projectId);
      if (!project) throw new Error("Project not found for plan generation.");

      console.log(`Simulating advanced AI urban planning for project ${projectId} with constraints:`, constraints);
      const newPlan = this.generateMockPlan(constraints, planName || project.name);

      project.planHistory.push({ planId: newPlan.planId, timestamp: newPlan.timestamp, notes: `Plan generated (v${newPlan.version}) by ${userId || 'System'}`, constraintsUsed: constraints });
      project.currentPlanId = newPlan.planId;
      project.lastModified = new Date().toISOString();

      this.plans[newPlan.planId] = newPlan;
      res(newPlan);
    }, 7000)); // Simulate a longer AI generation process
  }

  /**
   * Retrieves a city plan by its ID.
   * @param {string} planId - The ID of the plan to retrieve.
   * @returns {Promise<CityPlan | undefined>} A promise that resolves to the CityPlan or undefined.
   */
  public async getCityPlanById(planId: string): Promise<CityPlan | undefined> {
    return new Promise(res => setTimeout(() => res(this.plans[planId]), 1000));
  }

  /**
   * Retrieves the history of plans for a given project.
   * @param {string} projectId - The ID of the project.
   * @returns {Promise<{ planId: string; timestamp: string; notes: string; constraintsUsed: DesignConstraints }[]>} A promise resolving to the plan history.
   */
  public async getPlanHistory(projectId: string): Promise<{ planId: string; timestamp: string; notes: string; constraintsUsed: DesignConstraints }[]> {
    return new Promise(res => {
      setTimeout(() => {
        const project = this.projects.find(p => p.id === projectId);
        res(project ? [...project.planHistory] : []);
      }, 500);
    });
  }

  /**
   * Refines an existing city plan based on new modifications to constraints.
   * This creates a new version of the plan.
   * @param {string} planId - The ID of the plan to refine.
   * @param {DesignConstraints} modifications - The modified constraints.
   * @param {string} userId - The ID of the user refining the plan.
   * @returns {Promise<CityPlan>} A promise resolving to the refined CityPlan.
   */
  public async refineCityPlan(planId: string, modifications: DesignConstraints, userId: string): Promise<CityPlan> {
    return new Promise(res => setTimeout(() => {
      const existingPlan = this.plans[planId];
      if (!existingPlan) throw new Error("Plan not found for refinement.");

      console.log(`Refining plan ${planId} with modifications:`, modifications);
      const refinedPlan = this.generateMockPlan(modifications, existingPlan.name, existingPlan.planId);
      refinedPlan.name = `${existingPlan.name} (Refined v${refinedPlan.version})`;
      refinedPlan.description = `Refined from version ${existingPlan.version} based on updated constraints. ${modifications ? `Specific adjustments include: ${JSON.stringify(modifications)}` : ''}`;
      // In a real scenario, refinement would involve more subtle, targeted changes rather than full re-generation.
      // For mock purposes, generating a new plan with some values potentially closer to the new constraints,
      // and ensuring versioning and score improvement is sufficient.

      this.plans[refinedPlan.planId] = refinedPlan;

      // Update the project's plan history
      const project = this.projects.find(p => p.currentPlanId === planId || p.planHistory.some(h => h.planId === planId));
      if (project) {
        project.planHistory.push({ planId: refinedPlan.planId, timestamp: refinedPlan.timestamp, notes: `Plan refined from v${existingPlan.version} to v${refinedPlan.version} by ${userId || 'System'}`, constraintsUsed: modifications });
        project.currentPlanId = refinedPlan.planId;
        project.lastModified = new Date().toISOString();
      }

      res(refinedPlan);
    }, 10000)); // Simulate an even longer refinement process
  }

  /**
   * Retrieves user profile by ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<UserProfile | undefined>} A promise resolving to the user profile.
   */
  public async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return new Promise(res => setTimeout(() => res(this.users[userId]), 300));
  }

  /**
   * Updates user profile.
   * @param {string} userId - The ID of the user.
   * @param {Partial<UserProfile>} updates - The updates to apply.
   * @returns {Promise<UserProfile | undefined>} A promise resolving to the updated user profile.
   */
  public async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    return new Promise(res => setTimeout(() => {
      if (this.users[userId]) {
        this.users[userId] = { ...this.users[userId], ...updates, lastLogin: new Date().toISOString() };
        res({ ...this.users[userId] });
      } else {
        res(undefined);
      }
    }, 500));
  }

  /**
   * Simulates a comprehensive simulation for a given plan.
   * @param {string} planId - The ID of the plan to simulate.
   * @param {'traffic' | 'environmental' | 'economic' | 'social' | 'resilience'} type - The type of simulation.
   * @param {object} parameters - Additional simulation parameters.
   * @returns {Promise<any>} A promise resolving to mock simulation results.
   */
  public async runComprehensiveSimulation(planId: string, type: 'traffic' | 'environmental' | 'economic' | 'social' | 'resilience', parameters: object): Promise<any> {
    return new Promise(res => setTimeout(() => {
      const plan = this.plans[planId];
      if (!plan) throw new Error("Plan not found for simulation.");

      let results: any = {
        simulationId: `SIM-${planId}-${type}-${new Date().getTime()}`,
        timestamp: new Date().toISOString(),
        planVersion: plan.version,
        simulatedType: type,
        inputParameters: parameters,
        status: 'completed',
        details: {},
        warnings: [],
        recommendations: []
      };

      // Elaborate mock results based on simulation type
      switch (type) {
        case 'traffic':
          results.details = {
            peakHourCongestionReduction: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)),
            publicTransportRidershipIncrease: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)),
            newCommuteTimeAvg: parseFloat((plan.trafficFlow.commuteTimeAvgMinutes * (1 - (Math.random() * 0.1 + 0.05))).toFixed(1)),
            bottleneckAreasImproved: ['Central Interchange', 'Downtown Core Entrance'],
            modalShiftTowardsPT: parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)),
            emissionsReductionFromTraffic: parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)),
            trafficFlowEfficiencyIndex: parseFloat((plan.trafficFlow.peakHourCongestionIndex * 1.2).toFixed(2)),
            accidentRateReduction: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)),
          };
          if (results.details.peakHourCongestionReduction < 0.15) results.warnings.push("Modest congestion reduction, consider further transport optimizations.");
          results.recommendations.push("Implement demand-responsive public transport services.");
          break;
        case 'environmental':
          results.details = {
            airQualityImprovementIndex: parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)),
            biodiversityIndexIncrease: parseFloat((Math.random() * 0.1 + 0.02).toFixed(2)),
            waterRunoffReductionVolume: parseFloat((Math.random() * 0.2 + 0.1).toFixed(2)),
            potentialGreenRoofEnergySavingsGWhPerYear: parseFloat((Math.random() * 5) + 1).toFixed(1),
            urbanHeatIslandEffectMitigation: parseFloat((Math.random() * 0.2 + 0.08).toFixed(2)),
            carbonSequestrationIncreaseTonsCO2e: parseFloat((Math.random() * 50000 + 10000).toFixed(0)),
            waterTableRechargeRateIncrease: parseFloat((Math.random() * 0.1 + 0.03).toFixed(2)),
            renewableEnergyCapacityAdditionMW: parseFloat((Math.random() * 50 + 20).toFixed(0)),
          };
          if (results.details.airQualityImprovementIndex < 0.08) results.warnings.push("Air quality improvement is minimal, consider industrial emissions control.");
          results.recommendations.push("Expand urban green infrastructure for enhanced ecosystem services.");
          break;
        case 'economic':
          results.details = {
            gdpGrowthProjectionPercent: parseFloat((Math.random() * 0.03 + 0.01).toFixed(2)),
            jobCreationEstimate: Math.floor(Math.random() * 50000) + 10000,
            propertyValueIncreasePercent: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)),
            tourismRevenueIncreasePercent: parseFloat((Math.random() * 0.1 + 0.03).toFixed(2)),
            newBusinessFormationRateIncrease: parseFloat((Math.random() * 0.05 + 0.02).toFixed(2)),
            averageHouseholdIncomeGrowthPercent: parseFloat((Math.random() * 0.04 + 0.01).toFixed(2)),
            municipalTaxRevenueIncreaseMillionsUSD: parseFloat((Math.random() * 500 + 100).toFixed(0)),
            costOfLivingChangePercent: parseFloat((Math.random() * 0.02 - 0.01).toFixed(2)), // -1% to +1%
          };
          if (results.details.costOfLivingChangePercent > 0.01) results.warnings.push("Potential for increased cost of living, monitor housing and consumer prices.");
          results.recommendations.push("Implement incentives for small and medium enterprises (SMEs) and local startups.");
          break;
        case 'social':
          results.details = {
            socialCohesionIndexIncrease: parseFloat((Math.random() * 0.1 + 0.03).toFixed(2)),
            accessToPublicServicesImprovement: parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)),
            communityEngagementIncrease: parseFloat((Math.random() * 0.2 + 0.08).toFixed(2)),
            vulnerablePopulationImpact: 'Positive, with targeted support programs and improved social infrastructure access.',
            crimeRateReductionPercent: parseFloat((Math.random() * 0.1 + 0.02).toFixed(2)),
            educationEnrollmentIncreasePercent: parseFloat((Math.random() * 0.05 + 0.01).toFixed(2)),
            healthcareServiceUptakeIncreasePercent: parseFloat((Math.random() * 0.08 + 0.02).toFixed(2)),
            culturalParticipationRateIncreasePercent: parseFloat((Math.random() * 0.12 + 0.04).toFixed(2)),
          };
          if (results.details.communityEngagementIncrease < 0.1) results.warnings.push("Community engagement initiatives require more robust planning.");
          results.recommendations.push("Establish new community centers and organize regular cultural events.");
          break;
        case 'resilience':
          results.details = {
            disasterRecoveryTimeReductionHours: Math.floor(Math.random() * 240) + 24, // 10 days down to 1 day
            criticalInfrastructureHardeningScore: parseFloat((Math.random() * 0.2 + 0.7).toFixed(2)),
            earlyWarningSystemEffectivenessImprovement: parseFloat((Math.random() * 0.2 + 0.7).toFixed(2)),
            publicAwarenessPreparednessIncreasePercent: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)),
            climateAdaptationIndexImprovement: parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)),
            supplyChainDisruptionResistanceScore: parseFloat((Math.random() * 0.2 + 0.7).toFixed(2)),
            cybersecurityResilienceRating: 'Good',
          };
          if (results.details.disasterRecoveryTimeReductionHours > 72) results.warnings.push("Recovery time still high, enhance emergency response plans.");
          results.recommendations.push("Develop decentralized energy and water systems for critical facilities.");
          break;
      }
      res(results);
    }, 5000)); // Simulate a long simulation process
  }
}

/** Global instance of the mock API service. */
export const urbanSymphonyApi = UrbanSymphonyApiService.getInstance();

// --- Context for Global State Management: Centralized state for the entire application ---

/**
 * Defines the shape of the application's global state, accessible via context.
 * Includes user profile, current project, active plan, and global loading status.
 */
interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentProject: ProjectMetadata | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<ProjectMetadata | null>>;
  activePlan: CityPlan | null;
  setActivePlan: React.Dispatch<React.SetStateAction<CityPlan | null>>;
  isLoadingGlobal: boolean;
  setIsLoadingGlobal: React.Dispatch<React.SetStateAction<boolean>>;
}

/** React Context for managing global application state. */
export const UrbanSymphonyContext = createContext<AppContextType | undefined>(undefined);

/**
 * Custom hook to easily access the Urban Symphony application context.
 * Throws an error if used outside of `UrbanSymphonyProvider`.
 * @returns {AppContextType} The application context.
 */
export const useUrbanSymphony = () => {
  const context = useContext(UrbanSymphonyContext);
  if (!context) {
    throw new Error('useUrbanSymphony must be used within an UrbanSymphonyProvider');
  }
  return context;
};

/**
 * Provides the global state to its children components using React Context.
 * Initializes the default user, and attempts to load an initial project/plan.
 */
export const UrbanSymphonyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    // Attempt to load from localStorage or use default
    try {
      const storedUser = localStorage.getItem('usp-currentUser');
      return storedUser ? JSON.parse(storedUser) : {
        userId: 'user-001', username: 'Jane Doe', email: 'jane.doe@city.gov', organization: 'City Planning Department',
        preferences: { defaultUnitSystem: 'metric', mapTheme: 'dark', notificationSettings: { email: true, inApp: true, sms: false }, dashboardLayout: 'expanded', dataPrivacyLevel: 'standard' },
        accessLevel: 'admin', lastLogin: new Date().toISOString()
      };
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return {
        userId: 'user-001', username: 'Jane Doe', email: 'jane.doe@city.gov', organization: 'City Planning Department',
        preferences: { defaultUnitSystem: 'metric', mapTheme: 'dark', notificationSettings: { email: true, inApp: true, sms: false }, dashboardLayout: 'expanded', dataPrivacyLevel: 'standard' },
        accessLevel: 'admin', lastLogin: new Date().toISOString()
      };
    }
  });
  const [currentProject, setCurrentProject] = useState<ProjectMetadata | null>(null);
  const [activePlan, setActivePlan] = useState<CityPlan | null>(null);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Effect to persist user settings to localStorage
  useEffect(() => {
    localStorage.setItem('usp-currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Effect to load initial project/plan data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingGlobal(true);
      try {
        const projects = await urbanSymphonyApi.getProjects();
        if (projects.length > 0) {
          const firstProject = projects[0];
          setCurrentProject(firstProject);
          if (firstProject.currentPlanId) {
            const plan = await urbanSymphonyApi.getCityPlanById(firstProject.currentPlanId);
            setActivePlan(plan || null);
          }
        }
      } catch (error) {
        console.error("Failed to load initial project data:", error);
        // Potentially show a user-friendly error message
      } finally {
        setIsLoadingGlobal(false);
      }
    };
    loadInitialData();
  }, []); // Run once on mount

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentUser, setCurrentUser,
    currentProject, setCurrentProject,
    activePlan, setActivePlan,
    isLoadingGlobal, setIsLoadingGlobal,
  }), [currentUser, currentProject, activePlan, isLoadingGlobal]);

  return (
    <UrbanSymphonyContext.Provider value={contextValue}>
      {children}
    </UrbanSymphonyContext.Provider>
  );
};

// --- Helper Components & Utilities: Reusable UI elements for consistency ---

/**
 * A generic loading spinner component with an optional message.
 * @param {object} props - The component props.
 * @param {string} [props.message="Loading..."] - The message to display alongside the spinner.
 * @returns {JSX.Element} The loading spinner JSX.
 */
export const ExportedLoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
    <p className="text-lg text-gray-400">{message}</p>
  </div>
);

/**
 * Displays a score with color coding based on its value.
 * @param {object} props - The component props.
 * @param {string} props.label - The label for the score (e.g., "Harmony Score").
 * @param {number} props.score - The numeric score (0-1).
 * @returns {JSX.Element} The score display JSX.
 */
export const ExportedScoreDisplay: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const scoreColor = score >= 0.9 ? 'text-green-400' : score >= 0.75 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="text-center p-3 bg-gray-700 rounded-md border border-gray-600 shadow-sm">
      <p className={`text-4xl font-bold ${scoreColor}`}>{score.toFixed(2)}</p>
      <p className="text-sm text-gray-400 mt-2 uppercase tracking-wide">{label}</p>
    </div>
  );
};

/**
 * A styled title for sections within the application.
 * @param {object} props - The component props.
 * @param {string} props.title - The title text.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The section title JSX.
 */
export const ExportedSectionTitle: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
  <h2 className={`text-2xl font-bold mb-4 text-cyan-400 border-b border-gray-700 pb-3 ${className}`}>{title}</h2>
);

/**
 * A card for displaying a single key metric.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the metric.
 * @param {string | number} props.value - The value of the metric.
 * @param {string} [props.unit] - The unit for the value (e.g., "km", "%").
 * @param {string} [props.description] - A brief description of the metric.
 * @returns {JSX.Element} The metric card JSX.
 */
export const ExportedMetricCard: React.FC<{ title: string; value: string | number; unit?: string; description?: string }> = ({ title, value, unit, description }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
    <h3 className="text-lg font-medium text-cyan-300 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-white">{value} {unit && <span className="text-base font-normal text-gray-400">{unit}</span>}</p>
    {description && <p className="text-sm text-gray-400 mt-2">{description}</p>}
  </div>
);

/**
 * A progress bar component with a label and percentage display.
 * @param {object} props - The component props.
 * @param {number} props.progress - The current progress as a percentage (0-100).
 * @param {string} props.label - The label for the progress bar.
 * @returns {JSX.Element} The progress bar JSX.
 */
export const ExportedProgressBar: React.FC<{ progress: number; label: string }> = ({ progress, label }) => {
  const barColor = progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const displayProgress = Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm text-gray-300">
        <span>{label}</span>
        <span>{displayProgress.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${displayProgress}%` }}></div>
      </div>
    </div>
  );
};

// --- Feature Components: Detailed and expanded modules for different planning aspects ---

/**
 * Component for managing projects: creating new projects, selecting existing ones,
 * and viewing/managing project history and details. Includes a comprehensive modal for new project creation.
 */
export const ExportedProjectSelector: React.FC = () => {
  const { currentProject, setCurrentProject, setIsLoadingGlobal, activePlan, setActivePlan, currentUser } = useUrbanSymphony();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectConstraints, setNewProjectConstraints] = useState<DesignConstraints>({
    populationTarget: { min: 750000, max: 1200000, targetGrowthRatePercent: 1.5 },
    areaSqKm: { min: 150, max: 250, preferredShape: 'compact' },
    greenSpaceTargetPercent: 35,
    publicTransportCoverageTargetPercent: 85,
    carbonReductionTargetPercent: 45,
    housingAffordabilityTargetIndex: 0.75,
    zoningPreferences: { residentialDensityPreference: 'mixed', commercialFocus: 'mixed', industrialPreference: 'light', mixedUseIntegrationLevel: 'high' },
    environmentalFocus: 'waterfront',
    socioEconomicGoals: { employmentGrowthPercent: 5, educationQualityImprovementPercent: 10, healthcareAccessImprovementPercent: 15, culturalPreservationEmphasis: 'high', socialEquityTargetIndex: 0.8 },
    budgetCapMillionsUSD: 8000,
    timelineMonths: 180,
    priorityAreas: [],
    noiseReductionTargetDB: 5,
    biodiversityTargetIndex: 0.8,
    waterEfficiencyTargetPercent: 20,
    smartCityFeaturePriorities: ['smart traffic management', 'public safety sensors', 'digital kiosks'],
    citizenParticipationMechanism: 'hybrid',
    climateResilienceStrategies: ['green infrastructure', 'early warning systems']
  });
  const [planHistory, setPlanHistory] = useState<{ planId: string; timestamp: string; notes: string }[]>([]);
  const [showPlanHistoryDetail, setShowPlanHistoryDetail] = useState<string | null>(null); // To show detailed constraints for a history entry

  /**
   * Fetches all available projects from the API and updates the state.
   * Also sets the global loading state during the operation.
   */
  const fetchProjects = useCallback(async () => {
    setIsLoadingGlobal(true);
    try {
      const fetchedProjects = await urbanSymphonyApi.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [setIsLoadingGlobal]);

  /**
   * Handles selecting a project, loading its details and its current plan.
   * Updates global project and active plan states.
   * @param {string} projectId - The ID of the project to select.
   */
  const handleSelectProject = useCallback(async (projectId: string) => {
    setIsLoadingGlobal(true);
    try {
      const project = await urbanSymphonyApi.getProjectById(projectId);
      if (project) {
        setCurrentProject(project);
        if (project.currentPlanId) {
          const plan = await urbanSymphonyApi.getCityPlanById(project.currentPlanId);
          setActivePlan(plan || null);
        } else {
          setActivePlan(null);
        }
        setPlanHistory(await urbanSymphonyApi.getPlanHistory(projectId));
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [setCurrentProject, setActivePlan, setIsLoadingGlobal]);

  /**
   * Handles the creation of a new project, including an initial plan generation.
   * Updates project list, sets the new project as current, and closes the modal.
   */
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsLoadingGlobal(true);
    try {
      const project = await urbanSymphonyApi.createProject(newProjectName, newProjectConstraints, currentUser.userId);
      setProjects(prev => [...prev, project]);
      setCurrentProject(project);
      if (project.currentPlanId) {
        const plan = await urbanSymphonyApi.getCityPlanById(project.currentPlanId);
        setActivePlan(plan || null);
      }
      setPlanHistory(await urbanSymphonyApi.getPlanHistory(project.id));
      setNewProjectName('');
      setNewProjectDescription('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Error creating project. Check console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  /**
   * Handles deleting a project after confirmation.
   * Removes it from the list and clears active project/plan if it was the current one.
   * @param {string} projectId - The ID of the project to delete.
   */
  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project and all its plans? This action cannot be undone.")) {
      setIsLoadingGlobal(true);
      try {
        const success = await urbanSymphonyApi.deleteProject(projectId);
        if (success) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          if (currentProject?.id === projectId) {
            setCurrentProject(null);
            setActivePlan(null);
            setPlanHistory([]);
          }
          alert("Project deleted successfully.");
        } else {
          alert("Failed to delete project.");
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Error deleting project. Check console for details.");
      } finally {
        setIsLoadingGlobal(false);
      }
    }
  }, [currentProject, setCurrentProject, setActivePlan, setIsLoadingGlobal]);

  /**
   * Handles updating a project's name.
   * @param {string} projectId - The ID of the project to update.
   * @param {string} newName - The new name for the project.
   */
  const handleUpdateProjectName = useCallback(async (projectId: string, newName: string) => {
    if (!newName.trim()) return;
    setIsLoadingGlobal(true);
    try {
      const updatedProject = await urbanSymphonyApi.updateProject(projectId, { name: newName });
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
        if (currentProject?.id === projectId) {
          setCurrentProject(updatedProject);
        }
        alert("Project name updated.");
      }
    } catch (error) {
      console.error("Failed to update project name:", error);
      alert("Error updating project name. Check console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [currentProject, setCurrentProject, setIsLoadingGlobal]);

  // Initial fetch of projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch plan history when current project changes
  useEffect(() => {
    if (currentProject) {
      urbanSymphonyApi.getPlanHistory(currentProject.id)
        .then(history => setPlanHistory(history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))) // Sort by newest
        .catch(console.error);
    } else {
      setPlanHistory([]);
    }
  }, [currentProject]);

  // Helper to render constraint details for modal/history
  const renderConstraintDetails = (constraints: DesignConstraints) => (
    <div className="text-sm text-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto custom-scrollbar">
      <p><span className="font-semibold text-cyan-200">Population:</span> {constraints.populationTarget.min.toLocaleString()} - {constraints.populationTarget.max.toLocaleString()}</p>
      <p><span className="font-semibold text-cyan-200">Area:</span> {constraints.areaSqKm.min} - {constraints.areaSqKm.max} SqKm</p>
      <p><span className="font-semibold text-cyan-200">Green Space:</span> {constraints.greenSpaceTargetPercent}%</p>
      <p><span className="font-semibold text-cyan-200">PT Coverage:</span> {constraints.publicTransportCoverageTargetPercent}%</p>
      <p><span className="font-semibold text-cyan-200">Carbon Reduction:</span> {constraints.carbonReductionTargetPercent}%</p>
      <p><span className="font-semibold text-cyan-200">Affordability:</span> {constraints.housingAffordabilityTargetIndex.toFixed(2)}</p>
      <p><span className="font-semibold text-cyan-200">Res. Density:</span> {constraints.zoningPreferences.residentialDensityPreference}</p>
      <p><span className="font-semibold text-cyan-200">Env. Focus:</span> {constraints.environmentalFocus}</p>
      <p><span className="font-semibold text-cyan-200">Budget Cap:</span> ${constraints.budgetCapMillionsUSD.toLocaleString()}M</p>
      <p><span className="font-semibold text-cyan-200">Timeline:</span> {constraints.timelineMonths} months</p>
      <p className="col-span-full"><span className="font-semibold text-cyan-200">Goals:</span> {constraints.socioEconomicGoals.employmentGrowthPercent}% job growth, {constraints.socioEconomicGoals.educationQualityImprovementPercent}% educ. improv.</p>
      {constraints.priorityAreas.length > 0 && <p className="col-span-full"><span className="font-semibold text-cyan-200">Priority Areas:</span> {constraints.priorityAreas.map(pa => pa.name).join(', ')}</p>}
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-xl border border-gray-700">
      <ExportedSectionTitle title="Project Management & Overview" />
      <p className="text-gray-400 mb-6">Manage your urban planning projects: create new ones, load existing designs, and track their evolution.</p>

      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-700 rounded-md shadow-inner">
        <label htmlFor="project-select" className="block text-gray-300 text-base font-bold min-w-[120px]">Active Project:</label>
        <select
          id="project-select"
          className="p-2.5 bg-gray-600 border border-gray-500 rounded-md text-white flex-grow min-w-48 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
          value={currentProject?.id || ''}
          onChange={(e) => handleSelectProject(e.target.value)}
          aria-label="Select current project"
        >
          <option value="" disabled>Select a Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 px-5 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold transition-colors shadow-md"
        >
          + New Project
        </button>
      </div>

      {currentProject && (
        <div className="mt-6 bg-gray-700 p-5 rounded-lg border border-gray-600 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-cyan-300">
              Project: {currentProject.name}
              <span className="text-sm text-gray-500 ml-3 font-normal">(ID: {currentProject.id})</span>
            </h3>
            <button
              onClick={() => handleDeleteProject(currentProject.id)}
              className="p-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors"
              aria-label={`Delete project ${currentProject.name}`}
            >
              Delete Project
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-3">{currentProject.description || 'No description provided.'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-300 mb-5 border-t border-gray-600 pt-4">
            <p><strong>Created:</strong> {new Date(currentProject.createdAt).toLocaleDateString()} {new Date(currentProject.createdAt).toLocaleTimeString()}</p>
            <p><strong>Last Modified:</strong> {new Date(currentProject.lastModified).toLocaleDateString()} {new Date(currentProject.lastModified).toLocaleTimeString()}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${currentProject.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{currentProject.status.toUpperCase()}</span></p>
            <p><strong>Current Plan:</strong> <span className="text-green-300 font-semibold">{activePlan?.name || 'N/A'}</span></p>
            <p className="col-span-full"><strong>Tags:</strong> {currentProject.tags.map(tag => <span key={tag} className="inline-block bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full mr-2">{tag}</span>)}</p>
            <p className="col-span-full"><strong>Collaborators:</strong> {currentProject.collaborators.map(c => <span key={c.userId} className="inline-block bg-indigo-700 text-white text-xs px-2 py-1 rounded-full mr-2">{c.userId} ({c.role})</span>)}</p>
          </div>

          <div className="mt-5 border-t border-gray-600 pt-5">
            <h4 className="font-bold text-lg text-cyan-300 mb-3 flex items-center">
              <span className="mr-2">📚</span>Plan History ({planHistory.length})
            </h4>
            {planHistory.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                {planHistory.map((entry, index) => (
                  <li key={index} className="bg-gray-600 p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm border border-gray-500">
                    <div className="flex-1 mr-4 mb-2 sm:mb-0">
                      <p className="text-gray-200 font-medium">{entry.notes}</p>
                      <p className="text-xs text-gray-400 flex items-center">
                        Plan ID: {entry.planId} <span className="mx-2">•</span> {new Date(entry.timestamp).toLocaleString()}
                        <button
                          onClick={() => setShowPlanHistoryDetail(showPlanHistoryDetail === entry.planId ? null : entry.planId)}
                          className="ml-3 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                          aria-expanded={showPlanHistoryDetail === entry.planId}
                          aria-controls={`plan-history-details-${entry.planId}`}
                        >
                          {showPlanHistoryDetail === entry.planId ? 'Hide Details' : 'View Constraints'}
                        </button>
                      </p>
                      {showPlanHistoryDetail === entry.planId && (
                        <div id={`plan-history-details-${entry.planId}`} className="mt-3 bg-gray-700 p-3 rounded-md border border-gray-500">
                          <p className="font-semibold text-gray-200 mb-2">Constraints Used:</p>
                          {renderConstraintDetails(entry.constraintsUsed as DesignConstraints)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        await handleSelectProject(currentProject.id); // Ensure project is current
                        const planToView = await urbanSymphonyApi.getCityPlanById(entry.planId);
                        setActivePlan(planToView || null);
                        alert(`Switched to Plan: ${entry.planId}`);
                      }}
                      className="p-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-xs font-medium transition-colors self-start sm:self-auto"
                      aria-label={`View plan ${entry.planId}`}
                    >
                      Load Plan
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No plans generated yet for this project. Use the 'Design Constraints' tab to create your first plan.</p>
            )}
          </div>
        </div>
      )}

      {/* New Project Modal - Vastly expanded for detailed initial constraints */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-4xl shadow-2xl border border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">
            <h3 className="text-3xl font-bold mb-6 text-cyan-400 border-b border-gray-700 pb-4">Create New Urban Symphony Project</h3>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4"> {/* Scrollable content */}
              <div className="mb-6">
                <label htmlFor="new-project-name" className="block text-gray-300 text-base font-bold mb-2">Project Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  id="new-project-name"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., 'Veridian City 2077 Master Plan'"
                  aria-required="true"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="new-project-description" className="block text-gray-300 text-base font-bold mb-2">Project Description</label>
                <textarea
                  id="new-project-description"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
                  rows={3}
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="A brief overview of the project scope, goals, and unique challenges."
                ></textarea>
              </div>

              <ExportedSectionTitle title="Initial Design Constraints" className="mt-6 mb-4" />
              <p className="text-gray-400 text-sm mb-4">Define the foundational parameters that will guide the AI's initial city plan generation.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Population Target */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Population Target (Min/Max)</label>
                  <input type="number" value={newProjectConstraints.populationTarget.min} onChange={e => setNewProjectConstraints(prev => ({ ...prev, populationTarget: { ...prev.populationTarget, min: parseInt(e.target.value) || 0 } }))} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <input type="number" value={newProjectConstraints.populationTarget.max} onChange={e => setNewProjectConstraints(prev => ({ ...prev, populationTarget: { ...prev.populationTarget, max: parseInt(e.target.value) || 0 } }))} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Target Growth Rate (%)</label>
                  <input type="number" step="0.1" value={newProjectConstraints.populationTarget.targetGrowthRatePercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, populationTarget: { ...prev.populationTarget, targetGrowthRatePercent: parseFloat(e.target.value) || 0 } }))} placeholder="Growth %" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Area */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Area (Min/Max SqKm)</label>
                  <input type="number" value={newProjectConstraints.areaSqKm.min} onChange={e => setNewProjectConstraints(prev => ({ ...prev, areaSqKm: { ...prev.areaSqKm, min: parseFloat(e.target.value) || 0 } }))} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <input type="number" value={newProjectConstraints.areaSqKm.max} onChange={e => setNewProjectConstraints(prev => ({ ...prev, areaSqKm: { ...prev.areaSqKm, max: parseFloat(e.target.value) || 0 } }))} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Preferred Shape</label>
                  <select value={newProjectConstraints.areaSqKm.preferredShape} onChange={e => setNewProjectConstraints(prev => ({ ...prev, areaSqKm: { ...prev.areaSqKm, preferredShape: e.target.value as any } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['compact', 'linear', 'polycentric'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                {/* Green Space & Biodiversity */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Green Space Target (%)</label>
                  <input type="number" value={newProjectConstraints.greenSpaceTargetPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, greenSpaceTargetPercent: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mb-1">Biodiversity Target Index</label>
                  <input type="number" step="0.01" min="0" max="1" value={newProjectConstraints.biodiversityTargetIndex} onChange={e => setNewProjectConstraints(prev => ({ ...prev, biodiversityTargetIndex: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Transport & Carbon */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Public Transport Coverage (%)</label>
                  <input type="number" value={newProjectConstraints.publicTransportCoverageTargetPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, publicTransportCoverageTargetPercent: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mb-1">Carbon Reduction Target (%)</label>
                  <input type="number" value={newProjectConstraints.carbonReductionTargetPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, carbonReductionTargetPercent: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Housing & Social */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Housing Affordability Index</label>
                  <input type="number" step="0.01" value={newProjectConstraints.housingAffordabilityTargetIndex} onChange={e => setNewProjectConstraints(prev => ({ ...prev, housingAffordabilityTargetIndex: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mb-1">Social Equity Target Index</label>
                  <input type="number" step="0.01" min="0" max="1" value={newProjectConstraints.socioEconomicGoals.socialEquityTargetIndex} onChange={e => setNewProjectConstraints(prev => ({ ...prev, socioEconomicGoals: { ...prev.socioEconomicGoals, socialEquityTargetIndex: parseFloat(e.target.value) || 0 } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Zoning Preferences */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-1">Res. Density</label>
                  <select value={newProjectConstraints.zoningPreferences.residentialDensityPreference} onChange={e => setNewProjectConstraints(prev => ({ ...prev, zoningPreferences: { ...prev.zoningPreferences, residentialDensityPreference: e.target.value as any } }))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['low', 'medium', 'high', 'mixed'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <label className="block text-gray-300 text-sm font-bold mb-1">Commercial Focus</label>
                  <select value={newProjectConstraints.zoningPreferences.commercialFocus} onChange={e => setNewProjectConstraints(prev => ({ ...prev, zoningPreferences: { ...prev.zoningPreferences, commercialFocus: e.target.value as any } }))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['retail', 'office', 'mixed', 'innovation-hub'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <label className="block text-gray-300 text-sm font-bold mb-1">Industrial Pref.</label>
                  <select value={newProjectConstraints.zoningPreferences.industrialPreference} onChange={e => setNewProjectConstraints(prev => ({ ...prev, zoningPreferences: { ...prev.zoningPreferences, industrialPreference: e.target.value as any } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['light', 'heavy', 'none', 'eco-industrial'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                {/* Environmental Focus & Water Efficiency */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Environmental Focus</label>
                  <select value={newProjectConstraints.environmentalFocus} onChange={e => setNewProjectConstraints(prev => ({ ...prev, environmentalFocus: e.target.value as any } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['waterfront', 'forest', 'desert', 'coastal', 'mountainous', 'mixed'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <label className="block text-gray-300 text-sm font-bold mb-1">Water Efficiency Target (%)</label>
                  <input type="number" value={newProjectConstraints.waterEfficiencyTargetPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, waterEfficiencyTargetPercent: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Budget & Timeline */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Budget Cap (Millions USD)</label>
                  <input type="number" value={newProjectConstraints.budgetCapMillionsUSD} onChange={e => setNewProjectConstraints(prev => ({ ...prev, budgetCapMillionsUSD: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mb-1">Timeline (Months)</label>
                  <input type="number" value={newProjectConstraints.timelineMonths} onChange={e => setNewProjectConstraints(prev => ({ ...prev, timelineMonths: parseInt(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Smart City Features */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Smart City Feature Priorities (comma-separated)</label>
                  <input type="text" value={newProjectConstraints.smartCityFeaturePriorities.join(', ')} onChange={e => setNewProjectConstraints(prev => ({ ...prev, smartCityFeaturePriorities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Climate Resilience Strategies */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Climate Resilience Strategies (comma-separated)</label>
                  <input type="text" value={newProjectConstraints.climateResilienceStrategies.join(', ')} onChange={e => setNewProjectConstraints(prev => ({ ...prev, climateResilienceStrategies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Priority Areas */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Priority Areas (Name, Type, Coords, Intensity - one per line)</label>
                  <textarea
                    className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500"
                    rows={4}
                    value={newProjectConstraints.priorityAreas.map(p => `${p.name}, ${p.type}, ${p.coordinates}, ${p.developmentIntensity}`).join('\n')}
                    onChange={(e) => {
                      const areas = e.target.value.split('\n').map(line => {
                        const parts = line.split(',').map(p => p.trim());
                        return parts.length >= 4 ? { name: parts[0], type: parts[1] as any, coordinates: parts[2], developmentIntensity: parts[3] as any } : null;
                      }).filter(Boolean) as any;
                      setNewProjectConstraints(prev => ({ ...prev, priorityAreas: areas }));
                    }}
                    placeholder="Central Business District, commercial, lat:X,lon:Y, high&#10;Waterfront Park, green, lat:A,lon:B, medium"
                  ></textarea>
                </div>
              </div>
            </div> {/* End of scrollable content */}

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 px-6 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="p-3 px-6 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                Create Project & Initial Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component for defining detailed design constraints and triggering plan generation or refinement.
 * Offers structured input fields for all parameters, enhancing user control over the AI.
 */
export const ExportedConstraintEditor: React.FC = () => {
  const { currentProject, activePlan, setCurrentProject, setIsLoadingGlobal, setActivePlan, currentUser } = useUrbanSymphony();
  // Initialize local constraints with active plan's constraints if available, otherwise defaults
  const [localConstraints, setLocalConstraints] = useState<DesignConstraints>(() => activePlan ? activePlan.planHistory[activePlan.planHistory.length - 1].constraintsUsed : {
    populationTarget: { min: 750000, max: 1200000, targetGrowthRatePercent: 1.5 },
    areaSqKm: { min: 150, max: 250, preferredShape: 'compact' },
    greenSpaceTargetPercent: 35,
    publicTransportCoverageTargetPercent: 85,
    carbonReductionTargetPercent: 45,
    housingAffordabilityTargetIndex: 0.75,
    zoningPreferences: { residentialDensityPreference: 'mixed', commercialFocus: 'mixed', industrialPreference: 'light', mixedUseIntegrationLevel: 'high' },
    environmentalFocus: 'waterfront',
    socioEconomicGoals: { employmentGrowthPercent: 5, educationQualityImprovementPercent: 10, healthcareAccessImprovementPercent: 15, culturalPreservationEmphasis: 'high', socialEquityTargetIndex: 0.8 },
    budgetCapMillionsUSD: 8000,
    timelineMonths: 180,
    priorityAreas: [],
    noiseReductionTargetDB: 5,
    biodiversityTargetIndex: 0.8,
    waterEfficiencyTargetPercent: 20,
    smartCityFeaturePriorities: ['smart traffic management', 'public safety sensors', 'digital kiosks'],
    citizenParticipationMechanism: 'hybrid',
    climateResilienceStrategies: ['green infrastructure', 'early warning systems']
  });
  const [constraintsText, setConstraintsText] = useState(''); // For the raw text input, mimicking original behavior

  /**
   * Updates local constraints when the active plan or current project changes.
   * If an active plan exists, it attempts to load its most recent constraints.
   */
  useEffect(() => {
    if (activePlan && currentProject) {
      const latestPlanEntry = currentProject.planHistory.find(entry => entry.planId === activePlan.planId);
      if (latestPlanEntry && latestPlanEntry.constraintsUsed) {
        setLocalConstraints(latestPlanEntry.constraintsUsed);
        // Attempt to create a summary text from structured constraints
        const summary = `Population: ${latestPlanEntry.constraintsUsed.populationTarget.min}-${latestPlanEntry.constraintsUsed.populationTarget.max}, Green: ${latestPlanEntry.constraintsUsed.greenSpaceTargetPercent}%, PT: ${latestPlanEntry.constraintsUsed.publicTransportCoverageTargetPercent}%, Env Focus: ${latestPlanEntry.constraintsUsed.environmentalFocus}.`;
        setConstraintsText(summary);
      } else {
        // Fallback or default if no specific constraints are found in history
        console.warn("No specific constraints found for the active plan, using default/placeholder.");
        setLocalConstraints({
          populationTarget: { min: 750000, max: 1200000, targetGrowthRatePercent: 1.5 },
          areaSqKm: { min: 150, max: 250, preferredShape: 'compact' },
          greenSpaceTargetPercent: 35,
          publicTransportCoverageTargetPercent: 85,
          carbonReductionTargetPercent: 45,
          housingAffordabilityTargetIndex: 0.75,
          zoningPreferences: { residentialDensityPreference: 'mixed', commercialFocus: 'mixed', industrialPreference: 'light', mixedUseIntegrationLevel: 'high' },
          environmentalFocus: 'waterfront',
          socioEconomicGoals: { employmentGrowthPercent: 5, educationQualityImprovementPercent: 10, healthcareAccessImprovementPercent: 15, culturalPreservationEmphasis: 'high', socialEquityTargetIndex: 0.8 },
          budgetCapMillionsUSD: 8000,
          timelineMonths: 180,
          priorityAreas: [],
          noiseReductionTargetDB: 5,
          biodiversityTargetIndex: 0.8,
          waterEfficiencyTargetPercent: 20,
          smartCityFeaturePriorities: ['smart traffic management', 'public safety sensors', 'digital kiosks'],
          citizenParticipationMechanism: 'hybrid',
          climateResilienceStrategies: ['green infrastructure', 'early warning systems']
        });
        setConstraintsText(`Population: ${activePlan.population.total.toLocaleString()}, Green space: ${activePlan.greenSpace.percentageOfCityArea.toFixed(1)}% min, modern infrastructure focus.`);
      }
    } else if (!currentProject) {
      // Clear or reset if no project is selected
      setLocalConstraints({
        populationTarget: { min: 500000, max: 1000000, targetGrowthRatePercent: 1.0 },
        areaSqKm: { min: 100, max: 200, preferredShape: 'compact' },
        greenSpaceTargetPercent: 30,
        publicTransportCoverageTargetPercent: 70,
        carbonReductionTargetPercent: 30,
        housingAffordabilityTargetIndex: 0.6,
        zoningPreferences: { residentialDensityPreference: 'medium', commercialFocus: 'mixed', industrialPreference: 'none', mixedUseIntegrationLevel: 'medium' },
        environmentalFocus: 'mixed',
        socioEconomicGoals: { employmentGrowthPercent: 2, educationQualityImprovementPercent: 5, healthcareAccessImprovementPercent: 5, culturalPreservationEmphasis: 'medium', socialEquityTargetIndex: 0.7 },
        budgetCapMillionsUSD: 5_000,
        timelineMonths: 120,
        priorityAreas: [],
        noiseReductionTargetDB: 0,
        biodiversityTargetIndex: 0.6,
        waterEfficiencyTargetPercent: 10,
        smartCityFeaturePriorities: [],
        citizenParticipationMechanism: 'online-platform',
        climateResilienceStrategies: []
      });
      setConstraintsText('');
    }
  }, [activePlan, currentProject]);

  /**
   * Generic handler for updating nested constraint values.
   * @param {string} field - Top-level field name.
   * @param {any} value - The new value.
   * @param {string} [subField] - Second-level field name.
   * @param {string} [subSubField] - Third-level field name.
   */
  const handleConstraintChange = useCallback((field: string, value: any, subField?: string, subSubField?: string) => {
    setLocalConstraints(prev => {
      if (!prev) return prev;
      let updated: any = { ...prev };
      if (subSubField) {
        updated[field] = { ...updated[field], [subField]: { ...updated[field][subField], [subSubField]: value } };
      } else if (subField) {
        updated[field] = { ...updated[field], [subField]: value };
      } else {
        updated[field] = value;
      }
      return updated;
    });
  }, []);

  /**
   * Triggers the generation of a new city plan based on current constraints.
   * Updates global loading state and sets the newly generated plan as active.
   */
  const handleGeneratePlan = async () => {
    if (!currentProject || !localConstraints) {
      alert("Please select a project and define constraints before generating a plan.");
      return;
    }
    setIsLoadingGlobal(true);
    try {
      // In a real application, raw text constraints would be processed by an NLP module.
      // Here, we just pass the structured constraints.
      const generatedPlan = await urbanSymphonyApi.generateCityPlan(currentProject.id, localConstraints, currentProject.name, currentUser.userId);
      setActivePlan(generatedPlan);
      // Update project history in the UI by re-fetching the project
      const updatedProject = await urbanSymphonyApi.getProjectById(currentProject.id);
      if (updatedProject) setCurrentProject(updatedProject);
      alert(`New plan '${generatedPlan.name}' (v${generatedPlan.version}) generated successfully!`);
    } catch (error) {
      console.error("Error generating city plan:", error);
      alert("Failed to generate plan. See console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  /**
   * Triggers the refinement of the current active plan based on modified constraints.
   * Creates a new version of the active plan.
   */
  const handleRefinePlan = async () => {
    if (!currentProject || !activePlan || !localConstraints) {
      alert("Please select an active plan and define constraints for refinement.");
      return;
    }
    setIsLoadingGlobal(true);
    try {
      const refinedPlan = await urbanSymphonyApi.refineCityPlan(activePlan.planId, localConstraints, currentUser.userId);
      setActivePlan(refinedPlan);
      // Update project history in the UI by re-fetching the project
      const updatedProject = await urbanSymphonyApi.getProjectById(currentProject.id);
      if (updatedProject) setCurrentProject(updatedProject);
      alert(`Plan '${refinedPlan.name}' (v${refinedPlan.version}) refined successfully!`);
    } catch (error) {
      console.error("Error refining city plan:", error);
      alert("Failed to refine plan. See console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  if (!currentProject) {
    return <div className="bg-gray-800 p-6 rounded-lg mb-8 text-center text-gray-400 border border-gray-700 shadow-xl">Please select or create a project to define design constraints.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-xl border border-gray-700">
      <ExportedSectionTitle title="Design Constraints & Input Parameters" />
      <p className="text-gray-400 mb-6">Specify the detailed requirements and preferences for your urban design. The AI will interpret these parameters during plan generation and refinement.</p>

      <div className="mb-6 bg-gray-700 p-4 rounded-md border border-gray-600 shadow-inner">
        <label htmlFor="constraints-textarea" className="block text-gray-300 text-base font-bold mb-2">General Design Brief (Optional Free Text)</label>
        <textarea
          id="constraints-textarea"
          value={constraintsText}
          onChange={e => setConstraintsText(e.target.value)}
          placeholder="e.g., 'Develop a vibrant, pedestrian-friendly downtown core with a strong emphasis on green infrastructure and cultural spaces. Prioritize public transport over private vehicle use.'"
          rows={5}
          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
          aria-label="General design brief"
        />
        <p className="text-xs text-gray-500 mt-2">This free-text input provides high-level guidance for the AI, complementing the structured parameters below.</p>
      </div>

      {localConstraints && (
        <>
          <h3 className="text-xl font-medium text-cyan-300 mb-4 border-b border-gray-700 pb-2">Detailed Parameters: Granular Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar p-2 -mr-2">
            {/* Population Target */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Population Target (Min/Max)</label>
              <input type="number" value={localConstraints.populationTarget.min} onChange={e => handleConstraintChange('populationTarget', parseInt(e.target.value) || 0, 'min')} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <input type="number" value={localConstraints.populationTarget.max} onChange={e => handleConstraintChange('populationTarget', parseInt(e.target.value) || 0, 'max')} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Target Growth Rate (%)</label>
              <input type="number" step="0.1" value={localConstraints.populationTarget.targetGrowthRatePercent} onChange={e => handleConstraintChange('populationTarget', parseFloat(e.target.value) || 0, 'targetGrowthRatePercent')} placeholder="Growth %" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Area & Shape */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Area (Min/Max SqKm)</label>
              <input type="number" value={localConstraints.areaSqKm.min} onChange={e => handleConstraintChange('areaSqKm', parseFloat(e.target.value) || 0, 'min')} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <input type="number" value={localConstraints.areaSqKm.max} onChange={e => handleConstraintChange('areaSqKm', parseFloat(e.target.value) || 0, 'max')} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Preferred Shape</label>
              <select value={localConstraints.areaSqKm.preferredShape} onChange={e => handleConstraintChange('areaSqKm', e.target.value, 'preferredShape')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['compact', 'linear', 'polycentric'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Green Space & Biodiversity */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Green Space Target (%)</label>
              <input type="number" value={localConstraints.greenSpaceTargetPercent} onChange={e => handleConstraintChange('greenSpaceTargetPercent', parseFloat(e.target.value) || 0)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mb-1">Biodiversity Target Index</label>
              <input type="number" step="0.01" min="0" max="1" value={localConstraints.biodiversityTargetIndex} onChange={e => handleConstraintChange('biodiversityTargetIndex', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Public Transport & Carbon Reduction */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Public Transport Coverage (%)</label>
              <input type="number" value={localConstraints.publicTransportCoverageTargetPercent} onChange={e => handleConstraintChange('publicTransportCoverageTargetPercent', parseFloat(e.target.value) || 0)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mb-1">Carbon Reduction Target (%)</label>
              <input type="number" value={localConstraints.carbonReductionTargetPercent} onChange={e => handleConstraintChange('carbonReductionTargetPercent', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Housing & Social Equity */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Housing Affordability Index</label>
              <input type="number" step="0.01" value={localConstraints.housingAffordabilityTargetIndex} onChange={e => handleConstraintChange('housingAffordabilityTargetIndex', parseFloat(e.target.value) || 0)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mb-1">Social Equity Target Index</label>
              <input type="number" step="0.01" min="0" max="1" value={localConstraints.socioEconomicGoals.socialEquityTargetIndex} onChange={e => handleConstraintChange('socioEconomicGoals', parseFloat(e.target.value) || 0, 'socialEquityTargetIndex')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Zoning Preferences - Residential */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Residential Density Preference</label>
              <select value={localConstraints.zoningPreferences.residentialDensityPreference} onChange={e => handleConstraintChange('zoningPreferences', e.target.value, 'residentialDensityPreference')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['low', 'medium', 'high', 'mixed'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Zoning Preferences - Commercial */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Commercial Focus</label>
              <select value={localConstraints.zoningPreferences.commercialFocus} onChange={e => handleConstraintChange('zoningPreferences', e.target.value, 'commercialFocus')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['retail', 'office', 'mixed', 'innovation-hub'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Zoning Preferences - Industrial */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Industrial Preference</label>
              <select value={localConstraints.zoningPreferences.industrialPreference} onChange={e => handleConstraintChange('zoningPreferences', e.target.value, 'industrialPreference')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['light', 'heavy', 'none', 'eco-industrial'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Zoning Preferences - Mixed Use Integration */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Mixed-Use Integration Level</label>
              <select value={localConstraints.zoningPreferences.mixedUseIntegrationLevel} onChange={e => handleConstraintChange('zoningPreferences', e.target.value, 'mixedUseIntegrationLevel')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['low', 'medium', 'high'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Environmental Focus & Water Efficiency */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Environmental Focus</label>
              <select value={localConstraints.environmentalFocus} onChange={e => handleConstraintChange('environmentalFocus', e.target.value)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['waterfront', 'forest', 'desert', 'coastal', 'mountainous', 'mixed'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <label className="block text-gray-300 text-sm font-bold mb-1">Water Efficiency Target (%)</label>
              <input type="number" value={localConstraints.waterEfficiencyTargetPercent} onChange={e => handleConstraintChange('waterEfficiencyTargetPercent', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Budget & Timeline */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Budget Cap (Millions USD)</label>
              <input type="number" value={localConstraints.budgetCapMillionsUSD} onChange={e => handleConstraintChange('budgetCapMillionsUSD', parseFloat(e.target.value) || 0)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mb-1">Timeline (Months)</label>
              <input type="number" value={localConstraints.timelineMonths} onChange={e => handleConstraintChange('timelineMonths', parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Socio-Economic Goals */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
              <h4 className="block text-gray-300 text-sm font-bold mb-2">Socio-Economic Goals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Employment Growth (%)</label>
                  <input type="number" step="0.1" value={localConstraints.socioEconomicGoals.employmentGrowthPercent} onChange={e => handleConstraintChange('socioEconomicGoals', parseFloat(e.target.value) || 0, 'employmentGrowthPercent')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Education Quality Improv. (%)</label>
                  <input type="number" step="0.1" value={localConstraints.socioEconomicGoals.educationQualityImprovementPercent} onChange={e => handleConstraintChange('socioEconomicGoals', parseFloat(e.target.value) || 0, 'educationQualityImprovementPercent')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Healthcare Access Improv. (%)</label>
                  <input type="number" step="0.1" value={localConstraints.socioEconomicGoals.healthcareAccessImprovementPercent} onChange={e => handleConstraintChange('socioEconomicGoals', parseFloat(e.target.value) || 0, 'healthcareAccessImprovementPercent')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Cultural Preservation Emphasis</label>
                  <select value={localConstraints.socioEconomicGoals.culturalPreservationEmphasis} onChange={e => handleConstraintChange('socioEconomicGoals', e.target.value, 'culturalPreservationEmphasis')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['low', 'medium', 'high'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {/* Smart City Feature Priorities */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-gray-300 text-sm font-bold mb-2">Smart City Feature Priorities (comma-separated)</label>
              <input type="text" value={localConstraints.smartCityFeaturePriorities.join(', ')} onChange={e => handleConstraintChange('smartCityFeaturePriorities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Climate Resilience Strategies */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-gray-300 text-sm font-bold mb-2">Climate Resilience Strategies (comma-separated)</label>
              <input type="text" value={localConstraints.climateResilienceStrategies.join(', ')} onChange={e => handleConstraintChange('climateResilienceStrategies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Priority Areas (Expanded input for demo) */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-gray-300 text-sm font-bold mb-2">Priority Areas (Name, Type, Coordinates, Development Intensity - one per line)</label>
              <textarea
                className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500"
                rows={4}
                value={localConstraints.priorityAreas.map(p => `${p.name}, ${p.type}, ${p.coordinates}, ${p.developmentIntensity}`).join('\n')}
                onChange={(e) => {
                  const areas = e.target.value.split('\n').map(line => {
                    const parts = line.split(',').map(p => p.trim());
                    return parts.length >= 4 ? { name: parts[0], type: parts[1] as any, coordinates: parts[2], developmentIntensity: parts[3] as any } : null;
                  }).filter(Boolean) as any;
                  handleConstraintChange('priorityAreas', areas);
                }}
                placeholder="Central Business District, commercial, lat:X,lon:Y, high&#10;Waterfront Park, green, lat:A,lon:B, medium"
              ></textarea>
            </div>
            {/* Noise Reduction Target */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Noise Reduction Target (dB)</label>
              <input type="number" value={localConstraints.noiseReductionTargetDB} onChange={e => handleConstraintChange('noiseReductionTargetDB', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Citizen Participation Mechanism */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Citizen Participation Mechanism</label>
              <select value={localConstraints.citizenParticipationMechanism} onChange={e => handleConstraintChange('citizenParticipationMechanism', e.target.value)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['online-platform', 'public-forums', 'hybrid'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4 border-t border-gray-700">
        <button
          onClick={handleGeneratePlan}
          disabled={!currentProject || !localConstraints}
          className="flex-1 p-3 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-lg"
          aria-label="Generate a new city plan"
        >
          Generate New City Plan
        </button>
        <button
          onClick={handleRefinePlan}
          disabled={!currentProject || !activePlan || !localConstraints}
          className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-lg"
          aria-label="Refine the current active plan"
        >
          Refine Current Plan (v{activePlan?.version || 0})
        </button>
      </div>
    </div>
  );
};

/**
 * Component for visualizing the active city plan, including various data layers
 * and a placeholder for 3D model integration.
 */
export const ExportedPlanVisualization: React.FC = () => {
  const { activePlan } = useUrbanSymphony();
  const [activeLayer, setActiveLayer] = useState<keyof CityPlan['dataLayers'] | 'baseMap'>('baseMap');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 }); // For drag/pan
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  /** Handles the start of a drag event on the map. */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartDrag({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  }, [mapOffset]);

  /** Handles the drag movement for panning the map. */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapOffset({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  }, [isDragging, startDrag]);

  /** Handles the end of a drag event. */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /** Handles zooming the map using the scroll wheel. */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newZoom = zoomLevel;
    if (e.deltaY < 0) { // Zoom in
      newZoom = Math.min(3, zoomLevel * scaleFactor);
    } else { // Zoom out
      newZoom = Math.max(0.5, zoomLevel / scaleFactor);
    }

    // Adjust offset to zoom towards the mouse pointer
    const ratio = newZoom / zoomLevel;
    const newOffsetX = mouseX - (mouseX - mapOffset.x) * ratio;
    const newOffsetY = mouseY - (mouseY - mapOffset.y) * ratio;

    setZoomLevel(newZoom);
    setMapOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoomLevel, mapOffset]);

  if (!activePlan) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg mb-8 text-center text-gray-400 border border-gray-700 shadow-xl">
        No active plan to visualize. Please generate or select a plan from the 'Project Management' tab.
      </div>
    );
  }

  const mapLayers: { [key: string]: { label: string; url: string; isActive: boolean; description: string } } = {
    baseMap: { label: 'Base Map', url: activePlan.mapImageUrl, isActive: activeLayer === 'baseMap', description: 'The foundational geographic layout of the city.' },
    residentialDensityMap: { label: 'Residential Density', url: activePlan.dataLayers.residentialDensityMap, isActive: activeLayer === 'residentialDensityMap', description: 'Heatmap showing population concentration and housing types.' },
    transportNetworkMap: { label: 'Transport Network', url: activePlan.dataLayers.transportNetworkMap, isActive: activeLayer === 'transportNetworkMap', description: 'Overlay of roads, public transit lines, and cycling paths.' },
    greenSpaceOverlayMap: { label: 'Green Spaces', url: activePlan.dataLayers.greenSpaceOverlayMap, isActive: activeLayer === 'greenSpaceOverlayMap', description: 'Visualization of parks, forests, and community gardens.' },
    noiseMap: { label: 'Noise Pollution', url: activePlan.dataLayers.noiseMap, isActive: activeLayer === 'noiseMap', description: 'Contour map indicating areas with high or low noise levels.' },
    socialInfrastructureMap: { label: 'Social Infrastructure', url: activePlan.dataLayers.socialInfrastructureMap, isActive: activeLayer === 'socialInfrastructureMap', description: 'Locations of schools, hospitals, cultural centers, and other public amenities.' },
    economicZonesMap: { label: 'Economic Zones', url: activePlan.dataLayers.economicZonesMap, isActive: activeLayer === 'economicZonesMap', description: 'Designated commercial, industrial, and innovation districts.' },
    environmentalQualityMap: { label: 'Environmental Quality', url: activePlan.dataLayers.environmentalQualityMap, isActive: activeLayer === 'environmentalQualityMap', description: 'Heatmap displaying air and water quality indices across the city.' },
    publicSafetyMap: { label: 'Public Safety', url: activePlan.dataLayers.publicSafetyMap, isActive: activeLayer === 'publicSafetyMap', description: 'Visualization of crime rates, emergency service coverage, and safe zones.' },
    urbanHeatIslandMap: { label: 'Urban Heat Islands', url: activePlan.dataLayers.urbanHeatIslandMap, isActive: activeLayer === 'urbanHeatIslandMap', description: 'Areas experiencing higher temperatures due to urban development.' },
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-xl border border-gray-700">
      <ExportedSectionTitle title={`Plan Visualization: ${activePlan.name} (v${activePlan.version})`} />
      <p className="text-gray-400 mb-6">Explore the generated city plan through interactive maps and specialized data layers. Gain insights into its spatial organization and performance indicators.</p>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Map View */}
        <div className="flex-1 bg-gray-700 rounded-lg overflow-hidden relative shadow-lg h-[500px] xl:h-[700px] border border-gray-600">
          <div
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ overflow: 'hidden' }}
          >
            <img
              src={activePlan.mapImageUrl}
              alt="Generated City Plan Base Map"
              className="absolute top-0 left-0 object-cover"
              style={{
                width: `${100 * zoomLevel}%`,
                height: `${100 * zoomLevel}%`,
                transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                pointerEvents: 'none', // Allow mouse events to propagate to the container
              }}
            />
            {activeLayer !== 'baseMap' && mapLayers[activeLayer] && (
              <img
                src={mapLayers[activeLayer]?.url}
                alt={`${mapLayers[activeLayer]?.label} Overlay`}
                className="absolute top-0 left-0 object-contain mix-blend-overlay opacity-80" // Use mix-blend-overlay for better visual integration
                style={{
                  width: `${100 * zoomLevel}%`,
                  height: `${100 * zoomLevel}%`,
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 text-white p-3 rounded-lg shadow-xl flex flex-col items-center space-y-2 z-10">
            <button
              onClick={() => { setZoomLevel(z => Math.min(3, z * 1.2)); setMapOffset({ x: mapOffset.x * 1.2, y: mapOffset.y * 1.2 }); }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-bold w-full"
              aria-label="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
            <span className="text-xs text-gray-400">{zoomLevel.toFixed(1)}x</span>
            <button
              onClick={() => { setZoomLevel(z => Math.max(0.5, z / 1.2)); setMapOffset({ x: mapOffset.x / 1.2, y: mapOffset.y / 1.2 }); }}
              className="p-2 bg-gray-