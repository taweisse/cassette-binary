// Reference and minified version at the end

var DUR = 1     // duration in seconds
var NCH = 1     // number of channels
var SPS = 44100 // samples per second
var BPS = 2     // bytes per sample

// PCM Data
// --------------------------------------------
// Field           | Bytes | Content
// --------------------------------------------
// ckID            |     4 | "fmt "
// cksize          |     4 | 0x0000010 (16)
// wFormatTag      |     2 | 0x0001 (PCM)
// nChannels       |     2 | NCH
// nSamplesPerSec  |     4 | SPS
// nAvgBytesPerSec |     4 | NCH * BPS * SPS
// nBlockAlign     |     2 | NCH * BPS * NCH
// wBitsPerSample  |     2 | BPS * 8

// data_size = DUR * NCH * SPS * BPS
// file_size = 44 (Header) + data_size

function dec2hex(n, l)
{
	n = n.toString(16);
	return new Array(l*2-n.length+1).join("0") + n;
}

function hex2str(hex)
{
	var str = [];

	if (hex.length%2) { throw new Error("hex2str(\"" + hex + "\"): invalid input (# of digits must be divisible by 2)"); }

	for(var i = 0; i < hex.length; i += 2)
	{
		str.push(String.fromCharCode(parseInt(hex.substr(i,2),16)));
	}

	return str.reverse().join("");
}

function put(n, l)
{
	return hex2str(dec2hex(n,l));
}

var size = DUR * NCH * SPS * BPS;
var data1 = "RIFF" + put(44 + size, 4) + "WAVEfmt " + put(16, 4);

data1 += put(1              , 2); // wFormatTag (pcm)
data1 += put(NCH            , 2); // nChannels
data1 += put(SPS            , 4); // nSamplesPerSec
data1 += put(NCH * BPS * SPS, 4); // nAvgBytesPerSec
data1 += put(NCH * BPS      , 2); // nBlockAlign
data1 += put(BPS * 8        , 2); // wBitsPerSample

data1 += "data" + put(size, 4);

const writeString = (arr, str, pos) => {
	for (let i = 0; i < str.length; i++) {
		arr[i + pos] = str.charCodeAt(i);
	}
}

const writeInt = (arr, int, pos) => {

}

// Try the above but with a typed array instead.
let data = new Uint8Array(10)
writeString(data, "RIFF", 0)
console.log(data)



for (var i = 0; i < DUR; i++)
{		
	for(var j = 0; j < SPS; j++)
	{
		data1 += put(Math.floor((Math.sin(j/SPS * Math.PI * 2 * 440) + 1) / 2 * Math.pow(2, BPS * 8)), BPS);
	}
}

var WAV = new Audio("data:Audio/WAV;base64," + btoa(data1));
WAV.setAttribute("controls","controls");

document.body.appendChild(WAV);

// Load image into canvas: -----------------------------------------------------

const TARGET_HEIGHT = 400

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
encodeBtn.addEventListener('click', encodeImage)


// DEBUG: Testing sin-generator.js:
test = new SinGenerator(10000, 44100)
for (let i = 0; i < 1000; i++) {
	console.log(test.Step())
}
