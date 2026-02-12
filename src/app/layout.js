import "./globals.css";
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
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
