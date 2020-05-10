import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ChooseStartPointController extends Controller {
  @service game;
  @service router;

  @action selectPoint(points) {
    console.log(points);
  }
}
