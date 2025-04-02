//app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiProvider } from "@/lib/context/api-provider";
import { AuthChecker } from "@/components/auth-checker";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sobat UMKM",
  description: "Platform Manajemen UMKM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ApiProvider>
            <AuthChecker>{children}</AuthChecker>
          </ApiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}