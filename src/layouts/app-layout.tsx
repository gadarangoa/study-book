import { Outlet } from "react-router"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { AppBreadcrumbs } from "@/components/app-breadcrumbs"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { BreadcrumbProvider } from "@/components/breadcrumb-context"

export function AppLayout() {
  return (
    <TooltipProvider>
      <BreadcrumbProvider>
        <SidebarProvider>
          <div className="no-print contents">
            <AppSidebar />
          </div>
          <SidebarInset>
            <header className="no-print sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-1 h-4 data-vertical:self-center"
              />
              <AppBreadcrumbs />
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <ThemeToggle />
                <UserMenu />
              </div>
            </header>
            <div className="flex-1 p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
    </TooltipProvider>
  )
}
