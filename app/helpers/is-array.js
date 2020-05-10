import { helper } from '@ember/component/helper';

export default helper(function isArray(params/*, hash*/) {
  if (params && params[0]) {
    return Array.isArray(params[0]);
  }
});
