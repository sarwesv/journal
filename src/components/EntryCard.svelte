<script>
  let { entry, navigate } = $props();

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
</script>

<button class="card" onclick={() => navigate(`#/entry/${entry.id}`)}>
  <div class="card-top">
    <span class="mood">{entry.mood}</span>
    <span class="date">{formatDate(entry.createdAt)}</span>
  </div>
  <p class="snippet">
    {entry.transcript.slice(0, 120)}{entry.transcript.length > 120 ? '…' : ''}
  </p>
  <div class="card-bottom">
    {#if entry.location}
      <span class="meta">📍 {entry.location.name}</span>
    {/if}
    <span class="meta">🎙 {fmt(entry.duration)}</span>
  </div>
</button>

<style>
  .card {
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.1s;
  }

  .card:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .card-top {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .mood {
    font-size: 1.2rem;
  }

  .date {
    font-size: 0.75rem;
    color: var(--muted);
    margin-left: auto;
  }

  .snippet {
    font-size: 0.9rem;
    color: var(--text);
    margin: 0 0 0.5rem;
    line-height: 1.5;
  }

  .card-bottom {
    display: flex;
    gap: 1rem;
  }

  .meta {
    font-size: 0.75rem;
    color: var(--muted);
  }
</style>
