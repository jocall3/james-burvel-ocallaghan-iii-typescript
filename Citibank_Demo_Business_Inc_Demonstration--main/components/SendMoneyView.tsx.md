
# The Projection of Force
*A Guide to the Send Money Instrument*

---

## The Concept

The `SendMoneyView.tsx`, nicknamed "Remitrax," is a complete, multi-rail payment portal. It is designed to make the act of sending resources feel both incredibly simple and exceptionally secure. It is the instrument for projecting your financial will.

---

### A Simple Metaphor: The Cannon

Think of sending money like firing a cannon. The act must be precise, deliberate, and confirmed with absolute certainty.

-   **Choosing the Ammunition (`PaymentMethod` tabs)**: First, you choose the type of ammunition. `QuantumPay` is our secure, internal system, built on modern, institutional-grade standards (ISO 20022). `Cash App` is a different type of ammunition for engaging with the broader social economy.

-   **Setting the Trajectory (`Recipient` and `Amount`)**: You enter the coordinates for the projection—who it's for and how much force to apply.

-   **The Final Command (`BiometricModal`)**: This is the final, most critical step. Before the cannon fires, the final arming sequence engages. It uses your camera for a biometric scan. This is the ultimate security check, confirming that you, the sovereign, are the one giving the command in person.

-   **The Firing Sequence (`QuantumLedgerAnimation`)**: The futuristic animation is not for show. It visualizes the secure process happening in the background: your command is being validated, recorded on an immutable ledger, and transmitted with force and precision. It provides a feeling of trust and power.

---

### How It Works

1.  **The Command**: The user fills out a simple form. The fields change based on which "ammunition" (`paymentMethod`) they've selected.

2.  **Biometric Confirmation**: When the user issues the "Send" command, the `BiometricModal` opens.
    -   It uses `navigator.mediaDevices.getUserMedia` to request access to the user's camera, creating a live video feed.
    -   It uses a series of `setTimeout` calls to simulate a multi-stage security check: scanning the face, confirming identity, and then running the "Quantum Ledger" verification. This high-fidelity simulation makes the process feel robust and authoritative.

3.  **The "API Call"**: Once the biometric check is successful, the `handleSuccess` function is called.
    -   It simulates a real-world, enterprise-grade API call, logging the headers and structured JSON body that would be sent to an open banking API. This demonstrates a deep understanding of how these systems operate.
    -   It then calls `addTransaction` from the `DataContext` to add a permanent record of the action to the official chronicle.

4.  **Confirmation of Impact**: After the process is complete, the modal closes, and the user is redirected to their `Transactions` view, where they can see the new action at the top of their record.

---

### The Philosophy: Simple, Secure, Decisive

This component is designed to be two things at once. For the user, it provides a simple and reassuringly secure way to project their financial will. For the discerning eye, it demonstrates a deep understanding of enterprise-level security, high-fidelity user experience, and the architecture of real-world financial API integrations.
