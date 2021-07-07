import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  UPDATE_UC_CREDENTIALS,
  updateUcCredentialsFailure,
  updateUcCredentialsSuccess,
} from '../actions';

export default ({ ucCredentialsApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === UPDATE_UC_CREDENTIALS),
    mergeMap(action => {
      const { payload } = action;

      return ucCredentialsApi
        .updateUcCredentials(state$.value.okapi, payload)
        .pipe(
          map(updateUcCredentialsSuccess),
          catchError(errors => of(updateUcCredentialsFailure(errors)))
        );
    }),
  );
};
