/* oxlint-disable */
import { describe, expect, it } from "vitest";

import { abntStyles, styles } from "@workspace/pdf-generator/styles";

describe("styles", () => {
  it("exports standard styles", () => {
    expect(styles.page).toBeDefined();
    expect(styles.page.fontFamily).toBe("Helvetica");
    expect(styles.paragraph).toBeDefined();
    expect(styles.heading1).toBeDefined();
    expect(styles.heading2).toBeDefined();
    expect(styles.heading3).toBeDefined();
    expect(styles.list).toBeDefined();
    expect(styles.bold).toBeDefined();
    expect(styles.italic).toBeDefined();
    expect(styles.underline).toBeDefined();
    expect(styles.strikethrough).toBeDefined();
    expect(styles.link).toBeDefined();
    expect(styles.quote).toBeDefined();
    expect(styles.letterhead).toBeDefined();
  });
});

describe("abntStyles", () => {
  it("exports ABNT styles", () => {
    expect(abntStyles.page).toBeDefined();
    expect(abntStyles.page.fontFamily).toBe("Times-Roman");
    expect(abntStyles.page.fontSize).toBe(12);
    expect(abntStyles.paragraph).toBeDefined();
    expect(abntStyles.paragraph.textIndent).toBe(35);
    expect(abntStyles.paragraph.textAlign).toBe("justify");
    expect(abntStyles.heading1).toBeDefined();
    expect(abntStyles.heading1.textTransform).toBe("uppercase");
    expect(abntStyles.heading3).toBeDefined();
    expect(abntStyles.heading3.fontStyle).toBe("italic");
  });
});
