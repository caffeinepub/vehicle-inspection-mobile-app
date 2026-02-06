# Specification

## Summary
**Goal:** Fix the Photo Capture page so the device camera reliably starts, shows a live preview, and captures photos with clear, actionable error handling and lightweight diagnostics when initialization fails.

**Planned changes:**
- Diagnose and correct the camera start/preview/capture lifecycle in `frontend/src/pages/PhotoCapturePage.tsx` to ensure the preview becomes ready and capture works on supported browsers.
- Ensure the `useCamera` hook import path used by `PhotoCapturePage` (`../camera/useCamera`) exists/ships in production builds and that camera initialization failures map to supported error states (permission, not-found, not-supported, unknown) without uncaught exceptions.
- Add a collapsible, in-app “Diagnostics” section that appears only when camera initialization fails, showing secure context/API capability checks, accessible device count, and the last error message (no sensitive data).
- Ensure leaving the Photo Capture page stops the active camera stream and releases the device camera indicator.

**User-visible outcome:** Users can start the camera and see a live preview quickly, capture photos into the thumbnail grid with a success toast, and if the camera fails (permissions/unsupported/not found), they see a clear English message plus an optional diagnostics panel and can “Try Again” to recover.
