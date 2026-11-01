# Desktop Onboarding

Assess onboarding whenever you add or materially change a desktop page, route, navigation entry, large component, core workflow, settings section or content-management feature.

## Rules

- Tours and message descriptors live in `onboardingConfig.ts`. `OnboardingOverlay` stays presentational and reusable runtime lives in `useOnboardingTour`; neither may branch on a step ID.
- Each guided target carries one stable `data-onboarding-id`, referenced as `targetId`, and is removed together with its step.
- Pick the interaction deliberately: `navigate` uses the real control and waits for its route, `activate` runs the control's own behaviour, `inspect` explains a region and lets any non-onboarding click advance without triggering the UI beneath.
- Branch with `branchByTarget` and `nextByCreationPath`, never hard-coded conditionals. A missing optional target times out and skips — it must not trap the tour or show placeholder copy.
- Do not navigate to the page that first-run or replay already opened; establish the route or modal first, then start on useful content.
- Keep step, target, interaction, expected route, branch and both locales' (`en-US`, `zh-CN`) FormatJS copy in sync. A major feature outside the first-run tour needs a contextual or replayable tour, or a note saying why none.
- Mascot assets go only through `OnboardingMascotStage`.

## Verify

Exercise first-run and replay modes, missing targets, narrow windows and guided modals after any target change. A guided modal must reserve room for the bottom dialogue rather than render beneath it.
