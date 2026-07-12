/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandButton } from "@workspace/brand/components/brand-button";

describe("BrandButton", () => {
  it("renders", () => {
    render(<BrandButton>Click me</BrandButton>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("forwards disabled", () => {
    render(<BrandButton disabled>Click me</BrandButton>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDisabled();
  });

  it("supports primary variant", () => {
    render(<BrandButton variant="primary">Primary</BrandButton>);
    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
  });

  it("supports secondary variant", () => {
    render(<BrandButton variant="secondary">Secondary</BrandButton>);
    expect(screen.getByRole("button", { name: "Secondary" })).toBeInTheDocument();
  });

  it("supports flat variant mapping", () => {
    render(<BrandButton variant="flat">Flat</BrandButton>);
    expect(screen.getByRole("button", { name: "Flat" })).toBeInTheDocument();
  });

  it("supports ghost variant", () => {
    render(<BrandButton variant="ghost">Ghost</BrandButton>);
    expect(screen.getByRole("button", { name: "Ghost" })).toBeInTheDocument();
  });

  it("supports link variant", () => {
    render(<BrandButton variant="link">Link</BrandButton>);
    expect(screen.getByRole("button", { name: "Link" })).toBeInTheDocument();
  });

  it("supports size pass-through", () => {
    render(<BrandButton size="small">Small</BrandButton>);
    expect(screen.getByRole("button", { name: "Small" })).toBeInTheDocument();
  });

  it("normalizes legacy size values", () => {
    render(<BrandButton size="sm">SM</BrandButton>);
    expect(screen.getByRole("button", { name: "SM" })).toBeInTheDocument();
  });

  it("applies className pass-through", () => {
    render(<BrandButton className="my-class">Styled</BrandButton>);
    expect(screen.getByRole("button", { name: "Styled" })).toHaveClass("my-class");
  });

  it("renders right icon", () => {
    render(
      <BrandButton rightIcon={<span data-testid="icon">★</span>}>
        With Icon
      </BrandButton>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("supports fullWidth", () => {
    render(<BrandButton fullWidth>Full</BrandButton>);
    expect(screen.getByRole("button", { name: "Full" })).toBeInTheDocument();
  });

  it("supports rounded family", () => {
    render(<BrandButton family="rounded">Rounded</BrandButton>);
    expect(screen.getByRole("button", { name: "Rounded" })).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<BrandButton ref={ref}>Ref</BrandButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
