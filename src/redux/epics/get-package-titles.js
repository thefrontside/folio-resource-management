import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  getPackageTitlesSuccess,
  getPackageTitlesFailure,
  GET_PACKAGE_TITLES,
} from '../actions';

export default ({ packageTitlesApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_PACKAGE_TITLES),
    mergeMap(action => {
      const {
        payload: {
          packageId,
          params,
        },
      } = action;

      return packageTitlesApi
        .getCollection(state$.value.okapi, packageId, params)
        .pipe(
          map(getPackageTitlesSuccess),
          catchError(errors => of(getPackageTitlesFailure({ errors })))
        );
    }),
  );
};
