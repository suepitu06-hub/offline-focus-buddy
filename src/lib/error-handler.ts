import { toast } from "sonner";

function friendlyMessage(err: unknown): string {
  if (!err) return "Something went wrong.";
  const e = err as { name?: string; message?: string };
  const name = e.name ?? "";
  const msg = e.message ?? String(err);

  if (name === "ReadOnlyError" || /readwrite transaction/i.test(msg))
    return "Couldn't save changes (database was busy). Please try again.";
  if (name === "QuotaExceededError") return "Device storage is full. Free up space and retry.";
  if (name === "VersionError") return "Database needs an update. Reload the app to continue.";
  if (name === "ConstraintError") return "That entry conflicts with existing data.";
  if (name === "NotFoundError") return "That item no longer exists.";
  if (name === "DataError" || name === "DataCloneError")
    return "The data you entered isn't valid.";
  if (/dexie|indexeddb/i.test(name + msg)) return "Storage error. Please try again.";
  return msg || "Something went wrong.";
}

export function reportError(err: unknown, context?: string) {
  console.error("[app error]", context ?? "", err);
  toast.error(friendlyMessage(err), {
    description: context,
  });
}

let installed = false;
export function installGlobalErrorHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    if (event.error) {
      event.preventDefault();
      reportError(event.error, "Unexpected error");
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    event.preventDefault();
    reportError(event.reason, "Background task failed");
  });
}
