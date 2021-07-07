import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_KB_CREDENTIALS,
  getKbCredentialsSuccess,
  getKbCredentialsFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, state$) => {
  return action$
    .pipe(
      filter(action => action.type === GET_KB_CREDENTIALS),
      mergeMap(() => knowledgeBaseApi
        .getCollection(state$.value.okapi)
        .pipe(
          map(getKbCredentialsSuccess),
          catchError(errors => of(getKbCredentialsFailure({ errors })))
        )),
    );
};
