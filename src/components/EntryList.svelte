<script>
  import { onMount } from 'svelte';
  import { getAllEntries } from '../lib/db.js';
  import EntryCard from './EntryCard.svelte';

  let { navigate } = $props();
  let entries = $state([]);

  onMount(async () => {
    entries = await getAllEntries();
  });
</script>

<div class="page">
  <header>
    <h1>Journal</h1>
    <button class="record-btn" onclick={() => navigate('#/record')}>
      <span class="dot"></span> Record
    </button>
  </header>

  {#if entries.length === 0}
    <div class="empty">
      <p>No entries yet. Hit record to start.</p>
    </div>
  {:else}
    <div class="list">
      {#each entries as entry (entry.id)}
        <EntryCard {entry} {navigate} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .page {
    max-width: 600px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .record-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .record-btn:hover {
    opacity: 0.85;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
  }

  .empty {
    text-align: center;
    color: var(--muted);
    padding: 4rem 0;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
