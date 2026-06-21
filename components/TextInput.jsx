import React, { useRef, useEffect } from 'react';

export default function TextInput({
  label,
  value,
  onChange,
  type,
  placeholder = "Type here...",
  min = 0,
  max,
  maxLength,
  step,
  visible=true,
  disabled
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (type === 'number' && inputRef.current) {
      const handleWheel = () => {
        inputRef.current?.blur();
      };
      inputRef.current.addEventListener('wheel', handleWheel, { passive: true });
      return () => inputRef.current?.removeEventListener('wheel', handleWheel);
    }
  }, [type]);

  const handleChange = (e) => {
    let inputValue = e.target.value;

    if (type === 'number') {
      if (inputValue === "") {
        onChange("");
        return;
      }
      if (maxLength && inputValue.length > maxLength) {
        inputValue = inputValue.slice(0, maxLength);
      }

      let numValue = parseInt(inputValue);

      if (!isNaN(numValue)) {
        if (max !== undefined && numValue > max) numValue = max;
        if (min !== undefined && numValue < min) numValue = min;
        inputValue = numValue.toString();
      }

      if (e.target.value !== inputValue) {
        e.target.value = inputValue;
      }
    }

    onChange(inputValue);
  };

  const handleBlur = (e) => {
    if (type === 'number') {
      if (e.target.value === "" || isNaN(e.target.value)) {
        onChange(min.toString());
      } else {
        const parsed = parseInt(e.target.value, 10);
        onChange(parsed.toString());
        if (inputRef.current) {
          inputRef.current.value = parsed.toString();
        }
      }
    }
  };

  return (
    <div className={`flex-1 ${!visible ? "hidden" : ""}`}>
      <label className="block text-sm font-medium text-(--text-secondary) mb-1">
        {label}
      </label>
      
      <input
        ref={inputRef}
        type={type}
        value={value}
        step={step ?? 1000}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-10 p-2 text-sm border border-(--border-color) rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-(--bg-secondary) text-(--text-primary)"
      />
    </div>
  );
}