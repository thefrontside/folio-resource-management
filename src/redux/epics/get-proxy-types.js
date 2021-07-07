import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_PROXY_TYPES,
  getProxyTypesSuccess,
  getProxyTypesFailure,
} from '../actions';

export default ({ proxyTypesApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_PROXY_TYPES),
    mergeMap(action => {
      const { payload: credentialId } = action;

      return proxyTypesApi
        .getAll(state$.value.okapi, credentialId)
        .pipe(
          map(getProxyTypesSuccess),
          catchError(errors => of(getProxyTypesFailure({ errors })))
        );
    }),
  );
};
