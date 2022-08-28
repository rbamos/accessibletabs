/**
 * 
 */

/* Parsing constants */
//UG
selector_tab_container = "code > pre"
class_comment = "y68er"
class_tablature="fsG7q"

base_note_names = ["A","a","B","b","C","c","D","d","E","e","F","f","G","g"];
all_note_names = ["Ab","A","A#","ab","a","a#","Bb","B","B#","bb","b","b#","Cb","C","C#","cb","c","c#","Db","D","D#","db","d","d#","Eb","E","E#","eb","e","e#","Fb","F","F#","fb","f","f#","Gb","G","G#","gb","g","g#"];

/*
 ***************************
 * Tab object and components
 ***************************
 */

/* Properties of notes */
const NoteProperty = {
  palm_mute: 'palm mute',
  pinch_harmonic: 'pinch harmonic',
  natural_harmonic: 'natural harmonic',
  legato: 'legato',
  vibrato: 'vibrato',
  bend: 'bend',
  release: 'release',
  muted: 'muted',
  tied: 'tied',
  tapped: 'tap',
  tremolo: 'tremolo',
  ghost_note: 'ghost_note',
  slide_up: "slide off up",
  slide_down: "slide off down",
  slide_up_into: "slide up", //slide when there is no prior note
  slide_down_into: "slide down"
}

//e.g. palm mute on 6th string 2nd fret
const NotePropertyBeforeOn = new Set([
	NoteProperty.palm_mute, NoteProperty.pinch_harmonic, NoteProperty.natural_harmonic, NoteProperty.tapped, NoteProperty.tied, NoteProperty.ghost_note
]);

//e.g. Slide up 6th string 2nd fret
const NotePropertyBeforeInto = new Set([
	NoteProperty.slide_up_into, NoteProperty.slide_down_into
]);

//e.g. 6th string 2nd fret with vibrato
const NotePropertyAfterWith = new Set([
	NoteProperty.vibrato, NoteProperty.bend, NoteProperty.release, NoteProperty.tremolo
]);

//e.g. 6th string 2nd fret then legato
const NotePropertyAfterThen = new Set([
	NoteProperty.legato, NoteProperty.slide_up, NoteProperty.slide_down
]);


const ChordProperty = {
	let_ring: 'Let ring',
	up_strum: 'Up strum',
	down_strum: 'Down strum',
	accented: 'Accented',
	heavily_accented: 'Heavily accented',
	staccato: 'Staccato',
}

class Bend {
	constructor(steps) {
		this.steps = steps;
	}

	toString = function() {
		
	}
}

class Duration {
	//Length should be a power of 2
	constructor(duration, triplet=False) {
		this.duration = duration;
		this.triplet = triplet;
	}

	toString = function() {
		
	}
}

class Pitch {

	constructor(fret,string) {
		this.fret = fret;
		this.string = string;
	}

	toString = function() {
		if(this.fret == null) {
			return `mute ${numberAdjective(this.string)} string`
		} else if (this.fret == 0){
			return `${numberAdjective(this.string)} string open`
		}
		return `${numberAdjective(this.string)} string ${numberAdjective(this.fret)} fret`
	}
	
}

/* Notes */
class Note {
	// Set pitch = null for rest
	//
	constructor(pitch) {
		this.pitch = pitch;
		this.duration = null;
		this.properties = [];
	}

	addProperty = function(p) {
		this.properties.push(p);
	}

	toString = function(count=null) {
		//Todo implement version with count
		let s = this.pitch.toString();

		let before_on = listToText(this.properties.filter(value => NotePropertyBeforeOn.has(value)));
		if(before_on != null){
			s = `${before_on} on ${s}`;
		}

		let before_into = listToText(this.properties.filter(value => NotePropertyBeforeInto.has(value)));
		if(before_into != null){
			s = `${before_into} into ${s}`;
		}

		let after_with = listToText(this.properties.filter(value => NotePropertyAfterWith.has(value)));
		if(after_with != null){
			s = `${s} with ${after_with}`;
		}

		let after_then = this.properties.filter(value => NotePropertyAfterThen.has(value));
		if(after_then != null){
			after_then.forEach((val, idx, ar) => { //Different approach for this text
				s = `${s} then ${val}`;
			});
		}

		return `${s[0].toUpperCase()}${s.slice(1)}.`;
	}
}

/* Chord */
class Chord {
	constructor(notes) {
		this.notes = notes;
	}

	toString = function() {
		
		let s = stringAndJoin(this.notes," ");//this.notes.forEach(val => val.toString()).join(" ");
		return `<p>${s}<p>`;
	}
}

class Comment {
	constructor(text) {
		this.text = text;
	}

	toString = function() {
		match = /^\s*\[(.*?)\]\s*$/.exec(this.text)
		if(match != null) {
			return `<h2>${match[1]}</h2>`;
		}
		return `<p>${this.text}</p>`;
	}
}

class Measure {
	// Set fret = null for rest
	constructor(chords,measure_number) {
		this.chords = chords
		this.measure_number = measure_number;
		this.bpm = null;
		this.time_signature = null; //pair of integers
		this.start_repeat = false;
		this.end_repeat = false;
		this.alernate_ending = null; //Number alternate ending
	}

	toString = function() {
		//Todo: implement alternate endings etc
		return `<h4>Measure ${this.measure_number}</h4>\n${stringAndJoin(this.chords,"\n")}`;
	}
}

class Line {
	constructor(measures,line_number){
		this.measures = measures;
		this.line_number = line_number;
	}

	toString = function() {
		return `<h3>Line ${this.line_number}</h3>\n${stringAndJoin(this.measures,"\n")}`;
	}
}

class Tab {
	constructor(lines) {
		this.lines = lines; //Can be a measure or a comment
		this.tuning = null;
	}

	toString = function() {
		let s = "<h1>Tab</h1>";
		let line_count = 1;
		s += "<h2>Preamble</h2>"
		this.lines.forEach((val,index,array) => {
			s += `${val.toString()}`;
		});
		return s;
	}
}

  


/*
 * Parsing
 */
function parse_ultimate_guitar(root) {
	let line_number = 1;
	let measure_number = 1;

	let music_lines = [];
	let tab_container = $("code > pre",root);
	console.log(tab_container.children());
	tab_container.children().each((idx,element) => {
		console.log(idx);
		console.log(element);
		element = $(element);
		switch(element.attr("class")){
			case class_comment:
				if(!rtrim(element.text())){
					break;
				}
				comment = new Comment(rtrim(element.text()));
				music_lines.push(comment);
				break;
			case class_tablature: 
				let lines = [];
				element.children().each((idx2,element2) => {
					lines.push(rtrim($(element2).text()));
				});
				
				let line_length = 0;
				lines.forEach((val) => {
					line_length = Math.max(line_length,val.length);
				});

				tuning_cols_end = 0;
				//Find note columns
				find_tuning_cols: for(let col = 0; col < line_length; col++) {
					for(let row = 0; row < lines.length; row++) {
						//If the text is | or -, we probably found the start of the 
						if(lines[row][col] == "|" || lines[row][col] == "-"){
							break find_tuning_cols;
						}
					}
					tuning_cols_end++;
				}

				notes_start = tuning_cols_end;
				note_rows = [];
				comment_rows = [];
				//Figure out which lines are notes and which are comments
				for(let row = 0; row < lines.length; row++) {
					after_tuning = lines[row][tuning_cols_end];
					if(after_tuning == "|" || after_tuning == "-"){
						if(note_rows.length == 0) {
							if(after_tuning == "|"){
								notes_start++;
							}
						}
						note_rows.push(lines[row]);
					} else {
						comment_rows.push(lines[row]);
					}
				}

				let note_line_length = line_length;
				note_rows.forEach((val) => {
					note_line_length = Math.min(note_line_length,val.length);
				});

				
				//Read this line
				let note_texts = note_rows.map(row_text => "");
				let flush_notes = false;
				let flush_measure = false;
				let can_flush_notes = false;
				let have_note = false;
				let measure = new Measure([],measure_number++);
				let line = []; //The line is a list of measures
				for(let col = notes_start; col < note_line_length; col++) {

					//Check if we need to flush notes
					if(can_flush_notes) {
						all_dashes = true;
						for(let row = 0; row < note_rows.length; row++) {
							note_val = note_rows[row][col];
							if('1234567890'.includes(note_val)){
								flush_notes = true;
								break;
							}
							if(note_val != "-") {
								all_dashes = false;
							}
						}
						if(all_dashes) {
							flush_notes = true;
						}
					}

					if(flush_notes) {
						measure.chords.push(parse_chord(note_texts));
						note_texts = note_rows.map(row_text => "");
						have_note = false;
					}

					can_flush_notes = have_note; //Flush if we don't hit any numbers this column AND we have hit a number before
					flush_notes = false;
					flush_measure = false; //Flush measure if we hit a measure marker
					for(let row = 0; row < note_rows.length; row++) {
						note_val = note_rows[row][col];
						if(note_val == "-") {
							continue;
						}
						if(note_val == "|"){ //measure marker
							flush_measure = true;
							break;
						}
						if('1234567890'.includes(note_val)){
							can_flush_notes = false;
							have_note = true;
						}
						note_texts[row] += note_val;
					}
					
					if(flush_measure) {
						//Check if we have remaining notes
						if(note_texts.some(function(element, index, ar){return element != ""})){
							measure.chords.push(parse_chord(note_texts));
							note_texts = note_rows.map(row_text => "");
							have_note = false;
						}
						line.push(measure);
						measure = new Measure([],measure_number++);
					}
				}

				//Finish/flush incomplete reads
				if(note_texts.some(function(element, index, ar){return element != ""})){
					measure.chords.push(parse_chord(note_texts));
				}
				if(measure.chords.length != 0){
					line.push(measure);
				}

				console.log(line);

				music_lines.push(new Line(line,line_number++));

				//console.log(lines);

				console.log("Line length: " + line_length);

				break;
		}
	});
	//console.log(music_lines);
	tab = new Tab(music_lines);
	$("section.OnD3d.kmZt1").html(`${tab.toString()}`);
	return tab;
}
//Note texts should be an array of strings
//Returns a chord with the notes
function parse_chord(note_texts) {
	notes = [];
	for(let row = 0; row < note_texts.length; row++) {
		
		//Don't try to make a note for empty rows
		if(note_texts[row].length == 0) {continue;}

		/*
		 * Groups:
		 * 0: Slide into
		 * 1: Ghost note/artificial harmonic
		 * 2: Fret/dead note
		 * 3: See 1
		 * 4: Vibrato
		 * 5: Slide out
		 * 6: legato
		 * 7: Bend
		 * 8: Release bend
		 */
		match = /o?([\\\/]?)([\(\[]?)(\d+|x)([\)\]]?)(~*)([\\\/s]?)([hp]?)(b?)(r?)/.exec(note_texts[row]);
		if(!match) {
			console.log("Failed to parse note text");
			console.log(note_texts);
			console.log(row);
		}
		groups = match.slice(1);

		//Is dead note or fret?
		switch(groups[2]){
			case "x":
				fret = null;
				break;
			default:
				fret = parseInt(groups[2]);
		}
		let pitch = new Pitch(fret,row+1);
		let note = new Note(pitch);

		if(fret == null) {
			note.addProperty(NoteProperty.dead_note);
		}

		switch(groups[0]){
			case "\\":
				note.addProperty(NoteProperty.slide_down_into);
				break;
			case "/":
				note.addProperty(NoteProperty.slide_up_into);
				break;
		}
		switch(groups[1]){
			case "(":
				if(groups[3] != ")"){
					console.error(`Badly matched open parens with ${groups[3]}`)
				} else {
					note.addProperty(NoteProperty.ghost_note);
				}
				break;
			case "[":
				if(groups[3] != "]"){
					console.error(`Badly matched open bracket with ${groups[3]}`)
				} else {
					note.addProperty(NoteProperty.pinch_harmonic);
				}
				break;
		}
		switch(groups[4]){
			case "": //No match
			case null:
				break;
			default: //Any number of tildes
				note.addProperty(NoteProperty.vibrato);
				break;
		}
		switch(groups[5]){
			case "\\":
				note.addProperty(NoteProperty.slide_down);
				break;
			case "/":
				note.addProperty(NoteProperty.slide_up);
				break;
		}
		switch(groups[6]){
			case "h":
			case "p":
				note.addProperty(NoteProperty.legato);
				break;
		}
		switch(groups[7]){
			case "b":
				note.addProperty(NoteProperty.bend);
				break;
		}
		switch(groups[8]){
			case "r":
				note.addProperty(NoteProperty.release);
				break;
		}
		notes.push(note);
	}
	return new Chord(notes);
}

//Utilities

//https://davidbieber.com/snippets/2020-12-26-pythons-strip-lstrip-and-rstrip-in-javascript/
function rtrim(x) {
	// This implementation removes whitespace from the right side
	// of the input string.
	return x.replace(/\s+$/gm, '');
}
//----

//List of strings -> text list (warning: includes oxford comma)
function listToText(l, joiner=','){
	switch(l.length) {
		case 0:
			return null;
		case 1:
			return l[0];
		case 2:
			return `${l[0]} and ${l[1]}`;
		default:
			return `${l.slice(0,l.length-1).join(`${joiner} `)}${joiner} and ${l[l.length-1]}`;
	}
}

function stringAndJoin(l,joiner=", ") {
	//FIXME surely there must be a cleaner way to do this?
	let str_list = [];
	l.forEach((v) => {str_list.push(v.toString())});
	return str_list.join(joiner);
}


//https://stackoverflow.com/a/20426113/582136
var special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function numberAdjective(n) {
  if (n < 20) return special[n];
  if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
  return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
}
//----

function parse_page() {
	console.log("Parse page");
	try{
		parse_ultimate_guitar($("body"));
	} catch (e) {
		alert("Failed to parse page, error in console");
		throw e;
	}
}

console.log("TabConverter");


