import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_CURRENCIES,
  getCurrenciesSuccess,
  getCurrenciesFailure,
} from '../actions';

export default ({ currenciesApi }) => (action$, state$) => {
  return action$
    .pipe(
      filter(action => action.type === GET_CURRENCIES),
      mergeMap(() => {
        return currenciesApi
          .getAll(state$.value.okapi)
          .pipe(
            map(getCurrenciesSuccess),
            catchError(errors => of(getCurrenciesFailure({ errors }))),
          );
      }),
    );
};
