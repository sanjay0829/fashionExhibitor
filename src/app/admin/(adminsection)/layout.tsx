import Sidebar from "@/components/sidebar";
import React from "react";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex w-full min-h-screen bg-zinc-200/20 justify-center">
      <Sidebar />
      {children}
    </div>
  );
}
