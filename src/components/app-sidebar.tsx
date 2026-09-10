import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"
import {
  BookOpenIcon,
  HomeIcon,
  GraduationCapIcon,
  LogOutIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getAll } from "@/lib/db"
import { useAuth } from "@/features/auth"
import { Button } from "@/components/ui/button"
import type { Career } from "@/features/careers/types"
import type { Course } from "@/features/courses/types"

export function AppSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [careers, setCareers] = useState<Career[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    getAll("careers").then(setCareers)
    getAll("courses").then(setCourses)
  }, [location.pathname])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 text-sm font-semibold">
          StudyBook
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/dashboard" />}
                  isActive={location.pathname === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <HomeIcon />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {careers.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Careers</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {careers.map((career) => (
                  <SidebarMenuItem key={career.id}>
                    <SidebarMenuButton
                      render={<Link to={`/careers/${career.id}`} />}
                      isActive={location.pathname.includes(career.id)}
                      tooltip={career.name}
                    >
                      <GraduationCapIcon />
                      <span>{career.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {courses.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Courses</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {courses.map((course) => (
                  <SidebarMenuItem key={course.id}>
                    <SidebarMenuButton
                      render={<Link to={`/courses/${course.id}`} />}
                      isActive={location.pathname.includes(course.id)}
                      tooltip={course.name}
                    >
                      <BookOpenIcon />
                      <span>{course.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2">
          <span className="flex-1 truncate text-xs text-muted-foreground">
            {user?.email ?? "User"}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={signOut} title="Sign out">
            <LogOutIcon />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
