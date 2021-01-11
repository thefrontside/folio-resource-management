import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_KB_CREDENTIALS_USERS,
  getKBCredentialsUsersSuccess,
  getKBCredentialsUsersFailure,
} from '../actions';

export default ({ kbCredentialsUsersApi }) => (action$, state$) => {
  return action$
    .pipe(
      filter(action => action.type === GET_KB_CREDENTIALS_USERS),
      mergeMap(({ payload: { credentialsId } }) => {
        return kbCredentialsUsersApi
          .getCollection(state$.value.okapi, credentialsId)
          .pipe(
            map(getKBCredentialsUsersSuccess),
            catchError(errors => of(getKBCredentialsUsersFailure({ errors }))),
          );
      }),
    );
};
