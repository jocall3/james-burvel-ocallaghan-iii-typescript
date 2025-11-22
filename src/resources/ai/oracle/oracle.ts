// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as SimulateAPI from './simulate';
import {
  AdvancedSimulationResponse,
  Simulate,
  SimulateRunAdvancedParams,
  SimulateRunStandardParams,
  SimulationResponse,
} from './simulate';
import * as SimulationsAPI from './simulations';
import {
  SimulationListParams,
  SimulationListResponse,
  SimulationRetrieveResponse,
  Simulations,
} from './simulations';

export class Oracle extends APIResource {
  simulate: SimulateAPI.Simulate = new SimulateAPI.Simulate(this._client);
  simulations: SimulationsAPI.Simulations = new SimulationsAPI.Simulations(this._client);
}

Oracle.Simulate = Simulate;
Oracle.Simulations = Simulations;

export declare namespace Oracle {
  export {
    Simulate as Simulate,
    type AdvancedSimulationResponse as AdvancedSimulationResponse,
    type SimulationResponse as SimulationResponse,
    type SimulateRunAdvancedParams as SimulateRunAdvancedParams,
    type SimulateRunStandardParams as SimulateRunStandardParams,
  };

  export {
    Simulations as Simulations,
    type SimulationRetrieveResponse as SimulationRetrieveResponse,
    type SimulationListResponse as SimulationListResponse,
    type SimulationListParams as SimulationListParams,
  };
}
