import React from 'react'
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import "./dashboard/style.css";
import { UserProvider } from "@/context/UserContext";
import { PocketBaseProvider } from "@/context/DatabaseContext";
import { NavigationMenuComponent } from '@/components/ui/navigation-menu';
import { TopBarComponent } from '@/components/local/topbar';


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
//
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Smart City",
  description: "Control Dashboard"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PocketBaseProvider>
    <UserProvider>
      <html lang="en">
        <body>
          <TopBarComponent />
          {children}
        </body>
      </html>
    </UserProvider>
    </PocketBaseProvider>
  );
}
