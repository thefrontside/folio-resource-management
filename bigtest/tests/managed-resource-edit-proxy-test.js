import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { describeApplication } from '../helpers/describe-application';
import ResourceEditPage from '../interactors/resource-edit';
import ResourceShowPage from '../interactors/resource-show';

describeApplication('ManagedResourceEditProxy', () => {
  let provider,
    providerPackage,
    title,
    resource;

  beforeEach(function () {
    provider = this.server.create('provider', {
      name: 'Cool Provider'
    });

    providerPackage = this.server.create('package', 'withTitles', 'withProxy', {
      provider,
      name: 'Star Wars Custom Package',
      contentType: 'Online'
    });

    title = this.server.create('title', {
      name: 'Hans Solo Director Cut',
      publicationType: 'Streaming Video',
      publisherName: 'Amazing Publisher'
    });

    title.save();

    resource = this.server.create('resource', {
      package: providerPackage,
      isSelected: true,
      title
    });
  });

  describe('visiting the resource edit page with a proxy', () => {
    beforeEach(function () {
      let resourceProxy = this.server.create('proxy', {
        inherited: false,
        id: 'microstates'
      });
      resource.update('proxy', resourceProxy.toJSON());
      resource.save();

      return this.visit(`/eholdings/resources/${resource.id}/edit`, () => {
        expect(ResourceEditPage.$root).to.exist;
      });
    });

    it('disables the save button', () => {
      expect(ResourceEditPage.isSaveDisabled).to.be.true;
    });

    it('has a select field value defaulted with current resource proxy value', () => {
      expect(ResourceEditPage.proxySelectValue).to.equal('microstates');
    });

    describe('choosing an inherited proxy from select', () => {
      beforeEach(() => {
        return ResourceEditPage.chooseProxy('Inherited - bigTestJS');
      });

      it('should enable save action button', () => {
        expect(ResourceEditPage.isSaveDisabled).to.eq(false);
      });

      it('selected option has changed', () => {
        expect(ResourceEditPage.proxySelectValue).to.equal('bigTestJS');
      });

      describe('clicking save to update Resource Proxy', () => {
        beforeEach(() => {
          return ResourceEditPage.clickSave();
        });

        it('disables the save button', () => {
          expect(ResourceEditPage.isSaveDisabled).to.be.true;
        });

        it('goes to the resource show page', () => {
          expect(ResourceShowPage.$root).to.exist;
        });

        it('shows newly saved proxy', () => {
          expect(ResourceShowPage.proxy).to.include('bigTestJS');
        });

        it('shows a success toast message', () => {
          expect(ResourceShowPage.toast.successText).to.equal('Title was updated.');
        });
      });
    });
  });
});
