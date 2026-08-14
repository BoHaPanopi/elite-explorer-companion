import { useState } from "react";
import { DATA_FLOW_COPY } from "../content/commandCenter";
import { hasActiveTransmission, hasExternalApproval, type DataFlowStatus as DataFlowState } from "../features/dataFlowStatus";
import { useI18n } from "../i18n";

export default function DataFlowStatus({ status }: { status: DataFlowState }) {
  const { language } = useI18n();
  const copy = DATA_FLOW_COPY[language];
  const [open, setOpen] = useState(false);
  const approved = hasExternalApproval(status);
  const transmitting = hasActiveTransmission(status);

  return <>
    <button className={`data-flow-status${approved ? " data-flow-status--external" : ""}`} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
      <i aria-hidden="true" />
      <span>{approved ? copy.externalSummary : copy.localSummary}</span>
    </button>
    {open ? <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="modal-dialog data-flow-dialog" role="dialog" aria-modal="true" aria-labelledby="data-flow-title">
        <header><div><span className="eyebrow">{copy.title}</span><h2 id="data-flow-title">{copy.internal}</h2></div><button type="button" onClick={() => setOpen(false)}>{copy.close}</button></header>
        <p>{copy.principle}</p>
        <div className="data-flow-dialog__section"><strong>{status.journalAccess ? copy.journalActive : copy.journalInactive}</strong><span>{copy.crewScope}</span><ul><li>{copy.anna}</li><li>{copy.willi}</li><li>{copy.susanne}</li><li>{copy.sebastian}</li></ul></div>
        <div className="data-flow-dialog__section"><strong>{copy.external}</strong><dl><div><dt>{copy.approval}</dt><dd>{approved ? copy.externalSummary : copy.noApproval}</dd></div><div><dt>{copy.transmission}</dt><dd>{transmitting ? copy.externalSummary : copy.noTransmission}</dd></div></dl></div>
      </section>
    </div> : null}
  </>;
}
