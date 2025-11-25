import "./style.css";
import type {
  BlockTool,
  BlockToolConstructorOptions,
  API,
  BlockAPI,
  BlockToolData,
} from "@editorjs/editorjs";
import { extractImageUrlFromHTML, base64ToFile, toolIcon } from "./utils";
import type { ExtendedImageConfig, Uploader } from "./types";
import { UploaderUtil } from "./uploader";

// Export uploader utility class and types
export { UploaderUtil } from "./uploader";
export type { UploaderConfig } from "./uploader";
export type { Uploader, UploadResult, ExtendedImageConfig } from "./types";

type ConstructorOptions = BlockToolConstructorOptions<any, ExtendedImageConfig>;

export default class ExtendedEditorJsImage implements BlockTool {
  private static defaultToolboxTitle = "Paste Image";

  /**
   * Set the default toolbox title for all instances
   * @param title - The title to display in the toolbox
   */
  static setToolboxTitle(title: string) {
    ExtendedEditorJsImage.defaultToolboxTitle = title;
  }

  static get toolbox() {
    return {
      title: ExtendedEditorJsImage.defaultToolboxTitle,
      icon: toolIcon,
    };
  }

  public static get isReadOnlySupported() {
    return true;
  }

  private api: API;
  private block: BlockAPI;
  private _data: BlockToolData;
  private config: ExtendedImageConfig;
  private uploader?: Uploader;
  private holder: HTMLDivElement;
  private destroyed = false;
  private isUploading = false; // Flag to track upload status
  private wrapperElement?: HTMLElement; // Reference to wrapper for UI updates

  constructor({ config, data, api, block }: ConstructorOptions) {
    this.api = api;
    this.config = config || {};
    this.block = block;
    this._data = data;

    // Set toolbox title from config if provided
    if (this.config.toolboxTitle) {
      ExtendedEditorJsImage.setToolboxTitle(this.config.toolboxTitle);
    }

    // If endpoints are provided, create UploaderUtil instance
    if (this.config.endpoints?.byFile || this.config.endpoints?.byUrl) {
      const uploaderUtil = new UploaderUtil({
        byFileEndpoint: this.config.endpoints.byFile,
        byUrlEndpoint: this.config.endpoints.byUrl,
        headers: this.config.additionalRequestHeaders,
        fieldName: this.config.field || "image",
        additionalRequestData: this.config.additionalRequestData,
      });

      // Create a wrapper uploader that only exposes enabled methods
      const wrapper: Uploader = {};

      // Enable uploadByFile if byFile endpoint is provided
      if (this.config.endpoints.byFile) {
        wrapper.uploadByFile = uploaderUtil.uploadByFile.bind(uploaderUtil);
      }

      // Enable uploadByUrl if byUrl endpoint is provided
      if (this.config.endpoints.byUrl) {
        wrapper.uploadByUrl = uploaderUtil.uploadByUrl.bind(uploaderUtil);
      }

      this.uploader = wrapper;
    } else {
      // Use custom uploader if provided
      this.uploader = this.config.uploader;
    }

    this.holder = document.createElement("div");
    this.holder.className = "eeji-image-block";
  }

  render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "eeji-wrapper";
    this.wrapperElement = wrapper;

    // Check if we have an image URL in data
    const imageUrl = (this._data as any)?.file?.url;

    if (imageUrl) {
      // Show image preview
      const imagePreview = document.createElement("img");
      imagePreview.src = imageUrl;
      imagePreview.className = "eeji-image-preview";
      imagePreview.alt = "Image preview";

      wrapper.appendChild(imagePreview);
    } else {
      const placeholder = this.config.placeholder || "Paste  image here...";
      // Show input box for pasting only
      const inputBox = document.createElement("input");
      inputBox.type = "text";
      inputBox.placeholder = placeholder;
      inputBox.className = "eeji-input-box";
      inputBox.readOnly = true; // Prevent typing

      // Add paste event handler
      inputBox.addEventListener("paste", this.handlePaste.bind(this));

      // Prevent typing and other input methods
      inputBox.addEventListener("keydown", (e) => {
        // Allow only Ctrl+V, Cmd+V, and Shift+Insert for pasting
        const isPaste = (e.ctrlKey || e.metaKey) && e.key === "v";
        const isShiftInsert = e.shiftKey && e.key === "Insert";
        if (!isPaste && !isShiftInsert) {
          e.preventDefault();
        }
      });

      inputBox.addEventListener("input", () => {
        // Clear any input that might have gotten through
        if (inputBox.value) {
          inputBox.value = "";
        }
      });

      inputBox.addEventListener("focus", () => {
        // Show hint that only pasting is allowed
        inputBox.title =
          "Only pasting is allowed. Use Ctrl+V or Cmd+V to paste an image.";
      });

      wrapper.appendChild(inputBox);
    }

    wrapper.appendChild(this.holder);
    return wrapper;
  }

  /**
   * Show upload status indicator
   */
  private showUploadStatus() {
    if (this.isUploading) return;
    this.isUploading = true;

    // Try to find wrapper element (might have changed after block conversion)
    let wrapper = this.wrapperElement;
    if (!wrapper || !document.contains(wrapper)) {
      // Try to find it from the block holder
      wrapper = this.block.holder.closest(".eeji-wrapper") as HTMLElement;
    }

    if (wrapper) {
      const statusIndicator = document.createElement("div");
      statusIndicator.className = "eeji-upload-status";
      statusIndicator.innerHTML = `
        <div class="eeji-upload-status-content">
          <div class="eeji-upload-spinner"></div>
          <span>Uploading...</span>
        </div>
      `;
      wrapper.appendChild(statusIndicator);
      this.wrapperElement = wrapper;
    }
  }

  /**
   * Hide upload status indicator
   */
  private hideUploadStatus() {
    if (!this.isUploading) return;

    this.isUploading = false;

    // Try to find wrapper element (might have changed after block conversion)
    let wrapper = this.wrapperElement;
    if (!wrapper || !document.contains(wrapper)) {
      // Try to find it from the block holder
      wrapper = this.block.holder.closest(".eeji-wrapper") as HTMLElement;
    }

    if (wrapper) {
      const statusIndicator = wrapper.querySelector(".eeji-upload-status");
      if (statusIndicator) {
        statusIndicator.remove();
      }
    }
  }

  save() {
    // Save currently uploaded file url from block data
    const imageUrl = (this._data as any)?.file?.url;
    return {
      file: imageUrl ? { url: imageUrl } : { url: "" },
      caption: "",
    };
  }

  // Clean up when block/tool destroyed (important)
  destroy() {
    this.destroyed = true;
  }

  /**
   * Paste handler for input box (processes pasted content)
   */
  private async handlePaste(e: ClipboardEvent) {
    if (!e.clipboardData) return;
    e.preventDefault();
    e.stopPropagation();

    // Try to get image file from clipboard
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      // Handle pasted image file
      const file = imageItem.getAsFile();
      if (file) {
        await this.insertPreviewAndUpload(file);
        return;
      }
    }

    // Try HTML (for Google Docs / nested HTML images)
    const html = e.clipboardData.getData("text/html");
    const src = extractImageUrlFromHTML(html || undefined);

    if (src) {
      // If it's a data URL -> convert to File
      if (src.startsWith("data:image")) {
        const file = base64ToFile(src, "pasted-image");
        await this.insertPreviewAndUpload(file);
        return;
      }

      // If it's a normal URL - we can either upload by url or update as-is
      try {
        await this.updateBlockWithImage(
          this.uploader?.uploadByUrl
            ? async () => this.uploader!.uploadByUrl!(src)
            : undefined
        );
      } catch (err) {
        console.error("ExtendedEditorJsImage: uploadByUrl failed", err);
        // fallback: update as-is
      }
      return;
    }

    // Try plain text (might be an image URL)
    const text = e.clipboardData.getData("text/plain");
    if (text) {
      // Check if it looks like an image URL
      const imageUrlPattern =
        /https?:\/\/\S+\.(gif|jpe?g|tiff|png|svg|webp)(\?[a-z0-9=]*)?$/i;
      if (imageUrlPattern.test(text.trim())) {
        const url = text.trim();
        try {
          await this.updateBlockWithImage(
            this.uploader?.uploadByUrl
              ? async () => this.uploader!.uploadByUrl!(url)
              : undefined
          );
        } catch (err) {
          console.error("ExtendedEditorJsImage: uploadByUrl failed", err);
        }
      }
    }
  }

  /**
   * Update current block with image URL and optionally upload it
   * @param url - Image URL to set
   * @param uploadFn - Optional upload function to call after setting URL
   */
  private async updateBlockWithImage(
    uploadFn?: () => Promise<{ success: 1 | 0; file?: { url: string } }>
  ) {
    if (this.destroyed) return;
    // If upload function is provided, upload and update the block
    if (uploadFn) {
      this.showUploadStatus();
      try {
        const res = await uploadFn();
        if (res.success && res.file?.url) {
          // Update the block with uploaded URL
          await this.api.blocks.update(this.block.id, {
            file: { url: res.file.url },
          } as any);
        } else {
          console.error("Upload returned error", res);
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        this.hideUploadStatus();
      }
    }
  }

  /**
   * Update block with preview using object URL then upload it and replace.
   */
  private async insertPreviewAndUpload(file: File) {
    if (this.destroyed) return;

    // const objectUrl = URL.createObjectURL(file);

    try {
      // Update block with preview and upload
      await this.updateBlockWithImage(
        this.uploader?.uploadByFile
          ? async () => this.uploader!.uploadByFile!(file)
          : undefined
      );
    } finally {
      // revoke preview URL
      // URL.revokeObjectURL(objectUrl);
    }
  }
}
