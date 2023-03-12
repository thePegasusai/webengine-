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
//we first load an audio file and decode it into an AudioBuffer object using the Web Audio API. We then create an instance of the MeydaExtractor class, which is a JavaScript library for audio feature extraction. We pass the frameSize and hopSize parameters to specify the size of the analysis window and the hop size between successive windows. We also specify the number of MFCC coefficients we want to extract (in this case, 13), and the sample rate of the audio signal.

//Finally, we call the extract method of the mfcc object, passing in the audio data from the first channel of the AudioBuffer object. The method returns an array of MFCC features for each analysis window in the audio signal.

