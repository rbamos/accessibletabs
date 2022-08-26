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
  legato: 'Legato',
  vibrato: 'Vibrato',
  bend: 'Bend',
  muted: 'Muted',
  staccato: 'Staccato',
  dead_note: 'Dead note',
  tied: 'Tied',
  let_ring: 'Let ring',
  up_strum: 'Up strum',
  down_strum: 'Down strum',
  accented: 'Accented',
  heavily_accented: 'Heavily accented',
  tapped: 'Tapped',
  tremolo: 'Tremolo',
  ghost_note: 'Ghost_note',
  slide_up: "Slide up",
  slide_down: "Slide down",
  slide_up_into: "Slide up into", //slide when there is no prior note
  slide_down_into: "Slide down into"
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

	addProperty = function(p) {
		this.properties.push(p);
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
	constructor(measures){
		this.measures = measures;
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
	let music_lines = [];
	let tab_container = $("code > pre",root);
	console.log(tab_container.children());
	tab_container.children().each((idx,element) => {
		console.log(idx);
		console.log(element);
		element = $(element);
		let measure = null;
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
				let measure = new Measure([]);
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

				//Finish/flush incomplete reads
				if(note_texts.some(function(element, index, ar){return element != ""})){
					measure.notes.push(parse_notes(note_texts));
				}
				if(measure.notes.length != 0){
					line.push(measure);
				}

				console.log(line);

				music_lines.push(new Line(line));

				console.log(lines);

				console.log("Line length: " + line_length);

				break;
		}
	});
	console.log(music_lines);
}
//Note texts should be an array of strings
//Returns a chord with the notes
function parse_notes(note_texts) {
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
		 */
		match = /o?([\\\/]?)([\(\[]?)(\d+|x)([\)\]]?)(~+)?([\\\/s]?)([hp]?)(b?)/.exec(note_texts[row]);
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
		notes.push(note);
	}
	return new Chord(notes);
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


