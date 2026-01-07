import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { FAB } from "./FAB";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 pb-24 lg:pb-0 overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
      <FAB />
    </div>
  );
}
