import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"
import {
  BookOpenIcon,
  HomeIcon,
  GraduationCapIcon,
  LibraryBigIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getAll } from "@/lib/db"
import type { Career } from "@/features/careers/types"
import type { Course } from "@/features/courses/types"

export function AppSidebar() {
  const location = useLocation()
  const [careers, setCareers] = useState<Career[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    getAll("careers").then(setCareers)
    getAll("courses").then(setCourses)
  }, [location.pathname])

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />} tooltip="StudyBook">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LibraryBigIcon className="size-4" />
              </div>
              <span className="font-semibold">StudyBook</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
    </Sidebar>
  )
}
