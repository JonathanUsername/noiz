// Utterly insane, procedurally generated music.


var ctx;
var v = -1; // Beat
var u = 0;
var t = 0;
var z = 0;
var I = 0;
var n = 0;
var du = 0;

// The seed sets the base notes. I would need to change the random
// note function to handle major scales
var seed = "g   s   n   z   j   v   l   x   "
//          B   o   B   o   B   o   B   o
var to_add = "e" // The first note to add
var base = "g"
var count = 0
var pos = 5
var every = 6 // how often it changes - change to 64 ? 
var minor = [-10, -9, -7, -5, -4, -2, 0, 2, 3, 5, 7, 8, 10]

function random_nearby_note(base, type){
	var code = base.toCode()
	var step = type[~~(Math.random() * type.length)]
	// console.log(step)
	return (code + step).toChar()
}

function beat(arr, times){
	out = []
	for (var i=0;i<times;i++) out = out.concat(arr)
	return out
}

function bar(bar, beat){
	return beat + (bar *4)
}

Number.prototype.toChar=function() {
	return String.fromCharCode(this)
}

String.prototype.toCode=function() {
	if (this.length == 1)
		return this.charCodeAt(0)
    return false
}

String.prototype.replaceAt=function(index, character) {
	index = index % 32
    return this.substr(0, index) + character + this.substr(index+character.length);
}

var audio_cb = function(e) {
  var buflen = e.outputBuffer.length;
  var data = e.outputBuffer.getChannelData(0);
  var offset = 0;

  // quick and dirty translation by a1k0n
  // for the length of the ring buffer
  for (var j = 0; j < buflen;) {
  	// initialise note
    if (I == 0) {
      v++;
      // pow(1.06, x) is the frequency of x semitones
      n = Math.pow(1.06, seed.codePointAt(v & 31) + (v&64)/21)/6;
      // n is the frequency of the lead synth
      I = 6000;
      // play note for 6000 samples -- originally we did 1000,
      // but now we're at a 6x higher samplerate (48kHz vs 8kHz)
      if (!(v&7)) t = n/4;  // update bass note on every 8th lead note
      if (v % every == 0) {
      	count++
      	if (count % 8 == 0) {
      		pos++
      		// console.log("pos", pos)
      		var rand = random_nearby_note(base, minor)
      		Math.random() > 0.8 ? rand = " " : false
      		// console.log("random", rand)
      		to_add = rand
      	}
      	var ind = bar(v/every, pos % 3 + 1)
      	// console.log("ind", ind)
      	// console.log("bar", v/every)
      	seed = seed.replaceAt(ind, to_add)
      	console.log(seed)
      }
      du = v&1 ? t/2 : t;  // and alternate between octaves on the bass
    }
    u += du;  // u is the bass phase
    z += n;   // z is the lead phase
    
    // the lead is just a sawtooth with a volume ramping down
    // the bass is a square with a volume ramping down and also the pulse width increases over time
    var out = ((u&8191) > (3000+I/6) ? 0 : I/64) - ((8191&z) * I >> 19);
    data[j++] = out / 128.0;
    I--;
  }
}


ctx = new AudioContext();
var gainNode = ctx.createGain();
gainNode.gain.value = 0.15;
var jsNode = ctx.createScriptProcessor(4096, 0, 1);
jsNode.onaudioprocess = audio_cb;
jsNode.connect(gainNode);
gainNode.connect(ctx.destination);
console.log("started");















// -------------------------- NOTES

// e // G
// f // G#
// g // A
// h // A#
// i // B
// j // C
// k // C#
// l // D
// m // D#
// n // E
// o // F
// p // F#
// q // G
// r // G#
// s // A
// t // A#


// var oldseed = "`cW`g[`cgcg[eYcb^bV^eW^be^bVecb^"
//var seed = "jklmnopqrstu"
//var seed = "j   gg  o   gg  n   gg  q   gg  " // upbeat

// ["B","E","A","B","E","A","B","E","A","B","E","A","A","D","A","A","D","A","A","D","A","A","D","A"]

 // arr = beat(["B","E","A"], 4)
// 	.concat(beat(["A","D","A"], 4))
// 	.concat(beat(["A","E","B"], 4))
// 	.concat(beat(["G","A","D"], 4))

// arr = beat(["C", "C#", "E", "F", "G", "F", "E", "C#", "E", "F", "G", "G"])
// 		.concat(["C", "C#", "E", "F", "G", "F", "E", "C#", "E", "F", "C#", "C"])
// 		.concat(["A#", "C", "E", "C", "A#", "C", "E", 0])

// console.log(arr)

// seed = notes_to_score(arr)
// console.log(seed, seed.length)

// function note_to_score(note, level){
// 	var level = level || 0
// 	var ref = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
// 		c = "j";
// 	var inc = ref.indexOf(note)
// 	var base = c.charCodeAt(0)
// 	return String.fromCharCode(base + inc + (12 * level))
// }

// function notes_to_score(note, level){
// 	var ref = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
// 		out = "",
// 		c = "j";
// 	for (var i=0;i<notes.length;i++){
// 		var note = notes[i]
// 		console.log(note)
// 		var inc = ref.indexOf(note)
// 		var base = c.charCodeAt(0)
// 		out += String.fromCharCode(base + inc)
// 	} 
// 	return out
// }
