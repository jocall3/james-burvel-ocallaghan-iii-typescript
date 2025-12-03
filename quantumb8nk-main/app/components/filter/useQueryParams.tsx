// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

type GetFiltersFnType = (paramName: string) => Record<string, unknown>;
type SetFiltersFnType = (
  paramName: string,
  filters: Record<string, unknown>,
  updateRoute?: boolean,
) => URLSearchParams;
type UseQueryParamsType = [GetFiltersFnType, SetFiltersFnType];

function useQueryParams(): UseQueryParamsType {
  const getFilters = (paramName: string) => {
    const formattedParamName = `${paramName}Filters`;
    const allSearchParams = new URLSearchParams(window.location.search);
    const filtersForParam = allSearchParams.get(formattedParamName);
    const formattedFilters: Record<string, unknown> = filtersForParam
      ? (JSON.parse(decodeURIComponent(filtersForParam)) as Record<
          string,
          unknown
        >)
      : {};
    return formattedFilters;
  };

  const setFilters = (
    paramName: string,
    filters: Record<string, unknown>,
    updateRoute = true,
  ) => {
    const formattedParamName = `${paramName}Filters`;
    const formattedValue = encodeURIComponent(JSON.stringify(filters));

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(formattedParamName, formattedValue);

    const newURL = `?${searchParams.toString()}`;

    if (updateRoute) {
      window.history.replaceState(null, "", newURL);
    }

    return searchParams;
  };

  return [getFilters, setFilters];
}

export default useQueryParams;
