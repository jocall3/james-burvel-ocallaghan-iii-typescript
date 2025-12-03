// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { ErrorMessage } from "formik";
import React from "react";
import { cn } from "~/common/utilities/cn";
import { Checkbox, FieldGroup, Label } from "../../../common/ui-components";
import {
  SweepRuleDirection,
  SweepRuleDirectionFieldProps,
} from "../../constants/sweep_rule_form";

function SweepRuleDirectionSelector({
  field,
  form,
}: SweepRuleDirectionFieldProps) {
  const [isTopUpEnabled, setIsTopUpEnabled] = React.useState(true);

  const toggleSweepDirectionRule = (direction: SweepRuleDirection) => {
    // return if top up is disabled
    if (direction === SweepRuleDirection.TOP_UP && !isTopUpEnabled) {
      return;
    }

    if (field.value.includes(direction)) {
      const rest = field.value.filter((d) => d !== direction);
      void form.setFieldValue(field.name, rest);
    } else {
      const rest = field.value.concat(direction);
      void form.setFieldValue(field.name, rest);
    }
  };

  const isDrawDownSelected = field.value.includes(SweepRuleDirection.DRAW_DOWN);
  const isTopUpSelected = field.value.includes(SweepRuleDirection.TOP_UP);

  React.useEffect(() => {
    // if it's a wire with external account as supporting, disable top up
    if (
      form.values.paymentType === "wire" &&
      form.values.receivingAccountType === "ExternalAccount"
    ) {
      setIsTopUpEnabled(false);
      const currentValues = form.values.fundingDirection;

      // If top up is selected, remove it
      if (currentValues.includes(SweepRuleDirection.TOP_UP)) {
        void form.setFieldValue(
          "fundingDirection",
          currentValues.filter((d) => d !== SweepRuleDirection.TOP_UP),
        );
      }
    } else {
      setIsTopUpEnabled(true);
    }
  }, [form, form.values.paymentType, form.values.receivingAccountType]);

  return (
    <div>
      <div className="flex w-full flex-col gap-2">
        <span className="text-sm font-normal">Sweep Type</span>
        <div className="flex flex-col gap-2">
          <div
            tabIndex={0}
            role="button"
            onClick={() => toggleSweepDirectionRule(SweepRuleDirection.TOP_UP)}
            onKeyDown={() =>
              toggleSweepDirectionRule(SweepRuleDirection.TOP_UP)
            }
            className={cn(
              "flex flex-col rounded-md border border-alpha-black-100 bg-white px-3 py-4",
              {
                "border-blue-400 bg-blue-25": isTopUpSelected,
                "border-gray-100": !isTopUpSelected,
                "cursor-not-allowed bg-gray-25": !isTopUpEnabled,
                "cursor-pointer": isTopUpEnabled,
              },
            )}
          >
            <FieldGroup direction="left-to-right">
              <Checkbox
                checked={isTopUpSelected}
                name={field.name}
                onChange={() =>
                  toggleSweepDirectionRule(SweepRuleDirection.TOP_UP)
                }
                disabled={!isTopUpEnabled}
              />
              <Label
                className={cn("text-sm font-medium", {
                  "text-gray-200": !isTopUpEnabled,
                  "text-gray-800": !isTopUpSelected,
                  "text-blue-500": isTopUpSelected,
                })}
                id="user_pilot_tour_sweep_rule_direction_top_up_label"
              >
                Top Up
              </Label>
            </FieldGroup>
            <p className="ml-6 text-sm font-normal text-gray-500">
              {isTopUpEnabled ? (
                "A top up sweep will increase the funds in an account to a target balance by pulling funds from the supporting account."
              ) : (
                <span className="text-gray-400">
                  Top Ups from an External Account are not supported for Wires.
                  Please choose a different Payment type or Supporting Account.
                </span>
              )}
            </p>
          </div>
          <div
            tabIndex={0}
            role="button"
            onClick={() =>
              toggleSweepDirectionRule(SweepRuleDirection.DRAW_DOWN)
            }
            onKeyDown={() =>
              toggleSweepDirectionRule(SweepRuleDirection.DRAW_DOWN)
            }
            className={`flex cursor-pointer flex-col rounded-md border border-alpha-black-100 bg-white px-3 py-4 ${
              isDrawDownSelected
                ? "border-blue-400 bg-blue-25"
                : "border-gray-100"
            }`}
          >
            <FieldGroup direction="left-to-right">
              <Checkbox
                checked={isDrawDownSelected}
                name={field.name}
                value="draw_down"
                onChange={() =>
                  toggleSweepDirectionRule(SweepRuleDirection.DRAW_DOWN)
                }
              />
              <Label
                className={`text-sm font-medium ${
                  isDrawDownSelected ? "text-blue-500" : "text-gray-800"
                }`}
                id="user_pilot_tour_sweep_rule_direction_draw_down_label"
              >
                Draw Down
              </Label>
            </FieldGroup>
            <p className="ml-6 text-sm font-normal text-gray-500">
              A draw down sweep will reduce the funds in an account to a target
              balance and move funds to the supporting account.
            </p>
          </div>
        </div>
      </div>
      <ErrorMessage
        name={field.name}
        component="span"
        className="text-xs text-text-critical"
      />
    </div>
  );
}

export default SweepRuleDirectionSelector;
