import { Document, Page, Text, View, Link, Image } from "@react-pdf/renderer";
import { styles, abntStyles } from "./styles";

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  tag?: string;
  format?: number | string;
  style?: string;
  url?: string;
  listType?: "bullet" | "number" | "check";
  checked?: boolean;
  value?: number;
  indent?: number;
}

interface LexicalRoot {
  root: {
    children: LexicalNode[];
  };
}

interface LexicalPdfRendererProps {
  editorState: string | LexicalRoot; // JSON string or object
  letterheadUrl?: string | null;
  format?: "abnt" | "standard";
}

const IS_BOLD = 1;
const IS_ITALIC = 1 << 1;
const IS_STRIKETHROUGH = 1 << 2;
const IS_UNDERLINE = 1 << 3;

interface PdfStyles {
  bold: { fontWeight: string };
  italic: { fontStyle: string };
  strikethrough: { textDecoration: string };
  underline: { textDecoration: string };
  link: { color: string; textDecoration: string };
  paragraph: { marginBottom?: number; textIndent?: number; textAlign?: string };
  heading1: {
    fontSize: number;
    fontWeight: string;
    marginBottom: number;
    marginTop: number;
    textTransform?: string;
  };
  heading2: { fontSize: number; fontWeight: string; marginBottom: number; marginTop: number };
  heading3: {
    fontSize: number;
    fontWeight: string;
    marginBottom: number;
    marginTop: number;
    fontStyle?: string;
  };
  list: { marginBottom: number; marginLeft: number };
  listItem: { flexDirection: string; marginBottom: number };
  bulletPoint: { width: number; fontSize: number };
  listItemContent: { flex: number };
  quote: {
    borderLeftWidth?: number;
    borderLeftColor?: string;
    paddingLeft?: number;
    marginLeft?: number;
    marginBottom: number;
    fontStyle?: string;
    color?: string;
    fontSize?: number;
    textAlign?: string;
  };
  page: {
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  letterhead: {
    position: string;
    minWidth: string;
    minHeight: string;
    height: string;
    width: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
    zIndex: number;
  };
}

const TextNodeRenderer = ({ node, pdfStyles }: { node: LexicalNode; pdfStyles: PdfStyles }) => {
  const style: { fontWeight?: string; fontStyle?: string; textDecoration?: string } = {};
  if (typeof node.format === "number") {
    if (node.format & IS_BOLD) Object.assign(style, pdfStyles.bold);
    if (node.format & IS_ITALIC) Object.assign(style, pdfStyles.italic);
    if (node.format & IS_STRIKETHROUGH) Object.assign(style, pdfStyles.strikethrough);
    if (node.format & IS_UNDERLINE) Object.assign(style, pdfStyles.underline);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Text style={style as any}>{node.text}</Text>;
};

const LinkNodeRenderer = ({ node, pdfStyles }: { node: LexicalNode; pdfStyles: PdfStyles }) => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link src={node.url || "#"} style={pdfStyles.link as any}>
      {node.children?.map((child, index) => (
        <NodeRenderer key={index} node={child} pdfStyles={pdfStyles} />
      ))}
    </Link>
  );
};

const ParagraphNodeRenderer = ({
  node,
  pdfStyles,
}: {
  node: LexicalNode;
  pdfStyles: PdfStyles;
}) => {
  const style: { marginBottom?: number; textIndent?: number; textAlign?: string } = {
    ...pdfStyles.paragraph,
  };

  if (typeof node.format === "string" && node.format) {
    if (["left", "center", "right", "justify"].includes(node.format)) {
      style.textAlign = node.format;
    }
  }

  if (!node.children || node.children.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Text style={style as any}> </Text>;
  }
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Text style={style as any}>
      {node.children.map((child, index) => (
        <NodeRenderer key={index} node={child} pdfStyles={pdfStyles} />
      ))}
    </Text>
  );
};

const HeadingNodeRenderer = ({ node, pdfStyles }: { node: LexicalNode; pdfStyles: PdfStyles }) => {
  let style: {
    fontSize: number;
    fontWeight: string;
    marginBottom: number;
    marginTop: number;
    textTransform?: string;
    textAlign?: string;
  } = { ...pdfStyles.heading1 };
  if (node.tag === "h2") style = { ...pdfStyles.heading2 };
  if (node.tag === "h3") style = { ...pdfStyles.heading3 };

  if (typeof node.format === "string" && node.format) {
    if (["left", "center", "right", "justify"].includes(node.format)) {
      style.textAlign = node.format;
    }
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Text style={style as any}>
      {node.children?.map((child, index) => (
        <NodeRenderer key={index} node={child} pdfStyles={pdfStyles} />
      ))}
    </Text>
  );
};

const ListNodeRenderer = ({ node, pdfStyles }: { node: LexicalNode; pdfStyles: PdfStyles }) => {
  return (
    <View style={pdfStyles.list}>
      {node.children?.map((child, index) => (
        <NodeRenderer
          key={index}
          node={child}
          {...(node.listType !== undefined ? { listType: node.listType } : {})}
          index={index}
          pdfStyles={pdfStyles}
        />
      ))}
    </View>
  );
};

const ListItemNodeRenderer = ({
  node,
  listType,
  index,
  pdfStyles,
}: {
  node: LexicalNode;
  listType?: string;
  index?: number;
  pdfStyles: PdfStyles;
}) => {
  const bullet = listType === "number" ? `${(index || 0) + 1}.` : "•";

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <View style={pdfStyles.listItem as any}>
      <Text style={pdfStyles.bulletPoint}>{bullet}</Text>
      <View style={pdfStyles.listItemContent}>
        <Text>
          {node.children?.map((child, i) => (
            <NodeRenderer key={i} node={child} pdfStyles={pdfStyles} />
          ))}
        </Text>
      </View>
    </View>
  );
};

const QuoteNodeRenderer = ({ node, pdfStyles }: { node: LexicalNode; pdfStyles: PdfStyles }) => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <View style={pdfStyles.quote as any}>
      <Text>
        {node.children?.map((child, index) => (
          <NodeRenderer key={index} node={child} pdfStyles={pdfStyles} />
        ))}
      </Text>
    </View>
  );
};

const NodeRenderer = ({
  node,
  listType,
  index,
  pdfStyles,
}: {
  node: LexicalNode;
  listType?: string;
  index?: number;
  pdfStyles: PdfStyles;
}) => {
  switch (node.type) {
    case "text":
      return <TextNodeRenderer node={node} pdfStyles={pdfStyles} />;
    case "link":
      return <LinkNodeRenderer node={node} pdfStyles={pdfStyles} />;
    case "paragraph":
      return <ParagraphNodeRenderer node={node} pdfStyles={pdfStyles} />;
    case "heading":
      return <HeadingNodeRenderer node={node} pdfStyles={pdfStyles} />;
    case "list":
      return <ListNodeRenderer node={node} pdfStyles={pdfStyles} />;
    case "listitem":
      return (
        <ListItemNodeRenderer
          node={node}
          {...(listType !== undefined ? { listType } : {})}
          {...(index !== undefined ? { index } : {})}
          pdfStyles={pdfStyles}
        />
      );
    case "quote":
      return <QuoteNodeRenderer node={node} pdfStyles={pdfStyles} />;
    default:
      // Fallback for unknown nodes, try to render children
      if (node.children) {
        return (
          <View>
            {node.children.map((child, i) => (
              <NodeRenderer key={i} node={child} pdfStyles={pdfStyles} />
            ))}
          </View>
        );
      }
      return null;
  }
};

const decodeEditorState = (state: string): string => {
  try {
    JSON.parse(state);
    return state;
  } catch {
    try {
      if (typeof window === "undefined") {
        return Buffer.from(state, "base64").toString("utf-8");
      } else {
        return window.atob(state);
      }
    } catch {
      return state;
    }
  }
};

export const LexicalPdfDocument = ({
  editorState,
  letterheadUrl,
  format = "standard",
}: LexicalPdfRendererProps) => {
  let root: LexicalRoot["root"];
  const currentStyles = format === "abnt" ? abntStyles : styles;

  try {
    if (!editorState) {
      throw new Error("editorState is null or undefined");
    }

    if (typeof editorState === "string") {
      const decoded = decodeEditorState(editorState);
      const parsed = JSON.parse(decoded);
      root = parsed.root;
    } else {
      root = editorState.root || editorState;
    }

    if (!root) {
      throw new Error("Root node not found in editorState");
    }
    if (!root.children) {
      throw new Error("Root node has no children");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <Document>
        <Page style={currentStyles.page}>
          <Text>Error parsing document: {errorMessage}</Text>
          <Text style={{ fontSize: 10, marginTop: 10 }}>Type: {typeof editorState}</Text>
        </Page>
      </Document>
    );
  }

  const renderChildren = (children: LexicalNode[]) => {
    const rendered: React.ReactNode[] = [];

    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      const nextNode = children[i + 1];

      if (!node) continue;

      if (node.type === "heading" && nextNode) {
        rendered.push(
          <View key={i} wrap={false}>
            <NodeRenderer node={node} pdfStyles={currentStyles} />
            <NodeRenderer node={nextNode} pdfStyles={currentStyles} />
          </View>,
        );
        i++; // Skip next node since we just rendered it
      } else {
        rendered.push(<NodeRenderer key={i} node={node} pdfStyles={currentStyles} />);
      }
    }
    return rendered;
  };

  return (
    <Document>
      <Page style={currentStyles.page}>
        {letterheadUrl && <Image src={letterheadUrl} style={currentStyles.letterhead} fixed />}
        {renderChildren(root.children)}
      </Page>
    </Document>
  );
};
