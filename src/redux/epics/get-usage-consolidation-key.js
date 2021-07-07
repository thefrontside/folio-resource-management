import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  getUsageConsolidationKeySuccess,
  getUsageConsolidationKeyFailure,
  GET_USAGE_CONSOLIDATION_KEY,
} from '../actions';

export default ({ usageConsolidationApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_USAGE_CONSOLIDATION_KEY),
    mergeMap(action => {
      const {
        payload: credentialId,
      } = action;

      return usageConsolidationApi
        .getUsageConsolidationKey(state$.value.okapi, credentialId)
        .pipe(
          map(response => getUsageConsolidationKeySuccess(response)),
          catchError(errors => of(getUsageConsolidationKeyFailure({ errors })))
        );
    }),
  );
};
