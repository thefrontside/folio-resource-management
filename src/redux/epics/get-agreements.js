import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_AGREEMENTS,
  getAgreementsSuccess,
  getAgreementsFailure,
} from '../actions';

export default ({ agreementsApi }) => (action$, state$) => {
  return action$
    .pipe(
      filter(action => action.type === GET_AGREEMENTS),
      mergeMap(action => {
        const {
          payload: {
            refId,
          },
        } = action;

        return agreementsApi
          .getAll(state$.value.okapi, refId)
          .pipe(
            map(response => getAgreementsSuccess(response)),
            catchError(errors => of(getAgreementsFailure({ errors }))),
          );
      }),
    );
};
