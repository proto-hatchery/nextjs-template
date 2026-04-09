import { Button } from "@workspace/ui/components/button"
import { CardFooter } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

type AuthSubmitFooterProps = {
  canSubmit: boolean
  idleText?: string
  isDirty: boolean
  isSubmitting: boolean
  showStatusRow?: boolean
  submitLabel: string
  submittingLabel: string
}

function AuthSubmitFooter({
  canSubmit,
  idleText = "Ainda não existem alterações locais.",
  isDirty,
  isSubmitting,
  showStatusRow = true,
  submitLabel,
  submittingLabel,
}: AuthSubmitFooterProps) {
  return (
    <CardFooter
      className={cn(
        "flex-col items-stretch gap-3 px-0",
        showStatusRow ? "border-t pt-5" : "border-t-0 pt-4"
      )}
    >
      {showStatusRow ? (
        <div
          className={cn(
            "text-muted-foreground text-xs/relaxed",
            isDirty ? "text-foreground" : undefined
          )}
        >
          {isDirty ? "Alterações pendentes de validação." : idleText}
        </div>
      ) : null}
      <Button
        className="h-10 w-full rounded-lg text-sm font-medium"
        disabled={!canSubmit || isSubmitting}
        type="submit"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </CardFooter>
  )
}

export { AuthSubmitFooter, type AuthSubmitFooterProps }
