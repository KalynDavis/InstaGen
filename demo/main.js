import { createInstagramCanvas, downloadCanvasAsJpeg } from "../dist/index.js";

const controls = {
  format: document.querySelector("#format"),
  headline: document.querySelector("#headline"),
  subhead: document.querySelector("#subhead"),
  theme: document.querySelector("#theme"),
  quality: document.querySelector("#quality"),
  qualityValue: document.querySelector("#qualityValue"),
  download: document.querySelector("#download"),
  randomize: document.querySelector("#randomize"),
  previewCanvas: document.querySelector("#previewCanvas")
};

const themes = {
  studio: {
    background: ["#f7f2e7", "#f3d28f"],
    ink: "#1f2933",
    accent: "#d83f31",
    panel: "#ffffff",
    soft: "#256d85"
  },
  citrus: {
    background: ["#fff7d6", "#79d2a6"],
    ink: "#17324d",
    accent: "#ff6b35",
    panel: "#fffaf0",
    soft: "#2f7d59"
  },
  night: {
    background: ["#10131f", "#31415f"],
    ink: "#f8fafc",
    accent: "#f4c95d",
    panel: "#1d2433",
    soft: "#8bd3dd"
  }
};

const headlineIdeas = [
  "Summer drop is live",
  "New workshop seats open",
  "Weekend menu revealed",
  "A better launch canvas",
  "Design the post faster"
];

let generated = null;

for (const control of [controls.format, controls.headline, controls.subhead, controls.theme, controls.quality]) {
  control.addEventListener("input", render);
}

controls.download.addEventListener("click", async () => {
  await downloadCanvasAsJpeg(controls.previewCanvas, {
    filename: `instagen-${controls.format.value}.jpg`,
    quality: Number(controls.quality.value)
  });
});

controls.randomize.addEventListener("click", () => {
  const nextHeadline = headlineIdeas[Math.floor(Math.random() * headlineIdeas.length)];
  const themeNames = Object.keys(themes);

  controls.headline.value = nextHeadline;
  controls.subhead.value = "Generated with canvas, exported as a JPG";
  controls.theme.value = themeNames[Math.floor(Math.random() * themeNames.length)];
  render();
});

await render();

async function render() {
  controls.qualityValue.textContent = `${Math.round(Number(controls.quality.value) * 100)}%`;

  generated = await createInstagramCanvas({
    format: controls.format.value,
    draw(context, canvas) {
      drawTemplate(context, canvas, {
        headline: controls.headline.value,
        subhead: controls.subhead.value,
        theme: themes[controls.theme.value]
      });
    }
  });

  copyCanvas(generated.canvas, controls.previewCanvas);
}

function drawTemplate(ctx, canvas, content) {
  const { width, height } = canvas;
  const scale = width / 1080;
  const theme = content.theme;

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, theme.background[0]);
  background.addColorStop(1, theme.background[1]);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  drawSunburst(ctx, width, height, theme, scale);
  drawCard(ctx, width, height, theme, scale);

  ctx.fillStyle = theme.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.font = `${Math.round(34 * scale)}px Inter, Arial, sans-serif`;
  ctx.fillText("INSTAGEN", 92 * scale, 92 * scale);

  wrapText(ctx, content.headline, 92 * scale, height * 0.34, width - 184 * scale, 104 * scale, {
    font: `800 ${Math.round(108 * scale)}px Inter, Arial, sans-serif`,
    color: theme.ink,
    lineHeight: 1.05
  });

  wrapText(ctx, content.subhead, 96 * scale, height * 0.58, width - 192 * scale, 44 * scale, {
    font: `500 ${Math.round(42 * scale)}px Inter, Arial, sans-serif`,
    color: theme.ink,
    lineHeight: 1.25
  });

  drawPill(ctx, 92 * scale, height - 210 * scale, "Download-ready JPG", theme, scale);
}

function drawSunburst(ctx, width, height, theme, scale) {
  ctx.save();
  ctx.translate(width * 0.76, height * 0.2);
  ctx.rotate(-0.28);
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(-120 * scale, -120 * scale, 240 * scale, 240 * scale);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = theme.soft;
  ctx.lineWidth = 12 * scale;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(width * 0.22, height * 0.78, 150 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCard(ctx, width, height, theme, scale) {
  const x = 64 * scale;
  const y = height * 0.28;
  const cardWidth = width - 128 * scale;
  const cardHeight = height * 0.48;

  ctx.save();
  ctx.fillStyle = theme.panel;
  ctx.globalAlpha = 0.64;
  roundRect(ctx, x, y, cardWidth, cardHeight, 36 * scale);
  ctx.fill();
  ctx.restore();
}

function drawPill(ctx, x, y, text, theme, scale) {
  ctx.font = `700 ${Math.round(34 * scale)}px Inter, Arial, sans-serif`;
  const metrics = ctx.measureText(text);
  const width = metrics.width + 60 * scale;
  const height = 76 * scale;

  ctx.fillStyle = theme.accent;
  roundRect(ctx, x, y, width, height, height / 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 30 * scale, y + height / 2);
}

function wrapText(ctx, text, x, y, maxWidth, maxLineHeight, options) {
  ctx.font = options.font;
  ctx.fillStyle = options.color;

  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) {
    lines.push(line);
  }

  lines.slice(0, 3).forEach((lineText, index) => {
    ctx.fillText(lineText, x, y + index * maxLineHeight * options.lineHeight);
  });
}

function copyCanvas(source, target) {
  target.width = source.width;
  target.height = source.height;

  const context = target.getContext("2d");
  context.clearRect(0, 0, target.width, target.height);
  context.drawImage(source, 0, 0);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
