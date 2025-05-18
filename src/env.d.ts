/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_API_URL: string
  readonly [key: string]: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Define process.env in the global namespace for compatibility
interface Process {
  env: {
    BASE_URL?: string;
    [key: string]: string | undefined;
  }
}

declare global {
  interface Window {
    process: Process;
  }
  var process: Process;
}
