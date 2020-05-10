import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | choose-level/step2', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:choose-level/step2');
    assert.ok(route);
  });
});
