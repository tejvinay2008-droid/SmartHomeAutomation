import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Sun, 
  Moon, 
  Film, 
  BookOpen, 
  Shield, 
  Coffee, 
  Zap, 
  Home, 
  Tv, 
  Heart, 
  Wind, 
  Sliders, 
  Check, 
  Thermometer, 
  Plus, 
  Minus,
  AlertCircle
} from 'lucide-react';
import type { Device, Room, RoomId, Preset, DevicePresetSetting } from '../types';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreset: (preset: Preset) => void;
  existingPresets: Preset[];
  presetToEdit?: Preset | null;
  devices: Device[];
  rooms: Room[];
}

export const PRESET_ICONS = [
  { id: 'Sun', label: 'Sun', Icon: Sun },
  { id: 'Moon', label: 'Moon', Icon: Moon },
  { id: 'Film', label: 'Cinema', Icon: Film },
  { id: 'BookOpen', label: 'Study', Icon: BookOpen },
  { id: 'Shield', label: 'Security', Icon: Shield },
  { id: 'Coffee', label: 'Lounge', Icon: Coffee },
  { id: 'Zap', label: 'Eco/Energy', Icon: Zap },
  { id: 'Sparkles', label: 'Ambient', Icon: Sparkles },
  { id: 'Home', label: 'Welcome', Icon: Home },
  { id: 'Tv', label: 'Entertainment', Icon: Tv },
  { id: 'Heart', label: 'Cozy', Icon: Heart },
  { id: 'Wind', label: 'Ventilation', Icon: Wind },
];

export const renderPresetIcon = (iconName: string, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'Sun': return <Sun className={className} />;
    case 'Moon': return <Moon className={className} />;
    case 'Film': return <Film className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Wind': return <Wind className={className} />;
    default: return <Sparkles className={className} />;
  }
};

const TEMPLATE_EXAMPLES = [
  {
    name: 'Good Morning',
    description: 'Bright gentle lighting, open shades, comfortable climate',
    icon: 'Sun',
    getSettings: (devs: Device[]): DevicePresetSetting[] => [
      { deviceId: 'living_room_main', isOn: true, value: 80 },
      { deviceId: 'living_room_shades', isOn: true },
      { deviceId: 'bedroom_curtains', isOn: true },
      { deviceId: 'bedroom_ceiling_light', isOn: true, value: 70 },
      { deviceId: 'bedroom_ac', isOn: true, value: 23 },
      { deviceId: 'kitchen_light', isOn: true, value: 85 },
      { deviceId: 'kitchen_counter_light', isOn: true, value: 80 },
      { deviceId: 'living_room_tv', isOn: false }
    ].filter(s => devs.some(d => d.id === s.deviceId))
  },
  {
    name: 'Movie Night',
    description: 'Cinema TV on, dimmed ambient glow, and closed shades',
    icon: 'Film',
    getSettings: (devs: Device[]): DevicePresetSetting[] => [
      { deviceId: 'living_room_tv', isOn: true },
      { deviceId: 'living_room_main', isOn: true, value: 15 },
      { deviceId: 'reading_lamp', isOn: false },
      { deviceId: 'living_room_shades', isOn: false },
      { deviceId: 'bedroom_ceiling_light', isOn: false },
      { deviceId: 'kitchen_light', isOn: false }
    ].filter(s => devs.some(d => d.id === s.deviceId))
  },
  {
    name: 'Study Mode',
    description: 'Concentrated task lighting in office, calm ventilation',
    icon: 'BookOpen',
    getSettings: (devs: Device[]): DevicePresetSetting[] => [
      { deviceId: 'office_lights', isOn: true, value: 100 },
      { deviceId: 'reading_lamp', isOn: true, value: 90 },
      { deviceId: 'living_room_fan', isOn: true, value: 2 },
      { deviceId: 'living_room_tv', isOn: false },
      { deviceId: 'bedroom_ac', isOn: true, value: 21.5 }
    ].filter(s => devs.some(d => d.id === s.deviceId))
  },
  {
    name: 'Away Mode',
    description: 'Doors locked, all lights and appliances turned off',
    icon: 'Shield',
    getSettings: (devs: Device[]): DevicePresetSetting[] => 
      devs.map(d => ({
        deviceId: d.id,
        isOn: d.id === 'front_door_lock' ? true : false,
        value: d.type === 'light' ? 0 : d.value
      }))
  },
  {
    name: 'Good Night',
    description: 'Doors locked, soft bedside glow, cool sleep temperature',
    icon: 'Moon',
    getSettings: (devs: Device[]): DevicePresetSetting[] => [
      { deviceId: 'living_room_main', isOn: false },
      { deviceId: 'reading_lamp', isOn: false },
      { deviceId: 'living_room_tv', isOn: false },
      { deviceId: 'living_room_shades', isOn: false },
      { deviceId: 'bedroom_ceiling_light', isOn: false },
      { deviceId: 'bedroom_bedside_lamp', isOn: true, value: 10 },
      { deviceId: 'bedroom_curtains', isOn: false },
      { deviceId: 'bedroom_ac', isOn: true, value: 20 },
      { deviceId: 'kitchen_light', isOn: false },
      { deviceId: 'front_door_lock', isOn: true }
    ].filter(s => devs.some(d => d.id === s.deviceId))
  }
];

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onSavePreset,
  existingPresets,
  presetToEdit,
  devices,
  rooms
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<RoomId | 'all'>('all');
  const [deviceSettings, setDeviceSettings] = useState<Record<string, { included: boolean; isOn: boolean; value?: number }>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize or populate modal data when opened or when presetToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (presetToEdit) {
      setName(presetToEdit.name);
      setDescription(presetToEdit.description || '');
      setSelectedIcon(presetToEdit.icon || 'Sparkles');

      const settingsMap: Record<string, { included: boolean; isOn: boolean; value?: number }> = {};
      devices.forEach((d) => {
        const found = presetToEdit.devices.find((s) => s.deviceId === d.id);
        if (found) {
          settingsMap[d.id] = {
            included: true,
            isOn: found.isOn,
            value: found.value ?? d.value
          };
        } else {
          settingsMap[d.id] = {
            included: false,
            isOn: d.isOn,
            value: d.value
          };
        }
      });
      setDeviceSettings(settingsMap);
    } else {
      // Create new preset defaults
      setName('');
      setDescription('');
      setSelectedIcon('Sparkles');

      const settingsMap: Record<string, { included: boolean; isOn: boolean; value?: number }> = {};
      devices.forEach((d) => {
        settingsMap[d.id] = {
          included: d.room === 'living_room' || d.room === 'bedroom',
          isOn: d.isOn,
          value: d.value ?? (d.type === 'light' ? 80 : d.type === 'ac' ? 21 : 2)
        };
      });
      setDeviceSettings(settingsMap);
    }

    setValidationError(null);
  }, [isOpen, presetToEdit, devices]);

  if (!isOpen) return null;

  const handleApplyTemplate = (template: typeof TEMPLATE_EXAMPLES[0]) => {
    setName(template.name);
    setDescription(template.description);
    setSelectedIcon(template.icon);

    const templateSettings = template.getSettings(devices);
    const newSettings: Record<string, { included: boolean; isOn: boolean; value?: number }> = {};

    devices.forEach((d) => {
      const match = templateSettings.find((s) => s.deviceId === d.id);
      if (match) {
        newSettings[d.id] = {
          included: true,
          isOn: match.isOn,
          value: match.value ?? d.value
        };
      } else {
        newSettings[d.id] = {
          included: false,
          isOn: false,
          value: d.value
        };
      }
    });

    setDeviceSettings(newSettings);
    setValidationError(null);
  };

  const toggleIncludeDevice = (deviceId: string) => {
    setDeviceSettings((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        included: !prev[deviceId]?.included
      }
    }));
  };

  const toggleDeviceState = (deviceId: string) => {
    setDeviceSettings((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        isOn: !prev[deviceId]?.isOn
      }
    }));
  };

  const updateDeviceValue = (deviceId: string, value: number) => {
    setDeviceSettings((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError('Preset name is required.');
      return;
    }

    // Check duplicate name
    const isDuplicate = existingPresets.some(
      (p) =>
        p.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        p.id !== presetToEdit?.id
    );

    if (isDuplicate) {
      setValidationError(`A preset named "${trimmedName}" already exists. Please choose a distinct name.`);
      return;
    }

    const selectedDevices: DevicePresetSetting[] = Object.entries(deviceSettings)
      .filter(([_, conf]) => conf.included)
      .map(([deviceId, conf]) => ({
        deviceId,
        isOn: conf.isOn,
        value: conf.value
      }));

    if (selectedDevices.length === 0) {
      setValidationError('Please select at least one appliance for this preset.');
      return;
    }

    const newPreset: Preset = {
      id: presetToEdit ? presetToEdit.id : `preset_${Date.now()}`,
      name: trimmedName,
      description: description.trim() || undefined,
      icon: selectedIcon,
      devices: selectedDevices,
      createdAt: presetToEdit?.createdAt || new Date().toISOString(),
      isCustom: true
    };

    onSavePreset(newPreset);
    onClose();
  };

  const filteredDevices = devices.filter((d) => 
    selectedRoomFilter === 'all' ? true : d.room === selectedRoomFilter
  );

  const includedCount = Object.values(deviceSettings).filter((s) => s.included).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-md transition-opacity">
      <div 
        className="relative w-full max-w-3xl rounded-[32px] bg-[#10121a] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preset-modal-title"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="preset-modal-title" className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                {presetToEdit ? 'Edit Automation Preset' : 'Create Automation Preset'}
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {includedCount} {includedCount === 1 ? 'appliance' : 'appliances'}
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure one-tap multi-room appliance scenes with synchronized simulation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Example Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Quick Templates (Click to prefill)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_EXAMPLES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    name === tmpl.name
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                      : 'bg-white/[0.04] border-white/[0.06] text-gray-300 hover:bg-white/[0.08] hover:border-purple-500/40'
                  }`}
                >
                  {renderPresetIcon(tmpl.icon, 'w-3.5 h-3.5')}
                  <span>{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Notice */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Inputs Grid: Preset Name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preset-name" className="block text-xs font-medium text-gray-300 mb-1.5">
                Preset Name <span className="text-purple-400">*</span>
              </label>
              <input
                id="preset-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Movie Night, Reading Mode..."
                maxLength={40}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label htmlFor="preset-desc" className="block text-xs font-medium text-gray-300 mb-1.5">
                Description <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                id="preset-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dims living room lights and starts TV"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Preset Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Preset Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {PRESET_ICONS.map(({ id, label, Icon }) => {
                const isSelected = selectedIcon === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedIcon(id)}
                    title={label}
                    className={`h-11 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105'
                        : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Appliance Configuration Section */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>Target Appliances & States</span>
                  <span className="text-xs font-normal text-gray-400">
                    ({includedCount} active in this preset)
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Select appliances and define their state when this preset triggers.
                </p>
              </div>

              {/* Room Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setSelectedRoomFilter('all')}
                  className={`text-[11px] px-2.5 py-1 rounded-xl transition ${
                    selectedRoomFilter === 'all'
                      ? 'bg-purple-600 text-white font-medium'
                      : 'bg-white/[0.05] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  All ({devices.length})
                </button>
                {rooms.map((r) => {
                  const roomDevCount = devices.filter((d) => d.room === r.id).length;
                  if (roomDevCount === 0) return null;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoomFilter(r.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl transition shrink-0 ${
                        selectedRoomFilter === r.id
                          ? 'bg-purple-600 text-white font-medium'
                          : 'bg-white/[0.05] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {r.name} ({roomDevCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Devices List */}
            <div className="space-y-2.5">
              {filteredDevices.map((device) => {
                const conf = deviceSettings[device.id] || { included: false, isOn: false };
                const isIncluded = conf.included;
                const isOn = conf.isOn;
                const value = conf.value ?? device.value;

                return (
                  <div
                    key={device.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isIncluded
                        ? 'bg-[#181922] border-purple-500/30 shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.04] opacity-65 hover:opacity-90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Checkbox + Device Info */}
                      <div className="flex items-center gap-3">
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => toggleIncludeDevice(device.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                              isIncluded
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : 'border-white/20 bg-white/[0.04]'
                            }`}
                          >
                            {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </label>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{device.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400 capitalize">
                              {device.room.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-900/30 text-purple-300 border border-purple-700/30 uppercase font-mono">
                              {device.type}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            {isIncluded
                              ? `Preset Target: ${isOn ? 'Turn ON' : 'Turn OFF'}${
                                  isOn && device.type === 'ac' ? ` • ${value ?? 21}°C` : ''
                                }${
                                  isOn && device.type === 'light' ? ` • ${value ?? 80}% brightness` : ''
                                }${
                                  isOn && device.type === 'shades' ? ' • Open' : !isOn && device.type === 'shades' ? ' • Closed' : ''
                                }`
                              : 'Not configured in this preset'}
                          </span>
                        </div>
                      </div>

                      {/* Right: State Selector & Dynamic Controls */}
                      {isIncluded ? (
                        <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
                          {/* ON / OFF Switch */}
                          <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isOn) toggleDeviceState(device.id);
                              }}
                              className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                                isOn
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              ON
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (isOn) toggleDeviceState(device.id);
                              }}
                              className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                                !isOn
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              OFF
                            </button>
                          </div>

                          {/* Specific appliance controls when ON */}
                          {isOn && device.type === 'ac' && (
                            <div className="flex items-center gap-1.5 bg-sky-950/40 px-2.5 py-1 rounded-xl border border-sky-500/30 text-xs text-sky-300">
                              <Thermometer className="w-3.5 h-3.5" />
                              <button
                                type="button"
                                onClick={() => updateDeviceValue(device.id, Math.max(16, (value || 21) - 0.5))}
                                className="p-1 hover:bg-white/10 rounded cursor-pointer"
                                title="Decrease Temperature"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-semibold px-1">{value ?? 20.5}°C</span>
                              <button
                                type="button"
                                onClick={() => updateDeviceValue(device.id, Math.min(30, (value || 21) + 0.5))}
                                className="p-1 hover:bg-white/10 rounded cursor-pointer"
                                title="Increase Temperature"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {isOn && device.type === 'light' && (
                            <div className="flex items-center gap-2 bg-amber-950/30 px-3 py-1 rounded-xl border border-amber-500/30">
                              <span className="text-xs text-amber-300 font-mono font-medium min-w-[34px]">
                                {value ?? 80}%
                              </span>
                              <input
                                type="range"
                                min={10}
                                max={100}
                                step={5}
                                value={value ?? 80}
                                onChange={(e) => updateDeviceValue(device.id, parseInt(e.target.value, 10))}
                                className="w-20 accent-amber-400 cursor-pointer"
                              />
                            </div>
                          )}

                          {isOn && device.type === 'fan' && (
                            <div className="flex items-center gap-1 bg-sky-950/30 px-2 py-0.5 rounded-xl border border-sky-500/20 text-xs text-sky-300">
                              <span className="text-[10px] text-gray-400 mr-1">Speed</span>
                              {[1, 2, 3].map((spd) => (
                                <button
                                  key={spd}
                                  type="button"
                                  onClick={() => updateDeviceValue(device.id, spd)}
                                  className={`w-6 h-6 rounded-lg text-xs font-semibold cursor-pointer ${
                                    (value ?? 2) === spd
                                      ? 'bg-sky-500 text-white'
                                      : 'hover:bg-white/10 text-gray-400'
                                  }`}
                                >
                                  {spd}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleIncludeDevice(device.id)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/40 transition cursor-pointer"
                        >
                          + Include
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/[0.05] transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:inline">
              {includedCount} {includedCount === 1 ? 'device' : 'devices'} configured
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{presetToEdit ? 'Save Changes' : 'Save Preset'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
