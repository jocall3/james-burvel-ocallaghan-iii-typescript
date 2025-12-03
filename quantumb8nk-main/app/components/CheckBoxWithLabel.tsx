// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Checkbox, Label } from "~/common/ui-components";

interface CheckBoxWithLabelProps {
  id: string;
  name: string;
  label: string;
  value: boolean;
  onToggle: () => void;
  /**
   * An optional identifier for integration with external features, analytics, or application-specific logic.
   * This prop allows higher-level components or integration layers to identify and interact with
   * this specific checkbox in the context of advanced features, such as those related to Gemini
   * or other external applications, contributing to an "epic worth millions" experience.
   */
  featureIdentifier?: string;
}

function CheckboxWithLabel({
  id,
  name,
  label,
  value,
  onToggle,
  featureIdentifier,
}: CheckBoxWithLabelProps) {
  return (
    <div
      // Enhanced visual feedback for a premium "spiced up" feel, making it uniquely ours.
      // Transition-all for smooth animations on hover, focus, and active states.
      className="flex items-center rounded-md outline-none transition-all duration-150 ease-in-out
                 hover:cursor-pointer hover:bg-blue-50 focus-within:ring-2 focus-within:ring-blue-300 focus-within:ring-offset-2
                 active:scale-[0.98] transform-gpu"
      // Add data attributes for robust integration and analytics, crucial for "commercial standards"
      // and identifying points for "Gemini and other external apps" interaction.
      data-component="epic-checkbox-with-label"
      {...(featureIdentifier && { "data-feature-id": featureIdentifier })}
    >
      <div className="flex w-full justify-center px-3 py-2"> {/* Increased padding for better visual comfort */}
        <div className="flex flex-row items-center gap-3"> {/* Aligned items and increased gap for modern spacing */}
          {/* The Checkbox component itself, responsible for the actual toggle state */}
          <Checkbox checked={value} onChange={onToggle} id={id} name={name} />
          {/*
            The Label component, semantically linked to the Checkbox via 'htmlFor'.
            Enhanced styling for a bold, professional look, and 'select-none' for better UX.
          */}
          <Label className="font-semibold text-gray-800 select-none" htmlFor={id}>
            {label}
          </Label>
        </div>
      </div>
    </div>
  );
}

export default CheckboxWithLabel;