declare module 'jsqr' {
  export interface QRCode {
    data: string;
    version: number;
    errorCorrectLevel: number;
    maskPattern: number;
    modules: {
      count: number;
      size: number;
      get: (x: number, y: number) => boolean;
    };
  }

  export default function jsQR(
    imageData: Uint8ClampedArray,
    width: number,
    height: number
  ): QRCode | null;
}