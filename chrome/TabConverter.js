/**
 * 
 */

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

/* Notes */
class Note {
	// Set fret = null for rest
	constructor(fret) {
		this.fret = fret;
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

