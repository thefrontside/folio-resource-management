import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  POST_USAGE_CONSOLIDATION,
  postUsageConsolidationSuccess,
  postUsageConsolidationFailure,
} from '../actions';

export default ({ usageConsolidationApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === POST_USAGE_CONSOLIDATION),
    mergeMap(action => {
      const {
        payload: { credentialsId, data },
      } = action;

      return usageConsolidationApi
        .postUsageConsolidation(state$.value.okapi, credentialsId, { data })
        .pipe(
          map(postUsageConsolidationSuccess),
          catchError(errors => of(postUsageConsolidationFailure(errors)))
        );
    }),
  );
};
