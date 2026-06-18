<script>
  import { onMount, onDestroy } from 'svelte';
  import { transcribe, modelState, loadModel } from '../lib/whisper.js';
  import { saveEntry, saveAudio } from '../lib/db.js';
  import { blobToFloat32 } from '../lib/audio.js';
  import { getLocation } from '../lib/location.js';
  import MoodPicker from './MoodPicker.svelte';

  let { navigate } = $props();

  let phase = $state('idle'); // idle | recording | transcribing | saving
  let transcript = $state('');
  let mood = $state(null);
  let duration = $state(0);
  let errorMsg = $state('');

  let canvas = $state(null);
  let mediaRecorder;
  let chunks = [];
  let audioBlob;
  let stream;
  let analyser;
  let animFrame;
  let timer;

  onMount(() => loadModel());

  onDestroy(() => {
    clearInterval(timer);
    cancelAnimationFrame(animFrame);
    stream?.getTracks().forEach((t) => t.stop());
  });

  async function startRecording() {
    errorMsg = '';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      audioCtx.createMediaStreamSource(stream).connect(analyser);

      chunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start(100);

      phase = 'recording';
      duration = 0;
      timer = setInterval(() => duration++, 1000);
      drawWaveform();
    } catch {
      errorMsg = 'Microphone access denied.';
    }
  }

  function stopRecording() {
    clearInterval(timer);
    cancelAnimationFrame(animFrame);
    stream?.getTracks().forEach((t) => t.stop());
    mediaRecorder?.stop();
    phase = 'transcribing';
  }

  async function handleStop() {
    audioBlob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
    try {
      const float32 = await blobToFloat32(audioBlob);
      transcript = await transcribe(float32);
      phase = 'saving';
    } catch (e) {
      errorMsg = `Transcription failed: ${e.message}`;
      phase = 'idle';
    }
  }

  async function save() {
    if (!mood) return;
    const id = crypto.randomUUID();
    const location = await getLocation();
    await saveAudio(id, audioBlob);
    await saveEntry({ id, createdAt: Date.now(), duration, transcript, mood, location });
    navigate('#/');
  }

  function drawWaveform() {
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    const buf = new Uint8Array(analyser.frequencyBinCount);

    function frame() {
      animFrame = requestAnimationFrame(frame);
      analyser.getByteTimeDomainData(buf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const step = canvas.width / buf.length;
      for (let i = 0; i < buf.length; i++) {
        const y = (buf[i] / 255) * canvas.height;
        i === 0 ? ctx.moveTo(i * step, y) : ctx.lineTo(i * step, y);
      }
      ctx.stroke();
    }
    frame();
  }

  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
</script>

<div class="page">
  <button class="back" onclick={() => navigate('#/')}>← Back</button>

  {#if phase === 'idle'}
    <div class="center">
      {#if $modelState.status === 'loading'}
        <p class="hint">
          Loading model… {$modelState.progress ? `${Math.round($modelState.progress)}%` : ''}
        </p>
      {:else if $modelState.status === 'error'}
        <p class="error">{$modelState.message}</p>
      {/if}
      <button
        class="big-btn"
        onclick={startRecording}
        disabled={$modelState.status === 'loading'}
      >
        🎙<br />Record
      </button>
      {#if errorMsg}
        <p class="error">{errorMsg}</p>
      {/if}
    </div>

  {:else if phase === 'recording'}
    <div class="center">
      <canvas bind:this={canvas} width="320" height="80" class="wave"></canvas>
      <p class="timer">{fmt(duration)}</p>
      <button class="stop-btn" onclick={stopRecording}>■ Stop</button>
    </div>

  {:else if phase === 'transcribing'}
    <div class="center">
      <div class="spinner"></div>
      <p class="hint">Transcribing…</p>
    </div>

  {:else if phase === 'saving'}
    <div class="saving">
      <h2>Review Entry</h2>
      <textarea class="transcript-edit" bind:value={transcript} rows="6"></textarea>
      <h3>How are you feeling?</h3>
      <MoodPicker bind:value={mood} />
      <button class="save-btn" onclick={save} disabled={!mood}>Save Entry</button>
      {#if errorMsg}
        <p class="error">{errorMsg}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .page {
    max-width: 600px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
  }

  .back {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0;
    margin-bottom: 2rem;
    display: block;
  }

  .back:hover {
    color: var(--text);
  }

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding-top: 4rem;
  }

  .big-btn {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.15s, opacity 0.15s;
    line-height: 1.4;
  }

  .big-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .big-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .wave {
    border-radius: 8px;
    background: var(--surface);
  }

  .timer {
    font-size: 2.5rem;
    font-variant-numeric: tabular-nums;
    margin: 0;
  }

  .stop-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .stop-btn:hover {
    opacity: 0.85;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .hint {
    color: var(--muted);
    font-size: 0.9rem;
    margin: 0;
  }

  .error {
    color: #ef4444;
    font-size: 0.85rem;
    margin: 0;
  }

  .saving {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--muted);
  }

  .transcript-edit {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    padding: 0.75rem;
    font-size: 0.95rem;
    line-height: 1.6;
    resize: vertical;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }

  .save-btn {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .save-btn:hover:not(:disabled) {
    opacity: 0.85;
  }
</style>
