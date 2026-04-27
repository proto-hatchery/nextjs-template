type SignInSubmissionState = {
  email: string
  rememberMe: boolean
  role: "admin" | "partner" | "volunteer"
}

function SignInSubmissionNote({
  submissionState,
}: {
  submissionState: SignInSubmissionState | null
}) {
  if (!submissionState) {
    return null
  }

  return (
    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs/relaxed text-emerald-700 dark:text-emerald-300">
      Signed in as {submissionState.email} in the {submissionState.role} workspace.
      {submissionState.rememberMe ? " Session will be remembered." : " Session is temporary."}
    </div>
  )
}

export { SignInSubmissionNote, type SignInSubmissionState }
