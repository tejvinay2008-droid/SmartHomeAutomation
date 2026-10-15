import type { Device, Room, ActivityLog, Preset } from '../types';

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'living_room_main',
    name: 'Main Ceiling',
    room: 'living_room',
    type: 'light',
    isOn: true,
    value: 80,
    unit: '%',
    color: '#eab308',
    canSlide: true,
    statusText: '80%'
  },
  {
    id: 'reading_lamp',
    name: 'Reading Lamp',
    room: 'living_room',
    type: 'light',
    isOn: true,
    value: 40,
    unit: '%',
    color: '#f59e0b',
    canSlide: true,
    statusText: '40%'
  },
  {
    id: 'living_room_fan',
    name: 'Air Circulator',
    room: 'living_room',
    type: 'fan',
    isOn: true,
    value: 2,
    unit: 'spd',
    color: '#38bdf8',
    statusText: 'Speed 2'
  },
  {
    id: 'living_room_shades',
    name: 'Window Shades',
    room: 'living_room',
    type: 'shades',
    isOn: false, // false = closed, true = open
    color: '#818cf8',
    statusText: 'Closed',
    customActionLabel: 'Open'
  },
  {
    id: 'living_room_tv',
    name: 'Living Room TV',
    room: 'living_room',
    type: 'tv',
    isOn: true,
    color: '#a855f7',
    statusText: 'Active • 4K HDMI 1'
  },
  {
    id: 'living_room_ac',
    name: 'Living Room AC',
    room: 'living_room',
    type: 'ac',
    isOn: true,
    value: 22,
    unit: '°C',
    color: '#38bdf8',
    canSlide: true,
    statusText: 'Cooling • 22°C'
  },
  {
    id: 'bedroom_ceiling_light',
    name: 'Bedroom Ceiling',
    room: 'bedroom',
    type: 'light',
    isOn: true,
    value: 75,
    unit: '%',
    color: '#eab308',
    canSlide: true,
    statusText: '75%'
  },
  {
    id: 'bedroom_bedside_lamp',
    name: 'Bedside Lamp',
    room: 'bedroom',
    type: 'light',
    isOn: true,
    value: 50,
    unit: '%',
    color: '#f59e0b',
    canSlide: true,
    statusText: '50%'
  },
  {
    id: 'bedroom_ac',
    name: 'Bedroom AC',
    room: 'bedroom',
    type: 'ac',
    isOn: true,
    value: 20.5,
    unit: '°C',
    color: '#38bdf8',
    statusText: 'Cooling • 20.5°C'
  },
  {
    id: 'bedroom_fan',
    name: 'Bedroom Fan',
    room: 'bedroom',
    type: 'fan',
    isOn: false,
    value: 2,
    unit: 'spd',
    color: '#38bdf8',
    statusText: 'Off'
  },
  {
    id: 'bedroom_curtains',
    name: 'Bedroom Curtains',
    room: 'bedroom',
    type: 'shades',
    isOn: false,
    color: '#a855f7',
    statusText: 'Closed',
    customActionLabel: 'Open'
  },
  {
    id: 'kitchen_light',
    name: 'Kitchen Ceiling',
    room: 'kitchen',
    type: 'light',
    isOn: true,
    value: 90,
    unit: '%',
    color: '#eab308',
    canSlide: true,
    statusText: '90%'
  },
  {
    id: 'kitchen_counter_light',
    name: 'Counter Lights',
    room: 'kitchen',
    type: 'light',
    isOn: true,
    value: 80,
    unit: '%',
    color: '#f59e0b',
    canSlide: true,
    statusText: '80%'
  },
  {
    id: 'kitchen_exhaust_fan',
    name: 'Exhaust Fan',
    room: 'kitchen',
    type: 'fan',
    isOn: false,
    color: '#38bdf8',
    statusText: 'Off'
  },
  {
    id: 'kitchen_cooktop',
    name: 'Induction Cooktop',
    room: 'kitchen',
    type: 'cooktop',
    isOn: false,
    color: '#ef4444',
    statusText: 'Off'
  },
  {
    id: 'kitchen_fridge',
    name: 'Smart Refrigerator',
    room: 'kitchen',
    type: 'refrigerator',
    isOn: true,
    color: '#06b6d4',
    statusText: 'Eco Mode • 3°C'
  },
  {
    id: 'kitchen_microwave',
    name: 'Microwave',
    room: 'kitchen',
    type: 'microwave',
    isOn: false,
    color: '#a855f7',
    statusText: 'Standby'
  },
  {
    id: 'office_lights',
    name: 'Office Ceiling',
    room: 'office',
    type: 'light',
    isOn: true,
    value: 70,
    unit: '%',
    color: '#eab308',
    statusText: '70%'
  },
  {
    id: 'front_door_lock',
    name: 'Front Door Lock',
    room: 'entryway',
    type: 'lock',
    isOn: true, // locked
    color: '#ef4444',
    statusText: 'Locked'
  },
  {
    id: 'garden_sprinklers',
    name: 'Smart Sprinklers',
    room: 'garden',
    type: 'sprinkler',
    isOn: false,
    color: '#06b6d4',
    statusText: 'Off • Next: 6PM'
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'living_room',
    name: 'Living Room',
    status: 'Climate Controlled • Optimal',
    dotColor: 'purple',
    subtext: 'Target 22.0°C',
    temperature: 22.0
  },
  {
    id: 'office',
    name: 'Office',
    status: 'Motion Detected • 1m ago',
    dotColor: 'green',
    subtext: '2 Devices Active',
    motionDetected: true
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    status: 'Climate Controlled',
    dotColor: 'amber',
    subtext: '20.5°C Target',
    temperature: 20.5
  },
  {
    id: 'entryway',
    name: 'Entryway',
    status: 'Locked • Secured 3 min ago',
    dotColor: 'red',
    subtext: 'Deadbolt Engaged',
    hasLock: true,
    isLocked: true
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    status: 'Idle • Last activity 1h ago',
    dotColor: 'orange',
    subtext: 'All Appliances Off'
  },
  {
    id: 'garden',
    name: 'Garden',
    status: 'Sprinklers Off • Next: 6PM',
    dotColor: 'blue',
    subtext: 'Soil Moisture 64%'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: '2026-10-13T16:28:00Z',
    timeAgo: '2 mins ago',
    title: 'Front Door unlocked',
    source: 'Sarah M.',
    category: 'security',
    success: true
  },
  {
    id: 'act-2',
    timestamp: '2026-10-13T16:15:00Z',
    timeAgo: '15 mins ago',
    title: 'Living Room set to "Focus"',
    source: 'Automation',
    category: 'scene',
    success: true
  },
  {
    id: 'act-3',
    timestamp: '2026-10-13T15:30:00Z',
    timeAgo: '1 hour ago',
    title: 'Thermostat adjusted to 20°C',
    source: 'Manual',
    category: 'climate',
    success: true
  },
  {
    id: 'act-4',
    timestamp: '2026-10-13T13:30:00Z',
    timeAgo: '3 hours ago',
    title: 'EV Charging Started',
    source: 'Garage',
    category: 'power',
    success: true
  },
  {
    id: 'act-5',
    timestamp: '2026-10-12T23:30:00Z',
    timeAgo: 'Yesterday, 11:30 PM',
    title: '"Good Night" Scene',
    source: 'Automation',
    category: 'scene',
    success: true
  },
  {
    id: 'act-6',
    timestamp: '2026-10-12T22:45:00Z',
    timeAgo: 'Yesterday 10:45 PM',
    title: 'Garage Door Opened',
    source: 'Sarah M.',
    category: 'security',
    success: true
  },
  {
    id: 'act-7',
    timestamp: '2026-10-12T21:30:00Z',
    timeAgo: 'Yesterday 9:30 PM',
    title: 'Bedroom set to "Sleep"',
    source: 'Automation',
    category: 'scene',
    success: true
  },
  {
    id: 'act-8',
    timestamp: '2026-10-12T21:28:00Z',
    timeAgo: 'Yesterday 9:28 PM',
    title: 'Thermostat adjusted to 18°C',
    source: 'Manual',
    category: 'climate',
    success: true
  },
  {
    id: 'act-9',
    timestamp: '2026-10-12T17:30:00Z',
    timeAgo: 'Yesterday 5:30 PM',
    title: 'EV Charging Completed',
    source: 'Garage',
    category: 'power',
    success: true
  }
];

export const HOURLY_ENERGY_DATA = [
  { time: '06:00', watts: 320, lights: 80, hvac: 180, other: 60 },
  { time: '08:00', watts: 750, lights: 140, hvac: 420, other: 190 },
  { time: '10:00', watts: 520, lights: 60, hvac: 320, other: 140 },
  { time: '12:00', watts: 610, lights: 40, hvac: 410, other: 160 },
  { time: '14:00', watts: 880, lights: 50, hvac: 640, other: 190 },
  { time: '16:00', watts: 690, lights: 70, hvac: 480, other: 140 },
  { time: '18:00', watts: 1150, lights: 210, hvac: 690, other: 250 },
  { time: '20:00', watts: 940, lights: 190, hvac: 550, other: 200 },
  { time: '22:00', watts: 460, lights: 90, hvac: 290, other: 80 },
];

export const INITIAL_PRESETS: Preset[] = [
  {
    id: 'preset_good_morning',
    name: 'Good Morning',
    description: 'Opens living and bedroom shades, sets gentle morning lighting, and readies the kitchen.',
    icon: 'Sun',
    devices: [
      { deviceId: 'living_room_main', isOn: true, value: 80 },
      { deviceId: 'reading_lamp', isOn: false },
      { deviceId: 'living_room_shades', isOn: true },
      { deviceId: 'living_room_tv', isOn: false },
      { deviceId: 'bedroom_curtains', isOn: true },
      { deviceId: 'bedroom_ceiling_light', isOn: true, value: 70 },
      { deviceId: 'bedroom_ac', isOn: true, value: 23 },
      { deviceId: 'kitchen_light', isOn: true, value: 85 },
      { deviceId: 'kitchen_counter_light', isOn: true, value: 80 }
    ],
    createdAt: '2026-10-14T07:00:00Z',
    isCustom: false
  },
  {
    id: 'preset_movie_night',
    name: 'Movie Night',
    description: 'Turns on the living room 4K TV, dims ambient lighting to 15%, and closes window shades.',
    icon: 'Film',
    devices: [
      { deviceId: 'living_room_tv', isOn: true },
      { deviceId: 'living_room_main', isOn: true, value: 15 },
      { deviceId: 'reading_lamp', isOn: false },
      { deviceId: 'living_room_shades', isOn: false },
      { deviceId: 'living_room_fan', isOn: true, value: 1 },
      { deviceId: 'bedroom_ceiling_light', isOn: false },
      { deviceId: 'kitchen_light', isOn: false }
    ],
    createdAt: '2026-10-14T19:30:00Z',
    isCustom: false
  },
  {
    id: 'preset_study_mode',
    name: 'Study Mode',
    description: 'Max focus illumination in office, reading lamp on, active ventilation, and entertainment silenced.',
    icon: 'BookOpen',
    devices: [
      { deviceId: 'office_lights', isOn: true, value: 100 },
      { deviceId: 'reading_lamp', isOn: true, value: 90 },
      { deviceId: 'living_room_fan', isOn: true, value: 2 },
      { deviceId: 'living_room_tv', isOn: false },
      { deviceId: 'bedroom_ac', isOn: true, value: 21.5 }
    ],
    createdAt: '2026-10-14T14:00:00Z',
    isCustom: false
  },
  {
    id: 'preset_away_mode',
    name: 'Away Mode',
    description: 'Secures front deadbolt, shuts down all lighting and appliances for total security and eco savings.',
    icon: 'Shield',
    devices: [
      { deviceId: 'living_room_main', isOn: false },
      { deviceId: 'reading_lamp', isOn: false },
      { deviceId: 'living_room_tv', isOn: false },
      { deviceId: 'living_room_fan', isOn: false },
      { deviceId: 'living_room_shades', isOn: false },
      { deviceId: 'bedroom_ceiling_light', isOn: false },
      { deviceId: 'bedroom_bedside_lamp', isOn: false },
      { deviceId: 'bedroom_ac', isOn: false },
      { deviceId: 'bedroom_fan', isOn: false },
      { deviceId: 'bedroom_curtains', isOn: false },
      { deviceId: 'kitchen_light', isOn: false },
      { deviceId: 'kitchen_counter_light', isOn: false },
      { deviceId: 'kitchen_cooktop', isOn: false },
      { deviceId: 'kitchen_microwave', isOn: false },
      { deviceId: 'office_lights', isOn: false },
      { deviceId: 'front_door_lock', isOn: true }
    ],
    createdAt: '2026-10-14T09:00:00Z',
    isCustom: false
  },
  {
    id: 'preset_good_night',
    name: 'Good Night',
    description: 'Locks entryways, dims bedside lamp to nightlight, closes curtains, and optimizes cool sleeping climate.',
    icon: 'Moon',
    devices: [
      { deviceId: 'living_room_main', isOn: false },
      { deviceId: 'reading_lamp', isOn: false },
      { deviceId: 'living_room_tv', isOn: false },
      { deviceId: 'living_room_shades', isOn: false },
      { deviceId: 'bedroom_ceiling_light', isOn: false },
      { deviceId: 'bedroom_bedside_lamp', isOn: true, value: 10 },
      { deviceId: 'bedroom_curtains', isOn: false },
      { deviceId: 'bedroom_ac', isOn: true, value: 20 },
      { deviceId: 'bedroom_fan', isOn: true, value: 1 },
      { deviceId: 'kitchen_light', isOn: false },
      { deviceId: 'kitchen_counter_light', isOn: false },
      { deviceId: 'front_door_lock', isOn: true }
    ],
    createdAt: '2026-10-14T23:00:00Z',
    isCustom: false
  }
];

