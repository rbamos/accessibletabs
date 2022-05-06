/**
 * 
 */

/* Parsing constants */
//UG
selector_tab_container = "code > pre"
class_comment = "_3rlxz"
class_tablature="_2jIGi"


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
  ghost_note: 'ghost_note'
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
	// Set pitches = null for rest
	//
	constructor(pitches) {
		this.pithces = pitches;
		this.duration = null;
		this.properties = [];
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

class Tab {
	constructor(measures) {
		this.measures = measures; //Can be a measure or a comment
		this.tuning = null;
	}
}


/*
 * Parsing
 */
function parse_ultimate_guitar() {
	$("code.")
}



//https://stackoverflow.com/questions/15581059/how-to-add-text-to-an-existing-div-with-jquery
$(function () {
	console.log("test1")
	$('#convert').click(function () {
	  $('#content').after('<p>Text after the button</p>');
	  console.log("test3")
	});
  });
  console.log("test2")