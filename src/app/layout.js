import "./globals.css";
import { ThemeProvider } from "../../utils/ThemeProvider";
import { LanguageProvider } from "../../utils/LanguageProvider";
import TitleBar from "../../components/TitleBar";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-screen overflow-hidden">
      <body className="h-screen flex flex-col select-none overflow-hidden">
        <LanguageProvider>
          <ThemeProvider>
            <TitleBar />
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {children}
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}