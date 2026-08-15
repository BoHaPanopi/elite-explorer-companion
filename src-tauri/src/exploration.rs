use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SystemScanState {
    #[default]
    Undiscovered,
    PartiallyDiscovered,
    FullyDiscovered,
}

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DiscoveryState {
    #[default]
    Undiscovered,
    DiscoveredByOtherCommander,
    FirstDiscoveredByCurrentCommander,
    PreviouslyDiscoveredOwnershipUnknown,
}

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MappingState {
    #[default]
    NotMapped,
    ScannedNotMapped,
    MappedByOtherCommander,
    FirstMappedByCurrentCommander,
    PreviouslyMappedOwnershipUnknown,
}

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum BiologyState {
    #[default]
    NoneDetected,
    SignalsPresent,
}

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum BiologyFindingState {
    #[default]
    None,
    Unknown,
    Known,
    New,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ExplorationObservationKind {
    FirstDiscoveryByCurrentCommander,
    AlreadyDiscovered,
    DiscoveryOwnershipUnknown,
    ScannedNotMapped,
    FirstMappingByCurrentCommander,
    AlreadyMapped,
    MappingOwnershipUnknown,
    BiologicalSignals,
    KnownBiologicalFinding,
    NewBiologicalFinding,
    OrganicProbeProgress,
    OrganicAnalysisComplete,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct BodyExplorationState {
    pub body_id: u64,
    pub body_name: String,
    pub discovery: DiscoveryState,
    pub mapping: MappingState,
    pub biology: BiologyState,
    pub biology_finding: BiologyFindingState,
    pub biological_signal_count: Option<u32>,
    pub confirmed_genera: Vec<String>,
    pub composition_species: Option<String>,
    pub codex_entry_name: Option<String>,
    pub voucher_amount: Option<u64>,
    pub organic_probe_stage: Option<u8>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExplorationObservationDetails {
    pub biological_signal_count: Option<u32>,
    pub confirmed_genera: Vec<String>,
    pub composition_species: Option<String>,
    pub codex_entry_name: Option<String>,
    pub voucher_amount: Option<u64>,
    pub remaining_biological_bodies: Option<u32>,
    pub probe_stage: Option<u8>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExplorationObservation {
    pub id: String,
    pub kind: ExplorationObservationKind,
    pub body_id: Option<u64>,
    pub body_name: Option<String>,
    pub details: ExplorationObservationDetails,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExplorationBodySnapshot {
    pub body_id: u64,
    pub body_name: String,
    pub discovery: DiscoveryState,
    pub mapping: MappingState,
    pub biology: BiologyState,
    pub biological_signal_count: Option<u32>,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExobioBodySnapshot {
    pub body_id: u64,
    pub body_name: String,
    pub biology_finding: BiologyFindingState,
    pub confirmed_genera: Vec<String>,
    pub composition_species: Option<String>,
    pub codex_entry_name: Option<String>,
    pub voucher_amount: Option<u64>,
    pub organic_probe_stage: Option<u8>,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExobioSnapshot {
    pub bodies: Vec<ExobioBodySnapshot>,
    pub latest_exobio_observation: Option<ExplorationObservation>,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExplorationSnapshot {
    pub system_scan: SystemScanState,
    pub bodies: Vec<ExplorationBodySnapshot>,
    pub latest_exploration_observation: Option<ExplorationObservation>,
    pub exobio: ExobioSnapshot,
    // Temporary compatibility bridge. Remove only after both domain migrations
    // have independently proven semantic parity with this legacy mixed stream.
    pub latest_observation: Option<ExplorationObservation>,
}

#[derive(Debug, Default)]
pub struct ExplorationTracker {
    commander: Option<String>,
    system_scan: SystemScanState,
    bodies: BTreeMap<u64, BodyExplorationState>,
    latest_exploration_observation: Option<ExplorationObservation>,
    latest_exobio_observation: Option<ExplorationObservation>,
    latest_observation: Option<ExplorationObservation>,
}

impl ExplorationTracker {
    pub fn apply(&mut self, event: &Value) {
        let event_name = string(event, "event").unwrap_or_default();

        match event_name {
            "Commander" | "LoadGame" => {
                if let Some(name) = journal_commander_name(event) {
                    self.commander = Some(name.to_string());
                }
            }
            "FSDJump" | "CarrierJump" | "Location" => {
                self.system_scan = SystemScanState::Undiscovered;
                self.bodies.clear();
                self.latest_exploration_observation = None;
                self.latest_exobio_observation = None;
                self.latest_observation = None;
            }
            "DiscoveryScan" => self.system_scan = SystemScanState::PartiallyDiscovered,
            "FSSDiscoveryScan" => {
                self.system_scan =
                    if event.get("Progress").and_then(Value::as_f64).unwrap_or(0.0) >= 1.0 {
                        SystemScanState::FullyDiscovered
                    } else {
                        SystemScanState::PartiallyDiscovered
                    };
            }
            "FSSAllBodiesFound" => self.system_scan = SystemScanState::FullyDiscovered,
            "Scan" => self.apply_scan(event),
            "SAAScanComplete" => self.apply_mapping(event),
            "FSSBodySignals" => self.apply_exploration_signals(event),
            "SAASignalsFound" => self.apply_signals(event),
            "CodexEntry" => self.apply_codex_entry(event),
            "ScanOrganic" => self.apply_scan_organic(event),
            _ => {}
        }
    }

    pub fn finish(self) -> ExplorationSnapshot {
        let bodies = self.bodies.into_values().collect::<Vec<_>>();
        ExplorationSnapshot {
            system_scan: self.system_scan,
            bodies: bodies.iter().map(ExplorationBodySnapshot::from).collect(),
            latest_exploration_observation: self.latest_exploration_observation,
            exobio: ExobioSnapshot {
                bodies: bodies.iter().map(ExobioBodySnapshot::from).collect(),
                latest_exobio_observation: self.latest_exobio_observation,
            },
            latest_observation: self.latest_observation,
        }
    }

    fn apply_scan(&mut self, event: &Value) {
        let Some(body_id) = number(event, "BodyID") else {
            return;
        };
        let body_name = string(event, "BodyName").unwrap_or_default().to_string();
        let was_discovered = event.get("WasDiscovered").and_then(Value::as_bool);
        let was_mapped = event.get("WasMapped").and_then(Value::as_bool);
        let commander = self.commander.clone();
        let discoverers = names(event, "Discoverers");

        let discovery = match was_discovered {
            Some(false) => DiscoveryState::FirstDiscoveredByCurrentCommander,
            Some(true) if contains_commander(&discoverers, commander.as_deref()) => {
                DiscoveryState::FirstDiscoveredByCurrentCommander
            }
            Some(true) if !discoverers.is_empty() => DiscoveryState::DiscoveredByOtherCommander,
            Some(true) => DiscoveryState::PreviouslyDiscoveredOwnershipUnknown,
            None => DiscoveryState::Undiscovered,
        };
        let mapping = match was_mapped {
            Some(false) => MappingState::ScannedNotMapped,
            Some(true) => MappingState::PreviouslyMappedOwnershipUnknown,
            None => MappingState::NotMapped,
        };

        let body = self.body(body_id, &body_name);
        body.discovery = discovery;
        body.mapping = mapping;

        let kind = match body.discovery {
            DiscoveryState::FirstDiscoveredByCurrentCommander => {
                ExplorationObservationKind::FirstDiscoveryByCurrentCommander
            }
            _ if body.mapping == MappingState::ScannedNotMapped => {
                ExplorationObservationKind::ScannedNotMapped
            }
            DiscoveryState::DiscoveredByOtherCommander => {
                ExplorationObservationKind::AlreadyDiscovered
            }
            DiscoveryState::PreviouslyDiscoveredOwnershipUnknown => {
                ExplorationObservationKind::DiscoveryOwnershipUnknown
            }
            DiscoveryState::Undiscovered => return,
        };
        self.observe(
            event,
            kind,
            Some(body_id),
            Some(body_name),
            ExplorationObservationDetails::default(),
        );
    }

    fn apply_mapping(&mut self, event: &Value) {
        let Some(body_id) = number(event, "BodyID") else {
            return;
        };
        let body_name = string(event, "BodyName").unwrap_or_default().to_string();
        let commander = self.commander.clone();
        let discoverers = names(event, "Discoverers");
        let mappers = names(event, "Mappers");
        let previous_mapping = self
            .bodies
            .get(&body_id)
            .map(|body| body.mapping)
            .unwrap_or_default();

        let body = self.body(body_id, &body_name);
        if contains_commander(&discoverers, commander.as_deref()) {
            body.discovery = DiscoveryState::FirstDiscoveredByCurrentCommander;
        } else if !discoverers.is_empty() {
            body.discovery = DiscoveryState::DiscoveredByOtherCommander;
        }

        let mapping = if contains_commander(&mappers, commander.as_deref())
            || (mappers.is_empty()
                && (event.get("Mappers").is_some()
                    || previous_mapping == MappingState::ScannedNotMapped))
        {
            MappingState::FirstMappedByCurrentCommander
        } else if !mappers.is_empty() {
            MappingState::MappedByOtherCommander
        } else {
            MappingState::PreviouslyMappedOwnershipUnknown
        };
        body.mapping = mapping;
        let kind = match body.mapping {
            MappingState::FirstMappedByCurrentCommander => {
                ExplorationObservationKind::FirstMappingByCurrentCommander
            }
            MappingState::MappedByOtherCommander => ExplorationObservationKind::AlreadyMapped,
            _ => ExplorationObservationKind::MappingOwnershipUnknown,
        };
        self.observe(
            event,
            kind,
            Some(body_id),
            Some(body_name),
            ExplorationObservationDetails::default(),
        );
    }

    fn apply_signals(&mut self, event: &Value) {
        let Some(body_id) = number(event, "BodyID") else {
            return;
        };
        let has_biology = event
            .get("Signals")
            .and_then(Value::as_array)
            .is_some_and(|signals| {
                signals.iter().any(|signal| {
                    string(signal, "Type")
                        .is_some_and(|kind| kind.to_ascii_lowercase().contains("biological"))
                })
            })
            || event
                .get("Genuses")
                .and_then(Value::as_array)
                .is_some_and(|genuses| !genuses.is_empty());
        if !has_biology {
            return;
        }

        let body_name = string(event, "BodyName").unwrap_or_default().to_string();
        let biological_signal_count =
            event
                .get("Signals")
                .and_then(Value::as_array)
                .map(|signals| {
                    signals.iter().fold(0_u32, |total, signal| {
                        total
                            + signal
                                .get("Count")
                                .and_then(Value::as_u64)
                                .map(|count| count as u32)
                                .unwrap_or(1)
                    })
                });
        let confirmed_genera = names(event, "Genuses");
        let details = ExplorationObservationDetails {
            biological_signal_count,
            confirmed_genera: confirmed_genera.clone(),
            ..ExplorationObservationDetails::default()
        };

        let body = self.body(body_id, &body_name);
        body.biology = BiologyState::SignalsPresent;
        body.biological_signal_count = biological_signal_count;
        if !confirmed_genera.is_empty() {
            body.confirmed_genera = confirmed_genera.clone();
        }

        let kind = if confirmed_genera.is_empty() {
            ExplorationObservationKind::BiologicalSignals
        } else {
            ExplorationObservationKind::KnownBiologicalFinding
        };
        self.observe(event, kind, Some(body_id), Some(body_name), details);
    }

    fn apply_exploration_signals(&mut self, event: &Value) {
        let Some(body_id) = number(event, "BodyID") else {
            return;
        };
        let body_name = string(event, "BodyName").unwrap_or_default().to_string();
        let biological_signal_count =
            event
                .get("Signals")
                .and_then(Value::as_array)
                .map(|signals| {
                    signals.iter().fold(0_u32, |total, signal| {
                        if string(signal, "Type")
                            .is_some_and(|kind| kind.to_ascii_lowercase().contains("biological"))
                        {
                            total
                                + signal
                                    .get("Count")
                                    .and_then(Value::as_u64)
                                    .map(|count| count as u32)
                                    .unwrap_or(1)
                        } else {
                            total
                        }
                    })
                });
        let has_biology = biological_signal_count.is_some_and(|count| count > 0)
            || event
                .get("Genuses")
                .and_then(Value::as_array)
                .is_some_and(|genuses| !genuses.is_empty());
        if !has_biology {
            return;
        }

        let body = self.body(body_id, &body_name);
        body.biology = BiologyState::SignalsPresent;
        body.biological_signal_count = biological_signal_count;
        // FSS signals are Exploration facts. They intentionally do not create a
        // legacy/Anna observation, preserving the current productive behaviour.
        self.latest_exploration_observation = Some(self.make_observation(
            event,
            ExplorationObservationKind::BiologicalSignals,
            Some(body_id),
            Some(body_name),
            ExplorationObservationDetails {
                biological_signal_count,
                ..ExplorationObservationDetails::default()
            },
        ));
    }

    fn apply_codex_entry(&mut self, event: &Value) {
        let is_biology = string(event, "Category")
            .is_some_and(|category| category.to_ascii_lowercase().contains("biology"))
            || string(event, "Category_Localised")
                .is_some_and(|category| category.to_ascii_lowercase().contains("biolog"));
        if !is_biology {
            return;
        }
        let body_id = number(event, "BodyID");
        let codex_entry_name = string(event, "Name_Localised")
            .or_else(|| string(event, "Category_Localised"))
            .map(str::to_string);
        let voucher_amount = event.get("VoucherAmount").and_then(Value::as_u64);
        let finding = if event.get("IsNewEntry").and_then(Value::as_bool) == Some(true)
            || event.get("NewTraitsDiscovered").and_then(Value::as_bool) == Some(true)
        {
            BiologyFindingState::New
        } else if event.get("IsNewEntry").and_then(Value::as_bool) == Some(false) {
            BiologyFindingState::Known
        } else {
            // Codex biology entries can be relevant even without explicit new/known flags.
            BiologyFindingState::Known
        };
        if let Some(body_id) = body_id {
            let body = self.body(body_id, "");
            body.biology = BiologyState::SignalsPresent;
            body.biology_finding = finding;
            body.codex_entry_name = codex_entry_name.clone();
            body.voucher_amount = voucher_amount;
        }
        let kind = match finding {
            BiologyFindingState::New => ExplorationObservationKind::NewBiologicalFinding,
            BiologyFindingState::Known => ExplorationObservationKind::KnownBiologicalFinding,
            _ => ExplorationObservationKind::KnownBiologicalFinding,
        };
        self.observe(
            event,
            kind,
            body_id,
            string(event, "Name_Localised").map(str::to_string),
            ExplorationObservationDetails {
                codex_entry_name,
                voucher_amount,
                ..ExplorationObservationDetails::default()
            },
        );
    }

    fn apply_scan_organic(&mut self, event: &Value) {
        let Some(body_id) = number(event, "BodyID").or_else(|| number(event, "Body")) else {
            return;
        };
        let body_name = string(event, "BodyName")
            .or_else(|| string(event, "Body"))
            .unwrap_or_default()
            .to_string();
        let previous_stage = self
            .bodies
            .get(&body_id)
            .and_then(|body| body.organic_probe_stage)
            .unwrap_or(0);
        let was_logged = event
            .get("WasLogged")
            .and_then(Value::as_bool)
            .unwrap_or(false);
        let probe_stage = event
            .get("ScanStage")
            .and_then(Value::as_u64)
            .map(|stage| stage.min(3) as u8)
            .or_else(|| {
                string(event, "ScanType").and_then(|scan_type| {
                    match scan_type.to_ascii_lowercase().as_str() {
                        "log" if was_logged => Some(previous_stage.max(1)),
                        "log" => Some(previous_stage.saturating_add(1).clamp(1, 3)),
                        "sample" => Some(3),
                        _ => None,
                    }
                })
            });
        let analysis_complete = event
            .get("AnalysisComplete")
            .and_then(Value::as_bool)
            .unwrap_or(false)
            || probe_stage == Some(3);
        let species = string(event, "Species_Localised")
            .or_else(|| string(event, "Species"))
            .map(str::to_string);
        let voucher_amount = event.get("VoucherAmount").and_then(Value::as_u64);
        let remaining_biological_bodies = event
            .get("RemainingBiologicalBodies")
            .and_then(Value::as_u64)
            .map(|count| count as u32);

        let body = self.body(body_id, &body_name);
        body.biology = BiologyState::SignalsPresent;
        body.composition_species = species.clone();
        body.voucher_amount = voucher_amount.or(body.voucher_amount);
        body.organic_probe_stage = probe_stage;

        self.observe(
            event,
            if analysis_complete {
                ExplorationObservationKind::OrganicAnalysisComplete
            } else {
                ExplorationObservationKind::OrganicProbeProgress
            },
            Some(body_id),
            Some(body_name),
            ExplorationObservationDetails {
                composition_species: species,
                voucher_amount,
                remaining_biological_bodies,
                probe_stage,
                ..ExplorationObservationDetails::default()
            },
        );
    }

    fn body(&mut self, body_id: u64, body_name: &str) -> &mut BodyExplorationState {
        let body = self
            .bodies
            .entry(body_id)
            .or_insert_with(|| BodyExplorationState {
                body_id,
                ..BodyExplorationState::default()
            });
        if !body_name.is_empty() {
            body.body_name = body_name.to_string();
        }
        body
    }

    fn observe(
        &mut self,
        event: &Value,
        kind: ExplorationObservationKind,
        body_id: Option<u64>,
        body_name: Option<String>,
        details: ExplorationObservationDetails,
    ) {
        let observation = self.make_observation(event, kind, body_id, body_name, details);
        if is_exploration_observation(kind) {
            self.latest_exploration_observation = Some(observation.clone());
        }
        if is_exobio_observation(kind) {
            self.latest_exobio_observation = Some(observation.clone());
        }
        self.latest_observation = Some(observation);
    }

    fn make_observation(
        &self,
        event: &Value,
        kind: ExplorationObservationKind,
        body_id: Option<u64>,
        body_name: Option<String>,
        details: ExplorationObservationDetails,
    ) -> ExplorationObservation {
        let timestamp = string(event, "timestamp").unwrap_or("unknown");
        let event_name = string(event, "event").unwrap_or("unknown");
        let detail_key = format!(
            "{}:{}:{}:{}",
            details
                .probe_stage
                .map(|value| value.to_string())
                .unwrap_or_default(),
            details
                .codex_entry_name
                .as_deref()
                .or(details.composition_species.as_deref())
                .unwrap_or_default(),
            details
                .biological_signal_count
                .map(|value| value.to_string())
                .unwrap_or_default(),
            details.confirmed_genera.join("|")
        );
        ExplorationObservation {
            id: format!(
                "{timestamp}:{event_name}:{}:{kind:?}:{detail_key}",
                body_id.map(|id| id.to_string()).unwrap_or_default(),
            ),
            kind,
            body_id,
            body_name,
            details,
        }
    }
}

impl From<&BodyExplorationState> for ExplorationBodySnapshot {
    fn from(body: &BodyExplorationState) -> Self {
        Self {
            body_id: body.body_id,
            body_name: body.body_name.clone(),
            discovery: body.discovery,
            mapping: body.mapping,
            biology: body.biology,
            biological_signal_count: body.biological_signal_count,
        }
    }
}

impl From<&BodyExplorationState> for ExobioBodySnapshot {
    fn from(body: &BodyExplorationState) -> Self {
        Self {
            body_id: body.body_id,
            body_name: body.body_name.clone(),
            biology_finding: body.biology_finding,
            confirmed_genera: body.confirmed_genera.clone(),
            composition_species: body.composition_species.clone(),
            codex_entry_name: body.codex_entry_name.clone(),
            voucher_amount: body.voucher_amount,
            organic_probe_stage: body.organic_probe_stage,
        }
    }
}

fn is_exploration_observation(kind: ExplorationObservationKind) -> bool {
    matches!(
        kind,
        ExplorationObservationKind::FirstDiscoveryByCurrentCommander
            | ExplorationObservationKind::AlreadyDiscovered
            | ExplorationObservationKind::DiscoveryOwnershipUnknown
            | ExplorationObservationKind::ScannedNotMapped
            | ExplorationObservationKind::FirstMappingByCurrentCommander
            | ExplorationObservationKind::AlreadyMapped
            | ExplorationObservationKind::MappingOwnershipUnknown
            | ExplorationObservationKind::BiologicalSignals
    )
}

fn is_exobio_observation(kind: ExplorationObservationKind) -> bool {
    matches!(
        kind,
        // BiologicalSignals is a shared raw fact: Exploration retains the
        // signal state, while Anna receives the same event through Exobio.
        ExplorationObservationKind::BiologicalSignals
            | ExplorationObservationKind::KnownBiologicalFinding
            | ExplorationObservationKind::NewBiologicalFinding
            | ExplorationObservationKind::OrganicProbeProgress
            | ExplorationObservationKind::OrganicAnalysisComplete
    )
}

fn string<'a>(value: &'a Value, key: &str) -> Option<&'a str> {
    value.get(key).and_then(Value::as_str)
}

pub(crate) fn journal_commander_name(event: &Value) -> Option<&str> {
    let name = match string(event, "event")? {
        "Commander" => string(event, "Name"),
        "LoadGame" => string(event, "Commander").or_else(|| string(event, "Name")),
        _ => None,
    }?;
    let normalized = name.trim();
    (!normalized.is_empty()).then_some(normalized)
}
fn number(value: &Value, key: &str) -> Option<u64> {
    value.get(key).and_then(Value::as_u64)
}

fn names(value: &Value, key: &str) -> Vec<String> {
    value
        .get(key)
        .and_then(Value::as_array)
        .map(|items| {
            items
                .iter()
                .filter_map(|item| item.as_str().or_else(|| string(item, "Name")))
                .map(str::to_string)
                .collect()
        })
        .unwrap_or_default()
}

fn contains_commander(names: &[String], commander: Option<&str>) -> bool {
    commander.is_some_and(|commander| {
        names
            .iter()
            .any(|name| name.eq_ignore_ascii_case(commander))
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn tracker_with_commander() -> ExplorationTracker {
        let mut tracker = ExplorationTracker::default();
        tracker.apply(&json!({"event":"Commander","Name":"Panopi"}));
        tracker
    }

    #[test]
    fn reads_and_preserves_commander_names_from_both_journal_events() {
        assert_eq!(
            journal_commander_name(&json!({"event":"Commander","Name":"helitony"})),
            Some("helitony")
        );
        assert_eq!(
            journal_commander_name(&json!({"event":"LoadGame","Commander":"Helitony2"})),
            Some("Helitony2")
        );
        assert_eq!(
            journal_commander_name(&json!({"event":"LoadGame","Name":"legacy-name"})),
            Some("legacy-name")
        );
        assert_eq!(
            journal_commander_name(&json!({"event":"Commander","Name":"  HELITONY  "})),
            Some("HELITONY")
        );
        assert_eq!(
            journal_commander_name(&json!({"event":"LoadGame","Commander":"\tHelitony2\r\n"})),
            Some("Helitony2")
        );
        assert_eq!(
            journal_commander_name(&json!({"event":"Commander","Name":"   "})),
            None
        );
    }

    #[test]
    fn distinguishes_current_and_existing_discovery_without_guessing_ownership() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"timestamp":"1","event":"Scan","BodyID":1,"BodyName":"New","WasDiscovered":false,"WasMapped":false}));
        tracker.apply(&json!({"timestamp":"2","event":"Scan","BodyID":2,"BodyName":"Known","WasDiscovered":true,"WasMapped":false}));
        tracker.apply(&json!({"timestamp":"2b","event":"SAAScanComplete","BodyID":2,"BodyName":"Known","Discoverers":["Other CMDR"],"Mappers":[]}));
        tracker.apply(&json!({"timestamp":"3","event":"Scan","BodyID":3,"BodyName":"Prior","WasDiscovered":true,"WasMapped":true}));
        let snapshot = tracker.finish();
        assert_eq!(
            snapshot.bodies[0].discovery,
            DiscoveryState::FirstDiscoveredByCurrentCommander
        );
        assert_eq!(
            snapshot.bodies[1].discovery,
            DiscoveryState::DiscoveredByOtherCommander
        );
        assert_eq!(
            snapshot.bodies[2].discovery,
            DiscoveryState::PreviouslyDiscoveredOwnershipUnknown
        );
    }

    #[test]
    fn distinguishes_unmapped_and_mapping_ownership() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"timestamp":"1","event":"Scan","BodyID":1,"BodyName":"One","WasDiscovered":true,"WasMapped":false}));
        tracker.apply(&json!({"timestamp":"2","event":"SAAScanComplete","BodyID":1,"BodyName":"One","Discoverers":["Other"],"Mappers":[]}));
        tracker.apply(&json!({"timestamp":"3","event":"SAAScanComplete","BodyID":2,"BodyName":"Two","Discoverers":["Other"],"Mappers":["Other"]}));
        let snapshot = tracker.finish();
        assert_eq!(
            snapshot.bodies[0].mapping,
            MappingState::FirstMappedByCurrentCommander
        );
        assert_eq!(
            snapshot.bodies[1].mapping,
            MappingState::MappedByOtherCommander
        );
    }

    #[test]
    fn does_not_guess_mapping_ownership_when_journal_names_are_missing() {
        let mut tracker = tracker_with_commander();
        tracker.apply(
            &json!({"timestamp":"1","event":"SAAScanComplete","BodyID":9,"BodyName":"Nine"}),
        );
        let snapshot = tracker.finish();
        assert_eq!(
            snapshot.bodies[0].mapping,
            MappingState::PreviouslyMappedOwnershipUnknown
        );
    }

    #[test]
    fn detects_biology_signals_and_new_or_known_codex_findings() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"timestamp":"1","event":"SAASignalsFound","BodyID":4,"BodyName":"Four","Signals":[{"Type":"$SAA_SignalType_Biological;","Count":2}]}));
        tracker.apply(&json!({"timestamp":"2","event":"CodexEntry","BodyID":4,"Category":"$Codex_Category_Biology;","IsNewEntry":true}));
        tracker.apply(&json!({"timestamp":"3","event":"CodexEntry","BodyID":5,"Category_Localised":"Biological and Geological","IsNewEntry":false}));
        let snapshot = tracker.finish();
        assert_eq!(snapshot.bodies[0].biology, BiologyState::SignalsPresent);
        assert_eq!(
            snapshot.exobio.bodies[0].biology_finding,
            BiologyFindingState::New
        );
        assert_eq!(
            snapshot.exobio.bodies[1].biology_finding,
            BiologyFindingState::Known
        );
    }

    #[test]
    fn captures_biological_signal_counts_genera_and_probe_progress() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"timestamp":"1","event":"SAASignalsFound","BodyID":7,"BodyName":"Seven","Signals":[{"Type":"$SAA_SignalType_Biological;","Count":3}],"Genuses":["Bacterium","Stratum"]}));
        tracker.apply(&json!({"timestamp":"2","event":"CodexEntry","BodyID":7,"Category":"$Codex_Category_Biology;","Name_Localised":"Bacterium Informem","VoucherAmount":900000,"IsNewEntry":true}));
        tracker.apply(&json!({"timestamp":"3","event":"ScanOrganic","BodyID":7,"BodyName":"Seven","Species_Localised":"Bacterium Informem","ScanStage":3,"RemainingBiologicalBodies":2}));

        let snapshot = tracker.finish();
        let exploration_body = &snapshot.bodies[0];
        let exobio_body = &snapshot.exobio.bodies[0];

        assert_eq!(exploration_body.biological_signal_count, Some(3));
        assert_eq!(exobio_body.confirmed_genera, vec!["Bacterium", "Stratum"]);
        assert_eq!(
            exobio_body.codex_entry_name.as_deref(),
            Some("Bacterium Informem")
        );
        assert_eq!(exobio_body.voucher_amount, Some(900000));
        assert_eq!(
            exobio_body.composition_species.as_deref(),
            Some("Bacterium Informem")
        );
        assert_eq!(exobio_body.organic_probe_stage, Some(3));
        assert_eq!(
            snapshot
                .latest_observation
                .as_ref()
                .map(|observation| &observation.kind),
            Some(&ExplorationObservationKind::OrganicAnalysisComplete)
        );
        assert_eq!(
            snapshot
                .latest_observation
                .as_ref()
                .and_then(|observation| observation.details.remaining_biological_bodies),
            Some(2)
        );
    }

    #[test]
    fn promotes_codex_entry_to_latest_observation_after_signal_detection() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({
            "timestamp":"2026-08-11T15:30:38Z",
            "event":"SAASignalsFound",
            "BodyID":6,
            "BodyName":"HIP 49485 B 3",
            "Signals":[{"Type":"$SAA_SignalType_Biological;","Count":1}]
        }));
        let first = tracker
            .latest_observation
            .as_ref()
            .map(|observation| observation.id.clone())
            .expect("signals should produce an observation");

        tracker.apply(&json!({
            "timestamp":"2026-08-11T15:34:49Z",
            "event":"CodexEntry",
            "Category":"$Codex_Category_Biology;",
            "Category_Localised":"Biologisch und geologisch",
            "BodyID":6,
            "Name_Localised":"Bacterium Informem - Gold",
            "VoucherAmount":2500
        }));

        let latest = tracker
            .latest_observation
            .as_ref()
            .expect("codex entry should replace the latest observation");
        assert_ne!(latest.id, first);
        assert_eq!(
            latest.kind,
            ExplorationObservationKind::KnownBiologicalFinding
        );
        assert_eq!(latest.body_id, Some(6));
    }

    #[test]
    fn scan_organic_body_field_and_log_progress_create_incremental_observations() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({
            "timestamp":"2026-08-11T15:36:36Z",
            "event":"ScanOrganic",
            "ScanType":"Log",
            "Body":6,
            "Species_Localised":"Bacterium Informem",
            "WasLogged":false
        }));
        let first = tracker
            .latest_observation
            .as_ref()
            .expect("probe 1 observation");
        let first_id = first.id.clone();
        assert_eq!(first.details.probe_stage, Some(1));
        assert_eq!(first.kind, ExplorationObservationKind::OrganicProbeProgress);

        tracker.apply(&json!({
            "timestamp":"2026-08-11T15:37:36Z",
            "event":"ScanOrganic",
            "ScanType":"Log",
            "Body":6,
            "Species_Localised":"Bacterium Informem",
            "WasLogged":false
        }));
        let second = tracker
            .latest_observation
            .as_ref()
            .expect("probe 2 observation");
        let second_id = second.id.clone();
        assert_eq!(second.details.probe_stage, Some(2));
        assert_eq!(
            second.kind,
            ExplorationObservationKind::OrganicProbeProgress
        );
        assert_ne!(second_id, first_id);

        tracker.apply(&json!({
            "timestamp":"2026-08-11T15:38:36Z",
            "event":"ScanOrganic",
            "ScanType":"Log",
            "Body":6,
            "Species_Localised":"Bacterium Informem",
            "WasLogged":false
        }));
        let third = tracker
            .latest_observation
            .as_ref()
            .expect("probe 3 observation");
        let third_id = third.id.clone();
        assert_eq!(third.details.probe_stage, Some(3));
        assert_eq!(
            third.kind,
            ExplorationObservationKind::OrganicAnalysisComplete
        );
        assert_ne!(third_id, second_id);

        tracker.apply(&json!({
            "timestamp":"2026-08-11T15:38:36Z",
            "event":"ScanOrganic",
            "ScanType":"Log",
            "Body":6,
            "Species_Localised":"Bacterium Informem",
            "WasLogged":true
        }));
        let duplicate = tracker
            .latest_observation
            .as_ref()
            .expect("duplicate log observation");
        assert_eq!(duplicate.details.probe_stage, Some(3));
        assert_eq!(
            duplicate.kind,
            ExplorationObservationKind::OrganicAnalysisComplete
        );
        assert_eq!(duplicate.id, third_id);
    }

    #[test]
    fn resets_old_system_data_on_jump() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"timestamp":"1","event":"Scan","BodyID":1,"BodyName":"Old","WasDiscovered":false,"WasMapped":false}));
        tracker.apply(&json!({"timestamp":"2","event":"FSDJump","SystemAddress":99}));
        let snapshot = tracker.finish();
        assert!(snapshot.bodies.is_empty());
        assert!(snapshot.latest_observation.is_none());
        assert_eq!(snapshot.system_scan, SystemScanState::Undiscovered);
    }

    #[test]
    fn separates_exploration_and_exobio_snapshots_while_preserving_legacy_observation() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"timestamp":"1","event":"FSSDiscoveryScan","Progress":1.0}));
        tracker.apply(&json!({"timestamp":"2","event":"Scan","BodyID":4,"BodyName":"Four","WasDiscovered":true,"WasMapped":false}));
        tracker.apply(&json!({"timestamp":"3","event":"FSSBodySignals","BodyID":4,"BodyName":"Four","Signals":[{"Type":"$SAA_SignalType_Biological;","Count":2}]}));
        tracker.apply(&json!({"timestamp":"4","event":"SAASignalsFound","BodyID":4,"BodyName":"Four","Signals":[{"Type":"$SAA_SignalType_Biological;","Count":2}],"Genuses":["Bacterium"]}));
        tracker.apply(&json!({"timestamp":"5","event":"ScanOrganic","BodyID":4,"BodyName":"Four","Species_Localised":"Bacterium Informem","ScanStage":1}));

        let snapshot = tracker.finish();
        assert_eq!(snapshot.system_scan, SystemScanState::FullyDiscovered);
        assert_eq!(snapshot.bodies[0].mapping, MappingState::ScannedNotMapped);
        assert_eq!(snapshot.bodies[0].biological_signal_count, Some(2));
        assert_eq!(
            snapshot
                .latest_exploration_observation
                .as_ref()
                .map(|observation| observation.kind),
            Some(ExplorationObservationKind::BiologicalSignals)
        );
        assert_eq!(
            snapshot.exobio.bodies[0].confirmed_genera,
            vec!["Bacterium"]
        );
        assert_eq!(
            snapshot.exobio.bodies[0].composition_species.as_deref(),
            Some("Bacterium Informem")
        );
        assert_eq!(
            snapshot
                .exobio
                .latest_exobio_observation
                .as_ref()
                .map(|observation| observation.kind),
            Some(ExplorationObservationKind::OrganicProbeProgress)
        );
        assert_eq!(
            snapshot
                .latest_observation
                .as_ref()
                .map(|observation| observation.id.as_str()),
            snapshot
                .exobio
                .latest_exobio_observation
                .as_ref()
                .map(|observation| observation.id.as_str())
        );
    }

    #[test]
    fn keeps_shared_biological_signal_as_one_observation_per_domain() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"timestamp":"1","event":"SAASignalsFound","BodyID":8,"BodyName":"Eight","Signals":[{"Type":"$SAA_SignalType_Biological;","Count":1}]}));

        let snapshot = tracker.finish();
        let exploration = snapshot
            .latest_exploration_observation
            .expect("exploration signal observation");
        let exobio = snapshot
            .exobio
            .latest_exobio_observation
            .expect("Anna signal observation");
        let legacy = snapshot
            .latest_observation
            .expect("legacy compatibility observation");
        assert_eq!(exploration.id, exobio.id);
        assert_eq!(exobio.id, legacy.id);
        assert_eq!(
            exploration.kind,
            ExplorationObservationKind::BiologicalSignals
        );
    }

    #[test]
    fn tracks_partial_and_complete_system_scan() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"event":"DiscoveryScan","Bodies":3}));
        assert_eq!(tracker.system_scan, SystemScanState::PartiallyDiscovered);
        tracker.apply(&json!({"event":"FSSAllBodiesFound"}));
        assert_eq!(tracker.system_scan, SystemScanState::FullyDiscovered);
    }
}
