import Tooltip from "./Tooltip";

const Selector = ({
    label,
    options,
    value,
    onChange,

    visible = true,
    disabled = false,

    checkVisible = false,
    checkValue = false,
    checkOnChange,
    checkText = "CK",
    checkTooltip = "",

    checkVisible2 = false,
    checkValue2 = false,
    checkOnChange2,
    checkText2 = "CK",
    checkTooltip2 = "",
}) => (
    <div className={`flex-1 ${visible ? "block" : "hidden"}`}>
        <label className="block text-sm font-medium text-(--text-secondary) mb-1">
            {label}
        </label>

        <div className="flex items-center gap-2">
            <select
                disabled={disabled}
                className={`flex-1 w-full p-2 h-10 text-sm border border-(--border-color)
                rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all
                bg-(--bg-secondary) text-(--text-primary)
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((optOrGroup) => {
                    if (optOrGroup.options) {
                        return (
                            <optgroup key={optOrGroup.label} label={optOrGroup.label}>
                                {optOrGroup.options.map((opt) => (
                                    <option key={opt.id} value={opt.file}>
                                        {opt.label}
                                    </option>
                                ))}
                            </optgroup>
                        );
                    }
                    return (
                        <option key={optOrGroup.id} value={optOrGroup.file}>
                            {optOrGroup.label}
                        </option>
                    );
                })}
            </select>

            {checkVisible && (
                <Tooltip text={checkTooltip}>
                    <label
                        className={`flex items-center justify-center gap-2 min-w-17 h-10 px-3 rounded-md border transition-all
                        ${checkValue
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'hover:bg-(--panel-bg) border-(--border-color) bg-(--bg-secondary)'}`}
                    >
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={checkValue}
                            onChange={(e) => checkOnChange(e.target.checked)}
                        />

                        <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                            ${checkValue
                                ? 'border-5 bg-white border-blue-600'
                                : 'border-2 bg-white dark:bg-gray-700 border-slate-400 dark:border-slate-500'}`}
                        />

                        <span
                            className={`text-[11px] font-bold
                            ${checkValue
                                ? 'text-blue-700 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            {checkText}
                        </span>
                    </label>
                </Tooltip>
            )}

            {checkVisible2 && (
                <Tooltip text={checkTooltip2}>
                    <label
                        className={`flex items-center justify-center gap-2 min-w-17 h-10 px-3 rounded-md border transition-all
                        ${checkValue2
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'hover:bg-(--panel-bg) border-(--border-color) bg-(--bg-secondary)'}`}
                    >
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={checkValue2}
                            onChange={(e) => checkOnChange2(e.target.checked)}
                        />

                        <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                            ${checkValue2
                                ? 'border-5 bg-white border-blue-600'
                                : 'border-2 bg-white dark:bg-gray-700 border-slate-400 dark:border-slate-500'}`}
                        />

                        <span
                            className={`text-[11px] font-bold
                            ${checkValue2
                                ? 'text-blue-700 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            {checkText2}
                        </span>
                    </label>
                </Tooltip>
            )}
        </div>
    </div>
);

export default Selector;