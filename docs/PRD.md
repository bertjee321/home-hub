# Smart Home OS - Foundation PRD

## 1. Architecture & Framework
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma (SQLite), React Server Components.
- **Pattern:** Clean architecture: `app` (API/pages), `domains` (business logic), `integrations` (external), `shared`.
- **Component Architecture:** Domain-driven grouping for reusable UI components (e.g., `src/domains/devices/components`).

## 2. Current State (Developed & Ready)
- **Architecture Scaffold:** Domains mapped out, DB configured locally.
- **HA Integration:** Connected via WebSockets (`ws`), streaming real-time states to the Next.js UI via Server-Sent Events (SSE). Client-side polling to API routes handles static data.
- **Auth:** Long-Lived Access Token mapped via `.env.local`.
- **Capabilities:**
  - **Opt-in Discover Flow:** Polls HA, saves configured "safe" entities into the local SQLite database.
  - **Grouping:** Support for creating custom groups and nested rendering on the dashboard.
  - **Basic Controls:** Move items between groups, basic ON/OFF toggling functionality.
  - **UI Template:** Dark-mode ready dashboard for rendering individual items.

## 3. To Be Developed (Planned Road Map)
### UI & Layout 
- **Navigation:** Implement a multi-page routing layout featuring a Sidebar for Desktop and a Bottom Tab Bar for Mobile screens.
- **Deeper Device Controls:** Introduce Modals / Bottom Sheets to surface deeper controls when a device card is interacted with (e.g., color wheels, temperature sliders, brightness levels for lights).
- **Dashboard Redesign (General Hub):**
  - Pivot from a purely device-listing home page to a **Macro Summary Hub**.
  - **Global Summaries:** High-level house metrics directly at the top (e.g., Total Energy consumption, Master "Toggle ALL" buttons, macro stats like "3/12 Lights On").
  - **Room/Zone Summaries:** Nested summary cards for individual groups/rooms underneath the global view.

### Pending Research & New Domains
- **Presence Detection ("Who's Home"):** Requires technical research into Home Assistant payloads to verify mapping against `person.*` vs `device_tracker.*` entities.
- **Future Integrations Roadmap:**
  - Climate (Thermostats, AC, heating)
  - Security (Cameras, Alarm panels)
  - Media (TVs, Audio, Smart Speakers)
  - Automations (Triggering Scenes directly from the OS)

## 4. Database & Storage (ORM)
- **Tech:** Prisma ORM with local SQLite.
- **Purpose:** 
  1. Storing historical timeseries analytics (energy logs).
  2. Storing logic/configurations locally (e.g., custom device grouping for lights).

## 5. Scaffold Structure
```text
/prisma
  schema.prisma
/src
  /app
    (UI Routing + API)
  /domains
    (Business logic, domain-specific UI components, services)
  /integrations
    (Home Assistant clients and mapping providers)
  /shared
    (DB singletons, utilities)
```
