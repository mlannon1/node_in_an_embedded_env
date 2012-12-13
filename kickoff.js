var cp = require('child_process');

function fireAt(text, time) {
  setTimeout(function () {
    console.log(text);
  }, time)
}

fireAt('Hi!', 1000);
fireAt('My name is Matt!', 2000);
fireAt('I work for Koko!', 3000);
fireAt('We make awesome stuff that makes you healthy!', 4000);
fireAt('Let me show you how!', 5000);

setTimeout(function () {
  process.stdout.write('\u001B[2J\u001B[0;0f\'');
}, 8000);
