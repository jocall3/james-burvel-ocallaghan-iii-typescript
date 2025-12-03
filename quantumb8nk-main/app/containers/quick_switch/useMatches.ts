// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// Adapted from https://github.com/timc1/kbar/blob/main/src/useMatches.tsx
// Removed deep searching to only search within the visible content

import * as React from "react";
import { ActionImpl, useKBar, Priority } from "kbar";
import commandScore from "command-score";
import { containsUUID } from "./utils";

export const NO_GROUP = {
  name: "none",
  priority: Priority.NORMAL,
};

export function useThrottledValue<T = string>(value: T, ms = 100) {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    if (ms === 0) return;

    const timeout = setTimeout(
      () => {
        setThrottledValue(value);
        lastRan.current = Date.now();
      },
      lastRan.current - (Date.now() - ms),
    );

    // eslint-disable-next-line consistent-return
    return () => {
      clearTimeout(timeout);
    };
  }, [ms, value]);

  return ms === 0 ? value : throttledValue;
}

function order(a: { priority: number }, b: { priority: number }) {
  /**
   * Larger the priority = higher up the list
   */
  return b.priority - a.priority;
}

type Match = {
  action: ActionImpl;
  score: number;
};

function useInternalMatches(filtered: ActionImpl[], search: string) {
  const value = React.useMemo(
    () => ({
      filtered,
      search,
    }),
    [filtered, search],
  );

  const { filtered: throttledFiltered, search: throttledSearch } =
    useThrottledValue(value);

  return React.useMemo(() => {
    if (throttledSearch.trim() === "") {
      return throttledFiltered.map((action) => ({ score: 0, action }));
    }

    const matches: Match[] = [];

    for (let i = 0; i < throttledFiltered.length; i += 1) {
      const action = throttledFiltered[i];
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      const score = commandScore(
        [action.name, action.keywords, action.subtitle].join(" "),
        throttledSearch,
      ) as number;
      // When searching for a UUID, the score will be 0, but we still want to show the result.
      // Although we don't display it, the subtitle will contain the UUID.
      const uuid = containsUUID(action?.subtitle);
      const uuidMatch = uuid && uuid.includes(throttledSearch);

      if (score > 0 || uuidMatch) {
        matches.push({ score, action });
      }
    }

    return matches;
  }, [throttledFiltered, throttledSearch]);
}

type SectionName = string;

export function useMatches() {
  const { search, actions, rootActionId } = useKBar((state) => ({
    search: state.searchQuery,
    actions: state.actions,
    rootActionId: state.currentRootActionId,
  }));

  const rootResults = React.useMemo(
    () =>
      Object.keys(actions)
        .reduce((acc, actionId) => {
          const action = actions[actionId];
          if (!action.parent && !rootActionId) {
            acc.push(action);
          }
          if (action.id === rootActionId) {
            acc.push(...action.children);
          }
          return acc;
        }, [] as ActionImpl[])
        .sort(order),
    [actions, rootActionId],
  );

  const emptySearch = !search;

  const filtered = React.useMemo(() => {
    if (emptySearch) return rootResults;
    return rootResults;
  }, [rootResults, emptySearch]);

  const matches = useInternalMatches(filtered, search);

  const results = React.useMemo(() => {
    const map: Record<SectionName, { priority: number; action: ActionImpl }[]> =
      {};
    const list: { priority: number; name: SectionName }[] = [];
    let ordered: { name: SectionName; actions: ActionImpl[] }[] = [];

    for (let i = 0; i < matches.length; i += 1) {
      const match = matches[i];
      const { action } = match;
      const score = match.score || Priority.NORMAL;

      const section = {
        name:
          typeof action.section === "string"
            ? action.section
            : action.section?.name || NO_GROUP.name,
        priority:
          typeof action.section === "string"
            ? score
            : action.section?.priority || 0 + score,
      };

      if (!map[section.name]) {
        map[section.name] = [];
        list.push(section);
      }

      map[section.name].push({
        priority: action.priority + score,
        action,
      });
    }

    ordered = list.sort(order).map((group) => ({
      name: group.name,
      actions: map[group.name].sort(order).map((item) => item.action),
    }));

    const newResults: (string | ActionImpl)[] = [];
    for (let i = 0; i < ordered.length; i += 1) {
      const group = ordered[i];
      if (group.name !== NO_GROUP.name) newResults.push(group.name);
      newResults.push(...group.actions);
    }
    return newResults;
  }, [matches]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoRootActionId = React.useMemo(() => rootActionId, [results]);

  return React.useMemo(
    () => ({
      results,
      rootActionId: memoRootActionId,
    }),
    [memoRootActionId, results],
  );
}

export const useDeepMatches = useMatches;
