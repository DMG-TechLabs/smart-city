import React from 'react'
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { PocketBaseProvider } from "@/context/DatabaseContext";
import { NavigationMenuComponent } from '@/components/ui/navigation-menu';


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
        <body
          // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="topbar">
            <div className="top">
              <div className="title">
                <h1>Smart City</h1>
              </div>
              <div className="right-corner">
                <h1>Welcome visitor!!!!!!</h1>
              </div>
            </div>
            <div className="bottom">
              <div className="navbar-menu">
                <NavigationMenuComponent />
              </div>
            </div>
          </div>
          {children}
        </body>
      </html>
    </UserProvider>
    </PocketBaseProvider>
  );
}
