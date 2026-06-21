import { ThemeProvider } from "../../../utils/ThemeProvider";
import { LanguageProvider } from "../../../utils/LanguageProvider";


export default function DocsLayout({ children }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <div className="flex-1 min-h-0 flex flex-col select-none">
          {children}
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}
