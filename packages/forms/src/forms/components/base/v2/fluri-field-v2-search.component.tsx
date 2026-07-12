"use client";

import { FluriFieldV2Input, type FluriFieldV2InputProps } from "./fluri-field-v2-input.component";
import { cn } from "@workspace/ui/lib/utils";

type FluriFieldV2SearchProps = Omit<FluriFieldV2InputProps, "type">;

const FluriFieldV2Search = ({
  label = "Buscar",
  placeholder = "Buscar...",
  className,
  ...props
}: FluriFieldV2SearchProps) => {
  return (
    <FluriFieldV2Input
      label={label}
      type="search"
      placeholder={placeholder}
      className={cn(
        /* Remove native browser search clear button (Chrome/Safari blue X) */
        "[&::-webkit-search-cancel-button]:[-webkit-appearance:none] [&::-webkit-search-cancel-button]:appearance-none",
        "[&::-webkit-search-decoration]:[-webkit-appearance:none] [&::-webkit-search-decoration]:appearance-none",
        className,
      )}
      {...props}
    />
  );
};

export { FluriFieldV2Search };
export default FluriFieldV2Search;
