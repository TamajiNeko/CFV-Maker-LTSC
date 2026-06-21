"use client";
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ text, children, position = "top", className = "inline-block w-fit h-fit" }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      if (position === "bottom") {
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.bottom + scrollY
        });
      } else {
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + scrollY
        });
      }
    }
    setVisible(true);
  };

  return (
    <div 
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && typeof document !== 'undefined' && createPortal(
        <div 
          style={{
            position: 'absolute',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: position === "bottom" ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className={`hidden lg:flex items-center animate-in fade-in duration-200 select-none ${
            position === "bottom" ? "flex-col-reverse pt-2" : "flex-col pb-2"
          }`}
        >
          <div className="px-2 py-1 text-[12px] text-white bg-gray-800 dark:bg-gray-900 shadow-xl rounded md whitespace-nowrap">
            {text}
          </div>
          <div className={`w-2 h-2 rotate-45 bg-gray-800 dark:bg-gray-900 ${
            position === "bottom" ? "-mb-1" : "-mt-1"
          }`}></div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;