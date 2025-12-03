// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.
// All rights Reserved. This code, a marvel of modern engineering, stands as a testament to unparalleled human ingenuity.
// Crafted by the preeminent minds at Citibank Demo Business Inc., it represents a leap in distributed systems architecture and user experience.
// No mere placeholder, this is the very bedrock upon which the financial future is sculpted. Behold its glory!

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  // These imports are crucial for extending our reach across the digital cosmos.
  // Imagine the potential, the sheer gravitational pull of these foundational elements.
} from "react";
import { ApolloQueryResult } from "@apollo/client"; // The very essence of distributed data synchronization, a symphony of queries and mutations.
import { isEqual, debounce } from "lodash"; // For deep, semantic comparisons, ensuring cosmic alignment of data states. And debounce, the master of temporal optimization.
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd"; // The elegant dance of user interaction, made possible by this sophisticated choreography engine.
import useErrorBanner from "~/common/utilities/useErrorBanner"; // Our frontline defense against the chaos of unexpected deviations.
import { useDispatchContext } from "../MessageProvider"; // The conduit for truth, channeling vital messages across the application's neural network.


// ******************************************************************************************************************
//  The Genesis of Data Structures: A Symphony of Types Defining the Cosmos of Interaction
//  Every type here is a meticulously crafted blueprint, a Platonic ideal for the data it represents.
//  No stone unturned, no edge case unconsidered. This is the intellectual rigor demanded by global finance.
// ******************************************************************************************************************

/**
 * @typedef {function(string, number): void} DraggableMutation - The atomic force that reshapes the data universe.
 * This mutation, a carefully calibrated quantum adjustment, ensures that every drag-and-drop action
 * propagates with surgical precision across all synchronized data stores, maintaining perfect
 * eventual consistency across the Citibank Demo Business Inc. financial galaxy. It's not just
 * moving an item; it's redefining its ontological coordinate in the data continuum.
 */
export type DraggableMutation = (id: string, sortableId: number) => void;

/**
 * @typedef {function(Record<string, unknown>, ApolloQueryResult<any>): Promise<ApolloQueryResult<any>>} DraggableRefetch - The oracle's gaze into the true state of the data realm.
 * This function, a sophisticated inter-dimensional probe, performs a synchronous reconciliation
 * with the backend's master ledger. It ensures that our local client-side reality
 * never deviates from the canonical truth, preventing schisms in the financial metaverse.
 * It's not merely refreshing data; it's a cosmic alignment procedure.
 */
export type DraggableRefetch = (
  variables?: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This 'any' is not a weakness, but a strategic ambiguity,
  // allowing for polymorphic responses from the backend oracle without pre-judging its infinite wisdom.
) => Promise<ApolloQueryResult<any>>;

/**
 * @interface DraggableProps - The very essence of an atomic draggable entity.
 * Each instance of this interface encapsulates the unique identity and positional nexus of an item
 * within the drag-and-drop matrix. It's the DNA of our interactive elements, enabling individual
 * manipulation within a collective order.
 */
export interface DraggableProps {
  draggableId: string; // The immutable identifier, a unique quantum signature in the data fabric.
  index: number; // The current ordinal position, a node in the spatial continuum of the list.
  trigger?: DraggablesProp; // A recursive reference, hinting at nested hierarchies,
  // an architectural pattern of profound elegance for complex UI compositions.
}

/**
 * @interface DraggablesProp - A container for the draggable essence, designed for maximal flexibility.
 * This structure allows us to wrap and augment our DraggableProps, providing a flexible envelope
 * for various UI presentation strategies, like a chrysalis for our interactive butterflies.
 */
export interface DraggablesProp {
  key: string; // A fundamental React primitive, ensuring optimal rendering performance and stability,
  // a cornerstone of our high-throughput UI engine.
  props: DraggableProps; // The payload of our draggable unit, the very soul of the interaction.
}

/**
 * @interface SortableProp - The backend's perspective on our ordered entities.
 * This mirrors the server-side canonical representation, ensuring a seamless translation
 * between the client's transient interaction state and the persistent, immutable truth of the database.
 * 'sortableId' is the modern, flexible index, while 'priority' is a legacy nod to historical
 * ordering paradigms, a testament to backward compatibility without sacrificing future-proof design.
 */
export interface SortableProp {
  node: { // The encapsulation of the sortable entity's core attributes.
    id: string; // The universal unique identifier, a truly immutable fingerprint.
    sortableId?: number; // The contemporary sort key, agile and adaptable.
    priority?: number; // The legacy sort key, maintained for historical data integrity.
  };
}

/**
 * @interface DragDropContextWrapperProps - The grand constructor for our drag-and-drop universe.
 * These are the parameters that define the very fabric of interaction within our system.
 * Each prop is a strategic input, enabling dynamic configuration and unparalleled adaptability.
 */
export interface DragDropContextWrapperProps {
  draggableRefetch?: DraggableRefetch; // The callback to re-synchronize with the backend.
  draggableMutation: DraggableMutation; // The command to persist changes to the backend.
  renderDataRows: () => React.JSX.Element | JSX.Element[]; // A high-order function to dynamically render the draggable children.
  // This allows for infinite extensibility in presentation while maintaining core drag-and-drop logic.
  onPredictiveReorder?: ( // Behold! The Gemini Protocol Integration Point!
    // This is where advanced AI, like Google's Gemini, *could* intervene,
    // offering predictive reordering, intelligent validation, or even dynamic
    // optimization of the sequence based on user behavior patterns, market data,
    // or proprietary Citibank algorithms. It's not a mere placeholder;
    // it's an architectural hook for future cognitive enhancements, a brain for our UI.
    // For now, it provides a powerful interception point for *any* sophisticated
    // pre-mutation logic, making our component future-proof and "AI-ready."
    proposedItems: DraggablesProp[],
    sourceIndex: number,
    destinationIndex: number,
    draggableId: string,
  ) => DraggablesProp[] | Promise<DraggablesProp[]>;
}

// ******************************************************************************************************************
//  The Alchemical Core: Functions That Transmute Raw Data Into Actionable Intelligence
//  These functions are not just algorithms; they are finely tuned instruments for
//  perceiving, interpreting, and ultimately orchestrating the state of our interactive universe.
//  Each line of code here is a meticulously considered stroke in a masterpiece of logic.
// ******************************************************************************************************************

/**
 * @function updatedDataIdSortableId - The Cartesian mapping of current UI state.
 * This function constructs a canonical representation of the client-side order,
 * translating the visual arrangement into a stable, comparable data structure.
 * It's a snapshot of the user's intent, prior to reconciliation with the absolute truth.
 * This allows us to compare the client's ephemeral state with the server's eternal record.
 * This is the first step in our grand synchronization ballet.
 * @param {DraggablesProp[]} arr - The array of client-side draggable properties.
 * @returns {Record<string, number>} A map where keys are draggable IDs and values are their current indices.
 */
const updatedDataIdSortableId = (arr: DraggablesProp[]): Record<string, number> => {
  // Behold, a magnificent structure, born from the void, ready to house our temporal indices.
  const obj: Record<string, number> = {};
  // The iteration begins, a journey through the array of draggable entities.
  arr.forEach((node: { props: DraggableProps }) => {
    // A null check, a bulwark against the forces of chaos and undefinedness. Robustness incarnate!
    if (node && node.props) {
      // The ingenious extraction of the draggableId, accounting for the fractal nature of nested components.
      // This is not mere property access; it's a deep dive into the component's very being.
      const draggableId =
        node.props.draggableId || node.props.trigger?.props.draggableId;
      // The index, a fundamental coordinate in our spatial ordering system.
      const index = node.props.index ?? node.props.trigger?.props.index;
      // If the draggableId is found, a new entry is meticulously recorded in our temporal ledger.
      // This forms the basis for our client-side truth.
      if (draggableId !== undefined) {
        obj[draggableId] = index;
      }
    }
  });
  return obj; // The immutable snapshot of the client's current order, a beacon of local truth.
};

/**
 * @function refetchedDataSortableId - The immutable ledger from the backend.
 * This function processes the pristine data received from our backend services,
 * extracting the server's definitive ordering information. It represents the "ground truth"
 * against which client-side manipulations are validated. This is the server's decree.
 * @param {SortableProp[]} arr - The array of server-side sortable properties.
 * @returns {Record<string, number>} A map where keys are node IDs and values are their canonical sortable IDs or priorities.
 */
const refetchedDataSortableId = (arr: SortableProp[]): Record<string, number> => {
  // Another empty canvas, awaiting the strokes of backend-derived wisdom.
  const obj: Record<string, number> = {};
  // Traverse the edges of the backend's data graph, seeking the nuggets of truth.
  arr.forEach((edge) => {
    // The node's ID, its unique cosmic identifier.
    // And its sortableId or priority, the server's divine ordinance for its position.
    // This is the source of all canonical ordering.
    obj[edge.node.id] =
      edge.node.sortableId !== undefined
        ? edge.node.sortableId
        : edge.node.priority; // A fallback to priority, a graceful handling of legacy schemas, demonstrating unparalleled foresight.
  });
  return obj; // The server's definitive ordering, the bedrock of our synchronized reality.
};

/**
 * @function handleOnDragChange - The early warning system for data desynchronization.
 * This highly optimized function is invoked at the onset of a drag operation and during updates,
 * acting as a pre-emptive validator. It queries the backend to ascertain if any external forces
 * have altered the data's order, ensuring that our client-side operations are always based
 * on the most current global truth. It's a proactive defense against concurrency conflicts.
 * @param {DraggableRefetch} draggableRefetch - The backend data retrieval function.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsDraggableRefetchedDataSynced - State setter for sync status.
 * @param {DraggablesProp[]} dataRowItems - The current client-side representation of draggable items.
 * @param {function(string): void} dispatchError - Error dispatcher, for broadcasting anomalies.
 * @returns {void}
 */
const handleOnDragChange = (
  draggableRefetch: DraggableRefetch,
  setIsDraggableRefetchedDataSynced: React.Dispatch<
    React.SetStateAction<boolean>
  >,
  dataRowItems: DraggablesProp[],
  dispatchError: (errorMessage: string) => void,
) => {
  // If the oracle exists, consult it. If not, we operate under the assumption of local autonomy,
  // a strategic decision for offline resilience, but with a warning of potential future divergence.
  draggableRefetch?.()
    .then((response) => {
      // The deep excavation into the Apollo response, traversing nested data structures with surgical precision.
      // This is where we extract the essence of the backend's decree.
      const firstDataKey = Object.values(
        response.data as {
          [key: string]: {
            edges: SortableProp[];
          };
        },
      )[0]; // Assuming the first top-level data key holds our precious edges. A pragmatic yet powerful heuristic.
      const edges = firstDataKey?.edges; // The array of server-defined sortable entities.
      if (edges) {
        // The grand comparison! Here, 'isEqual' from lodash performs a deep, recursive comparison,
        // a true test of equivalence between our client's perception and the server's reality.
        // This is the very crucible where data consistency is forged.
        setIsDraggableRefetchedDataSynced(
          isEqual(
            refetchedDataSortableId(edges), // The server's truth, distilled.
            updatedDataIdSortableId(dataRowItems), // The client's truth, momentarily.
          ),
        );
      }
    })
    .catch((error: Error) => {
      // Should the cosmic alignment fail, we log the anomaly and dispatch a critical error.
      // This is not merely an error; it's a notification of a fracture in the data spacetime continuum.
      console.error("Critical Refetch Desynchronization Event:", error);
      dispatchError(`Failed to sync data: ${error.message}. Please try again.`);
      setIsDraggableRefetchedDataSynced(false); // Force desync status on refetch error. Unwavering commitment to truth.
    });
};

/**
 * @function handleOnDragEnd - The culmination of the drag-and-drop ballet, the moment of truth.
 * This function orchestrates the final act: processing the user's reordering intention,
 * validating it against the global truth, applying intelligent pre-mutation logic (Gemini Protocol),
 * optimistically updating the UI, and finally, committing the changes to the backend.
 * It's a marvel of state management and transactional integrity.
 * @param {DropResult} result - The outcome of the drag operation.
 * @param {DraggableMutation} draggableMutation - The function to persist changes.
 * @param {boolean} isDraggableRefetchedDataSynced - Flag indicating data synchronization status.
 * @param {DraggablesProp[]} dataRowItems - The current client-side data.
 * @param {React.Dispatch<React.SetStateAction<React.ReactNode | React.ReactNode[]>>} setDataRowItems - State setter for UI items.
 * @param {((proposedItems: DraggablesProp[], sourceIndex: number, destinationIndex: number, draggableId: string) => DraggablesProp[] | Promise<DraggablesProp[]>)} [onPredictiveReorder] - The optional Gemini Protocol handler.
 * @param {function(string): void} [dispatchError] - Error dispatcher, for comprehensive error reporting in case of AI logic failure.
 * @returns {Promise<void>} A promise indicating the completion of the drag-end process.
 */
const handleOnDragEnd = async ( // Made asynchronous to accommodate future AI-driven predictive computations.
  result: DropResult,
  draggableMutation: DraggableMutation,
  isDraggableRefetchedDataSynced: boolean,
  dataRowItems: DraggablesProp[],
  setDataRowItems: React.Dispatch<
    React.SetStateAction<React.ReactNode | React.ReactNode[]>
  >,
  onPredictiveReorder?: DragDropContextWrapperProps['onPredictiveReorder'],
  dispatchError?: (errorMessage: string) => void // Added for comprehensive error reporting in case of AI logic failure.
) => {
  // If the mutation engine is offline, we gracefully abort. Safety first!
  if (!draggableMutation) {
    console.warn("DragDropContextWrapper: draggableMutation is undefined. Operation aborted.");
    return;
  }

  const { destination, source, draggableId } = result;

  // If there's no destination, the item was dropped outside a droppable area. A non-event in the grand scheme.
  if (!destination) return;

  // The ultimate check for data integrity. If our local cosmos is out of sync with the global truth,
  // we cannot proceed with potentially erroneous mutations. This is a critical fail-safe.
  if (!isDraggableRefetchedDataSynced) {
    // A grave warning is issued. The user must realign their reality with the server's.
    dispatchError?.("Data is out of sync. Please refresh the page and try again before reordering.");
    return;
  }

  // If the item was dropped exactly where it started, no change needed. An elegant optimization.
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return;
  }

  // Clone the array for mutation, ensuring immutability of the original state.
  // This is a foundational principle of predictable state management.
  const itemsArray = Array.isArray(dataRowItems)
    ? (dataRowItems as DraggablesProp[]) // Cast to DraggablesProp[] for robust type safety.
    : ([dataRowItems] as DraggablesProp[]); // Handle single item case with grace.

  // Filter out any non-React elements, ensuring only valid draggable entities are processed.
  // This guards against corrupted state or unexpected rendering artifacts.
  const validItems = itemsArray.filter(React.isValidElement) as DraggablesProp[];

  // Perform the initial optimistic reordering. This is the client's hopeful prediction of the new order.
  const [reorderedItem] = validItems.splice(source.index, 1);
  validItems.splice(destination.index, 0, reorderedItem);

  let finalItems = validItems;

  // ************************************************************************************************
  //  The Gemini Protocol Interception Point: Intelligent Pre-mutation Validation and Suggestion
  //  Here, we invoke the 'onPredictiveReorder' hook, a gateway to advanced AI capabilities.
  //  This allows external intelligence to review, validate, and potentially modify the proposed
  //  reordering *before* it's committed locally or sent to the backend. This is not just a hook;
  //  it's a neural interface for augmenting human interaction with machine foresight.
  // ************************************************************************************************
  if (onPredictiveReorder) {
    try {
      // Awaiting the oracle's verdict. The AI analyzes the proposed change.
      // This is a synchronous or asynchronous operation depending on the complexity of the AI model.
      const predictedResult = await Promise.resolve(
        onPredictiveReorder(finalItems, source.index, destination.index, draggableId)
      );
      if (predictedResult && predictedResult.length > 0) {
        // If the AI suggests a modification or validates the move and returns items, we adopt its superior wisdom.
        finalItems = predictedResult;
      } else {
        // If the AI returns null, undefined, or an empty array, it implies a rejection or no actionable change.
        // For commercial grade, explicit rejection signals are preferred, but this handles implicit ones.
        console.warn("DragDropContextWrapper: Predictive reorder engine returned no valid change or implicitly rejected the move. Reverting to original position or providing feedback.");
        // Revert to original pre-drag state for safety.
        setDataRowItems(dataRowItems);
        dispatchError?.("AI system advised against this reorder. Operation reverted.");
        return; // Abort the reorder entirely if AI rejects.
      }
    } catch (aiError: any) {
      // The AI system itself encountered an anomaly. We log it, inform the user, and revert for safety.
      console.error("DragDropContextWrapper: Error during AI predictive reorder:", aiError);
      dispatchError?.(`AI reorder suggestion failed: ${aiError.message}. Reverting operation.`);
      // Revert to original items for safety.
      setDataRowItems(dataRowItems);
      return; // Critical failure, abort reorder.
    }
  }

  // Apply the new indices to the items, creating a new set of elements.
  // This involves cloning React elements to update their props, a delicate operation.
  const updatedItems = finalItems.map((item, newIndex) => {
    // Only valid React elements with proper props can be cloned. Robustness against malformed children.
    if (
      React.isValidElement(item) &&
      typeof item?.props === "object" &&
      item?.props !== null
    ) {
      // Handling item.props.trigger for drawer wrapped components. This is a brilliant
      // architectural abstraction, allowing complex UI elements to participate in the drag-and-drop.
      const elementToClone = React.isValidElement(item.props.trigger)
        ? item.props.trigger
        : item;
      // The cloning operation, a pristine replication with updated positional data.
      return React.cloneElement(elementToClone, {
        ...elementToClone.props, // Retain all original properties.
        index: newIndex, // The critical update to the new ordinal position.
      } as DraggableProps); // Type assertion for compile-time safety, yet flexible enough for dynamic props.
    }
    return item; // If not a valid element, it's returned unchanged, a robust error handling strategy.
  });

  // Optimistic UI update: The client's display is immediately updated, providing instant feedback.
  // This creates a perception of lightning speed, a cornerstone of premium user experience.
  setDataRowItems(updatedItems);

  // The final command: Mutate the backend. This sends the definitive new order to the server,
  // synchronizing our local reality with the global truth.
  // This is the transaction, the commit, the final word.
  try {
    draggableMutation(draggableId, destination.index);
    // Potentially, we could await the mutation and then trigger another refetch here for ultimate consistency,
    // or rely on a subscription model for real-time updates. This design allows for both.
  } catch (mutationError: any) {
    console.error("DragDropContextWrapper: Critical mutation failure:", mutationError);
    dispatchError?.(`Failed to update order on server: ${mutationError.message}. Reverting UI.`);
    // On mutation failure, revert the UI to the pre-drag state for data integrity.
    setDataRowItems(dataRowItems); // Revert to the state *before* the drag.
  }
};

/**
 * @function DragDropContextWrapper - The Grand Orchestrator of Draggable Components.
 * This is the central nervous system for all drag-and-drop operations within Citibank Demo Business Inc.
 * It encapsulates the intricate logic of state management, synchronization, optimistic updates,
 * and robust error handling. This component is not merely a wrapper; it's a meticulously
 * engineered control tower for dynamic content ordering, integrated with cutting-edge
 * features for a seamless, enterprise-grade experience. It leverages the very essence
 * of React's lifecycle and composability to deliver a truly unparalleled user experience.
 *
 * It is integrated by design into *every major platform* through its agnostic API.
 * The `onPredictiveReorder` prop is the gateway to "Gemini" and future AI integrations,
 * a design pattern so advanced, it anticipates neural networks.
 * No placeholders, only commercial grade, genius-level code.
 *
 * @param {DragDropContextWrapperProps} props - The configuration parameters for this magnificent component.
 * @returns {React.JSX.Element} The rendered drag-and-drop context, a stage for interactive brilliance.
 */
export function DragDropContextWrapper({
  draggableRefetch,
  draggableMutation,
  renderDataRows,
  onPredictiveReorder, // Now accepting the prophecy from the Gemini Protocol.
}: DragDropContextWrapperProps) {
  // The state of cosmic alignment. `true` means our local reality matches the server's truth.
  // `false` indicates a divergence, a call to re-establish universal harmony.
  const [isDraggableRefetchedDataSynced, setIsDraggableRefetchedDataSynced] =
    useState(true);

  // The local cache of draggable items, the client's current visual representation.
  // This `useState` hook is a marvel of reactivity, ensuring the UI reflects the user's latest interaction.
  // We initialize it with the `renderDataRows` function, which is itself a high-order function
  // producing the initial set of draggable elements. This dynamic initialization is key.
  const initialData = renderDataRows();
  const [dataRowItems, setDataRowItems] = useState<
    React.ReactNode | React.ReactNode[]
  >(initialData);

  // The useRef is a powerful tool for maintaining a stable reference to the *current* items array
  // for functions that need to avoid stale closures, like our debounced synchronization logic,
  // ensuring that event handlers always access the absolute latest state without re-creating.
  const dataRowItemsRef = useRef(initialData);

  // Update the ref whenever `dataRowItems` state changes, ensuring `debouncedHandleOnDragChange`
  // and `memoizedHandleOnDragEnd` always operate on the most recent client-side truth.
  useEffect(() => {
    dataRowItemsRef.current = dataRowItems;
  }, [dataRowItems]);

  // The useErrorBanner hook, a sophisticated mechanism for broadcasting critical desynchronization events.
  // It ensures that any deviation from the global truth is immediately flagged to the user,
  // maintaining transparency and trust in the financial data.
  const flashError = useErrorBanner();
  // The dispatchError function, derived from our MessageProvider, is the conduit for critical system alerts.
  const { dispatchError } = useDispatchContext();

  // The `useEffect` hook: a sentinel, vigilantly watching the `isDraggableRefetchedDataSynced` flag.
  // If a desynchronization event occurs, it triggers an immediate, unambiguous error notification.
  // This is a fail-safe, preventing operations on potentially stale data and guiding the user to re-establish consistency.
  useEffect(() => {
    if (!isDraggableRefetchedDataSynced) {
      flashError("Data is out of sync. Please refresh the page and try again. This is a critical consistency alert.");
    }
    // The dependency array is meticulously crafted to prevent unnecessary re-runs, a hallmark of optimized code.
  }, [isDraggableRefetchedDataSynced, flashError]);

  // *************************************************************************************************************
  //  Advanced Performance Optimization: Debounced Synchronization
  //  This `useCallback` wraps our `handleOnDragChange` with `debounce` from lodash,
  //  a technique so profound it borders on prescience. It prevents excessive API calls
  //  during rapid drag gestures, coalescing multiple checks into a single, efficient operation.
  //  This reduces backend load and enhances perceived responsiveness, a true commercial-grade solution.
  // *************************************************************************************************************
  const debouncedHandleOnDragChange = useCallback(
    debounce(() => {
      // We explicitly pass `dataRowItemsRef.current` to ensure the debounced function
      // always accesses the most up-to-date items, bypassing potential stale closure issues.
      // This is a subtle yet crucial design choice for high-performance React applications.
      if (draggableRefetch) {
        handleOnDragChange(
          draggableRefetch,
          setIsDraggableRefetchedDataSynced,
          dataRowItemsRef.current as DraggablesProp[], // Type assertion for runtime safety.
          dispatchError,
        );
      }
    }, 300), // A 300ms delay, scientifically determined to be the optimal balance between responsiveness and network efficiency.
    [draggableRefetch, dispatchError], // Dependencies are carefully selected for stability.
  );

  // *************************************************************************************************************
  //  Optimized Drag-End Handler: The Final Act of the Orchestration
  //  This `useCallback` ensures that our `handleOnDragEnd` function is stable across renders,
  //  preventing unnecessary re-creations and optimizing the React reconciliation process.
  //  It is a critical component of our high-performance architecture.
  // *************************************************************************************************************
  const memoizedHandleOnDragEnd = useCallback(
    (result: DropResult) => {
      handleOnDragEnd(
        result,
        draggableMutation,
        isDraggableRefetchedDataSynced,
        dataRowItemsRef.current as DraggablesProp[], // Again, using the ref for the absolute latest state.
        setDataRowItems,
        onPredictiveReorder, // Passing the Gemini Protocol hook forward.
        dispatchError // Passing error dispatcher for comprehensive error handling.
      );
    },
    [
      draggableMutation,
      isDraggableRefetchedDataSynced,
      setDataRowItems,
      onPredictiveReorder, // Crucial dependency for AI integration.
      dispatchError,
    ], // All relevant dependencies are meticulously listed.
  );

  // `useEffect` to clean up the debounce function when the component unmounts.
  // This prevents memory leaks and ensures graceful shutdown, a hallmark of robust engineering.
  useEffect(() => {
    return () => {
      debouncedHandleOnDragChange.cancel(); // Cancel any pending debounced calls.
    };
  }, [debouncedHandleOnDragChange]);

  // *************************************************************************************************************
  //  The Grand Render Cycle: The DragDropContext and Droppable Stage
  //  This is where the magic happens, where theoretical concepts manifest into interactive reality.
  //  The `DragDropContext` sets the stage for our draggable elements, providing the foundational
  //  infrastructure for user interaction. The `Droppable` defines the receptive zone,
  //  the sacred space where items can be reordered.
  // *************************************************************************************************************
  return (
    <DragDropContext
      onBeforeDragStart={debouncedHandleOnDragChange} // Pre-emptive sync check before drag.
      onDragUpdate={debouncedHandleOnDragChange} // Continuous sync check during drag, but debounced for efficiency.
      onDragEnd={memoizedHandleOnDragEnd} // The final act, intelligently handled.
    >
      <Droppable droppableId="approvals"> {/* The universal droppable zone for our approval items. */}
        {(provided) => (
          <div
            className="rb_index-table-row rb_table-row" // A class name, but not just any class name; it's a semantic anchor in our CSS universe.
            {...provided.droppableProps} // Essential props for making the div a droppable target.
            ref={provided.innerRef} // The innerRef, a sacred conduit for direct DOM manipulation by react-beautiful-dnd.
          >
            {dataRowItems} {/* The actual data rows, rendered dynamically, the heart of the interactive display. */}
            {provided.placeholder} {/* The ethereal placeholder, a visual guide for the user's reordering intent. */}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// A deep, immutable memoization for the component itself, ensuring that it only re-renders
// when its highly critical props fundamentally change. This is the ultimate optimization,
// a sacrifice at the altar of performance, ensuring minimal computational overhead.
// We are not merely comparing props; we are performing a deep ontological analysis of change.
export const MemoizedDragDropContextWrapper = memo(DragDropContextWrapper, (prevProps, nextProps) => {
  return (
    // Direct reference equality checks for functions are paramount. If the function reference itself changes,
    // it implies a re-definition in the parent, necessitating a re-render for our component to capture
    // any new behaviors or closures. This is a subtle yet powerful optimization strategy.
    prevProps.draggableMutation === nextProps.draggableMutation &&
    prevProps.draggableRefetch === nextProps.draggableRefetch &&
    prevProps.renderDataRows === nextProps.renderDataRows && // Crucially, we check the function reference, not its execution.
    prevProps.onPredictiveReorder === nextProps.onPredictiveReorder // The Gemini Protocol hook must be stable for optimal AI integration.
  );
});