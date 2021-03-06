import {
  action,
  clickable,
  collection,
  computed,
  isPresent,
  property,
  interactor,
  text,
  is
} from '@bigtest/interactor';

import KeyValueInteractor from '@folio/stripes-components/lib/KeyValue/tests/interactor';

import { getComputedStyle } from './helpers';

import Toast from './toast';
import AddToCustomPackageModal from './add-to-custom-package-modal';
import TitleUsageConsolidation from './title-usage-consolidation';

@interactor class TitleShowPage {
  isLoaded = isPresent('[data-test-eholdings-details-view-name="title"]');
  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  clickSearchBadge = clickable('[data-test-eholdings-search-filters="icon"]')
  paneTitle = text('[data-test-eholdings-details-view-pane-title]');
  titleName = text('[data-test-eholdings-details-view-name="title"]');
  nameHasFocus = is('[data-test-eholdings-details-view-name="title"]', ':focus');
  edition = new KeyValueInteractor('[data-test-eholdings-title-show-edition]');
  publisherName = new KeyValueInteractor('[data-test-eholdings-title-show-publisher-name]');
  publicationType = new KeyValueInteractor('[data-test-eholdings-title-show-publication-type]');
  hasPublicationType = isPresent('[data-test-eholdings-title-show-publication-type]');
  subjectsList = new KeyValueInteractor('[data-test-eholdings-title-show-subjects-list]');
  hasSubjectsList = isPresent('[data-test-eholdings-title-show-subjects-list]');
  hasBackButton = isPresent('[data-test-eholdings-details-view-back-button]');
  hasCollapseAllButton = isPresent('[data-test-eholdings-details-view-collapse-all-button]');
  collapseAllButtonText = text('[data-test-eholdings-details-view-collapse-all-button]');
  clickCollapseAllButton = clickable('[data-test-eholdings-details-view-collapse-all-button] button');
  hasErrors = isPresent('[data-test-eholdings-details-view-error="title"]');
  hasIdentifiersList = isPresent('[data-test-eholdings-identifiers-list-item]');
  packageContainerHeight = property('[data-test-eholdings-details-view-list="title"]', 'offsetHeight');
  detailsPaneScrollsHeight = property('[data-test-eholdings-detail-pane-contents]', 'scrollHeight');
  detailsPaneContentsHeight = property('[data-test-eholdings-detail-pane-contents]', 'offsetHeight');
  detailsPaneContentsOverFlowY = getComputedStyle('[data-test-eholdings-detail-pane-contents]', 'overflow-y');
  peerReviewedStatus = new KeyValueInteractor('[data-test-eholdings-peer-reviewed-field]');
  descriptionText = new KeyValueInteractor('[data-test-eholdings-description-field]');
  clickEditButton = clickable('[data-test-eholdings-title-edit-link]');
  hasEditButton = isPresent('[data-test-eholdings-title-edit-link]');

  toast = Toast

  detailsPaneScrollTop = action(function (offset) {
    return this.find('[data-test-query-list="title-packages"]')
      .do(() => {
        return this.scroll('[data-test-eholdings-detail-pane-contents]', {
          top: offset
        });
      });
  });

  packageList = collection('[data-test-query-list="title-packages"] li a', {
    name: text('[data-test-eholdings-package-list-item-name]'),
    isSelectedText: text('[data-test-selected-label]'),
    isSelected: computed(function () {
      return this.isSelectedText === 'Selected';
    }),
  });

  usageConsolidationSection = new TitleUsageConsolidation();

  identifiersList = collection('[data-test-eholdings-identifiers-list-item]', {
    identifierId: text('[data-test-eholdings-identifier-id]'),
    identifierType: text('[data-test-eholdings-identifiers-list-item] [class^="kvLabel--"]')
  });

  contributorsList = collection('[data-test-eholdings-contributors-list-item]', {
    contributorName: text('[data-test-eholdings-contributor-names]'),
    contributorType: text('[data-test-eholdings-contributors-list-item] [class^="kvLabel--"]')
  });

  clickAddToCustomPackageButton = clickable('[data-test-eholdings-add-to-custom-package-button]');
  customPackageModal = new AddToCustomPackageModal('#eholdings-custom-package-modal');
}

export default new TitleShowPage('[data-test-eholdings-details-view="title"]');
