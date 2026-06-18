<script>
  const MOODS = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😤', label: 'Frustrated' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '🤔', label: 'Reflective' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '🤩', label: 'Excited' },
  ];

  let { value = $bindable(null) } = $props();
</script>

<div class="moods">
  {#each MOODS as mood}
    <button
      class="mood-btn"
      class:selected={value === mood.emoji}
      onclick={() => (value = mood.emoji)}
      title={mood.label}
    >
      {mood.emoji}
    </button>
  {/each}
</div>

<style>
  .moods {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .mood-btn {
    font-size: 1.5rem;
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    border: 2px solid transparent;
    background: var(--surface);
    cursor: pointer;
    transition: border-color 0.15s, transform 0.1s;
  }

  .mood-btn:hover {
    transform: scale(1.1);
  }

  .mood-btn.selected {
    border-color: var(--accent);
    background: var(--accent-subtle);
  }
</style>
