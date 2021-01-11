import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_USER_GROUPS,
  getUserGroupsSuccess,
  getUserGroupsFailure,
} from '../actions';

export default ({ userGroupsApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_USER_GROUPS),
    mergeMap(() => userGroupsApi
      .getAll(state$.value.okapi)
      .pipe(
        map(getUserGroupsSuccess),
        catchError(errors => of(getUserGroupsFailure({ errors })))
      ))
  );
};
