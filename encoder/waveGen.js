// Reference and minified version at the end

var DUR = 5     // duration in seconds
var NCH = 1     // number of channels
var SPS = 44100 // samples per second
var BPS = 1     // bytes per sample

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
var data = "RIFF" + put(44 + size, 4) + "WAVEfmt " + put(16, 4);

data += put(1              , 2); // wFormatTag (pcm)
data += put(NCH            , 2); // nChannels
data += put(SPS            , 4); // nSamplesPerSec
data += put(NCH * BPS * SPS, 4); // nAvgBytesPerSec
data += put(NCH * BPS      , 2); // nBlockAlign
data += put(BPS * 8        , 2); // wBitsPerSample

data += "data" + put(size, 4);

for (var i = 0; i < DUR; i++)
{		
	for(var j = 0; j < SPS; j++)
	{
		data += put(Math.floor((Math.sin(j/SPS * Math.PI * 2 * 440) + 1) / 2 * Math.pow(2, BPS * 8)), BPS);
	}
}

var WAV = new Audio("data:Audio/WAV;base64," + btoa(data));
WAV.setAttribute("controls","controls");
WAV.play();

document.body.appendChild(WAV);

// Reference:
// http://www-mmsp.ece.mcgill.ca/documents/audioformats/wave/wave.html
// https://de.wikipedia.org/wiki/RIFF_WAVE

/* Minified version with pre-defined header
	// RIFF WAVE PCM | Mono | 44100Hz | 8 bit
	for(i=44100*DUR,d="";i--;)d+=String.fromCharCode(~~((Math.sin(i/44100*6.283*440)+1)*128));
	new Audio("data:Audio/WAV;base64,"+btoa("RIFFdataWAVEfmt "+atob("EAAAAAEAAQBErAAARKwAAAEACABkYXRh/////w==")+d)).play();
	// Web Audio API equivalent (assumes 44100 kHz sample rate):
	a=new AudioContext();s=a.createScriptProcessor(t=b=4096,1,1);s.connect(a.destination);s.onaudioprocess=function(e){for(i=0;i<b;)e.outputBuffer.getChannelData(0)[i++]=Math.sin(t++/44100*6.283*440)}
*/