import { omit } from 'lodash';

import {
  getHeaders,
  doRequest,
  createUrl,
} from './common';

const API_URL = '/erm/sas';

const createSearchParams = (refId) => {
  return {
    filters: `items.reference=${refId}`,
    sort: 'startDate;desc',
  };
};

export default {
  getAll: (okapi, refId) => {
    const method = 'GET';
    const searchParams = createSearchParams(refId);
    const url = createUrl(okapi.url, API_URL, searchParams);

    const params = {
      method,
      headers: getHeaders(method, okapi, url),
    };

    return doRequest(url, params);
  },
  attachAgreement: (okapi, agreement) => {
    const method = 'PUT';
    const url = `${okapi.url}${API_URL}/${agreement.id}`;

    const params = {
      method,
      headers: getHeaders(method, okapi, url),
      body: JSON.stringify({
        items:[omit(agreement, ['id'])],
      }),
    };

    return doRequest(url, params);
  },
  getAgreementLines: (okapi, agreementId, refId) => {
    const method = 'GET';
    const url = `${okapi.url}/erm/entitlements?filters=owner%3D${agreementId}&filters=reference%3D${refId}`;

    const params = {
      method,
      headers: getHeaders(method, okapi, url),
    };

    return doRequest(url, params);
  },
  deleteAgreementLines: (okapi, agreement) => {
    const method = 'PUT';
    const url = `${okapi.url}${API_URL}/${agreement.id}`;

    const params = {
      method,
      headers: getHeaders(method, okapi, url),
      body: JSON.stringify(agreement),
    };

    return doRequest(url, params);
  }
};
