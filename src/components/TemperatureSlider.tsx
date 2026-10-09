import React from 'react';
import type { TaskPriority, TaskStatus } from '../types';
import { Clock, Hourglass, CheckCircle2 } from 'lucide-react';

/* =========================================================================
   PRIORITY SLIDER (Temperatura de cor: Fria / Intermediária / Quente)
   ========================================================================= */

interface PriorityOption {
  value: TaskPriority;
  label: string;
  activeGradient: string;
  activeShadow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: 'LOW',
    label: 'Baixa',
    activeGradient: 'from-sky-500 to-blue-600',
    activeShadow: 'shadow-sky-500/25',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
  },
  {
    value: 'MEDIUM',
    label: 'Média',
    activeGradient: 'from-amber-500 to-orange-500',
    activeShadow: 'shadow-amber-500/25',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
  },
  {
    value: 'HIGH',
    label: 'Alta',
    activeGradient: 'from-rose-500 to-red-600',
    activeShadow: 'shadow-rose-500/30',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
];

interface PrioritySliderProps {
  value: TaskPriority;
  onChange: (value: TaskPriority) => void;
  disabled?: boolean;
  label?: string;
}

export const PrioritySlider: React.FC<PrioritySliderProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Prioridade',
}) => {
  const currentIndex = PRIORITY_OPTIONS.findIndex((opt) => opt.value === value);
  const activeIndex = currentIndex === -1 ? 1 : currentIndex;
  const activeOption = PRIORITY_OPTIONS[activeIndex];

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const nextIndex = Number(e.target.value);
    const selected = PRIORITY_OPTIONS[nextIndex];
    if (selected) {
      onChange(selected.value);
    }
  };

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header with Title and Color-temperature Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-300 ${activeOption.badgeBg} ${activeOption.badgeText} ${activeOption.badgeBorder}`}
        >
          {activeOption.label}
        </span>
      </div>

      {/* Slider Track */}
      <div className="relative p-1 rounded-xl bg-slate-100/90 border border-slate-200/90 select-none shadow-inner overflow-hidden">
        {/* Sliding Pill Thumb */}
        <div
          className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out z-10 pointer-events-none"
          style={{
            width: 'calc((100% - 8px) / 3)',
            left: `calc(4px + ${activeIndex} * ((100% - 8px) / 3))`,
          }}
        >
          <div
            className={`w-full h-full rounded-lg bg-gradient-to-r ${activeOption.activeGradient} shadow-md ${activeOption.activeShadow} transition-all duration-300`}
          />
        </div>

        {/* Segment Labels */}
        <div className="relative z-10 grid grid-cols-3 h-9 items-center">
          {PRIORITY_OPTIONS.map((opt, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => !disabled && onChange(opt.value)}
                className={`flex items-center justify-center text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer h-full ${
                  isSelected
                    ? 'text-white drop-shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Range Input for drag & arrow keys */}
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={activeIndex}
          onChange={handleRangeChange}
          disabled={disabled}
          aria-label={label}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>

      {/* Subtle Color Temperature Spectrum Bar */}
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 opacity-70" />
    </div>
  );
};

/* =========================================================================
   STATUS SLIDER
   ========================================================================= */

interface StatusOption {
  value: TaskStatus;
  label: string;
  icon: React.ReactNode;
  activeGradient: string;
  activeShadow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'TODO',
    label: 'A Fazer',
    icon: <Clock className="w-3.5 h-3.5" />,
    activeGradient: 'from-slate-600 to-slate-800',
    activeShadow: 'shadow-slate-500/25',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
  },
  {
    value: 'IN_PROGRESS',
    label: 'Em Andamento',
    icon: <Hourglass className="w-3.5 h-3.5" />,
    activeGradient: 'from-amber-500 to-orange-600',
    activeShadow: 'shadow-orange-500/25',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
  },
  {
    value: 'DONE',
    label: 'Concluída',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    activeGradient: 'from-emerald-500 to-teal-600',
    activeShadow: 'shadow-emerald-500/25',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
];

interface StatusSliderProps {
  value: TaskStatus;
  onChange: (value: TaskStatus) => void;
  disabled?: boolean;
  label?: string;
}

export const StatusSlider: React.FC<StatusSliderProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Status',
}) => {
  const currentIndex = STATUS_OPTIONS.findIndex((opt) => opt.value === value);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const activeOption = STATUS_OPTIONS[activeIndex];

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const nextIndex = Number(e.target.value);
    const selected = STATUS_OPTIONS[nextIndex];
    if (selected) {
      onChange(selected.value);
    }
  };

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header with Title and Status Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-300 ${activeOption.badgeBg} ${activeOption.badgeText} ${activeOption.badgeBorder}`}
        >
          {activeOption.icon}
          <span>{activeOption.label}</span>
        </span>
      </div>

      {/* Slider Track */}
      <div className="relative p-1 rounded-xl bg-slate-100/90 border border-slate-200/90 select-none shadow-inner overflow-hidden">
        {/* Sliding Pill Thumb */}
        <div
          className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out z-10 pointer-events-none"
          style={{
            width: 'calc((100% - 8px) / 3)',
            left: `calc(4px + ${activeIndex} * ((100% - 8px) / 3))`,
          }}
        >
          <div
            className={`w-full h-full rounded-lg bg-gradient-to-r ${activeOption.activeGradient} shadow-md ${activeOption.activeShadow} transition-all duration-300`}
          />
        </div>

        {/* Segment Labels */}
        <div className="relative z-10 grid grid-cols-3 h-9 items-center">
          {STATUS_OPTIONS.map((opt, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => !disabled && onChange(opt.value)}
                className={`flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer h-full ${
                  isSelected
                    ? 'text-white drop-shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Range Input for drag & arrow keys */}
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={activeIndex}
          onChange={handleRangeChange}
          disabled={disabled}
          aria-label={label}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>

      {/* Status Progression Line */}
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-slate-400 via-orange-400 to-emerald-500 opacity-70" />
    </div>
  );
};
