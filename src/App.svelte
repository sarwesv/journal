<script>
  import EntryList from './components/EntryList.svelte';
  import Recorder from './components/Recorder.svelte';
  import EntryView from './components/EntryView.svelte';

  let hash = $state(window.location.hash || '#/');

  $effect(() => {
    const update = () => { hash = window.location.hash || '#/'; };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  });

  function navigate(path) {
    window.location.hash = path;
  }

  let entryId = $derived(hash.startsWith('#/entry/') ? hash.slice(8) : null);
</script>

{#if hash === '#/' || hash === ''}
  <EntryList {navigate} />
{:else if hash === '#/record'}
  <Recorder {navigate} />
{:else if entryId}
  <EntryView id={entryId} {navigate} />
{/if}
