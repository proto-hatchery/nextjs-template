/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import CheckboxField from "@workspace/forms/components/base/checkbox-field";

describe("CheckboxField", () => {
  describe("rendering", () => {
    it("renders with label", () => {
      render(<CheckboxField label="Accept terms" />);

      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("renders checkbox input", () => {
      render(<CheckboxField label="Accept terms" />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(<CheckboxField label="Accept terms" helperText="Please read the terms first" />);

      expect(screen.getByText("Please read the terms first")).toBeInTheDocument();
    });
  });

  describe("checked/unchecked states", () => {
    it("renders unchecked by default", () => {
      render(<CheckboxField label="Accept terms" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("renders checked when checked prop is true", () => {
      render(<CheckboxField label="Accept terms" checked />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("renders unchecked when checked prop is false", () => {
      render(<CheckboxField label="Accept terms" checked={false} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("works with value prop as alias for checked", () => {
      render(<CheckboxField label="Accept terms" value />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("renders indeterminate state when checked is indeterminate", () => {
      render(<CheckboxField label="Accept terms" checked="indeterminate" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-state", "indeterminate");
    });

    it("works with defaultChecked", () => {
      render(<CheckboxField label="Accept terms" defaultChecked />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  describe("onChange callback", () => {
    it("calls onCheckedChange when clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<CheckboxField label="Accept terms" onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onChange when clicked (alias)", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<CheckboxField label="Accept terms" onChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onCheckedChange when unchecking", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<CheckboxField label="Accept terms" checked onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("calls both onCheckedChange and onChange when clicked", async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();
      const handleChange = vi.fn();

      render(
        <CheckboxField
          label="Accept terms"
          onCheckedChange={handleCheckedChange}
          onChange={handleChange}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("error message", () => {
    it("renders error message when provided", () => {
      render(<CheckboxField label="Accept terms" errorMessage="You must accept the terms" />);

      expect(screen.getByRole("alert")).toHaveTextContent("You must accept the terms");
    });

    it("does not render helper text when error is present", () => {
      render(
        <CheckboxField
          label="Accept terms"
          helperText="Please read the terms"
          errorMessage="You must accept"
        />,
      );

      expect(screen.queryByText("Please read the terms")).not.toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("sets aria-invalid when error is present", () => {
      render(<CheckboxField label="Accept terms" errorMessage="Error" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-invalid", "true");
    });

    it("sets data-invalid attribute on field", () => {
      render(<CheckboxField label="Accept terms" errorMessage="Error" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-invalid", "true");
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      render(<CheckboxField label="Accept terms" disabled />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("sets data-disabled attribute on field", () => {
      render(<CheckboxField label="Accept terms" disabled />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-disabled", "true");
    });

    it("does not call onChange when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<CheckboxField label="Accept terms" disabled onChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("required indicator", () => {
    it("shows required asterisk when required is true", () => {
      const { container } = render(<CheckboxField label="Accept terms" required />);

      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).toHaveTextContent("*");
    });

    it("does not show required asterisk when required is false", () => {
      const { container } = render(<CheckboxField label="Accept terms" />);

      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).not.toBeInTheDocument();
    });

    it("sets aria-required when required", () => {
      render(<CheckboxField label="Accept terms" required />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-required", "true");
    });
  });

  describe("sizes", () => {
    it("renders with sm size", () => {
      render(<CheckboxField label="Accept terms" size="sm" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "sm");
    });

    it("renders with md size by default", () => {
      render(<CheckboxField label="Accept terms" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "md");
    });

    it("renders with lg size", () => {
      render(<CheckboxField label="Accept terms" size="lg" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "lg");
    });
  });

  describe("label position", () => {
    it("renders with side label position by default", () => {
      render(<CheckboxField label="Accept terms" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-orientation", "horizontal");
    });

    it("renders with top label position", () => {
      render(<CheckboxField label="Accept terms" labelPosition="top" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-orientation", "vertical");
    });
  });

  describe("hideLabel", () => {
    it("hides label when hideLabel is true", () => {
      render(<CheckboxField label="Accept terms" hideLabel />);

      expect(screen.queryByText("Accept terms")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("associates label with checkbox via htmlFor", () => {
      render(<CheckboxField label="Accept terms" />);

      const checkbox = screen.getByRole("checkbox");
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      expect(label).toBeInTheDocument();
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to checkbox element", () => {
      const ref = createRef<HTMLButtonElement>();
      render(<CheckboxField label="Accept terms" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
