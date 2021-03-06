import { Response } from 'miragejs';
import { random } from 'faker';
import { inflections } from 'inflected';
import {
  searchRouteFor,
  nestedResourceRouteFor,
  includesWords,
  getMultiSelectValueFromQueryString,
} from './helpers';

// typical mirage config export
export default function config() {
  inflections('en', function (inflect) {
    inflect.irregular('visibilityData', 'visibilityData');
  });
  const server = this;
  // okapi endpoints
  this.post('/bl-users/login', () => {
    return new Response(201, {
      'X-Okapi-Token': `myOkapiToken:${Date.now()}`
    }, {
      user: {
        id: 'test',
        username: 'testuser',
        personal: {
          lastName: 'User',
          firstName: 'Test',
          email: 'user@folio.org',
        }
      },
      permissions: {
        permissions: []
      }
    });
  });

  this.get('/groups', () => ({
    usergroups: [
      {
        group: 'faculty',
        id: '503a81cd-6c26-400f-b620-14c08943697c',
        desc: 'Faculty member'
      },
      {
        group: 'staff',
        id: '503a81cd-6c26-400f-b620-14c089436972',
        desc: 'Staff Member'
      },
    ],
    totalRecords: 2,
  }));

  this.get('/note-types');

  this.post('/note-types', ({ requestBody }) => {
    const noteTypeData = JSON.parse(requestBody);

    return server.create('note-type', noteTypeData);
  });

  this.put('/note-types/:id', ({ noteTypes }, { params, requestBody }) => {
    const noteTypeData = JSON.parse(requestBody);

    return noteTypes.find(params.id).update(noteTypeData);
  });

  this.delete('/note-types/:id', ({ noteTypes }, { params }) => {
    return noteTypes.find(params.id).destroy();
  });

  this.get('/note-links/domain/eholdings/type/:type/id/:id', ({ notes }, { params, queryParams }) => {
    if (queryParams.status === 'all') {
      return notes.all();
    }

    return notes.where((note) => {
      let matches = false;

      for (let i = 0; i < note.links.length; i++) {
        if (note.links[i].type === params.type && note.links[i].id === params.id) {
          matches = true;
          if (queryParams.status === 'assigned') {
            return true;
          }
        }
      }
      if (!matches && queryParams.status === 'unassigned') {
        return true;
      }

      return false;
    });
  });


  this.put('/note-links/type/:type/id/:id', ({ notes }, { params, requestBody }) => {
    const body = JSON.parse(requestBody);

    body.notes.forEach((note) => {
      const dbNote = notes.find(note.id);
      const links = [...dbNote.links];

      if (note.status === 'ASSIGNED') {
        links.push({
          id: params.id,
          type: params.type,
        });
      } else {
        for (let i = 0; i < links.length; i++) {
          if (links[i].type === params.type && links[i].id === params.id) {
            links.splice(i, 1);
            break;
          }
        }
      }

      dbNote.update({ links });
    });
  });

  this.get('/notes/:id', ({ notes }, { params }) => {
    return notes.find(params.id);
  });

  this.post('/notes', (_, { requestBody }) => {
    const noteData = JSON.parse(requestBody);

    return this.create('note', noteData);
  });

  this.put('/notes/:id', ({ notes, noteTypes }, { params, requestBody }) => {
    const noteData = JSON.parse(requestBody);
    const noteTypeName = noteTypes.find(noteData.typeId).attrs.name;

    return notes.find(params.id).update({
      ...noteData,
      type: noteTypeName,
    });
  });

  this.delete('/notes/:id', ({ notes, noteTypes }, { params }) => {
    const note = notes.find(params.id);
    const noteType = noteTypes.find(note.attrs.typeId);

    noteType.update({
      usage: {
        noteTotal: --noteType.attrs.usage.noteTotal,
      },
    });

    return notes.find(params.id).destroy();
  });

  this.get('_/proxy/tenants/:id/modules', [{
    id: 'mod-kb-ebsco',
    name: 'kb-ebsco',
    provides: [{
      id: 'eholdings',
      version: '0.0.0'
    }]
  }]);
  // tags endpoint
  this.get('/tags', ({
    tags: [
      {
        id: '1',
        label: 'urgent',
        description: 'Requires urgent attention',
      },
      {
        id: '2',
        label: 'not urgent',
        description: 'Requires not urgent attention',
      },
    ]
  }));

  // Agreements endpoints
  this.get('/erm/sas', [
    {
      id: '2c918098689ba8f70168a349f1160027',
      contacts: [],
      tags: [],
      startDate: '2019-01-01T00:01:00Z',
      items: [],
      historyLines: [],
      name: 'Test',
      orgs: [],
      agreementStatus: {
        id: '2c918098689ba8f701689baa48e40011',
        value: 'active',
        label: 'Active',
      },
      description: 'Test description',
    },
    {
      id: '2c918098689ba8f70168a36a44220028',
      contacts: [],
      tags: [],
      startDate: '2019-01-01T00:01:00Z',
      items: [],
      historyLines: [],
      name: 'test 1',
      orgs: [
        {
          id: '2c918098689ba8f70168a36dc97a002b',
          org: {
            id: '2c918098689ba8f70168a36da25a0029',
            name: 'EBSCO'
          },
          role: {
            id: '2c918098689ba8f701689baa492d001f',
            value: 'subscriber',
            label: 'Subscriber',
          },
          owner: {
            id: '2c918098689ba8f70168a36a44220028'
          }
        },
        {
          id: '2c918098689ba8f70168a36dc97a002a',
          owner: {
            id: '2c918098689ba8f70168a36a44220028'
          }
        }
      ],
      agreementStatus: {
        id: '2c918098689ba8f701689baa48e40011',
        value: 'active',
        label: 'Active',
      }
    },
    {
      id: '2c918098689ba8f70168a45f3142002c',
      contacts: [],
      tags: [],
      startDate: '2019-01-01T00:01:00Z',
      items: [],
      historyLines: [],
      name: 'test',
      orgs: [],
      agreementStatus: {
        id: '2c918098689ba8f701689baa48e40011',
        value: 'active',
        label: 'Active',
      },
    },
  ]);

  this.put('/erm/sas/:id', (data, request) => {
    return {
      'id': request.id,
      'contacts': [],
      'tags': [],
      'startDate': '2019-01-01T00:01:00Z',
      'items': [],
      'historyLines': [],
      'name': 'Kingston Package',
      'orgs': [
        {
          'id': '2c918098689ba8f70168cd490ca60032',
          'org': {
            'id': '2c918098689ba8f70168cd48eed70031',
            'name': 'Kingston'
          },
          'role': {
            'id': '2c918098689ba8f701689baa49360021',
            'value': 'subscription_agent',
            'label': 'Subscription Agent'
          },
          'owner': {
            'id': '2c918098689ba8f70168a46055f9002d'
          }
        }
      ],
      'agreementStatus': {
        'id': '2c918098689ba8f701689baa48e40011',
        'value': 'active',
        'label': 'Active',
      },
    };
  });

  this.get('/erm/entitlements', (schema, request) => {
    const [, owner, reference] = request.url.split('filters=');
    const ownerId = owner.split('%3D')[1].slice(0, -1);
    const referenceId = reference.split('%3D')[1];

    return [{
      id: '33fce77f-5e00-415e-a297-04b77319b84b',
      tags:[],
      owner: {
        id: ownerId,
        contacts: [],
        tags: [],
        startDate: '2019-01-01T00:01:00Z',
        items: [],
        historyLines: [],
        name: 'Test',
        orgs: [],
        agreementStatus: {
          id: '2c918098689ba8f701689baa48e40011',
          value: 'active',
          label: 'Active',
        },
      },
      resource: {
        id: referenceId,
        suppressFromDiscovery: false,
        tags: [],
      },
      poLines: [],
      suppressFromDiscovery: false,
      customCoverage: false,
      startDate: null,
      endDate: null,
      activeFrom: null,
      activeTo: null,
      contentUpdated: null,
      haveAccess: true,
    }];
  });

  // e-holdings endpoints
  this.namespace = 'eholdings';

  // status
  this.get('/status', {
    data: {
      id: 'status',
      type: 'statuses',
      attributes: {
        isConfigurationValid: true
      }
    }
  });

  // configuration
  this.get('/configuration', {
    data: {
      id: 'configuration',
      type: 'configurations',
      attributes: {
        rmapiBaseUrl: 'https://sandbox.ebsco.io',
        customerId: 'some-valid-customer-id',
        apiKey: 'some-valid-api-key'
      }
    }
  });

  this.put('/configuration', (_, request) => {
    return JSON.parse(request.requestBody);
  });

  // Provider resources
  this.get('/providers', searchRouteFor('providers', (provider, req) => {
    const queryString = req.url.split('?')[1];
    const tags = getMultiSelectValueFromQueryString(queryString, 'tags');

    if (req.queryParams.q && provider.name) {
      return includesWords(provider.name, req.queryParams.q.toLowerCase());
    } else if (tags.length) {
      // tags is comma separated list -- check if provider has at least one of the tags
      return tags.some(item => provider.tags.tagList.includes(item));
    } else {
      return !!provider.name;
    }
  }));

  this.get('/providers/:id', ({ providers }, request) => {
    const provider = providers.find(request.params.id);

    if (provider && provider.packages.length > 25) {
      provider.packages = provider.packages.slice(0, 25);
    }

    return provider;
  });

  this.put('/providers/:id', ({ providers }, request) => {
    const matchingProvider = providers.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    const {
      proxy,
      providerToken,
    } = body.data.attributes;
    matchingProvider.update('proxy', proxy);
    matchingProvider.update('providerToken', providerToken);

    return matchingProvider;
  });

  this.put('/providers/:id/tags', ({ providers }, request) => {
    const matchingProvider = providers.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    const {
      tags
    } = body.data.attributes;
    matchingProvider.update('tags', tags);
    return matchingProvider;
  });

  // Package resources
  const packagesFilter = (pkg, req) => {
    const queryString = req.url.split('?')[1];
    const params = req.queryParams;
    const type = params['filter[type]'];
    const selected = params['filter[selected]'];
    const custom = params['filter[custom]'];
    const tags = getMultiSelectValueFromQueryString(queryString, 'tags');
    const accessTypes = getMultiSelectValueFromQueryString(queryString, 'access-type');

    let filtered = true;

    if (filtered && tags.length) {
      return tags.some(item => pkg.tags.tagList.includes(item));
    }

    if (accessTypes.length) {
      const serverAccessTypes = JSON.parse(JSON.stringify(this.schema.accessTypes.all().models));

      return accessTypes.some(filterAccessType => {
        return serverAccessTypes.some(serverAccessType => {
          return serverAccessType.name === filterAccessType && serverAccessType.packageIds.includes(pkg.id);
        });
      });
    }

    if (params.q && pkg.name) {
      filtered = includesWords(pkg.name, params.q.toLowerCase());
    }

    if (filtered && type && type !== 'all') {
      filtered = pkg.contentType.toLowerCase() === type;
    }

    if (filtered && selected) {
      filtered = pkg.isSelected.toString() === selected;
    }

    if (filtered && custom) {
      // packages don't always have `isCustom` defined
      filtered = pkg.isCustom ? custom === 'true' : custom === 'false';
    }

    return filtered;
  };

  this.get('/packages', searchRouteFor('packages', packagesFilter));
  this.get('/providers/:id/packages', nestedResourceRouteFor('provider', 'packages', packagesFilter));

  this.get('/packages/:id', ({ packages }, request) => {
    const pkg = packages.find(request.params.id);

    if (pkg && pkg.resources.length > 25) {
      pkg.resources = pkg.resources.slice(0, 25);
    }

    return pkg;
  });

  this.put('/packages/:id', ({ packages, resources }, request) => {
    const matchingPackage = packages.find(request.params.id);
    const matchingResources = resources.where({
      packageId: request.params.id
    });

    const body = JSON.parse(request.requestBody);
    const {
      isSelected,
      allowKbToAddTitles,
      customCoverage,
      visibilityData,
      name,
      contentType,
      proxy,
      packageToken,
      accessTypeId,
    } = body.data.attributes;

    const selectedCount = isSelected ? matchingResources.length : 0;

    matchingResources.update('isSelected', isSelected);
    matchingResources.update('visibilityData', visibilityData);
    matchingPackage.update('isSelected', isSelected);
    matchingPackage.update('customCoverage', customCoverage);
    matchingPackage.update('selectedCount', selectedCount);
    matchingPackage.update('visibilityData', visibilityData);
    matchingPackage.update('allowKbToAddTitles', allowKbToAddTitles);
    matchingPackage.update('name', name);
    matchingPackage.update('contentType', contentType);
    matchingPackage.update('proxy', proxy);
    matchingPackage.update('packageToken', packageToken);
    matchingPackage.update('accessTypeId', accessTypeId);

    return matchingPackage;
  });

  this.put('/packages/:id/tags', ({ packages }, request) => {
    const matchingPackage = packages.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    const {
      tags
    } = body.data.attributes;

    matchingPackage.update('tags', tags);

    return matchingPackage;
  });

  this.post('/packages', ({ packages }, request) => {
    const body = JSON.parse(request.requestBody);
    const pkg = packages.create(body.data.attributes);

    const { customCoverages } = body.data.attributes;

    pkg.update('customCoverages', customCoverages);
    pkg.update('isSelected', true);
    pkg.update('isCustom', true);

    return pkg;
  });

  this.delete('/packages/:id', ({ packages, resources }, request) => {
    const matchingPackage = packages.find(request.params.id);
    const matchingResources = resources.where({
      packageId: request.params.id
    });

    matchingPackage.destroy();
    matchingResources.destroy();

    return {};
  });

  // Title resources
  this.get('/titles', searchRouteFor('titles', (title, req) => {
    const queryString = req.url.split('?')[1];
    const params = req.queryParams;
    const type = params['filter[type]'];
    const selected = params['filter[selected]'];
    const name = params['filter[name]'];
    const isxn = params['filter[isxn]'];
    const subject = params['filter[subject]'];
    const publisher = params['filter[publisher]'];
    const tags = getMultiSelectValueFromQueryString(queryString, 'tags');
    const accessTypes = getMultiSelectValueFromQueryString(queryString, 'access-type');
    let filtered = true;

    if (tags.length) {
      return tags.some(item => {
        return title.resources.models.some((resource => resource.tags.tagList.includes(item)));
      });
    }

    if (accessTypes.length) {
      return accessTypes.some(accessType => {
        return title.resources.models.some((resource) => resource.accessType?.attrs?.name === accessType);
      });
    }

    if (name) {
      filtered = title.name && includesWords(title.name, name);
    } else if (isxn) {
      filtered = title.identifiers && title.identifiers.some(i => includesWords(i.id, isxn));
    } else if (subject) {
      filtered = title.subjects && title.subjects.some(s => includesWords(s.subject, subject));
    } else if (publisher) {
      filtered = title.publisherName && includesWords(title.publisherName, publisher);
    }

    if (filtered && type && type !== 'all') {
      filtered = title.publicationType.toLowerCase() === type;
    }

    if (filtered && selected) {
      filtered = title.resources.models.some((resource) => {
        return resource.isSelected.toString() === selected;
      });
    }

    return filtered;
  }));

  this.get('/titles/:id', ({ titles }, request) => {
    return titles.find(request.params.id);
  });

  this.post('/titles', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    const title = schema.titles.create(body.data.attributes);

    title.update('isSelected', true);
    title.update('isTitleCustom', true);

    for (const include of body.included) {
      if (include.type === 'resource') {
        const pkg = schema.packages.find(include.attributes.packageId);
        schema.resources.create({ package: pkg, title });
      }
    }

    return title;
  });

  this.put('/titles/:id', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return {
      data: {
        ...body.data,
        attributes: {
          ...body.data.attributes,
        }
      },
    };
  });

  // Resources
  this.get('/packages/:id/resources', nestedResourceRouteFor('package', 'resources', (resource, req) => {
    const queryString = req.url.split('?')[1];
    const title = resource.title;
    const params = req.queryParams;
    const type = params['filter[type]'];
    const selected = params['filter[selected]'];
    const name = params['filter[name]'];
    const isxn = params['filter[isxn]'];
    const subject = params['filter[subject]'];
    const publisher = params['filter[publisher]'];
    const tags = getMultiSelectValueFromQueryString(queryString, 'tags');
    const accessTypes = getMultiSelectValueFromQueryString(queryString, 'access-type');
    let filtered = true;

    if (tags.length) {
      return tags.some(item => title.tags.tagList.includes(item));
    }

    if (accessTypes.length) {
      return accessTypes.some(item => resource.accessType?.attrs?.name === item);
    }

    if (name) {
      filtered = title.name && includesWords(title.name, name);
    } else if (isxn) {
      filtered = title.identifiers && title.identifiers.some(i => includesWords(i.id, isxn));
    } else if (subject) {
      filtered = title.subjects && title.subjects.some(s => includesWords(s.subject, subject));
    } else if (publisher) {
      filtered = title.publisherName && includesWords(title.publisherName, publisher);
    }

    if (filtered && type && type !== 'all') {
      filtered = title.publicationType.toLowerCase() === type;
    }

    if (filtered && selected) {
      filtered = title.resources.models.some((filteredResource) => {
        return filteredResource.isSelected.toString() === selected;
      });
    }

    if (params.q && title.name) {
      filtered = includesWords(title.name, params.q.toLowerCase());
    }

    return filtered;
  }));

  this.get('/resources/:id', ({ resources }, request) => {
    const resource = resources.find(request.params.id);

    return resource;
  });

  this.put('/resources/:id', ({ resources }, request) => {
    const matchingResource = resources.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    const {
      isSelected,
      visibilityData,
      contributors,
      customCoverages,
      customEmbargoPeriod,
      coverageStatement,
      publicationType,
      publisherName,
      name,
      url,
      description,
      isPeerReviewed,
      edition,
      identifiers,
      proxy,
      accessTypeId,
      userDefinedField1,
    } = body.data.attributes;

    matchingResource.update('isSelected', isSelected);
    matchingResource.update('visibilityData', visibilityData);
    matchingResource.update('customCoverages', customCoverages);
    matchingResource.update('customEmbargoPeriod', customEmbargoPeriod);
    matchingResource.update('coverageStatement', coverageStatement);
    matchingResource.title.update('contributors', contributors);
    matchingResource.title.update('isPeerReviewed', isPeerReviewed);
    matchingResource.title.update('edition', edition);
    matchingResource.title.update('description', description);
    matchingResource.title.update('name', name);
    matchingResource.update('url', url);
    matchingResource.update('accessTypeId', accessTypeId);
    matchingResource.title.update('publicationType', publicationType);
    matchingResource.title.update('publisherName', publisherName);
    matchingResource.title.update('edition', edition);
    matchingResource.title.update('identifiers', identifiers);
    matchingResource.update('proxy', proxy);
    matchingResource.update('userDefinedField1', userDefinedField1);

    return matchingResource;
  });
  this.put('/resources/:id/tags', ({ resources }, request) => {
    const matchingResource = resources.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    const {
      tags
    } = body.data.attributes;

    matchingResource.update('tags', tags);

    return matchingResource;
  });
  this.post('/resources', ({ resources, packages }, request) => {
    const body = JSON.parse(request.requestBody);
    const { packageId, titleId, url } = body.data.attributes;
    const { providerId } = packages.find(packageId);

    const resource = resources.create({
      isSelected: true,
      providerId,
      packageId,
      titleId,
      url
    });

    return resource;
  });

  this.delete('/resources/:id', ({ resources }, request) => {
    const matchingResource = resources.find(request.params.id);

    matchingResource.destroy();

    return {};
  });

  this.get('/custom-labels', {
    data: [{
      type: 'customLabel',
      attributes: {
        id: 1,
        displayLabel: 'test label',
        displayOnFullTextFinder: true,
        displayOnPublicationFinder: false,
      },
    }, {
      type: 'customLabel',
      attributes: {
        id: 2,
        displayLabel: 'some label',
        displayOnFullTextFinder: false,
        displayOnPublicationFinder: false,
      },
    }, {
      type: 'customLabel',
      attributes: {
        id: 3,
        displayLabel: 'different label',
        displayOnFullTextFinder: false,
        displayOnPublicationFinder: true,
      },
    }, {
      type: 'customLabel',
      attributes: {
        id: 4,
        displayLabel: 'another one',
        displayOnFullTextFinder: true,
        displayOnPublicationFinder: true,
      },
    }],
  });

  this.put('/custom-labels', (schema, request) => request.requestBody);

  this.get('/kb-credentials/:id/custom-labels', {
    data: [{
      type: 'customLabel',
      attributes: {
        id: 1,
        displayLabel: 'test label',
        displayOnFullTextFinder: true,
        displayOnPublicationFinder: false,
      },
    }, {
      type: 'customLabel',
      attributes: {
        id: 2,
        displayLabel: 'some label',
        displayOnFullTextFinder: false,
        displayOnPublicationFinder: false,
      },
    }, {
      type: 'customLabel',
      attributes: {
        id: 3,
        displayLabel: 'different label',
        displayOnFullTextFinder: false,
        displayOnPublicationFinder: true,
      },
    }, {
      type: 'customLabel',
      attributes: {
        id: 4,
        displayLabel: 'another one',
        displayOnFullTextFinder: true,
        displayOnPublicationFinder: true,
      },
    }],
  });

  this.put('/kb-credentials/:id/custom-labels', (schema, request) => request.requestBody);

  this.get('/access-types', ({ accessTypes }) => {
    return accessTypes.all();
  });

  this.post('/access-types', ({ accessTypes }, request) => {
    const body = JSON.parse(request.requestBody);
    const { type, attributes, id } = accessTypes.create(body);

    return { type, attributes, id };
  });

  this.put('/access-types/:id', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return body;
  });

  this.delete('/access-types/:id', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return body;
  });

  this.get('/kb-credentials', () => ({
    data: [
      {
        'id': '1',
        'type': 'credentials',
        'attributes': {
          'name': 'Beta',
          'apiKey': '',
          'url': '',
          'customerId': ''
        },
        'meta': {
          'createdDate': '2020-03-17T15:22:04.098',
          'updatedDate': '2020-03-17T15:23:04.098+0000',
          'createdByUserId': '1f8f660e-7dc9-4f6f-828f-96284c68a250',
          'updatedByUserId': '6893f51f-b40c-479d-bd78-1704ab5b802b',
          'createdByUsername': 'john_doe',
          'updatedByUsername': 'jane_doe'
        }
      },
      {
        'id': '2',
        'type': 'credentials',
        'attributes': {
          'name': 'Alpha',
          'apiKey': 'XXXX',
          'url': 'YYYY',
          'customerId': 'ZZZZ'
        },
        'meta': {
          'createdDate': '2020-03-17T15:22:04.098',
          'updatedDate': '2020-03-17T15:23:04.098+0000',
          'createdByUserId': '1f8f660e-7dc9-4f6f-828f-96284c68a250',
          'updatedByUserId': '6893f51f-b40c-479d-bd78-1704ab5b802b',
          'createdByUsername': 'john_doe',
          'updatedByUsername': 'jane_doe'
        }
      },
      {
        'id': '3',
        'type': 'credentials',
        'attributes': {
          'name': 'Gamma',
          'apiKey': 'XXXX',
          'url': 'YYYY',
          'customerId': 'ZZZZ'
        },
        'meta': {
          'createdDate': '2020-03-17T15:22:04.098',
          'updatedDate': '2020-03-17T15:23:04.098+0000',
          'createdByUserId': '1f8f660e-7dc9-4f6f-828f-96284c68a250',
          'updatedByUserId': '6893f51f-b40c-479d-bd78-1704ab5b802b',
          'createdByUsername': 'john_doe',
          'updatedByUsername': 'jane_doe'
        }
      },
    ]
  }));

  this.post('/kb-credentials', ({ kbCredentials }, request) => {
    const body = JSON.parse(request.requestBody);
    const { attributes } = kbCredentials.create(body.data);

    return {
      attributes,
      id: random.uuid(),
      meta: {
        'createdDate': '2020-03-17T15:22:04.098',
        'updatedDate': '2020-03-17T15:23:04.098+0000',
        'createdByUserId': '1f8f660e-7dc9-4f6f-828f-96284c68a250',
        'updatedByUserId': '6893f51f-b40c-479d-bd78-1704ab5b802b',
        'createdByUsername': 'john_doe',
        'updatedByUsername': 'jane_doe'
      },
    };
  });

  this.get('/kb-credentials/:id/key', {
    id : '2',
    type : 'kbCredentialsKey',
    attributes : {
      apiKey : 'test-api-key'
    },
  });

  this.patch('/kb-credentials/:id', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return {
      data: {
        ...body.data,
        meta: {
          'createdDate': '2020-03-17T15:22:04.098',
          'updatedDate': '2020-03-17T15:23:04.098+0000',
          'createdByUserId': '1f8f660e-7dc9-4f6f-828f-96284c68a250',
          'updatedByUserId': '6893f51f-b40c-479d-bd78-1704ab5b802b',
          'createdByUsername': 'john_doe',
          'updatedByUsername': 'jane_doe'
        },
      },
    };
  });

  this.delete('/kb-credentials/:id', () => new Response(204));

  // Current root proxy
  this.get('/root-proxy', {
    data: {
      id: 'root-proxy',
      type: 'rootProxies',
      attributes: {
        id: 'root-proxy',
        proxyTypeId: 'bigTestJS'
      },
    },
  });

  // update root proxy
  this.put('/root-proxy', () => new Response(204));

  // Current root proxy
  this.get('/kb-credentials/:id/root-proxy', {
    data: {
      id: 'root-proxy',
      type: 'rootProxies',
      attributes: {
        id: 'root-proxy',
        proxyTypeId: 'bigTestJS'
      },
    },
  });

  // update root proxy
  this.put('/kb-credentials/:id/root-proxy', () => new Response(204));

  this.get('/proxy-types', {
    data: [
      {
        id: '<n>',
        type: 'proxyTypes',
        attributes: {
          id: '<n>',
          name: 'None',
          urlMask: '',
        }
      },
      {
        id: 'bigTestJS',
        type: 'proxyTypes',
        attributes: {
          id: 'bigTestJS',
          name: 'bigTestJS',
          urlMask: 'https://github.com/bigtestjs',
        }
      },
      {
        id: 'microstates',
        type: 'proxyTypes',
        attributes: {
          id: 'microstates',
          name: 'microstates',
          urlMask: 'https://github.com/microstates',
        }
      },
      {
        id: 'EZproxy',
        type: 'proxyTypes',
        attributes: {
          id: 'EZproxy',
          name: 'EZproxy',
          urlMask: 'https://github.com/ezproxy',
        }
      },
    ]
  });

  // Available root proxies
  this.get('/kb-credentials/:id/proxy-types', {
    data: [
      {
        id: '<n>',
        type: 'proxyTypes',
        attributes: {
          id: '<n>',
          name: 'None',
          urlMask: '',
        }
      },
      {
        id: 'bigTestJS',
        type: 'proxyTypes',
        attributes: {
          id: 'bigTestJS',
          name: 'bigTestJS',
          urlMask: 'https://github.com/bigtestjs',
        }
      },
      {
        id: 'microstates',
        type: 'proxyTypes',
        attributes: {
          id: 'microstates',
          name: 'microstates',
          urlMask: 'https://github.com/microstates',
        }
      },
      {
        id: 'EZproxy',
        type: 'proxyTypes',
        attributes: {
          id: 'EZproxy',
          name: 'EZproxy',
          urlMask: 'https://github.com/ezproxy',
        }
      },
    ]
  });

  this.get('/kb-credentials/:credId/users', () => ({
    data: [
      {
        id: '1f8f660e-7dc9-4f6f-828f-96284c68a25',
        type: 'assignedUsers',
        attributes: {
          credentialsId: '2ffa1940-2cf6-48b1-8cc9-5e539c61d93f',
          firstName: 'John',
          middleName: 'William',
          lastName: 'Doe',
          patronGroup: 'Staff',
          userName: 'john_doe'
        }
      },
      {
        id: '6893f51f-b40c-479d-bd78-1704ab5b802b',
        type: 'assignedUsers',
        attributes: {
          credentialsId: '2ffa1940-2cf6-48b1-8cc9-5e539c61d93f',
          firstName: 'Jane',
          middleName: 'Rosemary',
          lastName: 'Doe',
          patronGroup: 'Staff',
          userName: 'jane_doe'
        }
      }
    ],
    meta: {
      totalResults: 2
    },
    jsonapi: {
      version: '1.0'
    }
  }));

  this.post('/kb-credentials/:credId/users', (_schema, request) => JSON.parse(request.requestBody).data);
  this.delete('/kb-credentials/:credId/users/:userId', () => new Response(204));

  this.get('/kb-credentials/:credId/access-types', ({ accessTypes }) => {
    return accessTypes.all();
  });

  this.post('/kb-credentials/:credId/access-types', ({ accessTypes }, request) => {
    const body = JSON.parse(request.requestBody);
    const { type, attributes, id } = accessTypes.create(body.data);

    return { type, attributes, id };
  });

  this.put('/kb-credentials/:credId/access-types/:id', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return body;
  });

  this.delete('/kb-credentials/:credId/access-types/:id', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return body;
  });

  this.get('/kb-credentials/:credId/uc', () => ({
    id: '2ffa1940-2cf6-48b1-8cc9-5e539c61d93f',
    type: 'ucSettings',
    attributes: {
      credentialsId: '80898dee-449f-44dd-9c8e-37d5eb469b1d',
      customerKey: '****************************************',
      startMonth: 'mar',
      currency: 'USD',
      platformType: 'publisher',
    },
    metadata: {
      createdDate: '2020-03-17T15:22:04.098',
      updatedDate: '2020-03-17T15:23:04.098+0000',
      createdByUserId: '1f8f660e-7dc9-4f6f-828f-96284c68a250',
      updatedByUserId: '6893f51f-b40c-479d-bd78-1704ab5b802b',
      createdByUsername: 'john_doe',
      updatedByUsername: 'jane_doe',
    }
  }));

  this.get('/kb-credentials/:credId/uc/key', () => ({
    'id': '2ffa1940-2cf6-48b1-8cc9-5e539c61d93f',
    'type': 'ucSettingsKey',
    'attributes': {
      'credentialsId': '80898dee-449f-44dd-9c8e-37d5eb469b1d',
      'customerKey': '1234-5678-90'
    },
  }));

  this.get('/uc', () => ({
    id: '2ffa1940-2cf6-48b1-8cc9-5e539c61d93f',
    type: 'ucSettings',
    attributes: {
      credentialsId: '80898dee-449f-44dd-9c8e-37d5eb469b1d',
      customerKey: '****************************************',
      startMonth: 'mar',
      currency: 'USD',
      platformType: 'publisher',
      metricType: 'Total Item Requests',
    },
    metadata: {
      createdDate: '2020-03-17T15:22:04.098',
      updatedDate: '2020-03-17T15:23:04.098+0000',
      createdByUserId: '1f8f660e-7dc9-4f6f-828f-96284c68a250',
      updatedByUserId: '6893f51f-b40c-479d-bd78-1704ab5b802b',
      createdByUsername: 'john_doe',
      updatedByUsername: 'jane_doe',
    }
  }));

  this.get('/currencies', () => ({
    data: [{
      id: 'AFN',
      type: 'currencies',
      attributes: {
        code: 'AFN',
        description: 'Afghan Afghani',
      },
    }, {
      id: 'ALL',
      type: 'currencies',
      attributes: {
        code: 'ALL',
        description: 'Albanian Lek',
      },
    }, {
      id: 'USD',
      type: 'currencies',
      attributes: {
        code: 'USD',
        description: 'United State Dollar',
      },
    }],
  }));

  this.post('/kb-credentials/:credId/uc', (_schema, request) => JSON.parse(request.requestBody));
  this.patch('/kb-credentials/:credId/uc', (_schema, request) => JSON.parse(request.requestBody));

  this.get('/packages/:packageId/costperuse', () => ({
    'packageId': '58-473',
    'type': 'packageCostPerUse',
    'attributes': {
      'analysis': {
        'publisherPlatforms': {
          'cost': 1201,
          'usage': 35913,
          'costPerUse': 0.0334,
        }
      },
      'parameters': {
        'startMonth': 'jan',
        'currency': 'USD',
      },
    },
  }));

  this.get('/packages/:id/resources/costperuse', () => ({
    'data': [{
      'resourceId': '58-473-356',
      'type': 'resourceCostPerUseItem',
      'attributes': {
        'name': 'Abacus',
        'publicationType': 'Journal',
        'percent': 0.08677172462134165,
        'cost': 1.042165,
        'usage': 127,
        'costPerUse': 0.008206023622047243
      }
    }, {
      'resourceId': '58-473-491',
      'type': 'resourceCostPerUseItem',
      'attributes': {
        'name': 'About Campus',
        'publicationType': 'Journal',
        'percent': 15.4,
        'usage': 23,
        'costPerUse': 0.008206023622047243
      }
    }, {
      'resourceId': '58-473-1230757',
      'type': 'resourceCostPerUseItem',
      'attributes': {
        'name': 'AAHE-ERIC/Higher Education Research Report',
        'publicationType': 'Journal',
        'percent': 15.6,
        'usage': 0,
        'costPerUse': 0.008206023622047243
      }
    }, {
      'resourceId': '58-473-1230759',
      'type': 'resourceCostPerUseItem',
      'attributes': {
        'name': 'AAHE-ERIC/Higher Education Research Report 2',
        'publicationType': 'Journal',
        'percent': 0,
        'usage': 200,
        'costPerUse': 0.008206023622047243
      }
    }],
    'parameters': {
      'startMonth': 'jan',
      'currency': 'USD'
    },
    'meta': {
      'totalResults': 3
    },
    'jsonapi': {
      'version': '1.0'
    }
  }));

  this.get('/titles/:titleId/costperuse', () => ({
    'titleId': '185972',
    'type': 'titleCostPerUse',
    'attributes': {
      'usage': {
        'platforms': [{
          'name': 'Wiley Online Library',
          'isPublisherPlatform': true,
          'counts': [2, 6, 0, 3, 6, 2, 1, 2, null, null, null, null],
          'total': 22
        }],
        'totals': {
          'publisher': {
            'counts': [2, 6, 0, 3, 6, 2, 1, 2, null, null, null, null],
            'total': 22
          }
        }
      },
      'analysis': {
        'holdingsSummary': [{
          'packageId': '58-2121943',
          'resourceId': '58-2121943-185972',
          'packageName': 'Wiley Database Model (BIBSAM)',
          'coverages': [{
            'beginCoverage': '1998-01-01',
            'endCoverage': '2000-01-01'
          }, {
            'beginCoverage': '2001-01-01',
            'endCoverage': '2003-01-01',
          }],
          'embargoPeriod': {
            'embargoValue': 10,
            'embargoUnit': 'Days',
          },
          'cost': 1030.145,
          'usage': 22,
          'costPerUse': 50.123
        }, {
          'packageId': '58-3172012',
          'resourceId': '58-3172012-185972',
          'packageName': 'Wiley Online Library Database Model 2019',
          'coverages': [{
            'beginCoverage': '1997-01-01',
            'endCoverage': ''
          }],
          'embargoPeriod': {
            'embargoValue': 0
          },
          'cost': 0.0,
          'usage': 22,
          'costPerUse': 0.0
        }, {
          'packageId': '58-3517631',
          'resourceId': '58-3517631-185972',
          'packageName': 'Wiley Online Library Full Collection 2020',
          'coverages': [{
            'beginCoverage': '1997-01-01',
            'endCoverage': ''
          }],
          'embargoPeriod': {
            'embargoValue': 0
          },
          'cost': 0.0,
          'usage': 22,
          'costPerUse': 0.0
        }, {
          'packageId': '22-3123003',
          'resourceId': '22-3123003-185972',
          'packageName': 'Agricultural & Environmental Science Database (DRAA)',
          'coverageStatement': '',
          'coverages': [],
          'embargoPeriod': {
            'embargoValue': 0
          },
          'cost': 0.0,
          'usage': 22,
          'costPerUse': 0.0
        }],
      },
      'parameters': {
        'startMonth': 'jan',
        'currency': 'USD',
      },
    }
  }));

  this.get('/resources/:resourceId/costperuse', () => ({
    type: 'resourceCostPerUse',
    attributes: {
      usage: {
        platforms: [
          {
            name: 'Wiley Online Library',
            isPublisherPlatform: true,
            counts: [0, 1, 3, 1, 3, 1, 16, 1, null, null, null, null],
            total: 26,
          },
          {
            name: 'EBSCOhost',
            isPublisherPlatform: false,
            counts: [2, null, 1, null, null, null, 3, 4, null, null, null, null],
            total: 10,
          },
        ],
        totals: {
          publisher: {
            counts: [0, 1, 3, 1, 3, 1, 16, 1, null, null, null, null],
            total: 26,
          },
          nonPublisher: {
            counts: [2, null, 1, null, null, null, 3, 4, null, null, null, null],
            total: 10,
          },
          all: {
            counts: [2, 1, 4, 1, 3, 1, 19, 5, null, null, null, null],
            total: 36,
          },
        },
      },
      analysis: {
        publisherPlatforms: {
          cost: 100.0,
          usage: 26,
          costPerUse: 3.8461538461538463
        },
        nonPublisherPlatforms: {
          cost: 100.0,
          usage: 10,
          costPerUse: 10.0
        },
        allPlatforms: {
          cost: 100.0,
          usage: 36,
          costPerUse: 2.7777777777777777,
        },
      },
      parameters: {
        startMonth: 'jan',
        currency: 'USD',
      },
    },
  }));

  this.get('/packages/:packageId/resources/costperuse/export', () => `
    Title, Type, Cost, Usage, Cost per use, % of usage
    Writings of Professor B. B. Edwards,Book,500.00,2225,0.22,16
    The Seasons and the Symphony,Streaming Video,800.00,4544, 0.18,20
  `);
}
