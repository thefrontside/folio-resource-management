import { TestScheduler } from 'rxjs/testing';

import createUpdateUcCredentialsEpic from '../update-uc-credentials';

import {
  UPDATE_UC_CREDENTIALS,
  UPDATE_UC_CREDENTIALS_SUCCESS,
  UPDATE_UC_CREDENTIALS_FAILURE,
} from '../../actions';

describe('(epic) updatetUcCredentials', () => {
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
        clientId: 'id',
        clientSecret: 'key',
      },
    };

    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: UPDATE_UC_CREDENTIALS,
        payload: data,
      },
    });

    const dependencies = {
      ucCredentialsApi: {
        updateUcCredentials: () => testScheduler.createColdObservable('--a', {
          a: { data },
        }),
      },
    };

    const output$ = createUpdateUcCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: UPDATE_UC_CREDENTIALS_SUCCESS,
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: UPDATE_UC_CREDENTIALS },
    });

    const dependencies = {
      ucCredentialsApi: {
        updateUcCredentials: () => testScheduler.createColdObservable('--#', null, { errors: ['error'] }),
      },
    };

    const output$ = createUpdateUcCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: UPDATE_UC_CREDENTIALS_FAILURE,
        payload: { errors: ['error'] },
      },
    });

    testScheduler.flush();
  });
});
