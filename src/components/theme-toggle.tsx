import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Switch } from "@/components/ui/switch"

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

  return (
    <label className="flex items-center gap-2 text-muted-foreground">
      <SunIcon className="size-4" aria-hidden />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Activar modo oscuro"
      />
      <MoonIcon className="size-4" aria-hidden />
    </label>
  )
}
