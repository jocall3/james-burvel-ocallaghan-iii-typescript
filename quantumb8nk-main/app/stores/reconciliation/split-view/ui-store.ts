// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { makeAutoObservable } from "mobx";

export default class SplitViewUIStore {
  constructor() {
    makeAutoObservable(this);
  }

  showMatchingView = false;

  showConfirmationModal = false;

  showLedgeringModal = false;

  loading = false;

  public setLoading = (loading: boolean) => {
    this.loading = loading;
  };

  public setShowConfirmationModal = (show: boolean) => {
    this.showConfirmationModal = show;
  };

  public setShowLedgeringModal = (show: boolean) => {
    this.showLedgeringModal = show;
  };

  public setShowMatchingView = (show: boolean) => {
    this.showMatchingView = show;
  };

  public reset = () => {
    this.showMatchingView = false;
    this.showConfirmationModal = false;
    this.showLedgeringModal = false;
    this.loading = false;
  };
}
