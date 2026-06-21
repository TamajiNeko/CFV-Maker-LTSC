"use client";
import React, { useState, useEffect } from "react";
import { ChevronDownIcon, TrashIcon, CopyIcon } from "../../Icon";
import Tooltip from "../../Tooltip";

export default function UploadItem({
    item,
    onUpdate,
    onDelete,
    Save,
    Cancle,
    Delete,
    Copy,
    Copied,
    Unsave,
    Invalid
}) {
    const [isOpen, setIsOpen] = useState(false);

    const [keyName, setKeyName] = useState(item.key || "");
    const [height, setHeight] = useState(item.height || 11);
    const [offset, setOffset] = useState(-(item.offset || 0));
    const [allowColor, setAllowColor] = useState(Boolean(item.allowColor));

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setKeyName(item.key || "");
        setHeight(item.height || 11);
        setOffset(-(item.offset || 0));
        setAllowColor(Boolean(item.allowColor));
    }, [item]);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(keyName);
        setCopied(true);
        setTimeout(() => setCopied(false), 500);
    };

    const isDirty =
        keyName !== (item.key || "") ||
        Number(height) !== (item.height || 11) ||
        -Number(offset) !== (item.offset || 0) ||
        Boolean(allowColor) !==
        Boolean(item.allowColor);

    const isInvalid = (() => {
        const trimmed = keyName.trim();
        if (!trimmed) return true;
        if (trimmed.includes("@")) return true;
        const h = Number(height);
        if (height === "" || h < 5 || h > 20) return true;
        const o = Number(offset);
        if (offset === "" || o < -5 || o > 5) return true;
        return false;
    })();

    const handleSave = async () => {
        if (isInvalid) return;
        try {
            await onUpdate({
                id: item.id,
                src: item.src,
                key: keyName,
                height: Number(height),
                offset: -Number(offset),
                allowColor: allowColor,
            });
            window.dispatchEvent(new CustomEvent("icon-config-changed"));
        } catch (e) {
        }
    };

    const handleCancel = () => {
        setKeyName(item.key || "");
        setHeight(item.height || 11);
        setOffset(item.offset || 0);
        setAllowColor(item.allowColor || false);
    };

    return (
        <div className="flex flex-col border border-(--panel-border) rounded-md bg-(--bg-secondary) overflow-hidden mb-2">
            {/* Header */}
            <div
                className={`flex items-center justify-between px-4 py-2 min-h-12 bg-(--toolbar-bg) cursor-pointer
                    hover:bg-(--panel-bg) transition-colors group border-b ${isOpen ? "border-(--panel-border)" : "border-transparent"}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded border border-(--panel-border) bg-black/10 flex items-center justify-center shrink-0 self-center">
                        <img src={item.src} className="max-w-4.5 max-h-4.5 object-contain" alt="icon" />
                    </div>

                    <div className="flex flex-col justify-center overflow-hidden leading-tight">
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-(--text-primary) max-w-45 truncate block">
                                {item.key || "Untitled"}
                            </span>
                            <Tooltip text={copied ? `${Copied}` : `${Copy}`}>
                                <button
                                    onClick={handleCopy}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-(--accent) text-(--text-secondary)"
                                >
                                    <CopyIcon size={12} />
                                </button>
                            </Tooltip>
                        </div>
                        <span className="text-[10px] text-(--text-secondary) uppercase tracking-wide font-medium block">
                            H: {item.height}px {item.allowColor && "• Variants"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 self-center">
                    {isDirty && (
                        <Tooltip text={isInvalid ? `${Invalid}` : `${Unsave}`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${isInvalid ? "bg-red-500" : "bg-yellow-600"}`} />
                        </Tooltip>
                    )}
                    <Tooltip text={Delete}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 text-(--text-secondary) hover:text-red-500 transition-colors"
                        >
                            <TrashIcon size={15} />
                        </button>
                    </Tooltip>
                    <ChevronDownIcon
                        size={14}
                        className={`text-(--text-secondary) transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    />
                </div>
            </div>

            {/* Content */}
            <div className={`${isOpen ? "block" : "hidden"} bg-(--panel-bg) p-4`}>
                <div className="flex items-end gap-2 mb-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase mb-1 block tracking-wider text-(--text-secondary)">Keyword</label>
                        <input
                            type="text"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            className={`w-full h-8 bg-(--input-bg) border text-(--text-primary) text-sm px-2 rounded outline-none transition-colors ${!keyName.trim() ? "border-red-500 ring-1 ring-red-500/20" : "border-(--panel-border) focus:border-(--accent)"
                                }`}
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="w-13">
                            <label className="text-[10px] font-bold uppercase mb-1 block tracking-wider text-(--text-secondary)">Size</label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className={`w-full h-8 bg-(--input-bg) border text-(--text-primary) text-sm px-2 rounded outline-none transition-colors ${(Number(height) < 1 || Number(height) > 20 || height === "") ? "border-red-500" : "border-(--panel-border) focus:border-(--accent)"
                                    }`}
                            />
                        </div>
                        <div className="w-13">
                            <label className="text-[10px] font-bold uppercase mb-1 block tracking-wider text-(--text-secondary)">Offset</label>
                            <input
                                type="number"
                                value={offset}
                                onChange={(e) => setOffset(e.target.value)}
                                className={`w-full h-8 bg-(--input-bg) border text-(--text-primary) text-sm px-2 rounded outline-none transition-colors ${(Number(offset) < -5 || Number(offset) > 5 || offset === "") ? "border-red-500" : "border-(--panel-border) focus:border-(--accent)"
                                    }`}
                            />
                        </div>
                    </div>

                    <Tooltip text={allowColor ? "Variants Off" : "Variants ON"}>
                        <div className="flex flex-col items-center">
                            <label className="text-[10px] font-bold uppercase mb-1 tracking-wider text-(--text-secondary)">VR</label>
                            <label className={`flex items-center justify-center h-8 w-8 rounded border cursor-pointer transition-colors ${allowColor ? "border-blue-500 bg-blue-500/10 dark:bg-blue-950" : "border-(--panel-border) bg-(--bg-secondary)"}`}>
                                <input type="checkbox" className="hidden" checked={allowColor} onChange={(e) => setAllowColor(e.target.checked)} />
                                <span className={`w-3.5 h-3.5 rounded-full ${allowColor ? "bg-white border-4 border-blue-500" : "bg-white dark:bg-gray-700 border-2 border-slate-400"}`} />
                            </label>
                        </div>
                    </Tooltip>
                </div>

                <div className="flex items-center justify-end border-t border-(--panel-border) pt-3">
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            disabled={!isDirty}
                            className="px-3 py-1.5 text-sm border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) hover:bg-(--button-hover) rounded disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                        >
                            {Cancle}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || isInvalid}
                            className="px-3 py-1.5 text-sm bg-(--accent) text-white rounded hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity shadow-sm"
                        >
                            {Save}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}