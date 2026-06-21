"use client";

import React from "react";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";

import { useLang } from "../utils/LanguageProvider";
import { TextPreset } from "../utils/store/Text";
import { nationOption, typeOption } from "../utils/store/CardConstants";

import { ImageIcon, WarningIcon } from "./Icon";

const version = process.env.TEMPLATE_VERSION;

function parseVersion(v) {
  const match = v?.match(/^(\d+)\.(\d+)\.(\d+)([a-zA-Z]*)$/);

  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    suffix: match[4]?.toLowerCase() || null,
  };
}

function compareVersion(imported, current, t, lang) {
  const v1 = parseVersion(imported);
  const v2 = parseVersion(current);

  if (!v1 || !v2) {
    return {
      level: "danger",
      message: t.verInvalid[lang],
    };
  }

  const isRelease = (v) => v.major === 1;
  const isPreRelease = (v) => v.major === 26;

  if (isPreRelease(v1) && isRelease(v2)) {
    return {
      level: "warning",
      message: `${t.verPreToRelease[lang]} (${imported})`,
    };
  }

  if (isRelease(v1) && isPreRelease(v2)) {
    return {
      level: "warning",
      message: `${t.verReleaseToPre[lang]} (${imported} -> ${current})`,
    };
  }

  if (v1.major !== v2.major) {
    const isImportedNewer = v1.major > v2.major;

    return {
      level: "danger",
      message: isImportedNewer
        ? t.verBreaking[lang]
        : t.verIncompatible[lang],
    };
  }

  if (v1.minor !== v2.minor) {
    const diff = v1.minor - v2.minor;

    if (diff > 0) {
      return {
        level: "warning",
        message: `${t.verNewer[lang]} (${imported} / ${current})`,
      };
    }

    return {
      level: "warning",
      message: t.verDiffers[lang],
    };
  }

  const v1PatchValue = v1.patch < 10 ? v1.patch * 10 : v1.patch;
  const v2PatchValue = v2.patch < 10 ? v2.patch * 10 : v2.patch;

  const patchDiff = Math.abs(v1PatchValue - v2PatchValue);

  if (patchDiff > 50) {
    return {
      level: "warning",
      message: t.verGapLarge[lang],
    };
  }

  return {
    level: "safe",
    message: null,
  };
}

const ImagePreview = ({
  imageUrl,
  imageConfig,
  width,
  height,
  isCrest,
}) => {
  const [img] = useImage(imageUrl);

  if (!img) return null;

  const LOGICAL_WIDTH = isCrest ? 584 : 400;
  const LOGICAL_HEIGHT = isCrest ? 400 : 584;

  const scaleRatio = isCrest
    ? width / LOGICAL_HEIGHT
    : width / LOGICAL_WIDTH;

  const scale =
    (imageConfig?.scale ?? 1) * scaleRatio;

  const x =
    (imageConfig?.x ?? 0) * scaleRatio;

  const y =
    (imageConfig?.y ?? 0) * scaleRatio;

  if (!isCrest) {
    return (
      <KonvaImage
        image={img}
        x={x}
        y={y}
        scaleX={scale}
        scaleY={scale}
        listening={false}
      />
    );
  }

  return (
    <KonvaImage
      image={img}
      rotation={90}
      x={width - y}
      y={x}
      scaleX={scale}
      scaleY={scale}
      listening={false}
    />
  );
};

export default function ImportModal({
  preview,
  onConfirm,
  onCancel,
  loading,
}) {
  const PREVIEW_WIDTH = 100;
  const PREVIEW_HEIGHT = 146;

  const { lang } = useLang();

  const t = TextPreset.ImportModal;
  const cardOptionStrings = TextPreset.CardOptions;

  if (!preview) return null;

  const card = preview.rawData || {};

  const imageConfig = card.imageConfig || {
    scale: 1,
    x: 0,
    y: 0,
  };

  const result = compareVersion(
    preview.version,
    version,
    t,
    lang
  );

  const warningColor =
    result.level === "danger"
      ? "text-red-500"
      : result.level === "warning"
        ? "text-yellow-500"
        : result.level === "safe"
          ? "text-green-500"
          : "text-gray-400";

  const isNormalUnit =
    card.selectedType === "base_normal.png";

  const isTriggerUnit =
    card.selectedType === "base_trigger.png";

  const isToken =
    card.selectedType === "base_normal.png/token";

  const isGUnit =
    card.selectedType === "base_g.png/encounter" ||
    card.selectedType === "base_g.png";

  const isEncounter =
    card.selectedType === "base_encounter.png";

  const isTicket =
    card.selectedType === "base_ticket.png" ||
    card.selectedType === "ticker_marker.png/marker";

  const isCrest =
    card.selectedType === "base_crest.png" ||
    card.selectedType === "base_crest.png/ride_deck" ||
    card.selectedType === "base_crest.png/encounter";

  const isRideDeck =
    card.selectedType === "base_crest.png/ride_deck";

  const isUnit =
    isNormalUnit ||
    isTriggerUnit ||
    isToken ||
    isEncounter ||
    isGUnit;

  const isOrder = !(isUnit || isTicket);

  const previewWidth = isCrest
    ? PREVIEW_WIDTH
    : PREVIEW_WIDTH;

  const previewHeight = isCrest
    ? PREVIEW_HEIGHT
    : PREVIEW_HEIGHT;
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-110 mx-4 rounded-md bg-(--panel-bg) border border-(--panel-border) shadow-(--shadow-md)">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-(--panel-border) bg-(--toolbar-bg) rounded-t-md">
          <span className="text-md font-semibold text-(--text-primary)">
            {t.title[lang]}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex gap-3">

          {/* Preview */}
          <div className="shrink-0">
            <div
              className="relative rounded-md overflow-hidden border border-(--border-color) bg-(--bg-secondary) shadow-(--shadow-sm) flex items-center justify-center text-center"
              style={{
                width: previewWidth,
                height: previewHeight,
              }}
            >
              {preview.imageUrl ? (
                <Stage
                  width={previewWidth}
                  height={previewHeight}
                >
                  <Layer>
                    <Rect
                      width={previewWidth}
                      height={previewHeight}
                      fill="#e5e5e5"
                    />

                    <ImagePreview
                      imageUrl={preview.imageUrl}
                      imageConfig={imageConfig}
                      width={previewWidth}
                      height={previewHeight}
                      isCrest={isCrest}
                    />
                  </Layer>
                </Stage>
              ) : (
                <div className="p-2 select-none text-(--text-secondary) flex flex-col items-center gap-1">
                  <ImageIcon
                    size={20}
                    className="stroke-current"
                  />

                  <span className="text-[10px] font-medium uppercase tracking-wider block">
                    {t.NoImage[lang]}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-px bg-(--border-color) opacity-50" />

          {/* Info */}
          <div className="flex-1 space-y-3 text-xs">

            <div>
              <p className="text-[10px] uppercase tracking-wide text-(--text-secondary)">
                Card Name
              </p>

              <p className="text-base font-semibold text-(--text-primary) leading-tight">
                {isTicket
                  ? `${TextPreset.Extra.Energy[lang]} by ${card.illust}`
                  : isRideDeck
                    ? `${TextPreset.Extra.Generator[lang]} by ${card.illust}`
                    : preview.cardName}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-2 text-sm">

                <span className="uppercase px-2 py-0.5 rounded border border-(--border-color) bg-(--bg-secondary)">
                  {card.lang || "en"}
                </span>

                {card.isFullArt && (
                  <span className="px-2 py-0.5 rounded border border-(--border-color) bg-(--bg-secondary)">
                    SP
                  </span>
                )}

                {card.grade !== undefined &&
                  !isTicket &&
                  !isCrest && (
                    <span className="px-2 py-0.5 rounded border border-(--border-color) bg-(--bg-secondary)">
                      G{card.grade}
                    </span>
                  )}

                <span className="px-2 py-0.5 rounded border border-(--border-color) bg-(--bg-secondary)">
                  {(() => {
                    const typeObj = typeOption.find(
                      (t) => t.file === card.selectedType
                    );

                    if (
                      typeObj &&
                      cardOptionStrings &&
                      cardOptionStrings[typeObj.id]
                    ) {
                      return cardOptionStrings[typeObj.id][lang];
                    }

                    return card.selectedType;
                  })()}
                </span>

                {(card.selectedNation !== "none.png" || card.customNationEnabled) &&
                  !isTicket && (
                    <span className="px-2 py-0.5 rounded border border-(--border-color) bg-(--bg-secondary)">
                      {(() => {
                        if (card.customNationEnabled && !isCrest) {
                          return card.customNationName;
                        }

                        const nationObj = nationOption.find(
                          (n) => n.file === card.selectedNation
                        );

                        if (
                          nationObj &&
                          cardOptionStrings &&
                          cardOptionStrings[nationObj.id]
                        ) {
                          return cardOptionStrings[nationObj.id][lang];
                        }

                        return card.selectedNation
                          ? card.selectedNation.replace(".png", "")
                          : "";
                      })()}
                    </span>
                  )}

                {!isTicket &&
                  (card.raceCheck &&
                    isUnit &&
                    card.raceText !== "Race" &&
                    card.raceText !== "เผ่า" ? (
                    <span className="px-2 py-0.5 rounded border border-(--border-color) bg-(--bg-secondary)">
                      {card.raceText}
                    </span>
                  ) : card.isSubType &&
                    isOrder &&
                    card.subOrderType !== "Subtype" &&
                    card.subOrderType !== "ประเภท" ? (
                    <span className="px-2 py-0.5 rounded border border-(--border-color) bg-(--bg-secondary)">
                      {card.subOrderType}
                    </span>
                  ) : null)}
              </div>
            </div>

            {/* Version */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-(--text-secondary)">
                Template
              </p>

              <div className="flex items-center text-sm gap-2 text-(--text-primary)">

                {preview.version}

                <span className="text-(--text-secondary) text-xs">
                  ({t.currentText[lang]} {version})
                </span>

                {result.level !== "safe" && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${result.level === "warning"
                      ? "border-yellow-500/40 text-yellow-600"
                      : "border-red-500/40 text-red-500"
                      }`}
                  >
                    {result.level === "warning"
                      ? t.verMismatch[lang]
                      : t.verRisk[lang]}
                  </span>
                )}
              </div>
            </div>

            {/* Exported */}
            {preview.exportedAt && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-(--text-secondary)">
                  Exported
                </p>

                <div className="text-sm text-(--text-primary)">
                  {new Date(
                    preview.exportedAt
                  ).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        {result.level !== "safe" && (
          <div
            className={`mx-4 mb-3 px-3 py-2 text-xs border rounded flex items-center gap-2 ${result.level === "warning"
              ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-600"
              : "border-red-500/40 bg-red-500/10 text-red-500"
              }`}
          >
            <WarningIcon
              className={`w-4 h-4 shrink-0 ${warningColor}`}
            />

            <span>{result.message}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-(--panel-border) bg-(--toolbar-bg) rounded-b-md">

          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm font-medium border border-(--border-color) bg-(--bg-primary) text-(--text-primary) hover:bg-(--button-hover) rounded disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            {t.btnCancel[lang]}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium bg-(--accent) text-white rounded hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? t.btnImporting[lang]
              : t.btnImport[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}