import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { FloatingPointAmountInput } from "./floating-point-money-input.component";

function ControlledHarness() {
  const [value, setValue] = useState(0);

  return (
    <div>
      <label htmlFor="amount">Valor</label>
      <FloatingPointAmountInput id="amount" name="amount" value={value} onChange={setValue} />
      <output data-testid="amount-value">{value.toFixed(2)}</output>
    </div>
  );
}

describe("FloatingPointAmountInput", () => {
  it("supports keyboard entry for human users", async () => {
    const user = userEvent.setup();

    render(<ControlledHarness />);

    const input = screen.getByRole("textbox", { name: "Valor" });
    await user.click(input);
    await user.keyboard("150");

    expect(screen.getByTestId("amount-value").textContent).toBe("150.00");
    expect((input as HTMLInputElement).value).toBe("150");
  });

  it("supports programmatic fill via change events", () => {
    render(<ControlledHarness />);

    const input = screen.getByRole("textbox", { name: "Valor" });
    fireEvent.change(input, { target: { value: "15000" } });

    expect(screen.getByTestId("amount-value").textContent).toBe("150.00");
    expect((input as HTMLInputElement).value).toBe("150.00");
  });

  it("propagates blur for form libraries", async () => {
    const user = userEvent.setup();
    let blurred = false;

    render(
      <div>
        <label htmlFor="amount">Valor</label>
        <FloatingPointAmountInput
          id="amount"
          name="amount"
          onBlur={() => {
            blurred = true;
          }}
        />
      </div>,
    );

    const input = screen.getByRole("textbox", { name: "Valor" });
    await user.click(input);
    await user.tab();

    expect(blurred).toBe(true);
  });
});
