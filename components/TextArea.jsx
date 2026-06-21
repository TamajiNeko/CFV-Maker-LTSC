"use client";

import { createPortal } from "react-dom";
import { useRef, useEffect, useState } from "react";
import { useIconConfig, useColorTag } from "../utils/store/IconConfig";
import { JustifyIcon } from "./Icon";

const getCaretOffsetAt = (textarea, position) => {
  if (!textarea) return { top: 0, left: 0 };

  const div = document.createElement("div");
  const style = window.getComputedStyle(textarea);

  const properties = [
    "direction", "boxSizing", "width", "height", "overflowX", "overflowY",
    "borderWidth", "borderStyle", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "fontFamily", "fontStyle", "fontWeight", "fontSize", "lineHeight", "letterSpacing",
    "textTransform", "whiteSpace", "wordBreak", "wordWrap",
  ];

  for (const prop of properties) {
    div.style[prop] = style[prop];
  }

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";

  const textContent = textarea.value.substring(0, position);
  div.textContent = textContent;

  const span = document.createElement("span");
  span.textContent = textarea.value.substring(position, position + 1) || ".";
  div.appendChild(span);

  document.body.appendChild(div);

  const textareaRect = textarea.getBoundingClientRect();
  const top = textareaRect.top + span.offsetTop - textarea.scrollTop;
  const left = textareaRect.left + span.offsetLeft - textarea.scrollLeft;

  document.body.removeChild(div);

  return { top, left };
};

const clampFloatingPosition = ({ left, top, width, height, padding = 8 }) => {
  if (typeof window === "undefined") {
    return { left, top };
  }

  const maxLeft = window.innerWidth - width - padding;
  const maxTop = window.innerHeight - height - padding;

  return {
    left: Math.max(padding, Math.min(left, maxLeft)),
    top: Math.max(padding, Math.min(top, maxTop)),
  };
};

const getCurrentWordInfo = (text, cursorPosition) => {
  const textBeforeCursor = text.substring(0, cursorPosition);
  const match = textBeforeCursor.match(/[a-zA-Z0-9_/@[\](){}-]+$/);

  return !match
    ? { word: "", start: cursorPosition }
    : { word: match[0], start: cursorPosition - match[0].length };
};

const getSuggestionsList = (iconConfig) => {
  if (!iconConfig) return [];
  const list = [];

  if (iconConfig.exact) {
    Object.keys(iconConfig.exact).forEach((key) => {
      list.push(key);
    });
  }

  if (iconConfig.prefixes) {
    Object.keys(iconConfig.prefixes).forEach((prefix) => {
      const config = iconConfig.prefixes[prefix];

      if (config.allowPlain === true) {
        list.push(prefix);
      }

      if (
        config.valueRange &&
        typeof config.valueRange.min === "number" &&
        typeof config.valueRange.max === "number"
      ) {
        const min = config.valueRange.min;
        const max = config.valueRange.max;

        for (let v = min; v <= max; v++) {
          list.push(`${prefix}(${v})`);
        }
      }
    });
  }

  return Array.from(new Set(list));
};

const filterSuggestions = (word, allSuggestions, colorTagConfig) => {
  if (!word || word.length < 1) return [];

  const w = word.toLowerCase();
  const list = [];

  allSuggestions.forEach((s) => {
    const sLow = s.toLowerCase();
    const hasVariants = allSuggestions.some(
      (x) => x !== s && x.toLowerCase().startsWith(`${sLow}(`)
    );

    const allowVal = colorTagConfig?.allow?.[s];
    const allowColorVariants = allowVal === true || (Array.isArray(allowVal) && allowVal.length > 0);
    const escaped = sLow.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const completedColorVariantRegex = new RegExp(`^${escaped}@\\[[^\\]]+\\](?:.+)?$`);
    const partialColorVariantRegex = new RegExp(`^${escaped}@\\[[^\\]]*$`);

    const isCompletedColorVariant = completedColorVariantRegex.test(w);
    const isTypingColorVariant = partialColorVariantRegex.test(w);

    let match = false;

    if ((s === word && !hasVariants && !allowColorVariants) || isCompletedColorVariant) {
      match = false;
    }
    else if (allowColorVariants && isTypingColorVariant) {
      match = true;
    }
    else if (sLow.startsWith(w)) {
      match = true;
    }
    else if (s.startsWith("[") && s.endsWith("]")) {
      const inner = s.slice(1, -1);
      const innerLow = inner.toLowerCase();

      if (inner === word && !allowColorVariants) {
        match = false;
      } else if (innerLow.startsWith(w)) {
        match = true;
      }
    }

    if (match) {
      list.push(s);

      if (allowColorVariants && colorTagConfig?.preset) {
        const allColors = Object.keys(colorTagConfig.preset);
        const colors = Array.isArray(allowVal) ? allColors.filter((c) => allowVal.includes(c)) : allColors;
        colors.forEach((color) => {
          list.push(`${s}@[${color}]`);
        });
      }
    }
  });

  return Array.from(new Set(list)).slice(0, 11);
};

export default function TextArea({
  value,
  onChange,
  placeholder = "Type Here...",
  maxRows = 15,
  disabled = false,
  format = false,
}) {
  const ref = useRef(null);
  const overlayRef = useRef(null);
  const itemRefs = useRef([]);

  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sugPos, setSugPos] = useState({ top: 0, left: 0 });
  const [sugStartIdx, setSugStartIdx] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [selectionRange, setSelectionRange] = useState(null);

  const iconConfig = useIconConfig();
  const colorTagConfig = useColorTag();

  const resize = () => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * maxRows;
    const shouldScroll = el.scrollHeight > maxHeight;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = shouldScroll ? "auto" : "hidden";
  };

  useEffect(() => {
    resize();
  }, [value, maxRows]);

  useEffect(() => {
    const item = itemRefs.current[activeIndex];
    if (!item) return;

    const container = item.parentElement;
    if (!container) return;

    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    if (itemTop < viewTop) {
      container.scrollTop = itemTop;
    } else if (itemBottom > viewBottom) {
      container.scrollTop = itemBottom - container.clientHeight;
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!format) return;

    const handleGlobalSelectionChange = () => {
      if (document.activeElement !== ref.current) return;

      const el = ref.current;
      if (!el) return;

      if (el.selectionStart === el.selectionEnd) {
        setShowToolbar(false);
        setSelectionRange(null);
      }
    };

    document.addEventListener("selectionchange", handleGlobalSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleGlobalSelectionChange);
    };
  }, [format]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;

    onChange(val);

    if (format && iconConfig) {
      const { word, start } = getCurrentWordInfo(val, cursor);
      const allSugs = getSuggestionsList(iconConfig);
      const filtered = filterSuggestions(word, allSugs, colorTagConfig);

      if (filtered.length > 0) {
        const offset = getCaretOffsetAt(e.target, start);
        setSuggestions(filtered);
        setSugStartIdx(start);
        setSugPos(offset);
        setActiveIndex(0);
      } else {
        setSuggestions([]);
      }
    }
  };

  const handleKeyDown = (e) => {
    const isMeta = e.ctrlKey || e.metaKey;
    const code = e.code;

    if (format && isMeta && ["KeyU", "KeyI", "KeyR", "KeyJ"].includes(code)) {
      e.preventDefault();

      if (selectionRange) {
        if (code === "KeyU") applyFormat("underline");
        if (code === "KeyI") applyFormat("italic");
        if (code === "KeyR") applyFormat("red");
        if (code === "KeyJ") applyFormat("justify");
      }
      return;
    }

    if (format && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertSuggestion(suggestions[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
      }
    }
  };

  const handleSelect = (e) => {
    const el = e.target;

    requestAnimationFrame(() => {
      const start = el.selectionStart;
      const end = el.selectionEnd;

      if (start !== end) {
        const selectedStr = el.value.substring(start, end).trim();

        if (selectedStr.length > 0) {
          const offset = getCaretOffsetAt(el, start);
          setSelectionRange({ start, end });
          setToolbarPos({ top: offset.top, left: offset.left });
          setShowToolbar(true);
          setSuggestions([]);
          return;
        }
      }

      setShowToolbar(false);
      setSelectionRange(null);

      if (format && iconConfig) {
        const { word, start: wordStart } = getCurrentWordInfo(el.value, start);
        const allSugs = getSuggestionsList(iconConfig);
        const filtered = filterSuggestions(word, allSugs, colorTagConfig);

        if (filtered.length > 0) {
          const offset = getCaretOffsetAt(el, wordStart);
          setSuggestions(filtered);
          setSugStartIdx(wordStart);
          setSugPos(offset);
        } else {
          setSuggestions([]);
        }
      }
    });
  };

  const handleMouseDown = () => {
    setTimeout(() => {
      const el = ref.current;
      if (el && el.selectionStart === el.selectionEnd) {
        setShowToolbar(false);
        setSelectionRange(null);
      }
    }, 0);
  };

  const insertSuggestion = (suggestion) => {
    if (!ref.current) return;

    ref.current.focus();
    ref.current.setSelectionRange(sugStartIdx, ref.current.selectionStart);

    try {
      document.execCommand("insertText", false, suggestion);
    } catch {
      const val = ref.current.value;
      const before = val.substring(0, sugStartIdx);
      const after = val.substring(ref.current.selectionStart);
      onChange(before + suggestion + after);
    }

    setSuggestions([]);
  };

  const applyFormat = (formatType, targetRange = null) => {
    const range = targetRange || selectionRange;
    if (!ref.current || !range) return;

    const { start, end } = range;
    const selectedText = ref.current.value.substring(start, end);
    let newSelectedText = "";

    if (formatType === "underline") {
      newSelectedText = selectedText.startsWith("__") && selectedText.endsWith("__")
        ? selectedText.slice(2, -2)
        : `__${selectedText}__`;
    } else if (formatType === "italic") {
      newSelectedText = selectedText.startsWith("*") && selectedText.endsWith("*") && !selectedText.startsWith("/*")
        ? selectedText.slice(1, -1)
        : `*${selectedText}*`;
    } else if (formatType === "red") {
      newSelectedText = selectedText.startsWith("/*") && selectedText.endsWith("*/") && !selectedText.startsWith("/**")
        ? selectedText.slice(2, -2)
        : `/*${selectedText}*/`;
    } else if (formatType === "justify") {
      newSelectedText = selectedText.startsWith("\\j") ? selectedText.slice(2) : `\\j${selectedText}`;
    }

    ref.current.focus();
    ref.current.setSelectionRange(start, end);

    try {
      document.execCommand("insertText", false, newSelectedText);
    } catch {
      const currentVal = ref.current.value;
      const newValue = currentVal.substring(0, start) + newSelectedText + currentVal.substring(end);
      onChange(newValue);
    }

    setShowToolbar(false);
    setSelectionRange(null);
  };

  const handleScroll = () => {
    if (overlayRef.current && ref.current) {
      overlayRef.current.scrollTop = ref.current.scrollTop;
      overlayRef.current.scrollLeft = ref.current.scrollLeft;
    }
  };

  const baseTextareaClass =
    "w-full p-2 disabled:pointer-events-none text-sm border rounded-md outline-none transition-all resize-none overflow-hidden";

  if (!format) {
    return (
      <div className={disabled ? "cursor-not-allowed" : ""}>
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={baseTextareaClass}
          style={{ minHeight: "40px" }}
        />
      </div>
    );
  }

  const dropdownPos = clampFloatingPosition({
    left: sugPos.left,
    top: sugPos.top + 24,
    width: 208,
    height: 192,
  });

  const toolbarFixedPos = clampFloatingPosition({
    left: toolbarPos.left,
    top: toolbarPos.top - 58,
    width: 240,
    height: 52,
  });

  return (
    <div className={`relative w-full ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
      {/* suggestion */}
      {suggestions.length > 0 && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed hidden md:flex bg-(--panel-bg) rounded-md flex-col max-h-49.5 overflow-y-auto w-52 z-51"
            style={{
              border: "1px solid var(--input-border)",
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
            }}
          >
            {suggestions.map((sug, idx) => {
              const isActive = idx === activeIndex;
              const exactConfig = iconConfig?.exact?.[sug];
              const isCustom = exactConfig && typeof exactConfig === "object" && exactConfig.custom === true;
              const isCostType = sug.includes("(") && !isCustom;

              return (
                <button
                  key={sug}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertSuggestion(sug);
                  }}
                  className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-xs transition-all font-normal ${
                    isActive
                      ? "bg-(--accent) hover:bg-(--accent-hover)"
                      : "hover:bg-(--bg-primary)"
                  }`}
                >
                  <span className="max-w-[65%] overflow-hidden truncate">{sug}</span>
                  <span className={`font-mono ${isActive ? "text-(--text-primary)" : "text-transparent"}`}>
                    {sug.startsWith("[")
                      ? "keyword"
                      : sug.includes("@[") && sug.endsWith("]")
                      ? "variants"
                      : isCustom
                      ? "custom"
                      : isCostType
                      ? "cost"
                      : "symbol"}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}

      {/* Toolbar */}
      {showToolbar && selectionRange && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed hidden md:flex bg-(--panel-bg) rounded-md items-center p-1.5 gap-1 z-51"
            style={{
              border: "1px solid var(--input-border)",
              top: `${toolbarFixedPos.top}px`,
              left: `${toolbarFixedPos.left}px`,
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat("underline")}
              className="hover:bg-(--bg-primary) p-1 rounded text-xs font-semibold underline shrink-0 min-w-8"
            >
              U
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat("italic")}
              className="hover:bg-(--bg-primary) p-1 rounded text-xs font-semibold italic shrink-0 min-w-8"
            >
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat("red")}
              className="hover:bg-(--bg-primary) p-1 rounded text-xs font-bold text-red-500 shrink-0 min-w-10"
            >
              Red
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat("justify")}
              className="hover:bg-(--bg-primary) flex items-center justify-center p-1 rounded shrink-0 min-w-10"
            >
              <JustifyIcon />
            </button>
          </div>,
          document.body
        )}

      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onMouseDown={handleMouseDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => {
            setSuggestions([]);
            setShowToolbar(false);
          }, 200);
        }}
        onScroll={handleScroll}
        disabled={disabled}
        className={`${baseTextareaClass} relative z-10`}
        style={{ minHeight: "40px" }}
      />
    </div>
  );
}