export function readPersistedSetting(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    console.error(`Could not read saved setting "${key}".`, error)
    return null
  }
}

export function writePersistedSetting(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.error(`Could not save setting "${key}".`, error)
  }
}
