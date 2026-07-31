const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)$/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.test(url.split("?")[0]);
}
