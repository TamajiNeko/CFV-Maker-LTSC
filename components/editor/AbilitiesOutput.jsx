"use client";

import { Group, Text, Line } from "react-konva";
import React, {
  useMemo,
  useState,
  useEffect,
  memo,
  useRef,
  useCallback
} from "react";

import {
  ParseTokens,
  JustifyLine,
  getTextWidth,
  getFontStyle
} from "./text";

import {
  IconGenerator,
  PlainIcon,
  KeywordImage
} from "./icon";

import LRUCache from "../../utils/LRUCache";

const segmenter = new Intl.Segmenter(["th", "ja"], { granularity: "word" });

const renderTextWithStroke = (textNode, fullArt, dark) => {
  if (!fullArt) return textNode;

  return (
    <Group>
      {React.cloneElement(textNode, {
        stroke: dark ? "black" : "white",
        strokeWidth: 1.5,
        fill: undefined,
        listening: false,
        lineJoin: "round",
      })}
      {textNode}
    </Group>
  );
};

const RenderLine = memo(({
  line,
  lineIdx,
  lineHeight,
  fontSize,
  font,
  dark,
  fullArt,
  lang,
  iconWidths,
  getNodeWidth,
  handleIconWidthReady,
  ICON_CONFIG
}) => {
  const underlineOffset = fontSize - (lang == "en" ? 1 : 2);
  const iconUnderlineYShift = (lang == "en" ? -1 : 4);

  return (
    <Group y={lineIdx * lineHeight}>
      {line.map((node, nodeIdx) => {
        const renderWidth = getNodeWidth(node);
        const elementKey = `l${lineIdx}-n${nodeIdx}`;

        const underlineLayer =
          node.underline && (
            <Group key={`u-${elementKey}`} y={0.75}>
              {fullArt && (
                <Line
                  points={[
                    node.x,
                    underlineOffset,
                    node.x + renderWidth,
                    underlineOffset
                  ]}
                  stroke={dark ? "black" : "white"}
                  strokeWidth={2}
                  listening={false}
                />
              )}

              <Line
                points={[
                  node.x,
                  underlineOffset,
                  node.x + renderWidth,
                  underlineOffset
                ]}
                stroke={node.color || (dark ? "white" : "black")}
                strokeWidth={1}
                listening={false}
              />
            </Group>
          );

        let iconContent = null;
        const iconY = node.underline ? iconUnderlineYShift : 0 + (lang == "en" ? 0 : 4);

        if (node.type === "dynamic_icon") {
          iconContent = (
            <Group x={node.x} y={iconY}>
              <IconGenerator
                {...node}
                dark={dark}
                fullArt={fullArt}
                lineHeight={lineHeight}
                onWidthReady={(w) =>
                  handleIconWidthReady(node.cacheKey, w)
                }
              />
            </Group>
          );
        } else if (node.type === "plain_icon") {
          iconContent = (
            <Group x={node.x} y={iconY}>
              <PlainIcon
                {...node}
                dark={dark}
                fullArt={fullArt}
                lineHeight={lineHeight}
                onWidthReady={(w) =>
                  handleIconWidthReady(node.cacheKey, w)
                }
              />
            </Group>
          );
        } else if (node.type === "icon") {
          iconContent = (
            <KeywordImage
              src={node.src}
              x={node.x}
              y={iconY}
              tintColor={node.meta.tintColor}
              targetHeight={node.meta.iconHeight || 11}
              lineHeight={lineHeight}
              dark={dark}
              fullArt={fullArt}
              yOffset={node.meta.iconYOffset || 0}
              onSizeLoaded={(s) => {
                const calculatedWidth =
                  s.width * ((node.meta.iconHeight || 11) / s.height);

                handleIconWidthReady(node.cacheKey, calculatedWidth);
              }}
            />
          );
        }

        let textContent = null;

        if (node.type === "text") {
          const fontStyle = getFontStyle(node.italic, dark, lang);

          const baseText = (
            <Text
              text={node.text}
              x={node.x}
              y={1 + (lang == "en" ? 0 : 1)}
              scaleY={0.9}
              fontSize={fontSize}
              fontFamily={font}
              fontStyle={fontStyle}
              fill={node.color}
              letterSpacing={node.letterSpacing || 0}
              width={node.isExpandedSpace ? node.width : undefined}
              perfectDrawEnabled={false}
              listening={false}
            />
          );

          textContent = renderTextWithStroke(baseText, fullArt, dark);
        }
        return (
          <Group key={elementKey}>
            {underlineLayer}
            {iconContent}
            {textContent}
          </Group>
        );
      })}
    </Group>
  );
});

function AbilitiesOutput({
  lang = "en",
  text = "",
  x = 0,
  y = 0,
  font = 'Columbia',
  lineHeight = 14.67,
  fontSize = 11,
  onLinesChange = null,
  maxLines = 14,
  configVersion = 0,
  ICON_CONFIG,
  dark,
  fullArt,
  MAX_WIDTH = 370,
  isMobile = false,
  isCrest = false
}) {

  const [iconWidths, setIconWidths] = useState({});
  const [localVersion, setLocalVersion] = useState(0);

  const iconCacheRef = useRef(new LRUCache(100));
  const pendingUpdatesRef = useRef({});
  const updateTimeoutRef = useRef(null);
  const prevLineCountRef = useRef(-1);

  useEffect(() => {
    const handleUpdate = () => {
      iconCacheRef.current.clear();
      setLocalVersion(v => v + 1);
    };

    window.addEventListener("icon-config-changed", handleUpdate);

    return () => {
      window.removeEventListener("icon-config-changed", handleUpdate);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  const normalizeWidth = useCallback((v) => {
    return Math.round(v * 100) / 100;
  }, []);

  const getNodeWidth = useCallback((node) => {
    if (node.width) return node.width;
    if (node.adjustedWidth) return node.adjustedWidth;

    if (node.type === "text") {
      const style = getFontStyle(node.italic, dark, lang);

      const base = getTextWidth(
        node.text,
        fontSize,
        style,
        font
      );

      return node.letterSpacing
        ? base + node.letterSpacing * (node.text.length - 1)
        : base;
    }

    return 0;
  }, [dark, fontSize, font, lang]);

  const measureTextForJustify = useCallback((wordText, currentFontSize) => {
    const style = getFontStyle(false, dark, lang);
    return getTextWidth(wordText, currentFontSize, style, font);
  }, [dark, lang, font]);

  const handleIconWidthReady = useCallback((key, width) => {
    let finalWidth = fullArt ? width + 0.5 : width;
    const w = normalizeWidth(finalWidth);
    const cached = iconCacheRef.current.get(key);

    if (cached != null && Math.abs(cached - w) < 0.25) {
      return;
    }

    iconCacheRef.current.set(key, w);
    pendingUpdatesRef.current[key] = w;

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    const delay = isMobile ? 32 : 16;
    updateTimeoutRef.current = setTimeout(() => {
      setIconWidths(prev => ({
        ...prev,
        ...pendingUpdatesRef.current
      }));
      pendingUpdatesRef.current = {};
    }, delay);
  }, [normalizeWidth, fullArt, isMobile]);

  const allLines = useMemo(() => {
    const rawParagraphs = text.split("\n");

    let lines = [];
    let currentLine = [];
    let offsetX = 0;
    let nodeCounter = 0;

    const pushLine = (forceJustify = false) => {
      if (!currentLine.length || lines.length >= maxLines) {
        return;
      }

      while (
        currentLine.length &&
        currentLine[currentLine.length - 1].type === "text" &&
        /^\s+$/.test(currentLine[currentLine.length - 1].text)
      ) {
        currentLine.pop();
      }

      if (!currentLine.length) return;

      const totalW = currentLine.reduce(
        (a, n) => a + (n.width || 0),
        0
      );

      lines.push(
        forceJustify || totalW > MAX_WIDTH * 0.98
          ? JustifyLine(
            currentLine,
            MAX_WIDTH,
            fontSize,
            measureTextForJustify
          )
          : [...currentLine]
      );

      currentLine = [];
      offsetX = 0;
    };

    for (const paraRaw of rawParagraphs) {
      if (lines.length >= maxLines) break;

      const isForce = paraRaw.includes("\\j");
      const para = paraRaw.replace(/\\j/g, "");

      const tokens = ParseTokens(
        para,
        ICON_CONFIG,
        dark
      );

      for (const token of tokens) {
        if (lines.length >= maxLines) break;

        if (["dynamic_icon", "plain_icon", "icon"].includes(token.type)) {
          const key =
            token.type === "icon"
              ? `${token.src}_${token.meta.iconHeight || 11}`
              : token.type === "plain_icon"
                ? `plain_${token.prefix}_${token.meta?.iconHeight || token.height || 11}`
                : `${token.prefix}_${token.value}_${token.meta?.iconHeight || token.height || 11}`;

          const rawWidth = iconWidths[key] ?? 20;
          const width = rawWidth + 1;

          if (offsetX + width > MAX_WIDTH) {
            pushLine(true);
          }

          currentLine.push({
            ...token,
            id: `${token.type}-${nodeCounter}`,
            x: offsetX,
            width,
            cacheKey: key
          });

          offsetX += width;
          nodeCounter++;
          continue;
        }

        if (token.type === "text") {
          for (const p of token.parts) {
            const style = getFontStyle(
              p.italic,
              dark,
              lang
            );

            const hasCjkOrThai = /[\u0E00-\u0E7F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(p.text);

            let words = [];
            if (hasCjkOrThai) {
              const segments = segmenter.segment(p.text);
              words = Array.from(segments).map(s => s.segment);
            } else {
              words = p.text.split(/(\s+)/);
            }

            for (const word of words) {
              if (!word) continue;

              const w = getTextWidth(
                word,
                fontSize,
                style,
                font
              );

              const isSpace = /^\s+$/.test(word);

              if (offsetX + w > MAX_WIDTH) {
                if (isSpace) {
                  pushLine(true);
                } else {
                  pushLine(true);
                  currentLine.push({
                    ...p,
                    id: `node-${nodeCounter}`,
                    type: "text",
                    text: word,
                    x: 0,
                    width: w
                  });
                  offsetX = w;
                }
              } else {
                if (offsetX === 0 && isSpace) {
                  continue;
                }

                currentLine.push({
                  ...p,
                  id: `node-${nodeCounter}`,
                  type: "text",
                  text: word,
                  x: offsetX,
                  width: w
                });

                offsetX += w;
              }

              nodeCounter++;
            }
          }
        }
      }

      pushLine(isForce);
    }

    return lines;
  }, [
    text,
    fontSize,
    iconWidths,
    dark,
    configVersion,
    localVersion,
    maxLines,
    MAX_WIDTH,
    ICON_CONFIG,
    lang,
    font,
  ]);

  useEffect(() => {
    if (prevLineCountRef.current !== allLines.length) {
      prevLineCountRef.current = allLines.length;
      onLinesChange?.(allLines.length);
    }
  }, [allLines.length, onLinesChange]);

  const totalHeight = allLines.length * lineHeight;

  return (
    <Group
      x={x}
      y={
        isCrest
          ? y - (totalHeight / 2)
          : y - totalHeight
      }
    >
      {allLines
        .slice(0, maxLines)
        .map((line, lineIdx) => (
          <RenderLine
            key={`line-${lineIdx}`}
            line={line}
            lineIdx={lineIdx}
            lineHeight={lineHeight}
            fontSize={fontSize}
            font={font}
            dark={dark}
            fullArt={fullArt}
            lang={lang}
            iconWidths={iconWidths}
            getNodeWidth={getNodeWidth}
            handleIconWidthReady={handleIconWidthReady}
            ICON_CONFIG={ICON_CONFIG}
          />
        ))}
    </Group>
  );
}

export default memo(AbilitiesOutput);