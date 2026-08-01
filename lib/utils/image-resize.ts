/** Center-crops an image to a square and resizes it to `size`x`size`, returning
 *  a PNG File. Runs entirely in the browser via <canvas> — used so favicon
 *  uploads always come out as a clean, correctly-sized square regardless of
 *  what the admin originally uploaded. */
export async function resizeImageToSquare(file: File, size: number): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const cropSize = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - cropSize) / 2;
  const sy = (bitmap.height - cropSize) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung di browser ini");

  ctx.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, size, size);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Gagal memproses gambar");

  const name = file.name.replace(/\.[^.]+$/, "") + ".png";
  return new File([blob], name, { type: "image/png" });
}
