"use client";

import React, { useEffect, useState } from 'react';

export default function TitleBar() {
    const [isElectron, setIsElectron] = useState(false);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const checkElectron = typeof window !== 'undefined' && 
            (window.electronAPI || navigator.userAgent.toLowerCase().includes('electron'));
        setIsElectron(!!checkElectron);

        if (!checkElectron) return;

        setTitle(document.title || 'CFV Maker');

        const observer = new MutationObserver(() => {
            setTitle(document.title || 'CFV Maker');
        });

        observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            characterData: true
        });

        return () => observer.disconnect();
    }, []);

    if (!isElectron) return null;

    return (
        <div className="flex flex-col shrink-0 w-full transition-colors duration-300">
            <div 
                className="h-8 w-full bg-(--bg-secondary) flex items-center justify-center relative select-none"
                style={{ WebkitAppRegion: 'drag' }}
            >
                <span className="text-xs font-medium text-(--text-primary) font-sans tracking-wide">
                    {title}
                </span>
            </div>
            <div className="h-px w-full bg-(--panel-border) shrink-0" />
        </div>
    );
}
