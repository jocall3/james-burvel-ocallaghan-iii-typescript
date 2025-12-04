
# The Citadel
*A Guide to the Security & Access Command*

---

## The Concept

The `SecurityView.tsx`, nicknamed "AegisVault," is the high-security command center of the application. Think of it as your Citadel, a fortified place to manage your keys, review who has been granted entry, and keep your domain safe and unbreachable. It provides clear, absolute controls for data access, account security, and activity monitoring.

---

### A Simple Metaphor: The Fortress Command

-   **The Sentry's Log (`Security Event Timeline`)**: This is the log from your fortress's main gate. It shows a clear, immutable history of every attempt to enter: successful entries, changes to the fortifications, and repelled attempts. This transparency gives you absolute confidence in your domain's security.

-   **The Fortress Gates (`Security Settings`)**: This section lets you control the very locks of your digital fortress.
    -   **Two-Factor Authentication (2FA)** is the inner gate, a second layer of defense beyond the outer wall.
    -   **Biometric Login** is a lock that opens only for the living essence of the sovereign.
    -   **Change Password** is the act of re-keying the entire fortress.

-   **The Diplomatic Roster (`Linked Accounts`)**: This shows which foreign powers (like budgeting or tax apps) you've granted a temporary key to. You can see exactly who has access, and with one command (`Unlink`), you can revoke their diplomatic credentials and expel them from your court at any time. You are always in absolute control.

---

### How It Works

1.  **Displaying Alliances**: The component gets the list of `linkedAccounts` from the `DataContext` and displays each one clearly, with a command to `unlinkAccount`. This gives the sovereign direct, irreversible control over their data treaties.

2.  **Managing Fortifications**: The `SecuritySettingToggle` is a reusable component that provides a consistent and clear way to engage or disengage security measures. The `ChangePasswordModal` provides a simple, focused interface for re-keying the fortress.

3.  **Showing Activity**: The view displays a clear, easy-to-read timeline of security events. Each event has a simple sigil to make its meaning obvious at a glance (e.g., a green seal for success, a red alert for a repelled attempt).

---

### The Philosophy: Command Through Clarity

Security can often feel complex and uncertain. The purpose of this view is to make it simple, transparent, and an instrument of power. By presenting security controls in plain language and giving the sovereign a clear view of all activity and data treaties, we replace fear with a feeling of calm command. A sovereign who understands their defenses is a sovereign who feels secure on their throne.
