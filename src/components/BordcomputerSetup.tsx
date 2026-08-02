import { useState, type FormEvent } from "react";

type BordcomputerSetupProps = {
  initialName?: string;
  onSave: (name: string) => void;
  onCancel?: () => void;
};

export default function BordcomputerSetup({
  initialName = "",
  onSave,
  onCancel,
}: BordcomputerSetupProps) {
  const [name, setName] = useState(initialName);
  const cleanedName = name.trim();
  const isValid = cleanedName.length >= 2 && cleanedName.length <= 30;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    onSave(cleanedName);
  }

  return (
    <section className="panel bordcomputer-setup">
      <span>Einrichtung</span>
      <h2>Wie möchten Sie Ihren Bordcomputer nennen?</h2>

      <p className="muted">
        Der Name kann später jederzeit geändert werden.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="bordcomputer-name">
          Name des Bordcomputers
        </label>

        <input
          id="bordcomputer-name"
          type="text"
          value={name}
          maxLength={30}
          autoComplete="off"
          autoFocus
          placeholder="Eigenen Namen eingeben"
          onChange={(event) => setName(event.target.value)}
        />

        <div className="bordcomputer-form-footer">
          <small>{cleanedName.length}/30 Zeichen</small>

          <div className="bordcomputer-actions">
            {onCancel && (
              <button type="button" onClick={onCancel}>
                Abbrechen
              </button>
            )}

            <button type="submit" disabled={!isValid}>
              Namen speichern
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
