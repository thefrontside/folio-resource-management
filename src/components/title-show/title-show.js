import React from 'react';
import PropTypes from 'prop-types';

import Icon from '@folio/stripes-components/lib/Icon';
<<<<<<< HEAD:src/components/title-show/title-show.js
import KeyValueLabel from '../key-value-label';
import List from '../list';
import PackageListItem from '../package-list-item';
import IdentifiersList from '../identifiers-list';
import ContributorsList from '../contributors-list';
import styles from './title-show.css';
=======
import KeyValueLabel from './key-value-label';
import List from './list';
import PackageListItem from './package-list-item';
import IdentifiersList from './identifiers-list';
import ContributorsList from './contributors-list';
import { formatPublicationType } from './utilities';
>>>>>>> Moved pub type formatting back to display level (needed pub type to format coverage date correctly), additional logic for year formats (cases with missing dates):src/components/title-show.js

export default function TitleShow({ title }) {
  let record = title.content;

  return (
    <div className={styles['detail-container']} data-test-eholdings-title-show>
      {title.isResolved ? (
        <div>
          <div className={styles['detail-container-header']}>
            <KeyValueLabel label="Title">
              <h1 data-test-eholdings-title-show-title-name>
                {record.titleName}
              </h1>
            </KeyValueLabel>
          </div>

          <KeyValueLabel label="Publisher">
            <div data-test-eholdings-title-show-publisher-name>
              {record.publisherName}
            </div>
          </KeyValueLabel>

          <KeyValueLabel label="Publication Type">
            <div data-test-eholdings-title-show-publication-type>
              {formatPublicationType(record.pubType)}
            </div>
          </KeyValueLabel>

          <IdentifiersList data={record.identifiersList} />
          <ContributorsList data={record.contributorsList} />

          {record.subjectsList.length > 0 && (
            <KeyValueLabel label="Subjects">
              <div data-test-eholdings-title-show-subjects-list>
                {record.subjectsList.map(subjectObj => subjectObj.subject).join('; ')}
              </div>
            </KeyValueLabel>
          ) }

          <hr />
          <h3>Packages</h3>
          <List data-test-eholdings-title-show-package-list>
            {record.customerResourcesList.map(item => (
              <PackageListItem
                key={item.packageId}
                item={item}
                link={`/eholdings/vendors/${item.vendorId}/packages/${item.packageId}/titles/${record.titleId}`}
              />
            ))}
          </List>
        </div>
      ) : title.isRejected ? (
        <p data-test-eholdings-title-show-error>
          {title.error.length ? title.error[0].message : title.error.message}
        </p>
      ) : (
        <Icon icon="spinner-ellipsis" />
      )}
    </div>
  );
}

TitleShow.propTypes = {
  title: PropTypes.object.isRequired
};
