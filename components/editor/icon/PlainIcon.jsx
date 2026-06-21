"use client";

import { Group, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { useEffect, useLayoutEffect, useRef, useMemo, useState } from "react";
import Konva from "konva";
import { HYBRID_ICON_CONFIG } from "../../../utils/store/IconConfig";

export default function PlainIcon({
  src,
  config,
  dark,
  lineHeight,
  onWidthReady,
  fullArt
}) {
  const imgRef = useRef();
  const strokeRef = useRef();
  const [hasError, setHasError] = useState(false);

  const finalSrc = useMemo(() => {
    return dark && HYBRID_ICON_CONFIG?.darkModePaths?.[src] 
      ? HYBRID_ICON_CONFIG.darkModePaths[src] 
      : src;
  }, [src, dark]);

  const strokeSrc = useMemo(() => {
    if (!finalSrc) return null;
    return finalSrc.replace(/(\.[a-z]+)$/i, "_s$1");
  }, [finalSrc]);

  const [img] = useImage(finalSrc);
  const [strokeImg] = useImage(strokeSrc);

  const targetHeight = config.iconHeight || 11;
  const yOffset = config.iconYOffset || 0;

  useEffect(() => {
    if (img) {
      const scale = targetHeight / img.height;
      const width = img.width * scale;
      onWidthReady(width);
    }
  }, [img, targetHeight, onWidthReady]);

  useLayoutEffect(() => {
    const node = strokeRef.current;
    if (!node || !strokeImg || !fullArt) return;

    try {
      node.clearCache();
      node.filters([Konva.Filters.RGBA]);
      const c = dark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
      node.red(c.r);
      node.green(c.g);
      node.blue(c.b);
      node.alpha(1);
      node.cache();

      const layer = node.getLayer();
      if (layer) layer.batchDraw();
    } catch (e) {
      // silently handle filter errors
    }
  }, [strokeImg, dark, fullArt]);

  if (!img) return null;

  const scale = targetHeight / img.height;
  const offsetY = (lineHeight - targetHeight) / 2 - 1 + yOffset;

  const centerX = (img.width * scale) / 2;
  const centerY = (img.height * scale) / 2;

  return (
    <Group y={offsetY}>
      {strokeImg && fullArt && (
        <KonvaImage
          ref={strokeRef}
          image={strokeImg}
          x={centerX}
          y={centerY}
          offsetX={strokeImg.width / 2}
          offsetY={strokeImg.height / 2}
          scaleX={scale}
          scaleY={scale}
          listening={false}
        />
      )}

      <KonvaImage
        ref={imgRef}
        image={img}
        x={centerX}
        y={centerY}
        offsetX={img.width / 2}
        offsetY={img.height / 2}
        scaleX={scale}
        scaleY={scale}
        listening={false}
      />
    </Group>
  );
}