/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import TextAreaField from "@workspace/forms/components/base/text-area-field";

describe("TextAreaField", () => {
  describe("rendering", () => {
    it("renders with label", () => {
      render(<TextAreaField label="Description" />);

      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("renders textarea element", () => {
      render(<TextAreaField label="Description" />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(<TextAreaField label="Description" helperText="Enter a brief description" />);

      expect(screen.getByText("Enter a brief description")).toBeInTheDocument();
    });

    it("renders error message when provided", () => {
      render(<TextAreaField label="Description" errorMessage="Description is required" />);

      expect(screen.getByRole("alert")).toHaveTextContent("Description is required");
    });

    it("does not render helper text when error message is present", () => {
      render(
        <TextAreaField
          label="Description"
          helperText="Enter a brief description"
          errorMessage="Description is required"
        />,
      );

      expect(screen.queryByText("Enter a brief description")).not.toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("rows prop", () => {
    it("renders with default 4 rows", () => {
      render(<TextAreaField label="Description" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("rows", "4");
    });

    it("renders with custom rows", () => {
      render(<TextAreaField label="Description" rows={8} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("rows", "8");
    });

    it("renders with 2 rows", () => {
      render(<TextAreaField label="Description" rows={2} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("rows", "2");
    });
  });

  describe("resize prop", () => {
    it("allows resize by default", () => {
      render(<TextAreaField label="Description" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("resize-y");
    });

    it("disables resize when resizable is false", () => {
      render(<TextAreaField label="Description" resizable={false} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("resize-none");
    });
  });

  describe("onChange callback", () => {
    it("calls onChange when value changes", async () => {
      const _user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TextAreaField label="Description" onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      await _user.type(textarea, "Hello world");

      expect(handleChange).toHaveBeenCalled();
    });

    it("accepts multiline text input", async () => {
      const user = userEvent.setup();

      render(<TextAreaField label="Description" />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Line 1\nLine 2\nLine 3");

      expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3");
    });
  });

  describe("error message", () => {
    it("renders error message when provided", () => {
      render(<TextAreaField label="Description" errorMessage="Description is too short" />);

      expect(screen.getByRole("alert")).toHaveTextContent("Description is too short");
    });

    it("sets aria-invalid when error is present", () => {
      render(<TextAreaField label="Description" errorMessage="Error" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("sets data-invalid attribute on field", () => {
      render(<TextAreaField label="Description" errorMessage="Error" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-invalid", "true");
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      render(<TextAreaField label="Description" disabled />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
    });

    it("sets data-disabled attribute on field", () => {
      render(<TextAreaField label="Description" disabled />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-disabled", "true");
    });

    it("does not accept input when disabled", async () => {
      const user = userEvent.setup();

      render(<TextAreaField label="Description" disabled defaultValue="Initial" />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "New text");

      expect(textarea).toHaveValue("Initial");
    });
  });

  describe("required indicator", () => {
    it("shows required asterisk when required is true", () => {
      render(<TextAreaField label="Description" required />);

      const label = screen.getByText("Description").parentElement;
      expect(label).toHaveTextContent(/Description\s*\*/);
    });

    it("does not show required asterisk when required is false", () => {
      render(<TextAreaField label="Description" />);

      const label = screen.getByText("Description").parentElement;
      expect(label).toHaveTextContent("Description");
    });
  });

  describe("sizes", () => {
    it("renders with sm size", () => {
      render(<TextAreaField label="Description" size="sm" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "sm");
    });

    it("renders with md size by default", () => {
      render(<TextAreaField label="Description" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "md");
    });

    it("renders with lg size", () => {
      render(<TextAreaField label="Description" size="lg" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "lg");
    });
  });

  describe("hideLabel", () => {
    it("hides label when hideLabel is true", () => {
      render(<TextAreaField label="Description" hideLabel />);

      expect(screen.queryByText("Description")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("associates label with textarea via htmlFor", () => {
      render(<TextAreaField label="Description" />);

      const textarea = screen.getByRole("textbox");
      const label = document.querySelector(`label[for="${textarea.id}"]`);
      expect(label).toBeInTheDocument();
    });

    it("does not set aria-invalid when no error message", () => {
      render(<TextAreaField label="Description" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to textarea element", () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<TextAreaField label="Description" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });

  describe("maxLength counter", () => {
    it("displays character counter when maxLength is provided", () => {
      render(<TextAreaField label="Description" maxLength={100} defaultValue="Hello" />);

      expect(screen.getByText("5/100")).toBeInTheDocument();
    });

    it("updates character counter when value changes", async () => {
      const { rerender } = render(
        <TextAreaField label="Description" maxLength={100} defaultValue="" />,
      );

      expect(screen.getByText("0/100")).toBeInTheDocument();

      rerender(<TextAreaField label="Description" maxLength={100} defaultValue="Test text" />);

      expect(screen.getByText("9/100")).toBeInTheDocument();
    });

    it("does not display counter when maxLength is not provided", () => {
      render(<TextAreaField label="Description" defaultValue="Hello" />);

      expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders with default variant by default", () => {
      render(<TextAreaField label="Description" />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with ghost variant", () => {
      render(<TextAreaField label="Description" variant="ghost" />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("value and defaultValue", () => {
    it("renders with controlled value", () => {
      render(<TextAreaField label="Description" value="Controlled value" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Controlled value");
    });

    it("renders with defaultValue", () => {
      render(<TextAreaField label="Description" defaultValue="Default value" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Default value");
    });
  });
});
