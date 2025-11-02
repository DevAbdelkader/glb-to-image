## glb-to-image

A small client-side web app that lets you upload a GLB/GLTF 3D model, preview it interactively, and capture/export images from the viewport.

### Main features

- Upload a `.glb` or `.gltf` file by clicking the drop area or dragging-and-dropping the file.
- Interactive 3D preview with orbit controls (rotate, pan, zoom).
- Automatic framing: the model is fitted into view after upload.
- Background color control and transparent-background option for captures.
- Camera position controls (x, y, z) so you can fine-tune the view.
- Capture the current viewport to an image (PNG or JPEG etc) and download thumbnails from the capture history.
- Fully client-side — no server required. Works in the browser.

### Quick start (developers)

1. Install dependencies:

```cmd
npm install
```

2. Run the dev server (Vite):

```cmd
npm run dev
```

3. Open the app in your browser (Vite usually serves at http://localhost:5173).


## Technical implementation

This project is a lightweight front-end tool built with Vite and Three.js. Below are the main implementation details and the responsibilities of the key files.

Files overview (primary):

- `index.html` — app HTML shell and UI markup.
- `src/main.js` — app entry point: initializes the scene, UI hooks, lighting, capture & download logic.
- `src/ModelLoader.js` — encapsulates Three.js renderer, camera, scene, GLTF loading, orbit controls and camera fitting.
- `src/uploader.js` — small utility that handles the drag/drop and file input UI and returns a Promise for the uploaded `File`.
- `src/style.css` — basic styles.
- `public/fonts/...` — bundled fonts used by the UI.

Libraries and tooling:

- Vite for fast development and bundling (`devDependencies.vite`).
- Three.js for rendering and loading GLTF/GLB models (`dependencies.three`).
- Tailwind is present in `package.json` (project may use it for UI styles).

How model loading & capture work (technical details):

- Model loading
  - `ModelLoader` creates a `THREE.WebGLRenderer` with `preserveDrawingBuffer: true` so the canvas content can be exported via `toDataURL()`.
  - A `THREE.PerspectiveCamera` and a `THREE.Scene` are created. Lighting (ambient + directional) is added from `main.js` after loader initialization.
  - Models are loaded with a GLTF loader and added to the scene. After loading, `fitCameraToObject()` computes a bounding box/sphere, derives a suitable camera distance and updates camera near/far so the object fits nicely in the view.
  - Orbit controls are enabled so the user can rotate, pan and zoom the model interactively.

- Upload UI
  - `waitForGLBUpload()` (in `src/uploader.js`) attaches a hidden file input and wires a drop zone. It returns a Promise resolving with the uploaded `File` when the user drops or selects a file.
  - Accessibility hooks (role/aria-label) and keyboard activation are included.

- Capturing images
  - When you press the capture button, the app calls `renderer.domElement.toDataURL(mime)` to grab a snapshot of the canvas. `preserveDrawingBuffer: true` is required so the rendered pixels remain available to `toDataURL()`.
  - Captures are stored in-memory as data URLs and shown as thumbnails in a capture history panel. Each thumbnail has download and remove controls. Downloads are implemented by creating an `<a>` with `href` set to the data URL and calling `.click()`.

Design decisions & notes

- preserveDrawingBuffer: This option makes exported images simple (canvas.toDataURL). It has a small performance and memory cost but is acceptable for single-view captures in this lightweight tool.
- Camera fitting: The camera is positioned using the model's bounding sphere/box to ensure uploaded models of different scales are framed consistently.
- Client-only: No server is required — everything runs in the browser and files are never uploaded to a remote server.

Troubleshooting

- If a model doesn't appear, check the browser console for loader errors.
- For very large models, browser memory or GPU limits can be reached; try smaller models first.