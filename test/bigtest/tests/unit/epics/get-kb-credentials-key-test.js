/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetKbCredentialsKeyEpic } from '../../../../../src/redux/epics';
import {
  GET_KB_CREDENTIALS_KEY,
  GET_KB_CREDENTIALS_KEY_SUCCESS,
  GET_KB_CREDENTIALS_KEY_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) getKBCredentialsKey', () => {
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
      data: {
        attributes: {
          apiKey: 'some-key',
        },
      },
    };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_KB_CREDENTIALS_KEY }
    });

    const dependencies = {
      knowledgeBaseApi: {
        getCredentialsKey: () => testScheduler.createColdObservable('--a', {
          a: response.data
        })
      }
    };

    const output$ = createGetKbCredentialsKeyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_KB_CREDENTIALS_KEY_SUCCESS,
        payload: response.data,
      }
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_KB_CREDENTIALS_KEY }
    });

    const dependencies = {
      knowledgeBaseApi: {
        getCredentialsKey: () => testScheduler.createColdObservable('--#', null, 'Error messages')
      }
    };

    const output$ = createGetKbCredentialsKeyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_KB_CREDENTIALS_KEY_FAILURE,
        payload: 'Error messages',
      }
    });

    testScheduler.flush();
  });
});
