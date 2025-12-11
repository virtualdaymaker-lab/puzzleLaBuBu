/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_DEV_MODE?: string;
  readonly VITE_PUZZLE_PRICE?: string;
  // add other VITE_ variables as needed
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
