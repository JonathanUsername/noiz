// Utterly insane, procedurally generated music.
// Based on a translation of Viznut's obf C version by a1k0n


Number.prototype.toChar=function() {
  return String.fromCharCode(this)
}

String.prototype.toCode=function() {
  if (this.length == 1)
    return this.charCodeAt(0)
  return false
}

String.prototype.replaceAt=function(index, character) {
  index = index % seed.length
  return this.substr(0, index) + character + this.substr(index+character.length);
}

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
var base = seed.substr(0,1) // The first base note
var count = 0
var pos = 5
var every = 6 // how often it changes - change to 64 ? 
var chance_of_skip = 0.2
var minor = [-19, -17, -16, -14, -12, -10, -9, -7, -5, -4, -2, 0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19]
var intervals = [2,1,2,2,1,2,2] // intervals in minor scale
var minor_penta = [-12, -9, -7, -5, -2, 0, 3, 5, 7, 10, 12]
var range = Math.abs(minor[0]) + Math.abs(minor[minor.length-1]) // the range that the random key selector reaches
var lto_add = random_in_key(base, minor) // The first note to add
var maxsteps = 8

// Display vars
var ch = 510, 
    cw = 640;
var beat_height = 10
document.getElementsByTagName("body")[0].innerHTML = '<canvas id="c" height="' + ch + '" width="' + cw + '" style="border:1px solid #000000;"></canvas>'
var canctx = document.getElementsByTagName("canvas")[0].getContext("2d")

function random(set){
  return set[~~(Math.random() * set.length)]
}

function random_in_key(base, type){
  var base_code = base.toCode()
  var random_interval = random(type)
  return (base_code + random_interval).toChar()
}

function randomsteps(steps){
  var diff = 0
  // any number of steps between 1 and 12
  var steps = ~~(Math.random() * 11) + 1
  var reverse = Math.random() > 0.5 ? true : false
  // modulo 7 since intervals at index 1 and 4 in minor scale are 1 
  // 2 and 5 in reverse
  var ones = reverse ? [2,5] : [1,4]
  for (var i=0;i<steps;i++) ones.indexOf(i % 7) == -1 ? diff += 2 : diff += 1
  if (reverse) diff = ~diff + 1
  console.log(diff)
  return base.toCode() + diff
}

function beat(arr, times){
  out = []
  for (var i=0;i<times;i++) out = out.concat(arr)
  return out
}

function bar(bar, beat){
  return beat + (bar *4)
}

function colour(code){
  return "rgba(" + sineTrans(code, 0) + "," + sineTrans(code, 2) + "," + sineTrans(code, 4) + ",1)"
}

function sineTrans(code, shift){
  // repeats when frequency * i == 2 * Pi and our range is 24 so freq = 6.2 / 24, 128 and 127 are mid colour point from 255
  var freq = 6.2 / range
  return ~~(Math.sin(freq * code + shift) * 128 + 127)
}

function moveDot(i){
  canctx.clearRect(0, ch - beat_height, cw, beat_height);
  canctx.fillStyle = "#000000"
  var rw = cw / seed.length,
      rh = beat_height, 
      rl = i*rw, 
      rt = ch-rh;
  canctx.fillRect(rl,rt,rw,rh);
}

function display(seed){
  canctx.clearRect(0, 0, cw, ch - beat_height);
  var lowest = base.toCode() + minor[0]
  for (i=0;i<seed.length;i++){
    var letter = seed[i]
    if (letter === " ")
      continue
    var code = letter.toCode() - lowest
    canctx.fillStyle = colour(code)
    var rw = cw / seed.length,
        rh = ch / range * code, 
        rl = i*rw, 
        rt = ch-rh - beat_height;
    canctx.fillRect(rl,rt,rw,rh);
    canctx.font = "30px Arial";
    canctx.fillText(letter,rl,ch/2);
    canctx.strokeStyle = "#ffffff"
    canctx.strokeText(letter,rl,ch/2);
  }
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
      n = Math.pow(1.06, seed.codePointAt(v & seed.length - 1) + (v&64)/21)/6;
      // n is the frequency of the lead synth
      I = 6000;
      // play note for 6000 samples -- originally we did 1000,
      // but now we're at a 6x higher samplerate (48kHz vs 8kHz)
      if (!(v&7)) t = n/4;  // update bass note on every 8th lead note
      moveDot(v % seed.length)
      if (v % every == 0) { // update interstitials
      	count++
      	if (count % 8 == 0) {
      		pos++
      		// console.log("pos", pos)
      		var rand = Math.random() < chance_of_skip ? " " : randomsteps()
      		// console.log("random", rand)
      		lto_add = rand
      	}
        if (count % 12 == 0){
          var rand = random_in_key(base, minor_penta)
          var rto_add = rand
          var rind = bar(v/every, pos % 4 ) % seed.length // Broken
          seed = seed.replaceAt(rind, rto_add)
          // console.log("RIND", rind)
        }
        var lind = bar(v/every, pos % 3 + 1) % seed.length
        // console.log("lind", lind)
        // console.log("bar", v/every)
        seed = seed.replaceAt(lind, lto_add)
        display(seed)
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
// u // B
// v // C
// w // C#
// x // D
// y // D# 
// z // E

// var major = [-12, -10, -8, -7, -5, -3, -1, 0, 2, 4, 5, 7, 9, 10, 12, 14, 16, 17, 19]
// var major_penta = [-12, -10, -7, -5, -2, 0, 2, 5, 7, 10, 12]

// var oldseed = "`cW`g[`cgcg[eYcb^bV^eW^be^bVecb^"
//var seed = "jklmnopqrstu"
//var seed = "j   gg  o   gg  n   gg  q   gg  " // upbeat
            //.        .   .   .       .  .     .  .  .      .   .
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
