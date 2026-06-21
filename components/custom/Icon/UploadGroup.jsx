"use client";

import React, { useEffect, useState } from "react";

import { useLang } from "../../../utils/LanguageProvider";
import { TextPreset } from "../../../utils/store/Text";

import { getAllIcons, saveIcon, deleteIconFromDB } from "./DB";
import { addCustomIcon, removeCustomIcon, setTagAllowed, hydrateCustomIcons } from "../../../utils/store/IconConfig";
import { importIconsFromZip } from "../../../utils/IconIO";

import UploadItem from "./UploadItem";

import { PlusIcon } from "../../Icon";

export default function UploadGroup(m) {
    const { lang } = useLang();
    const [items, setItems] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const t = TextPreset.IconManager;

    useEffect(() => {
        const loadIcons = async () => {
            const data = await getAllIcons();

            setItems(data);

            hydrateCustomIcons(data);

            data.forEach((item) => {
                if (!item.key) return;

                addCustomIcon(item.key, {
                    src: item.src,
                    iconHeight: item.height || 11,
                    iconYOffset: item.offset || 0,
                    custom: true,
                });

                setTagAllowed(
                    item.key,
                    item.allowColor
                );
            });
        };

        loadIcons();

        const handleUploaded = () => {
            loadIcons();
        };

        window.addEventListener("icon-uploaded", handleUploaded);

        return () => {
            window.removeEventListener("icon-uploaded", handleUploaded);
        };
    }, []);

    const handleUpload = async (file) => {
        if (!file || !file.type.startsWith("image/")) {
            return;
        }

        const id = crypto.randomUUID();

        const rawName = file.name.slice(0, file.name.lastIndexOf(".")) || file.name;
        const fallbackKey = rawName.replace(/@\[[^\]]*\]/g, "").replace(/@/g, "").replace(/\s+/g, " ").trim();

        const previewSrc = URL.createObjectURL(file);

        const newItem = {
            id,
            key: fallbackKey,
            src: previewSrc,
            height: 11,
            offset: 0,
            allowColor: false,
        };

        setItems((prev) => [
            newItem,
            ...prev
        ]);

        addCustomIcon(newItem.key, {
            src: newItem.src,
            iconHeight: newItem.height,
            iconYOffset: newItem.offset,
            custom: true,
        });

        setTagAllowed(
            newItem.key,
            newItem.allowColor
        );

        await saveIcon(newItem, file);

        window.dispatchEvent(
            new CustomEvent("icon-config-changed")
        );
    };

    const handleZipImport = async (file) => {
        try {
            const result = await importIconsFromZip(file);

            if (!result.success) {
                return;
            }

            setItems((prev) => [
                ...result.items,
                ...prev,
            ]);
        } catch (err) {
            return;
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        if (files.length <= 0) {
            return;
        }

        files.forEach((file) => {
            if (file.name.toLowerCase().endsWith(".zip")) {
                handleZipImport(file);
            } else {
                handleUpload(file);
            }
        });
    };

    const handleUpdate = async (updated) => {
        const oldItem = items.find((it) => it.id === updated.id);

        setItems((prev) =>
            prev.map((it) =>
                it.id === updated.id
                    ? updated
                    : it
            )
        );

        if (
            oldItem?.key &&
            oldItem.key !== updated.key
        ) {
            removeCustomIcon(oldItem.key);
            setTagAllowed(oldItem.key, false);
        }

        if (updated.key) {
            addCustomIcon(updated.key, {
                src: updated.src,
                iconHeight: updated.height,
                iconYOffset: updated.offset,
                custom: true,
            });

            setTagAllowed(
                updated.key,
                updated.allowColor
            );
        }

        saveIcon(updated);
    };

    const handleDelete = async (item) => {
        setItems((prev) =>
            prev.filter((it) => it.id !== item.id)
        );

        if (item.key) {
            removeCustomIcon(item.key);
            setTagAllowed(item.key, false);
        }

        window.dispatchEvent(
            new CustomEvent("icon-config-changed")
        );

        deleteIconFromDB(item.id);
    };

    return (
        <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                {t.title?.[lang] || "Icon Manager"}
            </div>
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-md transition-all group cursor-pointer mb-4 ${isDragging
                    ? "border-(--accent) bg-(--accent)/10"
                    : "border-(--border-color) hover:border-(--accent) hover:bg-(--panel-bg)"
                    }`}
            >
                <input
                    type="file"
                    accept="image/*,.zip"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                        if (!e.target.files) {
                            return;
                        }
                        Array.from(e.target.files).forEach((file) => {
                            if (file.name.toLowerCase().endsWith(".zip")) {
                                handleZipImport(file);
                            } else {
                                handleUpload(file);
                            }
                        });
                        e.target.value = "";
                    }}
                />

                <PlusIcon
                    size={24}
                    className={`transition-colors ${isDragging
                        ? "text-(--accent)"
                        : "text-(--text-secondary) group-hover:text-(--accent)"
                        } mb-2`}
                />

                <span
                    className={`${lang == "en" ? "text-[11px]" : "text-[13.5px]"} font-bold uppercase transition-colors ${isDragging
                        ? "text-(--accent)"
                        : "text-(--text-secondary) group-hover:text-(--accent)"
                        }`}
                >
                    {isDragging
                        ? t.Drop[lang]
                        : t.ClickDrop[lang]}
                </span>
            </label>
            <div className="space-y-2 custom-scrollbar">
                {items.map((item) => (
                    <UploadItem
                        key={item.id}
                        item={item}
                        onUpdate={handleUpdate}
                        onDelete={() => handleDelete(item)}
                        Save={t.Save[lang]}
                        Cancle={t.Cancle[lang]}
                        Delete={t.Delete[lang]}
                        Copy={t.Copy[lang]}
                        Copied={t.Copied[lang]}
                        Unsave={t.Unsave[lang]}
                        Invalid={t.Invalid[lang]}
                    />
                ))}
            </div>
        </div>
    );
}