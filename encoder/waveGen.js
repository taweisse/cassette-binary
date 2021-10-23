// Convert the image to audio: -------------------------------------------------

const MIN_FREQ = 1000
const MAX_FREQ = 10000
const DUR_PP = 0.01
const SAMP_RATE = 44100

const img2audio = () => {
	// Get image data.
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height )

	// DEBUG:
	console.log(`Image size: ${imgData.width} x ${imgData.height}`)

	// Create an array of SinGenerators, one for each row of pixels.
	let waves = new Array()
	let baseFreq = 50;
	for (let i = 0; i < imgData.height; i++) {
		waves.push(new SinGenerator(baseFreq * (i + 1), SAMP_RATE))
	}

	// Generate audio samples based on the image.
	let samples = new Float32Array(SAMP_RATE * DUR_PP * imgData.width);
	let scalers = new Array(imgData.height)
	let i = 0
	for (col = 0; col < imgData.width; col++) {
		for (row = 0; row < imgData.height; row++) {
			// Get intensity at this pixel.
			let idx = (row * imgData.width * 4) + (col * 4)
			scalers[row] = imgData.data[idx] / 255
		}

		// Write the audio data for the length of one pixel according to the
		// current scalers.
		for (let s = 0; s < SAMP_RATE * DUR_PP; s++) {
			let sample = 0
			waves.forEach((wave, i) => {
				sample += wave.Step() * scalers[i]
			})
			samples[i] = sample / imgData.height
			i++
		}
	}

	console.log(samples)

	let sound = new WAV(SAMP_RATE, 1)
	sound.addSamples([samples])
	// sound.download()
	sound.play()
}

// Convert image to black and white: -------------------------------------------

const convertGreyscale = () => {
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
	
	for (let row = 0; row < imgData.height; row++) {
		for (let col = 0; col < imgData.width; col++) {
			let idx = row * 4 * imgData.width + (col * 4)
			let r = imgData.data[idx]
			let g = imgData.data[idx + 1]
			let b = imgData.data[idx + 2]
			let avg = (0.299 * r) + (0.587 * g) + (0.114 * b)

			// Reassign the color components.
			imgData.data[idx] = avg
			imgData.data[idx + 1] = avg
			imgData.data[idx + 2] = avg
		}
	}

	// Reassign to the canvas.
	ctx.putImageData(imgData, 0, 0, 0, 0, imgData.width, imgData.height)
}

// Load image into canvas: -----------------------------------------------------

const TARGET_HEIGHT = 250

const handleUpload = (e) => {
	let reader = new FileReader()
	reader.onload = (e) => {
		let img = new Image()
		img.onload = () => {
			// Scale image to the target height.
			let scaler = TARGET_HEIGHT / img.height
			canvas.width = Math.round(img.width * scaler)
			canvas.height = TARGET_HEIGHT
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

			// Convert the image to greyscale.
			convertGreyscale()	
		}
		img.src = e.target.result
	}
	reader.readAsDataURL(e.target.files[0])
}

const encodeImage = (e) => {
	console.log(ctx.getImageData(0, 0, canvas.width, canvas.height))
}

let imageLoader = document.getElementById('imageLoader')
imageLoader.addEventListener('change', handleUpload)

let canvas = document.getElementById('image')
let ctx = canvas.getContext('2d')

let encodeBtn = document.getElementById('encode')
encodeBtn.addEventListener('click', img2audio)
