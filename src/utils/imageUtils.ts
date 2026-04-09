export function parseImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.png";

  let parsedUrl = url;
  try {
    const parsed = JSON.parse(url);
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsedUrl = parsed[0];
    } else if (typeof parsed === "string") {
      parsedUrl = parsed;
    }
  } catch {}

  parsedUrl = parsedUrl.replace(/^"(.*)"$/, "$1").trim();

  if (!parsedUrl.startsWith("http") && !parsedUrl.startsWith("/")) {
    return "/placeholder.png";
  }

  return parsedUrl;
}
