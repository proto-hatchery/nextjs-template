import { cn } from "@workspace/ui/lib/utils"

function AuthVisualPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate hidden min-h-[20rem] overflow-hidden md:flex md:flex-col",
        "min-w-0 rounded-r-2xl border-l border-white/25",
        className
      )}
      role="complementary"
      aria-label="Sobre o template"
    >
      {/* Decorative layers (no a11y noise) */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-2xl"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-[#2d4acb]"
          style={{
            backgroundImage:
              "linear-gradient(145deg, #6b8cff 0%, #4f6ef7 38%, #2563eb 72%, #1d4ed8 100%)",
          }}
        />

        <div className="absolute top-0 -left-8 h-[55%] w-[85%] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute -right-4 -bottom-12 h-[60%] w-[70%] rounded-full bg-cyan-300/25 blur-[56px]" />
        <div className="absolute top-1/4 right-0 h-40 w-40 rounded-full bg-white/30 blur-2xl" />

        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/35 via-transparent to-sky-100/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)] opacity-90 mix-blend-overlay" />

        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent" />
      </div>

      {/* Produto */}
      <div className="relative z-10 mt-auto flex min-h-0 flex-1 flex-col justify-end p-5 md:p-6">
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/75 uppercase">
          Template demo
        </p>
        <h2 className="mt-2 leading-tight font-semibold text-balance text-white drop-shadow-sm [text-shadow:0_1px_12px_rgba(15,23,42,0.35)] sm:text-lg">
          Rede de comércio solidário no Porto
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-white/90 [text-shadow:0_1px_8px_rgba(15,23,42,0.25)]">
          Liga pessoas, comércios de bairro e parceiros para alargar o acesso a bens essenciais —
          com vouchers, proximidade e respeito.
        </p>
      </div>
    </div>
  )
}

export { AuthVisualPanel }
