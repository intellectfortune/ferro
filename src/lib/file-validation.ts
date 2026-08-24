/**
 * Verifies a file's real type from its content (magic bytes), not the
 * client-supplied `file.type`/filename — those are just labels an
 * attacker can set to whatever they want in a crafted request, so they
 * don't actually prove what the bytes are.
 */

function bytesMatch(buf: Uint8Array, offset: number, ascii: string) {
  for (let i = 0; i < ascii.length; i++) {
    if (buf[offset + i] !== ascii.charCodeAt(i)) return false;
  }
  return true;
}

const HEIC_BRANDS = ["heic", "heix", "heim", "heis", "hevc", "hevx", "heif", "mif1", "msf1"];

const SIGNATURES: { mime: string; check: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    mime: "image/webp",
    check: (b) => bytesMatch(b, 0, "RIFF") && bytesMatch(b, 8, "WEBP"),
  },
  { mime: "application/pdf", check: (b) => bytesMatch(b, 0, "%PDF") },
  {
    mime: "image/heic",
    check: (b) =>
      bytesMatch(b, 4, "ftyp") && HEIC_BRANDS.some((brand) => bytesMatch(b, 8, brand)),
  },
];

/** Sniffs the real content type from a file's leading bytes, or null if unrecognized. */
export async function detectRealFileType(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  for (const sig of SIGNATURES) {
    if (sig.check(head)) return sig.mime;
  }
  return null;
}

export type FileValidationResult =
  | { ok: true; realType: string }
  | { ok: false; error: string };

/**
 * Full upload validation: size, and real content type against an
 * allowlist. Always use the returned `realType` (not file.type) as the
 * storage Content-Type — that closes off serving attacker-labeled
 * content as something it isn't.
 */
export async function validateUploadedFile(
  file: File,
  allowedTypes: string[],
  maxBytes: number
): Promise<FileValidationResult> {
  if (file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `File must be under ${Math.round(maxBytes / (1024 * 1024))}MB.` };
  }

  const realType = await detectRealFileType(file);
  if (!realType || !allowedTypes.includes(realType)) {
    return {
      ok: false,
      error: "That file doesn't look like a supported type — the content didn't match its extension.",
    };
  }

  return { ok: true, realType };
}
