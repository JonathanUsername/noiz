// Utterly insane, procedurally generated music. 
// Based on a translation of Viznut's obf C version by a1k0n


var ctx;
var v = -1; // Beat
var u = 0;
var t = 0;
var z = 0;
var I = 0;
var n = 0;
var du = 0;
var seed = "g   s   n   z   j   v   l   x   "
//          B   o   B   o   B   o   B   o
var to_add = "e"
var base = "g"
var count = 0
var pos = 5
var every = 6

var minor = [-12, -10, -9, -7, -5, -4, -2, 0, 2, 3, 5, 7, 8, 10, 12]
             //.        .   .   .       .  .     .  .  .      .
var minor_penta = [-12, -9, -7, -5, -2, 0, 3, 5, 7, 10, 12]
var major = [-12, -10, -8, -7, -5, -3, -1, 0, 2, 4, 5, 7, 9, 10, 12]
var major_penta = [-12, -10, -7, -5, -2, 0, 2, 5, 7, 10, 12]

function random(set){
  return set[~~(Math.random() * set.length)]
}

function random_in_key(base, type){
	return (base.toCode() + random(type)).toChar()
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
	index = index % seed.length
  return this.substr(0, index) + character + this.substr(index+character.length);
}

var audio_cb = function(e) {
  var buflen = e.outputBuffer.length;
  var data = e.outputBuffer.getChannelData(0);
  for (var j = 0; j < buflen;) {
    if (I == 0) {
      v++;
      n = Math.pow(1.06, seed.codePointAt(v & 31) + (v&64)/21)/6;
      I = 6000;
      if (!(v&7)) t = n/4; 
      if (v % every == 0) {
      	count++
      	if (count % 8 == 0) {
      		pos++
      		var rand = random_in_key(base, minor)
      		Math.random() > 0.8 ? rand = " " : false
      		to_add = rand
      	}
      	var ind = bar(v/every, pos % 3 + 1)
      	seed = seed.replaceAt(ind, to_add)
      	console.log(seed)
      }
      du = v&1 ? t/2 : t; 
    }
    u += du;
    z += n;    
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
