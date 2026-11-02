import { Outlet } from "react-router"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="no-print contents">
          <AppSidebar />
        </div>
        <SidebarInset>
          <header className="no-print flex h-12 items-center justify-between border-b px-4">
            <SidebarTrigger />
            <ThemeToggle />
          </header>
          <div className="flex-1 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
