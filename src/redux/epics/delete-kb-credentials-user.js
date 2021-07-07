import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  DELETE_KB_CREDENTIALS_USER,
  deleteKBCredentialsUserSuccess,
  deleteKBCredentialsUserFailure,
} from '../actions';

export default ({ kbCredentialsUsersApi }) => (action$, state$) => {
  return action$
    .pipe(
      filter(action => action.type === DELETE_KB_CREDENTIALS_USER),
      mergeMap(({ payload }) => {
        const { credentialsId, userId } = payload;

        return kbCredentialsUsersApi
          .unassignUser(state$.value.okapi, credentialsId, userId)
          .pipe(
            map(() => deleteKBCredentialsUserSuccess(userId)),
            catchError(errors => of(deleteKBCredentialsUserFailure({ errors }))),
          );
      }),
    );
};
