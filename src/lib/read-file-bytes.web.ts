/** Web: read a picked file (blob: URI) into raw bytes. */
export async function readFileBytes(uri: string): Promise<Uint8Array> {
  const res = await fetch(uri);
  return new Uint8Array(await res.arrayBuffer());
}
