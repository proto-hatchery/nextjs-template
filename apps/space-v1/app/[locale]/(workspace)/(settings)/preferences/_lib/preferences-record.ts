type PreferencesRecord = Record<string, unknown>

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function parsePreferencesBlob(value: unknown): PreferencesRecord {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? (parsed as PreferencesRecord)
        : {}
    } catch {
      return {}
    }
  }

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as PreferencesRecord
  }

  return {}
}

function serializePreferencesBlob(value: PreferencesRecord) {
  return JSON.stringify(value)
}

function ensureRecord(value: unknown): PreferencesRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? { ...(value as PreferencesRecord) }
    : {}
}

function readNestedString(object: PreferencesRecord, paths: string[][]): string | null {
  for (const path of paths) {
    let current: unknown = object

    for (const segment of path) {
      if (typeof current !== "object" || current === null || Array.isArray(current)) {
        current = null
        break
      }

      current = (current as PreferencesRecord)[segment]
    }

    const value = asString(current)
    if (value) {
      return value
    }
  }

  return null
}

function readNestedBoolean(object: PreferencesRecord, paths: string[][]): boolean | null {
  for (const path of paths) {
    let current: unknown = object

    for (const segment of path) {
      if (typeof current !== "object" || current === null || Array.isArray(current)) {
        current = null
        break
      }

      current = (current as PreferencesRecord)[segment]
    }

    const value = asBoolean(current)
    if (typeof value === "boolean") {
      return value
    }
  }

  return null
}

function readNestedNumber(object: PreferencesRecord, paths: string[][]): number | null {
  for (const path of paths) {
    let current: unknown = object

    for (const segment of path) {
      if (typeof current !== "object" || current === null || Array.isArray(current)) {
        current = null
        break
      }

      current = (current as PreferencesRecord)[segment]
    }

    const value = asNumber(current)
    if (typeof value === "number") {
      return value
    }
  }

  return null
}

type GeneralPreferencesFormValues = {
  displayName: string
  locale: string
  timezone: string
  workspaceName: string
}

type SecurityPreferencesFormValues = {
  twoFactorEnabled: boolean
  recoveryEmailConfirmed: boolean
}

function applyGeneralPreferencesToBlob(
  currentBlob: PreferencesRecord,
  value: GeneralPreferencesFormValues
) {
  const nextBlob = { ...currentBlob }
  const profile = ensureRecord(nextBlob.profile)
  const workspace = ensureRecord(nextBlob.workspace)

  nextBlob.displayName = value.displayName
  nextBlob.locale = value.locale
  nextBlob.timezone = value.timezone
  nextBlob.workspaceName = value.workspaceName
  nextBlob.profile = {
    ...profile,
    displayName: value.displayName,
    locale: value.locale,
    timezone: value.timezone,
  }
  nextBlob.workspace = {
    ...workspace,
    name: value.workspaceName,
  }

  return nextBlob
}

function applySecurityPreferencesToBlob(
  currentBlob: PreferencesRecord,
  value: SecurityPreferencesFormValues
) {
  const nextBlob = { ...currentBlob }
  const security = ensureRecord(nextBlob.security)

  nextBlob.twoFactorEnabled = value.twoFactorEnabled
  nextBlob.recoveryEmailConfirmed = value.recoveryEmailConfirmed
  nextBlob.security = {
    ...security,
    twoFactorEnabled: value.twoFactorEnabled,
    recoveryEmailConfirmed: value.recoveryEmailConfirmed,
  }

  return nextBlob
}

export {
  applyGeneralPreferencesToBlob,
  applySecurityPreferencesToBlob,
  asBoolean,
  asNumber,
  asString,
  parsePreferencesBlob,
  readNestedBoolean,
  readNestedNumber,
  readNestedString,
  serializePreferencesBlob,
}
