/* oxlint-disable */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { V2InputFieldBinding } from "@workspace/forms/v2/rhf";
import { FluriFieldV2Birthdate } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";

describe("FluriFieldV2Birthdate", () => {
  it("emits ISO values for complete raw digit input", () => {
    const handleChange = vi.fn();

    render(<FluriFieldV2Birthdate label="Nascimento" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "15051985" } });

    expect(input).toHaveValue("15/05/1985");
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls.at(-1)?.[0].target.value).toBe("1985-05-15");
  });

  it("supports RHF-style field bindings for formatted full values", () => {
    const handleValueChange = vi.fn();
    const field: V2InputFieldBinding = {
      name: "birthDate",
      onValueChange: handleValueChange,
      value: "",
    };

    render(<FluriFieldV2Birthdate label="Nascimento" field={field} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "15/05/1985" } });

    expect(input).toHaveValue("15/05/1985");
    expect(handleValueChange).toHaveBeenLastCalledWith("1985-05-15");
  });

  it("keeps partial input in display format while editing", () => {
    const handleChange = vi.fn();

    render(<FluriFieldV2Birthdate label="Nascimento" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1505" } });

    expect(input).toHaveValue("15/05");
    expect(handleChange.mock.calls.at(-1)?.[0].target.value).toBe("15/05");
  });
});
