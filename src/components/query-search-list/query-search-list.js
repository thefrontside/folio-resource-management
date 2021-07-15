import {
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames/bind';

import { Button } from '@folio/stripes/components';

import ScrollView from '../scroll-view';
import {
  FIRST_PAGE,
  PAGE_SIZE,
} from '../../constants';

import styles from './query-search-list.css';

const cx = classnames.bind(styles);

const QuerySearchList = ({
  collection,
  fetch,
  fullWidth,
  itemHeight,
  notFoundMessage,
  renderItem,
  scrollable,
  type,
}) => {
  const [page, setPage] = useState(FIRST_PAGE);

  useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  const {
    totalLength,
    items,
    hasFailed,
    errors,
  } = collection;
  const length = items.length;

  if (hasFailed && !length) {
    return (
      <div className={styles.error}>
        {errors[0].title}
      </div>
    );
  }

  if (!length) {
    return notFoundMessage;
  }
  /**
   * main function for paggination
   * now it's working for prev next buttons
   * in commented code functionality for load more button
   * which is already emplemented and working correctly
   */
  const getLoadMoreButton = () => {
    const isUnloadedPagesPresent = (totalLength !== length) && !(length % PAGE_SIZE);

    return (
      <>
        <Button
          disabled={page === 1} // for first page prev button should be disabled 
          onClick={() => { setPage(page - 1); }}
        >
          prev
        </Button>
        {/* place for page counter */}
        <Button
          disabled={isUnloadedPagesPresent} // for the last page it should be disabled
          onClick={() => { setPage(page + 1); }}
        >
          next
        </Button>
      </>
    );
    /*  
    if (isUnloadedPagesPresent) {
      return (
        <div className={styles['button-wrapper']}>
          <Button
            style={{ width: '75%', margin: '1rem auto' }}
            onClick={() => { setPage(page + 1); }}
          >
            <FormattedMessage id="ui-eholdings.loadMore" />
          </Button>
        </div>
      );
    }

    return null;
    */
  };

  return (
    <ScrollView
      items={items}
      length={length}
      itemHeight={itemHeight}
      scrollable={scrollable}
      queryListName={type}
      fullWidth={fullWidth}
      loadMoreButton={getLoadMoreButton()}
    >
      {item => (
        item.isRejected ? (
          <div className={cx('list-item', 'is-error')}>
            {item.error[0].title}
          </div>
        ) : (
          <div className={styles['list-item']}>
            {renderItem(item)}
          </div>
        )
      )}
    </ScrollView>
  );
};

QuerySearchList.propTypes = {
  collection: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  fullWidth: PropTypes.bool,
  itemHeight: PropTypes.number.isRequired,
  notFoundMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
  renderItem: PropTypes.func.isRequired,
  scrollable: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

QuerySearchList.defaultProps = {
  fullWidth: false,
};

export default QuerySearchList;
