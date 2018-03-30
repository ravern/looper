function Looper() {
  this.selection = -1;
  this.recording = -1;

  this.tracks = [];

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
  console.log('play');
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

  const looper = this;

  const selection = this.tracks.length;
  track.elem.mousemove(function() {
    looper.selection = selection;
    looper._reselect();
  });
  track.elem.mouseleave(function() {
    looper.selection = -1;
    looper._reselect();
  });

  track.elem.contextmenu(function(e) {
    e.preventDefault();
    looper.toggleRecord();
  });

  track.elem.click(function(e) {
    looper.togglePlay();
  });

  track.index = selection;
  this.tracks.push(track);
}


function Track() {
  this.empty = true;

  this.index = -1;

  this.elem = $('<div></div>')
    .addClass('track')
    .empty()
    .append('record');
}

Track.prototype.select = function() {
  this.elem.addClass('selected');
};

Track.prototype.deselect = function() {
  this.elem.removeClass('selected');
};

Track.prototype.startRecord = function() {
  this.elem
    .css({'background-color': 'red'})
    .empty()
    .append('recording');
};

Track.prototype.stopRecord = function() {
  this.elem
    .css({'background-color': '#eee', color: 'black'})
    .empty()
    .append('playing');
};

let looper;

$(document).ready(function() {
  looper = new Looper();
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
