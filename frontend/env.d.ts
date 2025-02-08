/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SESSION_TIME: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
