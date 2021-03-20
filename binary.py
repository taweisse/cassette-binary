# Amplitude-encodes binary data into a WAV file.

import wave
import math
import struct

SAMP_RATE = 44100
FREQ = 10000

def generateSin(freq, cycles = 1):
	totalSamples = int((SAMP_RATE / freq) * cycles)
	endAng = 2 * math.pi * cycles
	angStep = endAng / totalSamples
	vals = []
	curAng = 0
	for step in range(totalSamples):
		vals.append(int(32767 * math.sin(curAng)))
		curAng += angStep
	return vals

f = wave.open('test.wav', 'wb')
f.setnchannels(1) # Mono.
f.setsampwidth(2) # 16-bit.
f.setframerate(SAMP_RATE)
data = generateSin(FREQ, FREQ)
f.writeframes(struct.pack('%si' % len(data), *data))
f.close()
