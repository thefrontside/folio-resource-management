/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createPatchUsageConsolidationEpic } from '../../../../../src/redux/epics';

import {
  PATCH_USAGE_CONSOLIDATION,
  PATCH_USAGE_CONSOLIDATION_SUCCESS,
  PATCH_USAGE_CONSOLIDATION_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) PatchUsageConsolidationEpic', () => {
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

  it('should trigger an action to update usage consolidation', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: PATCH_USAGE_CONSOLIDATION },
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
        patchUsageConsolidation: () => testScheduler.createColdObservable('--a', {
          a: usageConsolidation,
        }),
      },
    };

    const output$ = createPatchUsageConsolidationEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: PATCH_USAGE_CONSOLIDATION_SUCCESS,
        payload: usageConsolidation,
      },
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: PATCH_USAGE_CONSOLIDATION },
    });

    const dependencies = {
      usageConsolidationApi: {
        patchUsageConsolidation: () => testScheduler.createColdObservable('--#', 'Error messages'),
      }
    };

    const output$ = createPatchUsageConsolidationEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: PATCH_USAGE_CONSOLIDATION_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });
  });
});
