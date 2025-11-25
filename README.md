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
    image: {
      class: ExtendedEditorJsImage,
      config: {
        placeholder: "Paste image here...",
      },
    },
  },
});
```

### With Upload Endpoints

```javascript
import EditorJS from "@editorjs/editorjs";
import ExtendedEditorJsImage from "@skchawala/extended-editorjs-image";

const editor = new EditorJS({
  holder: "editorjs",
  tools: {
    image: {
      class: ExtendedEditorJsImage,
      config: {
        endpoints: {
          byFile: "https://api.example.com/upload/file",
          byUrl: "https://api.example.com/upload/url",
        },
        additionalRequestHeaders: {
          Authorization: "Bearer your-token",
        },
        additionalRequestData: {
          userId: 123,
          category: "editor",
        },
        field: "image",
        placeholder: "Paste image here...",
      },
    },
  },
});
```

### With Custom Uploader

```javascript
import EditorJS from "@editorjs/editorjs";
import ExtendedEditorJsImage, {
  UploaderUtil,
} from "@skchawala/extended-editorjs-image";

const customUploader = new UploaderUtil({
  byFileEndpoint: "https://api.example.com/upload",
  byUrlEndpoint: "https://api.example.com/upload-url",
  headers: {
    Authorization: "Bearer token",
  },
  fieldName: "image",
  additionalRequestData: {
    folder: "uploads",
  },
});

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

| Option                     | Type                                                            | Default                 | Description                                                             |
| -------------------------- | --------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `toolboxTitle`             | `string`                                                        | `"Paste Image"`         | Title displayed in the EditorJS toolbox                                 |
| `placeholder`              | `string`                                                        | `"Paste image here..."` | Placeholder text for the input box                                      |
| `endpoints`                | `{ byFile?: string, byUrl?: string }`                           | `undefined`             | Endpoints for file and URL uploading                                    |
| `field`                    | `string`                                                        | `"image"`               | Name of the uploaded image field in POST request                        |
| `types`                    | `string`                                                        | `"image/*"`             | MIME types of files that can be accepted                                |
| `additionalRequestData`    | `Record<string, any>`                                           | `undefined`             | Additional data to send with uploading requests                         |
| `additionalRequestHeaders` | `Record<string, string>`                                        | `undefined`             | Custom headers to add to upload requests                                |
| `captionPlaceholder`       | `string`                                                        | `"Caption"`             | Placeholder for caption input (if caption feature is enabled)           |
| `buttonContent`            | `string`                                                        | `undefined`             | HTML content to override the "Select file" button                       |
| `uploader`                 | `Uploader`                                                      | `undefined`             | Custom uploader object with `uploadByFile` and/or `uploadByUrl` methods |
| `actions`                  | `Array<Action>`                                                 | `undefined`             | Custom actions to show in the tool's settings menu                      |
| `features`                 | `{ border?: boolean, background?: boolean, caption?: boolean }` | `undefined`             | Enable/disable additional features                                      |
| `maxSizeBytes`             | `number`                                                        | `undefined`             | Maximum file size in bytes                                              |

### Uploader Interface

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

## 📦 UploaderUtil Class

The package includes a utility class for easy endpoint-based uploads:

```javascript
import { UploaderUtil } from "@skchawala/extended-editorjs-image";

const uploader = new UploaderUtil({
  byFileEndpoint: "https://api.example.com/upload",
  byUrlEndpoint: "https://api.example.com/upload-url",
  headers: {
    Authorization: "Bearer token",
  },
  fieldName: "image", // default: "image"
  urlFieldName: "url", // default: "url"
  additionalRequestData: {
    folder: "uploads",
  },
});
```

### UploaderUtil Configuration

| Option                  | Type                     | Default   | Description                                  |
| ----------------------- | ------------------------ | --------- | -------------------------------------------- |
| `byFileEndpoint`        | `string`                 | -         | Endpoint for file upload (required if using) |
| `byUrlEndpoint`         | `string`                 | -         | Endpoint for URL upload (required if using)  |
| `headers`               | `Record<string, string>` | -         | Custom headers for requests                  |
| `fieldName`             | `string`                 | `"image"` | FormData field name for file upload          |
| `urlFieldName`          | `string`                 | `"url"`   | Field name for URL upload (JSON body)        |
| `additionalRequestData` | `Record<string, any>`    | -         | Additional data to send with requests        |

---

## 🛠️ Output Data

The tool saves data in the following format:

```json
{
  "type": "image",
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
