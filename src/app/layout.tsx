import React from 'react'
import type { Metadata } from "next";
import "./globals.css";
import "@/styles/dashboard.css"
import "@/styles/general.css"
import "@/styles/layout.css"
import { UserProvider } from "@/context/UserContext";
import { PocketBaseProvider } from "@/context/DatabaseContext";
import { TopBarComponent } from '@/components/local/topbar';

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
          <nav>
            <TopBarComponent />
          </nav>
          {/* <div id='main-content'> */}
            {children}
          {/* </div> */}
        </body>
      </html>
    </UserProvider>
    </PocketBaseProvider>
  );
}
