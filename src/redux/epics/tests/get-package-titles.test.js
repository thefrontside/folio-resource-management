import { TestScheduler } from 'rxjs/testing';

import createGetPackageTitlesEpic from '../get-package-titles';

import {
  GET_PACKAGE_TITLES,
  GET_PACKAGE_TITLES_SUCCESS,
  GET_PACKAGE_TITLES_FAILURE,
} from '../../actions';

describe('(epic) getPackageTitles', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  const state$ = {
    value: {
      okapi: {
        url: 'https://folio-snapshot',
        tenant: 'diku',
        token: 'token',
      },
    },
  };

  it('should handle successful data fetching', () => {
    const data = ['item1', 'item2'];
    const meta = { totalResults: 2 };

    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: GET_PACKAGE_TITLES,
        payload: 'packageId',
      },
    });

    const dependencies = {
      packageTitlesApi: {
        getCollection: () => testScheduler.createColdObservable('--a', {
          a: { data, meta },
        }),
      },
    };

    const output$ = createGetPackageTitlesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_PACKAGE_TITLES_SUCCESS,
        payload: {
          data,
          totalResults: meta.totalResults,
        },
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: GET_PACKAGE_TITLES,
        payload: 'packageId',
      },
    });

    const dependencies = {
      packageTitlesApi: {
        getCollection: () => testScheduler.createColdObservable('--#', null, { errors: ['error'] }),
      },
    };

    const output$ = createGetPackageTitlesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_PACKAGE_TITLES_FAILURE,
        payload: { errors: ['error'] },
      },
    });

    testScheduler.flush();
  });
});
