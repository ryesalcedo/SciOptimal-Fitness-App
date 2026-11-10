import React, { useState } from 'react';
import { useAppStore } from '../store';
import { askCoach, homeToken } from '../services/homeServer';
import { PhysiqueBody, readPhysique } from '../services/physique';

interface Bubble {
  from: 'you' | 'coach';
  text: string;
}

export default function CoachChat({ body }: { body: PhysiqueBody }) {
  const applyPhysique = useAppStore((state) => state.applyPhysique);
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1_400_000) {
      setError('Keep the photo under 1.4 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result || ''));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    const message = text.trim();
    if (!message && !image) return;
    setBusy(true);
    setError('');
    const read = message ? readPhysique(message, body) : null;
    if (read && read.understood) applyPhysique(read);
    let reply = read && read.understood ? read.summary : '';
    if (homeToken()) {
      try {
        const remote = await askCoach(message, image);
        if (remote.model && remote.reply) reply = remote.reply;
        else if (!reply) reply = remote.reply;
        else if (image) reply = `${reply} The photo stays on this request and is not saved.`;
      } catch (caught) {
        const reason = caught instanceof Error ? caught.message : '';
        if (!reply) reply = reason || 'The coach on this PC did not answer.';
      }
    } else if (!reply) {
      reply = 'Type the physique in a sentence, such as shredded at 170 with bigger shoulders. A photo is read only while this PC’s server is running.';
    } else if (image) {
      reply = `${reply} The photo is not read until the home server is running.`;
    }
    setMessages((current) => [
      ...current,
      { from: 'you', text: message || 'Photo attached' },
      { from: 'coach', text: reply },
    ]);
    setText('');
    setImage('');
    setBusy(false);
  };

  return (
    <div className="stack">
      {messages.map((bubble, index) => (
        <p key={`${bubble.from}-${index}`} className={bubble.from === 'you' ? 'you' : 'muted'}>{bubble.text}</p>
      ))}
      <label>Tell the coach
        <textarea
          rows={3}
          value={text}
          placeholder="Shredded at 170 with bigger shoulders"
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <label className="file-row">
        Attach a photo
        <input type="file" accept="image/*" onChange={onFile} />
      </label>
      {image && <img className="preview" src={image} alt="Attachment to send" />}
      {error && <p className="error">{error}</p>}
      <button type="button" className="primary" disabled={busy} onClick={send}>
        {busy ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}
