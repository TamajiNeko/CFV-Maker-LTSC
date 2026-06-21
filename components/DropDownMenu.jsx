"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../utils/LanguageProvider';
import Tooltip from './Tooltip';

export default function DropdownMenu({
  trigger,
  items = [],
  position = "left",
  size = "md",
  submenuPosition = "left"
}) {
  const { lang } = useLang()

  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const mainTimeoutRef = useRef(null);
  const submenuTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenSubmenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const sizeClasses = {
    sm: "min-w-[160px] text-xs",
    md: "min-w-[240px] text-sm",
    lg: "min-w-[320px] text-base",
  };

  const positionClasses = {
    "left": "top-full right-0 mt-1",
    "right": "top-full left-0 mt-1",
    "center": "top-full left-1/2 -translate-x-1/2 mt-1",
  };

  const subMenuPosClasses = {
    right: "sm:left-full sm:top-0 sm:ml-1",
    left: "sm:right-full sm:top-0 sm:mr-1",
  };

  const clearAllTimeouts = () => {
    if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
  };

  const handleOpen = () => {
    clearAllTimeouts();
    setIsOpen(true);
  };

  const handleClose = () => {
    clearAllTimeouts();
    mainTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setOpenSubmenu(null);
    }, 200);
  };

  const sections = [...new Set(items.map(item => item.section || 'default'))];

  const renderMenuItem = (item, index) => {
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div
        key={`${item.label}-${index}`}
        className="relative"
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse' && hasChildren && !item.disabled) {
            clearTimeout(submenuTimeoutRef.current);
            setOpenSubmenu(item.label);
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse' && hasChildren && !item.disabled) {
            submenuTimeoutRef.current = setTimeout(() => setOpenSubmenu(null), 200);
          }
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (item.disabled) return;
            if (hasChildren) {
              setOpenSubmenu(prev => prev === item.label ? null : item.label);
            } else if (item.onClick) {
              item.onClick();
              setIsOpen(false);
              setOpenSubmenu(null);
            }
          }}
          disabled={item.disabled}
          className={`w-full px-3 py-2 text-left transition-colors flex items-center justify-between gap-3
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-(--bg-primary)'}
            ${item.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950' : 'text-var(--text-primary)'}
          `}
        >
          <div className="flex items-center gap-3">
            {item.icon && <span className="w-5 h-5 flex items-center justify-center opacity-70">{item.icon}</span>}
            <span>{item.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {item.subtext && <span className="text-[10px] text-(--text-secondary) font-mono">{item.subtext}</span>}
            {hasChildren && (
              <svg className={`sm:hidden w-4 h-4 transition-transform duration-200 ${openSubmenu === item.label ? 'rotate-90 sm:rotate-0' : ''} text-(--text-secondary)`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </button>

        {hasChildren && openSubmenu === item.label && (
          <div
            className={`
              relative w-full bg-(--bg-primary)/50 mt-1 py-1 rounded-md
              sm:absolute sm:mt-0 sm:z-60 sm:border sm:border-(--border-color) sm:bg-(--bg-secondary) sm:shadow-xl sm:rounded-lg 
              ${sizeClasses[size]} ${subMenuPosClasses[submenuPosition]}
            `}
            onPointerEnter={(e) => e.pointerType === 'mouse' && clearTimeout(submenuTimeoutRef.current)}
          >
            {item.children.map((child, cIdx) => (
              <div
                key={cIdx}
                className="w-full text-left flex items-center justify-between text-(--text-primary) hover:bg-(--bg-primary) pl-6 sm:pl-3 min-w-0"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (child.onClick) child.onClick();
                    setIsOpen(false);
                    setOpenSubmenu(null);
                  }}
                  className="flex-1 min-w-0 py-2 pr-3 text-left flex items-center justify-between gap-3"
                >
                  <Tooltip text={child.label} className="min-w-0 flex-1">
                    <span className={`block truncate ${child.icon ? "ml-1" : "ml-2"}`}>{child.label}</span>
                  </Tooltip>
                  {child.subtext && (
                    <Tooltip text={child.subtext} className="min-w-0 shrink max-w-[100px]">
                      <span className="block truncate text-[10px] text-(--text-secondary) font-mono text-right select-none">
                        {child.subtext}
                      </span>
                    </Tooltip>
                  )}
                </button>
                {child.onRemove && (
                  <Tooltip text={lang === 'en' ? "Remove from recent" : "ลบออกจากรายการล่าสุด"} position="top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        child.onRemove();
                      }}
                      className="p-1.5 text-(--text-secondary) hover:text-white rounded transition-colors mr-1 cursor-pointer shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative inline-block"
      ref={containerRef}
      onPointerEnter={(e) => e.pointerType === 'mouse' && handleOpen()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && handleClose()}
    >
      <div
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            setOpenSubmenu(null);
          } else {
            handleOpen();
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div className={`absolute rounded-lg border border-(--border-color) bg-(--bg-secondary) shadow-xl py-1 overflow-visible ${sizeClasses[size]} ${positionClasses[position]}`}>
          {sections.map((sectionName, sIdx) => {
            const sectionItems = items.filter(item => (item.section || 'default') === sectionName);
            return (
              <React.Fragment key={sectionName}>
                {sectionName !== 'default' && (
                  <div className={`px-3 py-1.5 ${lang == "en" ? "text-[10px]" : "text-[12px]"} font-bold uppercase tracking-widest text-(--text-secondary) bg-(--bg-primary)/30`}>
                    {sectionName}
                  </div>
                )}
                {sectionItems.map((item, iIdx) => renderMenuItem(item, iIdx))}
                {sIdx < sections.length - 1 && <div className="my-1 h-px bg-(--border-color) opacity-50" />}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}