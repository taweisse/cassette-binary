# Amplitude-encodes binary data into a WAV file.

from os import path
import sys
import re
import wave
import math
import struct
from bitstring import BitArray

SAMP_RATE  = 44100
FREQ       = 4000
SAMP_DEPTH = 2

SEP_CYCLES = 3
SHT_CYCLES = 3
LNG_CYCLES = 6

# Generates samples for a number of cycles of a sin wave at a given frequency.
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

def generateBlip(targetFreq, length):
	# Round up to the nearest whole number of samples.
	totalSamples = math.ceil((SAMP_RATE / targetFreq) * length)

	# Offset the start of the wave to -1. We use cosine for simplicity here,
	# otherwise we have to deal with pi / 4.
	startAngle = math.pi
	endAngle = (2 * length + 2) * math.pi
	angleInc = (endAngle - startAngle) / totalSamples

	# Generate samples.
	sampleScaler = 32767
	blipVals = []
	curAngle = startAngle
	for step in range(totalSamples):
		val = int(sampleScaler * math.cos(curAngle))

		# Ease the start & end of the wave.
		if curAngle - startAngle <= math.pi:
			val = int((val + sampleScaler) / 2)
		elif endAngle - curAngle <= math.pi:
			val = int((val - sampleScaler) / 2)
		
		blipVals.append(val)
		curAngle += angleInc
	return blipVals	

# Generates samples for amplitude-encoding a byte as audio.
def encodeByteAmplitude(byte):
	samples = []
	bitStr = BitArray(byte).bin
	for bit in bitStr:
		if bit == '0':
			samples.extend(generateBlip(FREQ, 2))
		else:
			samples.extend(generateBlip(FREQ, 5))
		samples.extend([0] * math.ceil((SAMP_RATE / FREQ) * SEP_CYCLES))
	return samples

if __name__ == "__main__":
	# Get filenames.
	inFilename = sys.argv[1].strip()
	outFilename = sys.argv[2].strip()

	# Validate user input.
	if inFilename == outFilename:
		print('Input and output files must be different')
		exit(1)
	if not path.isfile(inFilename):
		print('Input file does not exist')
		exit(1)
	elif path.isfile(outFilename):
		userInput = input('Output file already exists. Would you like to overwrite? [Y/n] ').strip().lower()
		if userInput != '' and not re.match('^(y|yes)$', userInput):
			exit(0)

	# DEBUG:
	print(inFilename)
	print(outFilename)

	# Open & configure the output WAV file.
	with wave.open(outFilename, 'wb') as outFile:
		outFile.setnchannels(1) # Mono.
		outFile.setsampwidth(SAMP_DEPTH) # 16-bit.
		outFile.setframerate(SAMP_RATE)
		
		# Open the input file and read bytes.
		with open(inFilename, 'rb') as inFile:
			byte = inFile.read(1)
			while byte != b'':
				# Encode each byte of the input file as audio.
				data = encodeByteAmplitude(byte)
				outFile.writeframes(struct.pack('%sh' % len(data), *data))
				
				# Read the next byte.
				byte = inFile.read(1)
