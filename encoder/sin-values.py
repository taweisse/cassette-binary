# Generate sin value table.

import sys
import getopt
import math

def generateSinTable(numValues):
	step = (math.pi * 2) / numValues
	curAng = 0
	table = []
	for i in range(numValues):
		table.append(math.sin(curAng))
		curAng += step
	return table

def main(argv):
	numValues = 100
	precision = 3
	try:
		opts, args = getopt.getopt(argv, 'hn:p:')
	except getopt.GetoptError:
		print('invalid arguments: {} [-h] [-n number]'.format(__file__))
	
	for opt, arg in opts:
		if opt == '-h':
			print('{} [-h] [-n number]'.format(__file__))
		elif opt == '-n':
			numValues = int(arg)
		elif opt == '-p':
			precision = int(arg)

	# Print table nicely to 3 decimal places.
	formatStr = '{{:.{}f}}'.format(precision)
	print('[', ', '.join(formatStr.format(val) for val in generateSinTable(numValues)), ']')

if __name__ == '__main__':
	main(sys.argv[1:])
