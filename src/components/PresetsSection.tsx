import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Pencil, 
  Trash2, 
  Play, 
  Check, 
  AlertTriangle, 
  Clock, 
  Layers 
} from 'lucide-react';
import type { Preset } from '../types';
import { renderPresetIcon } from './PresetModal';

interface PresetsSectionProps {
  presets: Preset[];
  activePresetId: string | null;
  onActivatePreset: (preset: Preset) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (preset: Preset) => void;
  onDeletePreset: (presetId: string) => void;
}

export const PresetsSection: React.FC<PresetsSectionProps> = ({
  presets,
  activePresetId,
  onActivatePreset,
  onOpenCreateModal,
  onOpenEditModal,
  onDeletePreset
}) => {
  const [presetToDelete, setPresetToDelete] = useState<Preset | null>(null);

  const confirmDelete = () => {
    if (presetToDelete) {
      onDeletePreset(presetToDelete.id);
      setPresetToDelete(null);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-medium tracking-tight dark:text-white/90 text-slate-800 flex items-center gap-2">
              <span>Scene Presets</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full dark:bg-white/[0.06] bg-slate-200 dark:text-gray-300 text-slate-600">
                {presets.length}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-300 dark:bg-purple-950/40 bg-purple-50 border border-purple-500/30 hover:bg-purple-500/20 hover:text-white transition cursor-pointer"
            aria-label="Create new preset"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Preset</span>
          </button>
        </div>
      </div>

      {/* Preset Cards Grid or Empty State */}
      {presets.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-white/10 dark:bg-[#12131a] bg-slate-50 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 mx-auto flex items-center justify-center text-purple-400 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">No Automation Presets Configured</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Group appliances into custom modes like Good Morning, Movie Night, or Away Mode to execute with one tap.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Preset</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {presets.map((preset) => {
            const isActive = activePresetId === preset.id;
            const onDevicesCount = preset.devices.filter((d) => d.isOn).length;

            return (
              <div
                key={preset.id}
                className={`relative group p-4 rounded-2xl transition-all duration-300 flex flex-col justify-between border ${
                  isActive
                    ? 'dark:bg-[#1a1b26] bg-purple-50/50 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'dark:bg-[#14151c] bg-white border-white/[0.05] dark:border-white/[0.04] border-slate-200 hover:border-purple-500/30 shadow-sm'
                }`}
              >
                {/* Top Row: Icon, Title, and Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
                        isActive
                          ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/30'
                          : 'dark:bg-[#1f202b] bg-slate-100 text-purple-400 dark:text-purple-300 border border-purple-500/20'
                      }`}
                    >
                      {renderPresetIcon(preset.icon, 'w-5 h-5')}
                    </div>

                    <div>
                      <h4 className="text-[15px] font-medium tracking-tight dark:text-white text-slate-900 flex items-center gap-1.5">
                        {preset.name}
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] dark:text-gray-400 text-slate-500">
                        <span>{preset.devices.length} devices</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{onDevicesCount} ON</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditModal(preset);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white dark:hover:bg-white/[0.08] hover:bg-slate-200 transition cursor-pointer"
                      title="Edit Preset"
                      aria-label={`Edit ${preset.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPresetToDelete(preset);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 dark:hover:bg-rose-500/10 hover:bg-rose-100 transition cursor-pointer"
                      title="Delete Preset"
                      aria-label={`Delete ${preset.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {preset.description && (
                  <p className="text-xs dark:text-gray-400 text-slate-600 line-clamp-2 my-2 min-h-[32px]">
                    {preset.description}
                  </p>
                )}

                {/* Bottom Row: One-Click Activate Button */}
                <div className="mt-3 pt-3 border-t dark:border-white/[0.06] border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] dark:text-gray-500 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Instant Apply</span>
                  </span>

                  <button
                    onClick={() => onActivatePreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {presetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#12131a] border border-white/10 p-6 shadow-2xl text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">Delete Preset</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Are you sure you want to delete the <span className="text-white font-semibold">"{presetToDelete.name}"</span> preset? 
              This will remove the saved automation configuration.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setPresetToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                Delete Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
