import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { earlyAccess } from "@/lib/schema";

export const runtime = "edge";

function md5(input: string) {
  /* eslint-disable no-bitwise */
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = (a + q + x + t) & 0xffffffff;
    return (((a << s) | (a >>> (32 - s))) + b) & 0xffffffff;
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function toBytes(str: string) {
    const bytes = [] as number[];
    for (let i = 0; i < str.length; i += 1) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }
  function toHex(num: number) {
    const hex = (num >>> 0).toString(16).padStart(8, "0");
    return hex;
  }

  const bytes = toBytes(input);
  const len = bytes.length;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  const bitLen = len * 8;
  for (let i = 0; i < 8; i += 1) bytes.push((bitLen >>> (8 * i)) & 0xff);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const x = new Array(16).fill(0);
    for (let j = 0; j < 64; j += 4) {
      x[j / 4] = bytes[i + j] | (bytes[i + j + 1] << 8) | (bytes[i + j + 2] << 16) | (bytes[i + j + 3] << 24);
    }
    let aa = a;
    let bb = b;
    let cc = c;
    let dd = d;

    a = ff(a, b, c, d, x[0], 7, 0xd76aa478);
    d = ff(d, a, b, c, x[1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, x[2], 17, 0x242070db);
    b = ff(b, c, d, a, x[3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[4], 7, 0xf57c0faf);
    d = ff(d, a, b, c, x[5], 12, 0x4787c62a);
    c = ff(c, d, a, b, x[6], 17, 0xa8304613);
    b = ff(b, c, d, a, x[7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[8], 7, 0x698098d8);
    d = ff(d, a, b, c, x[9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, x[10], 17, 0xffff5bb1);
    b = ff(b, c, d, a, x[11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[12], 7, 0x6b901122);
    d = ff(d, a, b, c, x[13], 12, 0xfd987193);
    c = ff(c, d, a, b, x[14], 17, 0xa679438e);
    b = ff(b, c, d, a, x[15], 22, 0x49b40821);

    a = gg(a, b, c, d, x[1], 5, 0xf61e2562);
    d = gg(d, a, b, c, x[6], 9, 0xc040b340);
    c = gg(c, d, a, b, x[11], 14, 0x265e5a51);
    b = gg(b, c, d, a, x[0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[5], 5, 0xd62f105d);
    d = gg(d, a, b, c, x[10], 9, 0x02441453);
    c = gg(c, d, a, b, x[15], 14, 0xd8a1e681);
    b = gg(b, c, d, a, x[4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[9], 5, 0x21e1cde6);
    d = gg(d, a, b, c, x[14], 9, 0xc33707d6);
    c = gg(c, d, a, b, x[3], 14, 0xf4d50d87);
    b = gg(b, c, d, a, x[8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[13], 5, 0xa9e3e905);
    d = gg(d, a, b, c, x[2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, x[7], 14, 0x676f02d9);
    b = gg(b, c, d, a, x[12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, x[5], 4, 0xfffa3942);
    d = hh(d, a, b, c, x[8], 11, 0x8771f681);
    c = hh(c, d, a, b, x[11], 16, 0x6d9d6122);
    b = hh(b, c, d, a, x[14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[1], 4, 0xa4beea44);
    d = hh(d, a, b, c, x[4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, x[7], 16, 0xf6bb4b60);
    b = hh(b, c, d, a, x[10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[13], 4, 0x289b7ec6);
    d = hh(d, a, b, c, x[0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, x[3], 16, 0xd4ef3085);
    b = hh(b, c, d, a, x[6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[9], 4, 0xd9d4d039);
    d = hh(d, a, b, c, x[12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, x[15], 16, 0x1fa27cf8);
    b = hh(b, c, d, a, x[2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, x[0], 6, 0xf4292244);
    d = ii(d, a, b, c, x[7], 10, 0x432aff97);
    c = ii(c, d, a, b, x[14], 15, 0xab9423a7);
    b = ii(b, c, d, a, x[5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[12], 6, 0x655b59c3);
    d = ii(d, a, b, c, x[3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, x[10], 15, 0xffeff47d);
    b = ii(b, c, d, a, x[1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[8], 6, 0x6fa87e4f);
    d = ii(d, a, b, c, x[15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[6], 15, 0xa3014314);
    b = ii(b, c, d, a, x[13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[4], 6, 0xf7537e82);
    d = ii(d, a, b, c, x[11], 10, 0xbd3af235);
    c = ii(c, d, a, b, x[2], 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, x[9], 21, 0xeb86d391);

    a = (a + aa) & 0xffffffff;
    b = (b + bb) & 0xffffffff;
    c = (c + cc) & 0xffffffff;
    d = (d + dd) & 0xffffffff;
  }

  return [a, b, c, d]
    .map((n) => toHex(n))
    .join("");
  /* eslint-enable no-bitwise */
}

export async function GET() {
  try {
    const db = getDb();
    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(earlyAccess);

    const rows = await db
      .select({ email: earlyAccess.email })
      .from(earlyAccess)
      .orderBy(sql`created_at desc`)
      .limit(6);

    const hashes = rows
      .map((row) => row.email?.trim().toLowerCase())
      .filter(Boolean)
      .map((email) => md5(email as string));

    return NextResponse.json({
      count: Number(countRow?.count ?? 0),
      hashes,
    });
  } catch (error) {
    return NextResponse.json({ count: 0, hashes: [] }, { status: 200 });
  }
}
