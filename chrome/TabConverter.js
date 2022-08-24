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
  palm_mute: 'Palm mute',
  pinch_harmonic: 'Pinch harmonic',
  natural_harmonic: 'Natural harmonic',
  legato: 'legato',
  vibrato: 'vibrato',
  muted: 'muted',
  staccato: 'staccato',
  tied: 'tied',
  let_ring: 'let ring',
  up_strum: 'up strum',
  down_strum: 'down strum',
  accented: 'accented',
  heavily_accented: 'heavily accented',
  tapped: 'tapped',
  tremolo: 'tremolo',
  ghost_note: 'ghost_note',
  slide_up: "slide_up",
  slide_down: "slide_down",
  slide_up_into: "slide_up_into", //slide when there is no prior note
  slide_down_into: "slide_down_into"
}

class Bend {
	constructor(steps) {
		this.steps = steps;
	}
}

class Duration {
	//Length should be a power of 2
	constructor(duration, triplet=False) {
		this.duration = duration;
		this.triplet = triplet;
	}
}

class Pitch {

	constructor(fret,string) {
		this.fret = fret;
		this.string = string;
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
}

/* Chord */
class Chord {
	constructor(notes) {
		this.notes = notes;
	}
}

class Comment {
	constructor(text) {
		this.text = text;
	}
}

class Measure {
	// Set fret = null for rest
	constructor(notes) {
		this.notes = notes
		this.bpm = null;
		this.time_signature = null; //pair of integers
		this.start_repeat = false;
		this.end_repeat = false;
		this.alernate_ending = null; //Number alternate ending
	}
}

class Line {
	constructor(){
		this.measures = [];
	}
}

class Tab {
	constructor(measures) {
		this.measures = measures; //Can be a measure or a comment
		this.tuning = null;
	}
}

  


/*
 * Parsing
 */
function parse_ultimate_guitar(root) {
	let measures = [];
	let tab_container = $("code > pre",root);
	console.log(tab_container.children());
	tab_container.children().each((idx,element) => {
		console.log(idx);
		console.log(element);
		element = $(element);
		let measure = null;
		switch(element.attr("class")){
			case class_comment:
				if(!element.text){
					break;
				}
				comment = new Comment(element.text);
				console.log(`Adding ${element.text}`)
				measures.push(comment);
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

				
				//Read this line
				let note_texts = note_rows.map(row_text => "");
				let flush_notes = false;
				let flush_measure = false;
				let can_flush_notes = false;
				let have_note = false;
				let measure = new Measure([]);
				let line = []; //The line is a list of measures
				for(let col = 0; col < line_length; col++) {

					//Check if we need to flush notes
					if(can_flush_notes) {	
						for(let row = 0; row < note_rows.length; row++) {
							note_val = note_rows[row][col];
							if('1234567890'.includes(note_val)){
								flush_notes = true;
								break;		
							}
						}
					}

					if(flush_notes) {
						measure.notes.push(parse_notes(note_texts));
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
						line.push(measure);
						measure = new Measure([]);
					}
				}

				measure.push.apply(line);

				console.log(lines);

				console.log("Line length: " + line_length);

				break;
		}
	});
}

note_parse_regex = 
//Note texts should be an array of strings
function parse_notes(tuning,note_texts) {
	for(let row = 0; row < note_texts.length; row++) {
		note_texts[row]
		new Pitch(row) 
	}
}

function parse_page() {
	console.log("Parse page");
	parse_ultimate_guitar($("body"));
}

//Utilities

//https://davidbieber.com/snippets/2020-12-26-pythons-strip-lstrip-and-rstrip-in-javascript/
function rtrim(x) {
	// This implementation removes whitespace from the right side
	// of the input string.
	return x.replace(/\s+$/gm, '');
  }

console.log("TabConverter");


