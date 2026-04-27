import { AuthVisualPanel } from "@/app/[locale]/(auth)/_components/auth-visual-panel"
import { cn } from "@workspace/ui/lib/utils"

type AuthSplitShellProps = {
  children: React.ReactNode
  className?: string
  /** When false, only the left column is shown (e.g. small screens still get a single column). */
  showVisualPanel?: boolean
}

function AuthSplitShell({ children, className, showVisualPanel = true }: AuthSplitShellProps) {
  return (
    <div
      className={cn(
        "border-border bg-card w-full max-w-3xl overflow-hidden rounded-2xl border shadow-none",
        className
      )}
    >
      <div className="grid min-h-[min(32rem,calc(100svh-8rem))] grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <div className="bg-background flex min-w-0 flex-col justify-start px-6 py-10 sm:px-8 sm:py-12 md:justify-center md:rounded-l-2xl md:py-14">
          {children}
        </div>
        {showVisualPanel ? <AuthVisualPanel /> : null}
      </div>
    </div>
  )
}

export { AuthSplitShell }
