"use client";

import { Group, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Konva from "konva";
import { HYBRID_ICON_CONFIG } from "../../../utils/store/IconConfig";

export default function IconGenerator({
  config,
  value,
  dark,
  lineHeight,
  onWidthReady,
  fullArt = true
}) {
  const [hasError, setHasError] = useState(false);
  const ext = config.valueExt || ".png";
  const tintColor = config.tintColor;
  const hasTintColor = !!tintColor;

  const ensureExt = (path) => {
    if (!path) return null;
    if (path.match(/\.(png|jpg|jpeg|webp)$/i)) return path;
    return `${path}${ext}`;
  };

  const resolvePath = (path, useStroke = false) => {
    if (!path) return null;
    let final = path.match(/\.(png|jpg|jpeg|webp)$/i) ? path : `${path}${ext}`;
    
    if (useStroke) {
      final = final.replace(/(\.[a-z]+)$/i, "_s$1");
    }
    
    if (dark && HYBRID_ICON_CONFIG?.darkModePaths?.[final]) {
      return HYBRID_ICON_CONFIG.darkModePaths[final];
    }
    return final;
  };

  const baseSrc = !config.useNumberedFiles ? resolvePath(config.baseSrc, false) : null;
  const [baseImg] = useImage(baseSrc);
  
  let baseStrokeSrc = null;
  if (fullArt) {
    if (!config.useNumberedFiles) {
      baseStrokeSrc = resolvePath(config.baseSrc, true);
    } else {
      const strokePathRaw = `${config.baseSrc}_s`;
      baseStrokeSrc = resolvePath(strokePathRaw, false);
    }
  }
  const [baseStrokeImg] = useImage(baseStrokeSrc);

  const numberedPath = config.useNumberedFiles && value != null
    ? resolvePath(`${config.baseSrc}${value}`, false)
    : null;
  const [numberedImg] = useImage(numberedPath);

  const boldPath = (!config.useNumberedFiles && config.valueBasePath && value != null)
    ? resolvePath(`${config.valueBasePath}${value}`, false)
    : null;
  const [boldImg] = useImage(boldPath);
  
  const boldStrokePath = (!config.useNumberedFiles && config.valueBasePath && value != null && fullArt)
    ? (() => {
        const path = `${config.valueBasePath}${value}`;
        return `${path}${ext}`;
      })()
    : null;
  const [boldStrokeImg] = useImage(boldStrokePath ? resolvePath(boldStrokePath, false) : null);

  const bgPath = (config.valueBgSrc && !config.useNumberedFiles) ? ensureExt(config.valueBgSrc) : null;
  const [bgImg] = useImage(bgPath ? (dark && HYBRID_ICON_CONFIG?.darkModePaths?.[bgPath] ? HYBRID_ICON_CONFIG.darkModePaths[bgPath] : bgPath) : null);

  const bgStrokePath = bgPath && fullArt ? (() => {
    if (bgPath.match(/\.(png|jpg|jpeg|webp)$/i)) {
      return bgPath.replace(/(\.[a-z]+)$/i, "_s$1");
    }
    return `${bgPath}_s${ext}`;
  })() : null;
  const [bgStrokeImg] = useImage(bgStrokePath ? resolvePath(bgStrokePath, false) : null);

  const mainImg = config.useNumberedFiles ? numberedImg : boldImg;
  const hasBg = !!bgPath;

  const showBaseStroke = fullArt && baseStrokeImg && config.useNumberedFiles;
  const showValueStroke = (!config.useNumberedFiles && boldStrokeImg);

  const baseRef = useRef();
  const mainRef = useRef();
  const bgRef = useRef();
  const baseStrokeRef = useRef();
  const valueStrokeRef = useRef();
  const bgStrokeRef = useRef();

  const targetHeight = config.iconHeight || 11;
  const yOffset = config.iconYOffset || 0;

  const allImagesLoaded = config.useNumberedFiles
    ? (!!mainImg)
    : hasBg
      ? (!!baseImg && !!mainImg && !!bgImg)
      : (!!baseImg && !!mainImg);

  useEffect(() => {
    if (!allImagesLoaded) return;

    try {
      const baseScale = baseImg ? targetHeight / baseImg.height : 1;
      const mainScale = mainImg ? targetHeight / mainImg.height : 1;
      const bgScale = bgImg ? targetHeight / bgImg.height : 1;

      let totalWidth = 0;
      if (baseImg) totalWidth += baseImg.width * baseScale;
      if (bgImg) totalWidth += bgImg.width * bgScale;
      else if (mainImg) totalWidth += mainImg.width * mainScale;

      onWidthReady(totalWidth);

      if (bgRef.current && bgRef.current.cache && hasTintColor) bgRef.current.cache();
    } catch (e) {
      setHasError(true);
    }
  }, [allImagesLoaded, targetHeight, onWidthReady, baseImg, bgImg, mainImg, hasTintColor]);

  useLayoutEffect(() => {
    const nodes = [baseStrokeRef.current, valueStrokeRef.current, bgStrokeRef.current];
    let layerToRedraw = null;

    nodes.forEach(node => {
      if (!node) return;
      try {
        node.clearCache();
        node.filters([Konva.Filters.RGBA]);
        const c = dark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
        node.red(c.r);
        node.green(c.g);
        node.blue(c.b);
        node.alpha(1);
        node.cache();

        if (!layerToRedraw) {
          layerToRedraw = node.getLayer();
        }
      } catch (e) {
        setHasError(true);
      }
    });

    if (layerToRedraw) {
      layerToRedraw.batchDraw();
    }
  }, [baseStrokeImg, boldStrokeImg, bgStrokeImg, dark, fullArt]);

  if (!allImagesLoaded || hasError) return null;

  try {
    const baseScale = baseImg ? targetHeight / baseImg.height : 1;
    const mainScale = mainImg ? targetHeight / mainImg.height : 1;
    const bgScale = bgImg ? targetHeight / bgImg.height : 1;
    const offsetYPos = (lineHeight - targetHeight) / 2 - 1 + yOffset;
    const startX = (baseImg ? baseImg.width * baseScale : 0);

  const renderContent = () => {
    if (hasBg && bgImg && mainImg) {
      return (
        <>
          {baseImg && (
            <>
              {fullArt && baseStrokeImg && (
                <KonvaImage
                  ref={baseStrokeRef}
                  image={baseStrokeImg}
                  x={(baseImg.width * baseScale) / 2}
                  y={(baseImg.height * baseScale) / 2}
                  offsetX={baseStrokeImg.width / 2}
                  offsetY={baseStrokeImg.height / 2}
                  scaleX={baseScale}
                  scaleY={baseScale}
                  listening={false}
                />
              )}
              <KonvaImage
                ref={baseRef}
                image={baseImg}
                x={(baseImg.width * baseScale) / 2}
                y={(baseImg.height * baseScale) / 2}
                offsetX={baseImg.width / 2}
                offsetY={baseImg.height / 2}
                scaleX={baseScale}
                scaleY={baseScale}
                listening={false}
              />
            </>
          )}
          
          {fullArt && bgStrokeImg && (
            <KonvaImage
              ref={bgStrokeRef}
              image={bgStrokeImg}
              x={startX + (bgImg.width * bgScale) / 2}
              y={(bgImg.height * bgScale) / 2}
              offsetX={bgStrokeImg.width / 2}
              offsetY={bgStrokeImg.height / 2}
              scaleX={bgScale}
              scaleY={bgScale}
              listening={false}
            />
          )}
          <KonvaImage
            ref={bgRef}
            image={bgImg}
            x={startX + (bgImg.width * bgScale) / 2}
            y={(bgImg.height * bgScale) / 2}
            offsetX={bgImg.width / 2}
            offsetY={bgImg.height / 2}
            scaleX={bgScale}
            scaleY={bgScale}
            filters={[Konva.Filters.RGB]}
            red={tintColor?.red || 1}
            green={tintColor?.green || 1}
            blue={tintColor?.blue || 1}
            listening={false}
          />
          
          {fullArt && showBaseStroke && (
            <KonvaImage
              ref={baseStrokeRef}
              image={baseStrokeImg}
              x={startX + (mainImg.width * mainScale) / 2}
              y={(mainImg.height * mainScale) / 2}
              offsetX={baseStrokeImg.width / 2}
              offsetY={baseStrokeImg.height / 2}
              scaleX={mainScale}
              scaleY={mainScale}
              listening={false}
            />
          )}
          {fullArt && showValueStroke && (
            <KonvaImage
              ref={valueStrokeRef}
              image={boldStrokeImg}
              x={startX + (mainImg.width * mainScale) / 2}
              y={(mainImg.height * mainScale) / 2}
              offsetX={boldStrokeImg.width / 2}
              offsetY={boldStrokeImg.height / 2}
              scaleX={mainScale}
              scaleY={mainScale}
              listening={false}
            />
          )}
          <KonvaImage
            ref={mainRef}
            image={mainImg}
            x={startX + (mainImg.width * mainScale) / 2}
            y={(mainImg.height * mainScale) / 2}
            offsetX={mainImg.width / 2}
            offsetY={mainImg.height / 2}
            scaleX={mainScale}
            scaleY={mainScale}
            listening={false}
          />
        </>
      );
    }

    if (mainImg) {
      return (
        <>
          {baseImg && (
            <>
              {fullArt && baseStrokeImg && (
                <KonvaImage
                  ref={baseStrokeRef}
                  image={baseStrokeImg}
                  x={(baseImg.width * baseScale) / 2}
                  y={(baseImg.height * baseScale) / 2}
                  offsetX={baseStrokeImg.width / 2}
                  offsetY={baseStrokeImg.height / 2}
                  scaleX={baseScale}
                  scaleY={baseScale}
                  listening={false}
                />
              )}
              <KonvaImage
                ref={baseRef}
                image={baseImg}
                x={(baseImg.width * baseScale) / 2}
                y={(baseImg.height * baseScale) / 2}
                offsetX={baseImg.width / 2}
                offsetY={baseImg.height / 2}
                scaleX={baseScale}
                scaleY={baseScale}
                listening={false}
              />
            </>
          )}
          
          {/* Main + Stroke */}
          {fullArt && showBaseStroke && (
            <KonvaImage
              ref={baseStrokeRef}
              image={baseStrokeImg}
              x={(mainImg.width * mainScale) / 2}
              y={(mainImg.height * mainScale) / 2}
              offsetX={baseStrokeImg.width / 2}
              offsetY={baseStrokeImg.height / 2}
              scaleX={mainScale}
              scaleY={mainScale}
              listening={false}
            />
          )}
          {fullArt && showValueStroke && (
            <KonvaImage
              ref={valueStrokeRef}
              image={boldStrokeImg}
              x={(mainImg.width * mainScale) / 2}
              y={(mainImg.height * mainScale) / 2}
              offsetX={boldStrokeImg.width / 2}
              offsetY={boldStrokeImg.height / 2}
              scaleX={mainScale}
              scaleY={mainScale}
              listening={false}
            />
          )}
          <KonvaImage
            ref={mainRef}
            image={mainImg}
            x={(mainImg.width * mainScale) / 2}
            y={(mainImg.height * mainScale) / 2}
            offsetX={mainImg.width / 2}
            offsetY={mainImg.height / 2}
            scaleX={mainScale}
            scaleY={mainScale}
            listening={false}
          />
        </>
      );
    }

    return (
      <>
        {fullArt && baseStrokeImg && (
          <KonvaImage
            ref={baseStrokeRef}
            image={baseStrokeImg}
            x={(baseImg.width * baseScale) / 2}
            y={(baseImg.height * baseScale) / 2}
            offsetX={baseStrokeImg.width / 2}
            offsetY={baseStrokeImg.height / 2}
            scaleX={baseScale}
            scaleY={baseScale}
            listening={false}
          />
        )}
        <KonvaImage
          ref={baseRef}
          image={baseImg}
          x={(baseImg.width * baseScale) / 2}
          y={(baseImg.height * baseScale) / 2}
          offsetX={baseImg.width / 2}
          offsetY={baseImg.height / 2}
          scaleX={baseScale}
          scaleY={baseScale}
          listening={false}
        />
      </>
    );
  };

    return (
      <Group y={offsetYPos}>
        {renderContent()}
      </Group>
    );
  } catch (e) {
    setHasError(true);
    return null;
  }
}