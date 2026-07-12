/* oxlint-disable */
import { Button } from "@workspace/ui/components/button";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { getV2InputProps, getV2PatientProps, getV2SelectProps } from "@workspace/forms/v2/rhf/mappers";
import { useV2ControllerField } from "@workspace/forms/v2/rhf/use-v2-controller-field";

type FormValues = {
  name: string;
  patientId: string;
};

const FieldHarness = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      name: "",
      patientId: "",
    },
  });

  const nameController = useV2ControllerField({
    control: methods.control,
    name: "name",
    mode: "string",
  });

  const patientController = useV2ControllerField({
    control: methods.control,
    name: "patientId",
    mode: "optional-select",
  });

  const nameProps = getV2InputProps(nameController.contract);
  const patientProps = getV2SelectProps(patientController.contract);
  const patientFieldProps = getV2PatientProps(patientController.contract);

  useEffect(() => {
    methods.setFocus("name");
  }, [methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <input
          data-testid="name"
          ref={nameProps.ref}
          name={nameProps.name}
          value={nameProps.value}
          onChange={(event) => nameProps.onValueChange(event.target.value)}
          onBlur={nameProps.onBlur}
        />

        <Button
          type="button"
          data-testid="set-patient"
          onClick={() => patientProps.onValueChange("patient_123")}
        >
          set patient
        </Button>

        <Button
          type="button"
          data-testid="clear-patient"
          onClick={() => patientProps.onValueChange(undefined)}
        >
          clear patient
        </Button>

        <Button
          type="button"
          data-testid="clear-patient-field"
          onClick={() => patientFieldProps.onValueChange("")}
        >
          clear patient field
        </Button>

        <Button type="submit">submit</Button>
      </form>
    </FormProvider>
  );
};

describe("v2 rhf wiring", () => {
  it("wires value/onBlur/ref and optional select semantics", async () => {
    const onSubmit = vi.fn();

    render(<FieldHarness onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("name");

    await waitFor(() => {
      expect(document.activeElement).toBe(nameInput);
    });

    fireEvent.change(nameInput, { target: { value: "Noa" } });
    fireEvent.blur(nameInput);

    fireEvent.click(screen.getByTestId("set-patient"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          name: "Noa",
          patientId: "patient_123",
        },
        expect.anything(),
      );
    });

    fireEvent.click(screen.getByTestId("clear-patient"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenLastCalledWith(
        {
          name: "Noa",
          patientId: "",
        },
        expect.anything(),
      );
    });

    fireEvent.click(screen.getByTestId("set-patient"));
    fireEvent.click(screen.getByTestId("clear-patient-field"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenLastCalledWith(
        {
          name: "Noa",
          patientId: "",
        },
        expect.anything(),
      );
    });
  });
});
