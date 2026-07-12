/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { SelectItem } from "@workspace/ui/components/select";
import SelectField from "@workspace/forms/components/base/select-field";

describe("SelectField", () => {
  const defaultOptions = (
    <>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
      <SelectItem value="option3">Option 3</SelectItem>
    </>
  );

  describe("rendering", () => {
    it("renders with label", () => {
      render(<SelectField label="Choose an option">{defaultOptions}</SelectField>);

      expect(screen.getByText("Choose an option")).toBeInTheDocument();
    });

    it("renders trigger button", () => {
      render(<SelectField label="Choose an option">{defaultOptions}</SelectField>);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders with placeholder text", () => {
      render(
        <SelectField label="Choose an option" placeholder="Select something">
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.getByText("Select something")).toBeInTheDocument();
    });

    it("renders with default placeholder", () => {
      render(<SelectField label="Choose an option">{defaultOptions}</SelectField>);

      expect(screen.getByText("Selecione uma opção")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(
        <SelectField label="Choose an option" helperText="Select your preferred option">
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.getByText("Select your preferred option")).toBeInTheDocument();
    });
  });

  describe("selecting a value", () => {
    it("calls onValueChange when value changes", () => {
      const handleValueChange = vi.fn();

      const { rerender } = render(
        <SelectField label="Choose an option" onValueChange={handleValueChange}>
          {defaultOptions}
        </SelectField>,
      );

      rerender(
        <SelectField label="Choose an option" onValueChange={handleValueChange} value="option2">
          {defaultOptions}
        </SelectField>,
      );

      expect(handleValueChange).not.toHaveBeenCalled();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("displays selected value", () => {
      render(
        <SelectField label="Choose an option" value="option2">
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("works with defaultValue", () => {
      render(
        <SelectField label="Choose an option" defaultValue="option1">
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("renders error message when provided", () => {
      render(
        <SelectField label="Choose an option" errorMessage="Please select an option">
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.getByRole("alert")).toHaveTextContent("Please select an option");
    });

    it("does not render helper text when error is present", () => {
      render(
        <SelectField
          label="Choose an option"
          helperText="Select an option"
          errorMessage="Please select an option"
        >
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.queryByText("Select an option")).not.toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("sets aria-invalid when error is present", () => {
      render(
        <SelectField label="Choose an option" errorMessage="Error">
          {defaultOptions}
        </SelectField>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-invalid", "true");
    });

    it("sets data-invalid attribute on field", () => {
      render(
        <SelectField label="Choose an option" errorMessage="Error">
          {defaultOptions}
        </SelectField>,
      );

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-invalid", "true");
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      render(
        <SelectField label="Choose an option" disabled>
          {defaultOptions}
        </SelectField>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeDisabled();
    });

    it("sets data-disabled attribute on field", () => {
      render(
        <SelectField label="Choose an option" disabled>
          {defaultOptions}
        </SelectField>,
      );

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-disabled", "true");
    });

    it("does not open when clicked while disabled", async () => {
      const user = userEvent.setup();

      render(
        <SelectField label="Choose an option" disabled>
          {defaultOptions}
        </SelectField>,
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      // Options should not be visible
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });
  });

  describe("required indicator", () => {
    it("shows required asterisk when required is true", () => {
      const { container } = render(
        <SelectField label="Choose an option" required>
          {defaultOptions}
        </SelectField>,
      );

      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).toHaveTextContent("*");
    });

    it("does not show required asterisk when required is false", () => {
      const { container } = render(
        <SelectField label="Choose an option">{defaultOptions}</SelectField>,
      );

      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).not.toBeInTheDocument();
    });

    it("sets aria-required on trigger when required", () => {
      render(
        <SelectField label="Choose an option" required>
          {defaultOptions}
        </SelectField>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-required", "true");
    });
  });

  describe("sizes", () => {
    it("renders with sm size", () => {
      render(
        <SelectField label="Choose an option" size="sm">
          {defaultOptions}
        </SelectField>,
      );

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "sm");
    });

    it("renders with md size by default", () => {
      render(<SelectField label="Choose an option">{defaultOptions}</SelectField>);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "md");
    });

    it("renders with lg size", () => {
      render(
        <SelectField label="Choose an option" size="lg">
          {defaultOptions}
        </SelectField>,
      );

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "lg");
    });
  });

  describe("hideLabel", () => {
    it("hides label when hideLabel is true", () => {
      render(
        <SelectField label="Choose an option" hideLabel>
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.queryByText("Choose an option")).not.toBeInTheDocument();
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to select trigger", () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <SelectField label="Choose an option" ref={ref}>
          {defaultOptions}
        </SelectField>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("variants", () => {
    it("renders with default variant by default", () => {
      render(<SelectField label="Choose an option">{defaultOptions}</SelectField>);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders with ghost variant", () => {
      render(
        <SelectField label="Choose an option" variant="ghost">
          {defaultOptions}
        </SelectField>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
