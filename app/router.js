import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('intro', { path: '/' });
  this.route('choose-players');
  this.route('choose-level', function() {
    this.route('step1', { path: '/' });
    this.route('step2');
  });
  this.route('choose-start-point');
  this.route('rounds');
  this.route('results');
});
