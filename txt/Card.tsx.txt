
# The Unit of Truth
*A Guide to the Atomic Unit of Reality*

---

## Abstract

This document explains the `Card.tsx` component as the fundamental, atomic "Unit of Truth" in our application's reality. It is not just a UI container; it is a discrete, bounded vessel upon which a single, undeniable piece of information is made manifest. Its properties (`variant`, `isLoading`, `errorState`) are the different states of that truth's presentation, defining the relationship between the sovereign and the information contained within the unit.

---

## Chapter 1. The States of Being

### 1.1 `CardVariant` as a Mode of Presentation

The `variant` property defines the unit's presentation and its relationship to the surrounding reality.
-   **`default`**: The standard state, a clear and distinct unit of information.
-   **`outline`**: A unit that emphasizes its boundary, used for highlighting a critical piece of truth.
-   **`ghost`**: A frameless unit, where the information appears to be an integral part of the foundational reality.
-   **`interactive`**: A unit that responds to the sovereign's focus (hover), signaling that it can be commanded.

### 1.2 `isLoading` as Truth in Formation

The `isLoading` state represents a unit whose truth is still being resolved from the chaos of potential. It is a "truth in formation," a temporary state before the final, definitive information arrives. The `LoadingSkeleton` is the visual representation of this state of becoming.

### 1.3 `errorState` as Truth Denied

The `errorState` represents a unit where the information could not be resolved. The connection to this particular truth has been severed. The `ErrorDisplay` is the formal acknowledgment of this dissonance, a clear signal that a part of reality is in error.

---

## Chapter 2. The Structure of a Unit

### 2.1 The Header: Designation and Instruments

The `CardHeader` contains the `title`, which is the formal designation of the truth being displayed. The `headerActions` are the instruments (buttons, menus) provided to the sovereign to command or interrogate the information.

### 2.2 The Body: The Truth Itself

The `children` prop represents the truth itself, the content that the unit makes manifest.

### 2.3 `isCollapsible` as a Veil of Focus

The `isCollapsible` property provides a control that the sovereign can use to show or hide the unit's content. When collapsed, the truth is not gone, but simply veiled from view, acknowledged by its designation but not directly perceived. It is an act of commanding focus.

---

## Chapter 3. Conclusion

The `Card` is the fundamental, atomic unit of our interface. Every complex reality is constructed from these discrete units of truth. By understanding the `Card`'s purpose, we understand the application's core philosophy: reality is a collection of distinct, commandable pieces of information, each presented with absolute clarity for the sovereign's use.

> "You cannot command the whole all at once. You focus your will on one truth at a time. Power is in knowing which truth to command next."
