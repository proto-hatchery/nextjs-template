declare module "*.css" {
  const content: string;
  export default content;
}

// Module marker to satisfy import/unambiguous
export type { _CssModule };
type _CssModule = never;
