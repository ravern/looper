function Looper() {
  this.selection = -1;
  this.recording = -1;

  this.tracks = [];
  this.playing = []

  this.elem = $('main .tracks');
  for (let i = 0; i < 5; i++) {
    this.addTrack();
  }
}

Looper.prototype.toggleRecord = function() {
  if (this.selection == -1) return;

  if (this.recording != -1) {
    if (this.recording == this.selection) {
      this.tracks[this.selection].stopRecord();
      this.recording = -1;
    }
  } else {
    // TODO use the timing
    this.tracks[this.selection].startRecord();
    this.recording = this.selection;
  }
};

Looper.prototype.togglePlay = function() {
  if (this.selection == -1) return;
  this.tracks[this.selection].togglePlay();
};

Looper.prototype.left = function() {
  if (this.selection < 1) return;

  this.selection--;
  this._reselect();
};

Looper.prototype.right = function() {
  if (this.selection >= this.tracks.length - 1) return;

  this.selection++;
  this._reselect();
};

Looper.prototype._reselect = function() {
  for (let i = 0; i < this.tracks.length; i++) {
    if (i == this.selection) {
      this.tracks[i].select();
    } else {
      this.tracks[i].deselect();
    }
  }
}

Looper.prototype.addTrack = function() {
  const track = new Track();

  this.elem.append(track.elem);

  const selection = this.tracks.length;

  track.elem.mousemove((function() {
    this.selection = selection;
    this._reselect();
  }).bind(this));

  track.elem.mouseleave((function() {
    this.selection = -1;
    this._reselect();
  }).bind(this));

  track.elem.contextmenu((function(e) {
    e.preventDefault();
    this.toggleRecord();
  }).bind(this));

  track.elem.click((function(e) {
    this.togglePlay();
  }).bind(this));

  this.tracks.push(track);
}


function Track() {
  this.empty = true;

  this.elem = $('<div></div>')
    .addClass('track')
    .append('<span>record</span>');
  this.audioElems = [];

  this.chunks = [];
  this.recorder = new MediaRecorder(stream);
  this.recorder.ondataavailable = (function(e) {
    this.chunks.push(e.data);
  }).bind(this);
  this.recorder.onstop = this.stoppedRecord.bind(this);
}

Track.prototype.select = function() {
  this.elem.addClass('selected');
};

Track.prototype.deselect = function() {
  this.elem.removeClass('selected');
};

Track.prototype.startRecord = function() {
  this.elem.find('span').remove();
  this.elem
    .css({'background-color': 'red'})
    .prepend('<span>recording</span>');

  this.recorder.start();
};

Track.prototype.stopRecord = function() {
  this.elem.find('span').remove();
  this.elem
    .css({'background-color': '#eee', color: 'black'})
    .prepend('<span>playing</span>');

  this.recorder.stop();
};

Track.prototype.stoppedRecord = function() {
  const blob = new Blob(this.chunks, {type: 'audio/ogg; codecs=opus'});
  const url = URL.createObjectURL(blob);

  const audioElem = $('<audio></audio>')
    .attr('loop', '')
    .prop('src', url);
  this.audioElems.push(audioElem);
  this.elem.append(audioElem);
  audioElem.trigger('play');

  this.chunks = [];
};

Track.prototype.togglePlay = function() {
  for (const elem of this.audioElems) {
    if (elem.prop('volume')) {
      elem.prop('volume', 0);
    } else {
      elem.prop('volume', 1);
    }
  }
};

let looper;
let stream;

$(document).ready(function() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({audio: true})
      .then(function(str) {
        stream = str;

        // Do the init code in here
        looper = new Looper();
      })
      .catch(function(err) {
        console.error(err);
      });
  } else {
    console.error('getUserMedia not supported!');
  }
});

$(window).keypress(function(e) {
  if (e.key == 'Enter') {
    looper.toggleRecord();
  } else if (e.key == ' ') {
    looper.togglePlay();
  } else if (e.key == 'ArrowLeft') {
    looper.left();
  } else if (e.key == 'ArrowRight') {
    looper.right();
  }
});
