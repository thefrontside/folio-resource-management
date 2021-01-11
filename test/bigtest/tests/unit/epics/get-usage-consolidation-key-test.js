/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetUsageConsolidationKeyEpic } from '../../../../../src/redux/epics';
import {
  GET_USAGE_CONSOLIDATION_KEY,
  GET_USAGE_CONSOLIDATION_KEY_FAILURE,
  GET_USAGE_CONSOLIDATION_KEY_SUCCESS,
} from '../../../../../src/redux/actions';

describe('(epic) getUsageConsolidationKey', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  const state$ = {
    value: {
      url: 'https://folio-snapshot',
      tenant: 'diku',
      token: 'token',
    },
  };

  it('should handle successful data fetching', () => {
    const response = { body: { data: {} } };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_USAGE_CONSOLIDATION_KEY },
    });

    const dependencies = {
      usageConsolidationApi: {
        getUsageConsolidationKey: () => testScheduler.createColdObservable('--a', {
          a: response.body,
        }),
      },
    };

    const output$ = createGetUsageConsolidationKeyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_USAGE_CONSOLIDATION_KEY_SUCCESS,
        payload: { data: {} },
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: GET_USAGE_CONSOLIDATION_KEY,
        payload: {
          errors: 'Error messages',
        },
      },
    });

    const dependencies = {
      usageConsolidationApi: {
        getUsageConsolidationKey: () => testScheduler.createColdObservable('--#', null, 'Error messages'),
      },
    };

    const output$ = createGetUsageConsolidationKeyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_USAGE_CONSOLIDATION_KEY_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });

    testScheduler.flush();
  });
});
