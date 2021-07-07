import { TestScheduler } from 'rxjs/testing';

import createGetUcCredentialsEpic from '../get-uc-credentials';

import {
  GET_UC_CREDENTIALS,
  GET_UC_CREDENTIALS_SUCCESS,
  GET_UC_CREDENTIALS_FAILURE,
} from '../../actions';

describe('(epic) getUcCredentials', () => {
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
    const data = {
      type: 'ucCredentials',
      attributes: {
        isPresent: true,
      },
    };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_UC_CREDENTIALS },
    });

    const dependencies = {
      ucCredentialsApi: {
        getUcCredentials: () => testScheduler.createColdObservable('--a', {
          a: data,
        }),
      },
    };

    const output$ = createGetUcCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_UC_CREDENTIALS_SUCCESS,
        payload: data.attributes.isPresent,
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_UC_CREDENTIALS },
    });

    const dependencies = {
      ucCredentialsApi: {
        getUcCredentials: () => testScheduler.createColdObservable('--#', null, { errors: ['error'] }),
      },
    };

    const output$ = createGetUcCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_UC_CREDENTIALS_FAILURE,
        payload: { errors: ['error'] },
      },
    });

    testScheduler.flush();
  });
});
