export function normalizeUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return `${hostname.replace(/^www\./, "").split(".")[0]}-ai-bot`;
  } catch {
    return url.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  }
}
