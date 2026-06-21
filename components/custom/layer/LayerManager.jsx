"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DragHandleIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  PlusIcon,
  TrashIcon
} from "../../Icon";

import { useLang } from "../../../utils/LanguageProvider";
import { TextPreset } from '../../../utils/store/Text';
import Tooltip from "../../Tooltip";

export default function LayerManager({ layers, setLayers, fileInputRef, isCrest }) {
  const { lang } = useLang();
  const t = TextPreset.LayerManager;
  const [draggedLayerId, setDraggedLayerId] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const isReorderDisabled = layers.length <= 1;

  const moveLayer = (draggedId, targetIndex) => {
    setLayers((prev) => {
      const sourceIndex = prev.findIndex((l) => l.id === draggedId);
      if (sourceIndex === -1) return prev;

      const updated = [...prev];
      const [item] = updated.splice(sourceIndex, 1);

      let insertIndex = targetIndex;
      if (sourceIndex < targetIndex) {
        insertIndex--;
      }

      updated.splice(insertIndex, 0, item);
      return updated;
    });
  };

  const finishDrag = useCallback(() => {
    if (draggedLayerId !== null && dropIndex !== null) {
      moveLayer(draggedLayerId, dropIndex);
    }
    setDraggedLayerId(null);
    setDropIndex(null);
  }, [draggedLayerId, dropIndex]);

  useEffect(() => {
    if (!draggedLayerId) return;

    const handlePointerUp = () => {
      finishDrag();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDraggedLayerId(null);
        setDropIndex(null);
      }
    };

    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draggedLayerId, finishDrag]);

  const handleProcessFiles = (files) => {
    if (!files.length) return;

    let newLayers = [];
    let loadedCount = 0;

    files.forEach((file) => {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        loadedCount++;
        return;
      }

      const reader = new FileReader();

      reader.onload = (evt) => {
        newLayers.push({
          id: `layer-${Date.now()}-${Math.random()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          src: evt.target?.result,
          visible: true
        });

        loadedCount++;

        if (loadedCount === files.length) {
          setLayers((prev) => [...newLayers, ...prev]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
        Layer Manager
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDraggingFile(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFile(false);
          const files = Array.from(e.dataTransfer.files || []);
          handleProcessFiles(files);
        }}
        className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-md transition-all group cursor-pointer mb-4 ${isDraggingFile
          ? "border-(--accent) bg-(--panel-bg)"
          : "border-(--border-color) hover:border-(--accent) hover:bg-(--panel-bg)"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleProcessFiles(files);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />

        <PlusIcon
          size={24}
          className={`transition-colors mb-2 ${isDraggingFile ? "text-(--accent)" : "text-(--text-secondary) group-hover:text-(--accent)"
            }`}
        />
        <span
          className={`${lang == "en" ? "text-[11px]" : "text-[13.5px]"} font-bold uppercase transition-colors ${isDraggingFile ? "text-(--accent)" : "text-(--text-secondary) group-hover:text-(--accent)"}`}>
          {isDraggingFile ? TextPreset.IconManager.Drop[lang] : TextPreset.IconManager.ClickDrop[lang]}{isCrest ? " (73:50)" : " (50:73)"}
        </span>
      </label>

      <div
        className="space-y-2 custom-scrollbar"
        onPointerUp={isReorderDisabled ? undefined : finishDrag}
      >
        {[...layers].reverse().map((layer, visualIndex) => {
          const index = layers.length - 1 - visualIndex;
          const isDragging = draggedLayerId === layer.id;

          return (
            <div key={layer.id}>
              {dropIndex === index + 1 && draggedLayerId && (
                <div className="h-0.5 bg-blue-500 rounded-full mb-2" />
              )}

              <div
                onPointerMove={(e) => {
                  if (!draggedLayerId || isReorderDisabled) return;

                  const rect = e.currentTarget.getBoundingClientRect();
                  const before = e.clientY < rect.top + rect.height / 2;

                  setDropIndex(before ? index + 1 : index);
                }}
                className={`flex items-center justify-between px-3 py-2 min-h-12 border rounded-md transition-all ${isDragging
                  ? "border-(--accent) bg-(--accent)/5"
                  : "border-(--panel-border) bg-(--toolbar-bg) hover:bg-(--panel-bg)"
                  }`}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div
                    onPointerDown={(e) => {
                      e.preventDefault();
                      if (isReorderDisabled) return;

                      setDraggedLayerId(layer.id);
                      setDropIndex(index + 1);
                    }}
                    className={`shrink-0 p-1 select-none transition-colors ${isReorderDisabled 
                      ? "cursor-not-allowed text-(--text-secondary)/50 dark:text-slate-700" 
                      : "cursor-grab active:cursor-grabbing text-(--text-secondary)"
                    }`}
                  >
                    <DragHandleIcon size={16} />
                  </div>

                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setLayers((prev) =>
                        prev.map((l) =>
                          l.id === layer.id ? { ...l, name: newName } : l
                        )
                      );
                    }}
                    placeholder="Layer Name"
                    className="bg-transparent! border-0! outline-none! text-sm! w-full"
                  />
                </div>

                <div className="flex items-center ml-2 shrink-0">
                  <Tooltip text={layer.visible ? t.hide[lang] : t.show[lang]}>
                    <button
                      onClick={() => {
                        setLayers((prev) =>
                          prev.map((l) =>
                            l.id === layer.id ? { ...l, visible: !l.visible } : l
                          )
                        );
                      }}
                      className={`p-1.5 transition-colors ${layer.visible
                        ? "text-(--accent)"
                        : "text-(--text-secondary) hover:text-(--accent)"
                        }`}
                    >
                      {layer.visible ? (
                        <EyeOpenIcon size={16} />
                      ) : (
                        <EyeClosedIcon size={16} />
                      )}
                    </button>
                  </Tooltip>

                  <Tooltip text={TextPreset.IconManager.Delete[lang]}>
                    <button
                      onClick={() => {
                        setLayers((prev) => prev.filter((l) => l.id !== layer.id));
                      }}
                      className="p-1.5 text-(--text-secondary) hover:text-red-500 transition-colors"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}

        {dropIndex === 0 && draggedLayerId && (
          <div className="h-0.5 bg-blue-500 rounded-full" />
        )}
      </div>
    </div>
  );
}