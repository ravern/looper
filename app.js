function Looper() {
  this.selection = -1;
  this.tracks = [];

  this.elem = $('main .tracks');
  for (let i = 0; i < 4; i++) {
    this.addTrack();
  }
}

Looper.prototype.toggle = function() {
  if (this.selection == -1) return;
  console.log(this.selection);
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

  track.elem.click(function() {
    looper.toggle();
  });

  this.tracks.push(track);
}


function Track() {
  this.empty = true;

  this.elem = $('<div></div>')
    .addClass('track')
    .append('record');
}

Track.prototype.select = function() {
  this.elem.addClass('selected');
};

Track.prototype.deselect = function() {
  this.elem.removeClass('selected');
};


const COLORS = [
  '#7b4b94',
  '#ff3366',
  '#2ec4b6',
  '#7b4b94',
  '#20a4f3',
];

let looper;

$(document).ready(function() {
  looper = new Looper();
});

$(window).keypress(function(e) {
  if (e.key == ' ') {
    looper.toggle();
  } else if (e.key == 'ArrowLeft') {
    looper.left();
  } else if (e.key == 'ArrowRight') {
    looper.right();
  }
});
