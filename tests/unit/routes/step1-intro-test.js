import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | step1-intro', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:step1-intro');
    assert.ok(route);
  });
});
