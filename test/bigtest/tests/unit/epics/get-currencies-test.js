/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetCurrenciesEpic } from '../../../../../src/redux/epics';

import {
  GET_CURRENCIES,
  GET_CURRENCIES_SUCCESS,
  GET_CURRENCIES_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) getCurrencies', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
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
    const response = { body: ['item1', 'item2'] };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_CURRENCIES },
    });

    const dependencies = {
      currenciesApi: {
        getAll: () => testScheduler.createColdObservable('--a', {
          a: response.body,
        }),
      },
    };

    const output$ = createGetCurrenciesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_CURRENCIES_SUCCESS,
        payload: response.body,
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_CURRENCIES },
    });

    const dependencies = {
      currenciesApi: {
        getAll: () => testScheduler.createColdObservable('--#', null, 'Error messages'),
      },
    };

    const output$ = createGetCurrenciesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_CURRENCIES_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });

    testScheduler.flush();
  });
});
