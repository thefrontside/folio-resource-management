import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  getUsageConsolidationSuccess,
  getUsageConsolidationFailure,
  GET_USAGE_CONSOLIDATION,
} from '../actions';

export default ({ usageConsolidationApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_USAGE_CONSOLIDATION),
    mergeMap(action => {
      const {
        payload: credentialId,
      } = action;

      return usageConsolidationApi
        .getUsageConsolidation(state$.value.okapi, credentialId)
        .pipe(
          map(response => getUsageConsolidationSuccess(response)),
          catchError(errors => of(getUsageConsolidationFailure({ errors })))
        );
    }),
  );
};
