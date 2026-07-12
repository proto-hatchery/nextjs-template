import { renderToBuffer } from "@react-pdf/renderer"
import { describe, expect, it } from "vitest"

import { LexicalPdfDocument } from "@workspace/pdf-generator/LexicalPdfRenderer"

describe("LexicalPdfDocument", () => {
  it("renders a basic lexical document to a PDF buffer without a browser", async () => {
    const buffer = await renderToBuffer(
      <LexicalPdfDocument
        editorState={{
          root: {
            children: [
              {
                children: [{ text: "Resumo clínico", type: "text" }],
                type: "paragraph",
              },
            ],
          },
        }}
      />
    )

    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it("renders formatted text (bold)", async () => {
    const buffer = await renderToBuffer(
      <LexicalPdfDocument
        editorState={{
          root: {
            children: [
              {
                children: [{ text: "Bold text", type: "text", format: 1 }],
                type: "paragraph",
              },
            ],
          },
        }}
      />
    )

    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it("renders a heading", async () => {
    const buffer = await renderToBuffer(
      <LexicalPdfDocument
        editorState={{
          root: {
            children: [
              {
                children: [{ text: "Heading", type: "text" }],
                tag: "h1",
                type: "heading",
              },
            ],
          },
        }}
      />
    )

    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it("renders a list", async () => {
    const buffer = await renderToBuffer(
      <LexicalPdfDocument
        editorState={{
          root: {
            children: [
              {
                children: [
                  {
                    children: [{ text: "Item 1", type: "text" }],
                    type: "listitem",
                  },
                ],
                listType: "bullet",
                type: "list",
              },
            ],
          },
        }}
      />
    )

    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it("renders error state for invalid input", async () => {
    const buffer = await renderToBuffer(
      <LexicalPdfDocument editorState={null as never} />
    )

    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it("renders ABNT format", async () => {
    const buffer = await renderToBuffer(
      <LexicalPdfDocument
        editorState={{
          root: {
            children: [
              {
                children: [{ text: "Documento ABNT", type: "text" }],
                type: "paragraph",
              },
            ],
          },
        }}
        format="abnt"
      />
    )

    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it("renders from JSON string", async () => {
    const state = JSON.stringify({
      root: {
        children: [
          {
            children: [{ text: "From string", type: "text" }],
            type: "paragraph",
          },
        ],
      },
    })

    const buffer = await renderToBuffer(
      <LexicalPdfDocument editorState={state} />
    )

    expect(buffer.byteLength).toBeGreaterThan(0)
  })
})
