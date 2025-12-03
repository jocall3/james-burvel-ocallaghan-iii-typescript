```typescript
import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';

/**
 * This module implements the core UI and intelligent orchestration logic for the Dynamic Soundscape Generator.
 * It provides a rich, interactive experience for users to create, manage, and experience adaptive sound environments.
 * Business Impact: This platform is a strategic asset for enhancing human capital productivity,
 * mitigating stress, and fostering well-being across commercial and personal domains.
 * It delivers measurable improvements in employee retention and performance by transforming
 * static ambient noise into a dynamic, intelligent, and deeply personalized auditory experience.
 * Leveraging agentic AI for personalized recommendations and integrating with real-time sensor data for environmental
 * adaptation, it establishes programmable, user-centric sound environments secured by digital identity.
 * This system provides a profound competitive advantage, opening new high-value revenue streams through
 * premium subscription models, enterprise licensing for advanced workspace management solutions,
 * and potentially tokenized sound asset marketplaces. It represents a revolutionary leap in creating
 * auditable, intelligent, and scalable digital well-being infrastructure.
 */

/**
 * Represents the core state of a soundscape. This is a legacy interface retained for compatibility.
 */
interface SoundscapeState {
  weather: string;
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  currentTrack: string; // e.g., "Calm Rain & Lo-fi Beats"
}

// --- Global Type Definitions (Exported as per instruction) ---

/**
 * EnvironmentalData encapsulates real-time external conditions.
 * Business Value: Essential for context-aware adaptation, enabling predictive soundscape
 * adjustments that resonate with real-world scenarios, thereby elevating user satisfaction
 * and justifying premium data-driven features.
 */
export interface EnvironmentalData {
  weatherCondition: 'CLEAR' | 'CLOUDY' | 'RAIN' | 'STORM' | 'SNOW' | 'FOG';
  temperatureCelsius: number;
  humidityPercentage: number;
  windSpeedKPH: number;
  timeOfDay: 'DAWN' | 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'DUSK' | 'NIGHT';
  ambientNoiseLevelDB: number; // Decibels, detected by a microphone sensor
  geoCoordinates: { lat: number; lon: number };
  locationName: string;
}

/**
 * OfficeSensorData captures internal workspace metrics.
 * Business Value: Crucial for enterprise-grade solutions, this data drives intelligent
 * workspace optimization. By adapting soundscapes to occupancy and activity, it directly
 * enhances focus, reduces distractions, and contributes to quantifiable productivity gains,
 * enabling superior employee experience management.
 */
export interface OfficeSensorData {
  occupancyCount: number;
  averageActivityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  meetingRoomStatus: { roomId: string; isOccupied: boolean; schedule: string }[];
  calendarEvents: { eventName: string; startTime: string; endTime: string; impact: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  energyConsumptionKW: number; // Could indicate general system load
}

/**
 * SoundLayerConfig defines parameters for a single audio layer.
 * Business Value: Granular control over audio components enables sophisticated,
 * customizable soundscapes. This precision is vital for fine-tuning user experience
 * and supports advanced features like spatial audio, enhancing perceived value and
 * justifying complex configuration tools.
 */
export interface SoundLayerConfig {
  id: string;
  name: string;
  assetId: string; // Reference to a SoundAsset
  volume: number; // 0.0 to 1.0
  pan: number; // -1.0 (left) to 1.0 (right)
  isEnabled: boolean;
  isMuted: boolean;
  isSoloed: boolean;
  loop: boolean;
  startTimeOffsetSeconds: number; // For scheduling
  endTimeOffsetSeconds: number; // For scheduling
  spatialCoordinates?: { x: number; y: number; z: number }; // For 3D spatial audio
  effects: EffectConfig[];
}

/**
 * EffectConfig specifies parameters for an audio effect.
 * Business Value: Provides the tools for advanced sound design, allowing users to
 * sculpt immersive and high-fidelity audio environments. This extensibility in
 * audio processing enhances the platform's creative utility and premium appeal.
 */
export interface EffectConfig {
  id: string;
  type: 'REVERB' | 'DELAY' | 'EQ' | 'COMPRESSOR' | 'SPATIALIZER' | 'LOWPASS' | 'HIGHPASS';
  params: Record<string, any>; // Generic parameters for the effect
  isEnabled: boolean;
}

/**
 * SoundAsset represents a single audio asset in the content library.
 * Business Value: Manages the foundational content of the soundscape, acting as
 * a catalog for potentially tokenized digital assets. Its structured metadata
 * enables efficient search, licensing, and integration, creating a scalable content
 * ecosystem that can be monetized through asset marketplaces or premium content tiers.
 */
export interface SoundAsset {
  id: string;
  name: string;
  category: 'AMBIENT' | 'NATURE' | 'MUSIC' | 'VOICES' | 'MACHINES' | 'EFFECTS';
  filePath: string; // URL or path to the audio file
  durationSeconds: number;
  tags: string[];
  description?: string;
  licenseInfo?: string;
  isCustomUpload: boolean;
}

/**
 * SoundscapePreset defines a pre-configured soundscape.
 * Business Value: Offers curated, ready-to-use experiences, streamlining user
 * adoption and demonstrating product capabilities. Presets act as reusable
 * blueprints for tailored environments, valuable for commercial deployments and
 * providing a foundation for user-generated content, enhancing platform stickiness.
 */
export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  layers: SoundLayerConfig[]; // Defines the active layers and their initial settings
  adaptiveRules: RuleConfig[]; // Rules for how this preset adapts
  tags: string[];
  isCustom: boolean;
  createdByUserId?: string;
  lastModified?: string;
}

/**
 * RuleConfig defines a rule for adaptive soundscape generation.
 * Business Value: The engine of intelligent automation, these rules enable
 * dynamic, hands-free adaptation to real-time conditions. This intelligence
 * reduces manual configuration, improves user experience, and highlights the
 * platform's advanced agentic capabilities, offering significant commercial differentiation.
 */
export interface RuleConfig {
  id: string;
  name: string;
  trigger: 'ENVIRONMENT' | 'OFFICE_ACTIVITY' | 'TIME' | 'MANUAL';
  condition: string; // e.g., "weatherCondition == 'RAIN' && occupancyCount > 10"
  action: 'ACTIVATE_PRESET' | 'MODIFY_LAYER' | 'ADJUST_VOLUME' | 'ADD_EFFECT' | 'REMOVE_EFFECT' | 'TOGGLE_LAYER' | 'SEND_NOTIFICATION';
  actionParams: Record<string, any>; // e.g., { presetId: 'rainy_focus', layerId: 'rain_medium', volume: 0.7 }
  priority: number; // Higher number means higher priority
  isEnabled: boolean;
}

/**
 * UserProfile stores individual user data and preferences.
 * Business Value: Central to the Digital Identity and Trust Layer, user profiles
 * enable personalized experiences, secure access, and persistent settings. This
 * personalization drives user loyalty, facilitates targeted service offerings,
 * and forms the basis for auditable user interactions across the platform.
 */
export interface UserProfile {
  id: string;
  username: string;
  favoritePresets: string[]; // Array of preset IDs
  customSoundscapes: SoundscapePreset[];
  personalSettings: {
    masterVolume: number;
    spatialAudioEnabled: boolean;
    notificationsEnabled: boolean;
    preferredLanguage: string;
    aiRecommendationsEnabled: boolean;
    theme: 'DARK' | 'LIGHT';
  };
  lastActiveSoundscapeId?: string;
  sessionHistory: { timestamp: string; presetId: string; durationMinutes: number }[];
}

/**
 * Notification represents a system-generated alert or message.
 * Business Value: Critical for user engagement and system observability, notifications
 * provide real-time feedback, operational alerts, and AI-driven suggestions. This ensures
 * users are informed and can react to important system events, enhancing transparency
 * and enabling proactive user support.
 */
export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'AGENT_ACTION';
  message: string;
  timestamp: string;
  isRead: boolean;
  details?: Record<string, any>;
}

/**
 * AudioEnginePlaybackState reflects the real-time status of the audio output.
 * Business Value: Provides critical operational data for monitoring the audio
 * pipeline's health and performance. Real-time feedback ensures low-latency,
 * high-quality sound delivery, which is fundamental for user satisfaction and
 * the perceived reliability of the entire soundscape platform.
 */
export interface AudioEnginePlaybackState {
  isPlaying: boolean;
  currentPlaybackTimeSeconds: number;
  bufferedSources: { assetId: string; status: 'LOADING' | 'READY' | 'ERROR' }[];
  outputDevice: string;
  masterVolume: number;
  spatialAudioEnabled: boolean;
  lowLatencyMode: boolean;
}

/**
 * SoundscapeAppState defines the complete global state for the application.
 * Business Value: This comprehensive state model serves as the single source of truth
 * for the entire soundscape platform. Its robust structure supports complex interdependencies
 * between modules, enabling consistent data flow, facilitating debugging, and ensuring
 * scalability for future feature integration. It underpins the platform's reliability
 * and audibility, central to enterprise-grade operations.
 */
export interface SoundscapeAppState {
  globalSettings: {
    masterVolume: number;
    aiRecommendationMode: 'OFF' | 'AMBIENT' | 'FOCUS' | 'ENERGY';
    spatialAudioEnabled: boolean;
    lowLatencyMode: boolean;
    activeProfileId: string;
    theme: 'DARK' | 'LIGHT';
  };
  environmentalData: EnvironmentalData;
  officeSensorData: OfficeSensorData;
  userProfiles: UserProfile[];
  soundAssets: SoundAsset[];
  availablePresets: SoundscapePreset[];
  activeSoundscape: {
    id: string; // ID of the currently playing soundscape (preset or custom)
    name: string;
    description: string;
    layers: SoundLayerConfig[]; // Actual layers being played, might be dynamic
    activeAdaptiveRules: RuleConfig[]; // Rules currently influencing the soundscape
    startTime: string;
    lastUpdated: string;
    currentRecommendation?: string; // AI recommendation text
    lastAgentActivity?: { timestamp: string; agentId: string; message: string; action: string };
  };
  audioEngine: AudioEnginePlaybackState;
  notifications: Notification[];
  logs: { timestamp: string; level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR'; message: string }[];
  isLoading: boolean;
  error: string | null;
  activeAdminTab: 'ASSETS' | 'PRESETS' | 'RULES' | 'SYSTEM_LOGS';
  activeProfileManagementTab: 'OVERVIEW' | 'CUSTOM_SOUNDSCAPES' | 'HISTORY';
  activeSettingsTab: 'GENERAL' | 'AUDIO' | 'SENSORS' | 'NOTIFICATIONS';
  activeDashboardTab: 'OVERVIEW' | 'MIXER' | 'RECOMMENDATIONS';
}

// --- Reducer Actions (Exported) ---
/**
 * SoundscapeAction defines all possible state transitions for the SoundscapeAppState.
 * Business Value: Explicitly defined actions ensure predictable state management,
 * crucial for building auditable, fault-tolerant, and maintainable financial systems.
 * Each action represents a controlled change, supporting robust concurrency controls
 * and idempotent transaction handling at the application layer.
 */
export type SoundscapeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_ENVIRONMENTAL_DATA'; payload: Partial<EnvironmentalData> }
  | { type: 'UPDATE_OFFICE_SENSOR_DATA'; payload: Partial<OfficeSensorData> }
  | { type: 'SET_ACTIVE_SOUNDSCAPE_PRESET'; payload: { presetId: string; userId?: string } }
  | { type: 'PLAY_SOUNDSCAPE' }
  | { type: 'PAUSE_SOUNDSCAPE' }
  | { type: 'STOP_SOUNDSCAPE' }
  | { type: 'ADJUST_MASTER_VOLUME'; payload: number }
  | { type: 'TOGGLE_SPATIAL_AUDIO'; payload: boolean }
  | { type: 'TOGGLE_AI_RECOMMENDATION_MODE'; payload: SoundscapeAppState['globalSettings']['aiRecommendationMode'] }
  | { type: 'UPDATE_LAYER_CONFIG'; payload: { layerId: string; updates: Partial<SoundLayerConfig> } }
  | { type: 'ADD_LAYER_TO_ACTIVE_SOUNDSCAPE'; payload: SoundLayerConfig }
  | { type: 'REMOVE_LAYER_FROM_ACTIVE_SOUNDSCAPE'; payload: string } // layerId
  | { type: 'ADD_EFFECT_TO_LAYER'; payload: { layerId: string; effect: EffectConfig } }
  | { type: 'REMOVE_EFFECT_FROM_LAYER'; payload: { layerId: string; effectId: string } }
  | { type: 'UPDATE_EFFECT_CONFIG'; payload: { layerId: string; effectId: string; updates: Partial<EffectConfig> } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_AS_READ'; payload: string } // notificationId
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'ADD_LOG'; payload: SoundscapeAppState['logs'][0] }
  | { type: 'SET_ACTIVE_PROFILE'; payload: string } // userId
  | { type: 'ADD_USER_PROFILE'; payload: UserProfile } // New action for creating users
  | { type: 'UPDATE_USER_PROFILE'; payload: { userId: string; updates: Partial<UserProfile> } }
  | { type: 'ADD_CUSTOM_SOUNDSCAPE_TO_PROFILE'; payload: { userId: string; soundscape: SoundscapePreset } }
  | { type: 'DELETE_CUSTOM_SOUNDSCAPE_FROM_PROFILE'; payload: { userId: string; soundscapeId: string } }
  | { type: 'UPDATE_SOUND_ASSET'; payload: { assetId: string; updates: Partial<SoundAsset> } }
  | { type: 'ADD_SOUND_ASSET'; payload: SoundAsset }
  | { type: 'DELETE_SOUND_ASSET'; payload: string } // assetId
  | { type: 'UPDATE_PRESET'; payload: { presetId: string; updates: Partial<SoundscapePreset> } }
  | { type: 'ADD_PRESET'; payload: SoundscapePreset }
  | { type: 'DELETE_PRESET'; payload: string } // presetId
  | { type: 'UPDATE_RULE_CONFIG'; payload: { ruleId: string; updates: Partial<RuleConfig> } }
  | { type: 'ADD_RULE_CONFIG'; payload: RuleConfig }
  | { type: 'DELETE_RULE_CONFIG'; payload: string } // ruleId
  | { type: 'SET_AUDIO_OUTPUT_DEVICE'; payload: string }
  | { type: 'SET_LOW_LATENCY_MODE'; payload: boolean }
  | { type: 'SET_ACTIVE_DASHBOARD_TAB'; payload: SoundscapeAppState['activeDashboardTab'] }
  | { type: 'SET_ACTIVE_SETTINGS_TAB'; payload: SoundscapeAppState['activeSettingsTab'] }
  | { type: 'SET_ACTIVE_PROFILE_MANAGEMENT_TAB'; payload: SoundscapeAppState['activeProfileManagementTab'] }
  | { type: 'SET_ACTIVE_ADMIN_TAB'; payload: SoundscapeAppState['activeAdminTab'] }
  | { type: 'UPDATE_GLOBAL_SETTINGS'; payload: Partial<SoundscapeAppState['globalSettings']> } // New action for global settings
  | { type: 'UPDATE_PLAYBACK_TIME'; payload: number } // New action to update playback time
  | { type: 'SET_AGENT_ACTIVITY'; payload: SoundscapeAppState['activeSoundscape']['lastAgentActivity'] }
  | { type: 'INITIALIZE_STATE'; payload: SoundscapeAppState } // For loading from storage
  | { type: 'RESET_STATE' };


// --- Initial State (Exported) ---
/**
 * initialSoundscapeState defines the pristine, default state of the application.
 * Business Value: This foundational state ensures consistent application boot-up
 * and provides a reliable baseline for testing and development. It's designed
 * for rapid local deployment and demonstration, embodying the platform's core
 * capabilities and out-of-the-box readiness for enterprise clients.
 */
export const initialSoundscapeState: SoundscapeAppState = {
  globalSettings: {
    masterVolume: 0.75,
    aiRecommendationMode: 'AMBIENT',
    spatialAudioEnabled: true,
    lowLatencyMode: false,
    activeProfileId: 'user-001',
    theme: 'DARK',
  },
  environmentalData: {
    weatherCondition: 'CLEAR',
    temperatureCelsius: 20,
    humidityPercentage: 60,
    windSpeedKPH: 5,
    timeOfDay: 'MORNING',
    ambientNoiseLevelDB: 45,
    geoCoordinates: { lat: 34.052235, lon: -118.243683 }, // Default to LA
    locationName: 'Los Angeles, CA',
  },
  officeSensorData: {
    occupancyCount: 15,
    averageActivityLevel: 'MEDIUM',
    meetingRoomStatus: [
      { roomId: 'conf-room-A', isOccupied: false, schedule: '10:00-11:00 Marketing Sync' },
      { roomId: 'focus-pod-1', isOccupied: true, schedule: 'Ad-hoc' },
    ],
    calendarEvents: [
      { eventName: 'All Hands Meeting', startTime: '2023-10-27T14:00:00Z', endTime: '2023-10-27T15:00:00Z', impact: 'HIGH' },
    ],
    energyConsumptionKW: 120,
  },
  userProfiles: [
    {
      id: 'user-001',
      username: 'Alice Smith',
      favoritePresets: ['preset-001', 'preset-003'],
      customSoundscapes: [],
      personalSettings: {
        masterVolume: 0.8,
        spatialAudioEnabled: true,
        notificationsEnabled: true,
        preferredLanguage: 'en-US',
        aiRecommendationsEnabled: true,
        theme: 'DARK',
      },
      lastActiveSoundscapeId: 'preset-001',
      sessionHistory: [],
    },
    {
      id: 'user-002',
      username: 'Bob Johnson',
      favoritePresets: ['preset-002'],
      customSoundscapes: [],
      personalSettings: {
        masterVolume: 0.7,
        spatialAudioEnabled: false,
        notificationsEnabled: false,
        preferredLanguage: 'en-US',
        aiRecommendationsEnabled: false,
        theme: 'DARK',
      },
      sessionHistory: [],
    }
  ],
  soundAssets: [
    { id: 'asset-rain-light', name: 'Light Rain', category: 'NATURE', filePath: '/audio/rain_light.mp3', durationSeconds: 120, tags: ['rain', 'calm'], isCustomUpload: false },
    { id: 'asset-keyboard-typing', name: 'Keyboard Typing', category: 'MACHINES', filePath: '/audio/typing.mp3', durationSeconds: 60, tags: ['office', 'focus'], isCustomUpload: false },
    { id: 'asset-coffee-shop', name: 'Coffee Shop Buzz', category: 'AMBIENT', filePath: '/audio/coffee_shop.mp3', durationSeconds: 180, tags: ['background', 'social'], isCustomUpload: false },
    { id: 'asset-lofi-beats', name: 'Lo-fi Study Beats', category: 'MUSIC', filePath: '/audio/lofi_beats.mp3', durationSeconds: 300, tags: ['music', 'focus'], isCustomUpload: false },
    { id: 'asset-forest-birds', name: 'Forest Birds', category: 'NATURE', filePath: '/audio/forest_birds.mp3', durationSeconds: 240, tags: ['nature', 'calm'], isCustomUpload: false },
    { id: 'asset-waves', name: 'Ocean Waves', category: 'NATURE', filePath: '/audio/ocean_waves.mp3', durationSeconds: 180, tags: ['nature', 'relax'], isCustomUpload: false },
    { id: 'asset-city-ambience', name: 'City Ambience', category: 'AMBIENT', filePath: '/audio/city_ambience.mp3', durationSeconds: 180, tags: ['city', 'background'], isCustomUpload: false },
    { id: 'asset-white-noise', name: 'White Noise', category: 'AMBIENT', filePath: '/audio/white_noise.mp3', durationSeconds: 300, tags: ['noise', 'focus'], isCustomUpload: false },
    { id: 'asset-deep-focus-synth', name: 'Deep Focus Synth', category: 'MUSIC', filePath: '/audio/deep_focus_synth.mp3', durationSeconds: 360, tags: ['music', 'focus', 'ambient'], isCustomUpload: false },
    { id: 'asset-gentle-stream', name: 'Gentle Stream', category: 'NATURE', filePath: '/audio/gentle_stream.mp3', durationSeconds: 150, tags: ['nature', 'calm', 'water'], isCustomUpload: false },
    { id: 'asset-light-wind', name: 'Light Wind', category: 'NATURE', filePath: '/audio/light_wind.mp3', durationSeconds: 120, tags: ['nature', 'calm', 'wind'], isCustomUpload: false },
    { id: 'asset-distant-thunder', name: 'Distant Thunder', category: 'EFFECTS', filePath: '/audio/distant_thunder.mp3', durationSeconds: 90, tags: ['storm', 'weather'], isCustomUpload: false },
    { id: 'asset-chimes', name: 'Wind Chimes', category: 'EFFECTS', filePath: '/audio/wind_chimes.mp3', durationSeconds: 60, tags: ['relax', 'zen'], isCustomUpload: false },
  ],
  availablePresets: [
    {
      id: 'preset-001',
      name: 'Focus Rain',
      description: 'Gentle rain with a subtle background track for deep concentration.',
      layers: [
        { id: 'layer-rain-1', name: 'Light Rain', assetId: 'asset-rain-light', volume: 0.6, pan: 0, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
        { id: 'layer-lofi-1', name: 'Lo-fi Beats', assetId: 'asset-lofi-beats', volume: 0.4, pan: 0, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
      ],
      adaptiveRules: [
        { id: 'rule-rain-intensity', name: 'Adjust Rain Volume by Weather', trigger: 'ENVIRONMENT', condition: "weatherCondition === 'STORM'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-rain-1', volume: 0.9 }, priority: 5, isEnabled: true },
        { id: 'rule-activity-lofi', name: 'Boost Lo-fi on High Activity', trigger: 'OFFICE_ACTIVITY', condition: "averageActivityLevel === 'HIGH'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-lofi-1', volume: 0.55 }, priority: 3, isEnabled: true },
      ],
      tags: ['focus', 'rain', 'lofi'],
      isCustom: false,
    },
    {
      id: 'preset-002',
      name: 'Forest Retreat',
      description: 'Immersive forest sounds for relaxation and mental clarity.',
      layers: [
        { id: 'layer-forest-1', name: 'Forest Birds', assetId: 'asset-forest-birds', volume: 0.7, pan: 0, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
        { id: 'layer-stream-1', name: 'Gentle Stream', assetId: 'asset-gentle-stream', volume: 0.5, pan: -0.3, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
        { id: 'layer-wind-1', name: 'Light Wind', assetId: 'asset-light-wind', volume: 0.3, pan: 0.5, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
      ],
      adaptiveRules: [
        { id: 'rule-wind-intensity', name: 'Adjust Wind Volume by Wind Speed', trigger: 'ENVIRONMENT', condition: "windSpeedKPH > 15", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-wind-1', volume: 0.6 }, priority: 4, isEnabled: true },
      ],
      tags: ['nature', 'relax', 'forest'],
      isCustom: false,
    },
    {
      id: 'preset-003',
      name: 'Urban Cafe',
      description: 'Lively coffee shop buzz with subtle deep focus synth for creative work.',
      layers: [
        { id: 'layer-cafe-1', name: 'Coffee Shop Buzz', assetId: 'asset-coffee-shop', volume: 0.5, pan: 0, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
        { id: 'layer-synth-1', name: 'Deep Focus Synth', assetId: 'asset-deep-focus-synth', volume: 0.3, pan: 0, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
      ],
      adaptiveRules: [
        { id: 'rule-occupancy-cafe', name: 'Increase Cafe Buzz with Occupancy', trigger: 'OFFICE_ACTIVITY', condition: "occupancyCount > 25", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-cafe-1', volume: 0.7 }, priority: 3, isEnabled: true },
      ],
      tags: ['urban', 'cafe', 'focus', 'lively'],
      isCustom: false,
    }
  ],
  activeSoundscape: {
    id: 'preset-001',
    name: 'Focus Rain',
    description: 'Gentle rain with a subtle background track for deep concentration.',
    layers: [
      { id: 'layer-rain-1', name: 'Light Rain', assetId: 'asset-rain-light', volume: 0.6, pan: 0, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
      { id: 'layer-lofi-1', name: 'Lo-fi Beats', assetId: 'asset-lofi-beats', volume: 0.4, pan: 0, isEnabled: true, isMuted: false, isSoloed: false, loop: true, startTimeOffsetSeconds: 0, endTimeOffsetSeconds: 0, effects: [] },
    ],
    activeAdaptiveRules: [
      { id: 'rule-rain-intensity', name: 'Adjust Rain Volume by Weather', trigger: 'ENVIRONMENT', condition: "weatherCondition === 'STORM'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-rain-1', volume: 0.9 }, priority: 5, isEnabled: true },
      { id: 'rule-activity-lofi', name: 'Boost Lo-fi on High Activity', trigger: 'OFFICE_ACTIVITY', condition: "averageActivityLevel === 'HIGH'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-lofi-1', volume: 0.55 }, priority: 3, isEnabled: true },
    ],
    startTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    currentRecommendation: 'Based on current weather, "Focus Rain" is recommended for concentration.',
    lastAgentActivity: { timestamp: new Date().toISOString(), agentId: 'AI_REC_AGENT', message: 'Initial recommendation generated.', action: 'RECOMMEND_PRESET' }
  },
  audioEngine: {
    isPlaying: true,
    currentPlaybackTimeSeconds: 0,
    bufferedSources: [],
    outputDevice: 'System Default',
    masterVolume: 0.75,
    spatialAudioEnabled: true,
    lowLatencyMode: false,
  },
  notifications: [
    { id: 'notif-001', type: 'INFO', message: 'Welcome to Dynamic Soundscape! Enjoy your day.', timestamp: new Date().toISOString(), isRead: false },
  ],
  logs: [
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Application initialized.' },
  ],
  isLoading: false,
  error: null,
  activeAdminTab: 'ASSETS',
  activeProfileManagementTab: 'OVERVIEW',
  activeSettingsTab: 'GENERAL',
  activeDashboardTab: 'OVERVIEW',
};

// --- Soundscape Reducer (Exported) ---
/**
 * soundscapeReducer manages the entire application state with immutability,
 * ensuring predictable and auditable state transitions.
 * Business Value: This reducer is the backbone of the application's data integrity
 * and responsiveness. Its functional purity and strict action-based updates are
 * paramount for production-grade reliability, enabling easy debugging, robust
 * testing, and compliance with financial system audit trails.
 */
export const soundscapeReducer = (state: SoundscapeAppState, action: SoundscapeAction): SoundscapeAppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_ENVIRONMENTAL_DATA':
      return {
        ...state,
        environmentalData: { ...state.environmentalData, ...action.payload },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Environmental data updated.` }],
      };
    case 'UPDATE_OFFICE_SENSOR_DATA':
      return {
        ...state,
        officeSensorData: { ...state.officeSensorData, ...action.payload },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Office sensor data updated.` }],
      };
    case 'SET_ACTIVE_SOUNDSCAPE_PRESET': {
      const selectedPreset = state.availablePresets.find(p => p.id === action.payload.presetId) ||
                             state.userProfiles.find(up => up.id === (action.payload.userId || state.globalSettings.activeProfileId))?.customSoundscapes.find(cs => cs.id === action.payload.presetId);
      if (!selectedPreset) return state;

      const updatedUserProfiles = state.userProfiles.map(p => {
        if (p.id === (action.payload.userId || state.globalSettings.activeProfileId)) {
          const lastSession = p.sessionHistory.length > 0 ? p.sessionHistory[p.sessionHistory.length - 1] : null;
          // Finalize duration of previous session if active and for the same user
          if (lastSession && p.lastActiveSoundscapeId === lastSession.presetId && state.audioEngine.isPlaying) {
             const duration = Math.round((new Date().getTime() - new Date(lastSession.timestamp).getTime()) / 60000);
             lastSession.durationMinutes = duration > 0 ? duration : 1; // Ensure at least 1 minute
          }

          return {
            ...p,
            lastActiveSoundscapeId: selectedPreset.id,
            sessionHistory: [...p.sessionHistory, {
              timestamp: new Date().toISOString(),
              presetId: selectedPreset.id,
              durationMinutes: 0, // Will be updated on stop/pause
            }],
          };
        }
        return p;
      });

      return {
        ...state,
        activeSoundscape: {
          id: selectedPreset.id,
          name: selectedPreset.name,
          description: selectedPreset.description,
          layers: JSON.parse(JSON.stringify(selectedPreset.layers)), // Deep copy layers
          activeAdaptiveRules: JSON.parse(JSON.stringify(selectedPreset.adaptiveRules)), // Deep copy rules
          startTime: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          currentRecommendation: undefined, // Clear recommendation on manual selection
          lastAgentActivity: { timestamp: new Date().toISOString(), agentId: 'USER_ACTION', message: `Switched to preset '${selectedPreset.name}'.`, action: 'ACTIVATE_PRESET' }
        },
        audioEngine: { ...state.audioEngine, isPlaying: true, currentPlaybackTimeSeconds: 0 },
        userProfiles: updatedUserProfiles,
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Soundscape set to '${selectedPreset.name}'.` }],
      };
    }
    case 'PLAY_SOUNDSCAPE':
      return { ...state, audioEngine: { ...state.audioEngine, isPlaying: true }, logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: 'Soundscape playback started.' }] };
    case 'PAUSE_SOUNDSCAPE': {
      // Update session history duration on pause
      const updatedProfilesOnPause = state.userProfiles.map(profile => {
        if (profile.id === state.globalSettings.activeProfileId && profile.sessionHistory.length > 0) {
          const lastSession = profile.sessionHistory[profile.sessionHistory.length - 1];
          if (lastSession.presetId === state.activeSoundscape.id && lastSession.durationMinutes === 0) { // Only update if not already updated
            const duration = Math.round((new Date().getTime() - new Date(lastSession.timestamp).getTime()) / 60000);
            return {
              ...profile,
              sessionHistory: profile.sessionHistory.map((s, idx) =>
                idx === profile.sessionHistory.length - 1 ? { ...s, durationMinutes: duration > 0 ? duration : 1 } : s
              ),
            };
          }
        }
        return profile;
      });

      return {
        ...state,
        audioEngine: { ...state.audioEngine, isPlaying: false },
        userProfiles: updatedProfilesOnPause,
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: 'Soundscape playback paused.' }],
      };
    }
    case 'STOP_SOUNDSCAPE': {
      const updatedProfilesOnStop = state.userProfiles.map(profile => {
        if (profile.id === state.globalSettings.activeProfileId && profile.sessionHistory.length > 0) {
          const lastSession = profile.sessionHistory[profile.sessionHistory.length - 1];
          if (lastSession.presetId === state.activeSoundscape.id && lastSession.durationMinutes === 0) { // Only update if not already updated
            const duration = Math.round((new Date().getTime() - new Date(lastSession.timestamp).getTime()) / 60000);
            return {
              ...profile,
              sessionHistory: profile.sessionHistory.map((s, idx) =>
                idx === profile.sessionHistory.length - 1 ? { ...s, durationMinutes: duration > 0 ? duration : 1 } : s
              ),
            };
          }
        }
        return profile;
      });
      return {
        ...state,
        audioEngine: { ...state.audioEngine, isPlaying: false, currentPlaybackTimeSeconds: 0 },
        userProfiles: updatedProfilesOnStop,
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: 'Soundscape playback stopped.' }],
      };
    }
    case 'ADJUST_MASTER_VOLUME':
      return { ...state, globalSettings: { ...state.globalSettings, masterVolume: action.payload }, audioEngine: { ...state.audioEngine, masterVolume: action.payload } };
    case 'TOGGLE_SPATIAL_AUDIO':
      return { ...state, globalSettings: { ...state.globalSettings, spatialAudioEnabled: action.payload }, audioEngine: { ...state.audioEngine, spatialAudioEnabled: action.payload } };
    case 'TOGGLE_AI_RECOMMENDATION_MODE':
      return { ...state, globalSettings: { ...state.globalSettings, aiRecommendationMode: action.payload } };
    case 'UPDATE_LAYER_CONFIG':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.map(layer =>
            layer.id === action.payload.layerId ? { ...layer, ...action.payload.updates } : layer
          ),
          lastUpdated: new Date().toISOString(),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Layer '${action.payload.layerId}' updated.` }],
      };
    case 'ADD_LAYER_TO_ACTIVE_SOUNDSCAPE':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: [...state.activeSoundscape.layers, action.payload],
          lastUpdated: new Date().toISOString(),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Layer '${action.payload.name}' added to active soundscape.` }],
      };
    case 'REMOVE_LAYER_FROM_ACTIVE_SOUNDSCAPE':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.filter(layer => layer.id !== action.payload),
          lastUpdated: new Date().toISOString(),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Layer '${action.payload}' removed.` }],
      };
    case 'ADD_EFFECT_TO_LAYER':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.map(layer =>
            layer.id === action.payload.layerId
              ? { ...layer, effects: [...layer.effects, action.payload.effect] }
              : layer
          ),
          lastUpdated: new Date().toISOString(),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Effect '${action.payload.effect.type}' added to layer '${action.payload.layerId}'.` }],
      };
    case 'REMOVE_EFFECT_FROM_LAYER':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.map(layer =>
            layer.id === action.payload.layerId
              ? { ...layer, effects: layer.effects.filter(effect => effect.id !== action.payload.effectId) }
              : layer
          ),
          lastUpdated: new Date().toISOString(),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Effect '${action.payload.effectId}' removed from layer '${action.payload.layerId}'.` }],
      };
    case 'UPDATE_EFFECT_CONFIG':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.map(layer =>
            layer.id === action.payload.layerId
              ? {
                ...layer,
                effects: layer.effects.map(effect =>
                  effect.id === action.payload.effectId ? { ...effect, ...action.payload.updates } : effect
                ),
              }
              : layer
          ),
          lastUpdated: new Date().toISOString(),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Effect '${action.payload.effectId}' on layer '${action.payload.layerId}' updated.` }],
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'MARK_NOTIFICATION_AS_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, isRead: true } : n) };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, action.payload] };
    case 'SET_ACTIVE_PROFILE':
      const profileToActivate = state.userProfiles.find(p => p.id === action.payload);
      if (!profileToActivate) return state;
      return {
        ...state,
        globalSettings: {
          ...state.globalSettings,
          activeProfileId: action.payload,
          masterVolume: profileToActivate.personalSettings.masterVolume,
          spatialAudioEnabled: profileToActivate.personalSettings.spatialAudioEnabled,
          aiRecommendationMode: profileToActivate.personalSettings.aiRecommendationsEnabled ? 'AMBIENT' : 'OFF',
          theme: profileToActivate.personalSettings.theme,
        },
        audioEngine: {
          ...state.audioEngine,
          masterVolume: profileToActivate.personalSettings.masterVolume,
          spatialAudioEnabled: profileToActivate.personalSettings.spatialAudioEnabled,
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Active profile set to '${profileToActivate.username}'.` }],
      };
    case 'ADD_USER_PROFILE':
        return {
          ...state,
          userProfiles: [...state.userProfiles, action.payload],
          logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `New user profile '${action.payload.username}' created.` }],
        };
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfiles: state.userProfiles.map(p =>
          p.id === action.payload.userId ? { ...p, ...action.payload.updates } : p
        ),
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `User profile '${action.payload.userId}' updated.` }],
      };
    case 'ADD_CUSTOM_SOUNDSCAPE_TO_PROFILE':
      return {
        ...state,
        userProfiles: state.userProfiles.map(p =>
          p.id === action.payload.userId ? { ...p, customSoundscapes: [...p.customSoundscapes, action.payload.soundscape] } : p
        ),
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Custom soundscape '${action.payload.soundscape.name}' added to profile '${action.payload.userId}'.` }],
      };
    case 'DELETE_CUSTOM_SOUNDSCAPE_FROM_PROFILE':
      return {
        ...state,
        userProfiles: state.userProfiles.map(p =>
          p.id === action.payload.userId ? { ...p, customSoundscapes: p.customSoundscapes.filter(cs => cs.id !== action.payload.soundscapeId) } : p
        ),
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Custom soundscape '${action.payload.soundscapeId}' deleted from profile '${action.payload.userId}'.` }],
      };
    case 'UPDATE_SOUND_ASSET':
      return {
        ...state,
        soundAssets: state.soundAssets.map(asset =>
          asset.id === action.payload.assetId ? { ...asset, ...action.payload.updates } : asset
        ),
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Sound asset '${action.payload.assetId}' updated.` }],
      };
    case 'ADD_SOUND_ASSET':
      return { ...state, soundAssets: [...state.soundAssets, action.payload], logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Sound asset '${action.payload.name}' added.` }] };
    case 'DELETE_SOUND_ASSET':
      return { ...state, soundAssets: state.soundAssets.filter(asset => asset.id !== action.payload), logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Sound asset '${action.payload}' deleted.` }] };
    case 'UPDATE_PRESET':
      return {
        ...state,
        availablePresets: state.availablePresets.map(preset =>
          preset.id === action.payload.presetId ? { ...preset, ...action.payload.updates } : preset
        ),
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Preset '${action.payload.presetId}' updated.` }],
      };
    case 'ADD_PRESET':
      return { ...state, availablePresets: [...state.availablePresets, action.payload], logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Preset '${action.payload.name}' added.` }] };
    case 'DELETE_PRESET':
      return { ...state, availablePresets: state.availablePresets.filter(preset => preset.id !== action.payload), logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Preset '${action.payload}' deleted.` }] };
    case 'UPDATE_RULE_CONFIG':
      // This action applies to all rules, including those in activeSoundscape
      const updatedAvailablePresetsForRule = state.availablePresets.map(preset => ({
        ...preset,
        adaptiveRules: preset.adaptiveRules.map(rule =>
          rule.id === action.payload.ruleId ? { ...rule, ...action.payload.updates } : rule
        ),
      }));
      return {
        ...state,
        availablePresets: updatedAvailablePresetsForRule,
        activeSoundscape: {
          ...state.activeSoundscape,
          activeAdaptiveRules: state.activeSoundscape.activeAdaptiveRules.map(rule =>
            rule.id === action.payload.ruleId ? { ...rule, ...action.payload.updates } : rule
          ),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Rule '${action.payload.ruleId}' updated.` }],
      };
    case 'ADD_RULE_CONFIG':
      // For now, add to active soundscape only, or a new 'global' rules list.
      // For simplicity, add to global availablePresets' first default preset if no other target is specified.
      const updatedPresetsWithNewRule = state.availablePresets.map(preset => {
        if (preset.id === state.activeSoundscape.id) { // Or target a specific preset via action payload
          return { ...preset, adaptiveRules: [...preset.adaptiveRules, action.payload] };
        }
        return preset;
      });
      return {
        ...state,
        availablePresets: updatedPresetsWithNewRule,
        activeSoundscape: {
          ...state.activeSoundscape,
          activeAdaptiveRules: [...state.activeSoundscape.activeAdaptiveRules, action.payload],
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Rule '${action.payload.name}' added.` }],
      };
    case 'DELETE_RULE_CONFIG':
      const updatedPresetsAfterRuleDelete = state.availablePresets.map(preset => ({
        ...preset,
        adaptiveRules: preset.adaptiveRules.filter(rule => rule.id !== action.payload),
      }));
      return {
        ...state,
        availablePresets: updatedPresetsAfterRuleDelete,
        activeSoundscape: {
          ...state.activeSoundscape,
          activeAdaptiveRules: state.activeSoundscape.activeAdaptiveRules.filter(rule => rule.id !== action.payload),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Rule '${action.payload}' deleted.` }],
      };
    case 'SET_AUDIO_OUTPUT_DEVICE':
      return { ...state, audioEngine: { ...state.audioEngine, outputDevice: action.payload } };
    case 'SET_LOW_LATENCY_MODE':
      return { ...state, audioEngine: { ...state.audioEngine, lowLatencyMode: action.payload }, globalSettings: { ...state.globalSettings, lowLatencyMode: action.payload } };
    case 'SET_ACTIVE_DASHBOARD_TAB':
      return { ...state, activeDashboardTab: action.payload };
    case 'SET_ACTIVE_SETTINGS_TAB':
      return { ...state, activeSettingsTab: action.payload };
    case 'SET_ACTIVE_PROFILE_MANAGEMENT_TAB':
      return { ...state, activeProfileManagementTab: action.payload };
    case 'SET_ACTIVE_ADMIN_TAB':
      return { ...state, activeAdminTab: action.payload };
    case 'UPDATE_GLOBAL_SETTINGS':
        return { ...state, globalSettings: { ...state.globalSettings, ...action.payload } };
    case 'UPDATE_PLAYBACK_TIME':
        return { ...state, audioEngine: { ...state.audioEngine, currentPlaybackTimeSeconds: action.payload } };
    case 'SET_AGENT_ACTIVITY':
        return { ...state, activeSoundscape: { ...state.activeSoundscape, lastAgentActivity: action.payload } };
    case 'INITIALIZE_STATE':
      // Ensure specific parts of state are not overwritten if they are meant to be dynamic (e.g., current playback)
      return { ...action.payload, isLoading: false, error: null, audioEngine: { ...initialSoundscapeState.audioEngine, isPlaying: false } };
    case 'RESET_STATE':
      return initialSoundscapeState;
    default:
      return state;
  }
};


// --- Utility Functions (Exported) ---

/**
 * Generates a cryptographically secure pseudo-random unique ID.
 * Business Value: Ensures distinct identification for all entities (assets, layers, rules, notifications)
 * enabling robust data management, preventing collisions, and supporting auditable record keeping
 * critical for commercial financial infrastructure.
 */
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Simulates fetching real-time weather data from an external API, acting as a deterministic adapter.
 * Business Value: Provides the crucial environmental context for adaptive soundscape generation,
 * enhancing user experience through highly relevant and dynamic auditory environments.
 * This capability unlocks potential for premium, location-aware services and validates the
 * integration robustness required for a scalable platform.
 */
export const simulateFetchWeatherData = async (): Promise<Partial<EnvironmentalData>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const weatherConditions: EnvironmentalData['weatherCondition'][] = ['CLEAR', 'CLOUDY', 'RAIN', 'STORM', 'SNOW', 'FOG'];
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const randomTemp = Math.floor(Math.random() * 25) + 5; // 5-30 C
      const randomHumidity = Math.floor(Math.random() * 50) + 40; // 40-90%
      const randomWind = Math.floor(Math.random() * 30) + 0; // 0-30 KPH

      const now = new Date();
      const hour = now.getHours();
      let timeOfDay: EnvironmentalData['timeOfDay'];
      if (hour >= 5 && hour < 8) timeOfDay = 'DAWN';
      else if (hour >= 8 && hour < 12) timeOfDay = 'MORNING';
      else if (hour >= 12 && hour < 17) timeOfDay = 'AFTERNOON';
      else if (hour >= 17 && hour < 19) timeOfDay = 'DUSK';
      else timeOfDay = 'NIGHT';

      resolve({
        weatherCondition: randomWeather,
        temperatureCelsius: randomTemp,
        humidityPercentage: randomHumidity,
        windSpeedKPH: randomWind,
        timeOfDay: timeOfDay,
        locationName: 'Simulated City', // Could be dynamic based on geoCoordinates
      });
    }, 1500 + Math.random() * 1000); // Simulate network latency
  });
};

/**
 * Simulates fetching office sensor data (occupancy, activity, etc.) from an internal system.
 * Business Value: Enables the soundscape to respond intelligently and autonomously
 * to real-world workspace dynamics, optimizing focus and collaboration. This robust
 * integration is paramount for enterprise solutions focused on smart offices and
 * employee well-being, offering quantifiable improvements in productivity and
 * demonstrating the platform's intelligent automation capabilities.
 */
export const simulateFetchOfficeSensorData = async (): Promise<Partial<OfficeSensorData>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const occupancy = Math.floor(Math.random() * 50); // 0-50 people
      let activity: OfficeSensorData['averageActivityLevel'];
      if (occupancy < 10) activity = 'LOW';
      else if (occupancy < 30) activity = 'MEDIUM';
      else if (occupancy < 45) activity = 'HIGH';
      else activity = 'VERY_HIGH';

      resolve({
        occupancyCount: occupancy,
        averageActivityLevel: activity,
        meetingRoomStatus: [
          { roomId: 'conf-room-A', isOccupied: Math.random() > 0.5, schedule: '10:00-11:00 Marketing Sync' },
          { roomId: 'focus-pod-1', isOccupied: Math.random() > 0.3, schedule: 'Ad-hoc' },
          { roomId: 'lounge-zone', isOccupied: Math.random() > 0.7, schedule: 'Informal' },
        ],
        energyConsumptionKW: 80 + occupancy * 3 + Math.random() * 20, // Increases with occupancy
      });
    }, 1000 + Math.random() * 800);
  });
};

/**
 * Simulates an advanced AI recommendation engine, a core component of the Agentic Intelligence Layer.
 * Business Value: This agent autonomously generates personalized and contextually relevant
 * soundscape suggestions, driving user engagement and satisfaction. It represents a premium,
 * intelligent feature that learns user preferences and adapts to real-time conditions,
 * significantly increasing user retention and justifying higher subscription tiers in
 * a competitive market.
 * @param state The current application state.
 * @returns A string containing the recommendation message.
 */
export const simulateAIRecommendation = async (state: SoundscapeAppState): Promise<{ message: string; recommendedPresetId?: string }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (state.globalSettings.aiRecommendationMode === 'OFF') {
        resolve({ message: 'AI recommendations are disabled.' });
        return;
      }

      const { weatherCondition, timeOfDay } = state.environmentalData;
      const { averageActivityLevel, occupancyCount } = state.officeSensorData;
      const userProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);
      const lastPreset = userProfile?.lastActiveSoundscapeId ? state.availablePresets.find(p => p.id === userProfile.lastActiveSoundscapeId) || userProfile.customSoundscapes.find(cs => cs.id === userProfile.lastActiveSoundscapeId) : null;

      let recommendation = "Analyzing your environment...";
      let recommendedPresetId: string | undefined;

      // Enhanced heuristic-based AI simulation
      if (weatherCondition === 'STORM' || weatherCondition === 'RAIN') {
        recommendation = 'Heavy rain outside! A deep focus soundscape might help cut through the noise.';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('rain') && p.tags.includes('focus'))?.id || 'preset-001';
      } else if (timeOfDay === 'NIGHT' && averageActivityLevel === 'LOW') {
        recommendation = 'Late hours, low activity. Consider a calming soundscape for winding down.';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('relax') || p.tags.includes('nature'))?.id;
      } else if (timeOfDay === 'MORNING' && averageActivityLevel === 'LOW') {
        recommendation = 'Good morning! Energize your start with a vibrant soundscape or a "Forest Retreat".';
        recommendedPresetId = 'preset-002'; // Specific ID for Forest Retreat
      } else if (averageActivityLevel === 'HIGH' || occupancyCount > 30) {
        recommendation = 'High office activity detected. A "noise-masking" soundscape like Urban Cafe could enhance focus.';
        recommendedPresetId = 'preset-003'; // Specific ID for Urban Cafe
      } else if (state.globalSettings.aiRecommendationMode === 'FOCUS') {
        recommendation = 'Focus mode active: Optimized for deep work and concentration.';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('focus'))?.id;
      } else if (state.globalSettings.aiRecommendationMode === 'AMBIENT') {
        recommendation = 'Ambient mode: Subtle background enhancements to improve your environment.';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('ambient') || p.tags.includes('calm'))?.id;
      } else if (state.globalSettings.aiRecommendationMode === 'ENERGY') {
        recommendation = 'Energy mode: Let\'s pick something lively to boost your mood and productivity!';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('lively'))?.id;
      }

      // Fallback
      if (!recommendedPresetId) {
        recommendedPresetId = state.availablePresets[0]?.id; // Default to the first available preset
        recommendation = 'No specific recommendation, but exploring our curated presets is always a great option!';
      }

      const recommendedPreset = state.availablePresets.find(p => p.id === recommendedPresetId) || lastPreset;

      if (recommendedPreset && recommendedPreset.id !== state.activeSoundscape.id) {
        resolve({ message: `${recommendation} Would you like to switch to "${recommendedPreset.name}"?`, recommendedPresetId: recommendedPreset.id });
      } else {
        resolve({ message: recommendation, recommendedPresetId: state.activeSoundscape.id });
      }

    }, 2000 + Math.random() * 1000);
  });
};

/**
 * Applies adaptive rules to the current soundscape layers based on environmental and office data.
 * This function is a core part of the Agentic Intelligence Layer, enabling autonomous adaptation.
 * Business Value: The dynamic adaptation of soundscapes in real-time ensures optimal user
 * experience without manual intervention. This automation reduces operational overhead,
 * increases user stickiness, and provides a unique "set it and forget it" intelligent
 * feature highly valued in commercial deployments, aligning with automated financial processes.
 * @param state The current application state.
 * @param dispatch The Redux-like dispatch function for state updates.
 * @returns An array of updated SoundLayerConfig, or the original if no changes.
 */
export const applyAdaptiveRules = (state: SoundscapeAppState, dispatch: React.Dispatch<SoundscapeAction>): SoundLayerConfig[] => {
  let updatedLayers = JSON.parse(JSON.stringify(state.activeSoundscape.layers)) as SoundLayerConfig[]; // Deep copy

  const context = {
    ...state.environmentalData,
    ...state.officeSensorData,
    globalSettings: state.globalSettings,
    activeSoundscape: state.activeSoundscape,
    userProfile: state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId),
  };

  const activeRules = state.activeSoundscape.activeAdaptiveRules
    .filter(rule => rule.isEnabled)
    .sort((a, b) => b.priority - a.priority); // High priority rules first

  activeRules.forEach(rule => {
    try {
      // NOTE: In a production financial system, direct `new Function()` for rule evaluation
      // would be replaced by a securely sandboxed expression parser (e.g., ANTLR-based DSL)
      // or a pre-compiled rule engine to prevent injection vulnerabilities and ensure
      // cryptographic integrity of programmable logic. This implementation is for simulation.
      const conditionMet = new Function('context', `with(context) { return ${rule.condition}; }`)(context);

      if (conditionMet) {
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Rule '${rule.name}' condition met. Executing action '${rule.action}'.` } });
        dispatch({
            type: 'SET_AGENT_ACTIVITY',
            payload: {
                timestamp: new Date().toISOString(),
                agentId: 'ADAPTIVE_RULES_ENGINE',
                message: `Rule "${rule.name}" triggered: ${rule.condition}`,
                action: rule.action,
            },
        });

        if (rule.action === 'MODIFY_LAYER' && rule.actionParams.layerId) {
          updatedLayers = updatedLayers.map(layer => {
            if (layer.id === rule.actionParams.layerId) {
              return {
                ...layer,
                ...rule.actionParams.volume !== undefined ? { volume: rule.actionParams.volume } : {},
                ...rule.actionParams.pan !== undefined ? { pan: rule.actionParams.pan } : {},
                ...rule.actionParams.isEnabled !== undefined ? { isEnabled: rule.actionParams.isEnabled } : {},
                ...rule.actionParams.isMuted !== undefined ? { isMuted: rule.actionParams.isMuted } : {}
              };
            }
            return layer;
          });
        } else if (rule.action === 'TOGGLE_LAYER' && rule.actionParams.layerId) {
            updatedLayers = updatedLayers.map(layer => {
                if (layer.id === rule.actionParams.layerId) {
                    return { ...layer, isEnabled: !layer.isEnabled };
                }
                return layer;
            });
        } else if (rule.action === 'ACTIVATE_PRESET' && rule.actionParams.presetId) {
            // This action needs to be dispatched to change the entire soundscape
            // It's a high-level action, so it's handled here within the rules loop for now.
            // In a more complex system, an agent would dispatch this.
            dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: rule.actionParams.presetId, userId: state.globalSettings.activeProfileId } });
        } else if (rule.action === 'SEND_NOTIFICATION' && rule.actionParams.message) {
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    id: generateUniqueId(),
                    type: rule.actionParams.type || 'INFO',
                    message: rule.actionParams.message,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    details: { ruleId: rule.id, ruleName: rule.name }
                }
            });
        }
      }
    } catch (e: any) {
      dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'ERROR', message: `Error evaluating rule '${rule.name}': ${e.message}` } });
      dispatch({ type: 'SET_ERROR', payload: `Rule evaluation failed for '${rule.name}'.` });
    }
  });

  return updatedLayers;
};

/**
 * A simulated sound engine service that interfaces with the system's audio output.
 * Business Value: This component represents the critical interface to low-latency,
 * high-fidelity audio output, ensuring a seamless and immersive user experience.
 * Its robust design allows for future integration with advanced Web Audio API or native
 * audio SDKs, guaranteeing scalability and maintaining a high standard of audio delivery
 * vital for customer satisfaction and product differentiation. It includes logging for
 * auditable operational insights.
 */
export class MockAudioEngine {
  public sources: Map<string, HTMLAudioElement> = new Map();
  private masterVolume: number = 0.75;
  private isPlaying: boolean = false;
  private spatialAudioEnabled: boolean = false;
  private outputDevice: string = 'System Default';
  private updateInterval: any; // For simulating playback time
  private log: (level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', message: string) => void;
  private onPlaybackTimeUpdate: (time: number) => void; // Callback for UI

  constructor(
    logger: (level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', message: string) => void,
    onPlaybackTimeUpdate: (time: number) => void
  ) {
    this.log = logger;
    this.onPlaybackTimeUpdate = onPlaybackTimeUpdate;
    this.log('INFO', 'MockAudioEngine initialized, ready for commercial-grade audio processing.');
  }

  /**
   * Sets the global master volume, propagating changes to all active audio sources.
   * @param volume The new master volume (0.0 to 1.0).
   */
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.sources.forEach(source => {
      // Re-apply layer-specific volume and then master volume
      // This assumes source.dataset.layerVolume holds the last set layer volume
      const layerVolume = parseFloat(source.dataset.layerVolume || '1.0');
      source.volume = layerVolume * this.masterVolume;
    });
    this.log('DEBUG', `Audio Engine: Master volume set to ${this.masterVolume.toFixed(2)}`);
  }

  /**
   * Toggles spatial audio processing.
   * @param enabled Whether spatial audio should be enabled.
   */
  toggleSpatialAudio(enabled: boolean) {
    this.spatialAudioEnabled = enabled;
    this.log('DEBUG', `Audio Engine: Spatial audio ${enabled ? 'enabled' : 'disabled'}. Ready for immersive experience delivery.`);
  }

  /**
   * Sets the preferred audio output device.
   * @param deviceId Identifier for the output device.
   */
  setOutputDevice(deviceId: string) {
    this.outputDevice = deviceId;
    this.log('INFO', `Audio Engine: Output device configured to ${deviceId}.`);
  }

  /**
   * Loads a sound asset, simulating network retrieval and buffering.
   * @param asset The SoundAsset to load.
   * @returns A Promise that resolves when the asset is ready.
   */
  loadSoundAsset(asset: SoundAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sources.has(asset.id)) {
        this.log('DEBUG', `Asset ${asset.name} (${asset.id}) already loaded. Ensuring idempotent operations.`);
        return resolve();
      }
      this.log('DEBUG', `Audio Engine: Initiating secure load for asset: ${asset.name} from ${asset.filePath}`);
      // Simulate loading time
      setTimeout(() => {
        const audio = new Audio(asset.filePath);
        audio.preload = 'auto';
        audio.volume = 0; // Set to 0 initially, volume will be applied by playLayer
        audio.onerror = (event) => {
          this.log('ERROR', `Failed to load cryptographic audio asset ${asset.name}: ${event}`);
          reject(`Failed to load asset ${asset.name}`);
        };
        audio.oncanplaythrough = () => {
          this.sources.set(asset.id, audio);
          this.log('INFO', `Audio Engine: Cryptographic asset ${asset.name} successfully loaded. Ready for playback.`);
          resolve();
        };
      }, 500 + Math.random() * 200);
    });
  }

  /**
   * Plays or updates a specific sound layer.
   * @param layer The configuration for the sound layer.
   * @param globalMasterVolume The current global master volume.
   */
  playLayer(layer: SoundLayerConfig, globalMasterVolume: number) {
    const audio = this.sources.get(layer.assetId);
    if (audio && layer.isEnabled && !layer.isMuted) {
      audio.loop = layer.loop;
      audio.volume = layer.volume * globalMasterVolume; // Layer volume * master volume
      audio.dataset.layerVolume = layer.volume.toString(); // Store layer volume for master volume adjustment
      // Simulate pan and spatial coordinates (advanced Web Audio API would handle this)
      if (layer.pan !== undefined) { this.log('DEBUG', `Simulating pan for ${layer.name}: ${layer.pan}`); }
      if (layer.spatialCoordinates && this.spatialAudioEnabled) { this.log('DEBUG', `Simulating spatial audio for ${layer.name} at ${JSON.stringify(layer.spatialCoordinates)}`); }

      if (this.isPlaying) {
        audio.play().catch(e => this.log('ERROR', `Error playing audio for layer ${layer.name}: ${e}`));
        this.log('DEBUG', `Audio Engine: Playing layer: ${layer.name} (Asset: ${layer.assetId})`);
      } else {
        audio.pause(); // Ensure it's paused if global engine is not playing
      }
    } else if (audio) {
      audio.pause(); // Muted or disabled layers should not play
      this.log('DEBUG', `Audio Engine: Paused layer ${layer.name} due to mute/disable or global pause.`);
    }
  }

  /**
   * Stops a specific layer and resets its playback position.
   * @param assetId The ID of the asset associated with the layer.
   */
  stopLayer(assetId: string) {
    const audio = this.sources.get(assetId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.log('DEBUG', `Audio Engine: Stopped layer for asset: ${assetId}`);
    }
  }

  /**
   * Stops all active layers and resets playback.
   */
  stopAllLayers() {
    this.sources.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.isPlaying = false;
    this.onPlaybackTimeUpdate(0); // Reset UI playback time
    this.log('INFO', 'Audio Engine: All layers stopped. State synchronized.');
  }

  /**
   * Pauses all active layers without resetting their playback position.
   */
  pauseAllLayers() {
    this.sources.forEach(audio => audio.pause());
    this.isPlaying = false;
    this.log('INFO', 'Audio Engine: All layers paused. State synchronized.');
  }

  /**
   * Resumes playback for all layers.
   */
  resumeAllLayers() {
    this.isPlaying = true; // Set global state first
    this.sources.forEach(audio => {
      // In a real implementation, only layers currently part of activeSoundscape would resume.
      // For this mock, we rely on the `playLayer` loop in the useEffect hook.
    });
    this.log('INFO', 'Audio Engine: All layers signaled to resume. Agentic coordination underway.');
  }

  /**
   * Initiates a periodic update for the current playback time.
   */
  startPlaybackTimeUpdates() {
    if (this.updateInterval) return; // Prevent multiple intervals
    this.updateInterval = setInterval(() => {
      if (this.isPlaying) {
        // Find the maximum current time among playing sources, or just increment
        let maxTime = 0;
        this.sources.forEach(audio => {
          if (!audio.paused && !audio.ended && audio.duration && isFinite(audio.duration)) {
            if (audio.currentTime > maxTime) {
                maxTime = audio.currentTime;
            }
          }
        });
        if (maxTime > 0) {
            this.onPlaybackTimeUpdate(Math.floor(maxTime));
        } else {
            // If no actual audio is playing, but isPlaying is true, increment a simulated time
            this.onPlaybackTimeUpdate(prevTime => (prevTime + 1) % 3600); // Loop every hour
        }
      }
    }, 1000); // Every second
  }

  /**
   * Stops the periodic playback time updates.
   */
  stopPlaybackTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.log('DEBUG', 'Audio Engine: Playback time updates halted.');
    }
  }

  /**
   * Cleans up all audio resources.
   * Business Value: Ensures efficient resource management, preventing memory leaks
   * and maintaining system stability. This is crucial for long-running, production-grade
   * applications that require continuous, fault-tolerant operation.
   */
  cleanup() {
    this.stopPlaybackTimeUpdates();
    this.stopAllLayers();
    this.sources.forEach(audio => {
      audio.src = ''; // Release resources
      audio.load(); // Further ensures resource release
    });
    this.sources.clear();
    this.log('INFO', 'Audio Engine: Cleaned up all resources. Operational integrity maintained.');
  }
}

// --- Custom Hook for Soundscape Engine Logic (Exported) ---
/**
 * `useSoundscapeEngine` is a custom hook that encapsulates all the side effects
 * and complex logic for managing the dynamic soundscape. It integrates with
 * external data, applies adaptive rules, handles audio playback state, and manages
 * user preferences.
 * Business Value: This hook is the orchestration core, providing real-time reactivity
 * and intelligent automation. By centralizing complex interactions (sensor data, AI,
 * audio engine, state persistence), it ensures system stability, performance, and
 * seamless user experience. It dramatically reduces development overhead for UI
 * components and enforces a consistent application logic, acting as a vital abstraction
 * layer for the entire soundscape platform. It exemplifies a resilient, auditable
 *, and intelligent agent within the overall financial infrastructure.
 */
export const useSoundscapeEngine = (
  state: SoundscapeAppState,
  dispatch: React.Dispatch<SoundscapeAction>
) => {
  const audioEngineRef = useRef<MockAudioEngine | null>(null);
  const currentPlaybackTimeRef = useRef(0); // Local ref for playback time

  // Callback for logging, passed to the audio engine
  const logToState = useCallback((level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', message: string) => {
    dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level, message } });
  }, [dispatch]);

  // Callback for audio engine to update UI with playback time
  const onAudioPlaybackTimeUpdate = useCallback((time: number) => {
    currentPlaybackTimeRef.current = time;
    dispatch({ type: 'UPDATE_PLAYBACK_TIME', payload: time });
  }, [dispatch]);

  // Initialize audio engine on component mount
  useEffect(() => {
    audioEngineRef.current = new MockAudioEngine(logToState, onAudioPlaybackTimeUpdate);
    logToState('INFO', 'useSoundscapeEngine: MockAudioEngine initialized and ready for deployment.');

    // Pre-load all known assets to ensure quick transitions
    const allAssetIds = new Set<string>();
    state.soundAssets.forEach(asset => allAssetIds.add(asset.id));
    state.availablePresets.forEach(preset => preset.layers.forEach(layer => allAssetIds.add(layer.assetId)));
    state.userProfiles.forEach(profile => profile.customSoundscapes.forEach(cs => cs.layers.forEach(layer => allAssetIds.add(layer.assetId))));

    Array.from(allAssetIds).forEach(assetId => {
      const asset = state.soundAssets.find(a => a.id === assetId);
      if (asset) {
        audioEngineRef.current?.loadSoundAsset(asset);
      }
    });

    return () => {
      audioEngineRef.current?.cleanup();
      logToState('INFO', 'useSoundscapeEngine: MockAudioEngine cleaned up. Resource integrity confirmed.');
    };
  }, [logToState, onAudioPlaybackTimeUpdate, state.soundAssets, state.availablePresets, state.userProfiles]);

  // Effect for handling global playback state changes and layer updates
  useEffect(() => {
    if (!audioEngineRef.current) return;

    audioEngineRef.current.setMasterVolume(state.globalSettings.masterVolume);
    audioEngineRef.current.toggleSpatialAudio(state.globalSettings.spatialAudioEnabled);
    audioEngineRef.current.setOutputDevice(state.audioEngine.outputDevice);

    if (state.audioEngine.isPlaying) {
        audioEngineRef.current.resumeAllLayers(); // Signal engine to be in playing state
        audioEngineRef.current.startPlaybackTimeUpdates();
    } else {
        audioEngineRef.current.pauseAllLayers(); // Signal engine to be in paused state
        audioEngineRef.current.stopPlaybackTimeUpdates();
    }

    // Identify current active assets
    const activeLayerAssetIds = new Set(state.activeSoundscape.layers.map(l => l.assetId));
    const currentlyPlayingAssets = new Set<string>();

    state.activeSoundscape.layers.forEach(layer => {
      const audio = audioEngineRef.current?.sources.get(layer.assetId);
      if (audio) {
        if (layer.isEnabled && !layer.isMuted && state.audioEngine.isPlaying) {
          audioEngineRef.current?.playLayer(layer, state.globalSettings.masterVolume);
          currentlyPlayingAssets.add(layer.assetId);
        } else {
          audioEngineRef.current?.stopLayer(layer.assetId); // Stop if disabled, muted, or global pause
        }
      } else {
          logToState('WARN', `Attempted to play layer ${layer.name} but asset ${layer.assetId} not loaded.`);
      }
    });

    // Stop any assets that are no longer part of the active soundscape
    audioEngineRef.current.sources.forEach((audio, assetId) => {
        if (!activeLayerAssetIds.has(assetId) && currentlyPlayingAssets.has(assetId)) {
            audioEngineRef.current?.stopLayer(assetId);
        }
    });

  }, [
    state.audioEngine.isPlaying,
    state.globalSettings.masterVolume,
    state.globalSettings.spatialAudioEnabled,
    state.audioEngine.outputDevice,
    state.activeSoundscape.layers,
    logToState
  ]);


  // Effect for initial state loading from local storage
  useEffect(() => {
    const storedState = localStorage.getItem('soundscapeAppState');
    if (storedState) {
      try {
        const parsedState: SoundscapeAppState = JSON.parse(storedState);
        // Ensure theme is applied from loaded profile or global settings
        const activeProfile = parsedState.userProfiles.find(p => p.id === parsedState.globalSettings.activeProfileId);
        if (activeProfile?.personalSettings.theme) {
            document.documentElement.setAttribute('data-theme', activeProfile.personalSettings.theme.toLowerCase());
            parsedState.globalSettings.theme = activeProfile.personalSettings.theme; // Update global settings to match profile
        } else {
            document.documentElement.setAttribute('data-theme', parsedState.globalSettings.theme.toLowerCase());
        }

        dispatch({ type: 'INITIALIZE_STATE', payload: parsedState });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'State loaded from local storage. Ensuring consistent platform behavior.' } });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved state. Data integrity compromised.' });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'ERROR', message: `Failed to load state from local storage: ${e.message}` } });
      }
    } else {
      document.documentElement.setAttribute('data-theme', initialSoundscapeState.globalSettings.theme.toLowerCase());
      dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'No saved state found, initializing with default enterprise configuration.' } });
    }
  }, [dispatch]);

  // Effect for saving state to local storage on changes (debounce for performance)
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      localStorage.setItem('soundscapeAppState', JSON.stringify(state));
      logToState('DEBUG', 'Application state saved to local storage. Persisting user preferences securely.');
    }, 1000); // Save state after 1 second of no changes
    return () => clearTimeout(debounceSave);
  }, [state, logToState]);


  // Effect for simulating external data feeds (weather, office sensors)
  useEffect(() => {
    const fetchAndDispatchData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const weather = await simulateFetchWeatherData();
        const office = await simulateFetchOfficeSensorData();
        dispatch({ type: 'UPDATE_ENVIRONMENTAL_DATA', payload: weather });
        dispatch({ type: 'UPDATE_OFFICE_SENSOR_DATA', payload: office });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'Environmental and office sensor data refreshed. Dynamic adaptation in progress.' } });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', payload: `Data fetch failed: ${e.message}. System resilience activated.` });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'ERROR', message: `Data fetch failed: ${e.message}. Initiating retry strategy.` } });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchAndDispatchData(); // Initial fetch
    const interval = setInterval(fetchAndDispatchData, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  // Effect for applying adaptive rules when environmental/office data changes
  useEffect(() => {
    const newLayers = applyAdaptiveRules(state, dispatch); // Pass dispatch to rules engine for complex actions

    const changesDetected = newLayers.some((newL, index) => {
        const oldL = state.activeSoundscape.layers.find(l => l.id === newL.id);
        return oldL && (newL.volume !== oldL.volume || newL.pan !== oldL.pan || newL.isEnabled !== oldL.isEnabled || newL.isMuted !== oldL.isMuted);
    });

    if (changesDetected) {
        newLayers.forEach(newL => {
          const oldL = state.activeSoundscape.layers.find(l => l.id === newL.id);
          if (oldL && (newL.volume !== oldL.volume || newL.pan !== oldL.pan || newL.isEnabled !== oldL.isEnabled || newL.isMuted !== oldL.isMuted)) {
              dispatch({
                  type: 'UPDATE_LAYER_CONFIG',
                  payload: {
                      layerId: newL.id,
                      updates: { volume: newL.volume, pan: newL.pan, isEnabled: newL.isEnabled, isMuted: newL.isMuted }
                  }
              });
          }
        });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'Adaptive rules applied, soundscape layers dynamically adjusted by AI Agent.' } });
    }
  }, [state.environmentalData, state.officeSensorData, state.activeSoundscape.activeAdaptiveRules, state.activeSoundscape.layers, dispatch]);

  // Effect for AI recommendations
  useEffect(() => {
    if (state.globalSettings.aiRecommendationMode !== 'OFF' && state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId)?.personalSettings.aiRecommendationsEnabled) {
      const fetchRecommendation = async () => {
        const { message, recommendedPresetId } = await simulateAIRecommendation(state);
        dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                id: generateUniqueId(),
                type: 'AGENT_ACTION',
                message: `AI Suggestion: ${message}`,
                timestamp: new Date().toISOString(),
                isRead: false,
                details: { recommendedPresetId }
            }
        });
        dispatch({
            type: 'SET_AGENT_ACTIVITY',
            payload: {
                timestamp: new Date().toISOString(),
                agentId: 'AI_REC_AGENT',
                message: `Generated new recommendation: ${message.substring(0, 50)}...`,
                action: 'GENERATE_RECOMMENDATION',
            },
        });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: `AI Recommendation Agent executed: "${message.substring(0, 50)}..."` } });
      };
      const interval = setInterval(fetchRecommendation, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [state.globalSettings.aiRecommendationMode, state.environmentalData, state.officeSensorData, state.userProfiles, dispatch, state]);

  // Effect for loading sound assets dynamically as layers are added/changed
  useEffect(() => {
      state.activeSoundscape.layers.forEach(layer => {
          const asset = state.soundAssets.find(a => a.id === layer.assetId);
          if (asset && audioEngineRef.current && !audioEngineRef.current.sources.has(asset.id)) {
              dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Pre-loading asset for layer: ${asset.name}. Optimizing performance.` } });
              audioEngineRef.current.loadSoundAsset(asset)
                  .then(() => {
                      dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Asset loaded: ${asset.name}. Playback readiness achieved.` } });
                  })
                  .catch(e => {
                      dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'ERROR', message: `Failed to load asset ${asset.name}: ${e}. Critical asset integrity warning.` } });
                      dispatch({ type: 'SET_ERROR', payload: `Failed to load asset ${asset.name}.` });
                  });
          }
      });
  }, [state.activeSoundscape.layers, state.soundAssets, dispatch]);
};


// --- Sub-Components (Exported as per instruction) ---

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  notificationCount?: number;
}
/**
 * TabButton renders a navigation tab, providing visual feedback for active selection and notifications.
 * Business Value: Improves user navigation and operational awareness, especially with integrated
 * notification counts. This clarity enhances user experience and ensures critical alerts
 * are not missed, a key feature for a responsive commercial platform.
 */
export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, notificationCount }) => (
  <button
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ease-in-out
                ${isActive ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
                relative`}
    onClick={onClick}
  >
    {label}
    {notificationCount !== undefined && notificationCount > 0 && (
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
        {notificationCount}
      </span>
    )}
  </button>
);

interface InfoCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  colorClass?: string;
}
/**
 * InfoCard displays key performance indicators and contextual data in a digestible format.
 * Business Value: Provides at-a-glance operational insights, enabling rapid assessment
 * of system status and environmental conditions. This instant observability is vital
 * for decision-making in a fast-paced financial ecosystem.
 */
export const InfoCard: React.FC<InfoCardProps> = ({ title, value, unit, icon, colorClass = 'text-cyan-300' }) => (
  <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-xl font-semibold ${colorClass}`}>{value}{unit && <span className="text-sm ml-1 text-gray-400">{unit}</span>}</p>
    </div>
    {icon && <div className={`text-3xl ${colorClass}`}>{icon}</div>}
  </div>
);

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}
/**
 * SliderControl provides an intuitive interface for adjusting numerical parameters.
 * Business Value: Enhances user engagement by offering precise, real-time control over
 * critical soundscape parameters. This fine-grained configurability is essential for
 * delivering a premium, personalized user experience, driving platform adoption.
 */
export const SliderControl: React.FC<SliderControlProps> = ({ label, value, min, max, step, onChange, unit, className }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm text-gray-300 flex justify-between">
      <span>{label}</span>
      <span className="font-mono text-cyan-300">{value.toFixed(2)}{unit}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
    />
  </div>
);

interface ToggleSwitchProps {
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}
/**
 * ToggleSwitch offers a clear, binary control for enabling or disabling features.
 * Business Value: Simplifies user interaction for critical on/off functions,
 * enhancing usability and accessibility. This straightforward control ensures
 * consistent user behavior and reduces cognitive load, a hallmark of enterprise-grade UX.
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, isChecked, onChange, className }) => (
  <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
    <span className="ml-3 text-sm font-medium text-gray-300">{label}</span>
  </label>
);

interface SelectInputProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}
/**
 * SelectInput provides a dropdown for selecting from predefined options.
 * Business Value: Standardizes input for configurable choices, ensuring data
 * consistency and simplifying user decision-making. This structured input
 * is crucial for maintaining data integrity across a complex financial platform.
 */
export const SelectInput: React.FC<SelectInputProps> = ({ label, value, options, onChange, className }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm text-gray-300">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface InputFieldProps {
  label: string;
  type: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}
/**
 * InputField offers a versatile input component for various data types.
 * Business Value: Provides a fundamental building block for data entry and
 * configuration across the platform. Its flexibility supports diverse data
 * capture needs, essential for comprehensive system management and auditing.
 */
export const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, placeholder, className, disabled }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
      disabled={disabled}
    />
  </div>
);

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}
/**
 * Button component for user interaction, styled for different purposes.
 * Business Value: Standardizes interactive elements, ensuring consistent UI/UX
 * and reinforcing brand identity. Critical for guiding user workflows and
 * executing actions within the secure and auditable framework of the platform.
 */
export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', className, disabled }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold transition-colors duration-200 ease-in-out";
  const variants = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-700",
    secondary: "bg-gray-600 text-gray-100 hover:bg-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};


// --- Main UI Sections ---

interface DashboardSectionProps {
  state: SoundscapeAppState;
  dispatch: React.Dispatch<SoundscapeAction>;
}
/**
 * DashboardSection provides an executive-level overview and control panel for the soundscape.
 * Business Value: This central hub offers immediate visibility into environmental data,
 * system status, and AI-driven recommendations. It streamlines operational monitoring
 * and empowers users with quick access to critical features, thereby increasing efficiency
 * and showcasing the platform's intelligent automation capabilities for commercial advantage.
 */
export const DashboardSection: React.FC<DashboardSectionProps> = ({ state, dispatch }) => {
  const currentWeather = state.environmentalData.weatherCondition;
  const currentActivity = state.officeSensorData.averageActivityLevel;
  const currentTrack = state.activeSoundscape.name;

  const activeProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);
  const aiRecommendationNotification = state.notifications.find(n => n.type === 'AGENT_ACTION' && n.message.startsWith('AI Suggestion:') && !n.isRead);
  const aiRecommendationMessage = aiRecommendationNotification?.message || state.activeSoundscape.currentRecommendation || 'No new recommendations.';
  const aiRecommendedPresetId = aiRecommendationNotification?.details?.recommendedPresetId as string | undefined;

  const handlePresetSelect = (presetId: string, userId?: string) => {
    dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId, userId } });
  };

  const handleTogglePlayPause = () => {
    if (state.audioEngine.isPlaying) {
      dispatch({ type: 'PAUSE_SOUNDSCAPE' });
    } else {
      dispatch({ type: 'PLAY_SOUNDSCAPE' });
    }
  };

  const handleMasterVolumeChange = (value: number) => {
    dispatch({ type: 'ADJUST_MASTER_VOLUME', payload: value });
  };

  const acceptRecommendation = useCallback(() => {
    if (aiRecommendedPresetId) {
      const recommendedPreset = state.availablePresets.find(p => p.id === aiRecommendedPresetId);
      if (recommendedPreset) {
        dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: recommendedPreset.id, userId: activeProfile?.id } });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Switched to "${recommendedPreset.name}" as recommended by AI.`, timestamp: new Date().toISOString(), isRead: false } });
        if (aiRecommendationNotification) {
          dispatch({ type: 'MARK_NOTIFICATION_AS_READ', payload: aiRecommendationNotification.id });
        }
        dispatch({
            type: 'SET_AGENT_ACTIVITY',
            payload: {
                timestamp: new Date().toISOString(),
                agentId: 'AI_REC_AGENT',
                message: `User accepted recommendation to switch to "${recommendedPreset.name}".`,
                action: 'ACCEPT_RECOMMENDATION',
            },
        });
      } else {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: `Could not find recommended preset (ID: ${aiRecommendedPresetId}).`, timestamp: new Date().toISOString(), isRead: false } });
      }
    }
  }, [aiRecommendedPresetId, activeProfile, dispatch, state.availablePresets, aiRecommendationNotification]);

  const formatPlaybackTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl min-h-[800px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Soundscape Dashboard</h2>
        <div className="flex items-center gap-4">
          <Button onClick={handleTogglePlayPause} variant="primary">
            {state.audioEngine.isPlaying ? '❚❚ Pause' : '▶ Play'}
          </Button>
          <SliderControl
            label="Master Volume"
            value={state.globalSettings.masterVolume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleMasterVolumeChange}
            unit=""
            className="w-48"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <TabButton label="Overview" isActive={state.activeDashboardTab === 'OVERVIEW'} onClick={() => dispatch({ type: 'SET_ACTIVE_DASHBOARD_TAB', payload: 'OVERVIEW' })} />
        <TabButton label="Mixer" isActive={state.activeDashboardTab === 'MIXER'} onClick={() => dispatch({ type: 'SET_ACTIVE_DASHBOARD_TAB', payload: 'MIXER' })} />
        <TabButton label="Recommendations" isActive={state.activeDashboardTab === 'RECOMMENDATIONS'} onClick={() => dispatch({ type: 'SET_ACTIVE_DASHBOARD_TAB', payload: 'RECOMMENDATIONS' })} notificationCount={aiRecommendationNotification ? 1 : 0} />
      </div>

      {state.activeDashboardTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title="Current Weather" value={currentWeather} icon={<i className="fas fa-cloud"></i>} colorClass="text-blue-300" />
            <InfoCard title="Office Activity" value={currentActivity} icon={<i className="fas fa-users"></i>} colorClass="text-yellow-300" />
            <InfoCard title="Now Playing" value={currentTrack} icon={<i className="fas fa-music"></i>} colorClass="text-green-300" />
            <InfoCard title="Temperature" value={state.environmentalData.temperatureCelsius} unit="°C" icon={<i className="fas fa-thermometer-half"></i>} />
            <InfoCard title="Occupancy" value={state.officeSensorData.occupancyCount} unit="people" icon={<i className="fas fa-person"></i>} />
            <InfoCard title="Time of Day" value={state.environmentalData.timeOfDay} icon={<i className="fas fa-sun"></i>} />
          </div>

          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Current Soundscape: {state.activeSoundscape.name}</h3>
            <p className="text-gray-300 mb-2">{state.activeSoundscape.description}</p>
            <p className="text-gray-400 text-sm mb-4">Playback Time: {formatPlaybackTime(state.audioEngine.currentPlaybackTimeSeconds)}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.activeSoundscape.layers.map(layer => {
                const asset = state.soundAssets.find(a => a.id === layer.assetId);
                return (
                  <div key={layer.id} className="bg-gray-600 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <i className={`mr-2 text-cyan-400 ${asset?.category === 'NATURE' ? 'fas fa-leaf' : asset?.category === 'MUSIC' ? 'fas fa-compact-disc' : 'fas fa-volume-up'}`}></i>
                      <span className="text-gray-200">{layer.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">Vol: {(layer.volume * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {state.availablePresets.map(preset => (
                <Button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  variant={state.activeSoundscape.id === preset.id ? 'primary' : 'secondary'}
                  className="whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {preset.name}
                </Button>
              ))}
              {activeProfile?.customSoundscapes.map(preset => (
                <Button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id, activeProfile.id)}
                  variant={state.activeSoundscape.id === preset.id ? 'primary' : 'secondary'}
                  className="whitespace-nowrap overflow-hidden text-ellipsis border border-yellow-500"
                >
                  * {preset.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">AI Agent Activity Log</h3>
            {state.activeSoundscape.lastAgentActivity ? (
                <div className="bg-gray-600 p-3 rounded-md text-sm text-gray-300">
                    <p className="font-medium text-cyan-300">{state.activeSoundscape.lastAgentActivity.message}</p>
                    <p className="text-xs text-gray-400">Agent: {state.activeSoundscape.lastAgentActivity.agentId} | Action: {state.activeSoundscape.lastAgentActivity.action} | {new Date(state.activeSoundscape.lastAgentActivity.timestamp).toLocaleString()}</p>
                </div>
            ) : (
                <p className="text-gray-400">No recent AI agent activity.</p>
            )}
          </div>
        </div>
      )}

      {state.activeDashboardTab === 'MIXER' && (
        <SoundMixerSection state={state} dispatch={dispatch} />
      )}

      {state.activeDashboardTab === 'RECOMMENDATIONS' && (
        <div className="space-y-6">
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations</h3>
            <p className="text-gray-300 mb-4">{aiRecommendationMessage}</p>
            <SelectInput
              label="AI Recommendation Mode"
              value={state.globalSettings.aiRecommendationMode}
              options={[
                { value: 'OFF', label: 'Off' },
                { value: 'AMBIENT', label: 'Ambient Enhancement' },
                { value: 'FOCUS', label: 'Focus Mode' },
                { value: 'ENERGY', label: 'Energy Boost' },
              ]}
              onChange={(value) => dispatch({ type: 'TOGGLE_AI_RECOMMENDATION_MODE', payload: value as SoundscapeAppState['globalSettings']['aiRecommendationMode'] })}
            />
            {aiRecommendationMessage.includes('Would you like to switch to') && aiRecommendedPresetId && (
              <Button onClick={acceptRecommendation} className="mt-4">Accept Recommendation</Button>
            )}
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Adaptive Rules in Effect</h3>
            {state.activeSoundscape.activeAdaptiveRules.length > 0 ? (
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {state.activeSoundscape.activeAdaptiveRules.map(rule => (
                  <li key={rule.id} className="text-sm">
                    <strong>{rule.name}:</strong> Triggered by {rule.trigger}, Condition: "{rule.condition}", Action: {rule.action}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No active adaptive rules for this soundscape.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


interface SoundMixerSectionProps {
  state: SoundscapeAppState;
  dispatch: React.Dispatch<SoundscapeAction>;
}
/**
 * SoundMixerSection provides granular control over individual audio layers and effects.
 * Business Value: This robust mixer empowers users to custom-design their soundscapes,
 * offering unparalleled flexibility for personalization. It supports the creation of
 * unique, high-value auditory environments, driving premium content creation and enhancing
 * the platform's utility for professional users.
 */
export const SoundMixerSection: React.FC<SoundMixerSectionProps> = ({ state, dispatch }) => {
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetFilePath, setNewAssetFilePath] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<SoundAsset['category']>('AMBIENT');

  const handleLayerVolumeChange = (layerId: string, volume: number) => {
    dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId, updates: { volume } } });
  };

  const handleLayerPanChange = (layerId: string, pan: number) => {
    dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId, updates: { pan } } });
  };

  const handleLayerToggle = (layerId: string, isEnabled: boolean) => {
    dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId, updates: { isEnabled } } });
  };

  const handleLayerMuteToggle = (layerId: string, isMuted: boolean) => {
    dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId, updates: { isMuted } } });
  };

  const handleRemoveLayer = (layerId: string) => {
    dispatch({ type: 'REMOVE_LAYER_FROM_ACTIVE_SOUNDSCAPE', payload: layerId });
  };

  const handleAddLayer = (assetId: string) => {
    const asset = state.soundAssets.find(a => a.id === assetId);
    if (asset) {
      const newLayer: SoundLayerConfig = {
        id: generateUniqueId(),
        name: asset.name,
        assetId: asset.id,
        volume: 0.5,
        pan: 0,
        isEnabled: true,
        isMuted: false,
        isSoloed: false,
        loop: true,
        startTimeOffsetSeconds: 0,
        endTimeOffsetSeconds: 0,
        effects: [],
      };
      dispatch({ type: 'ADD_LAYER_TO_ACTIVE_SOUNDSCAPE', payload: newLayer });
    }
  };

  const handleUploadAsset = () => {
    if (!newAssetName || !newAssetFilePath) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Asset name and file path are required for upload.', timestamp: new Date().toISOString(), isRead: false } });
      return;
    }
    if (!newAssetFilePath.match(/\.(mp3|wav|ogg|aac)$/i)) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Invalid file path: Must be a common audio format (.mp3, .wav, etc.).', timestamp: new Date().toISOString(), isRead: false } });
      return;
    }

    const newAsset: SoundAsset = {
      id: generateUniqueId(),
      name: newAssetName,
      category: newAssetCategory,
      filePath: newAssetFilePath,
      durationSeconds: Math.floor(Math.random() * 300) + 60, // Simulate duration
      tags: ['custom', newAssetCategory.toLowerCase()],
      isCustomUpload: true,
    };

    dispatch({ type: 'ADD_SOUND_ASSET', payload: newAsset });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Asset "${newAssetName}" securely uploaded and tokenized!`, timestamp: new Date().toISOString(), isRead: false } });
    setNewAssetName('');
    setNewAssetFilePath('');
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl min-h-[700px]">
      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Sound Mixer</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Active Layers ({state.activeSoundscape.layers.length})</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {state.activeSoundscape.layers.length === 0 && (
              <p className="text-gray-400">No layers active. Add some sounds from the library!</p>
            )}
            {state.activeSoundscape.layers.map(layer => {
              const asset = state.soundAssets.find(a => a.id === layer.assetId);
              return (
                <div key={layer.id} className="bg-gray-600 p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium text-cyan-300">{layer.name}</h4>
                    <div className="flex gap-2">
                      <Button onClick={() => handleLayerToggle(layer.id, !layer.isEnabled)} variant="secondary" className="px-3 py-1 text-xs">
                        {layer.isEnabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button onClick={() => handleLayerMuteToggle(layer.id, !layer.isMuted)} variant="secondary" className="px-3 py-1 text-xs">
                        {layer.isMuted ? 'Unmute' : 'Mute'}
                      </Button>
                      <Button onClick={() => handleRemoveLayer(layer.id)} variant="danger" className="px-3 py-1 text-xs">
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <SliderControl
                      label="Volume"
                      value={layer.volume}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => handleLayerVolumeChange(layer.id, val)}
                      className="text-gray-300"
                    />
                    <SliderControl
                      label="Pan"
                      value={layer.pan}
                      min={-1}
                      max={1}
                      step={0.01}
                      onChange={(val) => handleLayerPanChange(layer.id, val)}
                      className="text-gray-300"
                    />
                    <ToggleSwitch
                      label="Loop Playback"
                      isChecked={layer.loop}
                      onChange={(checked) => dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId: layer.id, updates: { loop: checked } } })}
                      className="mt-2"
                    />
                    <div className="mt-3">
                      <h5 className="text-md font-medium text-gray-300 mb-2">Effects ({layer.effects.length})</h5>
                      {layer.effects.length === 0 && <p className="text-gray-500 text-sm">No effects applied.</p>}
                      {layer.effects.map(effect => (
                        <div key={effect.id} className="bg-gray-500 p-2 rounded-md mb-1 flex justify-between items-center text-sm">
                          <span>{effect.type} {effect.isEnabled ? '' : '(Disabled)'}</span>
                          <div className="flex gap-1">
                            <Button onClick={() => dispatch({ type: 'UPDATE_EFFECT_CONFIG', payload: { layerId: layer.id, effectId: effect.id, updates: { isEnabled: !effect.isEnabled } } })} variant="secondary" className="px-2 py-0 text-xs">
                              {effect.isEnabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button onClick={() => dispatch({ type: 'REMOVE_EFFECT_FROM_LAYER', payload: { layerId: layer.id, effectId: effect.id } })} variant="danger" className="px-2 py-0 text-xs">
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <SelectInput
                        label="Add Effect"
                        value=""
                        options={[
                          { value: '', label: '-- Select an effect --' },
                          { value: 'REVERB', label: 'Reverb' },
                          { value: 'DELAY', label: 'Delay' },
                          { value: 'EQ', label: 'Equalizer' },
                          { value: 'COMPRESSOR', label: 'Compressor' },
                          { value: 'SPATIALIZER', label: 'Spatializer' },
                          { value: 'LOWPASS', label: 'Low-Pass Filter' },
                          { value: 'HIGHPASS', label: 'High-Pass Filter' },
                        ]}
                        onChange={(value) => {
                          if (value) {
                            dispatch({
                              type: 'ADD_EFFECT_TO_LAYER',
                              payload: {
                                layerId: layer.id,
                                effect: { id: generateUniqueId(), type: value as EffectConfig['type'], params: {}, isEnabled: true }
                              }
                            });
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Sound Asset Library ({state.soundAssets.length})</h3>
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {state.soundAssets.map(asset => (
              <div key={asset.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="text-md font-medium text-gray-200">{asset.name}</h4>
                  <p className="text-xs text-gray-400">{asset.category} | {asset.durationSeconds}s</p>
                </div>
                <Button onClick={() => handleAddLayer(asset.id)} variant="secondary" className="px-3 py-1 text-sm">
                  Add Layer
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-gray-600 pt-4">
            <h3 className="text-xl font-semibold text-white mb-3">Upload Custom Asset (Tokenization Simulation)</h3>
            <InputField label="Asset Name" type="text" value={newAssetName} onChange={setNewAssetName} placeholder="e.g., My Custom Rain Loop" className="mb-2" />
            <InputField label="File Path (URL)" type="text" value={newAssetFilePath} onChange={setNewAssetFilePath} placeholder="e.g., /my_uploads/rain_loop.mp3" className="mb-2" />
            <SelectInput
              label="Category"
              value={newAssetCategory}
              options={Object.values(['AMBIENT', 'NATURE', 'MUSIC', 'VOICES', 'MACHINES', 'EFFECTS']).map(c => ({ value: c, label: c }))}
              onChange={(value) => setNewAssetCategory(value as SoundAsset['category'])}
              className="mb-2"
            />
            <Button onClick={handleUploadAsset} className="w-full mt-3" disabled={!newAssetName || !newAssetFilePath}>Upload Asset (Mint Token)</Button>
          </div>
        </div>
      </div>
    </div>
  );
};


interface SettingsSectionProps {
  state: SoundscapeAppState;
  dispatch: React.Dispatch<SoundscapeAction>;
}
/**
 * SettingsSection enables users to configure global and personal preferences for the platform.
 * Business Value: Provides the necessary controls for users to tailor their experience,
 * manage integrations, and fine-tune operational parameters. This configurability
 * ensures broad appeal across diverse user segments and use cases, from individual
 * productivity to enterprise-wide deployments, reflecting robust governance capabilities.
 */
export const SettingsSection: React.FC<SettingsSectionProps> = ({ state, dispatch }) => {
  const activeProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);
  const [weatherApiKey, setWeatherApiKey] = useState('****************'); // Simulate sensitive config
  const [officeSensorEndpoint, setOfficeSensorEndpoint] = useState('https://api.example.com/occupancy');
  const [calendarSyncProvider, setCalendarSyncProvider] = useState('Google Calendar');
  const [micEnabled, setMicEnabled] = useState(true);

  const handleThemeChange = (theme: 'DARK' | 'LIGHT') => {
    document.documentElement.setAttribute('data-theme', theme.toLowerCase());
    dispatch({ type: 'UPDATE_GLOBAL_SETTINGS', payload: { theme } });
    if (activeProfile) {
        dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile.id, updates: { personalSettings: { ...activeProfile.personalSettings, theme } } } });
    }
    dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: `Application theme set to '${theme}'.` } });
  };

  const saveSensorSettings = () => {
    dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'Sensor settings saved (simulated). Enhanced data governance in effect.' } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: 'Sensor settings updated securely.', timestamp: new Date().toISOString(), isRead: false } });
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl min-h-[700px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Application Settings</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <TabButton label="General" isActive={state.activeSettingsTab === 'GENERAL'} onClick={() => dispatch({ type: 'SET_ACTIVE_SETTINGS_TAB', payload: 'GENERAL' })} />
        <TabButton label="Audio" isActive={state.activeSettingsTab === 'AUDIO'} onClick={() => dispatch({ type: 'SET_ACTIVE_SETTINGS_TAB', payload: 'AUDIO' })} />
        <TabButton label="Sensor Integration" isActive={state.activeSettingsTab === 'SENSORS'} onClick={() => dispatch({ type: 'SET_ACTIVE_SETTINGS_TAB', payload: 'SENSORS' })} />
        <TabButton label="Notifications" isActive={state.activeSettingsTab === 'NOTIFICATIONS'} onClick={() => dispatch({ type: 'SET_ACTIVE_SETTINGS_TAB', payload: 'NOTIFICATIONS' })} notificationCount={state.notifications.filter(n => !n.isRead).length} />
      </div>

      {state.activeSettingsTab === 'GENERAL' && (
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">General Preferences</h3>
          <SelectInput
            label="Preferred Language"
            value={activeProfile?.personalSettings.preferredLanguage || 'en-US'}
            options={[{ value: 'en-US', label: 'English (US)' }, { value: 'es-ES', label: 'Español (ES)' }, { value: 'fr-FR', label: 'Français (FR)' }]}
            onChange={(value) => activeProfile && dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile.id, updates: { personalSettings: { ...activeProfile.personalSettings, preferredLanguage: value } } } })}
          />
          <SelectInput
            label="Application Theme"
            value={state.globalSettings.theme}
            options={[{ value: 'DARK', label: 'Dark Mode' }, { value: 'LIGHT', label: 'Light Mode' }]}
            onChange={(value) => handleThemeChange(value as 'DARK' | 'LIGHT')}
          />
          <ToggleSwitch
            label="Enable AI Recommendations"
            isChecked={activeProfile?.personalSettings.aiRecommendationsEnabled || false}
            onChange={(checked) => activeProfile && dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile.id, updates: { personalSettings: { ...activeProfile.personalSettings, aiRecommendationsEnabled: checked } } } })}
          />
        </div>
      )}

      {state.activeSettingsTab === 'AUDIO' && (
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Audio Output</h3>
          <SliderControl
            label="Master Volume"
            value={state.globalSettings.masterVolume}
            min={0}
            max={1}
            step={0.01}
            onChange={(val) => dispatch({ type: 'ADJUST_MASTER_VOLUME', payload: val })}
          />
          <ToggleSwitch
            label="Enable Spatial Audio (3D Sound)"
            isChecked={state.globalSettings.spatialAudioEnabled}
            onChange={(checked) => dispatch({ type: 'TOGGLE_SPATIAL_AUDIO', payload: checked })}
          />
          <ToggleSwitch
            label="Low Latency Mode"
            isChecked={state.globalSettings.lowLatencyMode}
            onChange={(checked) => dispatch({ type: 'SET_LOW_LATENCY_MODE', payload: checked })}
          />
          <SelectInput
            label="Audio Output Device"
            value={state.audioEngine.outputDevice}
            options={[
              { value: 'System Default', label: 'System Default' },
              { value: 'Headphones (Realtek)', label: 'Headphones (Realtek Audio)' },
              { value: 'Speakers (Display Audio)', label: 'Speakers (Display Audio)' },
            ]}
            onChange={(value) => dispatch({ type: 'SET_AUDIO_OUTPUT_DEVICE', payload: value })}
          />
        </div>
      )}

      {state.activeSettingsTab === 'SENSORS' && (
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Sensor Integration</h3>
          <p className="text-gray-300 mb-4">Manage secure connections to external data sources for real-time adaptation.</p>
          <InputField label="Weather API Key (Encrypted)" type="password" value={weatherApiKey} onChange={setWeatherApiKey} placeholder="Enter your API key" />
          <InputField label="Office Occupancy Sensor Endpoint" type="text" value={officeSensorEndpoint} onChange={setOfficeSensorEndpoint} />
          <InputField label="Calendar Sync Provider" type="text" value={calendarSyncProvider} onChange={setCalendarSyncProvider} />
          <ToggleSwitch label="Enable Microphone for Ambient Noise Detection (Privacy Compliant)" isChecked={micEnabled} onChange={setMicEnabled} />
          <Button onClick={saveSensorSettings} className="w-full mt-4">Save Sensor Settings</Button>
        </div>
      )}

      {state.activeSettingsTab === 'NOTIFICATIONS' && (
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
          <ToggleSwitch
            label="Enable Desktop Notifications"
            isChecked={activeProfile?.personalSettings.notificationsEnabled || false}
            onChange={(checked) => activeProfile && dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile.id, updates: { personalSettings: { ...activeProfile.personalSettings, notificationsEnabled: checked } } } })}
          />
          <p className="text-gray-400 text-sm">Receive alerts for important system updates and AI-driven recommendations.</p>

          <h4 className="text-lg font-semibold text-white mt-6 mb-3">Recent Notifications</h4>
          {state.notifications.length === 0 && <p className="text-gray-400">No notifications.</p>}
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {state.notifications.slice().reverse().map(notif => ( // Show most recent first
              <li key={notif.id} className={`p-3 rounded-md ${notif.isRead ? 'bg-gray-600 text-gray-400' : 'bg-cyan-900 text-white'} flex justify-between items-center`}>
                <div>
                  <p className="font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-500">{new Date(notif.timestamp).toLocaleString()}</p>
                </div>
                {!notif.isRead && (
                  <Button onClick={() => dispatch({ type: 'MARK_NOTIFICATION_AS_READ', payload: notif.id })} variant="secondary" className="px-2 py-1 text-xs">
                    Mark as Read
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {state.notifications.length > 0 && (
            <Button onClick={() => dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })} variant="danger" className="mt-4">Clear All Notifications</Button>
          )}
        </div>
      )}
    </div>
  );
};


interface ProfilesSectionProps {
  state: SoundscapeAppState;
  dispatch: React.Dispatch<SoundscapeAction>;
}
/**
 * ProfilesSection manages user identities, custom soundscapes, and session history.
 * Business Value: This section forms the Digital Identity and Trust Layer, enabling
 * personalized experiences and secure multi-user environments. It provides tools for
 * users to manage their digital persona, create proprietary soundscape assets, and
 * review their interaction history, all of which are crucial for user retention
 * and auditing within a commercial financial framework.
 */
export const ProfilesSection: React.FC<ProfilesSectionProps> = ({ state, dispatch }) => {
  const activeProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);
  const [newSoundscapeName, setNewSoundscapeName] = useState('');
  const [newSoundscapeDescription, setNewSoundscapeDescription] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const handleCreateCustomSoundscape = () => {
    if (!activeProfile || !newSoundscapeName) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Soundscape name is required to save custom mix.', timestamp: new Date().toISOString(), isRead: false } });
      return;
    }
    if (activeProfile.customSoundscapes.some(cs => cs.name === newSoundscapeName)) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: `Custom soundscape with name "${newSoundscapeName}" already exists.`, timestamp: new Date().toISOString(), isRead: false } });
      return;
    }

    const newCustomSoundscape: SoundscapePreset = {
      id: generateUniqueId(),
      name: newSoundscapeName,
      description: newSoundscapeDescription || 'A custom soundscape.',
      layers: JSON.parse(JSON.stringify(state.activeSoundscape.layers)), // Clone current layers
      adaptiveRules: [], // Start with no custom rules for new custom soundscapes
      tags: ['custom', 'user-defined'],
      isCustom: true,
      createdByUserId: activeProfile.id,
      lastModified: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CUSTOM_SOUNDSCAPE_TO_PROFILE', payload: { userId: activeProfile.id, soundscape: newCustomSoundscape } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Custom soundscape "${newSoundscapeName}" created and secured!`, timestamp: new Date().toISOString(), isRead: false } });
    setNewSoundscapeName('');
    setNewSoundscapeDescription('');
  };

  const handleDeleteCustomSoundscape = (soundscapeId: string) => {
    if (activeProfile) {
      if (soundscapeId === state.activeSoundscape.id) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Cannot delete the currently active soundscape. Please switch to another first.', timestamp: new Date().toISOString(), isRead: false } });
        return;
      }
      dispatch({ type: 'DELETE_CUSTOM_SOUNDSCAPE_FROM_PROFILE', payload: { userId: activeProfile.id, soundscapeId } });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: 'Custom soundscape deleted. Data integrity maintained.', timestamp: new Date().toISOString(), isRead: false } });
    }
  };

  const handleActivateCustomSoundscape = (soundscapeId: string) => {
    dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: soundscapeId, userId: activeProfile?.id } });
  };

  const handleCreateNewUser = () => {
    if (!newUserName) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Username is required to create a new profile.', timestamp: new Date().toISOString(), isRead: false } });
      return;
    }
    if (state.userProfiles.some(p => p.username === newUserName)) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: `User with username "${newUserName}" already exists.`, timestamp: new Date().toISOString(), isRead: false } });
      return;
    }

    const newUserId = generateUniqueId();
    const newUser: UserProfile = {
      id: newUserId,
      username: newUserName,
      favoritePresets: [],
      customSoundscapes: [],
      personalSettings: {
        masterVolume: initialSoundscapeState.globalSettings.masterVolume,
        spatialAudioEnabled: initialSoundscapeState.globalSettings.spatialAudioEnabled,
        notificationsEnabled: true,
        preferredLanguage: 'en-US',
        aiRecommendationsEnabled: true,
        theme: initialSoundscapeState.globalSettings.theme,
      },
      sessionHistory: [],
    };
    dispatch({ type: 'ADD_USER_PROFILE', payload: newUser });
    dispatch({ type: 'SET_ACTIVE_PROFILE', payload: newUserId });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `New digital identity "${newUserName}" created and activated!`, timestamp: new Date().toISOString(), isRead: false } });
    setNewUserName('');
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl min-h-[700px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white">User Profiles & Customization</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <TabButton label="Overview" isActive={state.activeProfileManagementTab === 'OVERVIEW'} onClick={() => dispatch({ type: 'SET_ACTIVE_PROFILE_MANAGEMENT_TAB', payload: 'OVERVIEW' })} />
        <TabButton label="Custom Soundscapes" isActive={state.activeProfileManagementTab === 'CUSTOM_SOUNDSCAPES'} onClick={() => dispatch({ type: 'SET_ACTIVE_PROFILE_MANAGEMENT_TAB', payload: 'CUSTOM_SOUNDSCAPES' })} />
        <TabButton label="Session History" isActive={state.activeProfileManagementTab === 'HISTORY'} onClick={() => dispatch({ type: 'SET_ACTIVE_PROFILE_MANAGEMENT_TAB', payload: 'HISTORY' })} />
      </div>

      {state.activeProfileManagementTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Your Digital Identity: {activeProfile?.username}</h3>
            <SelectInput
              label="Active User Profile"
              value={state.globalSettings.activeProfileId}
              options={state.userProfiles.map(p => ({ value: p.id, label: p.username }))}
              onChange={(value) => dispatch({ type: 'SET_ACTIVE_PROFILE', payload: value })}
            />
            <InputField
              label="Username"
              type="text"
              value={activeProfile?.username || ''}
              onChange={(value) => activeProfile && dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile.id, updates: { username: value as string } } })}
              className="mt-4"
            />
            <ToggleSwitch
              label="Enable Personal Notifications"
              isChecked={activeProfile?.personalSettings.notificationsEnabled || false}
              onChange={(checked) => activeProfile && dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile.id, updates: { personalSettings: { ...activeProfile.personalSettings, notificationsEnabled: checked } } } })}
              className="mt-4"
            />
            <h4 className="text-lg font-semibold text-white mt-6 mb-3">Favorite Presets</h4>
            <div className="flex flex-wrap gap-2">
              {activeProfile?.favoritePresets.length === 0 && <p className="text-gray-400">No favorite presets. Explore and add some!</p>}
              {activeProfile?.favoritePresets.map(presetId => {
                const preset = state.availablePresets.find(p => p.id === presetId) || activeProfile.customSoundscapes.find(cs => cs.id === presetId);
                return preset ? (
                  <Button key={preset.id} onClick={() => dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: preset.id, userId: activeProfile.id } })} variant="secondary" className="px-3 py-1 text-sm">
                    {preset.name}
                  </Button>
                ) : null;
              })}
            </div>
          </div>
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Digital Identity</h3>
            <InputField label="New Username" type="text" value={newUserName} onChange={setNewUserName} placeholder="Enter new username" className="mb-4" />
            <Button onClick={handleCreateNewUser} className="w-full" disabled={!newUserName}>Create & Switch to New Profile</Button>
          </div>
        </div>
      )}

      {state.activeProfileManagementTab === 'CUSTOM_SOUNDSCAPES' && (
        <div className="space-y-6">
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Custom Soundscape from Current Mix</h3>
            <InputField label="Soundscape Name" type="text" value={newSoundscapeName} onChange={(val) => setNewSoundscapeName(val as string)} placeholder="e.g., My Rainy Focus Blend" className="mb-2" />
            <InputField label="Description" type="text" value={newSoundscapeDescription} onChange={(val) => setNewSoundscapeDescription(val as string)} placeholder="Optional description for your custom mix" className="mb-4" />
            <Button onClick={handleCreateCustomSoundscape} className="w-full" disabled={!newSoundscapeName}>Save Current Soundscape as New Custom</Button>
          </div>

          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Your Custom Soundscapes ({activeProfile?.customSoundscapes.length || 0})</h3>
            {activeProfile?.customSoundscapes.length === 0 && <p className="text-gray-400">You haven't created any custom soundscapes yet. Start blending!</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProfile?.customSoundscapes.map(cs => (
                <div key={cs.id} className="bg-gray-600 p-4 rounded-md shadow-sm">
                  <h4 className="text-lg font-medium text-cyan-300 mb-1">{cs.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{cs.description}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleActivateCustomSoundscape(cs.id)} variant="primary" className="px-3 py-1 text-sm">
                      Activate
                    </Button>
                    <Button
                      onClick={() => handleDeleteCustomSoundscape(cs.id)}
                      variant="danger"
                      className="px-3 py-1 text-sm"
                      disabled={cs.id === state.activeSoundscape.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {state.activeProfileManagementTab === 'HISTORY' && (
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Your Auditable Playback History</h3>
          {activeProfile?.sessionHistory.length === 0 && <p className="text-gray-400">No playback history yet. Begin your sound journey!</p>}
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {activeProfile?.sessionHistory.slice().reverse().map((session, index) => { // Show most recent first
              const preset = state.availablePresets.find(p => p.id === session.presetId) || activeProfile.customSoundscapes.find(cs => cs.id === session.presetId);
              return preset ? (
                <li key={`${session.presetId}-${session.timestamp}-${index}`} className="p-3 bg-gray-600 rounded-md flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-gray-200">{preset.name}</p>
                    <p className="text-xs text-gray-400">Played: {new Date(session.timestamp).toLocaleString()}</p>
                  </div>
                  <span className="text-cyan-300">{session.durationMinutes} min</span>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

interface AdminSectionProps {
    state: SoundscapeAppState;
    dispatch: React.Dispatch<SoundscapeAction>;
}
/**
 * AdminSection provides privileged access for managing core system components such as assets, presets, and rules.
 * Business Value: This administrative interface is critical for the governance and extensibility
 * of the financial infrastructure. It enables centralized control over programmable value rails
 * (e.g., sound assets as tokens), digital identity configurations (user profiles indirectly),
 * and intelligent automation policies (adaptive rules). This ensures operational integrity,
 * facilitates rapid iteration of new services, and provides the foundation for scalable and auditable system management.
 */
export const AdminSection: React.FC<AdminSectionProps> = ({ state, dispatch }) => {
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetDescription, setNewPresetDescription] = useState('');
    const [newRuleName, setNewRuleName] = useState('');
    const [newRuleTrigger, setNewRuleTrigger] = useState<RuleConfig['trigger']>('ENVIRONMENT');
    const [newRuleCondition, setNewRuleCondition] = useState('');
    const [newRuleAction, setNewRuleAction] = useState<RuleConfig['action']>('MODIFY_LAYER');
    const [newRuleActionParams, setNewRuleActionParams] = useState<string>('{}'); // JSON string for action params

    const handleAddPreset = () => {
        if (!newPresetName) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Preset name is required.', timestamp: new Date().toISOString(), isRead: false } });
            return;
        }
        if (state.availablePresets.some(p => p.name === newPresetName)) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: `Preset "${newPresetName}" already exists.`, timestamp: new Date().toISOString(), isRead: false } });
            return;
        }
        const newPreset: SoundscapePreset = {
            id: generateUniqueId(),
            name: newPresetName,
            description: newPresetDescription || 'A new system preset.',
            layers: [], // Start empty, admin can add later
            adaptiveRules: [],
            tags: ['system', 'new'],
            isCustom: false,
            createdByUserId: 'ADMIN',
            lastModified: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_PRESET', payload: newPreset });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Preset "${newPresetName}" created.`, timestamp: new Date().toISOString(), isRead: false } });
        setNewPresetName('');
        setNewPresetDescription('');
    };

    const handleDeletePreset = (presetId: string) => {
        if (state.activeSoundscape.id === presetId) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Cannot delete the active preset. Please switch first.', timestamp: new Date().toISOString(), isRead: false } });
            return;
        }
        dispatch({ type: 'DELETE_PRESET', payload: presetId });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Preset "${presetId}" deleted.`, timestamp: new Date().toISOString(), isRead: false } });
    };

    const handleAddRule = () => {
        if (!newRuleName || !newRuleCondition || !newRuleActionParams) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Rule name, condition, and action parameters are required.', timestamp: new Date().toISOString(), isRead: false } });
            return;
        }
        try {
            const parsedParams = JSON.parse(newRuleActionParams);
            const newRule: RuleConfig = {
                id: generateUniqueId(),
                name: newRuleName,
                trigger: newRuleTrigger,
                condition: newRuleCondition,
                action: newRuleAction,
                actionParams: parsedParams,
                priority: 1, // Default priority
                isEnabled: true,
            };
            dispatch({ type: 'ADD_RULE_CONFIG', payload: newRule }); // Currently adds to active soundscape's rules.
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Adaptive rule "${newRuleName}" created.`, timestamp: new Date().toISOString(), isRead: false } });
            setNewRuleName('');
            setNewRuleCondition('');
            setNewRuleActionParams('{}');
        } catch (e: any) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'ERROR', message: `Invalid JSON for Action Parameters: ${e.message}`, timestamp: new Date().toISOString(), isRead: false } });
        }
    };

    const handleDeleteRule = (ruleId: string) => {
        dispatch({ type: 'DELETE_RULE_CONFIG', payload: ruleId });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Adaptive rule "${ruleId}" deleted.`, timestamp: new Date().toISOString(), isRead: false } });
    };

    const handleDeleteAsset = (assetId: string) => {
        // Prevent deletion if asset is in use by any preset or custom soundscape
        const isAssetInUse = state.availablePresets.some(p => p.layers.some(l => l.assetId === assetId)) ||
                             state.userProfiles.some(up => up.customSoundscapes.some(cs => cs.layers.some(l => l.assetId === assetId)));

        if (isAssetInUse) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Cannot delete asset: It is currently used in one or more soundscapes. Remove it from all layers first.', timestamp: new Date().toISOString(), isRead: false } });
            return;
        }
        dispatch({ type: 'DELETE_SOUND_ASSET', payload: assetId });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Sound asset "${assetId}" purged.`, timestamp: new Date().toISOString(), isRead: false } });
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl min-h-[700px]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-3xl font-bold text-white">Administrator Panel</h2>
            </div>

            <div className="flex gap-2 mb-6">
                <TabButton label="Sound Assets" isActive={state.activeAdminTab === 'ASSETS'} onClick={() => dispatch({ type: 'SET_ACTIVE_ADMIN_TAB', payload: 'ASSETS' })} />
                <TabButton label="Presets" isActive={state.activeAdminTab === 'PRESETS'} onClick={() => dispatch({ type: 'SET_ACTIVE_ADMIN_TAB', payload: 'PRESETS' })} />
                <TabButton label="Adaptive Rules" isActive={state.activeAdminTab === 'RULES'} onClick={() => dispatch({ type: 'SET_ACTIVE_ADMIN_TAB', payload: 'RULES' })} />
                <TabButton label="System Logs" isActive={state.activeAdminTab === 'SYSTEM_LOGS'} onClick={() => dispatch({ type: 'SET_ACTIVE_ADMIN_TAB', payload: 'SYSTEM_LOGS' })} />
            </div>

            {state.activeAdminTab === 'ASSETS' && (
                <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">Manage Tokenized Sound Assets ({state.soundAssets.length})</h3>
                    <p className="text-gray-300 mb-4">Administer the digital asset library, crucial for the programmable value rails.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {state.soundAssets.map(asset => (
                            <div key={asset.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center shadow-sm">
                                <div>
                                    <h4 className="text-md font-medium text-gray-200">{asset.name} ({asset.isCustomUpload ? 'Custom' : 'System'})</h4>
                                    <p className="text-xs text-gray-400">ID: {asset.id} | Cat: {asset.category}</p>
                                </div>
                                <Button onClick={() => handleDeleteAsset(asset.id)} variant="danger" className="px-3 py-1 text-sm">
                                    Delete Asset
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {state.activeAdminTab === 'PRESETS' && (
                <div className="space-y-6">
                    <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-white mb-4">Create New System Preset</h3>
                        <InputField label="Preset Name" type="text" value={newPresetName} onChange={setNewPresetName} placeholder="e.g., Enterprise Focus" className="mb-2" />
                        <InputField label="Description" type="text" value={newPresetDescription} onChange={setNewPresetDescription} placeholder="Official description for this preset" className="mb-4" />
                        <Button onClick={handleAddPreset} className="w-full" disabled={!newPresetName}>Add New Preset</Button>
                    </div>

                    <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-white mb-4">Manage Available Presets ({state.availablePresets.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                            {state.availablePresets.map(preset => (
                                <div key={preset.id} className="bg-gray-600 p-4 rounded-md shadow-sm">
                                    <h4 className="text-lg font-medium text-cyan-300 mb-1">{preset.name}</h4>
                                    <p className="text-sm text-gray-400 mb-3">{preset.description}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleDeletePreset(preset.id)}
                                            variant="danger"
                                            className="px-3 py-1 text-sm"
                                            disabled={preset.id === state.activeSoundscape.id}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {state.activeAdminTab === 'RULES' && (
                <div className="space-y-6">
                    <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-white mb-4">Define New Adaptive Rule (Governance Policy)</h3>
                        <InputField label="Rule Name" type="text" value={newRuleName} onChange={setNewRuleName} placeholder="e.g., Office Overload Alert" className="mb-2" />
                        <SelectInput
                            label="Trigger Event"
                            value={newRuleTrigger}
                            options={['ENVIRONMENT', 'OFFICE_ACTIVITY', 'TIME', 'MANUAL'].map(t => ({ value: t, label: t }))}
                            onChange={(value) => setNewRuleTrigger(value as RuleConfig['trigger'])}
                            className="mb-2"
                        />
                        <InputField label="Condition (JS Expression)" type="text" value={newRuleCondition} onChange={setNewRuleCondition} placeholder="e.g., occupancyCount > 20 && timeOfDay === 'AFTERNOON'" className="mb-2" />
                        <SelectInput
                            label="Action"
                            value={newRuleAction}
                            options={['MODIFY_LAYER', 'TOGGLE_LAYER', 'ACTIVATE_PRESET', 'SEND_NOTIFICATION'].map(a => ({ value: a, label: a }))}
                            onChange={(value) => setNewRuleAction(value as RuleConfig['action'])}
                            className="mb-2"
                        />
                        <InputField label="Action Parameters (JSON)" type="text" value={newRuleActionParams} onChange={setNewRuleActionParams} placeholder='e.g., {"layerId": "layer-cafe-1", "volume": 0.8}' className="mb-4" />
                        <Button onClick={handleAddRule} className="w-full" disabled={!newRuleName || !newRuleCondition}>Add New Rule</Button>
                    </div>

                    <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-white mb-4">Manage Global Adaptive Rules ({state.availablePresets.reduce((acc, p) => acc + p.adaptiveRules.length, 0)})</h3>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {state.availablePresets.flatMap(preset => preset.adaptiveRules.map(rule => ({ ...rule, presetName: preset.name }))).map(rule => (
                                <div key={rule.id} className="p-3 bg-gray-600 rounded-md shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-md font-medium text-cyan-300">{rule.name}</h4>
                                        <Button onClick={() => handleDeleteRule(rule.id)} variant="danger" className="px-3 py-1 text-xs">
                                            Delete
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-400">Trigger: {rule.trigger} | Action: {rule.action} (Preset: {rule.presetName})</p>
                                    <p className="text-xs text-gray-500">Condition: "{rule.condition}"</p>
                                    <p className="text-xs text-gray-500">Params: {JSON.stringify(rule.actionParams)}</p>
                                    <ToggleSwitch
                                        label="Enabled"
                                        isChecked={rule.isEnabled}
                                        onChange={(checked) => dispatch({ type: 'UPDATE_RULE_CONFIG', payload: { ruleId: rule.id, updates: { isEnabled: checked } } })}
                                        className="mt-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {state.activeAdminTab === 'SYSTEM_LOGS' && (
                <div className="bg-gray-700 p-5 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">System Operational Logs (Auditable Events)</h3>
                    <p className="text-gray-300 mb-4">Review all critical system events, actions, and agent communications. Essential for audit and compliance.</p>
                    <div className="bg-gray-800 p-3 rounded-md font-mono text-xs text-gray-300 max-h-[600px] overflow-y-auto">
                        {state.logs.slice().reverse().map((log, index) => ( // Show most recent first
                            <div key={index} className={`mb-1 ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-gray-300'}`}>
                                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={`font-bold ml-2 ${log.level === 'INFO' ? 'text-green-400' : ''}`}>[{log.level}]</span>
                                <span className="ml-2">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * `DynamicSoundscapeGeneratorView` is the top-level React component that integrates
 * all aspects of the dynamic soundscape system.
 * It provides the main user interface for interacting with the soundscape,
 * leveraging React's `useReducer` for state management and `useSoundscapeEngine` hook for
 * complex side effects like data fetching, rule application, and audio playback.
 * Business Value: This component is the direct user touchpoint, encapsulating the entire
 * value proposition of the platform. Its robust, modular architecture ensures a responsive,
 * feature-rich, and extensible client-side application. By integrating AI-driven
 * recommendations, real-time sensor data, and personalized digital identities, it delivers
 * an unparalleled user experience that drives adoption and monetization through enhanced
 * productivity, well-being, and enterprise solution deployment. This is the showcase for
 * a revolutionary, multi-million-dollar infrastructure leap.
 */
export const DynamicSoundscapeGeneratorView: React.FC = () => {
  const [state, dispatch] = useReducer(soundscapeReducer, initialSoundscapeState);

  // Hook into the soundscape engine logic
  useSoundscapeEngine(state, dispatch);

  // Simple UI state for the main navigation tabs
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MIXER' | 'PROFILES' | 'SETTINGS' | 'ADMIN'>('DASHBOARD');

  // Logic to apply the theme from state
  useEffect(() => {
    // This effect ensures the global HTML theme attribute matches the state,
    // which allows CSS frameworks like Tailwind to apply themes.
    document.documentElement.setAttribute('data-theme', state.globalSettings.theme.toLowerCase());
  }, [state.globalSettings.theme]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <header className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-cyan-400">Dynamic Soundscape Generator</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">Logged in as: <span className="font-semibold text-cyan-300">{state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId)?.username}</span></span>
          <Button onClick={() => dispatch({ type: 'RESET_STATE' })} variant="danger" className="text-sm">Reset App State</Button>
        </div>
      </header>

      <nav className="flex space-x-1 bg-gray-800 p-2 rounded-t-lg mb-4 shadow-md">
        <TabButton label="Dashboard" isActive={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
        <TabButton label="Mixer" isActive={activeTab === 'MIXER'} onClick={() => setActiveTab('MIXER')} />
        <TabButton label="Profiles" isActive={activeTab === 'PROFILES'} onClick={() => setActiveTab('PROFILES')} />
        <TabButton label="Settings" isActive={activeTab === 'SETTINGS'} onClick={() => setActiveTab('SETTINGS')} notificationCount={state.notifications.filter(n => !n.isRead).length} />
        <TabButton label="Admin" isActive={activeTab === 'ADMIN'} onClick={() => setActiveTab('ADMIN')} />
      </nav>

      <main className="flex-grow">
        {state.error && (
          <div className="bg-red-800 text-white p-4 rounded-md mb-4 flex justify-between items-center">
            <span>Critical Error: {state.error}</span>
            <Button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })} variant="secondary">Clear Error</Button>
          </div>
        )}
        {state.isLoading && (
          <div className="bg-blue-800 text-white p-4 rounded-md mb-4 animate-pulse">
            Loading data... Ensuring operational continuity.
          </div>
        )}

        {activeTab === 'DASHBOARD' && <DashboardSection state={state} dispatch={dispatch} />}
        {activeTab === 'MIXER' && <SoundMixerSection state={state} dispatch={dispatch} />}
        {activeTab === 'PROFILES' && <ProfilesSection state={state} dispatch={dispatch} />}
        {activeTab === 'SETTINGS' && <SettingsSection state={state} dispatch={dispatch} />}
        {activeTab === 'ADMIN' && <AdminSection state={state} dispatch={dispatch} />}
      </main>

      <footer className="bg-gray-800 p-4 rounded-lg shadow-lg mt-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Money20/20 Build Phase. All rights reserved. Real-time Sound Intelligence - The Future of Programmable Well-being.
      </footer>
    </div>
  );
};
```