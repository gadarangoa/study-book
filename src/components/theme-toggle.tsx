import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"

function useIsDark() {
  const { theme } = useTheme()
  const [systemDark, setSystemDark] = React.useState(
    () => window.matchMedia(COLOR_SCHEME_QUERY).matches
  )

  React.useEffect(() => {
    const mq = window.matchMedia(COLOR_SCHEME_QUERY)
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return theme === "dark" || (theme === "system" && systemDark)
}

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const isDark = useIsDark()
  const label = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          />
        }
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
