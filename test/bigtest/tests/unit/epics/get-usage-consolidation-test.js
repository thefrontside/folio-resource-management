/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetUsageConsolidationEpic } from '../../../../../src/redux/epics';
import {
  GET_USAGE_CONSOLIDATION,
  GET_USAGE_CONSOLIDATION_FAILURE,
  GET_USAGE_CONSOLIDATION_SUCCESS,
} from '../../../../../src/redux/actions';

describe('(epic) getUsageConsolidation', () => {
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
    const response = { body: { data: {} } };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_USAGE_CONSOLIDATION },
    });

    const dependencies = {
      usageConsolidationApi: {
        getUsageConsolidation: () => testScheduler.createColdObservable('--a', {
          a: response.body,
        }),
      },
    };

    const output$ = createGetUsageConsolidationEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_USAGE_CONSOLIDATION_SUCCESS,
        payload: { data: {} },
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_USAGE_CONSOLIDATION },
    });

    const dependencies = {
      usageConsolidationApi: {
        getUsageConsolidation: () => testScheduler.createColdObservable('--#', null, 'Error messages'),
      },
    };

    const output$ = createGetUsageConsolidationEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_USAGE_CONSOLIDATION_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });

    testScheduler.flush();
  });
});
