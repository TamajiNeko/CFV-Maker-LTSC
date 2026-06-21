import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import Tooltip from './Tooltip';

export default function ColorPickerInput({
  label,
  color = '#ffffff',
  onChange,
  visible = true,
  disabled = false,
  containerClass = 'mb-5.75',

  // Toggle props
  toggleVisible = false,
  toggleValue = false,
  toggleOnChange,
  toggleText = '',
  toggleTooltip = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const [tempColor, setTempColor] = useState(color);
  const pickerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Sync state when color prop changes from outside
  useEffect(() => {
    setLocalColor(color);
    setTempColor(color);
  }, [color]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Click outside detection to close picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!visible) return null;

  const triggerOnChange = (newColor) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newColor);
    }, 150);
  };

  const handleColorPickerChange = (newColor) => {
    let formattedColor = newColor;
    if (newColor && !newColor.startsWith('#')) {
      formattedColor = '#' + newColor;
    }
    setLocalColor(formattedColor);
    setTempColor(formattedColor);
    triggerOnChange(formattedColor);
  };

  const handleHexChange = (e) => {
    let newColor = e.target.value;
    if (newColor && !newColor.startsWith('#')) {
      newColor = '#' + newColor;
    }
    setLocalColor(newColor);
    setTempColor(newColor);
    triggerOnChange(newColor);
  };

  return (
    <div className={`flex-1 relative gap-3 ${containerClass}`}>
      <label className="block text-sm font-medium text-(--text-secondary) mb-1">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={`flex-1 h-10 px-3 rounded-md border flex items-center gap-2 bg-(--bg-secondary) border-(--border-color) transition-all ${
            !disabled ? 'cursor-pointer hover:bg-(--panel-bg)' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div
            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
            style={{ backgroundColor: localColor }}
          />
          <span className="text-xs font-mono flex-1">
            {localColor.toUpperCase()}
          </span>
        </div>

        {toggleVisible && (
          <Tooltip text={toggleTooltip}>
            <label className={`flex items-center justify-center gap-2 min-w-17 h-10 px-3 rounded-md border cursor-pointer transition-all ${
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

      {isOpen && !disabled && (
        <div
          ref={pickerRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full left-0 mt-2 p-3 bg-(--bg-primary) border border-(--border-color) rounded-lg shadow-xl z-50 flex flex-col gap-3"
        >
          <HexColorPicker color={tempColor} onChange={handleColorPickerChange} />

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-(--text-secondary)">Hex</span>
            <input
              type="text"
              value={tempColor}
              onChange={handleHexChange}
              className="flex-1 text-xs p-1.5 bg-(--bg-secondary) text-(--text-primary) border border-(--border-color) rounded-md outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}
    </div>
  );
}
