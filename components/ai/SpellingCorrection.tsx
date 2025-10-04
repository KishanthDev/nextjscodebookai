'use client';
import { useState } from 'react';

export default function SpellingCorrection() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const resp = await fetch('/api/ai/correct-spelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: input }),
      });
      const data = await resp.json();
      if (data.error) setError(data.error);
      else setOutput(data.result || '');
    } catch (err: any) {
      setError(err.message || 'Error');
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 800, margin: 'auto' }}>
      <h2>Test OpenAI Spelling Correction</h2>
      {error && <div style={{
        color: '#d32f2f', background: '#ffebee', padding: '1rem', borderRadius: 4, marginTop: 10
      }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="inputText">Enter text:</label><br />
        <textarea
          id="inputText"
          style={{ width: '100%', height: 150, marginBottom: 10 }}
          value={input}
          required
          onChange={(e) => setInput(e.target.value)}
        /><br />
        <button
          type="submit"
          style={{
            marginTop: 10, padding: '.5rem 1rem', background: '#1976d2', color: 'white',
            border: 'none', borderRadius: 4, cursor: 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Correcting...' : 'Correct Spelling'}
        </button>
      </form>
      {output && (
        <div style={{ marginTop: 20, padding: '1rem', background: '#f3f3f3', border: '1px solid #ccc', borderRadius: 4 }}>
          <h3>Original Text:</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{input}</p>
          <h3>Corrected Output:</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{output}</p>
        </div>
      )}
    </div>
  );
}