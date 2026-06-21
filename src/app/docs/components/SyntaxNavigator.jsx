"use client";
import { useEffect, useState } from "react";

export default function SyntaxNavigator({ categories, activeCategory, onCategoryChange }) {
    const [activeId, setActiveId] = useState(activeCategory);

    const handleClick = (id) => {
        setActiveId(id);
        onCategoryChange(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        setActiveId(activeCategory);
    }, [activeCategory]);

    return (
        <aside className="hidden md:flex w-80 shrink-0 bg-(--panel-bg) border-l border-(--panel-border) flex-col transition-colors duration-300">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-3 mb-3">
                    On this page
                </div>
                <nav className="space-y-1">
                    {categories.map((cat) => {
                        const isActive = activeId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleClick(cat.id)}
                                className={`
                                    w-full text-left py-2 rounded-md text-sm transition-all
                                    relative pl-3
                                    before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                                    before:w-0.5 before:h-5 before:rounded-full
                                    before:transition-all before:duration-200
                                    ${isActive 
                                        ? 'text-(--text-primary) font-medium before:bg-(--accent) before:opacity-100' 
                                        : 'text-(--text-secondary) hover:text-(--text-primary) before:bg-(--border-color) hover:before:bg-(--text-secondary) before:opacity-40 hover:before:opacity-100'
                                    }
                                `}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}