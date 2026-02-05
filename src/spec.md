# Specification

## Summary
**Goal:** Make “My Reports” functional and ensure users can clearly capture photos via the camera and access PDF inspection reports.

**Planned changes:**
- Replace the Dashboard “My Reports” placeholder route with a real Reports screen for authenticated users.
- Add a backend query API to return the current user’s DetailedInspection summaries (id, vehicle number, make/model, timestamp) with proper access control and empty-list handling.
- Wire the Dashboard inspections list and the Reports screen to the new summaries API, removing stubbed/always-empty frontend data hooks and adding clear loading/empty states.
- Clarify entry into the existing PhotoCapturePage during the inspection flow with clear English labels, consistent navigation, and actionable error messaging with retry when camera access is denied/unsupported.

**User-visible outcome:** Users can navigate to “My Reports,” see their inspection list, select an inspection to open its existing PDF preview, and clearly access the camera-based photo capture step during an inspection.
