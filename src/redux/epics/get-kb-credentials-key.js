import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_KB_CREDENTIALS_KEY,
  getKbCredentialsKeySuccess,
  getKbCredentialsKeyFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, state$) => {
  return action$
    .pipe(
      filter(action => action.type === GET_KB_CREDENTIALS_KEY),
      mergeMap(({ payload: { credentialsId } }) => {
        return knowledgeBaseApi
          .getCredentialsKey(state$.value.okapi, credentialsId)
          .pipe(
            map(getKbCredentialsKeySuccess),
            catchError(errors => of(getKbCredentialsKeyFailure({ errors }))),
          );
      }),
    );
};
