import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";

interface SyncOptions {
  parseJson?: boolean;
}

interface SyncResponse {
  success?: boolean;
  synced?: number;
  errors?: number;
  message?: string;
  error?: string;
  needsReconnection?: boolean;
}

export async function syncGoogleCalendar(options?: SyncOptions): Promise<SyncResponse | undefined> {
  const supabase = createBrowserAuthClient();
  const result = (await supabase.functions.invoke("google-calendar-api", {
    body: { action: "syncFromGoogle", payload: {} },
  })) as { data: SyncResponse | null; error: { message: string } | null };
  const { data, error } = result;

  if (error) {
    return { success: false, error: error.message };
  }

  if (options?.parseJson) {
    return data ?? undefined;
  }

  return undefined;
}
