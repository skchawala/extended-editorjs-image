export function extractImageUrlFromHTML(html?: string): string | null {
  if (!html) return null;

  // Find first <img ... src="..."> anywhere
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;

  let src = match[1].trim();

  // If google docs weird params, strip size suffix (=s500 etc)
  src = src.replace(/=s\d+$/, "");

  // Return base64 data: or cleaned URL
  return src || null;
}

export function base64ToFile(dataUrl: string, filename = "pasted-image"): File {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  const ext = mime.split("/")[1] || "png";
  return new File([u8], `${filename}.${ext}`, { type: mime });
}

export const toolIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-labelledby="titleDesc">
  <title id="titleDesc">Paste icon</title>
  <desc>Clipboard with a paper and a downward arrow representing paste action</desc>

  <!-- Clipboard body -->
  <rect x="12" y="10" width="40" height="44" rx="4" ry="4" fill="none" stroke="currentColor" stroke-width="2.8"/>

  <!-- Clipboard top clip -->
  <rect x="22" y="4" width="20" height="8" rx="2" ry="2" fill="currentColor" />

  <!-- Paper inside -->
  <rect x="18" y="16" width="28" height="26" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <!-- Folded corner on paper -->
  <path d="M 40 16 L 40 24 L 48 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>

  <!-- Down arrow (paste) -->
  <line x1="32" y1="44" x2="32" y2="30" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
  <polyline points="26,36 32,44 38,36" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>

  <!-- Subtle inner details for balanced visual weight -->
  <line x1="22" y1="24" x2="36" y2="24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.9"/>
  <line x1="22" y1="28" x2="42" y2="28" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
</svg>
`;
