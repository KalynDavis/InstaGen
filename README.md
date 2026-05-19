# @instagen/canvas

Generate Instagram story and post images from an HTML canvas, then export or download them as JPGs.

## Install

```bash
npm install @instagen/canvas
```

## Usage

```ts
import { createInstagramCanvas } from "@instagen/canvas";

const image = await createInstagramCanvas({
  format: "story",
  background: "#111827",
  draw(ctx, canvas) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 88px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Launch day", canvas.width / 2, 420);
  }
});

await image.download({
  filename: "story.jpg",
  quality: 0.94
});
```

## Demo

```bash
npm install
npm run demo
```

Open the local URL printed by Vite to try a browser demo with format, theme, copy, quality, and JPG download controls.

## Formats

| Format | Size |
| --- | --- |
| `story` | 1080 x 1920 |
| `post` | 1080 x 1080 |
| `portrait` | 1080 x 1350 |
| `landscape` | 1080 x 566 |

You can also pass `width` and `height` to create a custom canvas size.

## API

### `createInstagramCanvas(options)`

Creates a canvas with the requested Instagram dimensions and returns helpers for exporting it.

```ts
const image = await createInstagramCanvas({
  format: "post",
  background: "white",
  draw(ctx, canvas) {
    ctx.fillText("Hello", 80, 120);
  }
});
```

The returned object includes:

- `canvas`: the generated `HTMLCanvasElement`
- `toBlob({ quality })`: export a JPG `Blob`
- `toDataUrl({ quality })`: export a JPG data URL
- `download({ filename, quality })`: download a JPG in the browser

### `createGeneratedImage(canvas)`

Wraps an existing canvas with the same export and download helpers.

```ts
import { createGeneratedImage } from "@instagen/canvas";

const image = createGeneratedImage(existingCanvas);
await image.download({ filename: "post.jpg" });
```

### `canvasToJpegBlob(canvas, options)`

Exports a canvas to a JPG `Blob`.

### `canvasToJpegDataUrl(canvas, options)`

Exports a canvas to a JPG data URL.

### `downloadCanvasAsJpeg(canvas, options)`

Downloads a canvas as a JPG file in the browser.

## Notes

This package targets browser canvas APIs. If you need server-side image generation, use a DOM/canvas implementation such as `node-canvas` and wrap the resulting canvas with your own download or upload flow.
