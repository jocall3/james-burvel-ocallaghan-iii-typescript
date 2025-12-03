// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useContext } from "react";
import SectionsContext from "./SectionsContext";

export type SectionProps = React.PropsWithChildren<{
  section: string;
}>;

export default function Section({ section, children }: SectionProps) {
  const currentSection = useContext(SectionsContext);
  // Ignore the fragment rule to avoid esline errors in the calling component.
  // React components can't just render children, but that's all we want to do here.
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{currentSection === section ? children : null}</>;
}
