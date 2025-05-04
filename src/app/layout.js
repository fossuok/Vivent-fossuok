// src/app/layout.jsx
import Providers from "@/components/Providers";
import DesktopOnly from "@/components/DesktopOnly";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DesktopOnly>
          <Providers>{children}</Providers>
        </DesktopOnly>
      </body>
    </html>
  );
}
