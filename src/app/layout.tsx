import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Document Running System",
  description: "ระบบจัดการคำขอเอกสารพร้อมเลข Running Number อัตโนมัติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Providers>
          <AppLayout>{children}</AppLayout>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
