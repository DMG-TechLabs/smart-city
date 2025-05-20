import React from 'react'
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/dashboard.css"
// import "./dashboard/style.css";
import { UserProvider } from "@/context/UserContext";
import { PocketBaseProvider } from "@/context/DatabaseContext";
// import { NavigationMenuDemo } from '@/components/ui/navigation-menu';
import { TopBarComponent } from '@/components/local/topbar';
// import { useUser } from "@/context/UserContext";
// import { useRouter } from "next/navigation";

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
    // const { user } = useUser();
  // const router = useRouter();
  //
  // if (user == null || user.email === "") {
  //     router.push("/login");
  // }

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
