declare module "*.svg" {
  const content: string;
  export default content;
}

// Module marker to satisfy import/unambiguous
export type { _SvgModule };
type _SvgModule = never;
