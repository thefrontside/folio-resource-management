import { screen, render, fireEvent } from '@testing-library/react';

import { Router } from 'react-router';
import { createMemoryHistory } from 'history';

import SearchPackageListItem from './search-package-list-item';

jest.mock('../tags-label', () => () => (<div>TagsLabel component</div>));
jest.mock('../hidden-label', () => () => (<div>HiddenLabel component</div>));

const routerHistory = createMemoryHistory();

const testTags = ['first', 'second', 'third'];

const testEmptyProps = {};

const testBasicProps = {
  item: {
    name: 'test-package-name',
    providerName: 'test-provider-name',
    isSelected: true,
    titleCount: 1,
    visibilityData: {
      isHidden: false,
    },
    tags: {
      tagList: testTags,
    },
  },
  link: 'test-link-url',
};

const testFullProps = {
  ...testBasicProps,
  item: {
    ...testBasicProps.item,
    visibilityData: {
      isHidden: true,
    }
  },
  showProviderName: true,
  showTitleCount: true,
  showTags: true,
};

describe('Given SearchPackageListItem', () => {
  const handleClick = jest.fn();

  const renderSearchPackageListItem = ({ ...props }) => render(
    <Router history={routerHistory}>
      <SearchPackageListItem {...props} />
    </Router>
  );

  it('should render skeleton when item is not provided', () => {
    renderSearchPackageListItem(testEmptyProps);

    const isSkeleton = document
      .querySelector('.skeleton');

    expect(isSkeleton).toBeDefined();
  });

  it('should render SearchPackageListItem link', () => {
    renderSearchPackageListItem(testBasicProps);

    const isSearchPackageListItemAttribute = document
      .querySelector('.item')
      .getAttribute('data-test-eholdings-package-list-item');

    expect(isSearchPackageListItemAttribute).toEqual('true');
  });

  it('should not invoke onClick callback', () => {
    renderSearchPackageListItem(testBasicProps);
    fireEvent.click(screen.getByRole('link', { name: /test-package-name/ }));

    expect(handleClick).not.toBeCalled();
  });

  it('should invoke onClick callback', () => {
    const testPropsWithOnClick = {
      ...testBasicProps,
      onClick: handleClick,
    };

    renderSearchPackageListItem(testPropsWithOnClick);

    fireEvent.click(screen.getByRole('link', { name: /test-package-name/ }));

    expect(handleClick).toBeCalled();
  });

  it('should display provider name', () => {
    const { getByText } = renderSearchPackageListItem(testFullProps);

    expect(getByText('test-provider-name')).toBeDefined();
  });

  it('should display title count', () => {
    const { getByText } = renderSearchPackageListItem(testFullProps);

    expect(getByText('ui-eholdings.label.totalTitles')).toBeDefined();
  });

  it('should render HiddenLabel component', () => {
    const { getByText } = renderSearchPackageListItem(testFullProps);

    expect(getByText('HiddenLabel component')).toBeDefined();
  });

  it('should render TagsLabel component', () => {
    const { getByText } = renderSearchPackageListItem(testFullProps);

    expect(getByText('TagsLabel component')).toBeDefined();
  });
});
