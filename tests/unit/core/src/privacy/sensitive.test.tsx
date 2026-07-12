/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrivacyModeProvider } from "@workspace/core/privacy/privacy-provider";
import { Sensitive } from "@workspace/core/privacy/sensitive";

describe("Sensitive", () => {
  it("renders children when privacy mode is visible", () => {
    render(
      <PrivacyModeProvider defaultVisible={true}>
        <Sensitive>Secret Data</Sensitive>
      </PrivacyModeProvider>
    );

    expect(screen.getByText("Secret Data")).toBeInTheDocument();
  });

  it("renders blurred children when privacy mode is hidden", () => {
    render(
      <PrivacyModeProvider defaultVisible={false}>
        <Sensitive>Secret Data</Sensitive>
      </PrivacyModeProvider>
    );

    const element = screen.getByText("Secret Data");
    expect(element).toHaveClass("blur-sensitive");
    expect(element).toHaveAttribute("aria-hidden", "true");
  });

  it("renders redacted dots when variant is redact and hidden", () => {
    render(
      <PrivacyModeProvider defaultVisible={false}>
        <Sensitive variant="redact">Secret Data</Sensitive>
      </PrivacyModeProvider>
    );

    const element = screen.getByText("•••••••••");
    expect(element).toHaveClass("redacted-text");
    expect(element).toHaveAttribute("aria-hidden", "true");
  });

  it("uses custom component via as prop", () => {
    render(
      <PrivacyModeProvider defaultVisible={true}>
        <Sensitive as="div">Secret Data</Sensitive>
      </PrivacyModeProvider>
    );

    expect(screen.getByText("Secret Data").tagName).toBe("DIV");
  });

  it("applies custom className", () => {
    render(
      <PrivacyModeProvider defaultVisible={true}>
        <Sensitive className="custom-class">Secret Data</Sensitive>
      </PrivacyModeProvider>
    );

    expect(screen.getByText("Secret Data")).toHaveClass("custom-class");
  });

  it("uses custom redactedLabel for aria-label", () => {
    render(
      <PrivacyModeProvider defaultVisible={false}>
        <Sensitive variant="redact" redactedLabel="Hidden content">
          Secret Data
        </Sensitive>
      </PrivacyModeProvider>
    );

    expect(screen.getByText("•••••••••")).toHaveAttribute(
      "aria-label",
      "Hidden content"
    );
  });
});
