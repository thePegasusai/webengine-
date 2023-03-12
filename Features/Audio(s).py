import librosa

# Load audio file
audio_file = 'audio_file.wav'
audio_data, sample_rate = librosa.load(audio_file)

# Extract MFCC features
n_mfcc = 13
mfcc = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=n_mfcc)

print(mfcc)

#we use the librosa library in Python to load an audio file and extract MFCC features. We pass the path to the audio file as an argument to the librosa.load function, which returns the audio data and sample rate as NumPy arrays.

#We then call the librosa.feature.mfcc function, passing in the audio data and sample rate, as well as the number of MFCC coefficients we want to extract (in this case, 13). The function returns an array of MFCC features for each analysis window in the audio signal.
