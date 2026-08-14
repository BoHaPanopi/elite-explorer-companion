# Security Model

This document publicly describes the binding security philosophy and trust model of Elite Explorer Companion.

It is intentionally transparent about principles, trust boundaries, and allowed behavior while avoiding secrets, exploit instructions, and sensitive internal details that would directly weaken the project.

## Purpose

Security is a cross-cutting product principle across all versions.

It is especially relevant to:

- Alpha 0.15: bind security fundamentals for the onboard computer and crew architecture.
- Alpha 0.19: define integration allowlists, local grants, secure transport boundaries, and revocable permissions.
- 1.0: complete release and installer signing, production-grade update integrity, and full security/privacy documentation.

Security is not a separate app alpha.

## Core Principles

### Least Privilege

The application should be designed according to least privilege.

- Normal operation runs with normal user rights.
- Elevated privileges must never be a blanket prerequisite for ordinary use.
- Every feature should receive only the permissions it actually needs.
- New integrations must not inherit existing permissions automatically.

### Local Processing

Local data should remain local whenever possible.

- Elite Dangerous journal data, Commander data, profile data, usage data, and configuration data are not transferred outside Elite Explorer Companion unless the Commander has explicitly approved the transfer.
- The Commander decides which data may be transferred to which external service.
- Without explicit approval, no external data transfer takes place.
- No hidden telemetry.
- No undocumented background transfer.
- External communication must have an explicit functional reason and be documented.

### Fail Closed

When the system is uncertain whether an action is valid, allowed, or safely interpretable, it must refuse the action.

Fail closed takes precedence over permissive fallback behavior.

## Trust Boundaries

The project should preserve a clear trust boundary between local source data, core application logic, internal commands, and optional integrations.

Text model:

```text
Elite Dangerous Journal / local files
        ↓
Elite Explorer Companion Core
        ↓
explicitly allowed internal commands
        ↓
optional integrations
```

External input must never be forwarded directly into operating-system functions or arbitrary command execution.

## Integration Boundary

VoiceAttack, Stream Deck, Discord, mobile devices, and later integrations must stay behind an explicit interface boundary.

Binding rules:

- Each integration receives only explicitly allowed functions.
- Commands follow an explicit allowlist model.
- Unknown, malformed, or not explicitly allowed commands are rejected.
- Integrations must not become a generic remote-control layer for the user's computer.
- Local grants and permissions should be understandable, reviewable, and revocable.

### Onboard Computer, Crew, and Journal Data

The onboard computer and crew's internal processing is distinct from external integrations.

- The onboard computer and its crew may read and use Elite Dangerous journal data internally when the Commander has allowed local journal access.
- This processing takes place within Elite Explorer Companion and is therefore not an external data transfer.
- Each crew member may use only the locally available journal data needed for their assigned task: Anna for exobiology, local analysis, and predictions; Willi for navigation and journey history; Susanne for ship condition; and Sebastian for weapons and equipment.
- The Commander must be able to understand which journal data the onboard computer and crew use internally and for what purpose.
- The data-flow detail view must provide a dedicated internal area for the onboard computer and crew, separate from every external grant.

### External Services and Data Grants

Discord, Twitch, and every future external integration are separate from the onboard computer and crew's internal processing. For each external integration:

- The Commander must explicitly approve the integration.
- Approval is specific to that service and must show which data may be transferred, where it goes, and for what purpose.
- One integration must never inherit or reuse another integration's approval automatically.
- No approval means no transfer.
- Approval must be revocable.
- After revocation, the affected data must no longer be transferred to that service.

Elite Explorer Companion does not independently decide to publish data. It provides controlled mechanisms through which the Commander may send only data they have approved for the selected service.

## Allowlist Model

The trust model is allowlist-first, not open-ended.

That means:

- Actions are implemented intentionally.
- Actions are exposed intentionally.
- Integrations can call only actions that were deliberately approved.
- Missing approval means no execution.

This principle applies to current and future integrations alike.

The same model applies to external data flows:

- External functions receive only explicitly allowed data and capabilities.
- There are no implicit permissions or hidden transfers.
- New integrations start without grants and never receive existing grants automatically.
- Missing, invalid, uncertain, or revoked grants fail closed.

## Permanent Data-Flow Status

The current data-flow status must always be visible to the Commander.

The status is permanently displayed at the bottom of:

- Command Center,
- Navigation,
- Settings,
- future main views,
- narrow and responsive layouts.

Design requirements:

- Place the status in the fixed lower area near the version display.
- Make it slightly larger and clearer than the version number, while keeping it visually subordinate to the page's primary content.
- Preserve the OGG design and existing color and layout rules.
- When no external grant is active, state unambiguously that the data remains local.
- When one or more external grants are active, do not make a blanket "Local only" claim; show that external data paths have been approved.

## Data-Flow Detail View

The permanent data-flow status is intended to become interactive. Its detail view must make this path understandable:

```text
data source -> internal use -> storage/processing -> approved external destination, if any
```

The view must clearly separate:

### Onboard Computer and Crew / Internal

Journal access and internal processing within Elite Explorer Companion, including the task-specific purposes assigned to Anna, Willi, Susanne, and Sebastian. Local permission does not imply an external grant.

### External Grants

Discord, Twitch, and future integrations, with the actual grant status visible separately for every integration.

## No Arbitrary Shell Execution

OGG, voice control, AI components, and integrations must never execute arbitrary:

- PowerShell commands
- CMD commands
- shell commands
- scripts

from natural-language input, external messages, or integration payloads.

Operating-system actions, if ever supported, must be explicitly implemented, bounded, and individually allowed.

No part of the product may translate open-ended user wording into unrestricted command execution on the host computer.

## Secrets

The public repository must never contain real:

- Discord tokens
- API keys
- passwords
- private keys
- credentials
- personal authentication data
- other secrets

Rules:

- Real `.env` files remain local and must be ignored by Git.
- `.env.example` may contain placeholders only.
- Issues, discussions, pull requests, screenshots, and shared logs must never include live secrets.

## Update Trust

Updates must only come from defined and verifiable sources.

Binding expectations:

- Update integrity must be verifiable.
- Suspected manipulation or invalid update state must cause a safe abort.
- The project must not silently execute unknown downloads.
- Long-term direction is signed releases and signed installers for public stable versions.

## Release Signing

Stable public releases should provide code-signing and/or installer-signing where practical.

Goal:

Users should be able to verify that a published application actually comes from the Elite Explorer Companion project and has not been modified.

Alpha versions may be explicitly labeled as development software.

## Dependency Security

Dependencies should be kept under regular security review.

- Check dependencies for known vulnerabilities on a regular basis.
- Do not delay security updates without a reason.
- Add new dependencies only for a clear, documented purpose.
- Prefer a smaller attack surface where practical.

## Privacy and Data Minimization

Privacy follows data minimization.

- Do not collect personal data without a functional need.
- Keep local data local where possible.
- Diagnostic exports should be understandable and should avoid unnecessary personal information.
- Documentation should explain which external connections are necessary and why.

## Public Transparency

The open-source repository should publicly show, at a principle level:

- which rights the application needs,
- which data is processed locally,
- which integrations exist,
- which external connections are necessary,
- which security boundaries apply.

Transparency does not mean publishing:

- secrets,
- exploit playbooks,
- deliberately weakened protections,
- internal security details whose publication would directly enable abuse.

## Version Mapping

### Alpha 0.15

Alpha 0.15 binds the security fundamentals:

- least privilege,
- local processing,
- fail-closed behavior,
- explicit trust boundaries,
- prohibition of arbitrary shell execution.

### Alpha 0.19

Alpha 0.19 is the main integration-hardening milestone:

- explicit allowlists,
- local grants,
- secure transport boundary,
- revocable permissions.

### 1.0

Trusted production maturity requires:

- release and installer signing,
- production-grade update integrity,
- complete public security and privacy documentation.
