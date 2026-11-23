import { modifier } from 'ember-modifier';

export default modifier(function setStyle(element, positional, styles) {
  Object.assign(element.style, styles);
});
