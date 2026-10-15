export type DeviceType = 
  | 'light' 
  | 'fan' 
  | 'ac' 
  | 'tv' 
  | 'shades' 
  | 'lock' 
  | 'sprinkler'
  | 'cooktop'
  | 'refrigerator'
  | 'microwave'
  | 'appliance';

export type RoomId = 
  | 'living_room' 
  | 'bedroom' 
  | 'kitchen' 
  | 'office' 
  | 'entryway' 
  | 'garden';

export interface Device {
  id: string;
  name: string;
  room: RoomId;
  type: DeviceType;
  isOn: boolean;
  value?: number; // brightness % (0-100), temp °C (16-30), fan speed (1-3)
  unit?: string;
  statusText?: string;
  color?: string;
  customActionLabel?: string;
  canSlide?: boolean;
}

export interface Room {
  id: RoomId;
  name: string;
  status: string;
  dotColor: 'green' | 'orange' | 'amber' | 'blue' | 'purple' | 'red';
  subtext: string;
  hasLock?: boolean;
  isLocked?: boolean;
  temperature?: number;
  motionDetected?: boolean;
}

export type IntentType = 
  | 'TURN_ON' 
  | 'TURN_OFF' 
  | 'TOGGLE' 
  | 'SET_TEMPERATURE' 
  | 'SET_BRIGHTNESS' 
  | 'OPEN_SHADES' 
  | 'CLOSE_SHADES' 
  | 'LOCK_ENTRY' 
  | 'UNLOCK_ENTRY' 
  | 'ALL_LIGHTS_ON' 
  | 'ALL_LIGHTS_OFF' 
  | 'ALL_DEVICES_OFF' 
  | 'ACTIVATE_SCENE' 
  | 'QUERY_STATUS' 
  | 'UNKNOWN';

export interface PipelineStage {
  step: number;
  name: string;
  description: string;
  input: string | any;
  output: string | any;
  status: 'pending' | 'success' | 'warning' | 'error';
  details?: Record<string, any>;
}

export type SofiaVoiceState = 
  | 'DISABLED'
  | 'WAITING_FOR_WAKE_WORD'
  | 'WAKE_WORD_DETECTED'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR';

export interface ParsedCommandResult {
  rawTranscript: string;
  preprocessedText: string;
  intent: IntentType;
  wakeWordDetected?: boolean;
  targetRoom?: RoomId | 'all';
  targetDeviceType?: DeviceType | 'all';
  specificDeviceId?: string;
  extractedValue?: number;
  sceneName?: string;
  confidence: number;
  validationSuccess: boolean;
  validationError?: string;
  feedbackMessage: string;
  affectedDeviceIds: string[];
  pipelineStages: PipelineStage[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  timeAgo: string;
  title: string;
  source: 'Sarah M.' | 'Automation' | 'Manual' | 'Voice Command' | 'Garage';
  category: 'security' | 'lighting' | 'climate' | 'power' | 'scene';
  commandText?: string;
  success: boolean;
  details?: string;
}

export interface SystemStats {
  totalDevices: number;
  activeDevices: number;
  processedCommands: number;
  currentPowerWatts: number;
}

export interface DevicePresetSetting {
  deviceId: string;
  isOn: boolean;
  value?: number; // brightness % (0-100), temp °C (16-30), fan speed (1-3)
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  icon: string; // e.g. 'Sun', 'Moon', 'Film', 'BookOpen', 'Shield', 'Coffee', 'Sparkles', 'Home', 'Tv', 'Zap'
  devices: DevicePresetSetting[];
  createdAt?: string;
  isCustom?: boolean;
}
