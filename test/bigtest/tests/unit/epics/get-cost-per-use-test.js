/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetCostPerUseEpic } from '../../../../../src/redux/epics';
import {
  GET_COST_PER_USE,
  GET_COST_PER_USE_SUCCESS,
  GET_COST_PER_USE_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) getCostPerUse', () => {
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
    const response = {
      body: {
        attributes: {
          analysis: {
            publisherPlatforms: {
              cost: 200,
            },
          },
        }
      },
    };

    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: GET_COST_PER_USE,
        payload: {
          listType: 'package',
          id: '123',
          filterData: {
            platformType: 'publisher',
          },
        },
      },
    });

    const dependencies = {
      costPerUseApi: {
        getCostPerUse: () => testScheduler.createColdObservable('--a', {
          a: response.body,
        }),
      },
    };

    const output$ = createGetCostPerUseEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_COST_PER_USE_SUCCESS,
        payload: {
          attributes: {
            analysis: {
              cost: 200,
            },
          },
        },
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: GET_COST_PER_USE,
        payload: {
          listType: 'package',
          id: '123',
          filterData: {
            platformType: 'publisher',
          },
        },
      },
    });

    const dependencies = {
      costPerUseApi: {
        getCostPerUse: () => testScheduler.createColdObservable('--#', null, 'Error messages'),
      },
    };

    const output$ = createGetCostPerUseEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_COST_PER_USE_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });

    testScheduler.flush();
  });
});
