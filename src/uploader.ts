import type { Uploader, UploadResult } from "./types";

export interface UploaderConfig {
  byFileEndpoint?: string; // Endpoint for file upload
  byUrlEndpoint?: string; // Endpoint for URL upload
  headers?: Record<string, string>;
  fieldName?: string; // FormData field name for file upload (default: 'image')
  urlFieldName?: string; // Field name for URL upload (default: 'url')
  additionalRequestData?: Record<string, any>; // Additional data to send with requests
}

/**
 * Utility class for uploading images via HTTP endpoint
 */
export class UploaderUtil implements Uploader {
  private config: UploaderConfig;

  constructor(config: UploaderConfig) {
    if (!config.byFileEndpoint && !config.byUrlEndpoint) {
      throw new Error(
        "UploaderUtil: at least one endpoint (byFileEndpoint or byUrlEndpoint) is required"
      );
    }
    this.config = {
      fieldName: "image",
      urlFieldName: "url",
      ...config,
    };
  }

  /**
   * Upload a file to the endpoint
   */
  async uploadByFile(file: File): Promise<UploadResult> {
    if (!this.config.byFileEndpoint) {
      return {
        success: 0,
        error: "File upload endpoint not configured",
      };
    }

    try {
      const formData = new FormData();
      formData.append(this.config.fieldName!, file);

      // Add additional request data to FormData
      if (this.config.additionalRequestData) {
        Object.entries(this.config.additionalRequestData).forEach(
          ([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(
                key,
                typeof value === "string" ? value : JSON.stringify(value)
              );
            }
          }
        );
      }

      const response = await fetch(this.config.byFileEndpoint, {
        method: "POST",
        headers: this.config.headers,
        body: formData,
      });

      if (!response.ok) {
        return {
          success: 0,
          error: `Upload failed with status: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();

      // Handle different response formats
      if (data.url || data.file?.url || data.data?.url) {
        return {
          success: 1,
          file: {
            url: data.url || data.file?.url || data.data?.url,
          },
        };
      }

      // If response doesn't match expected format, return error
      return {
        success: 0,
        error: "Invalid response format: missing url field",
      };
    } catch (error) {
      return {
        success: 0,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Upload an image by URL (server fetches the image)
   */
  async uploadByUrl(url: string): Promise<UploadResult> {
    if (!this.config.byUrlEndpoint) {
      return {
        success: 0,
        error: "URL upload endpoint not configured",
      };
    }

    try {
      const bodyData: Record<string, any> = {
        [this.config.urlFieldName!]: url,
        ...this.config.additionalRequestData,
      };

      const body = JSON.stringify(bodyData);

      const response = await fetch(this.config.byUrlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
        },
        body,
      });

      if (!response.ok) {
        return {
          success: 0,
          error: `Upload failed with status: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();

      // Handle different response formats
      if (data.url || data.file?.url || data.data?.url) {
        return {
          success: 1,
          file: {
            url: data.url || data.file?.url || data.data?.url,
          },
        };
      }

      // If response doesn't match expected format, return error
      return {
        success: 0,
        error: "Invalid response format: missing url field",
      };
    } catch (error) {
      return {
        success: 0,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
