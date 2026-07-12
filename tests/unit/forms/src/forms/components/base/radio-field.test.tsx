/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RadioField from "@workspace/forms/components/base/radio-field";

describe("RadioField", () => {
  const defaultOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  describe("rendering", () => {
    it("renders with label", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} />);

      expect(screen.getByText("Choose an option")).toBeInTheDocument();
    });

    it("renders all options", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} />);

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });

    it("renders radio inputs for all options", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} />);

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(3);
    });

    it("renders with helper text", () => {
      render(
        <RadioField
          label="Choose an option"
          options={defaultOptions}
          helperText="Select one option"
        />,
      );

      expect(screen.getByText("Select one option")).toBeInTheDocument();
    });
  });

  describe("selecting an option", () => {
    it("selects an option when clicked", async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <RadioField
          label="Choose an option"
          options={defaultOptions}
          onValueChange={handleValueChange}
        />,
      );

      const option = screen.getByText("Option 2");
      await user.click(option);

      expect(handleValueChange).toHaveBeenCalledWith("option2");
    });

    it("selects a radio when clicked directly", async () => {
      const user = userEvent.setup();

      render(<RadioField label="Choose an option" options={defaultOptions} />);

      const radios = screen.getAllByRole("radio");
      const secondRadio = radios[1];
      expect(secondRadio).toBeDefined();
      if (!secondRadio) return;

      await user.click(secondRadio);
      expect(secondRadio).toBeChecked();
    });

    it("displays selected value with controlled value prop", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} value="option2" />);

      const radios = screen.getAllByRole("radio");
      expect(radios[1]).toBeChecked();
      expect(radios[0]).not.toBeChecked();
      expect(radios[2]).not.toBeChecked();
    });

    it("works with defaultValue", () => {
      render(
        <RadioField label="Choose an option" options={defaultOptions} defaultValue="option1" />,
      );

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeChecked();
    });
  });

  describe("error message", () => {
    it("renders error message when provided", () => {
      render(
        <RadioField
          label="Choose an option"
          options={defaultOptions}
          errorMessage="Please select an option"
        />,
      );

      expect(screen.getByRole("alert")).toHaveTextContent("Please select an option");
    });

    it("does not render helper text when error is present", () => {
      render(
        <RadioField
          label="Choose an option"
          options={defaultOptions}
          helperText="Select one"
          errorMessage="Please select"
        />,
      );

      expect(screen.queryByText("Select one")).not.toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("sets data-invalid attribute on field", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} errorMessage="Error" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-invalid", "true");
    });
  });

  describe("disabled state", () => {
    it("renders all radios as disabled when disabled prop is true", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} disabled />);

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it("sets data-disabled attribute on field", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} disabled />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-disabled", "true");
    });

    it("does not select when clicked while disabled", async () => {
      const user = userEvent.setup();

      render(<RadioField label="Choose an option" options={defaultOptions} disabled />);

      const radios = screen.getAllByRole("radio");
      const firstRadio = radios[0];
      expect(firstRadio).toBeDefined();
      if (!firstRadio) return;

      await user.click(firstRadio);
      expect(firstRadio).not.toBeChecked();
    });

    it("renders individual disabled options", () => {
      const optionsWithDisabled = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2", disabled: true },
        { value: "option3", label: "Option 3" },
      ];

      render(<RadioField label="Choose an option" options={optionsWithDisabled} />);

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toBeDisabled();
      expect(radios[1]).toBeDisabled();
      expect(radios[2]).not.toBeDisabled();
    });
  });

  describe("required indicator", () => {
    it("shows required asterisk when required is true", () => {
      const { container } = render(
        <RadioField label="Choose an option" options={defaultOptions} required />,
      );

      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).toHaveTextContent("*");
    });

    it("does not show required asterisk when required is false", () => {
      const { container } = render(
        <RadioField label="Choose an option" options={defaultOptions} />,
      );

      const asterisk = container.querySelector('[data-slot="field-label"] .text-destructive');
      expect(asterisk).not.toBeInTheDocument();
    });

    it("sets aria-required on radio group when required", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} required />);

      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveAttribute("aria-required", "true");
    });
  });

  describe("hideLabel", () => {
    it("hides label when hideLabel is true", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} hideLabel />);

      expect(screen.queryByText("Choose an option")).not.toBeInTheDocument();
    });
  });

  describe("orientation", () => {
    it("renders with vertical orientation by default", () => {
      const { container } = render(
        <RadioField label="Choose an option" options={defaultOptions} />,
      );

      // Default variant has space-y-2 for vertical layout
      expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument();
    });

    it("renders with horizontal orientation", () => {
      const { container } = render(
        <RadioField label="Choose an option" options={defaultOptions} orientation="horizontal" />,
      );

      expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders with default variant by default", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} />);

      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("renders with card variant", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} variant="card" />);

      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("renders with inline variant", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} variant="inline" />);

      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });
  });

  describe("option descriptions", () => {
    it("renders option with description", () => {
      const optionsWithDescription = [
        { value: "option1", label: "Option 1", description: "This is option 1" },
        { value: "option2", label: "Option 2" },
      ];

      render(<RadioField label="Choose an option" options={optionsWithDescription} />);

      expect(screen.getByText("This is option 1")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("renders radio group with correct role", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} />);

      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("associates radio group with label via aria-label", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} />);

      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveAttribute("aria-label", "Choose an option");
    });

    it("uses custom aria-label when provided", () => {
      render(
        <RadioField
          label="Choose an option"
          options={defaultOptions}
          aria-label="Custom aria label"
        />,
      );

      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toHaveAttribute("aria-label", "Custom aria label");
    });

    it("associates options with labels via htmlFor", () => {
      render(<RadioField label="Choose an option" options={defaultOptions} />);

      const optionLabel = screen.getByText("Option 1");
      const radio = screen.getAllByRole("radio")[0];
      expect(radio).toBeDefined();
      if (!radio) return;

      expect(optionLabel).toHaveAttribute("for", radio.id);
    });
  });

  describe("onChange callback", () => {
    it("calls onValueChange when selection changes", async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <RadioField
          label="Choose an option"
          options={defaultOptions}
          onValueChange={handleValueChange}
          value="option1"
        />,
      );

      const radios = screen.getAllByRole("radio");
      const secondRadio = radios[1];
      expect(secondRadio).toBeDefined();
      if (!secondRadio) return;

      await user.click(secondRadio);

      expect(handleValueChange).toHaveBeenCalledWith("option2");
    });
  });
});
