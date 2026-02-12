import "./globals.css?v=2.5";
import { Providers } from "./providers";
import MainLayout from "@/components/MainLayout";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Carrington Chef Roster",
  description: "Premium kitchen staff and roster management for Carrington Hotels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'purple',
            color: 'white',
            textAlign: 'center',
            fontSize: '12px',
            zIndex: 10000,
            padding: '4px',
            pointerEvents: 'none'
          }}>
            System Ver: 2.5 | Build: {new Date().toISOString()}
          </div>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
