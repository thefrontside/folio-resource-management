import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { describeApplication } from '../helpers/describe-application';
import PackageShowPage from '../interactors/package-show';

describeApplication('Package Show Title Search', () => {
  let provider,
    resources,
    providerPackage;

  beforeEach(function () {
    provider = this.server.create('provider', {
      name: 'Cool Provider'
    });

    providerPackage = this.server.create(
      'package',
      'withTitles',
      'withCustomCoverage',
      {
        provider,
        name: 'Cool Package',
        contentType: 'E-Book',
        isSelected: false,
        titleCount: 3,
        packageType: 'Complete'
      }
    );

    resources = this.server.schema.where('resource', {
      packageId: providerPackage.id
    }).models;

    resources[0].title.update({
      name: 'My Title 1',
      publicationType: 'report',
      subjects: [this.server.create('subject', { subject: 'FooBar' }).toJSON()],
    });

    resources[0].update({
      isSelected: true,
    });

    resources[1].title.update({
      name: 'My Title 2',
      publicationType: 'book',
      publisherName: 'The Frontside'
    });

    resources[1].update({
      isSelected: false
    });

    resources[2].title.update({
      name: 'SUPER Duper 3',
      publicationType: 'book'
    });

    resources[2].update({
      isSelected: false
    });
  });

  describe('navigating to package show page to filter titles', () => {
    beforeEach(function () {
      return this.visit(
        {
          pathname: `/eholdings/packages/${providerPackage.id}`,
          // our internal link component automatically sets the location state
          state: { eholdings: true }
        },
        () => {
          expect(PackageShowPage.$root).to.exist;
        }
      );
    });

    it('displays the proper title count', () => {
      expect(PackageShowPage.titleList().length).to.equal(3);
    });

    it('has no filters by default', () => {
      expect(PackageShowPage.searchModalBadge.filterText).to.equal('');
    });

    it('displays the number of relevant title records', () => {
      expect(PackageShowPage.searchResultsCount).to.equal('3');
    });

    describe('searching for a title', () => {
      beforeEach(() => {
        return PackageShowPage.clickListSearch()
          .searchModal.searchTitles('My Title')
          .searchModal.clickSearch();
      });

      it('properly filters the results', () => {
        expect(PackageShowPage.titleList(0).name).to.equal('My Title 1');
        expect(PackageShowPage.titleList(1).name).to.equal('My Title 2');
      });

      it('has the right amount of titles displayed', () => {
        expect(PackageShowPage.titleList().length).to.equal(2);
      });
    });

    describe('searching for a title with the selected filter', () => {
      beforeEach(() => {
        return PackageShowPage.clickListSearch()
          .searchModal.clickFilter('selected', 'true')
          .searchModal.clickSearch();
      });

      it('properly filters the results', () => {
        expect(PackageShowPage.titleList().length).to.equal(1);
      });
    });

    describe('searching for a title with the publication type filter', () => {
      beforeEach(() => {
        return PackageShowPage.clickListSearch()
          .searchModal.clickFilter('type', 'report')
          .searchModal.clickSearch();
      });

      it('properly filters to one result', () => {
        expect(PackageShowPage.titleList().length).to.equal(1);
      });

      it('has the right title name', () => {
        expect(PackageShowPage.titleList(0).name).to.equal('My Title 1');
      });
    });

    describe('searching for a title by title publisher filter', () => {
      beforeEach(() => {
        return PackageShowPage.clickListSearch()
          .searchModal.selectSearchField('Publisher')
          .searchModal.searchTitles('The Frontside')
          .searchModal.clickSearch();
      });

      it('properly filters to one result', () => {
        expect(PackageShowPage.titleList().length).to.equal(1);
      });

      it('has the right title name', () => {
        expect(PackageShowPage.titleList(0).name).to.equal('My Title 2');
      });

      describe('changing the filter to subject', () => {
        beforeEach(() => {
          return PackageShowPage.clickListSearch()
            .searchModal.selectSearchField('Subject')
            .searchModal.searchTitles('FooBar')
            .searchModal.clickSearch();
        });

        it('properly filters to one result', () => {
          expect(PackageShowPage.titleList().length).to.equal(1);
        });

        it('has the right title name', () => {
          expect(PackageShowPage.titleList(0).name).to.equal('My Title 1');
        });
      });

      describe('resetting the search', () => {
        beforeEach(() => {
          return PackageShowPage.clickListSearch()
            .searchModal.clickResetAll();
        });

        it('properly filters to one result', () => {
          expect(PackageShowPage.titleList().length).to.equal(3);
        });
      });
    });
  });

  describe.skip('navigating to package show page with over 10k titles in package related resources meta totalResults', () => {
    beforeEach(function () {
      let largeProviderPackage = this.server.create(
        'package',
        'withTitles',
        {
          provider,
          name: 'Cool Large Package',
          contentType: 'E-Book',
          isSelected: false,
          titleCount: 1,
          packageType: 'Complete'
        }
      );

      // let largeResources = this.server.schema.where('resource', {
      //  packageId: largeProviderPackage.id
      // }).models;

      this.server.get(`packages/${largeProviderPackage.id}/resources?page=1`,
        { 'data':[],
          'meta':{ 'totalResults': 10000 },
          'jsonapi':{ 'version':'1.0' } }, 200);

      return this.visit(
        {
          pathname: `/eholdings/packages/${largeProviderPackage.id}`,
          // our internal link component automatically sets the location state
          state: { eholdings: true }
        },
        () => {
          expect(PackageShowPage.$root).to.exist;
        }
      );
    });

    it('displays Over 10,000 as number of title records', () => {
      expect(PackageShowPage.searchResultsCount).to.contain('Over');
      expect(PackageShowPage.searchResultsCount).to.contain('10,000');
    });
  });
});
