import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function GradientInput({
  label,
  colors = [],
  onChange,
  visible = true,
  containerClass = 'mb-5.75',
}) {
  const [activePickerIndex, setActivePickerIndex] = useState(null);
  const [localColors, setLocalColors] = useState(colors);
  const [tempColor, setTempColor] = useState('#ffffff');
  const pickerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Sync state with parent colors changes
  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  // Sync tempColor when the active color index changes
  useEffect(() => {
    if (activePickerIndex !== null) {
      setTempColor(localColors[activePickerIndex] || '#ffffff');
    }
  }, [activePickerIndex, localColors]);

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
        setActivePickerIndex(null);
      }
    }
    if (activePickerIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePickerIndex]);

  if (!visible) return null;

  const triggerOnChange = (updatedColors) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(updatedColors);
    }, 150);
  };

  const handleColorChange = (newColor) => {
    let formattedColor = newColor;
    if (newColor && !newColor.startsWith('#')) {
      formattedColor = '#' + newColor;
    }
    setTempColor(formattedColor);
    
    if (activePickerIndex !== null) {
      const updated = [...localColors];
      updated[activePickerIndex] = formattedColor;
      setLocalColors(updated);
      triggerOnChange(updated);
    }
  };

  const handleHexChange = (e) => {
    let newColor = e.target.value;
    if (newColor && !newColor.startsWith('#')) {
      newColor = '#' + newColor;
    }
    setTempColor(newColor);
    
    if (activePickerIndex !== null) {
      const updated = [...localColors];
      updated[activePickerIndex] = newColor;
      setLocalColors(updated);
      triggerOnChange(updated);
    }
  };

  const handleRemoveColor = (indexToRemove) => {
    if (localColors.length <= 1) return;
    const updated = localColors.filter((_, idx) => idx !== indexToRemove);
    setLocalColors(updated);
    onChange(updated);
    setActivePickerIndex(null);
  };

  const handleAddColor = () => {
    if (localColors.length >= 5) return;
    const lastColor = localColors.length > 0 ? localColors[localColors.length - 1] : '#ffffff';
    const updated = [...localColors, lastColor];
    setLocalColors(updated);
    onChange(updated);
    setActivePickerIndex(updated.length - 1);
  };

  return (
    <div className={`flex-1 relative gap-3 ${containerClass}`}>
      <label className="block text-sm font-medium text-(--text-secondary) mb-1">
        {label}
      </label>

      <div className="bg-(--bg-secondary) border border-(--border-color) rounded-lg p-3 pb-1">
        <div
          className="h-5 rounded-full mb-3"
          style={{
            background: `linear-gradient(90deg, ${localColors.join(',')})`
          }}
        />

        <div className="flex items-center justify-between gap-2 flex-wrap md:flex-nowrap mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {localColors.map((color, index) => (
              <div key={index} className="group relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePickerIndex(index);
                  }}
                  className="relative w-6 h-6 rounded-full border-2 border-white/20 hover:scale-110 hover:border-white/40 transition-all"
                  style={{ backgroundColor: color }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleRemoveColor(index);
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveColor(index);
                  }}
                  className="md:hidden absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md active:bg-red-700"
                  title="Remove color"
                >
                  ×
                </button>
              </div>
            ))}

            {localColors.length < 5 && (
              <button
                onClick={handleAddColor}
                className="w-6 h-6 rounded-full border border-dashed border-slate-500 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all"
              >
                +
              </button>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {localColors.length}/5
          </span>
        </div>
      </div>

      {activePickerIndex !== null && (
        <div
          ref={pickerRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 mt-2 bg-(--bg-primary) border border-(--border-color) p-3 rounded-lg shadow-xl z-50 flex flex-col gap-2"
        >
          <HexColorPicker color={tempColor} onChange={handleColorChange} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-(--text-secondary)">Hex</span>
            <input
              type="text"
              value={tempColor}
              onChange={handleHexChange}
              className="w-full text-xs p-1.5 bg-(--bg-secondary) text-(--text-primary) border border-(--border-color) rounded-md outline-none uppercase font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}
