import React from 'react';
import Tooltip from './Tooltip';

export default function ToggleInput({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder = 'Type here...',
  min,
  max,
  step,
  disabled = false,
  visible = true,
  inputRef,
  
  // Toggle props
  toggleVisible = false,
  toggleValue = false,
  toggleOnChange,
  toggleText = '',
  toggleTooltip = '',
  toggleClassName = '',
  containerClass = '',
}) {
  if (!visible) return null;

  return (
    <div className={`flex-1 ${containerClass}`}>
      <label className="block text-sm font-medium text-(--text-secondary) mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className={`flex-1 ${disabled ? 'cursor-not-allowed' : ''}`}>
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`w-full p-2 h-10 disabled:pointer-events-none text-sm border rounded-md outline-none transition-all bg-(--bg-secondary) border-(--border-color) text-(--text-primary) focus:ring-2 focus:ring-blue-500 ${disabled ? 'opacity-50' : ''}`}
          />
        </div>

        {toggleVisible && (
          <Tooltip text={toggleTooltip}>
            <label className={`flex items-center justify-center gap-2 min-w-17 h-10 px-3 rounded-md border cursor-pointer transition-all ${toggleClassName} ${
              toggleValue
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'hover:bg-(--panel-bg) border-(--border-color) bg-(--bg-secondary)'
            }`}>
              <input
                type="checkbox"
                className="hidden"
                checked={toggleValue}
                onChange={(e) => toggleOnChange(e.target.checked)}
              />
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                toggleValue
                  ? 'border-5 bg-white border-blue-600'
                  : 'border-2 bg-white dark:bg-gray-700 border-slate-400 dark:border-slate-500'
              }`}></span>
              <span className={`text-[11px] font-bold ${
                toggleValue ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {toggleText}
              </span>
            </label>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
