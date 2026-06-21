"use client";
import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group, Text } from 'react-konva';
import useImage from 'use-image';
import AbilitiesBox from './AbilitiesOutput';
import { getBoxPath } from '../../utils/store/CardConstants';
import { useIconConfig } from '../../utils/store/IconConfig';
import {
  getBasePath,
  getPassivePath,
  getTriggerPath,
  getNationPath,
  getTagPath,
  getRacePath,
  getShieldPath,
  getClanPath,
  getLocalizedPath,
  getAssetPath,
  getGradePath
} from '../../utils/PathHelper';
import { typeLabel, RACE_OVERLAY, getShieldOverlay } from '../../utils/store/CardConstants';

const MAX_CHARS_PER_LINE = 60;
const MAX_RENDER_LINES = 2;
let BASE_WIDTH = 400;
let BASE_HEIGHT = 584;

const EXPORT_PRESETS = {
  max: { width: 2805, height: 4090, label: 'Max (7x)', viewportWidth: 400, viewportHeight: 584 },
  standard: { width: 1600, height: 2336, label: 'Standard (4x)', viewportWidth: 400, viewportHeight: 584 },
  lite: { width: 800, height: 1168, label: 'Lite (2x)', viewportWidth: 400, viewportHeight: 584 },
};

function wrapFlavorText(text) {
  if (!text) return "";
  const rawLines = text.split("\n");
  const result = [];
  for (let line of rawLines) {
    while (line.length > MAX_CHARS_PER_LINE) {
      result.push(line.slice(0, MAX_CHARS_PER_LINE));
      line = line.slice(MAX_CHARS_PER_LINE);
    }
    result.push(line);
  }
  return result.slice(0, MAX_RENDER_LINES).join("\n");
}

export default function CardEditor({
  overlayNation,
  overlayClan,
  overlayType,
  subOrderType,
  isSubType,
  overlayPassive,
  overlayAddition,
  overlayTrigger,
  overlayCardName,
  overlayRaceText,
  raceCheck,
  overlayGrade,
  overlayPower,
  overlayShieldValue,
  shieldCheck,
  overlayIllust,
  overlayFlavor,
  overlayAbilities,
  isFullArt,
  showGlobe,
  customLayers,
  baseColorTint,
  showClan,
  customNationEnabled,
  solidColor,
  customNationName,
  cardNameGradient,
  nationGradient,

  isMobile,
  isLocked,
  isDragging,
  imageSrc,
  exportTrigger,
  exportPreset = 'standard',
  onImageConfigChange,
  initialImageConfig,
  lang,
  onExportEnd,
}) {
  const ICON_CONFIG = useIconConfig();
  const isInternalUpdate = useRef(false);
  const stageRef = useRef(null);
  const flavorTextRef = useRef(null);
  const hasAppliedInitialConfig = useRef(
    Boolean(initialImageConfig?.scale != null && imageSrc)
  );
  const baseOverlayGroupRef = useRef(null);

  const font = lang === "en" ? "Columbia" : "PSLxImperial";
  const fontSize = lang === "en" ? 11 : 18;
  const lineHeight = lang === "en" ? 14.5 : 16.97;

  const [boxLine, setBoxLine] = useState(0);
  const [boxLine2, setBoxLine2] = useState(0);

  const [textWidth, setTextWidth] = useState(0);
  const [contentConfig, setContentConfig] = useState(() =>
    initialImageConfig?.scale ? initialImageConfig : { scale: 1, x: 0, y: 0 }
  );

  const lastCenter = useRef(null);
  const lastDist = useRef(0);
  const [isMultiTouch, setIsMultiTouch] = useState(false);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setTimeout(() => {
        setFontsLoaded(true);
      }, 150);
    });
  }, []);

  const isNormalUnit = overlayType === `base_normal.png`;
  const isTriggerUnit = overlayType === 'base_trigger.png';
  const isTriggerOrder = overlayType === 'base_trigger_o.png' || overlayType === 'base_blitz_trigger_o.png' || overlayType === 'base_set_trigger_o.png';
  const isGUnitEncounter = overlayType === 'base_g.png/encounter';
  const isGUnit = isGUnitEncounter || overlayType === 'base_g.png';
  const isEncounter = overlayType === 'base_encounter.png' || isGUnitEncounter;
  const isTokenUnit = overlayType === 'base_normal.png/token';
  const isDarkMode = isEncounter || overlayType === 'base_crest.png/encounter';

  const isMarker = overlayType === 'base_ticket.png/marker';
  const isEnergy = overlayType === 'base_ticket.png';

  const isCrest = overlayType.split('.png')[0] + '.png' === 'base_crest.png'

  if (isCrest) {
    BASE_WIDTH = 584;
    BASE_HEIGHT = 400;
  } else {
    BASE_WIDTH = 400;
    BASE_HEIGHT = 584;
  }

  const isUnit = isNormalUnit || isTriggerUnit || isTokenUnit || isGUnit || isEncounter
  const isOrder = !isUnit && !isMarker && !isEnergy && !isCrest
  const hasClan = (showClan || isEncounter) && overlayClan !== 'race.png';

  const totalAbilitiesLines = lang == "en" ? 14 : 12;
  const firstMaxLines = Math.max(0, totalAbilitiesLines - boxLine2);
  const secondMaxLines = Math.max(0, totalAbilitiesLines - boxLine);

  const [isExporting, setIsExporting] = useState(false);

  const passivePath = overlayPassive ? getPassivePath(overlayPassive) : null;
  const additionPath = overlayAddition ? getPassivePath(overlayAddition) : null;
  const triggerPath = overlayTrigger ? getTriggerPath(overlayTrigger) : null;
  const nationPath = overlayNation ? (isUnit ? getNationPath(overlayNation) : isCrest ? getNationPath(overlayNation, false).replace(".png", "_c.png") : getNationPath(overlayNation).replace(".png", "_o.png")) : null;
  const vertexPath = (overlayNation && isCrest) ? getNationPath(overlayNation, false).replace(".png", "_v.png") : null;
  const gradeNationPath = customNationEnabled ? getGradePath('custom.png') : getGradePath(overlayNation);
  const tagFile = overlayType ? typeLabel[overlayType] : null;
  const shieldFile = getShieldOverlay(shieldCheck, overlayShieldValue);
  const shieldPath = shieldFile ? getShieldPath(shieldFile) : null;
  const raceOverlayPath = getRacePath(RACE_OVERLAY);
  const [base_overlay] = useImage(baseColorTint?.enabled ? '/assets/base/base_overlay_custom.png' : '/assets/base/base_overlay.png');
  const [base_overlay_top] = useImage(getLocalizedPath('/assets/base/base_overlay_top.png'));
  const encounterFrame = isDarkMode ? '/assets/frame/EN.png' : null;
  const tokenFramePath = '/assets/frame/token.png';
  const globe = showGlobe ? 'assets/base/globe.png' : null;

  const typePath = overlayType ? getBasePath(overlayType, (isNormalUnit || isTriggerUnit || isTokenUnit || !isUnit) ? false : true).split('.png')[0] + '.png' : null;
  let tagPath = tagFile ? getTagPath(tagFile) : null;

  const [debouncedAbilities, setDebouncedAbilities] = useState("");
  const [secondAbilities, setSecondAbilities] = useState("");

  // Custom
  const customSuffix = isOrder ? '_o' : '';

  let nation_bg = `/assets/base/nation/custom${customSuffix}.png`;

  let gradient = `/assets/base/nation/custom/gradient${customSuffix}.png`;
  let color = `/assets/base/nation/custom/color${customSuffix}.png`;

  let nation = `/assets/base/nation/custom/nation${customSuffix}.png`;
  let nation_frame = `/assets/base/nation/custom/nation_frame${customSuffix}.png`;

  let front = `/assets/base/nation/custom/front${customSuffix}.png`;
  let hide_flag = `/assets/base/nation/custom/hide_flag${customSuffix}.png`;

  // --

  let subOrderColor = "#000000"

  if (isOrder && isSubType) {
    if (isTriggerOrder) {
      subOrderColor = "#8e2500";
    } else if (typePath?.includes("normal")) {
      subOrderColor = "#00245c";
    } else if (typePath?.includes("blitz")) {
      subOrderColor = "#870b15";
    } else if (typePath?.includes("set")) {
      subOrderColor = "#121d30";
    }
    tagPath = tagPath.replace(".png", "2.png");
  }

  useEffect(() => {
    const handler = setTimeout(() => {

      if (isUnit || isMarker || isCrest) {
        setDebouncedAbilities(overlayAbilities || "");
        setSecondAbilities("");
        return;
      }

      const lines = overlayAbilities.split("\n");

      const blocks = [];
      let currentBlock = [];

      for (const line of lines) {
        if (line.trim() === "") {
          if (currentBlock.length > 0) {
            blocks.push(currentBlock.join("\n"));
            currentBlock = [];
          }
        } else {
          currentBlock.push(line);
        }
      }

      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
      }

      setDebouncedAbilities(blocks[0] || "");
      setSecondAbilities(blocks[1] || "");

    }, 250);

    return () => clearTimeout(handler);
  }, [overlayAbilities, isUnit]);

  useEffect(() => {
    if (!secondAbilities) {
      setBoxLine2(0);
    }
  }, [secondAbilities]);

  useEffect(() => {
    if (!debouncedAbilities) {
      setBoxLine(0);
    }
  }, [debouncedAbilities]);

  const [flavorBG] = isDarkMode
    ? useImage(('/assets/flavor/box_enc.png'))
    : useImage(('/assets/flavor/box.png'));

  const [flavorL] = isDarkMode
    ? useImage(('/assets/flavor/fadeL_enc.png'))
    : useImage(('/assets/flavor/fadeL.png'));

  const [flavorR] = isDarkMode
    ? useImage(('/assets/flavor/fadeR_enc.png'))
    : useImage(('/assets/flavor/fadeR.png'));

  const [flavorBG2] = isDarkMode
    ? useImage(('/assets/flavor/box2_enc.png'))
    : useImage(('/assets/flavor/box2.png'));

  const [flavorL2] = isDarkMode
    ? useImage(('/assets/flavor/fadeL2_enc.png'))
    : useImage(('/assets/flavor/fadeL2.png'));

  const [flavorR2] = isDarkMode
    ? useImage(('/assets/flavor/fadeR2_enc.png'))
    : useImage(('/assets/flavor/fadeR2.png'));

  const [DIcon] = useImage(isCrest ? ('/assets/icon_landscape.png') : ('/assets/icon.png'));

  const [imageObj] = useImage(imageSrc ? imageSrc : null);

  useEffect(() => {
    if (!imageSrc) return;
    const hasSavedConfig =
      initialImageConfig?.scale != null &&
      (initialImageConfig.scale !== 1 ||
        initialImageConfig.x !== 0 ||
        initialImageConfig.y !== 0);
    if (!hasSavedConfig) {
      hasAppliedInitialConfig.current = false;
    }
  }, [imageSrc]);

  const isBaseOverlayVisible = Boolean(base_overlay && (isNormalUnit || isTriggerUnit || isTokenUnit));

  useEffect(() => {
    const node = baseOverlayGroupRef.current;
    if (!node) return;

    node.clearCache();

    if (isBaseOverlayVisible) {
      node.cache({
        x: 0,
        y: 0,
        width: BASE_WIDTH,
        height: BASE_HEIGHT
      });
      const layer = node.getLayer();
      if (layer) {
        layer.batchDraw();
      }
    }
  }, [isBaseOverlayVisible, base_overlay, baseColorTint?.enabled, baseColorTint?.color, isTriggerUnit, BASE_WIDTH, BASE_HEIGHT]);

  useEffect(() => {
    if (initialImageConfig?.scale &&
      (Math.abs(initialImageConfig.scale - contentConfig.scale) > 0.001 ||
        Math.abs(initialImageConfig.x - contentConfig.x) > 0.001 ||
        Math.abs(initialImageConfig.y - contentConfig.y) > 0.001)) {
      isInternalUpdate.current = true;
      setContentConfig(initialImageConfig);
      hasAppliedInitialConfig.current = true;
    }
  }, [initialImageConfig?.scale, initialImageConfig?.x, initialImageConfig?.y]);

  useEffect(() => {
    if (!imageObj) return;

    const isDefaultConfig = contentConfig.x === 0 && contentConfig.y === 0 && contentConfig.scale === 1;

    if (!hasAppliedInitialConfig.current || isDefaultConfig) {
      const scale = BASE_HEIGHT / imageObj.height;
      const scaledWidth = imageObj.width * scale;

      const newConfig = {
        scale,
        x: (BASE_WIDTH - scaledWidth) / 2,
        y: 0
      };

      isInternalUpdate.current = true;
      setContentConfig(newConfig);
      hasAppliedInitialConfig.current = true;
    }
  }, [imageObj, imageSrc]);

  useEffect(() => {
    if (exportTrigger > 0) handleExport();
  }, [exportTrigger]);

  useEffect(() => {
    if (flavorTextRef.current) setTextWidth(flavorTextRef.current.width());
  }, [overlayFlavor, fontsLoaded]);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    onImageConfigChange?.(contentConfig);
  }, [contentConfig.scale, contentConfig.x, contentConfig.y, onImageConfigChange]);


  const handleExport = async () => {
    if (!stageRef.current) return;

    const currentPreset = EXPORT_PRESETS[exportPreset] || EXPORT_PRESETS.standard;
    const exportScale = currentPreset.width / BASE_WIDTH;

    setIsExporting(exportScale);

    await new Promise(r => setTimeout(r, 80));

    try {
      const offscreenCanvas = stageRef.current.toCanvas({
        pixelRatio: exportScale,
      });

      const bitmap = await createImageBitmap(offscreenCanvas);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = bitmap.width;
      tempCanvas.height = bitmap.height;

      const ctx = tempCanvas.getContext('bitmaprenderer');
      ctx.transferFromImageBitmap(bitmap);

      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const safeFileName = overlayCardName.replace(/[/\\?%*:|"<>]/g, '').trim() || 'card';

        const link = document.createElement('a');
        link.download = `${safeFileName}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        bitmap.close();
      }, 'image/png');

    } catch (error) {
    }

    setIsExporting(false);
    onExportEnd?.();
  };

  const getDistance = (p1, p2) => {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2)
    );
  };

  const getCenter = (p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleTouchMove = useCallback((e) => {
    if (isLocked || isDragging) return;

    const touches = e.evt.touches;

    setIsMultiTouch(touches.length >= 2);

    const touch1 = touches[0];
    const touch2 = touches[1];

    if (!touch1 || !touch2) {
      lastCenter.current = null;
      lastDist.current = 0;
      return;
    }

    e.evt.preventDefault();

    const p1 = {
      x: touch1.clientX,
      y: touch1.clientY,
    };

    const p2 = {
      x: touch2.clientX,
      y: touch2.clientY,
    };

    const center = getCenter(p1, p2);
    const dist = getDistance(p1, p2);

    if (!lastCenter.current) {
      lastCenter.current = center;
      lastDist.current = dist;
      return;
    }

    const dx = center.x - lastCenter.current.x;
    const dy = center.y - lastCenter.current.y;

    const scaleBy = dist / lastDist.current;

    setContentConfig((prev) => {
      const oldScale = prev.scale;

      const newScale = oldScale * scaleBy;

      const pointTo = {
        x: (center.x - prev.x) / oldScale,
        y: (center.y - prev.y) / oldScale,
      };

      const newPos = {
        x: center.x - pointTo.x * newScale,
        y: center.y - pointTo.y * newScale,
      };

      return {
        scale: newScale,
        x: newPos.x + dx,
        y: newPos.y + dy,
      };
    });

    lastCenter.current = center;
    lastDist.current = dist;
  }, [isLocked, isDragging]);

  const handleWheel = useCallback((e) => {
    if (isLocked || isDragging) return;
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    setContentConfig(prev => {
      const oldScale = prev.scale;
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const mousePointTo = { x: (pointer.x - prev.x) / oldScale, y: (pointer.y - prev.y) / oldScale };
      return { scale: newScale, x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale };
    });
  }, [isLocked, isDragging]);

  const handleDragEnd = useCallback((newPos) => {
    setContentConfig(prev => ({ ...prev, x: newPos.x, y: newPos.y }));
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touches = e.evt.touches;

    if (touches.length < 2) {
      setIsMultiTouch(false);

      lastCenter.current = null;
      lastDist.current = 0;
    }
  }, []);

  const processedFlavor = wrapFlavorText(overlayFlavor);
  const flavorLine = processedFlavor.split("\n").length;

  const getFlavorY = () => {
    const totalLines = secondAbilities
      ? boxLine + boxLine2 + (lang == "en" ? 1.5 : 1.25)
      : boxLine;

    if (totalLines === 0) {
      return flavorLine > 1 ? 460 : 475;
    }

    if (totalLines === 1) {
      return (flavorLine > 1 ? 460 : 475) - (lang == "en" ? 30 : 33);
    }

    return (
      flavorLine > 1
        ? 460 - (18 + (totalLines * (lang == "en" ? 14.5 : 17)))
        : 475 - (18 + (totalLines * (lang == "en" ? 14.5 : 17)))
    );
  };

  useEffect(() => {
    if (!overlayAbilities || overlayAbilities.trim() === "") {
      setBoxLine(0);
      setBoxLine2(0);
    }
  }, [overlayAbilities]);

  const [nameScaleX, setNameScaleX] = useState(1);
  const [cardNameWidth, setCardNameWidth] = useState(0);
  const cardNameRef = useRef(null);

  const [raceScaleX, setRaceScaleX] = useState(1);
  const [raceTextWidth, setRaceTextWidth] = useState(0);
  const raceTextRef = useRef(null);

  useLayoutEffect(() => {
    if (cardNameRef.current) {
      const actualWidth = cardNameRef.current.width();
      const maxWidth = 240;

      setCardNameWidth(actualWidth);

      if (actualWidth > maxWidth) {
        setNameScaleX(maxWidth / actualWidth);
      } else {
        setNameScaleX(1);
      }
    }
  }, [overlayCardName, fontsLoaded]);

  const [subtypeScaleX, setSubtypeScaleX] = useState(1);
  const [subtypeWidth, setSubtypeWidth] = useState(0);
  const subtypeRef = useRef(null);

  useLayoutEffect(() => {
    if (subtypeRef.current) {
      const actualWidth = subtypeRef.current.width();
      const maxWidth = 54;

      setSubtypeWidth(actualWidth);

      if (actualWidth > maxWidth) {
        setSubtypeScaleX(maxWidth / actualWidth);
      } else {
        setSubtypeScaleX(1);
      }
    }
  }, [subOrderType, lang, fontsLoaded]);

  useLayoutEffect(() => {
    if (raceTextRef.current) {
      const actualWidth = raceTextRef.current.width();
      const maxWidth = hasClan ? 50 : 100;

      setRaceTextWidth(actualWidth);

      if (actualWidth > maxWidth) {
        setRaceScaleX(maxWidth / actualWidth);
      } else {
        setRaceScaleX(1);
      }
    }
  }, [overlayRaceText, hasClan, fontsLoaded]);

  const [nationScaleX, setNationScaleX] = useState(1);
  const [nationTextWidth, setNationTextWidth] = useState(0);
  const nationTextRef = useRef(null);

  useLayoutEffect(() => {
    if (nationTextRef.current) {
      const actualWidth = nationTextRef.current.width();
      const maxWidth = 100;

      setNationTextWidth(actualWidth);

      if (actualWidth > maxWidth) {
        setNationScaleX(maxWidth / actualWidth);
      } else {
        setNationScaleX(1);
      }
    }
  }, [customNationName, fontsLoaded]);

  return (
    <Stage
      width={BASE_WIDTH}
      height={BASE_HEIGHT}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={stageRef}
      style={{
        cursor: isLocked ? 'default' : 'move',
        touchAction: 'none',
      }}
    >
      <Layer
        key={fontsLoaded ? 'fonts-ready' : 'fonts-loading'}
        clipFunc={(ctx) => {
          const r = 24, w = BASE_WIDTH, h = BASE_HEIGHT;
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.lineTo(w - r, 0);
          ctx.quadraticCurveTo(w, 0, w, r);
          ctx.lineTo(w, h - r);
          ctx.quadraticCurveTo(w, h, w - r, h);
          ctx.lineTo(r, h);
          ctx.quadraticCurveTo(0, h, 0, h - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
        }}
      >
        {/* Background */}
        <Rect width={BASE_WIDTH} height={BASE_HEIGHT} fill="white" />

        {/* Art */}
        <Group visible={Boolean(imageSrc)}>
          {imageSrc && (
            <EditableImage
              url={imageSrc}
              config={contentConfig}
              draggable={!isLocked && !isMultiTouch}
              onDragEnd={handleDragEnd}
            />
          )}
        </Group>

        {/* Encounter Frame */}
        <OverlayFrame visible={Boolean(isDarkMode && !isFullArt && !isCrest)} exportScale={isExporting} url={encounterFrame} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Crest Globe */}
        <OverlayFrame visible={isCrest && showGlobe} exportScale={isExporting} url={globe} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Crest Vertext */}
        <OverlayFrame visible={isCrest} exportScale={isExporting} url={vertexPath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Base Type */}
        <OverlayFrame visible={Boolean(typePath)} exportScale={isExporting} url={typePath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Base Overlay */}
        <KonvaImage
          visible={isBaseOverlayVisible}
          image={base_overlay}
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          listening={false}
          filters={baseColorTint?.enabled ? [Konva.Filters.RGB] : []}
          red={baseColorTint?.enabled ? parseInt(baseColorTint.color.slice(1, 3), 16) : 255}
          green={baseColorTint?.enabled ? parseInt(baseColorTint.color.slice(3, 5), 16) : 255}
          blue={baseColorTint?.enabled ? parseInt(baseColorTint.color.slice(5, 7), 16) : 255}
          ref={(node) => {
            if (node) {
              node.clearCache();
              if (baseColorTint?.enabled) {
                node.cache({
                  x: 0,
                  y: 0,
                  width: BASE_WIDTH,
                  height: BASE_HEIGHT,
                  pixelRatio: isExporting || 1
                });
              }
            }
          }}
        />
        <KonvaImage visible={Boolean(base_overlay_top && (isNormalUnit || isTriggerUnit || isTokenUnit))} image={base_overlay_top} width={BASE_WIDTH} height={BASE_HEIGHT} listening={false} />

        {/* Token Frame */}
        <OverlayFrame visible={Boolean(overlayType?.includes("/token"))} exportScale={isExporting} url={tokenFramePath} width={BASE_WIDTH} height={BASE_HEIGHT} />
        {/* Nation Label */}
        <OverlayFrame visible={Boolean((isCrest || !customNationEnabled) && overlayNation && !isMarker && !isEnergy)} exportScale={isExporting} url={nationPath} width={BASE_WIDTH} height={BASE_HEIGHT} />
        {/* Custom */}
        <Group visible={Boolean(customNationEnabled && !isMarker && !isEnergy && !isCrest)}>
          <OverlayFrame exportScale={isExporting} url={nation_bg} width={BASE_WIDTH} height={BASE_HEIGHT} />
          <GradientOverlayFrame
            url={gradient}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            colors={cardNameGradient}
            exportScale={isExporting}
          />
          <GradientOverlayFrame
            url={color}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            colors={[solidColor]}
            exportScale={isExporting}
          />
          <OverlayFrame exportScale={isExporting} url={front} width={BASE_WIDTH} height={BASE_HEIGHT} />
          <OverlayFrame exportScale={isExporting} url={hide_flag} width={BASE_WIDTH} height={BASE_HEIGHT} />
          <GradientOverlayFrame
            url={nation}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            colors={nationGradient}
            orientation={"horizon"}
            exportScale={isExporting}
          />
          <GradientOverlayFrame
            url={nation_frame}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            colors={[solidColor]}
            exportScale={isExporting}
          />
        </Group>

        {/* Custom Layers */}
        {customLayers && customLayers.map((layer) => (
          <OverlayFrame
            key={layer.id}
            visible={Boolean(layer.src && layer.visible)}
            exportScale={isExporting}
            url={layer.src}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
          />
        ))}

        {/* Grade Nation Icon */}
        <OverlayFrame visible={Boolean(overlayNation && !isMarker && !isEnergy && !isCrest)} exportScale={isExporting} url={gradeNationPath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Tag */}
        <OverlayFrame visible={Boolean(tagPath)} exportScale={isExporting} url={tagPath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Subtype */}
        <Group
          visible={Boolean(isSubType && !isMarker && !isUnit)}
          key={`${lang}-${subOrderType}-${fontsLoaded}`}
          x={19.25}
          y={540.75 + (isMobile ? (lang == "en" ? 2.25 : -0.5) : 0) + (lang == "en" ? 0 : 0.25)}
        >
          <Text
            ref={subtypeRef}
            text={subOrderType}
            x={27}
            offsetX={subtypeWidth / 2}
            fontSize={lang == "en" ? 9 : 12}
            fontFamily={lang == "en" ? "OptimaLT" : "Sirin"}
            stroke={subOrderColor}
            strokeWidth={2}
            scaleY={lang == "en" ? 1 : 0.85}
            scaleX={subtypeScaleX}
            fontStyle={lang == "en" ? "bold" : "normal"}
            align="center"
            lineJoin="round"
            lineCap="round"
            perfectDrawEnabled={false}
            listening={false}
          />

          <Text
            text={subOrderType}
            x={27}
            offsetX={subtypeWidth / 2}
            fontSize={lang == "en" ? 9 : 12}
            fontFamily={lang == "en" ? "OptimaLT" : "Sirin"}
            fill="white"
            scaleY={lang == "en" ? 1 : 0.85}
            scaleX={subtypeScaleX}
            fontStyle={lang == "en" ? "bold" : "normal"}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>

        {/* Addition */}
        <OverlayFrame visible={Boolean(additionPath && (isUnit || isOrder) && !isGUnit && !isTokenUnit)} exportScale={isExporting} url={additionPath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Passive */}
        <OverlayFrame visible={Boolean(passivePath && isUnit)} exportScale={isExporting} url={isGUnit ? getPassivePath('tripledrive.png') : passivePath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Race Overlay */}
        <Group visible={Boolean(isUnit && (customNationEnabled || (raceOverlayPath && (raceCheck || overlayClan !== `race.png`))))}>
          <OverlayFrame exportScale={isExporting} url={(hasClan && !customNationEnabled) ? getClanPath(overlayClan) : raceOverlayPath} width={BASE_WIDTH} height={BASE_HEIGHT} />
        </Group>

        {/* Shield */}
        <OverlayFrame visible={Boolean(shieldPath && isUnit && shieldCheck && !isGUnit)} exportScale={isExporting} url={shieldPath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Trigger */}
        <OverlayFrame visible={Boolean(triggerPath && (isTriggerUnit || isTriggerOrder))} exportScale={isExporting} url={triggerPath} width={BASE_WIDTH} height={BASE_HEIGHT} />

        {/* Card Name */}
        <Text
          ref={cardNameRef}
          text={overlayCardName}
          x={(isCrest ? 180 : 85 + (240 / 2)) - (lang == "en" ? 0 : 4)}
          y={(isCrest ? 337.75 : (isUnit ? 513 : 534.25)) - (lang == "en" ? 0 : 5.75)}
          fontSize={lang == "en" ? 18.14 : 25}
          skewX={lang == "en" ? (-20 * (Math.PI / 180)) : 0}
          scaleX={nameScaleX}
          scaleY={lang == "en" ? 0.85 : 0.9}
          wrap="none"
          ellipsis={false}
          fontFamily={lang == "en" ? "Anton" : "PSLxOlarn"}
          fontStyle={lang == "en" ? 500 : 'normal'}
          fill="black"
          align="center"
          perfectDrawEnabled={false}
          listening={false}
          offsetX={cardNameWidth / 2}
        />

        {/* Nation Text */}
        <Group
          visible={Boolean(customNationEnabled && (isUnit || isOrder))}
          x={isOrder ? 174 : 242}
          y={(isMobile ? 541 : 539) + (isOrder ? 19 : 0) - (lang == "en" ? -1 : 3.5)}
          scaleY={lang == "en" ? 1 : 0.95}
        >
          <Text
            ref={nationTextRef}
            text={customNationName}
            wrap='none'
            fontSize={lang == "en" ? 10 : 17}
            fontFamily={lang == "en" ? "OptimaLT" : "PSLxImperial"}
            lineJoin="round"
            stroke={solidColor}
            strokeWidth={1.5}
            scaleX={nationScaleX}
            offsetX={(nationTextWidth / 2)}
            x={(isOrder ? 50 : 100) / 2}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />

          <Text
            text={customNationName}
            wrap='none'
            fontSize={lang == "en" ? 10 : 17}
            fontFamily={lang == "en" ? "OptimaLT" : "PSLxImperial"}
            fill="white"
            scaleX={nationScaleX}
            offsetX={(nationTextWidth / 2)}
            x={(isOrder ? 50 : 100) / 2}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>

        {/* Race Text */}
        <Group
          visible={Boolean((customNationEnabled || raceCheck || overlayClan !== `race.png`) && isUnit)}
          x={(hasClan && !customNationEnabled) ? 297 : 242}
          y={(isMobile ? 556.5 : 554.5) - (lang == "en" ? 0 : 2.5)}
        >
          <Text
            ref={raceTextRef}
            text={overlayRaceText}
            wrap='none'
            fontSize={lang == "en" ? 8 : 11}
            fontFamily={lang == "en" ? "OptimaLT" : "PSLxImperial"}
            lineJoin="round"
            stroke="black"
            strokeWidth={1.5}
            scaleX={raceScaleX}
            offsetX={(raceTextWidth / 2)}
            x={((hasClan && !customNationEnabled) ? 50 : 100) / 2}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />

          <Text
            text={overlayRaceText}
            wrap='none'
            fontSize={lang == "en" ? 8 : 11}
            fontFamily={lang == "en" ? "OptimaLT" : "PSLxImperial"}
            fill="white"
            scaleX={raceScaleX}
            offsetX={(raceTextWidth / 2)}
            x={((hasClan && !customNationEnabled) ? 50 : 100) / 2}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>

        {/* Grade */}
        <Group visible={!isMarker && !isEnergy && !isCrest}>
          <Text
            text={overlayGrade}
            x={-20} y={14}
            width={100}
            wrap='none'
            fontSize={28}
            fontFamily="Anton"
            stroke="black"
            strokeWidth={3}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
          <Text
            text={overlayGrade}
            x={-20} y={14}
            width={100}
            wrap='none'
            fontSize={28}
            fontFamily="Anton"
            fill="white"
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>

        {/* Power */}
        <Group visible={Boolean(isUnit)}>
          <Text
            text={isGUnit ? `${overlayPower}+` : overlayPower}
            x={71} y={539}
            width={100}
            skewX={-13 * (Math.PI / 180)}
            wrap='none'
            fontSize={24}
            fontFamily="Anton"
            stroke="black"
            strokeWidth={3}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
          <Text
            text={isGUnit ? `${overlayPower}+` : overlayPower}
            x={71} y={539}
            width={100}
            skewX={-13 * (Math.PI / 180)}
            wrap='none'
            fontSize={24}
            fontFamily="Anton"
            fill="#cfc44c"
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>

        {/* Shield Value */}
        <Group visible={Boolean(shieldCheck && !isGUnit && isUnit)}>
          <Text
            text={overlayShieldValue}
            x={34} y={184}
            width={100}
            rotation={90}
            wrap='none'
            fontSize={18}
            fontFamily="Anton"
            stroke="black"
            strokeWidth={3}
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
          <Text
            text={overlayShieldValue}
            x={34} y={184}
            width={100}
            rotation={90}
            wrap='none'
            fontSize={18}
            fontFamily="Anton"
            fill="#e5d1a2"
            align="center"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>

        {/* Illustrator */}
        <Text
          text={isCrest ? `FANMADE CARD //NOT OFFICIAL  ${overlayIllust ? `illust/ ${overlayIllust}` : ""}` : overlayIllust ? `illust/ ${overlayIllust}` : null}
          x={isCrest ? 24 : 258}
          y={isCrest ? 383 : 568}
          width={isCrest ? 220 : 130}
          wrap='none'
          fontSize={7}
          fontFamily="Bodrum"
          fill={isTriggerUnit ? "black" : "white"}
          align={isCrest ? "left" : "right"}
          perfectDrawEnabled={false}
          listening={false}
        />
        {/* Flavor */}
        <Group visible={Boolean(overlayFlavor && !isFullArt && !isMarker)} y={isUnit ? 0 : 21.5}>
          <Group y={getFlavorY()}>
            <KonvaImage
              image={flavorLine > 1 ? flavorBG2 : flavorBG}
              x={200}
              height={flavorLine > 1 ? 34 : 19}
              width={textWidth + 2}
              offsetX={(textWidth + 2) / 2}
              perfectDrawEnabled={false}
              listening={false}
            />

            <KonvaImage
              image={flavorLine > 1 ? flavorL2 : flavorL}
              x={200 - (textWidth / 2) - 31}
              width={30}
              height={flavorLine > 1 ? 34 : 19}
              perfectDrawEnabled={false}
              listening={false}
            />

            <KonvaImage
              image={flavorLine > 1 ? flavorR2 : flavorR}
              x={200 + (textWidth / 2) + 1}
              width={30}
              height={flavorLine > 1 ? 34 : 19}
              perfectDrawEnabled={false}
              listening={false}
            />
          </Group>

          <Group x={200}
            y={getFlavorY() + (flavorLine > 1 ? 3 : 3.5) + (isMobile ? (lang == "en" ? 2 : 1.5) : 0) - (lang == "en" ? -0.35 : 3.25)}
          >
            <Text
              ref={flavorTextRef}
              text={processedFlavor}
              fontSize={lang == "en" ? 10 : 16}
              lineHeight={flavorLine > 1 ? 1.1 - (lang == "en" ? -0.2 : 0.1) : 1}
              fontFamily={font}
              stroke={isDarkMode ? "white" : "black"}
              strokeWidth={1}
              lineJoin='round'
              offsetX={textWidth / 2}
              perfectDrawEnabled={false}
              listening={false}
              align='center'
            />

            <Text
              text={processedFlavor}
              fontSize={lang == "en" ? 10 : 16}
              lineHeight={flavorLine > 1 ? 1.1 - (lang == "en" ? -0.2 : 0.1) : 1}
              fontFamily={font}
              fill={isDarkMode ? "black" : "white"}
              offsetX={textWidth / 2}
              perfectDrawEnabled={false}
              listening={false}
              align='center'
            />
          </Group>
        </Group>

        {/* Abilities Box */}
        <Group visible={Boolean(debouncedAbilities && !isEnergy)}>
          <OverlayFrame
            visible={!isFullArt}
            exportScale={isExporting}
            url={getAssetPath(getBoxPath(boxLine, totalAbilitiesLines, isCrest), '', true)}
            filters={isDarkMode ? [Konva.Filters.Invert] : []}
            y={
              isCrest ? 0 : (isUnit ? 0 : 21.5) - (secondAbilities ? ((boxLine2 * (lang == "en" ? 14.5 : 17)) + 22) : 0)
            }
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
          />

          {/* Abilities Box Main */}
          <AbilitiesBox
            lang={lang}
            text={debouncedAbilities}
            lineHeight={lineHeight}
            fontSize={fontSize}
            font={font}
            maxLines={secondAbilities ? firstMaxLines : totalAbilitiesLines}
            MAX_WIDTH={isCrest ? 271 : 370}
            ICON_CONFIG={ICON_CONFIG}
            x={isCrest ? 24 : 15}
            y={
              isCrest ? 200 : (isUnit ? 495 : 516.5) - (secondAbilities ? ((boxLine2 * (lang == "en" ? 14.5 : 17)) + 22) : 0) - (lang == "en" ? 0 : 3)
            }
            isCrest={isCrest}
            onLinesChange={setBoxLine}
            dark={isDarkMode}
            fullArt={isFullArt}
            isMobile={isMobile}
          />
        </Group>

        {/* Abilities Box Secondary*/}
        <Group visible={Boolean(secondAbilities)}>
          <OverlayFrame
            visible={!isFullArt}
            exportScale={isExporting}
            url={getAssetPath(getBoxPath(boxLine2, totalAbilitiesLines), '', true)}
            filters={isDarkMode ? [Konva.Filters.Invert] : []}
            y={isUnit ? 0 : 21.5}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
          />

          <AbilitiesBox
            lang={lang}
            text={secondAbilities}
            lineHeight={lineHeight}
            fontSize={fontSize}
            font={font}
            maxLines={secondAbilities ? secondMaxLines : totalAbilitiesLines}
            ICON_CONFIG={ICON_CONFIG}
            x={15}
            y={isUnit ? 495 : 516.5 - (lang == "en" ? 0 : 3)}
            onLinesChange={setBoxLine2}
            dark={isDarkMode}
            fullArt={isFullArt}
            isMobile={isMobile}
          />
        </Group>

        {/* DIcon */}
        <KonvaImage visible={Boolean(DIcon)} image={DIcon} width={BASE_WIDTH} height={BASE_HEIGHT} listening={false} />

        {/* Fanmade Label */}
        <Text
          visible={!isCrest}
          text={"FANMADE CARD //NOT OFFICIAL"}
          x={22} y={568}
          width={130}
          wrap='none'
          fontSize={7}
          fontFamily="Bodrum"
          fill={isTriggerUnit ? "black" : "white"}
          align="left"
          perfectDrawEnabled={false}
          listening={false}
        />
      </Layer>
    </Stage>
  );
}

const OverlayFrame = ({ url, width, height, filters = [], y = 0, exportScale = 0, visible = true }) => {
  const [img] = useImage(url, 'anonymous');
  const imageRef = React.useRef(null);

  useEffect(() => {
    if (!img || !imageRef.current) return;

    const node = imageRef.current;
    node.clearCache();

    if (filters.length > 0 || exportScale > 0) {
      node.cache({
        x: 0,
        y: 0,
        width: width,
        height: height,
        pixelRatio: exportScale || 1
      });

      const canvas = node._cache?.canvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
        }
      }
    }
  }, [img, filters, exportScale, width, height]);

  if (!img || !url) return null;

  return (
    <KonvaImage
      ref={imageRef}
      image={img}
      width={width}
      height={height}
      filters={filters}
      y={y}
      visible={visible}
      perfectDrawEnabled={false}
      listening={false}
    />
  );
};

const EditableImage = ({
  url,
  config,
  draggable = true,
  onDragEnd
}) => {
  const [img] = useImage(url);

  if (!img) return null;

  return (
    <KonvaImage
      image={img}
      x={config.x}
      y={config.y}
      scaleX={config.scale}
      scaleY={config.scale}
      draggable={draggable}
      perfectDrawEnabled={false}
      preventDefault={false}
      listening={true}
      onDragEnd={(e) =>
        onDragEnd?.({
          x: e.target.x(),
          y: e.target.y(),
        })
      }
    />
  );
};

const GradientOverlayFrame = ({
  url,
  width,
  height,
  colors = [],
  y = 0,
  visible = true,
  mirror = true,
  orientation = "vertical",
  exportScale = 0,
}) => {
  const [img] = useImage(url, "anonymous");
  const [maskedCanvas, setMaskedCanvas] = React.useState(null);

  useEffect(() => {
    if (!img || !visible) {
      setMaskedCanvas(null);
      return;
    }

    const safeWidth = Number(width) || 400;
    const safeHeight = Number(height) || 584;
    const scale = exportScale || 1;

    let minX = safeWidth, maxX = 0, minY = safeHeight, maxY = 0;
    let foundShape = false;

    try {
      const scanCanvas = document.createElement("canvas");
      scanCanvas.width = safeWidth;
      scanCanvas.height = safeHeight;
      const sctx = scanCanvas.getContext("2d");
      sctx.drawImage(img, 0, 0, safeWidth, safeHeight);

      const imgData = sctx.getImageData(0, 0, safeWidth, safeHeight);
      const pixels = imgData.data;

      for (let row = 0; row < safeHeight; row++) {
        for (let col = 0; col < safeWidth; col++) {
          const idx = (row * safeWidth + col) * 4;
          if (pixels[idx + 3] > 10) {
            if (col < minX) minX = col;
            if (col > maxX) maxX = col;
            if (row < minY) minY = row;
            if (row > maxY) maxY = row;
            foundShape = true;
          }
        }
      }
    } catch (e) {
      console.warn("Mask boundary scan skipped, falling back to full container size.");
    }

    if (!foundShape) {
      minX = 0; maxX = safeWidth; minY = 0; maxY = safeHeight;
    }

    const canvas = document.createElement("canvas");
    canvas.width = safeWidth * scale;
    canvas.height = safeHeight * scale;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);

    if (colors.length > 1) {
      let x0, y0, x1, y1;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      if (orientation === "horizon") {
        x0 = cx;
        y0 = minY;
        x1 = cx;
        y1 = maxY;
      } else {
        x0 = minX;
        y0 = cy;
        x1 = maxX;
        y1 = cy;
      }

      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      const baseColors = orientation === "horizon" ? [...colors].reverse() : [...colors];

      if (mirror) {
        const mirroredColors = [...baseColors.slice().reverse(), ...baseColors.slice(1)];
        mirroredColors.forEach((color, index) => {
          gradient.addColorStop(index / (mirroredColors.length - 1), color || "transparent");
        });
      } else {
        baseColors.forEach((color, index) => {
          gradient.addColorStop(index / (baseColors.length - 1), color || "transparent");
        });
      }
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = colors[0] || "transparent";
    }

    ctx.fillRect(0, 0, safeWidth, safeHeight);

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, safeWidth, safeHeight);
    ctx.globalCompositeOperation = "source-over";

    ctx.restore();

    setMaskedCanvas(canvas);
  }, [img, width, height, visible, mirror, orientation, exportScale, JSON.stringify(colors)]);

  if (!visible || !maskedCanvas) return null;

  return (
    <KonvaImage
      image={maskedCanvas}
      x={0}
      y={y}
      width={width}
      height={height}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
};