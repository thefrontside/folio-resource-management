import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication, { axe } from '../helpers/setup-application';
import ResourceShowPage from '../interactors/resource-show';

describe('ResourceEmbargo', () => {
  setupApplication();
  let pkg,
    title,
    resource;

  let a11yResults = null;

  beforeEach(function () {
    pkg = this.server.create('package', 'withProvider');
    title = this.server.create('title');
    resource = this.server.create('resource', {
      package: pkg,
      title,
      isSelected: true
    });
  });

  describe('visiting the resource show page with custom and managed embargos', () => {
    beforeEach(async function () {
      resource.managedEmbargoPeriod = this.server.create('embargo-period', {
        embargoUnit: 'Months',
        embargoValue: 6
      }).toJSON();

      resource.customEmbargoPeriod = this.server.create('embargo-period', {
        embargoUnit: 'Weeks',
        embargoValue: 9
      }).toJSON();

      resource.save();

      this.visit(`/eholdings/resources/${resource.id}`);
    });

    describe('waiting for axe to run', () => {
      beforeEach(async () => {
        await ResourceShowPage.whenLoaded();
        a11yResults = await axe.run();
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });
    });

    it('does not display the managed embargo section', () => {
      expect(ResourceShowPage.hasManagedEmbargoPeriod).to.be.false;
    });

    it('displays the custom embargo section', () => {
      expect(ResourceShowPage.customEmbargoPeriod).to.equal('9 week(s)');
    });
  });

  describe('visiting the resource show page without any embargos', () => {
    beforeEach(function () {
      this.visit(`/eholdings/resources/${resource.id}`);
    });

    it.always('does not display the managed embargo section', () => {
      expect(ResourceShowPage.hasManagedEmbargoPeriod).to.be.false;
    });

    it.always('does not display the custom embargo period', () => {
      expect(ResourceShowPage.hasCustomEmbargoPeriod).to.be.false;
    });
  });

  describe('visiting the resource show page with embargos with null values', () => {
    beforeEach(async function () {
      resource.managedEmbargoPeriod = this.server.create('embargo-period', {
        embargoUnit: 'Months',
        embargoValue: null
      }).toJSON();

      resource.customEmbargoPeriod = this.server.create('embargo-period', {
        embargoUnit: 'Weeks',
        embargoValue: null
      }).toJSON();

      resource.save();
      this.visit(`/eholdings/resources/${resource.id}`);
    });

    describe('waiting for axe to run', () => {
      beforeEach(async () => {
        await ResourceShowPage.whenLoaded();
        a11yResults = await axe.run();
      });

      it('should not have any a11y issues', () => {
        expect(a11yResults.violations).to.be.empty;
      });
    });

    it.always('does not display the managed embargo section', () => {
      expect(ResourceShowPage.hasManagedEmbargoPeriod).to.be.false;
    });

    it.always('does not display the custom embargo section', () => {
      expect(ResourceShowPage.hasCustomEmbargoPeriod).to.be.false;
    });
  });

  describe('visiting the resource show page with no embargos', () => {
    beforeEach(function () {
      resource.managedEmbargoPeriod = null;
      resource.customEmbargoPeriod = null;

      resource.save();
      this.visit(`/eholdings/resources/${resource.id}`);
    });

    it.always('does not display the managed embargo section', () => {
      expect(ResourceShowPage.hasManagedEmbargoPeriod).to.be.false;
    });

    it.always('does not display the custom embargo section', () => {
      expect(ResourceShowPage.hasCustomEmbargoPeriod).to.be.false;
    });
  });

  describe('visiting the resource show page with title package not selected', () => {
    beforeEach(function () {
      resource.isSelected = false;
      resource.customEmbargoPeriod = this.server.create('embargo-period', {
        embargoUnit: 'Weeks',
        embargoValue: null
      }).toJSON();

      resource.save();
      this.visit(`/eholdings/resources/${resource.id}`);
    });

    it.always('does not display the custom embargo section', () => {
      expect(ResourceShowPage.hasCustomEmbargoPeriod).to.be.false;
    });

    it('displays a message that embargo period cannot be edited on an unselected resource', () => {
      expect(ResourceShowPage.isNotSelectedCoverageMessagePresent).to.be.true;
    });
  });

  describe('visiting the resource show page with title package selected', () => {
    beforeEach(function () {
      resource.customEmbargoPeriod = this.server.create('embargo-period', {
        embargoUnit: 'Weeks',
        embargoValue: 10
      }).toJSON();

      resource.save();
      this.visit(`/eholdings/resources/${resource.id}`);
    });

    it('displays the custom embargo section', () => {
      expect(ResourceShowPage.customEmbargoPeriod).to.equal('10 week(s)');
    });

    it('displays whether the title package is selected', () => {
      expect(ResourceShowPage.isResourceSelected).to.equal('Selected');
    });

    describe('removing the title package via drop down', () => {
      beforeEach(async () => {
        await ResourceShowPage
          .actionsDropDown.clickDropDownButton()
          .dropDownMenu.clickRemoveFromHoldings();
      });

      describe('waiting for axe to run', () => {
        beforeEach(async () => {
          a11yResults = await axe.run();
        });

        it('should not have any a11y issues', () => {
          expect(a11yResults.violations).to.be.empty;
        });
      });

      describe('and confirming deselection', () => {
        beforeEach(() => {
          return ResourceShowPage.deselectionModal.confirmDeselection();
        });

        it('removes custom embargo', () => {
          expect(ResourceShowPage.hasCustomEmbargoPeriod).to.be.false;
        });

        it('displays a message that embargo period cannot be edited on an unselected resource', () => {
          expect(ResourceShowPage.isNotSelectedCoverageMessagePresent).to.be.true;
        });
      });

      describe('and canceling deselection', () => {
        beforeEach(() => {
          return ResourceShowPage.deselectionModal.cancelDeselection();
        });

        it('does not remove custom embargo', () => {
          expect(ResourceShowPage.customEmbargoPeriod).to.equal('10 week(s)');
        });
      });
    });
  });
});
