import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  PATCH_USAGE_CONSOLIDATION,
  patchUsageConsolidationSuccess,
  patchUsageConsolidationFailure,
} from '../actions';

export default ({ usageConsolidationApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === PATCH_USAGE_CONSOLIDATION),
    mergeMap(({ payload }) => {
      const { credentialsId, data } = payload;

      return usageConsolidationApi
        .assignUser(state$.value.okapi, credentialsId, { data })
        .pipe(
          map(() => patchUsageConsolidationSuccess(data.attributes)),
          catchError(errors => of(patchUsageConsolidationFailure(errors))),
        );
    }),
  );
};
