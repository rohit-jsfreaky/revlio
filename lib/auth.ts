const encoder = new TextEncoder();

function toBase64(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

export function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export async function hashOtp(otp: string) {
  const data = encoder.encode(otp);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toBase64(digest);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256
  );
  return [
    "pbkdf2",
    "120000",
    toBase64(salt.buffer),
    toBase64(derivedBits),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, iterations, saltB64, hashB64] = stored.split("$");
  if (algo !== "pbkdf2") return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromBase64(saltB64),
      iterations: Number(iterations),
      hash: "SHA-256",
    },
    key,
    256
  );

  return toBase64(derivedBits) === hashB64;
}
