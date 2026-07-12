import { StyleSheet } from "@react-pdf/renderer";

// Register fonts if needed, for now using standard fonts
// Font.register({ family: 'Inter', src: '...' });

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#000000",
  },
  paragraph: {
    marginBottom: 10,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
  },
  heading2: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  heading3: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
  },
  list: {
    marginBottom: 10,
    marginLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    width: 15,
    fontSize: 11,
  },
  listItemContent: {
    flex: 1,
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecoration: "underline",
  },
  strikethrough: {
    textDecoration: "line-through",
  },
  link: {
    color: "blue",
    textDecoration: "underline",
  },
  quote: {
    borderLeftWidth: 2,
    borderLeftColor: "#E5E7EB",
    paddingLeft: 10,
    marginLeft: 0,
    marginBottom: 10,
    fontStyle: "italic",
    color: "#374151",
  },
  letterhead: {
    position: "absolute",
    minWidth: "100%",
    minHeight: "100%",
    height: "100%",
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});

export const abntStyles = StyleSheet.create({
  page: {
    paddingTop: 85, // 3cm
    paddingBottom: 57, // 2cm
    paddingLeft: 85, // 3cm
    paddingRight: 57, // 2cm
    fontFamily: "Times-Roman", // Standard PDF font close to Times New Roman
    fontSize: 12,
    lineHeight: 1.5,
    color: "#000000",
  },
  paragraph: {
    marginBottom: 0, // ABNT usually doesn't have space between paragraphs if indented
    textIndent: 35, // 1.25cm
    textAlign: "justify",
  },
  heading1: {
    fontSize: 12, // ABNT keeps same size, just bold
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
    textTransform: "uppercase",
  },
  heading2: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
  },
  heading3: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
    fontStyle: "italic",
  },
  list: {
    marginBottom: 10,
    marginLeft: 35, // 1.25cm
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    width: 15,
    fontSize: 12,
  },
  listItemContent: {
    flex: 1,
  },
  // ... reuse other styles or override as needed
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecoration: "underline",
  },
  strikethrough: {
    textDecoration: "line-through",
  },
  link: {
    color: "blue",
    textDecoration: "underline",
  },
  quote: {
    marginLeft: 113, // 4cm
    fontSize: 10,
    marginBottom: 10,
    textAlign: "justify",
  },
  letterhead: {
    position: "absolute",
    minWidth: "100%",
    minHeight: "100%",
    height: "100%",
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});
