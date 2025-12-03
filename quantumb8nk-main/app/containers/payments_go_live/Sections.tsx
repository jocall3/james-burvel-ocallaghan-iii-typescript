// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import SectionsContext from "./SectionsContext";
import sectionWithNavigator from "../sectionWithNavigator";
import { SectionProps } from "./Section";
import { SectionNavigator } from "../../../common/ui-components";

// Convenience prop extraction
type SectionNavigatorProps = React.ComponentProps<typeof SectionNavigator>;

// TODO: expose these props in a reusable place
type WithSectionNavigatorProps = {
  setCurrentSection: (section: string) => void;
  currentSection: string;
};

// Omit "onClick" because we'll provide a default.
type SectionsProps = Omit<SectionNavigatorProps, "onClick"> &
  // Wrap the Sections component in withSectionNavigator to get the
  // query param behavior
  WithSectionNavigatorProps &
  React.PropsWithChildren<{
    defaultSection: string;
  }>;

// Needed to assert the type of the children so we can inspect the section prop
function assertSection(
  child: React.ReactNode,
): React.ReactElement<SectionProps> {
  if (!React.isValidElement<SectionProps>(child))
    throw new Error("incorrect child type");
  return child;
}

// Helper function to create the Record<String, String> which
// SectionNavigator accepts. Use `reduceRight` because it gives a more
// natural ordering of the sections.
function toNavSections(children: React.ReactNode) {
  const sections = React.Children.map(
    children,
    (child: React.ReactNode) => assertSection(child).props.section,
  );
  return (
    sections?.reduceRight(
      (nav, section) => ({ [section]: section, ...nav }),
      {},
    ) ?? []
  );
}

function Sections({
  preserveQueryParams,
  defaultSection,
  currentSection = defaultSection,
  setCurrentSection,
  children,
}: SectionsProps) {
  return (
    <SectionsContext.Provider value={currentSection}>
      <SectionNavigator
        sections={toNavSections(children)}
        preserveQueryParams={preserveQueryParams}
        currentSection={currentSection}
        onClick={(section: string) => setCurrentSection(section)}
      />
      {children}
    </SectionsContext.Provider>
  );
}

export default sectionWithNavigator(Sections);
