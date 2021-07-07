import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_COST_PER_USE,
  getCostPerUseSuccess,
  getCostPerUseFailure,
} from '../actions';
import { costPerUseTypes } from '../../constants';

export default ({ costPerUseApi }) => (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === GET_COST_PER_USE),
    mergeMap(({ payload: { listType, id, filterData } }) => {
      return costPerUseApi
        .getCostPerUse(state$.value.okapi, listType, id, filterData)
        .pipe(
          map(payload => {
            let costPerUseData = payload;

            if (payload.type !== costPerUseTypes.TITLE_COST_PER_USE) {
              costPerUseData = {
                ...payload,
                attributes: {
                  ...payload.attributes,
                  analysis: payload.attributes.analysis[`${filterData.platformType}Platforms`],
                },
              };
            }

            return getCostPerUseSuccess(costPerUseData);
          }),
          catchError(errors => of(getCostPerUseFailure({ errors })))
        );
    }),
  );
};
