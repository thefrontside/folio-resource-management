import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_COST_PER_USE_PACKAGE_TITLES,
  getCostPerUsePackageTitlesSuccess,
  getCostPerUsePackageTitlesFailure,
} from '../actions';

export default ({ costPerUseApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_COST_PER_USE_PACKAGE_TITLES),
    mergeMap(({ payload: { id, filterData, loadMore } }) => {
      return costPerUseApi
        .getPackageTitlesCostPerUse(state$.value.okapi, id, filterData)
        .pipe(
          map((payload) => {
            const costPerUseData = {
              type: 'packageTitleCostPerUse',
              attributes: {
                resources: payload.data,
                meta: payload.meta,
                parameters: payload.parameters,
              },
            };

            return getCostPerUsePackageTitlesSuccess(costPerUseData, loadMore);
          }),
          catchError(errors => of(getCostPerUsePackageTitlesFailure({ errors })))
        );
    }),
  );
};
