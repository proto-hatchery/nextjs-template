/* oxlint-disable */
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import TextField from "@workspace/forms/components/base/text-field";

describe("TextField", () => {
  describe("rendering", () => {
    it("renders with label", () => {
      render(<TextField label="Name" />);

      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    it("renders input element", () => {
      render(<TextField label="Name" />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(<TextField label="Name" helperText="Enter your full name" />);

      expect(screen.getByText("Enter your full name")).toBeInTheDocument();
    });

    it("renders error message when provided", () => {
      render(<TextField label="Name" errorMessage="Name is required" />);

      expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
    });

    it("does not render helper text when error message is present", () => {
      render(
        <TextField
          label="Name"
          helperText="Enter your full name"
          errorMessage="Name is required"
        />,
      );

      expect(screen.queryByText("Enter your full name")).not.toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it("renders with sm size", () => {
      render(<TextField label="Name" size="sm" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "sm");
    });

    it("renders with md size by default", () => {
      render(<TextField label="Name" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "md");
    });

    it("renders with lg size", () => {
      render(<TextField label="Name" size="lg" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-size", "lg");
    });
  });

  describe("icons", () => {
    it("renders with startIcon", () => {
      render(<TextField label="Name" startIcon="🔍" />);

      expect(screen.getByText("🔍")).toBeInTheDocument();
    });

    it("renders with endIcon", () => {
      render(<TextField label="Name" endIcon="✓" />);

      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("renders with both startIcon and endIcon", () => {
      render(<TextField label="Name" startIcon="🔍" endIcon="✓" />);

      expect(screen.getByText("🔍")).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("renders with React node icons", () => {
      render(
        <TextField
          label="Name"
          startIcon={<span data-testid="start-icon">Start</span>}
          endIcon={<span data-testid="end-icon">End</span>}
        />,
      );

      expect(screen.getByTestId("start-icon")).toBeInTheDocument();
      expect(screen.getByTestId("end-icon")).toBeInTheDocument();
    });
  });

  describe("linkInfo", () => {
    it("renders link info when provided", () => {
      const { container } = render(
        <TextField
          label="Password"
          linkInfo={{
            label: "Forgot password?",
            href: "/forgot-password",
            ariaLabel: "Forgot your password? Click to reset",
          }}
        />,
      );

      // The Link component gets mocked to an <a> element
      const link = container.querySelector('a[href="/forgot-password"]');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent("Forgot password?");
      expect(link).toHaveAttribute("aria-label", "Forgot your password? Click to reset");
    });

    it("does not render link when label is hidden", () => {
      render(
        <TextField
          label="Password"
          hideLabel
          linkInfo={{
            label: "Forgot password?",
            href: "/forgot-password",
            ariaLabel: "Forgot your password? Click to reset",
          }}
        />,
      );

      const link = document.querySelector('a[href="/forgot-password"]');
      expect(link).not.toBeInTheDocument();
    });
  });

  describe("hideLabel", () => {
    it("hides label when hideLabel is true", () => {
      render(<TextField label="Name" hideLabel />);

      // Label should not be visible when hideLabel is true
      expect(screen.queryByText("Name")).not.toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      render(<TextField label="Name" disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("sets data-disabled attribute on field", () => {
      render(<TextField label="Name" disabled />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-disabled", "true");
    });
  });

  describe("required indicator", () => {
    it("shows required asterisk when required is true", () => {
      render(<TextField label="Name" required />);

      // The asterisk is rendered inside the label
      const labelContainer = screen.getByText("Name").parentElement;
      expect(labelContainer).toHaveTextContent(/Name\s*\*/);
    });

    it("does not show required asterisk when required is false", () => {
      render(<TextField label="Name" />);

      const labelContainer = screen.getByText("Name").parentElement;
      expect(labelContainer).toHaveTextContent("Name");
    });
  });

  describe("accessibility", () => {
    it("associates label with input via htmlFor", () => {
      render(<TextField label="Name" />);

      const input = screen.getByRole("textbox");
      const label = document.querySelector(`label[for="${input.id}"]`);
      expect(label).toBeInTheDocument();
    });

    it("sets aria-invalid when error message is present", () => {
      render(<TextField label="Name" errorMessage="Name is required" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid when no error message", () => {
      render(<TextField label="Name" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("sets data-invalid attribute when error message is present", () => {
      render(<TextField label="Name" errorMessage="Error" />);

      const field = document.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute("data-invalid", "true");
    });
  });

  describe("inputRef forwarding", () => {
    it("forwards ref to input element", () => {
      const ref = createRef<HTMLInputElement>();
      render(<TextField label="Name" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("forwards inputRef to input element", () => {
      const ref = createRef<HTMLInputElement>();
      render(<TextField label="Name" inputRef={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("calls function ref", () => {
      const refCallback = vi.fn();
      render(<TextField label="Name" ref={refCallback} />);

      expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });
  });

  describe("interactions", () => {
    it("accepts text input", async () => {
      const user = userEvent.setup();
      render(<TextField label="Name" />);

      const input = screen.getByRole("textbox");
      await user.type(input, "John Doe");

      expect(input).toHaveValue("John Doe");
    });

    it("calls onChange when value changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TextField label="Name" onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "a");

      expect(handleChange).toHaveBeenCalled();
    });

    it("does not accept input when disabled", async () => {
      const user = userEvent.setup();
      render(<TextField label="Name" disabled defaultValue="Initial" />);

      const input = screen.getByRole("textbox");
      await user.type(input, "New text");

      expect(input).toHaveValue("Initial");
    });
  });

  describe("variants", () => {
    it("renders with default variant by default", () => {
      render(<TextField label="Name" />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with ghost variant", () => {
      render(<TextField label="Name" variant="ghost" />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("type attribute", () => {
    it("renders text input by default", () => {
      render(<TextField label="Name" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");
    });

    it("renders password input when type is password", () => {
      render(<TextField label="Password" type="password" />);

      // Password inputs don't have role="textbox" by default
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it("renders email input when type is email", () => {
      render(<TextField label="Email" type="email" />);

      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
    });
  });
});
