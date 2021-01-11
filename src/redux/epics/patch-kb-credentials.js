import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  PATCH_KB_CREDENTIALS,
  patchKBCredentialsSuccess,
  patchKBCredentialsFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === PATCH_KB_CREDENTIALS),
    mergeMap(({ payload }) => {
      return knowledgeBaseApi
        .editCredentials(state$.value.okapi, { data: payload.data }, payload.credentialId)
        .pipe(
          map(() => patchKBCredentialsSuccess({
            // here we're using data that comes from the form but not the response
            // because the response sends api key in an encrypted format. this differs from the
            // actual value of the key in form.
            // this difference causes the form to become dirty right after the update
            ...payload.data,
          })),
          catchError(errors => of(patchKBCredentialsFailure({ errors }))),
        );
    }),
  );
};
