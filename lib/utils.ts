export function toXOnly(bytes: Uint8Array): Uint8Array {
  return bytes.length === 33 ? bytes.slice(1) : bytes;
}
