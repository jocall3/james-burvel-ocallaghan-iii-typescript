
# The Armory
*A Guide to the Instruments of Command*

---

## The Concept

The `Sidebar.tsx` component is the application's primary instrument panel—its armory. It provides a clear, consistent, and complete inventory of all the available domains and tools of power. Its purpose is to ensure the sovereign always knows what instruments are at their command and can summon them with a single decree.

---

### A Simple Metaphor: The Armory

Think of the `Sidebar` as the well-organized armory of a sovereign.

-   **Domains (`NavLink`)**: These are the primary weapons and instruments in the armory, each forged for a specific purpose like "Command Center" (Dashboard) or "The Citadel" (Security). Selecting one instantly equips it for use.

-   **Headers (`NavHeader`)**: These are the weapon racks (e.g., "Theater of Operations: Personal Finance"). They don't do anything themselves, but they organize the instruments into logical groups, making the armory easy to navigate in the heat of battle.

-   **Dividers (`NavDivider`)**: These are simply visual breaks that keep the armory clean and organized, ensuring every instrument is easy to find when needed.

---

### How It Works

-   **The Master Inventory (`NAV_ITEMS`)**: The Armory's structure is dictated by a single, central inventory list called `NAV_ITEMS` (located in `constants.tsx`). This is our "single source of truth" for what instruments exist. If we forge a new instrument and add it to that list, it automatically appears in the Armory, ready for use.

-   **Highlighting the Wielded Instrument**: The Armory always knows which instrument you are currently wielding (`activeView`). It highlights that item in the list, so you always have a clear sense of what power is currently in your hand.

-   **Tactical Deployment**: On large screens, the Armory is always visible, displaying your full range of options. On smaller screens, it retracts for tactical advantage, ready to be summoned with a single command.

---

### The Philosophy: Power Through Order

The design of the `Sidebar` is driven by a simple philosophy: a sovereign who knows what instruments they possess is a sovereign who can command effectively. By providing a persistent, well-organized inventory of power, we eliminate confusion and empower the user to wield the full capabilities of the application with speed and confidence.
