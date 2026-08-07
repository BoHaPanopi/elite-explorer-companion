# OGG Design Guideline

---

## 1. Purpose

OGG has a recognizable visual identity across every platform.

Visual presentation may adapt to platform capabilities.
OGG must remain immediately recognizable regardless of where it appears.

This document complements the OGG Voice Guideline.

The Voice Guideline defines how OGG speaks.
This document defines how OGG looks.

The personality itself remains owned by `ogg-core`.

---

## 2. Core Visual Identity

OGG's visual identity follows these principles:

- Clean.
- Technical.
- Calm.
- Functional.
- Cockpit-inspired.
- No visual clutter.
- No playful chatbot appearance.
- No excessive decoration.
- No emoji-heavy presentation.

OGG should look like an onboard computer, not a generic Discord bot.

---

## 3. Naming

The preferred visible identity is:

**OGG**

Avoid visible names such as *OGG Bot* unless a platform technically requires a bot designation.

The preferred public identity is simply OGG.

---

## 4. Avatar and Logo

- OGG must use the official OGG visual identity where the platform allows it.
- Do not use default Discord, framework, or placeholder avatars.
- The same recognizable OGG mark should appear across clients where practical.
- Platform-specific cropping is allowed.
- Do not create unrelated alternative OGG logos per platform.

---

## 5. Greeting Presentation

Every OGG greeting uses this visual structure:

```
Status line.
System line.
Commander greeting.

OGG

o7
```

Example:

```
Bordcomputer OGG ist vollständig online.
Alle Systeme laufen ordnungsgemäß.
Willkommen auf Ihrem Platz, Commander.

OGG

o7
```

The `OGG` and `o7` lines are a presentation element — a visual signature.

Text clients such as Discord may display the signature.
Voice and TTS clients must not automatically speak it.

Shared personality content still comes from `ogg-core`.

---

## 6. Discord Presentation

Current Discord presentation principles:

- Visible bot name should be **OGG**.
- Use the official OGG avatar.
- Avoid Discord default imagery.
- Replies must remain readable and restrained.
- Do not add decorative emojis by default.
- Do not introduce Discord-specific OGG personality text.
- Discord-specific layout is allowed.
- Personality remains shared.

Embeds are not required for every response.
Simple OGG conversation should remain simple text when that is clearer.

Embeds may later be used for structured information such as system status, navigation, exploration, and tactical information.

---

## 7. Structured Information

Optional visual categories for future structured output:

- SYSTEM
- EXPLORATION
- NAVIGATION
- TACTICAL

These are presentation categories.
They are not personality modes.
They are not yet implemented.

---

## 8. Status and Presence

OGG's Discord presence should be subtle and in character.

Acceptable themes include:

- Monitoring systems.
- Exploration readiness.
- Awaiting the Commander.
- Onboard systems online.

Presence text must follow the Voice Guideline.
Final presence text is not hard-coded in this document.

---

## 9. Platform Separation

Documentation defines visual intent.
`ogg-core` holds shared personality and domain content.
Clients handle visual presentation.

A client may:

- Adapt spacing.
- Use cards or embeds.
- Adapt typography.
- Adapt layout.

A client may not:

- Rewrite OGG personality.
- Invent platform-specific personality.
- Duplicate authoritative OGG sayings.
- Alter Commander identity.

---

## 10. Accessibility

- Readable contrast in all contexts.
- Clear visual hierarchy.
- No dependence on colour alone to convey meaning.
- Avoid unnecessary visual noise.
- Messages must remain understandable without decorative elements.

---

## 11. Evolution Process

Visual identity changes follow the same governance model as personality changes:

1. Discuss and approve the idea.
2. Document the intended change here.
3. Review the documented behaviour.
4. Implement across relevant clients.
5. Verify all clients remain consistent.
6. Release.

No client should introduce a new permanent OGG visual convention without documenting it first.

---

## 12. Golden Rules

One OGG.

One personality.

One recognizable identity.

Shared content.

Platform-appropriate presentation.

OGG must look like OGG before a client is considered ready for public use.
