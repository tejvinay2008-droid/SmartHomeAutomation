import React, { useState } from 'react';
import { 
  Wifi, 
  Key, 
  Sliders, 
  Thermometer, 
  Zap, 
  Moon, 
  Warehouse, 
  ShieldCheck, 
  Mic, 
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { ActivityLog } from '../types';

interface RecentActivityProps {
  activities: ActivityLog[];
  onClearHistory: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onClearHistory,
}) => {
  const [showAllModal, setShowAllModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'voice' | 'security' | 'climate'>('all');

  const getActivityIcon = (act: ActivityLog) => {
    if (act.source === 'Voice Command') {
      return <Mic className="w-3.5 h-3.5 text-pink-400" />;
    }
    switch (act.category) {
      case 'security':
        return act.title.toLowerCase().includes('garage') ? (
          <Warehouse className="w-3.5 h-3.5 text-gray-300" />
        ) : (
          <Key className="w-3.5 h-3.5 text-purple-300" />
        );
      case 'scene':
        return act.title.toLowerCase().includes('night') ? (
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
        ) : (
          <Sliders className="w-3.5 h-3.5 text-purple-300" />
        );
      case 'climate':
        return <Thermometer className="w-3.5 h-3.5 text-sky-300" />;
      case 'power':
        return <Zap className="w-3.5 h-3.5 text-amber-300" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />;
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (filter === 'voice') return act.source === 'Voice Command';
    if (filter === 'security') return act.category === 'security';
    if (filter === 'climate') return act.category === 'climate';
    return true;
  });

  return (
    <>
      <div className="bg-[#14151c] border border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between h-full min-h-[580px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/[0.05]">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Recent Activity
            </h3>
            <button
              onClick={() => setShowAllModal(true)}
              className="text-xs font-medium text-purple-400 hover:text-purple-300 transition hover:underline"
            >
              View All
            </button>
          </div>

          {/* Connected Vertical Timeline */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-[1.5px] before:bg-white/[0.08]">
            {activities.slice(0, 9).map((activity) => (
              <div key={activity.id} className="relative flex items-start group">
                {/* Timeline Circle Node */}
                <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-[#1e202a] border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-purple-400/50 shadow-sm">
                  {getActivityIcon(activity)}
                </div>

                {/* Event Description & Meta */}
                <div className="ml-3">
                  <p className="text-[13px] font-medium text-gray-200 tracking-tight leading-snug group-hover:text-white transition">
                    {activity.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-light">
                    <span>{activity.timeAgo}</span>
                    <span className="text-gray-600">•</span>
                    <span className={activity.source === 'Voice Command' ? 'text-pink-400 font-medium' : ''}>
                      {activity.source}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom System Online Indicator matching image */}
        <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold tracking-wider">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px]">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-[10px] text-gray-400 font-mono">LATENCY: 18ms</span>
            <Wifi className="w-4 h-4 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Modal for View All Activity History */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#14151c] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white">Event Audit & Activity Trail</h3>
                <p className="text-xs text-gray-400 mt-0.5">Comprehensive audit log of voice commands & automation</p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 py-3 border-b border-white/5 text-xs">
              <div className="flex items-center gap-1.5">
                {(['all', 'voice', 'security', 'climate'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition font-medium ${
                      filter === cat
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white/[0.04] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto py-2 space-y-2 flex-1 pr-1">
              {filteredActivities.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  No activity records found for this filter.
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1f202b] flex items-center justify-center shrink-0 border border-white/10">
                        {getActivityIcon(act)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{act.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{act.timeAgo}</span>
                          <span>•</span>
                          <span className={act.source === 'Voice Command' ? 'text-pink-400 font-medium' : ''}>
                            {act.source}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      {act.success ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
