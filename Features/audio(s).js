// Load audio file
const audioContext = new AudioContext();
const audioFile = await fetch("audio_file.mp3");
const audioData = await audioFile.arrayBuffer();
const audioBuffer = await audioContext.decodeAudioData(audioData);

// Extract MFCC features
const sampleRate = audioBuffer.sampleRate;
const frameSize = 512;
const hopSize = 256;
const mfcc = new MeydaExtractor('mfcc', frameSize, hopSize, 13, sampleRate);
const audioFeatures = mfcc.extract(audioBuffer.getChannelData(0));
console.log(audioFeatures);
