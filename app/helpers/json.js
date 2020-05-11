import { helper } from '@ember/component/helper';

export default helper(function json(params/*, hash*/) {
  return JSON.stringify(params[0]);
});
