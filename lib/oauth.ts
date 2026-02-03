const encoder = new TextEncoder();

function toBase64(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

export function generateState(length = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashState(state: string) {
  const data = encoder.encode(state);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toBase64(digest);
}
