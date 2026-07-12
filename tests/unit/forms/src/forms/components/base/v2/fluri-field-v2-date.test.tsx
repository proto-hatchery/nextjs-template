/* oxlint-disable */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FluriFieldV2Date from "@workspace/forms/components/base/v2/fluri-field-v2-date";

describe("FluriFieldV2Date", () => {
  it("formats raw digits on change", () => {
    const handleValueChange = vi.fn();

    render(<FluriFieldV2Date label="Data" onValueChange={handleValueChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "15051985" } });

    expect(input).toHaveValue("15/05/1985");
    expect(handleValueChange).toHaveBeenLastCalledWith("15/05/1985");
  });

  it("accepts a full formatted value insertion", () => {
    const handleValueChange = vi.fn();

    render(<FluriFieldV2Date label="Data" onValueChange={handleValueChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "15/05/1985" } });

    expect(input).toHaveValue("15/05/1985");
    expect(handleValueChange).toHaveBeenLastCalledWith("15/05/1985");
  });

  it("keeps paste support", () => {
    const handleValueChange = vi.fn();

    render(<FluriFieldV2Date label="Data" onValueChange={handleValueChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "15051985",
      },
    });

    expect(input).toHaveValue("15/05/1985");
    expect(handleValueChange).toHaveBeenLastCalledWith("15/05/1985");
  });
});
