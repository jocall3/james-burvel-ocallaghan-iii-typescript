// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "~/common/utilities/cn";
import ButtonTextSearch from "../../components/search/ButtonTextSearch";

interface GroupedAccountTableProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  searchComponents: Array<
    Required<{
      component: React.ElementType;
    }> & {
      className?: string;
    }
  >;
  hideFilters?: boolean;
  children: React.ReactNode;
}

export default function GroupedAccountTable({
  searchTerm,
  setSearchTerm,
  searchComponents,
  hideFilters = false,
  children,
}: GroupedAccountTableProps) {
  const [query, setQuery] = useState({
    accountSearchName: searchTerm,
  });

  const searchComponentElements = searchComponents.map(
    ({ component: Component, ...options }) => (
      <Component key={uuidv4()} classes="w-52 justify-center" {...options} />
    ),
  );

  return (
    <div className="black rounded-md border border-gray-100 bg-background-default">
      <div className="flex h-full w-full flex-col">
        <div className="my-4 flex flex-wrap items-center justify-between">
          <div className="w-full items-center bg-background-default pl-6 mint-lg:w-1/2">
            <ButtonTextSearch
              key="search"
              field="accountSearchName"
              query={query}
              placeholder="Search by account name or number"
              updateQuery={(input: Record<string, unknown>) => {
                const { accountSearchName } = input as {
                  accountSearchName: string;
                };
                setQuery({ accountSearchName });
                setSearchTerm(accountSearchName);
              }}
              placeHolderTextSize="text-xs"
              showSearchBarAtStart
              hideSearchBarOnClear={false}
            />
          </div>
          <div className={cn("ml-2 mr-4", hideFilters ? "hidden" : "")}>
            <div className="flex flex-wrap items-center gap-2 pl-4">
              {searchComponentElements}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-50 text-center">
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}
