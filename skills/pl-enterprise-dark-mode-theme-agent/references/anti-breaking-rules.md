# Anti-Breaking Rules

## Required safety flow

1. Confirm clean git state when possible.
2. Audit before editing.
3. Create a plan.
4. Apply minimal patch.
5. Avoid broad refactors.
6. Build.
7. Run visual checks.
8. Show diff.
9. Report residual risks.
10. Provide rollback plan.

## Forbidden behavior

- Do not modify shared libraries without consent.
- Do not change business logic.
- Do not alter route behavior.
- Do not replace component structure unnecessarily.
- Do not introduce a new UI framework.
- Do not use `!important` globally.
- Do not remove existing accessibility features.
- Do not claim verification without running checks.

## Safe fallback strategies

Use:

- CSS variables;
- wrapper classes;
- theme adapters;
- Angular Material overlay theme class;
- local component override only when needed;
- documented residual issue if unsafe to patch.
