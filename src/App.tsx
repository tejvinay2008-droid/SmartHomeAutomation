import React, { useState, useEffect } from 'react';
import { 
  INITIAL_DEVICES, 
  INITIAL_ROOMS, 
  INITIAL_ACTIVITIES,
  INITIAL_PRESETS
} from './services/mockData';
import type { 
  Device, 
  Room, 
  RoomId,
  ActivityLog, 
  SystemStats, 
  ParsedCommandResult,
  Preset
} from './types';
import { parseCommand } from './services/commandParser';
import { Header } from './components/Header';
import { InteractiveRoomSimulation } from './components/InteractiveRoomSimulation';
import { ApplianceCard } from './components/ApplianceCard';
import { RoomCard } from './components/RoomCard';
import { RecentActivity } from './components/RecentActivity';
import { EnergyAnalytics } from './components/EnergyAnalytics';
import { VoiceModal } from './components/VoiceModal';
import { SofiaVoicePanel } from './components/SofiaVoicePanel';
import { SofiaVoiceProvider } from './context/SofiaVoiceContext';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { PresetModal } from './components/PresetModal';
import { PresetsSection } from './components/PresetsSection';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { 
  Volume2, 
  Sparkles, 
  Info,
  ShieldAlert,
  LogIn,
  UserCheck,
  Plus
} from 'lucide-react';

export const App: React.FC = () => {
  const { user, isFirebaseActive, login } = useAuth();
  const { theme } = useTheme();

  // User-scoped persistent storage keys
  const userKey = user ? user.uid : 'guest';

  // Helper to ensure new devices in INITIAL_DEVICES are merged with any existing localStorage data
  const mergeDevicesWithDefaults = (saved: Device[]): Device[] => {
    const existingIds = new Set(saved.map((d) => d.id));
    const missing = INITIAL_DEVICES.filter((d) => !existingIds.has(d.id));
    return [...saved, ...missing];
  };

  // 1. User-specific State Initialization
  const [devices, setDevices] = useState<Device[]>(() => {
    try {
      const saved = localStorage.getItem(`smarthome_devices_${userKey}`);
      return saved ? mergeDevicesWithDefaults(JSON.parse(saved)) : INITIAL_DEVICES;
    } catch {
      return INITIAL_DEVICES;
    }
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(`smarthome_rooms_${userKey}`);
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(`smarthome_activities_${userKey}`);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [commandCount, setCommandCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`smarthome_command_count_${userKey}`);
      return saved ? parseInt(saved, 10) : 24;
    } catch {
      return 24;
    }
  });

  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const saved = localStorage.getItem(`smarthome_presets_${userKey}`);
      return saved ? JSON.parse(saved) : INITIAL_PRESETS;
    } catch {
      return INITIAL_PRESETS;
    }
  });

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<Preset | null>(null);

  // Re-load user data when user changes
  useEffect(() => {
    try {
      const savedDevices = localStorage.getItem(`smarthome_devices_${userKey}`);
      setDevices(savedDevices ? mergeDevicesWithDefaults(JSON.parse(savedDevices)) : INITIAL_DEVICES);

      const savedRooms = localStorage.getItem(`smarthome_rooms_${userKey}`);
      setRooms(savedRooms ? JSON.parse(savedRooms) : INITIAL_ROOMS);

      const savedActs = localStorage.getItem(`smarthome_activities_${userKey}`);
      setActivities(savedActs ? JSON.parse(savedActs) : INITIAL_ACTIVITIES);

      const savedCount = localStorage.getItem(`smarthome_command_count_${userKey}`);
      setCommandCount(savedCount ? parseInt(savedCount, 10) : 24);

      const savedPresets = localStorage.getItem(`smarthome_presets_${userKey}`);
      setPresets(savedPresets ? JSON.parse(savedPresets) : INITIAL_PRESETS);
    } catch {
      setDevices(INITIAL_DEVICES);
      setRooms(INITIAL_ROOMS);
      setActivities(INITIAL_ACTIVITIES);
      setCommandCount(24);
      setPresets(INITIAL_PRESETS);
    }
  }, [userKey]);

  // UI modal states
  const [selectedRoom, setSelectedRoom] = useState<RoomId>('living_room');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [lastParsedResult, setLastParsedResult] = useState<ParsedCommandResult | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to user-scoped localStorage
  useEffect(() => {
    if (userKey) {
      localStorage.setItem(`smarthome_devices_${userKey}`, JSON.stringify(devices));
    }
  }, [devices, userKey]);

  useEffect(() => {
    if (userKey) {
      localStorage.setItem(`smarthome_rooms_${userKey}`, JSON.stringify(rooms));
    }
  }, [rooms, userKey]);

  useEffect(() => {
    if (userKey) {
      localStorage.setItem(`smarthome_activities_${userKey}`, JSON.stringify(activities));
    }
  }, [activities, userKey]);

  useEffect(() => {
    if (userKey) {
      localStorage.setItem(`smarthome_command_count_${userKey}`, commandCount.toString());
    }
  }, [commandCount, userKey]);

  useEffect(() => {
    if (userKey) {
      localStorage.setItem(`smarthome_presets_${userKey}`, JSON.stringify(presets));
    }
  }, [presets, userKey]);

  // Toast Helper
  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 2. Appliance Toggle Handler
  const handleToggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === id) {
          const nextState = !dev.isOn;
          let statusText = nextState ? 'Running' : 'Turned off';
          if (dev.type === 'shades') {
            statusText = nextState ? 'Open' : 'Closed';
          } else if (dev.type === 'cooktop') {
            statusText = nextState ? 'Heating • Active' : 'Off';
          } else if (dev.type === 'refrigerator') {
            statusText = nextState ? 'Eco Mode • 3°C' : 'Standby';
          } else if (dev.type === 'microwave') {
            statusText = nextState ? 'Heating • 01:30' : 'Standby';
          } else if (dev.type === 'light') {
            statusText = nextState ? `${dev.value ?? 80}%` : 'Off';
          } else if (dev.type === 'ac') {
            statusText = nextState ? `Cooling • ${dev.value ?? 20.5}°C` : 'Off';
          } else if (dev.type === 'fan') {
            statusText = nextState ? 'Active' : 'Off';
          }

          logActivity(
            `${dev.name} ${nextState ? 'switched ON' : 'switched OFF'}`,
            (user?.displayName as any) || 'Manual',
            dev.type === 'light' ? 'lighting' : dev.type === 'fan' ? 'power' : dev.type === 'ac' ? 'climate' : 'scene',
            true
          );

          addToast('info', `${dev.name}`, nextState ? 'Turned ON' : 'Turned OFF');
          return { ...dev, isOn: nextState, statusText };
        }
        return dev;
      })
    );
  };

  // Slider change for dimming/values
  const handleDeviceValueChange = (id: string, value: number) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === id) {
          if (dev.type === 'ac') {
            return { ...dev, value, statusText: `Cooling • ${value}°C`, isOn: true };
          }
          return { ...dev, value, statusText: `${value}%`, isOn: value > 0 };
        }
        return dev;
      })
    );
  };

  // Room Toggle Handler
  const handleToggleRoom = (roomId: string) => {
    const roomDevices = devices.filter((d) => d.room === roomId);
    const anyOn = roomDevices.some((d) => d.isOn);
    const newState = !anyOn;

    setDevices((prev) =>
      prev.map((d) => {
        if (d.room === roomId) {
          return { ...d, isOn: newState };
        }
        return d;
      })
    );

    const roomName = rooms.find((r) => r.id === roomId)?.name || roomId;
    logActivity(
      `${roomName} devices ${newState ? 'turned ON' : 'turned OFF'}`,
      (user?.displayName as any) || 'Manual',
      'lighting',
      true
    );

    addToast('info', `${roomName}`, `All room appliances ${newState ? 'activated' : 'deactivated'}`);
  };

  // Room Temp Adjuster
  const handleRoomTempChange = (roomId: string, delta: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && r.temperature !== undefined) {
          const newTemp = Math.round((r.temperature + delta) * 10) / 10;
          return { ...r, temperature: newTemp, status: `Target: ${newTemp}°C` };
        }
        return r;
      })
    );

    if (roomId === 'bedroom') {
      setDevices((prev) =>
        prev.map((d) => (d.id === 'bedroom_ac' ? { ...d, value: (d.value || 20.5) + delta } : d))
      );
    }
  };

  // Entryway Lock Toggle
  const handleToggleLock = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && r.hasLock) {
          const nextLock = !r.isLocked;
          const status = nextLock ? 'Locked • Secured just now' : 'Unlocked • Access granted';

          logActivity(
            nextLock ? 'Front Door locked' : 'Front Door unlocked',
            (user?.displayName as any) || 'Sarah M.',
            'security',
            true
          );

          addToast(nextLock ? 'success' : 'info', 'Entryway Security', nextLock ? 'Deadbolt engaged' : 'Front door unlocked');
          return { ...r, isLocked: nextLock, status };
        }
        return r;
      })
    );
  };

  // Preset Handlers
  const handleOpenAddPresetModal = () => {
    setPresetToEdit(null);
    setIsPresetModalOpen(true);
  };

  const handleOpenEditPresetModal = (preset: Preset) => {
    setPresetToEdit(preset);
    setIsPresetModalOpen(true);
  };

  const handleSavePreset = (savedPreset: Preset) => {
    setPresets((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === savedPreset.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedPreset;
        return updated;
      }
      return [savedPreset, ...prev];
    });

    logActivity(
      `Preset "${savedPreset.name}" ${presetToEdit ? 'updated' : 'created'}`,
      (user?.displayName as any) || 'Manual',
      'scene',
      true
    );

    addToast(
      'success',
      presetToEdit ? 'Preset Updated' : 'Preset Created',
      `"${savedPreset.name}" configured with ${savedPreset.devices.length} appliances.`
    );
  };

  const handleDeletePreset = (presetId: string) => {
    const target = presets.find((p) => p.id === presetId);
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }

    if (target) {
      logActivity(
        `Preset "${target.name}" removed`,
        (user?.displayName as any) || 'Manual',
        'scene',
        true
      );
    }

    addToast('info', 'Preset Deleted', 'The preset configuration has been removed.');
  };

  const handleActivatePreset = (preset: Preset) => {
    // 1. Update appliances state
    setDevices((prev) =>
      prev.map((d) => {
        const conf = preset.devices.find((s) => s.deviceId === d.id);
        if (!conf) return d;
        const nextState = conf.isOn;
        const nextValue = conf.value !== undefined ? conf.value : d.value;

        let statusText = nextState ? 'Running' : 'Turned off';
        if (d.type === 'shades') {
          statusText = nextState ? 'Open' : 'Closed';
        } else if (d.type === 'cooktop') {
          statusText = nextState ? 'Heating • Active' : 'Off';
        } else if (d.type === 'refrigerator') {
          statusText = nextState ? 'Eco Mode • 3°C' : 'Standby';
        } else if (d.type === 'microwave') {
          statusText = nextState ? 'Heating • 01:30' : 'Standby';
        } else if (d.type === 'light') {
          statusText = nextState ? `${nextValue ?? 80}%` : 'Off';
        } else if (d.type === 'ac') {
          statusText = nextState ? `Cooling • ${nextValue ?? 20.5}°C` : 'Off';
        } else if (d.type === 'fan') {
          statusText = nextState ? (nextValue ? `Speed ${nextValue}` : 'Active') : 'Off';
        } else if (d.type === 'lock') {
          statusText = nextState ? 'Locked' : 'Unlocked';
        }

        return {
          ...d,
          isOn: nextState,
          value: nextValue,
          statusText,
        };
      })
    );

    // 2. Synchronize room status if preset touches climate or locks
    const acConf = preset.devices.find((s) => s.deviceId === 'bedroom_ac');
    if (acConf) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === 'bedroom'
            ? {
                ...r,
                temperature: acConf.value ?? r.temperature,
                status: acConf.isOn
                  ? `Target: ${acConf.value ?? 20.5}°C`
                  : 'Climate Standby',
              }
            : r
        )
      );
    }

    const lockConf = preset.devices.find((s) => s.deviceId === 'front_door_lock');
    if (lockConf) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === 'entryway'
            ? {
                ...r,
                isLocked: lockConf.isOn,
                status: lockConf.isOn
                  ? 'Locked • Secured just now'
                  : 'Unlocked • Access granted',
              }
            : r
        )
      );
    }

    setActivePresetId(preset.id);

    // 3. Log to activity history
    logActivity(
      `Preset "${preset.name}" activated`,
      (user?.displayName as any) || 'Manual',
      'scene',
      true
    );

    // 4. Show success toast notification
    addToast(
      'success',
      'Preset Activated',
      `"${preset.name}" applied across ${preset.devices.length} configured appliances.`
    );
  };

  // 3. Central Command Execution (Voice / Text)
  const handleExecuteCommand = (rawText: string): ParsedCommandResult => {
    const result = parseCommand(rawText, devices);
    setLastParsedResult(result);
    setCommandCount((c) => c + 1);

    if (result.targetRoom && result.targetRoom !== 'all') {
      setSelectedRoom(result.targetRoom as RoomId);
    }

    if (result.validationSuccess) {
      if (result.intent === 'ALL_DEVICES_OFF') {
        setDevices((prev) => prev.map((d) => {
          if (result.targetRoom && result.targetRoom !== 'all' && d.room !== result.targetRoom) {
            return d;
          }
          return { 
            ...d, 
            isOn: false,
            statusText: d.type === 'shades' ? 'Closed' : (d.type === 'tv' || d.type === 'refrigerator' || d.type === 'microwave') ? 'Standby' : 'Off'
          };
        }));
      } else if (result.intent === 'ALL_LIGHTS_ON') {
        setDevices((prev) => prev.map((d) => {
          if (d.type !== 'light') return d;
          if (result.targetRoom && result.targetRoom !== 'all' && d.room !== result.targetRoom) return d;
          return { 
            ...d, 
            isOn: true,
            statusText: `${d.value ?? 80}%`
          };
        }));
      } else if (result.intent === 'ALL_LIGHTS_OFF') {
        setDevices((prev) => prev.map((d) => {
          if (d.type !== 'light') return d;
          if (result.targetRoom && result.targetRoom !== 'all' && d.room !== result.targetRoom) return d;
          return { 
            ...d, 
            isOn: false,
            statusText: 'Off'
          };
        }));
      } else if (result.intent === 'OPEN_SHADES') {
        setDevices((prev) => prev.map((d) => {
          if (result.affectedDeviceIds.length > 0 ? result.affectedDeviceIds.includes(d.id) : (d.type === 'shades' && (!result.targetRoom || result.targetRoom === 'all' || d.room === result.targetRoom))) {
            return { ...d, isOn: true, statusText: 'Open' };
          }
          return d;
        }));
      } else if (result.intent === 'CLOSE_SHADES') {
        setDevices((prev) => prev.map((d) => {
          if (result.affectedDeviceIds.length > 0 ? result.affectedDeviceIds.includes(d.id) : (d.type === 'shades' && (!result.targetRoom || result.targetRoom === 'all' || d.room === result.targetRoom))) {
            return { ...d, isOn: false, statusText: 'Closed' };
          }
          return d;
        }));
      } else if (result.intent === 'UNLOCK_ENTRY') {
        setRooms((prev) => prev.map((r) => (r.id === 'entryway' ? { ...r, isLocked: false, status: 'Unlocked • Access granted' } : r)));
      } else if (result.intent === 'LOCK_ENTRY') {
        setRooms((prev) => prev.map((r) => (r.id === 'entryway' ? { ...r, isLocked: true, status: 'Locked • Secured just now' } : r)));
      } else if (result.intent === 'SET_TEMPERATURE' && result.extractedValue !== undefined) {
        setDevices((prev) =>
          prev.map((d) =>
            result.affectedDeviceIds.includes(d.id)
              ? { ...d, isOn: true, value: result.extractedValue, statusText: `Cooling • ${result.extractedValue}°C` }
              : d
          )
        );
        setRooms((prev) =>
          prev.map((r) =>
            (result.targetRoom && r.id === result.targetRoom) || (!result.targetRoom && r.id === 'bedroom')
              ? { ...r, temperature: result.extractedValue, status: `Target: ${result.extractedValue}°C` }
              : r
          )
        );
      } else if (result.intent === 'TURN_ON') {
        setDevices((prev) =>
          prev.map((d) => {
            if (result.affectedDeviceIds.includes(d.id)) {
              let statusText = 'Running';
              if (d.type === 'light') statusText = `${d.value ?? 80}%`;
              else if (d.type === 'fan') statusText = 'Active';
              else if (d.type === 'shades') statusText = 'Open';
              else if (d.type === 'tv') statusText = 'Active • 4K HDMI 1';
              else if (d.type === 'ac') statusText = `Cooling • ${d.value ?? 20.5}°C`;
              else if (d.type === 'cooktop') statusText = 'Heating • Active';
              else if (d.type === 'refrigerator') statusText = 'Eco Mode • 3°C';
              else if (d.type === 'microwave') statusText = 'Heating • 01:30';
              return { ...d, isOn: true, statusText };
            }
            return d;
          })
        );
      } else if (result.intent === 'TURN_OFF') {
        setDevices((prev) =>
          prev.map((d) => {
            if (result.affectedDeviceIds.includes(d.id)) {
              let statusText = 'Off';
              if (d.type === 'shades') statusText = 'Closed';
              else if (d.type === 'tv' || d.type === 'refrigerator' || d.type === 'microwave') statusText = 'Standby';
              return { ...d, isOn: false, statusText };
            }
            return d;
          })
        );
      } else if (result.intent === 'ACTIVATE_SCENE') {
        const matched = presets.find(
          (p) =>
            result.sceneName &&
            p.name.toLowerCase() === result.sceneName.toLowerCase()
        ) || presets.find((p) =>
          rawText.toLowerCase().includes(p.name.toLowerCase())
        );

        if (matched) {
          handleActivatePreset(matched);
        } else if (presets.length > 0) {
          handleActivatePreset(presets[0]);
        }
      }

      logActivity(
        result.feedbackMessage,
        'Voice Command',
        result.targetDeviceType === 'light' ? 'lighting' : result.targetDeviceType === 'ac' ? 'climate' : 'scene',
        true,
        result.rawTranscript
      );

      addToast('success', 'Voice Command Executed', result.feedbackMessage);
    } else {
      logActivity(
        result.feedbackMessage || `Rejected: "${rawText.slice(0, 30)}..."`,
        'Voice Command',
        'scene',
        false,
        rawText
      );

      addToast(
        result.feedbackMessage === 'Start your command with Sofia.' ? 'info' : 'error',
        'Voice Command Notice',
        result.feedbackMessage
      );
    }

    return result;
  };

  const logActivity = (
    title: string,
    source: ActivityLog['source'],
    category: ActivityLog['category'],
    success: boolean,
    commandText?: string
  ) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now().toString(),
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      title,
      source,
      category,
      success,
      commandText,
    };
    setActivities((prev) => [newLog, ...prev.slice(0, 25)]);
  };

  // Reset Demo to initial state for active user
  const handleResetDemo = () => {
    setDevices(INITIAL_DEVICES);
    setRooms(INITIAL_ROOMS);
    setActivities(INITIAL_ACTIVITIES);
    setPresets(INITIAL_PRESETS);
    setActivePresetId(null);
    setSelectedRoom('living_room');
    setCommandCount(24);
    setLastParsedResult(null);
    localStorage.removeItem(`smarthome_devices_${userKey}`);
    localStorage.removeItem(`smarthome_rooms_${userKey}`);
    localStorage.removeItem(`smarthome_activities_${userKey}`);
    localStorage.removeItem(`smarthome_command_count_${userKey}`);
    localStorage.removeItem(`smarthome_presets_${userKey}`);
    addToast('info', 'Demo State Reset', 'Restored default appliances and audit trails.');
  };

  // Clear Activity History
  const handleClearHistory = () => {
    setActivities([]);
    localStorage.removeItem(`smarthome_activities_${userKey}`);
    addToast('info', 'Activity History Cleared', 'All event logs removed.');
  };

  // Calculate System Stats
  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.isOn).length;
  const currentPowerWatts = devices
    .filter((d) => d.isOn)
    .reduce((acc, d) => {
      if (d.type === 'ac') return acc + 650;
      if (d.type === 'tv') return acc + 120;
      if (d.type === 'cooktop') return acc + 1200;
      if (d.type === 'refrigerator') return acc + 120;
      if (d.type === 'microwave') return acc + 800;
      if (d.type === 'fan') return acc + 45;
      if (d.type === 'light') return acc + (d.value ? Math.round(d.value * 0.15) : 15);
      return acc + 10;
    }, 45);

  const stats: SystemStats = {
    totalDevices,
    activeDevices,
    processedCommands: commandCount,
    currentPowerWatts,
  };

  const activeRoomDevices = devices.filter((d) => d.room === selectedRoom);
  const currentRoomName = rooms.find((r) => r.id === selectedRoom)?.name || 
    (selectedRoom === 'living_room' ? 'Living Room' : selectedRoom === 'bedroom' ? 'Bedroom' : selectedRoom === 'kitchen' ? 'Kitchen' : 'Room');

  return (
    <SofiaVoiceProvider onExecuteCommand={handleExecuteCommand}>
      <div className={`min-h-screen transition-colors duration-300 flex flex-col justify-between relative selection:bg-purple-600 selection:text-white ${
      theme === 'dark' ? 'bg-[#08090d] text-gray-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-[25%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[140px] ${
          theme === 'dark' ? 'bg-purple-900/15' : 'bg-purple-300/20'
        }`} />
        <div className={`absolute top-[20%] -right-[15%] w-[700px] h-[700px] rounded-full blur-[160px] ${
          theme === 'dark' ? 'bg-pink-900/15' : 'bg-pink-300/15'
        }`} />
        <div className={`absolute -bottom-[20%] left-[30%] w-[800px] h-[800px] rounded-full blur-[150px] ${
          theme === 'dark' ? 'bg-indigo-950/20' : 'bg-indigo-200/20'
        }`} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        {/* Top Info Banner */}
        <div className={`mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl border text-xs transition ${
          theme === 'dark' 
            ? 'bg-white/[0.03] border-white/[0.06] text-purple-300' 
            : 'bg-white border-slate-200 text-purple-700 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Voice-Controlled Smart Home Automation System</span>
            <span className="hidden md:inline opacity-40">•</span>
            <span className={`hidden md:inline font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              Authenticated Multi-User Hub {isFirebaseActive ? '(Firebase Live)' : '(Local Authenticated Store)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="text-pink-500 hover:text-pink-600 dark:text-pink-300 dark:hover:text-white flex items-center gap-1 font-semibold transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Launch Voice Orb</span>
            </button>
            <span className="opacity-30">|</span>
            <button
              onClick={handleResetDemo}
              className={`transition ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              aria-label="Reset initial demo states"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* PROTECTED ROUTE / AUTH GATE */}
        {!user ? (
          <div className={`rounded-[36px] p-8 md:p-14 text-center border shadow-2xl backdrop-blur-2xl my-6 ${
            theme === 'dark'
              ? 'bg-[#101117]/95 border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.7)]'
              : 'bg-white border-slate-200 shadow-xl text-slate-800'
          }`}>
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.4)] mb-4">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Protected Smart Home Dashboard
            </h2>
            <p className={`text-sm max-w-lg mx-auto mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              Please sign in to access your personal voice assistant, 2D interactive appliance simulation, custom rooms, and telemetry history.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In or Create Account</span>
              </button>

              <button
                onClick={() => login('sarah.m@smarthome.ai', 'password123')}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl border text-xs font-medium transition flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-gray-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Quick Sign In as Sarah M. (Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Floating Centered Dashboard Frame */
          <main className={`rounded-[36px] p-6 lg:p-8 shadow-2xl backdrop-blur-3xl border transition-all ${
            theme === 'dark'
              ? 'bg-[#101117]/95 border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.7)]'
              : 'bg-white border-slate-200 shadow-xl text-slate-800'
          }`}>
            {/* Header Section */}
            <Header
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onResetDemo={handleResetDemo}
              onClearHistory={handleClearHistory}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              unreadCount={2}
            />

            {/* Main Grid: Left Control Dashboard + Right Recent Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              {/* Left 8 Columns */}
              <div className="lg:col-span-8 space-y-7">
                {/* 1. PRIMARY HOMEPAGE FEATURE: TALK TO SOFIA VOICE CONTROL PANEL */}
                <SofiaVoicePanel />

                {/* 2D REALISTIC ROOM INTERIOR SIMULATION */}
                <InteractiveRoomSimulation
                  devices={devices}
                  selectedRoom={selectedRoom}
                  onSelectRoom={(roomId) => setSelectedRoom(roomId)}
                  onToggleDevice={handleToggleDevice}
                  onDeviceValueChange={handleDeviceValueChange}
                />

                {/* SECTION 1: Active Room Quick Controls */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-lg font-medium tracking-tight dark:text-white/90 text-slate-800">
                      {currentRoomName} Quick Controls
                    </h3>
                    <span className="text-xs dark:text-gray-400 text-slate-500">
                      {activeRoomDevices.filter((d) => d.isOn).length} of {activeRoomDevices.length} active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    {activeRoomDevices.slice(0, 4).map((device) => (
                      <ApplianceCard
                        key={device.id}
                        device={device}
                        onToggle={handleToggleDevice}
                        onValueChange={handleDeviceValueChange}
                      />
                    ))}
                  </div>
                </div>

                {/* SECTION: Scene Presets */}
                <PresetsSection
                  presets={presets}
                  activePresetId={activePresetId}
                  onActivatePreset={handleActivatePreset}
                  onOpenCreateModal={handleOpenAddPresetModal}
                  onOpenEditModal={handleOpenEditPresetModal}
                  onDeletePreset={handleDeletePreset}
                />

                {/* SECTION 2: Rooms Section */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium tracking-tight dark:text-white/90 text-slate-800">
                        Rooms
                      </h3>
                      <div className="hidden sm:flex items-center gap-2 text-xs dark:text-gray-400 text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Real-time occupancy & sensor status</span>
                      </div>
                    </div>

                    <button
                      onClick={handleOpenAddPresetModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 active:scale-95 border border-purple-400/30 cursor-pointer"
                      aria-label="Add Preset"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Preset</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {rooms.map((room) => {
                      const isRoomActive = devices.some(
                        (d) => d.room === room.id && d.isOn
                      );
                      return (
                        <RoomCard
                          key={room.id}
                          room={room}
                          isActive={room.id === 'entryway' ? !room.isLocked : isRoomActive}
                          onToggleActive={handleToggleRoom}
                          onTempChange={handleRoomTempChange}
                          onToggleLock={handleToggleLock}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: Energy Analytics & Academic Telemetry */}
                <EnergyAnalytics stats={stats} />

                {/* Academic Simulation Notice */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                  theme === 'dark' 
                    ? 'bg-white/[0.02] border-white/[0.04] text-gray-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className={theme === 'dark' ? 'text-gray-300' : 'text-slate-800'}>
                      User-Isolated Demonstration:
                    </strong>{' '}
                    Current dashboard states and speech activity logs are isolated to account{' '}
                    <span className="font-mono text-purple-400 font-semibold">{user.displayName || user.email}</span>.
                    Switching accounts loads separate room preferences and custom device registries.
                  </p>
                </div>
              </div>

              {/* Right 4 Columns: Recent Activity Vertical Timeline */}
              <div className="lg:col-span-4">
                <RecentActivity
                  activities={activities}
                  onClearHistory={handleClearHistory}
                />
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className={`relative z-10 py-6 text-center text-xs border-t transition ${
        theme === 'dark' ? 'text-gray-500 border-white/[0.04]' : 'text-slate-500 border-slate-200 bg-white/50'
      }`}>
        <p>Voice-Controlled Smart Home Automation System • Academic Project Implementation</p>
        <p className="mt-1 text-[11px] opacity-75">
          React 19, TypeScript, Tailwind CSS, Firebase Authentication & Web Speech API
        </p>
      </footer>

      {/* Voice Assistant Modal with Glowing Orb & Pipeline Breakdown */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={handleExecuteCommand}
        lastParsedResult={lastParsedResult}
      />

      {/* Authentication Modal (Sign In / Register / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="login"
      />

      {/* User Profile & Account Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Automation Preset Modal (Create and Edit) */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => {
          setIsPresetModalOpen(false);
          setPresetToEdit(null);
        }}
        onSavePreset={handleSavePreset}
        existingPresets={presets}
        presetToEdit={presetToEdit}
        devices={devices}
        rooms={rooms}
      />

      {/* Dynamic Toast Feedback Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  </SofiaVoiceProvider>
  );
};

export default App;
