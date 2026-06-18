import { pipeline } from '@huggingface/transformers';

let transcriber = null;

self.addEventListener('message', async (e) => {
  const { type, audio, id } = e.data;

  if (type === 'load') {
    try {
      transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-base',
        {
          dtype: 'q8',
          progress_callback: (p) => self.postMessage({ type: 'progress', payload: p }),
        }
      );
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message });
    }
  }

  if (type === 'transcribe') {
    try {
      const result = await transcriber({ array: audio, sampling_rate: 16000 });
      self.postMessage({ type: 'result', id, text: result.text.trim() });
    } catch (err) {
      self.postMessage({ type: 'transcribe_error', id, message: err.message });
    }
  }
});
