"use client";
import { useState, useEffect } from "react";
import {
  ICON_CONFIG_BASE,
  HYBRID_ICON_CONFIG,
  COLOR_TAG_BASE,
} from "../../../../utils/store/IconConfig";
import { CopyIcon, CheckIcon } from "../../../../components/Icon";

const BASE_KEYWORDS = {};
const ICON_META = {};

function ensureExtension(path, ext) {
  if (!path) return path;
  if (path.match(/\.(png|jpg|jpeg|webp)$/i)) return path;
  return `${path}${ext}`;
}

Object.entries(ICON_CONFIG_BASE.exact).forEach(([key, config]) => {
  BASE_KEYWORDS[key] = config.src;

  ICON_META[key] = {
    iconHeight: config.iconHeight || 11,
    iconWidth: config.iconWidth || null,
    iconOffsetY: config.iconYOffset || -1,
  };
});

Object.entries(ICON_CONFIG_BASE.prefixes).forEach(([prefix, config]) => {
  const ext = config.ext || ".png";

  BASE_KEYWORDS[prefix] = ensureExtension(config.baseSrc, ext);

  ICON_META[prefix] = {
    iconHeight: config.iconHeight || 11,
    iconWidth: config.iconWidth || null,
    iconOffsetY: config.iconYOffset || -1,
  };

  const min =
    config.valueRange?.min ??
    1;

  const max =
    config.valueRange?.max ??
    config.range ??
    1;

  for (let i = min; i <= max; i++) {
    const keyword = `${prefix}(${i})`;

    if (config.specials?.[i]) {
      BASE_KEYWORDS[keyword] = ensureExtension(
        config.specials[i].src,
        ext
      );

      ICON_META[keyword] = {
        iconHeight:
          config.specials[i].iconHeight ??
          config.iconHeight,

        iconWidth:
          config.specials[i].iconWidth ??
          config.iconWidth,

        iconYOffset:
          config.specials[i].iconYOffset ??
          config.iconYOffset,
      };
    } else {
      const finalPath = config.useNumberedFiles
        ? `${config.baseSrc}${i}`
        : config.baseSrc;

      BASE_KEYWORDS[keyword] = ensureExtension(
        finalPath,
        ext
      );

      ICON_META[keyword] = {
        iconHeight: config.iconHeight,
        iconWidth: config.iconWidth,
        iconYOffset: config.iconYOffset,
      };
    }
  }

  if (config.allowPlain !== false) {
    for (let i = min; i <= max; i++) {
      const plainKeyword = `${prefix}${i}`;

      if (!(plainKeyword in BASE_KEYWORDS)) {
        BASE_KEYWORDS[plainKeyword] =
          BASE_KEYWORDS[`${prefix}(${i})`];

        ICON_META[plainKeyword] =
          ICON_META[`${prefix}(${i})`];
      }
    }
  }
});

export const KEYWORDS = new Proxy(BASE_KEYWORDS, {
  get: (target, prop) => {
    if (prop in target) return target[prop];

    if (typeof prop === "string" && prop.includes("@")) {
      const [key, tint] = prop.split("@");

      if (target[key]) {
        return `${target[key]}@${tint}`;
      }
    }

    return target[prop];
  },
});

function applyTintToImage(src, tintColor, callback) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let r, g, b;
    if (typeof tintColor === 'string') {
      const match = tintColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      } else {
        callback(src);
        return;
      }
    } else if (tintColor.red !== undefined) {
      r = tintColor.red;
      g = tintColor.green;
      b = tintColor.blue;
    } else {
      callback(src);
      return;
    }

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    callback(canvas.toDataURL());
  };
  img.onerror = () => callback(src);
  img.src = src;
}

function getIconSpecs(src, isDark) {
  if (!src) {
    return { finalSrc: null, tintColor: null, needsTinting: false, filter: "none" };
  }

  let finalSrc = src;
  let needsTinting = false;
  let tintColor = null;
  let filter = "none";

  if (src.includes("@")) {
    const atIndex = src.lastIndexOf("@");
    const path = src.substring(0, atIndex);
    const colorKey = src.substring(atIndex + 1);

    // Check exclusive path first — use dedicated image with no tint
    const exclusiveKey = `${path}@${colorKey}`;
    const exclusive = HYBRID_ICON_CONFIG?.exclusivePaths?.[exclusiveKey];
    if (exclusive) {
      return { finalSrc: exclusive.src, tintColor: null, needsTinting: false, filter: "none" };
    }

    const preset = COLOR_TAG_BASE?.preset?.[colorKey];

    if (preset) {
      finalSrc = path;
      needsTinting = true;

      const colorObj = (preset.red !== undefined) ? preset : (isDark ? preset.dark : preset.light);
      tintColor = colorObj;

      return { finalSrc, tintColor, needsTinting, filter };
    }
  }

  const hybrid = HYBRID_ICON_CONFIG?.icons?.[finalSrc];
  const mode = isDark ? hybrid?.dark : hybrid?.light;

  if (mode) {
    if (mode.type === "path") {
      finalSrc = mode.value;
    } else if (mode.type === "invert") {
      filter = "invert(1)";
    } else if (mode.type === "tint" && mode.value) {
      needsTinting = true;
      tintColor = mode.value;
    }
  }

  return { finalSrc, tintColor, needsTinting, filter };
}

export function KeywordIconImage({ src, size, dark, className, onSizeLoaded, offsetY = 0 }) {
  const { finalSrc, tintColor, needsTinting, filter } = getIconSpecs(src, dark);
  const [img, setImg] = useState(null);
  const [error, setError] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: size, height: size });
  const [tintedSrc, setTintedSrc] = useState(null);
  const [isTinting, setIsTinting] = useState(false);

  useEffect(() => {
    if (needsTinting && finalSrc && tintColor) {
      setIsTinting(true);
      applyTintToImage(finalSrc, tintColor, (resultSrc) => {
        setTintedSrc(resultSrc);
        setIsTinting(false);
      });
    } else {
      setTintedSrc(null);
    }
  }, [needsTinting, finalSrc, tintColor]);

  useEffect(() => {
    let imageSrc = finalSrc;

    if (needsTinting) {
      if (tintedSrc) {
        imageSrc = tintedSrc;
      } else if (isTinting) {
        return;
      }
    }

    if (!imageSrc) return;

    const image = new Image();
    image.onload = () => {
      setImg(image);
      const ratio = image.width / image.height;
      const finalWidth = size * ratio;
      setNaturalSize({ width: finalWidth, height: size });
      if (onSizeLoaded) onSizeLoaded({ width: finalWidth, height: size });
    };
    image.onerror = () => setError(true);
    image.src = imageSrc;
  }, [finalSrc, tintedSrc, isTinting, needsTinting, size, onSizeLoaded]);

  if (error || !src) return null;
  if (!img && !(needsTinting && isTinting)) return <span className="inline-block" style={{ width: size, height: size }} />;
  if (needsTinting && isTinting) return <span className="inline-block" style={{ width: size, height: size }} />;

  const getDisplaySrc = () => {
    if (needsTinting && tintedSrc) return tintedSrc;
    return finalSrc;
  };

  const containerStyle = {
    width: naturalSize.width,
    height: naturalSize.height,
    display: "inline-block",
    position: "relative",
    top: offsetY,
    verticalAlign: "middle",
    filter: filter !== "none" ? filter : undefined,
  };

  return (
    <img
      src={getDisplaySrc()}
      alt="icon"
      className={className}
      style={{ ...containerStyle, objectFit: "contain" }}
    />
  );
}

export function SyntaxItem({ code, desc, iconSrc = null, iconSize = 16, iconOffsetY = 0, dark = false, textEffect = null }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const getCodeStyle = () => {
    let styles = { color: 'var(--text-primary)' };
    let className = '';
    if (textEffect === 'italic') className = 'italic';
    else if (textEffect === 'red') styles.color = '#ff0000';
    else if (textEffect === 'underline') className = 'underline';
    else if (typeof textEffect === 'object' && textEffect !== null) {
      if (textEffect.italic) styles.fontStyle = 'italic';
      if (textEffect.color) styles.color = textEffect.color;
      if (textEffect.underline) styles.textDecoration = 'underline';
      className = `${textEffect.italic ? 'italic' : ''} ${textEffect.underline ? 'underline' : ''}`;
    }
    return { styles, className };
  };

  const { styles, className: effectClass } = getCodeStyle();

  return (
    <div
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 group ${isCopied
          ? "border-green-500 bg-green-500/10"
          : "bg-(--bg-secondary) border-(--border-color) hover:border-(--accent) hover:bg-(--accent)/5"
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center flex-wrap">
          {iconSrc && (
            <span className="inline-flex items-center justify-center shrink-0">
              <KeywordIconImage src={iconSrc} size={iconSize} dark={dark} offsetY={iconOffsetY} className="opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="px-1.5 leading-1">-</span>
            </span>
          )}
          <code className={`text-sm font-mono transition-colors ${effectClass}`} style={styles}>{code}</code>
        </div>

        <div className="flex items-center justify-center shrink-0 w-4 h-4">
          {isCopied ? (
            <CheckIcon size={14} className="text-green-500 animate-in zoom-in-75 duration-150" />
          ) : (
            isHovered && (
              <CopyIcon size={14} className="text-(--text-secondary) group-hover:text-(--accent) transition-colors" />
            )
          )}
        </div>
      </div>
      {desc && <div className="text-sm text-(--text-secondary) mt-1.5 font-sans leading-relaxed">{desc}</div>}
    </div>
  );
}

export default function SyntaxGrid({ items, dark = false, columns = 2, itemsPerRow = null }) {
  const actualColumns = itemsPerRow || columns;
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  }[actualColumns] || `grid-cols-${actualColumns}`;

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {items.map((item, idx) => (
        <SyntaxItem key={idx} {...item} dark={item.dark ?? dark} />
      ))}
    </div>
  );
}

export { ICON_META };