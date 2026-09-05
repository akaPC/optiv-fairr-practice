/// <reference types="vite/client" />

declare module 'virtual:business-plan' {
  export const html: string;
  export const sections: Array<{ id: string; text: string; level: number }>;
}
