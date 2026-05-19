export type InstagramFormat = "story" | "post" | "portrait" | "landscape";

export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;

export interface InstagramSize {
  width: number;
  height: number;
}

export interface CreateInstagramCanvasOptions {
  format?: InstagramFormat;
  width?: number;
  height?: number;
  background?: string | CanvasGradient | CanvasPattern;
  draw?: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void | Promise<void>;
}

export interface JpegOptions {
  quality?: number;
  filename?: string;
}

export interface GeneratedInstagramImage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  toBlob: (options?: JpegOptions) => Promise<Blob>;
  toDataUrl: (options?: JpegOptions) => string;
  download: (options?: JpegOptions) => Promise<void>;
}

export const INSTAGRAM_SIZES: Record<InstagramFormat, InstagramSize> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1080, height: 566 }
};

const DEFAULT_QUALITY = 0.92;
const DEFAULT_FILENAME = "instagram-image.jpg";

export async function createInstagramCanvas(
  options: CreateInstagramCanvasOptions = {}
): Promise<GeneratedInstagramImage> {
  assertBrowserCanvasSupport();

  const size = resolveSize(options);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;

  const context = get2dContext(canvas);

  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  await options.draw?.(context, canvas);

  return createGeneratedImage(canvas);
}

export function createGeneratedImage(canvas: HTMLCanvasElement): GeneratedInstagramImage {
  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    toBlob: (options) => canvasToJpegBlob(canvas, options),
    toDataUrl: (options) => canvasToJpegDataUrl(canvas, options),
    download: (options) => downloadCanvasAsJpeg(canvas, options)
  };
}

export function canvasToJpegDataUrl(canvas: HTMLCanvasElement, options: JpegOptions = {}): string {
  return canvas.toDataURL("image/jpeg", normalizeQuality(options.quality));
}

export function canvasToJpegBlob(canvas: HTMLCanvasElement, options: JpegOptions = {}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to export the canvas as a JPG blob."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      normalizeQuality(options.quality)
    );
  });
}

export async function downloadCanvasAsJpeg(
  canvas: HTMLCanvasElement,
  options: JpegOptions = {}
): Promise<void> {
  const blob = await canvasToJpegBlob(canvas, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = options.filename ?? DEFAULT_FILENAME;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function getInstagramSize(format: InstagramFormat = "post"): InstagramSize {
  return { ...INSTAGRAM_SIZES[format] };
}

function resolveSize(options: CreateInstagramCanvasOptions): InstagramSize {
  if (options.width && options.height) {
    return { width: options.width, height: options.height };
  }

  return getInstagramSize(options.format);
}

function normalizeQuality(quality = DEFAULT_QUALITY): number {
  if (Number.isNaN(quality)) {
    return DEFAULT_QUALITY;
  }

  return Math.min(1, Math.max(0, quality));
}

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create a 2D canvas context.");
  }

  return context;
}

function assertBrowserCanvasSupport(): void {
  if (typeof document === "undefined") {
    throw new Error("createInstagramCanvas requires a browser-like DOM environment.");
  }
}
