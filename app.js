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

function Looper() {
}

Looper.prototype.toggle = function() {
  console.log('toggle');
};

Looper.prototype.left = function() {
  console.log('left');
};

Looper.prototype.right = function() {
  console.log('right');
};
