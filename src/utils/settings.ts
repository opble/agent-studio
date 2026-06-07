import { z } from 'zod'

export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  markdownEnabled: z.boolean().default(true),
  layout: z.enum(['2panes', '3panes']).default('2panes'),
  sidebarCollapsed: z.boolean().default(false),
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

const SETTINGS_KEY = 'agent-studio-settings'

/** Load and validate settings from localStorage, returning defaults on any error. */
export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return UserSettingsSchema.parse(raw ? JSON.parse(raw) : {})
  } catch {
    return UserSettingsSchema.parse({})
  }
}

/** Persist settings to localStorage. */
export function saveSettings(s: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}
