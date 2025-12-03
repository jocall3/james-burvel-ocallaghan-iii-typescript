// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import thunk from "redux-thunk";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createLogger } from "redux-logger";
import { configureStore } from "@reduxjs/toolkit";

import ApolloCustomProvider from "./utilities/ApolloCustomProvider";
import rootReducer from "./reducers";
import Application from "./containers/Application";
import initExternal from "../common/utilities/initExternal";
import ErrorBoundary from "../common/ui-components/Errors/ErrorBoundary";
import { DispatchProvider, ReducerProvider } from "./MessageProvider";

initExternal();

const store = configureStore({
  reducer: rootReducer,
  preloadedState: window.gon,
  middleware: [thunk, createLogger()],
});

export default render(
  <Provider store={store}>
    <ReducerProvider>
      <DispatchProvider>
        <ApolloCustomProvider>
          <ErrorBoundary>
            <Application />
          </ErrorBoundary>
        </ApolloCustomProvider>
      </DispatchProvider>
    </ReducerProvider>
  </Provider>,
  document.getElementById("app-root"),
);
