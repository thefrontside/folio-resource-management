import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  POST_KB_CREDENTIALS,
  postKBCredentialsSuccess,
  postKBCredentialsFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === POST_KB_CREDENTIALS),
    mergeMap(({ payload }) => {
      return knowledgeBaseApi
        .createCredentials(state$.value.okapi, payload)
        .pipe(
          map(postKBCredentialsSuccess),
          catchError(errors => of(postKBCredentialsFailure({ errors })))
        );
    }),
  );
};
