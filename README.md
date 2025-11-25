# Extended EditorJS Image Tool

🖼️ An EditorJS block tool for pasting and uploading images — handles Google Docs clipboard images, supports file uploads, and provides a clean paste-only input interface.

> **📌 Note:** This tool is specifically designed for pasting images from the internet and Google Docs. Currently, only `uploadByFile` is supported. Additional features (like `uploadByUrl`, direct file selection, etc.) will be added in future releases.

## Features

- 📋 **Paste-only input** — Clean interface that only accepts paste events
- 🖼️ **Image preview** — Shows uploaded images with proper styling
- ☁️ **File upload support** — Upload images via endpoints using `uploadByFile`
- 📎 **Google Docs support** — Specifically handles images pasted from Google Docs and internet
- ⚡ **Upload status** — Visual feedback during upload process
- 🎨 **Configurable** — Customize endpoints, headers, placeholders, and more
- 🪶 **Lightweight** — No extra dependencies

---

## Installation

Install via npm or yarn:

```bash
npm install @skchawala/extended-editorjs-image
```

### or

```bash
yarn add @skchawala/extended-editorjs-image
```

---

## 🚀 Usage

### Basic Usage

```javascript
import EditorJS from "@editorjs/editorjs";
import ExtendedEditorJsImage from "@skchawala/extended-editorjs-image";

const editor = new EditorJS({
  holder: "editorjs",
  tools: {
    extendedImage: {
      class: ExtendedEditorJsImage,
      config: {
        placeholder: "Paste image here...",
      },
    },
  },
});
```

### With Custom Uploader

You need to provide an `Uploader` object with `uploadByFile` and/or `uploadByUrl` methods:

```javascript
import EditorJS from "@editorjs/editorjs";
import ExtendedEditorJsImage from "@skchawala/extended-editorjs-image";

const customUploader = {
  uploadByFile: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://api.example.com/upload", {
      method: "POST",
      headers: {
        Authorization: "Bearer your-token",
      },
      body: formData,
    });

    const data = await response.json();

    return {
      success: response.ok ? 1 : 0,
      file: data.url ? { url: data.url } : undefined,
      error: response.ok ? undefined : "Upload failed",
    };
  },
  // uploadByUrl is optional - only needed if you want to support URL uploads
  uploadByUrl: async (url) => {
    const response = await fetch("https://api.example.com/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your-token",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    return {
      success: response.ok ? 1 : 0,
      file: data.url ? { url: data.url } : undefined,
      error: response.ok ? undefined : "Upload failed",
    };
  },
};

const editor = new EditorJS({
  holder: "editorjs",
  tools: {
    image: {
      class: ExtendedEditorJsImage,
      config: {
        uploader: customUploader,
        placeholder: "Paste image here...",
      },
    },
  },
});
```

---

## ⚙️ Configuration Options

| Option               | Type                                                            | Default                 | Description                                                      |
| -------------------- | --------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------- |
| `toolboxTitle`       | `string`                                                        | `"Paste Image"`         | Title displayed in the EditorJS toolbox                          |
| `placeholder`        | `string`                                                        | `"Paste image here..."` | Placeholder text for the input box                               |
| `uploader`           | `Uploader`                                                      | `undefined`             | Uploader object with `uploadByFile` and/or `uploadByUrl` methods |
| `captionPlaceholder` | `string`                                                        | `"Caption"`             | Placeholder for caption input (if caption feature is enabled)    |
| `buttonContent`      | `string`                                                        | `undefined`             | HTML content to override the "Select file" button                |
| `actions`            | `Array<Action>`                                                 | `undefined`             | Custom actions to show in the tool's settings menu               |
| `features`           | `{ border?: boolean, background?: boolean, caption?: boolean }` | `undefined`             | Enable/disable additional features                               |
| `maxSizeBytes`       | `number`                                                        | `undefined`             | Maximum file size in bytes                                       |

### Uploader Interface

You must provide an `Uploader` object that implements the following interface:

```typescript
type Uploader = {
  uploadByFile?: (file: File) => Promise<UploadResult>;
  uploadByUrl?: (url: string) => Promise<UploadResult>;
};

type UploadResult = {
  success: 1 | 0;
  file?: { url: string };
  error?: string;
};
```

**Important Notes:**

- `uploadByFile` is required for file uploads (currently the primary use case)
- `uploadByUrl` is optional and will be supported in future releases
- Both methods should return a `UploadResult` object
- The `success` field should be `1` for success or `0` for failure
- The `file.url` should contain the uploaded image URL on success

### Action Interface

```typescript
type Action = {
  name: string;
  icon: string;
  title: string;
  action: () => void;
};
```

---

## 🛠️ Output Data

The tool saves data in the following format:

```json
{
  "type": "extendedImage",
  "data": {
    "file": {
      "url": "https://example.com/uploaded-image.jpg"
    },
    "caption": ""
  }
}
```

---

## 📝 Supported Paste Formats

The tool handles various paste formats:

- **Image files** — Direct image files from clipboard
- **Data URLs** — Base64 encoded images (`data:image/...`)
- **HTML images** — Images embedded in HTML (e.g., from Google Docs)
- **Image URLs** — Plain text URLs pointing to images

---

## 🎯 Features

### Paste-Only Input

The input box is read-only and only accepts paste events. Users can paste images using:

- `Ctrl+V` / `Cmd+V`
- `Shift+Insert`

### Upload Status

Visual feedback is shown during upload:

- Loading spinner in the input box
- Upload status overlay on image preview
- Empty image block state during upload

### Image Preview

Once an image is uploaded and `file.url` is available, the tool displays a preview with:

- Responsive width (100%)
- Auto height to maintain aspect ratio
- Clean, modern styling

---

## 📜 Changelog

You can find the full list of changes in the [CHANGELOG.md](./CHANGELOG.md).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT © [Satish Kumar](https://github.com/skchawala)

---

## 🔗 Links

- [GitHub Repository](https://github.com/skchawala/extended-editorjs-image)
- [NPM Package](https://www.npmjs.com/package/@skchawala/extended-editorjs-image)
