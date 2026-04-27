module.exports = {
  forbidden: [
    {
      name: "no-cross-app-imports",
      severity: "error",
      comment: "Apps cannot import other apps",
      from: { path: "apps/[^/]+/src" },
      to: { path: "apps/[^/]+/src", pathNot: "^apps/\\1/" },
    },
    {
      name: "no-server-to-client",
      severity: "error",
      comment: "Server code cannot be imported into client code",
      from: {
        pathNot:
          "(server|database|supabase-admin|supabase-auth/src/(session|server|proxy)|supabase-data/src/(actions|lib/(auth|audit|scheduling)|modules/.*/domain/services)|supabase-infra/src/(env|clients)|logging/src/server|logging/server|apps/.*/app/|apps/.*/components/.*-header|apps/.*/proxy\\.ts|apps/.*/i18n/)",
      },
      to: {
        path: "(server|database|supabase-admin|supabase-auth/src/(session|server|proxy)|supabase-data/src/(actions|lib/(auth|audit|scheduling)|modules/.*/domain/services)|supabase-infra/src/(env|clients)|logging/src/server|logging/server)|server-only",
      },
    },
    {
      name: "no-barrel-imports",
      severity: "error",
      comment: "No barrel imports (index.ts)",
      from: {},
      to: { path: "index\\.tsx?$" },
    },
    {
      name: "no-circular",
      severity: "error",
      comment: "No circular dependencies",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
  },
}
