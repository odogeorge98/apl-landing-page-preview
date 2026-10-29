"use client";

import { useState } from "react";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";

const SelectInput = ({
  options,
  isEmpty,
  firstItem,
}: {
  options: string[];
  isEmpty: boolean;
  firstItem?: string;
}) => {
  const [selectedValue, setSelectedValue] = useState(
    firstItem !== undefined ? "" : options[0] ?? "",
  );
  const hasPlaceholder = firstItem !== undefined;
  const availableValue =
    (hasPlaceholder && selectedValue === "") || options.includes(selectedValue)
      ? selectedValue
      : options[0] ?? "";
  const selectOptions = [
    ...(hasPlaceholder ? [{ value: "", label: firstItem ?? "" }] : []),
    ...options.map((option) => ({ value: option, label: option })),
  ];

  return (
    <AnimatedSelect
      ariaLabel={firstItem || "Select an option"}
      value={availableValue}
      options={selectOptions}
      onChange={setSelectedValue}
      disabled={isEmpty || selectOptions.length === 0}
      className="w-full justify-between"
    />
  );
};

export default SelectInput;
