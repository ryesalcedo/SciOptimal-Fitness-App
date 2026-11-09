import React, { useState } from 'react';
import { PhysiqueBody, PhysiqueRead, readPhysique } from '../services/physique';

export default function PhysiqueGoal({
  body,
  onApply,
}: {
  body: PhysiqueBody;
  onApply: (read: PhysiqueRead) => void;
}) {
  const [text, setText] = useState('');
  const [read, setRead] = useState<PhysiqueRead | null>(null);

  const interpret = () => {
    const next = readPhysique(text, body);
    setRead(next);
    if (next.understood) onApply(next);
  };

  return (
    <div className="stack">
      <label>Describe the physique
        <textarea
          rows={3}
          value={text}
          placeholder="Shredded at 170 with bigger shoulders"
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <button type="button" className="primary" onClick={interpret}>Set this physique</button>
      {read && <p className={read.understood ? 'muted' : 'error'}>{read.summary}</p>}
    </div>
  );
}
