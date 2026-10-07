export function nowIso(): string {
  return new Date().toISOString();
}

export function fmtTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" }) +
    " · " +
    d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
  );
}

export function shortId(id: string): string {
  if (!id) return "SMU-000000";
  return "SMU-" + id.slice(0, 6).toUpperCase();
}

export function escapeHtml(s?: string | null): string {
  if (!s) return "";
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m] || m)
  );
}
