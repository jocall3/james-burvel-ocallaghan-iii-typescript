// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, {
  useMemo,
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

export type DispatchMessageFnType = {
  dispatchError: (errorMessage: string) => void;
  dispatchSuccess: (successMessage: string) => void;
  dispatchClearMessage: () => void;
};

type State = {
  successMessage: string | null;
  errorMessage: string | null;
};
function messageReducer(
  state: State,
  action: { type: string; payload: string },
) {
  switch (action.type) {
    case "error":
      return {
        ...state,
        errorMessage: action.payload,
      };
    case "success":
      return {
        ...state,
        successMessage: action.payload,
      };
    case "clear":
      return {
        ...state,
        errorMessage: null,
        successMessage: null,
      };
    default:
      return state;
  }
}

const initialState: State = {
  errorMessage: null,
  successMessage: null,
};

const StateContext = createContext<State>(initialState);
const DispatchContext = createContext<DispatchMessageFnType>(
  {} as DispatchMessageFnType,
);

export function useStateContext() {
  return useContext(StateContext);
}

export function useDispatchContext() {
  return useContext(DispatchContext);
}

type ReducerType = {
  state: State;
  dispatchFn: DispatchMessageFnType;
};

const ReducerContext = createContext<ReducerType>({} as ReducerType);

function useReducerContext() {
  return useContext(ReducerContext);
}

export function ReducerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const dispatchError = useCallback(
    (errorMessage: string) =>
      dispatch({ type: "error", payload: errorMessage }),
    [dispatch],
  );
  const dispatchSuccess = useCallback(
    (successMessage: string) =>
      dispatch({ type: "success", payload: successMessage }),
    [dispatch],
  );

  const dispatchClearMessage = useCallback(
    () => dispatch({ type: "clear", payload: "" }),
    [dispatch],
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatchFn: {
        dispatchError,
        dispatchSuccess,
        dispatchClearMessage,
      },
    }),
    [state, dispatchError, dispatchSuccess, dispatchClearMessage],
  );

  return (
    <ReducerContext.Provider value={contextValue}>
      {children}
    </ReducerContext.Provider>
  );
}

export function StateProvider({ children }: { children: React.ReactNode }) {
  const { state } = useReducerContext();

  return (
    <StateContext.Provider value={state}>{children}</StateContext.Provider>
  );
}

export function DispatchProvider({ children }: { children: React.ReactNode }) {
  const {
    dispatchFn: { dispatchClearMessage, dispatchError, dispatchSuccess },
  } = useReducerContext();

  const providerValues = useMemo(
    () => ({
      dispatchClearMessage,
      dispatchError,
      dispatchSuccess,
    }),
    [dispatchClearMessage, dispatchError, dispatchSuccess],
  );

  return (
    <DispatchContext.Provider value={providerValues}>
      {children}
    </DispatchContext.Provider>
  );
}
