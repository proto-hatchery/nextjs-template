/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import SwitchField from "@workspace/forms/components/base/switch-field";

describe("SwitchField", () => {
  describe("rendering", () => {
    it("renders with label", () => {
      render(<SwitchField label="Enable notifications" />);

      expect(screen.getByText("Enable notifications")).toBeInTheDocument();
    });

    it("renders switch input", () => {
      render(<SwitchField label="Enable notifications" />);

      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(<SwitchField label="Enable notifications" helperText="Receive email notifications" />);

      expect(screen.getByText("Receive email notifications")).toBeInTheDocument();
    });
  });

  describe("checked/unchecked states", () => {
    it("renders unchecked by default", () => {
      render(<SwitchField label="Enable notifications" />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).not.toBeChecked();
    });

    it("renders checked when checked prop is true", () => {
      render(<SwitchField label="Enable notifications" checked />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeChecked();
    });

    it("renders unchecked when checked prop is false", () => {
      render(<SwitchField label="Enable notifications" checked={false} />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).not.toBeChecked();
    });

    it("works with value prop as alias for checked", () => {
      render(<SwitchField label="Enable notifications" value />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeChecked();
    });

    it("works with defaultChecked", () => {
      render(<SwitchField label="Enable notifications" defaultChecked />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeChecked();
    });
  });

  describe("onChange callback", () => {
    it("calls onCheckedChange when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SwitchField label="Enable notifications" onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole("switch");
      await user.click(switchEl);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onChange when clicked (alias)", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SwitchField label="Enable notifications" onChange={handleChange} />);

      const switchEl = screen.getByRole("switch");
      await user.click(switchEl);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onCheckedChange when toggling off", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SwitchField label="Enable notifications" checked onCheckedChange={handleChange} />);

      const switchEl = screen.getByRole("switch");
      await user.click(switchEl);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("calls both onCheckedChange and onChange when clicked", async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      const handleChange = vi.fn();

      render(
        <SwitchField
          label="Enable notifications"
          onCheckedChange={handleCheckedChange}
          onChange={handleChange}
        />,
      );

      const switchEl = screen.getByRole("switch");
      await user.click(switchEl);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      render(<SwitchField label="Enable notifications" disabled />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeDisabled();
    });

    it("sets data-disabled attribute on field", () => {
      render(<SwitchField label="Enable notifications" disabled />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-disabled", "true");
    });

    it("does not call onChange when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SwitchField label="Enable notifications" disabled onChange={handleChange} />);

      const switchEl = screen.getByRole("switch");
      await user.click(switchEl);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("required indicator", () => {
    it("shows required asterisk when required is true", () => {
      const { container } = render(<SwitchField label="Enable notifications" required />);

      // The asterisk is a sibling span within the label
      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).toHaveTextContent("*");
    });

    it("does not show required asterisk when required is false", () => {
      const { container } = render(<SwitchField label="Enable notifications" />);

      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).not.toBeInTheDocument();
    });

    it("sets aria-required when required", () => {
      render(<SwitchField label="Enable notifications" required />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveAttribute("aria-required", "true");
    });
  });

  describe("sizes", () => {
    it("renders with sm size", () => {
      render(<SwitchField label="Enable notifications" size="sm" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "sm");
    });

    it("renders with md size by default", () => {
      render(<SwitchField label="Enable notifications" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "md");
    });

    it("renders with lg size", () => {
      render(<SwitchField label="Enable notifications" size="lg" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "lg");
    });
  });

  describe("label position", () => {
    it("renders with top label position by default", () => {
      render(<SwitchField label="Enable notifications" />);

      const field = document.querySelector('[data-slot="field"]');
      // Default labelPosition is "top", so orientation is not set to "horizontal"
      expect(field).toBeInTheDocument();
    });

    it("renders with side label position", () => {
      render(<SwitchField label="Enable notifications" labelPosition="side" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-orientation", "horizontal");
    });

    it("renders with none label position (sr-only)", () => {
      render(<SwitchField label="Enable notifications" labelPosition="none" />);

      expect(screen.getByText("Enable notifications")).toBeInTheDocument();
    });
  });

  describe("hideLabel", () => {
    it("hides label when hideLabel is true", () => {
      render(<SwitchField label="Enable notifications" hideLabel />);

      expect(screen.queryByText("Enable notifications")).not.toBeInTheDocument();
    });
  });

  describe("side labels", () => {
    it("renders Off/On labels when showSideLabels is true", () => {
      render(<SwitchField label="Enable notifications" showSideLabels />);

      expect(screen.getByText("Off")).toBeInTheDocument();
      expect(screen.getByText("On")).toBeInTheDocument();
    });

    it("renders custom offLabel and onLabel", () => {
      render(
        <SwitchField
          label="Enable notifications"
          showSideLabels
          offLabel="Disabled"
          onLabel="Enabled"
        />,
      );

      expect(screen.getByText("Disabled")).toBeInTheDocument();
      expect(screen.getByText("Enabled")).toBeInTheDocument();
    });

    it("clicking Off label sets switch to unchecked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <SwitchField label="Enable notifications" showSideLabels checked onChange={handleChange} />,
      );

      const offButton = screen.getByText("Off");
      await user.click(offButton);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("clicking On label sets switch to checked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SwitchField label="Enable notifications" showSideLabels onChange={handleChange} />);

      const onButton = screen.getByText("On");
      await user.click(onButton);

      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("error message", () => {
    it("renders error message when provided", () => {
      render(<SwitchField label="Enable notifications" errorMessage="This field is required" />);

      expect(screen.getByRole("alert")).toHaveTextContent("This field is required");
    });

    it("sets aria-invalid when error is present", () => {
      render(<SwitchField label="Enable notifications" errorMessage="Error" />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveAttribute("aria-invalid", "true");
    });

    it("sets data-invalid attribute on field", () => {
      render(<SwitchField label="Enable notifications" errorMessage="Error" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-invalid", "true");
    });
  });

  describe("accessibility", () => {
    it("associates label with switch via htmlFor", () => {
      render(<SwitchField label="Enable notifications" />);

      const switchEl = screen.getByRole("switch");
      const label = document.querySelector(`label[for="${switchEl.id}"]`);
      expect(label).toBeInTheDocument();
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to switch element", () => {
      const ref = createRef<HTMLButtonElement>();
      render(<SwitchField label="Enable notifications" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
