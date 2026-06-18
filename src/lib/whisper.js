import { writable } from 'svelte/store';

export const modelState = writable({ status: 'idle', progress: 0 });

let worker = null;
const pending = new Map();

function init() {
  worker = new Worker(new URL('./whisper-worker.js', import.meta.url), { type: 'module' });

  worker.addEventListener('message', (e) => {
    const { type, payload, id, text, message } = e.data;

    if (type === 'progress') {
      if (payload?.status === 'downloading' || payload?.status === 'initiate') {
        modelState.set({ status: 'loading', progress: payload.progress ?? 0, file: payload.file });
      }
    } else if (type === 'ready') {
      modelState.set({ status: 'ready', progress: 100 });
    } else if (type === 'result') {
      pending.get(id)?.resolve(text);
      pending.delete(id);
    } else if (type === 'transcribe_error') {
      pending.get(id)?.reject(new Error(message));
      pending.delete(id);
    } else if (type === 'error') {
      modelState.set({ status: 'error', message });
    }
  });

  worker.postMessage({ type: 'load' });
  modelState.set({ status: 'loading', progress: 0 });
}

export function loadModel() {
  if (!worker) init();
}

export function transcribe(float32) {
  if (!worker) init();
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    pending.set(id, { resolve, reject });
    const copy = float32.slice(0);
    worker.postMessage({ type: 'transcribe', audio: copy, id }, [copy.buffer]);
  });
}
