import { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import { TrialStatus } from "@/components/TrialStatus";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div></div>
          <div className="flex items-center gap-4">
            <TrialStatus />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;