import PubSub from 'pubsub-js';

if (!('PubSub' in window)) {
  window.PubSub = PubSub;
}
