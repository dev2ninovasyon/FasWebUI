// src/types/html-docx-global.d.ts
export {};

declare global {
  interface Window {
    htmlDocx?: {
      asBlob: (html: string, options?: any) => Blob;
    };
  }
}
