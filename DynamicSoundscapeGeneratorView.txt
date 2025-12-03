import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';

// Original interface, kept as per instruction
interface SoundscapeState {
  weather: string;
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  currentTrack: string; // e.g., "Calm Rain & Lo-fi Beats"
}

// --- Global Type Definitions (Exported as per instruction) ---
// These interfaces define the complex state structure for a real-world soundscape application.

/**
 * Represents the current environmental conditions influencing the soundscape.
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
 * Represents data from internal office sensors and systems.
 */
export interface OfficeSensorData {
  occupancyCount: number;
  averageActivityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  meetingRoomStatus: { roomId: string; isOccupied: boolean; schedule: string }[];
  calendarEvents: { eventName: string; startTime: string; endTime: string; impact: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  energyConsumptionKW: number; // Could indicate general system load
}

/**
 * Configuration for a single sound layer.
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
 * Configuration for an audio effect.
 */
export interface EffectConfig {
  id: string;
  type: 'REVERB' | 'DELAY' | 'EQ' | 'COMPRESSOR' | 'SPATIALIZER' | 'LOWPASS' | 'HIGHPASS';
  params: Record<string, any>; // Generic parameters for the effect
  isEnabled: boolean;
}

/**
 * Represents a single audio asset available in the library.
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
 * Represents a predefined soundscape preset.
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
 * Defines a rule for adaptive soundscape generation.
 */
export interface RuleConfig {
  id: string;
  name: string;
  trigger: 'ENVIRONMENT' | 'OFFICE_ACTIVITY' | 'TIME' | 'MANUAL';
  condition: string; // e.g., "weatherCondition == 'RAIN' && occupancyCount > 10"
  action: 'ACTIVATE_PRESET' | 'MODIFY_LAYER' | 'ADJUST_VOLUME' | 'ADD_EFFECT' | 'REMOVE_EFFECT';
  actionParams: Record<string, any>; // e.g., { presetId: 'rainy_focus', layerId: 'rain_medium', volume: 0.7 }
  priority: number; // Higher number means higher priority
  isEnabled: boolean;
}

/**
 * Represents a user profile and their preferences.
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
  };
  lastActiveSoundscapeId?: string;
  sessionHistory: { timestamp: string; presetId: string; durationMinutes: number }[];
}

/**
 * Represents a system notification.
 */
export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: string;
  isRead: boolean;
  details?: Record<string, any>;
}

/**
 * State for the audio engine's actual playback status (simulated).
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
 * The main application state for the Dynamic Soundscape Generator.
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
  };
  audioEngine: AudioEnginePlaybackState;
  notifications: Notification[];
  logs: { timestamp: string; level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR'; message: string }[];
  isLoading: boolean;
  error: string | null;
  activeAdminTab: 'ASSETS' | 'RULES' | 'USERS' | 'SYSTEM';
  activeProfileManagementTab: 'OVERVIEW' | 'CUSTOM_SOUNDSCAPES' | 'HISTORY';
  activeSettingsTab: 'GENERAL' | 'AUDIO' | 'SENSORS' | 'NOTIFICATIONS';
  activeDashboardTab: 'OVERVIEW' | 'MIXER' | 'RECOMMENDATIONS';
}

// --- Reducer Actions (Exported) ---
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
  | { type: 'INITIALIZE_STATE'; payload: SoundscapeAppState } // For loading from storage
  | { type: 'RESET_STATE' };


// --- Initial State (Exported) ---
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
        { id: 'rule-rain-intensity', name: 'Adjust Rain Volume by Weather', trigger: 'ENVIRONMENT', condition: "weatherCondition == 'STORM'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-rain-1', volume: 0.9 }, priority: 5, isEnabled: true },
        { id: 'rule-activity-lofi', name: 'Boost Lo-fi on High Activity', trigger: 'OFFICE_ACTIVITY', condition: "averageActivityLevel == 'HIGH'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-lofi-1', volume: 0.55 }, priority: 3, isEnabled: true },
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
      { id: 'rule-rain-intensity', name: 'Adjust Rain Volume by Weather', trigger: 'ENVIRONMENT', condition: "weatherCondition == 'STORM'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-rain-1', volume: 0.9 }, priority: 5, isEnabled: true },
      { id: 'rule-activity-lofi', name: 'Boost Lo-fi on High Activity', trigger: 'OFFICE_ACTIVITY', condition: "averageActivityLevel == 'HIGH'", action: 'MODIFY_LAYER', actionParams: { layerId: 'layer-lofi-1', volume: 0.55 }, priority: 3, isEnabled: true },
    ],
    startTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    currentRecommendation: 'Based on current weather, "Focus Rain" is recommended for concentration.',
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
                             state.userProfiles.find(up => up.id === action.payload.userId)?.customSoundscapes.find(cs => cs.id === action.payload.presetId);
      if (!selectedPreset) return state;

      const userProfile = state.userProfiles.find(p => p.id === (action.payload.userId || state.globalSettings.activeProfileId));
      if (userProfile) {
        userProfile.lastActiveSoundscapeId = selectedPreset.id;
        userProfile.sessionHistory.push({
          timestamp: new Date().toISOString(),
          presetId: selectedPreset.id,
          durationMinutes: 0, // Will be updated on stop/pause
        });
      }

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
        },
        audioEngine: { ...state.audioEngine, isPlaying: true },
        userProfiles: state.userProfiles.map(p => p.id === userProfile?.id ? userProfile : p),
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Soundscape set to '${selectedPreset.name}'.` }],
      };
    }
    case 'PLAY_SOUNDSCAPE':
      return { ...state, audioEngine: { ...state.audioEngine, isPlaying: true }, logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: 'Soundscape playback started.' }] };
    case 'PAUSE_SOUNDSCAPE':
      // Update session history duration on pause
      const updatedProfilesOnPause = state.userProfiles.map(profile => {
        if (profile.id === state.globalSettings.activeProfileId && profile.sessionHistory.length > 0) {
          const lastSession = profile.sessionHistory[profile.sessionHistory.length - 1];
          if (lastSession.presetId === state.activeSoundscape.id) {
            const duration = Math.round((new Date().getTime() - new Date(lastSession.timestamp).getTime()) / 60000);
            return {
              ...profile,
              sessionHistory: profile.sessionHistory.map((s, idx) =>
                idx === profile.sessionHistory.length - 1 ? { ...s, durationMinutes: duration } : s
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
    case 'STOP_SOUNDSCAPE':
      const updatedProfilesOnStop = state.userProfiles.map(profile => {
        if (profile.id === state.globalSettings.activeProfileId && profile.sessionHistory.length > 0) {
          const lastSession = profile.sessionHistory[profile.sessionHistory.length - 1];
          if (lastSession.presetId === state.activeSoundscape.id) {
            const duration = Math.round((new Date().getTime() - new Date(lastSession.timestamp).getTime()) / 60000);
            return {
              ...profile,
              sessionHistory: profile.sessionHistory.map((s, idx) =>
                idx === profile.sessionHistory.length - 1 ? { ...s, durationMinutes: duration } : s
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
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Layer '${action.payload.layerId}' updated.` }],
      };
    case 'ADD_LAYER_TO_ACTIVE_SOUNDSCAPE':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: [...state.activeSoundscape.layers, action.payload],
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Layer '${action.payload.name}' added to active soundscape.` }],
      };
    case 'REMOVE_LAYER_FROM_ACTIVE_SOUNDSCAPE':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.filter(layer => layer.id !== action.payload),
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
      const profile = state.userProfiles.find(p => p.id === action.payload);
      if (!profile) return state;
      return {
        ...state,
        globalSettings: { ...state.globalSettings, activeProfileId: action.payload },
        // Also apply personal settings from the profile
        audioEngine: { ...state.audioEngine, masterVolume: profile.personalSettings.masterVolume, spatialAudioEnabled: profile.personalSettings.spatialAudioEnabled },
        globalSettings: { ...state.globalSettings, masterVolume: profile.personalSettings.masterVolume, spatialAudioEnabled: profile.personalSettings.spatialAudioEnabled, aiRecommendationMode: profile.personalSettings.aiRecommendationsEnabled ? 'AMBIENT' : 'OFF' }, // Infer AI mode
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Active profile set to '${profile.username}'.` }],
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
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          activeAdaptiveRules: state.activeSoundscape.activeAdaptiveRules.map(rule =>
            rule.id === action.payload.ruleId ? { ...rule, ...action.payload.updates } : rule
          ),
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Rule '${action.payload.ruleId}' updated.` }],
      };
    case 'ADD_RULE_CONFIG':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          activeAdaptiveRules: [...state.activeSoundscape.activeAdaptiveRules, action.payload],
        },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Rule '${action.payload.name}' added.` }],
      };
    case 'DELETE_RULE_CONFIG':
      return {
        ...state,
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
    case 'INITIALIZE_STATE':
      return { ...action.payload, isLoading: false, error: null };
    case 'RESET_STATE':
      return initialSoundscapeState;
    default:
      return state;
  }
};


// --- Utility Functions (Exported) ---

/**
 * Generates a unique ID (simple implementation).
 */
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Simulates fetching real-time weather data from an external API.
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
 * Simulates fetching office sensor data (occupancy, activity, etc.).
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
        // Mock meeting room status slightly differently
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
 * Simulates an AI recommendation engine.
 */
export const simulateAIRecommendation = async (state: SoundscapeAppState): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (state.globalSettings.aiRecommendationMode === 'OFF') {
        resolve('AI recommendations are disabled.');
        return;
      }

      const { weatherCondition, timeOfDay } = state.environmentalData;
      const { averageActivityLevel, occupancyCount } = state.officeSensorData;
      const userProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);
      const lastPreset = userProfile?.lastActiveSoundscapeId ? state.availablePresets.find(p => p.id === userProfile.lastActiveSoundscapeId) || userProfile.customSoundscapes.find(cs => cs.id === userProfile.lastActiveSoundscapeId) : null;

      let recommendation = "Analyzing your environment...";
      let recommendedPresetId: string | undefined;

      // Basic rule-based AI simulation
      if (timeOfDay === 'NIGHT' || timeOfDay === 'DUSK') {
        recommendation = 'It\'s getting late. Perhaps a calming soundscape?';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('relax'))?.id;
      } else if (weatherCondition === 'RAIN' || weatherCondition === 'STORM') {
        recommendation = 'Rainy weather detected. "Focus Rain" might help you concentrate.';
        recommendedPresetId = 'preset-001'; // Specific ID for Focus Rain
      } else if (averageActivityLevel === 'HIGH' || occupancyCount > 30) {
        recommendation = 'High office activity! Try a "noise-masking" soundscape for better focus.';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('urban') || p.tags.includes('focus'))?.id;
      } else if (timeOfDay === 'MORNING' && averageActivityLevel === 'LOW') {
        recommendation = 'Good morning! A fresh "Forest Retreat" could be a nice start to your day.';
        recommendedPresetId = 'preset-002'; // Specific ID for Forest Retreat
      } else if (state.globalSettings.aiRecommendationMode === 'FOCUS') {
        recommendation = 'In Focus Mode: Suggesting a soundscape optimized for deep work.';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('focus') && p.tags.includes('lofi'))?.id;
      } else if (state.globalSettings.aiRecommendationMode === 'AMBIENT') {
        recommendation = 'In Ambient Mode: Enjoying subtle background enhancements.';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('ambient') || p.tags.includes('nature'))?.id;
      } else if (state.globalSettings.aiRecommendationMode === 'ENERGY') {
        recommendation = 'In Energy Mode: Let\'s pick something lively to boost your mood!';
        recommendedPresetId = state.availablePresets.find(p => p.tags.includes('lively'))?.id;
      }

      if (recommendedPresetId && recommendedPresetId !== state.activeSoundscape.id) {
        const recommendedPreset = state.availablePresets.find(p => p.id === recommendedPresetId);
        if (recommendedPreset) {
          recommendation += ` Would you like to switch to "${recommendedPreset.name}"?`;
        }
      } else if (!recommendedPresetId) {
        recommendation = 'No specific recommendation at this moment, but you can explore our presets!';
      }


      resolve(recommendation);
    }, 2000 + Math.random() * 1000);
  });
};

/**
 * Applies adaptive rules to the current soundscape layers based on environmental/office data.
 * This is a core part of the "real application" logic.
 * @param state The current application state.
 * @returns An array of updated SoundLayerConfig, or the original if no changes.
 */
export const applyAdaptiveRules = (state: SoundscapeAppState): SoundLayerConfig[] => {
  let updatedLayers = JSON.parse(JSON.stringify(state.activeSoundscape.layers)) as SoundLayerConfig[]; // Deep copy

  const context = {
    ...state.environmentalData,
    ...state.officeSensorData,
    globalSettings: state.globalSettings,
    activeSoundscape: state.activeSoundscape,
  };

  const activeRules = state.activeSoundscape.activeAdaptiveRules
    .filter(rule => rule.isEnabled)
    .sort((a, b) => b.priority - a.priority); // High priority rules first

  activeRules.forEach(rule => {
    try {
      // Very simple eval-like condition parsing. In a real app, use a safer expression parser.
      const conditionMet = new Function('context', `with(context) { return ${rule.condition}; }`)(context);

      if (conditionMet) {
        if (rule.action === 'MODIFY_LAYER' && rule.actionParams.layerId) {
          updatedLayers = updatedLayers.map(layer => {
            if (layer.id === rule.actionParams.layerId) {
              return { ...layer, ...rule.actionParams.volume !== undefined ? { volume: rule.actionParams.volume } : {}, ...rule.actionParams.pan !== undefined ? { pan: rule.actionParams.pan } : {} };
            }
            return layer;
          });
        }
        // Add more actions here for comprehensive rule engine: ACTIVATE_PRESET, ADD_EFFECT, REMOVE_EFFECT etc.
        // For 'ACTIVATE_PRESET', this would usually trigger a dispatch, not direct state modification.
      }
    } catch (e) {
      console.error(`Error evaluating rule '${rule.name}':`, e);
      // In a real app, dispatch an error notification
    }
  });

  return updatedLayers;
};

/**
 * A simulated sound engine service.
 * In a real application, this would interact with the Web Audio API or a native audio engine.
 */
export class MockAudioEngine {
  public sources: Map<string, HTMLAudioElement> = new Map(); // Made public for easier simulation
  private masterVolume: number = 0.75;
  private isPlaying: boolean = false;
  private spatialAudioEnabled: boolean = false;
  private outputDevice: string = 'System Default';
  private currentPlaybackTime: number = 0;
  private updateInterval: any;

  constructor() {
    // Simulate audio playback progress
    this.updateInterval = setInterval(() => {
      if (this.isPlaying) {
        this.currentPlaybackTime += 1;
        // console.log(`Simulated Audio Engine: ${this.currentPlaybackTime}s`);
      }
    }, 1000);
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.sources.forEach(source => {
      source.volume = this.masterVolume; // Simple application to all sources
    });
    console.log(`Audio Engine: Master volume set to ${this.masterVolume}`);
  }

  toggleSpatialAudio(enabled: boolean) {
    this.spatialAudioEnabled = enabled;
    console.log(`Audio Engine: Spatial audio ${enabled ? 'enabled' : 'disabled'}`);
    // In a real engine, this would affect PannerNode settings
  }

  setOutputDevice(deviceId: string) {
    this.outputDevice = deviceId;
    console.log(`Audio Engine: Output device set to ${deviceId}`);
    // In a real engine, this would set sinkId on AudioContext
  }

  loadSoundAsset(asset: SoundAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sources.has(asset.id)) {
        console.log(`Asset ${asset.name} already loaded.`);
        return resolve();
      }
      // Simulate loading time
      setTimeout(() => {
        const audio = new Audio(asset.filePath);
        audio.preload = 'auto';
        audio.volume = this.masterVolume; // Initial volume
        this.sources.set(asset.id, audio);
        console.log(`Audio Engine: Loaded asset: ${asset.name}`);
        resolve();
      }, 500);
    });
  }

  playLayer(layer: SoundLayerConfig, masterVolume: number) {
    const audio = this.sources.get(layer.assetId);
    if (audio && layer.isEnabled && !layer.isMuted) {
      audio.loop = layer.loop;
      audio.volume = layer.volume * masterVolume; // Layer volume * master volume
      // Simulate pan and spatial coordinates
      // In a real Web Audio API, this would involve PannerNode and GainNode
      if (layer.pan !== undefined) { /* Apply pan logic */ }
      if (layer.spatialCoordinates && this.spatialAudioEnabled) { /* Apply spatial audio logic */ }

      // Reset playback for new play if not looping, or if current time is at end.
      if (!audio.loop || audio.ended) {
        audio.currentTime = layer.startTimeOffsetSeconds || 0;
      }
      if (this.isPlaying) { // Only play if the engine is globally playing
        audio.play().catch(e => console.error(`Error playing audio for layer ${layer.name}:`, e));
        console.log(`Audio Engine: Playing layer: ${layer.name} (Asset: ${layer.assetId})`);
      }
    } else if (audio) {
      audio.pause();
    }
  }

  stopLayer(assetId: string) { // Changed to assetId for consistency with sources map
    const audio = this.sources.get(assetId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      console.log(`Audio Engine: Stopped layer for asset: ${assetId}`);
    }
  }

  stopAllLayers() {
    this.sources.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.isPlaying = false;
    this.currentPlaybackTime = 0;
    console.log('Audio Engine: All layers stopped.');
  }

  pauseAllLayers() {
    this.sources.forEach(audio => audio.pause());
    this.isPlaying = false;
    console.log('Audio Engine: All layers paused.');
  }

  resumeAllLayers() {
    this.sources.forEach(audio => {
      // Only resume if it was playing before pause, or if it's meant to be active
      // Simplified: resume all currently loaded. Real logic would be more complex.
      if (this.isPlaying) { // Ensure global play state
         audio.play().catch(e => console.error("Error resuming audio:", e));
      }
    });
    this.isPlaying = true;
    console.log('Audio Engine: All layers resumed.');
  }

  cleanup() {
    clearInterval(this.updateInterval);
    this.stopAllLayers();
    this.sources.forEach(audio => audio.src = ''); // Release resources
    this.sources.clear();
    console.log('Audio Engine: Cleaned up resources.');
  }
}

// --- Custom Hook for Soundscape Engine Logic (Exported) ---
/**
 * `useSoundscapeEngine` is a custom hook that encapsulates all the side effects
 * and complex logic for managing the dynamic soundscape.
 * It integrates with external data, applies adaptive rules, handles audio playback state,
 * and manages user preferences.
 */
export const useSoundscapeEngine = (
  state: SoundscapeAppState,
  dispatch: React.Dispatch<SoundscapeAction>
) => {
  const audioEngineRef = useRef<MockAudioEngine | null>(null);

  // Initialize audio engine on component mount
  useEffect(() => {
    audioEngineRef.current = new MockAudioEngine();
    console.log('useSoundscapeEngine: MockAudioEngine initialized.');

    // Load initial assets
    state.soundAssets.forEach(asset => {
      audioEngineRef.current?.loadSoundAsset(asset);
    });

    return () => {
      audioEngineRef.current?.cleanup();
      console.log('useSoundscapeEngine: MockAudioEngine cleaned up.');
    };
  }, []);

  // Effect for handling global playback state changes
  useEffect(() => {
    if (!audioEngineRef.current) return;

    audioEngineRef.current.setMasterVolume(state.globalSettings.masterVolume);
    audioEngineRef.current.toggleSpatialAudio(state.globalSettings.spatialAudioEnabled);
    // Note: Output device and low latency mode would be handled by specific events, not global state changes here

    if (state.audioEngine.isPlaying) {
      audioEngineRef.current.resumeAllLayers(); // Resumes all *paused* layers if global isPlaying is true
    } else {
      audioEngineRef.current.pauseAllLayers();
    }

    // Effect for updating individual layers based on activeSoundscape.layers
    state.activeSoundscape.layers.forEach(layer => {
        const asset = state.soundAssets.find(a => a.id === layer.assetId);
        if (asset) {
            audioEngineRef.current?.loadSoundAsset(asset).then(() => {
                if (state.audioEngine.isPlaying && layer.isEnabled && !layer.isMuted) {
                    audioEngineRef.current?.playLayer(layer, state.globalSettings.masterVolume);
                } else {
                    // Stop or mute if conditions are not met
                    audioEngineRef.current?.stopLayer(asset.id);
                }
            });
        }
    });


  }, [state.audioEngine.isPlaying, state.globalSettings.masterVolume, state.globalSettings.spatialAudioEnabled, state.activeSoundscape.layers, state.soundAssets]);


  // Effect for initial state loading from local storage
  useEffect(() => {
    const storedState = localStorage.getItem('soundscapeAppState');
    if (storedState) {
      try {
        const parsedState: SoundscapeAppState = JSON.parse(storedState);
        dispatch({ type: 'INITIALIZE_STATE', payload: parsedState });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'State loaded from local storage.' } });
      } catch (e) {
        console.error('Failed to load state from local storage:', e);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved state.' });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'ERROR', message: `Failed to load state from local storage: ${e}` } });
      }
    } else {
      dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'No saved state found, using initial state.' } });
    }
  }, [dispatch]);

  // Effect for saving state to local storage on changes (debounce for performance)
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      localStorage.setItem('soundscapeAppState', JSON.stringify(state));
      // console.log('State saved to local storage.'); // Too chatty for console
    }, 1000); // Save state after 1 second of no changes
    return () => clearTimeout(debounceSave);
  }, [state]);


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
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', payload: `Data fetch failed: ${e.message}` });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'ERROR', message: `Data fetch failed: ${e.message}` } });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchAndDispatchData(); // Initial fetch
    const interval = setInterval(fetchAndDispatchData, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  // Effect for applying adaptive rules when environmental/office data changes
  useEffect(() => {
    const newLayers = applyAdaptiveRules(state);
    // Deep comparison to avoid unnecessary re-renders/dispatches
    // Note: This logic assumes applyAdaptiveRules returns modifications on *existing* layers, not new layers.
    // A more robust system might dispatch a 'REPLACE_ACTIVE_LAYERS' or a batch 'UPDATE_LAYERS' action.
    const changesDetected = newLayers.some((newL, index) => {
        const oldL = state.activeSoundscape.layers.find(l => l.id === newL.id); // Find by ID, order might change
        return oldL && (newL.volume !== oldL.volume || newL.pan !== oldL.pan || newL.isEnabled !== oldL.isEnabled);
    });

    if (changesDetected) {
        newLayers.forEach(newL => {
          const oldL = state.activeSoundscape.layers.find(l => l.id === newL.id);
          if (oldL && (newL.volume !== oldL.volume || newL.pan !== oldL.pan || newL.isEnabled !== oldL.isEnabled)) {
              dispatch({
                  type: 'UPDATE_LAYER_CONFIG',
                  payload: {
                      layerId: newL.id,
                      updates: { volume: newL.volume, pan: newL.pan, isEnabled: newL.isEnabled }
                  }
              });
          }
        });
        dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'INFO', message: 'Adaptive rules applied, soundscape layers updated.' } });
    }
  }, [state.environmentalData, state.officeSensorData, state.activeSoundscape.activeAdaptiveRules, state.activeSoundscape.layers, dispatch]); // Dependencies for re-evaluation


  // Effect for AI recommendations
  useEffect(() => {
    if (state.globalSettings.aiRecommendationMode !== 'OFF') {
      const fetchRecommendation = async () => {
        const recommendationText = await simulateAIRecommendation(state);
        // This should trigger a state update for currentRecommendation in activeSoundscape
        // For simplicity, let's add a notification
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'INFO', message: `AI Suggestion: ${recommendationText}`, timestamp: new Date().toISOString(), isRead: false } });
      };
      const interval = setInterval(fetchRecommendation, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [state.globalSettings.aiRecommendationMode, state.environmentalData, state.officeSensorData, state.userProfiles, dispatch, state]); // Include state as dependency for AI to react to changes


  // Effect for current playback time update simulation
  useEffect(() => {
    if (state.audioEngine.isPlaying) {
      const interval = setInterval(() => {
        dispatch(current => ({
          ...current,
          audioEngine: {
            ...current.audioEngine,
            currentPlaybackTimeSeconds: current.audioEngine.currentPlaybackTimeSeconds + 1
          }
        }) as SoundscapeAction); // Cast needed due to complex return type from reducer
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.audioEngine.isPlaying, dispatch]);


  // Effect for loading sound assets dynamically as layers are added/changed
  useEffect(() => {
      state.activeSoundscape.layers.forEach(layer => {
          const asset = state.soundAssets.find(a => a.id === layer.assetId);
          if (asset && audioEngineRef.current && !audioEngineRef.current.sources.has(asset.id)) {
              dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Pre-loading asset for layer: ${asset.name}` } });
              audioEngineRef.current.loadSoundAsset(asset)
                  .then(() => {
                      dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'DEBUG', message: `Asset loaded: ${asset.name}` } });
                  })
                  .catch(e => {
                      dispatch({ type: 'ADD_LOG', payload: { timestamp: new Date().toISOString(), level: 'ERROR', message: `Failed to load asset ${asset.name}: ${e}` } });
                  });
          }
      });
  }, [state.activeSoundscape.layers, state.soundAssets, dispatch]);
};


// --- Sub-Components (Exported as per instruction) ---
// These components would typically be in their own files but are consolidated here for the instruction.

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  notificationCount?: number;
}
export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, notificationCount }) => (
  <button
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ease-in-out
                ${isActive ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
                relative`}
    onClick={onClick}
  >
    {label}
    {notificationCount && notificationCount > 0 && (
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
}
export const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, placeholder, className }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
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
export const DashboardSection: React.FC<DashboardSectionProps> = ({ state, dispatch }) => {
  const currentWeather = state.environmentalData.weatherCondition;
  const currentActivity = state.officeSensorData.averageActivityLevel;
  const currentTrack = state.activeSoundscape.name;

  const activeProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);
  const aiRecommendation = state.notifications.find(n => n.message.startsWith('AI Suggestion:'))?.message || state.activeSoundscape.currentRecommendation || 'No new recommendations.';

  const handlePresetSelect = (presetId: string) => {
    dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId } });
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

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl min-h-[800px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Soundscape Dashboard</h2>
        <div className="flex items-center gap-4">
          <Button onClick={handleTogglePlayPause} variant="primary">
            {state.audioEngine.isPlaying ? '⏸ Pause' : '▶ Play'}
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
        <TabButton label="Recommendations" isActive={state.activeDashboardTab === 'RECOMMENDATIONS'} onClick={() => dispatch({ type: 'SET_ACTIVE_DASHBOARD_TAB', payload: 'RECOMMENDATIONS' })} />
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
            <p className="text-gray-300 mb-4">{state.activeSoundscape.description}</p>
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
                  onClick={() => handlePresetSelect(preset.id)}
                  variant={state.activeSoundscape.id === preset.id ? 'primary' : 'secondary'}
                  className="whitespace-nowrap overflow-hidden text-ellipsis border border-yellow-500"
                >
                  * {preset.name}
                </Button>
              ))}
            </div>
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
            <p className="text-gray-300 mb-4">{aiRecommendation}</p>
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
            {aiRecommendation.includes('Would you like to switch to') && (
              <Button onClick={() => {
                // Parse preset ID from recommendation
                const match = aiRecommendation.match(/"([^"]+)"/);
                if (match && match[1]) {
                  const recommendedPresetName = match[1];
                  const recommendedPreset = state.availablePresets.find(p => p.name === recommendedPresetName);
                  if (recommendedPreset) {
                    dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: recommendedPreset.id } });
                    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Switched to "${recommendedPreset.name}" as recommended.`, timestamp: new Date().toISOString(), isRead: false } });
                  }
                }
              }} className="mt-4">Accept Recommendation</Button>
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
export const SoundMixerSection: React.FC<SoundMixerSectionProps> = ({ state, dispatch }) => {

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
                    {/* Effects management for layer */}
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
            <h3 className="text-xl font-semibold text-white mb-3">Upload Custom Asset</h3>
            <InputField label="Asset Name" type="text" value="" onChange={() => {}} placeholder="e.g., My Custom Rain Loop" className="mb-2" />
            <InputField label="File Path (URL)" type="text" value="" onChange={() => {}} placeholder="e.g., /my_uploads/rain_loop.mp3" className="mb-2" />
            <SelectInput
              label="Category"
              value="AMBIENT"
              options={Object.values({ 'AMBIENT': 'Ambient', 'NATURE': 'Nature', 'MUSIC': 'Music', 'VOICES': 'Voices', 'MACHINES': 'Machines', 'EFFECTS': 'Effects' }).map(c => ({ value: c.toUpperCase(), label: c }))}
              onChange={() => {}}
              className="mb-2"
            />
            <Button onClick={() => { /* Implement actual upload logic */ }} className="w-full mt-3">Upload Asset</Button>
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
export const SettingsSection: React.FC<SettingsSectionProps> = ({ state, dispatch }) => {
  const handleThemeChange = (theme: 'DARK' | 'LIGHT') => {
    // This would typically update a global theme context, but for this file, just logs.
    console.log(`Theme changed to: ${theme}`);
    // Potentially update globalSettings.theme in state if it's stored there
    // dispatch({ type: 'UPDATE_GLOBAL_SETTINGS', payload: { theme }});
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
        <TabButton label="Notifications" isActive={state.activeSettingsTab === 'NOTIFICATIONS'} onClick={() => dispatch({ type: 'SET_ACTIVE_SETTINGS_TAB', payload: 'NOTIFICATIONS' })} />
      </div>

      {state.activeSettingsTab === 'GENERAL' && (
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">General Preferences</h3>
          <SelectInput
            label="Preferred Language"
            value={state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId)?.personalSettings.preferredLanguage || 'en-US'}
            options={[{ value: 'en-US', label: 'English (US)' }, { value: 'es-ES', label: 'Español (ES)' }, { value: 'fr-FR', label: 'Français (FR)' }]}
            onChange={(value) => dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: state.globalSettings.activeProfileId, updates: { personalSettings: { ...state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId)?.personalSettings, preferredLanguage: value } } } })}
          />
          <SelectInput
            label="Application Theme"
            value={state.globalSettings.theme}
            options={[{ value: 'DARK', label: 'Dark Mode' }, { value: 'LIGHT', label: 'Light Mode' }]}
            onChange={(value) => handleThemeChange(value as 'DARK' | 'LIGHT')}
          />
          <ToggleSwitch
            label="Enable AI Recommendations"
            isChecked={state.globalSettings.aiRecommendationMode !== 'OFF'}
            onChange={(checked) => dispatch({ type: 'TOGGLE_AI_RECOMMENDATION_MODE', payload: checked ? 'AMBIENT' : 'OFF' })}
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
          <p className="text-gray-300 mb-4">Manage connections to external data sources.</p>
          <InputField label="Weather API Key" type="password" value="****************" onChange={() => {}} placeholder="Enter your API key" />
          <InputField label="Office Occupancy Sensor Endpoint" type="text" value="https://api.example.com/occupancy" onChange={() => {}} />
          <InputField label="Calendar Sync Provider" type="text" value="Google Calendar" onChange={() => {}} />
          <ToggleSwitch label="Enable Microphone for Ambient Noise Detection" isChecked={true} onChange={() => { /* Toggle mic input */ }} />
          <Button onClick={() => { /* Save sensor settings */ }} className="mt-4">Save Sensor Settings</Button>
        </div>
      )}

      {state.activeSettingsTab === 'NOTIFICATIONS' && (
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
          <ToggleSwitch
            label="Enable Desktop Notifications"
            isChecked={state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId)?.personalSettings.notificationsEnabled || false}
            onChange={(checked) => dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: state.globalSettings.activeProfileId, updates: { personalSettings: { ...state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId)?.personalSettings, notificationsEnabled: checked } } } })}
          />
          <p className="text-gray-400 text-sm">Receive alerts for important updates and AI recommendations.</p>

          <h4 className="text-lg font-semibold text-white mt-6 mb-3">Recent Notifications</h4>
          {state.notifications.length === 0 && <p className="text-gray-400">No notifications.</p>}
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {state.notifications.map(notif => (
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
export const ProfilesSection: React.FC<ProfilesSectionProps> = ({ state, dispatch }) => {
  const activeProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);
  const [newSoundscapeName, setNewSoundscapeName] = useState('');
  const [newSoundscapeDescription, setNewSoundscapeDescription] = useState('');

  const handleCreateCustomSoundscape = () => {
    if (!activeProfile || !newSoundscapeName) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'WARNING', message: 'Soundscape name is required.', timestamp: new Date().toISOString(), isRead: false } });
      return;
    }

    const newCustomSoundscape: SoundscapePreset = {
      id: generateUniqueId(),
      name: newSoundscapeName,
      description: newSoundscapeDescription || 'A custom soundscape.',
      layers: JSON.parse(JSON.stringify(state.activeSoundscape.layers)), // Clone current layers
      adaptiveRules: [], // Start with no custom rules
      tags: ['custom', 'user-defined'],
      isCustom: true,
      createdByUserId: activeProfile.id,
      lastModified: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CUSTOM_SOUNDSCAPE_TO_PROFILE', payload: { userId: activeProfile.id, soundscape: newCustomSoundscape } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: `Custom soundscape "${newSoundscapeName}" created!`, timestamp: new Date().toISOString(), isRead: false } });
    setNewSoundscapeName('');
    setNewSoundscapeDescription('');
  };

  const handleDeleteCustomSoundscape = (soundscapeId: string) => {
    if (activeProfile) {
      dispatch({ type: 'DELETE_CUSTOM_SOUNDSCAPE_FROM_PROFILE', payload: { userId: activeProfile.id, soundscapeId } });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: generateUniqueId(), type: 'SUCCESS', message: 'Custom soundscape deleted.', timestamp: new Date().toISOString(), isRead: false } });
    }
  };

  const handleActivateCustomSoundscape = (soundscapeId: string) => {
    dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: soundscapeId, userId: activeProfile?.id } });
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
        <div className="space-y-6 bg-gray-700 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Your Profile: {activeProfile?.username}</h3>
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
            onChange={(value) => dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile!.id, updates: { username: value as string } } })}
          />
          <ToggleSwitch
            label="Enable Personal Notifications"
            isChecked={activeProfile?.personalSettings.notificationsEnabled || false}
            onChange={(checked) => dispatch({ type: 'UPDATE_USER_PROFILE', payload: { userId: activeProfile!.id, updates: { personalSettings: { ...activeProfile?.personalSettings, notificationsEnabled: checked } } } })}
          />
          <h4 className="text-lg font-semibold text-white mt-6 mb-3">Favorite Presets</h4>
          <div className="flex flex-wrap gap-2">
            {activeProfile?.favoritePresets.length === 0 && <p className="text-gray-400">No favorite presets.</p>}
            {activeProfile?.favoritePresets.map(presetId => {
              const preset = state.availablePresets.find(p => p.id === presetId) || activeProfile.customSoundscapes.find(cs => cs.id === presetId);
              return preset ? (
                <Button key={preset.id} onClick={() => dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: preset.id } })} variant="secondary" className="px-3 py-1 text-sm">
                  {preset.name}
                </Button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {state.activeProfileManagementTab === 'CUSTOM_SOUNDSCAPES' && (
        <div className="space-y-6">
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Custom Soundscape from Current Mix</h3>
            <InputField label="Soundscape Name" type="text" value={newSoundscapeName} onChange={(val) => setNewSoundscapeName(val as string)} placeholder="e.g., My Rainy Focus Blend" className="mb-2" />
            <InputField label="Description" type="text" value={newSoundscapeDescription} onChange={(val) => setNewSoundscapeDescription(val as string)} placeholder="Optional description for your custom mix" className="mb-4" />
            <Button onClick={handleCreateCustomSoundscape} className="w-full">Save Current Soundscape as New Custom</Button>
          </div>

          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Your Custom Soundscapes ({activeProfile?.customSoundscapes.length || 0})</h3>
            {activeProfile?.customSoundscapes.length === 0 && <p className="text-gray-400">You haven't created any custom soundscapes yet.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProfile?.customSoundscapes.map(cs => (
                <div key={cs.id} className="bg-gray-600 p-4 rounded-md shadow-sm">
                  <h4 className="text-lg font-medium text-cyan-300 mb-1">{cs.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{cs.description}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleActivateCustomSoundscape(cs.id)} variant="primary" className="px-3 py-1 text-sm">
                      Activate
                    </Button>
                    <Button onClick={() => handleDeleteCustomSoundscape(cs.id)} variant="danger" className="px-3 py-1 text-sm">
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
          <h3 className="text-xl font-semibold text-white mb-4">Your Playback History</h3>
          {activeProfile?.sessionHistory.length === 0 && <p className="text-gray-400">No playback history yet.</p>}
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {activeProfile?.sessionHistory.slice().reverse().map((session, index) => { // Show most recent first
              const preset = state.availablePresets.find(p => p.id === session.presetId) || activeProfile.customSoundscapes.find(cs