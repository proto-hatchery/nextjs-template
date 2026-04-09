const AUTH_ROLES = ["admin", "patient", "psychologist"] as const

type AuthRole = (typeof AUTH_ROLES)[number]

const AUTH_ROLE_LABELS: Record<AuthRole, string> = {
  admin: "Admin",
  patient: "Patient",
  psychologist: "Psychologist",
}

function normalizeAuthRole(value: string): AuthRole | null {
  if (value === "user") {
    return "patient"
  }

  if (value === "psychotherapist") {
    return "psychologist"
  }

  return AUTH_ROLES.includes(value as AuthRole) ? (value as AuthRole) : null
}

function isAuthRole(value: string): value is AuthRole {
  return normalizeAuthRole(value) !== null
}

/** Users with `admin` receive every app role in DB/JWT (canonical order). */
function expandRolesForAdmin(roles: readonly AuthRole[]): AuthRole[] {
  return roles.includes("admin") ? [...AUTH_ROLES] : [...roles]
}

export {
  AUTH_ROLES,
  AUTH_ROLE_LABELS,
  expandRolesForAdmin,
  isAuthRole,
  normalizeAuthRole,
  type AuthRole,
}
