export const BaseIcon = ({
  children,
  size = 16,
  stroke = "currentColor",
  strokeWidth = 2,
  fill = "none",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const ZipIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M14 2v6h6" fill="none" />
    <polyline points="8 14 10 12 12 14 14 12 16 14" />
  </BaseIcon>
);

export const ImageIcon = (props) => (
  <BaseIcon {...props}>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </BaseIcon>
);

export const FolderIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </BaseIcon>
);

export const DownloadIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </BaseIcon>
);

export const DocsIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M4 4v16h16V4H4z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </BaseIcon>
);

export const EditIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </BaseIcon>
);

export const InfoIcon = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BaseIcon>
);

export const PlayIcon = (props) => (
  <BaseIcon {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </BaseIcon>
);

export const TextIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </BaseIcon>
);

export const JustifyIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </BaseIcon>
);

export const IconSymbolIcon = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </BaseIcon>
);

export const KeywordIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </BaseIcon>
);

export const CopyIcon = (props) => (
  <BaseIcon {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </BaseIcon>
);

export const CheckIcon = (props) => (
  <BaseIcon {...props}>
    <polyline points="20 6 9 17 4 12" />
  </BaseIcon>
);

export const ArrowRightIcon = (props) => (
  <BaseIcon {...props}>
    <polyline points="9 18 15 12 9 6" />
  </BaseIcon>
);

export const ArrowLeftIcon = (props) => (
  <BaseIcon {...props}>
    <polyline points="15 18 9 12 15 6" />
  </BaseIcon>
);

export const ChevronDownIcon = (props) => (
  <BaseIcon {...props}>
    <polyline points="6 9 12 15 18 9" />
  </BaseIcon>
);

export const TrashIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </BaseIcon>
);

export const PlusIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M20 12H4" />
    <path d="M12 4v16" />
  </BaseIcon>
);

export const IconPack = (props) => (
  <BaseIcon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="9" cy="9" r="1.5" />
    <circle cx="15" cy="9" r="1.5" />
    <circle cx="9" cy="15" r="1.5" />
    <circle cx="15" cy="15" r="1.5" />
    <path d="M21 6v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
  </BaseIcon>
);

export const LayersIcon = (props) => (
  <BaseIcon {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </BaseIcon>
);

export const CloseIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </BaseIcon>
);

export const MenuIcon = (props) => (
  <BaseIcon {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </BaseIcon>
);

export const WarningIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M12 3L2 21h20L12 3z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </BaseIcon>
);

export const LegalIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </BaseIcon>
);

export const KeyboardIcon = (props) => (
  <BaseIcon {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <path d="M6 8h1" />
    <path d="M11 8h1" />
    <path d="M16 8h1" />
    <path d="M6 12h1" />
    <path d="M11 12h1" />
    <path d="M16 12h1" />
    <path d="M6 16h7" />
  </BaseIcon>
);

export const DragHandleIcon = (props) => (
  <BaseIcon {...props}>
    <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
  </BaseIcon>
);

export const EyeOpenIcon = (props) => (
  <BaseIcon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

export const EyeClosedIcon = (props) => (
  <BaseIcon {...props}>
    <path
      d="M2 12c2.5 3.5 6 5 10 5s7.5-1.5 10-5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </BaseIcon>
);

export const RecentIcon = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </BaseIcon>
);