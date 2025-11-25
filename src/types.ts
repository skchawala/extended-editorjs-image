export type UploadResult = {
  success: 1 | 0;
  file?: { url: string };
  error?: string;
};

export type Uploader = {
  uploadByFile?: (file: File) => Promise<UploadResult>;
  uploadByUrl?: (url: string) => Promise<UploadResult>;
};

export type ExtendedImageConfig = {
  // Toolbox title (default: 'Paste Image')
  toolboxTitle?: string;
  // Placeholder for input box (default: 'Paste image URL or paste image here...')
  placeholder?: string;
  // Endpoints for file uploading
  endpoints?: {
    byFile?: string; // Endpoint for file uploading
    byUrl?: string; // Endpoint for uploading by URL
  };
  // Name of uploaded image field in POST request (default: 'image')
  field?: string;
  // Mime-types of files that can be accepted (default: 'image/*')
  types?: string;
  // Object with any data you want to send with uploading requests
  additionalRequestData?: Record<string, any>;
  // Object with any custom headers which will be added to request
  additionalRequestHeaders?: Record<string, string>;
  // Placeholder for Caption input (default: 'Caption')
  captionPlaceholder?: string;
  // Allows to override HTML content of «Select file» button
  buttonContent?: string;
  // Optional custom uploading methods
  uploader?: Uploader;
  // Array with custom actions to show in the tool's settings menu
  actions?: Array<{
    name: string;
    icon: string;
    title: string;
    action: () => void;
  }>;
  // Allows you to enable/disable additional features
  features?: {
    border?: boolean;
    background?: boolean;
    caption?: boolean;
  };
  // Maximum file size in bytes
  maxSizeBytes?: number;
};
