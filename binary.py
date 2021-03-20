# Amplitude-encodes binary data into a WAV file.

import wave as wave

f = wave.open('test.wav', 'wb')
f.setnchannels(1)
f.setsampwidth(1)
f.setframerate(44100)
f.close()
