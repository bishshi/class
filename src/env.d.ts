/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_TYPESENSE_HOST?: string;
  readonly PUBLIC_TYPESENSE_PORT?: string;
  readonly PUBLIC_TYPESENSE_PROTOCOL?: "http" | "https";
  readonly PUBLIC_TYPESENSE_SEARCH_API_KEY?: string;
  readonly PUBLIC_TYPESENSE_COLLECTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
