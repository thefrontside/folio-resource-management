import $ from 'jquery';

export default {
  get $root() {
    return $('[data-test-eholdings-package-details]');
  },

  get name() {
    return $('[data-test-eholdings-package-details-name]').text();
  },

  get vendor() {
    return $('[data-test-eholdings-package-details-vendor]').text();
  },

  get contentType() {
    return $('[data-test-eholdings-package-details-content-type]').text();
  },

  get numTitles() {
    return $('[data-test-eholdings-package-details-titles-total').text();
  },

  get numTitlesSelected() {
    return $('[data-test-eholdings-package-details-titles-selected').text();
  },

  get isSelected() {
    return $('[data-test-eholdings-package-details-selected]').text();
  },

  get hasErrors() {
    return $('[data-test-eholdings-package-details-error]').length > 0;
  },

  get titleList() {
    return $('[data-test-eholdings-package-details-title]').toArray().map(createTitleObject);
  }
};

function createTitleObject(element) {
  let $scope = $(element);

  return {
    get name() {
      return $scope.find('[data-test-eholdings-package-details-title-name]').text();
    },

    get isSelected() {
      return $scope.find('[data-test-eholdings-package-details-title-selected]').text() === 'Selected';
    }
  };
}
