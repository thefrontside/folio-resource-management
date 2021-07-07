/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createPostUsageConsolidationEpic } from '../../../../../src/redux/epics';

import {
  POST_USAGE_CONSOLIDATION,
  POST_USAGE_CONSOLIDATION_SUCCESS,
  POST_USAGE_CONSOLIDATION_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) PostUsageConsolidationEpic', () => {
  const state$ = {
    value: {
      okapi: {
        url: 'https://folio-snapshot',
        tenant: 'diku',
        token: 'token',
      },
    },
  };

  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  it('should trigger an action to set usage consolidation', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: POST_USAGE_CONSOLIDATION },
    });

    const usageConsolidation = {
      type: 'ucSettings',
      attributes: {
        customerKey: 'ZZZZ',
        startMonth: 'jan',
        currency: 'USD',
        platformType: 'all',
      },
    };

    const dependencies = {
      usageConsolidationApi: {
        postUsageConsolidation: () => testScheduler.createColdObservable('--a', {
          a: usageConsolidation,
        }),
      },
    };

    const output$ = createPostUsageConsolidationEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: POST_USAGE_CONSOLIDATION_SUCCESS,
        payload: usageConsolidation,
      },
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: POST_USAGE_CONSOLIDATION },
    });

    const dependencies = {
      usageConsolidationApi: {
        postUsageConsolidation: () => testScheduler.createColdObservable('--#', 'Error messages'),
      }
    };

    const output$ = createPostUsageConsolidationEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: POST_USAGE_CONSOLIDATION_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });
  });
});
