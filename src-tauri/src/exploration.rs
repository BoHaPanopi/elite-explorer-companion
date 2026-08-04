use serde::Serialize;
use serde_json::Value;
use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, Default, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SystemScanState {
    #[default]
    Undiscovered,
    PartiallyDiscovered,
    FullyDiscovered,
}

#[derive(Clone, Copy, Debug, Default, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DiscoveryState {
    #[default]
    Undiscovered,
    DiscoveredByOtherCommander,
    FirstDiscoveredByCurrentCommander,
    PreviouslyDiscoveredOwnershipUnknown,
}

#[derive(Clone, Copy, Debug, Default, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MappingState {
    #[default]
    NotMapped,
    ScannedNotMapped,
    MappedByOtherCommander,
    FirstMappedByCurrentCommander,
    PreviouslyMappedOwnershipUnknown,
}

#[derive(Clone, Copy, Debug, Default, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum BiologyState {
    #[default]
    NoneDetected,
    SignalsPresent,
}

#[derive(Clone, Copy, Debug, Default, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum BiologyFindingState {
    #[default]
    None,
    Unknown,
    Known,
    New,
}

#[derive(Clone, Copy, Debug, Serialize, PartialEq, Eq)]
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
}

#[derive(Debug, Default, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct BodyExplorationState {
    pub body_id: u64,
    pub body_name: String,
    pub discovery: DiscoveryState,
    pub mapping: MappingState,
    pub biology: BiologyState,
    pub biology_finding: BiologyFindingState,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExplorationObservation {
    pub id: String,
    pub kind: ExplorationObservationKind,
    pub body_id: Option<u64>,
    pub body_name: Option<String>,
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExplorationSnapshot {
    pub system_scan: SystemScanState,
    pub bodies: Vec<BodyExplorationState>,
    pub latest_observation: Option<ExplorationObservation>,
}

#[derive(Debug, Default)]
pub struct ExplorationTracker {
    commander: Option<String>,
    system_scan: SystemScanState,
    bodies: BTreeMap<u64, BodyExplorationState>,
    latest_observation: Option<ExplorationObservation>,
}

impl ExplorationTracker {
    pub fn apply(&mut self, event: &Value) {
        let event_name = string(event, "event").unwrap_or_default();

        match event_name {
            "Commander" | "LoadGame" => {
                if let Some(name) = string(event, "Name") {
                    self.commander = Some(name.to_string());
                }
            }
            "FSDJump" | "CarrierJump" | "Location" => {
                self.system_scan = SystemScanState::Undiscovered;
                self.bodies.clear();
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
            "SAASignalsFound" => self.apply_signals(event),
            "CodexEntry" => self.apply_codex_entry(event),
            _ => {}
        }
    }

    pub fn finish(self) -> ExplorationSnapshot {
        ExplorationSnapshot {
            system_scan: self.system_scan,
            bodies: self.bodies.into_values().collect(),
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
        self.observe(event, kind, Some(body_id), Some(body_name));
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
        self.observe(event, kind, Some(body_id), Some(body_name));
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
        self.body(body_id, &body_name).biology = BiologyState::SignalsPresent;
        self.observe(
            event,
            ExplorationObservationKind::BiologicalSignals,
            Some(body_id),
            Some(body_name),
        );
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
        let finding = if event.get("IsNewEntry").and_then(Value::as_bool) == Some(true)
            || event.get("NewTraitsDiscovered").and_then(Value::as_bool) == Some(true)
        {
            BiologyFindingState::New
        } else if event.get("IsNewEntry").and_then(Value::as_bool) == Some(false) {
            BiologyFindingState::Known
        } else {
            BiologyFindingState::Unknown
        };
        if let Some(body_id) = body_id {
            let body = self.body(body_id, "");
            body.biology = BiologyState::SignalsPresent;
            body.biology_finding = finding;
        }
        let kind = match finding {
            BiologyFindingState::New => ExplorationObservationKind::NewBiologicalFinding,
            BiologyFindingState::Known => ExplorationObservationKind::KnownBiologicalFinding,
            _ => return,
        };
        self.observe(
            event,
            kind,
            body_id,
            string(event, "Name_Localised").map(str::to_string),
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
    ) {
        let timestamp = string(event, "timestamp").unwrap_or("unknown");
        let event_name = string(event, "event").unwrap_or("unknown");
        self.latest_observation = Some(ExplorationObservation {
            id: format!(
                "{timestamp}:{event_name}:{}",
                body_id.map(|id| id.to_string()).unwrap_or_default()
            ),
            kind,
            body_id,
            body_name,
        });
    }
}

fn string<'a>(value: &'a Value, key: &str) -> Option<&'a str> {
    value.get(key).and_then(Value::as_str)
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
        assert_eq!(snapshot.bodies[0].biology_finding, BiologyFindingState::New);
        assert_eq!(
            snapshot.bodies[1].biology_finding,
            BiologyFindingState::Known
        );
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
    fn tracks_partial_and_complete_system_scan() {
        let mut tracker = tracker_with_commander();
        tracker.apply(&json!({"event":"DiscoveryScan","Bodies":3}));
        assert_eq!(tracker.system_scan, SystemScanState::PartiallyDiscovered);
        tracker.apply(&json!({"event":"FSSAllBodiesFound"}));
        assert_eq!(tracker.system_scan, SystemScanState::FullyDiscovered);
    }
}
