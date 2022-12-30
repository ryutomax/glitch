/**
 * demo.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
/*!
 * imagesLoaded PACKAGED v4.1.3
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

setTimeout(() => document.body.classList.add('render'), 60);
imagesLoaded('.glitch__img', { background: true }, () => {
  document.body.classList.remove('loading');
  document.body.classList.add('imgloaded');
});

console.log("demo");
