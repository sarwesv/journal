export async function blobToFloat32(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  if (decoded.sampleRate === 16000) {
    return decoded.getChannelData(0);
  }

  const targetLength = Math.ceil(decoded.duration * 16000);
  const offline = new OfflineAudioContext(1, targetLength, 16000);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0);
  const resampled = await offline.startRendering();
  return resampled.getChannelData(0);
}
