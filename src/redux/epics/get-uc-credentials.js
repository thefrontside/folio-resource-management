import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  getUcCredentialsSuccess,
  getUcCredentialsFailure,
  GET_UC_CREDENTIALS,
} from '../actions';

export default ({ ucCredentialsApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_UC_CREDENTIALS),
    mergeMap(() => {
      return ucCredentialsApi
        .getUcCredentials(state$.value.okapi)
        .pipe(
          map(getUcCredentialsSuccess),
          catchError(errors => of(getUcCredentialsFailure(errors)))
        );
    }),
  );
};
