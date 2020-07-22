import PubSub from 'pubsub-js';

export default function keyEvent(key) {
  PubSub.publish('ARCADE_BUTTON', key);
}

if (window) {
  window.key_event = keyEvent;
}
