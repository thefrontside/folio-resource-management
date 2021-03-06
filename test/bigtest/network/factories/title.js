import { Factory, trait } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  name: () => faker.company.catchPhrase(),
  publisherName: () => faker.company.companyName(),
  publicationType: () => faker.random.arrayElement([
    'Audiobook',
    'Book',
    'Book Series',
    'Database',
    'Journal',
    'Newsletter',
    'Newspaper',
    'Proceedings',
    'Report',
    'Streaming Audio',
    'Streaming Video',
    'Thesis & Dissertation',
    'Website',
    'Unspecified'
  ]),
  subjects: () => [],
  contributors: () => [],
  identifiers: () => [],
  isTitleCustom: false,
  isPeerReviewed: false,
  hasSelectedResources: false,
  edition: '',
  description: '',
  tags: {
    tagList: [],
  },

  withPackages: trait({
    afterCreate(title, server) {
      server.createList('resource', 5, 'withPackage', 'withManagedCoverage', {
        title,
        isSelected: true
      });

      server.createList('resource', 5, 'withPackage', 'withManagedCoverage', {
        title,
        isSelected: false
      });
    }
  }),

  withSubjects: trait({
    afterCreate(title, server) {
      const subjects = server.createList('subject', 3);
      title.subjects = subjects.map(item => item.toJSON());
      title.save();
    }
  }),

  withContributors: trait({
    afterCreate(title, server) {
      const contributors = server.createList('contributor', 3);
      title.contributors = contributors.map(item => item.toJSON());
      title.save();
    }
  }),

  withIdentifiers: trait({
    afterCreate(title, server) {
      const identifiers = server.createList('identifier', 3);
      title.identifiers = identifiers.map(item => item.toJSON());
      title.save();
    }
  })
});
