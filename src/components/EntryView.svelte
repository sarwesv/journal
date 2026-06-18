<script>
  import { onMount, onDestroy } from 'svelte';
  import { getEntry, deleteEntry, getAudio } from '../lib/db.js';

  let { id, navigate } = $props();
  let entry = $state(null);
  let audioUrl = $state(null);

  onMount(async () => {
    entry = await getEntry(id);
    if (!entry) { navigate('#/'); return; }
    const file = await getAudio(id);
    if (file) audioUrl = URL.createObjectURL(file);
  });

  onDestroy(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  });

  async function remove() {
    if (!confirm('Delete this entry?')) return;
    await deleteEntry(id);
    navigate('#/');
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
</script>

<div class="page">
  <button class="back" onclick={() => navigate('#/')}>← Back</button>

  {#if entry}
    <div class="header">
      <span class="mood">{entry.mood}</span>
      <div class="meta">
        <span>{formatDate(entry.createdAt)}</span>
        {#if entry.location}
          <span>📍 {entry.location.name}</span>
        {/if}
        <span>🎙 {fmt(entry.duration)}</span>
      </div>
    </div>

    {#if audioUrl}
      <audio src={audioUrl} controls class="player"></audio>
    {/if}

    <div class="transcript">{entry.transcript}</div>

    <button class="delete-btn" onclick={remove}>Delete entry</button>
  {:else}
    <p class="loading">Loading…</p>
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
    margin-bottom: 1.5rem;
    display: block;
  }

  .back:hover {
    color: var(--text);
  }

  .header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .mood {
    font-size: 2.5rem;
    line-height: 1;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: var(--muted);
    padding-top: 0.25rem;
  }

  .player {
    width: 100%;
    margin-bottom: 1.5rem;
    accent-color: var(--accent);
  }

  .transcript {
    font-size: 1rem;
    line-height: 1.75;
    color: var(--text);
    background: var(--surface);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    white-space: pre-wrap;
  }

  .delete-btn {
    background: none;
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background 0.15s;
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .loading {
    color: var(--muted);
  }
</style>
