# Artwork Timeline — Custom Asset Requirements

Assets for the timeline on the Artwork page (`src/pages/Digital.tsx`,
rendered by `src/components/timeline/ArtworkTimeline.tsx`).

Everything is currently drawn with CSS placeholders. When you make real art,
drop the files in and pass their paths via the `assets` prop — no layout changes
needed. Any slot you leave out keeps its placeholder.

## Conventions

- **Format:** transparent SVG preferred (PNG with transparency is fine).
- **Palette:** line/accent `#ccd8ff` / `#c4d3ff` on the dark bg `rgb(20, 24, 39)`.
- **Location:** put files under `public/images/timeline/{line,point,box,artwork}/`.
- **Paths in code:** always prefix with `import.meta.env.BASE_URL`
  (e.g. `` `${import.meta.env.BASE_URL}images/timeline/point/marker.svg` ``).
- Timeline runs left (oldest) to right (newest); boxes alternate above/below.

## Asset groups

### 1. Line group (`assets.line`)

The horizontal spine. Kept modular so it's expandable later.

| Slot        | What it is                              | Suggested size / notes |
|-------------|-----------------------------------------|------------------------|
| `segment`   | One horizontal line tile / strip        | Any width x ~4px tall. Edges must meet cleanly if repeated; stroke centered vertically. Stretches to column width (320px per item). |
| `startCap`  | Left end cap (leftmost/oldest item only)| ~12px tall, centered on the line. |
| `endCap`    | Right end cap (rightmost/newest only)   | ~12px tall, centered on the line. |
| `connector` | Vertical stem from line to a box        | ~12px wide, tall. Rendered 26px tall for top boxes, 96px tall for bottom boxes (it scales to fit). |

### 2. Point group (`assets.point`)

The milestone marker that sits on the line at each item.

| Slot     | What it is        | Suggested size / notes |
|----------|-------------------|------------------------|
| `marker` | Node dot / marker | 22 x 22px, centered on a square canvas so its center aligns exactly with the line and connector. |

### 3. Box group (`assets.box`)

The decorative frame around each artwork image.

| Slot    | What it is                     | Suggested size / notes |
|---------|--------------------------------|------------------------|
| `frame` | Border art around the image    | 4:3 ratio, sized to the media area (256 x 192px). Keep the center transparent so the photo and text stay real HTML. Expands ~8px outward on hover. |

### 4. Artwork images (per event, not in `assets`)

Set per item via the event's `imageSrc` / `imageAlt` in `src/pages/Digital.tsx`.

- One image per event.
- Consistent **4:3** crops, ~1200 x 900px or larger, WebP or JPEG.
- Displayed at 256 x 192px, `object-fit: cover`.
- Provide `imageAlt`, plus `date` and `title` for the hover caption.

## Key dimensions (from `ArtworkTimeline.tsx` constants)

| Constant         | Value | Meaning |
|------------------|-------|---------|
| `COLUMN_WIDTH`   | 320   | Width of each item's column |
| Box / media size | 256 x 192 | `COLUMN_WIDTH - 64`, at 4:3 |
| `POINT_SIZE`     | 22    | Marker size |
| `CONNECTOR_UP`   | 26    | Line-to-box gap for top items |
| `CONNECTOR_DOWN` | 96    | Line-to-box gap for bottom items |
| `CAPTION_WIDTH`  | 190   | Hover text block, left of the image |
| `START_PADDING`  | 240   | Left padding so the first caption fits |

Tell me your preferred exact sizes and I can lock the constants to match your art.

## How to wire assets in

```tsx
// src/pages/Digital.tsx
const BASE = import.meta.env.BASE_URL

<ArtworkTimeline
  events={EVENTS}
  assets={{
    line: {
      segment: `${BASE}images/timeline/line/segment.svg`,
      startCap: `${BASE}images/timeline/line/start-cap.svg`,
      endCap: `${BASE}images/timeline/line/end-cap.svg`,
      connector: `${BASE}images/timeline/line/connector.svg`,
    },
    point: { marker: `${BASE}images/timeline/point/marker.svg` },
    box: { frame: `${BASE}images/timeline/box/frame.svg` },
  }}
/>
```
