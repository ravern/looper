function Looper() {
  this.selection = -1;
  this.pending = -1;
  this.recording = -1;

  this.first = null;

  this.tracks = [];

  this.elem = $('main .tracks');
  for (let i = 0; i < 10; i++) {
    this.addTrack();
  }
}

Looper.prototype.toggleRecord = function() {
  if (this.selection == -1) return;

  if (this.recording != -1) {
    if (this.recording == this.selection) {
      if (this.recording == this.first) {
        const recording = this.recording;
        this.tracks[this.selection].stopRecord();
        this.recording = -1;

        this.tracks[this.selection].loop = (function() {
          if (this.recording != -1) {
            this.tracks[this.recording].stopRecord();
            this.recording = -1;
          }
          for (const track of this.tracks) {
            track.play();
          }
          if (this.pending != -1) {
            this.tracks[this.pending].startRecord();
            this.recording = this.pending;
            this.pending = -1;
          }
        }).bind(this);

        setTimeout((function() {
          this.tracks[recording].play();
        }).bind(this), 100);
      }
    }
  } else {
    if (!this.first) {
      this.first = this.selection;
      this.tracks[this.selection].startRecord();
      this.recording = this.selection;
    } else if (this.pending == -1) {
      this.pending = this.selection;
      this.tracks[this.pending].pending();
    }
  }
};

Looper.prototype.toggleMute = function() {
  if (this.selection == -1) return;
  this.tracks[this.selection].toggleMute();
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
};

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
    this.toggleMute();
  }).bind(this));

  this.tracks.push(track);
}


function Track() {
  this.empty = true;
  this.which = 0;

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
    .prop('src', url);
  if (this.loop) audioElem.on('ended', this.loop);

  const audioElem2 = $('<audio></audio>')
    .prop('src', url);
  if (this.loop) audioElem2.on('ended', this.loop);

  this.audioElems.push([audioElem, audioElem2]);
  this.elem.append([audioElem, audioElem2]);
  this.chunks = [];
};

Track.prototype.toggleMute = function() {
  for (const elems of this.audioElems) {
    for (const elem of elems) {
      if (elem.prop('volume')) {
        elem.prop('volume', 0);
        this.elem.find('span').remove();
        this.elem
          .css({'background-color': '#ccc', color: 'black'})
          .prepend('<span>muted</span>');
      } else {
        elem.prop('volume', 1);
        this.elem.find('span').remove();
        this.elem
          .css({'background-color': '#eee', color: 'black'})
          .prepend('<span>playing</span>');
      }
    }
  }
};

Track.prototype.play = function() {
  if (this.which) {
    for (const elems of this.audioElems) {
      elems[this.which].trigger('play');
    }
    this.which = 0;
  } else {
    for (const elems of this.audioElems) {
      elems[this.which].trigger('play');
    }
    this.which = 1;
  }
};

Track.prototype.pending = function() {
        this.elem.find('span').remove();
        this.elem
          .css({'background-color': '#400', color: 'white'})
          .prepend('<span>waiting</span>');
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
    looper.toggleMute();
  } else if (e.key == 'ArrowLeft') {
    looper.left();
  } else if (e.key == 'ArrowRight') {
    looper.right();
  }
});
