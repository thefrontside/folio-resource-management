import React from 'react';
import PropTypes from 'prop-types';
import { KeyValue } from '@folio/stripes-components';
import { FormattedNumber, FormattedMessage } from 'react-intl';

import { processErrors } from '../utilities';
import DetailsView from '../details-view';
import QueryList from '../query-list';
import PackageListItem from '../package-list-item';
import DetailsViewSection from '../details-view-section';
import Toaster from '../toaster';
import styles from './provider-show.css';

export default function ProviderShow({
  model,
  packages,
  fetchPackages,
  searchModal,
  listType
}, {
  queryParams
}) {
  let actionMenuItems = [];

  if (queryParams.searchType) {
    actionMenuItems.push({
      label: <FormattedMessage id="ui-eholdings.actionMenu.fullView" />,
      to: {
        pathname: `/eholdings/providers/${model.id}`,
        state: { eholdings: true }
      },
      className: styles['full-view-link']
    });
  }

  return (
    <div>
      <Toaster toasts={processErrors(model)} position="bottom" />

      <DetailsView
        type="provider"
        model={model}
        key={model.id}
        paneTitle={model.name}
        actionMenuItems={actionMenuItems}
        bodyContent={(
          <DetailsViewSection label={<FormattedMessage id="ui-eholdings.provider.providerInformation" />}>
            <KeyValue label={<FormattedMessage id="ui-eholdings.provider.packagesSelected" />}>
              <div data-test-eholdings-provider-details-packages-selected>
                <FormattedNumber value={model.packagesSelected} />
              </div>
            </KeyValue>

            <KeyValue label={<FormattedMessage id="ui-eholdings.provider.totalPackages" />}>
              <div data-test-eholdings-provider-details-packages-total>
                <FormattedNumber value={model.packagesTotal} />
              </div>
            </KeyValue>
          </DetailsViewSection>
        )}
        searchModal={searchModal}
        listType={listType}
        resultsLength={packages.length}
        renderList={scrollable => (
          <QueryList
            type="provider-packages"
            fetch={fetchPackages}
            collection={packages}
            length={packages.length}
            scrollable={scrollable}
            itemHeight={70}
            renderItem={item => (
              <PackageListItem
                link={item.content && `/eholdings/packages/${item.content.id}`}
                item={item.content}
                showTitleCount
                headingLevel='h4'
              />
            )}
          />
        )}
      />
    </div>
  );
}

ProviderShow.propTypes = {
  model: PropTypes.object.isRequired,
  packages: PropTypes.object.isRequired,
  fetchPackages: PropTypes.func.isRequired,
  searchModal: PropTypes.node,
  listType: PropTypes.string.isRequired
};

ProviderShow.contextTypes = {
  router: PropTypes.object,
  queryParams: PropTypes.object
};
