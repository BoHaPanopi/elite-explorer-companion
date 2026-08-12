export const OGG_VOICE_REFERENCE_PROFILE = Object.freeze({
  highestQualityRule: "OGG must never sound artificial. Naturalness and character fidelity outrank technical convenience.",
  corePrinciple:
    "OGG does not perform a dialect. OGG sounds this way because he simply does not speak any other way.",
  character: Object.freeze([
    "calm",
    "grounded",
    "relaxed",
    "natural",
    "dry",
    "no_exaggerated_dialect_performance",
    "no_artificial_comic_bavarian",
    "no_announcer_effect",
  ]),
  speechFlow: Object.freeze([
    "somewhat_unhurried_not_sluggish",
    "connected_thought_over_isolated_words",
    "preserve_natural_oberland_carry_over",
    "short_lines_still_have_breathing_room",
    "no_nervous_acceleration_on_short_lines",
  ]),
  melodyAndEmphasis: Object.freeze([
    "relatively_calm_and_low",
    "no_exaggerated_high_low_jumps",
    "important_moments_may_take_more_space",
    "line_endings_settle_downward",
    "no_artificial_punchline_emphasis",
  ]),
  pauses: Object.freeze([
    "avoid_hard_artificial_pauses",
    "prefer_natural_transitions_delay_and_carry_over",
  ]),
  qualityPriority: Object.freeze([
    "timbre",
    "speech_flow",
    "sentence_melody",
    "dialect_pronunciation",
    "fine_tuning_pitch_and_tempo",
  ]),
  technicalStrategy: Object.freeze([
    "find_best_tts_voice_first",
    "optimize_against_reference_profile",
    "judge_against_human_reference_recordings",
    "never_bend_ogg_to_fit_technical_limitations",
  ]),
  fallbackRule:
    "If TTS cannot reproduce OGG credibly and naturally enough, no artificial-sounding compromise is acceptable. In that case, OGG lines may be produced long-term as real human recordings.",
  referenceSentences: Object.freeze([
    "Mid Geduid und Spugge werd des scho.",
    "Schau ma moi, wos uns do erwartet.",
    "Mia werggeln dro.",
  ]),
});