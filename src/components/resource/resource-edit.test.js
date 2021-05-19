import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';

import ResourceEdit from './resource-edit';
import Harness from '../../../test/jest/helpers/harness';

jest.mock('./components/edit/coverage-settings', () => () => <div>Coverage settings</div>);
jest.mock('./components/edit/resource-settings', () => () => <div>Resource settings</div>);
jest.mock('./components/edit/holding-status', () => () => <div>Holding status</div>);
jest.mock('../navigation-modal', () => ({ when }) => (when ? <span>NavigationModal</span> : null));

const model = {
  id: '123356',
  name: 'Resource name',
  isTitleCustom: false,
  managedCoverages: [{
    beginCoverage: '2021-01-01',
    endCoverage: '2021-01-31',
  }],
  publicationType: 'publication type',
  isLoaded: true,
  titleHasSelectedResources: true,
  isSelected: false,
  coverageStatement: 'coverage statement',
  customCoverages: [{
    beginCoverage: '2021-01-01',
    endCoverage: '2021-01-31',
  }],
  customEmbargoPeriod: {
    embargoUnit: 'month',
    embargoValue: '1',
  },
  title: {
    name: 'Title name',
    isTitleCustom: false,
  },
  visibilityData: {
    reason: '',
    isHidden: false,
  },
  package: {
    name: 'package-name',
    titleCount: 2,
    visibilityData: {
      isHidden: false,
    },
    customCoverage: {
      beginCoverage: '2021-01-01',
      endCoverage: '2021-01-31',
    },
  },
  proxy: {
    id: 'proxy-id',
  },
  destroy: {
    timestamp: 0,
    isRejected: false,
    errors: [],
  },
  update: {
    timestamp: 0,
    isPending: false,
    isRedolved: false,
    isRejected: false,
    errors: [],
  },
  request: {
    timestamp: 0,
    isRejected: false,
    errors: [],
  },
};

const onSubmitMock = jest.fn();
const onCancelMock = jest.fn();

const storeInitialState = {
  data: {
    customLabels: {
      errors: [],
      items: {
        data: [{
          type: 'customLabels',
          attributes: {
            id: 1,
            displayLabel: 'Label 1',
          },
        }],
      },
    },
  },
};

const renderResourceEdit = (props = {}) => render(
  <Harness storeInitialState={storeInitialState}>
    <ResourceEdit
      onCancel={onCancelMock}
      onSubmit={onSubmitMock}
      proxyTypes={{
        request: {
          isResolved: true,
        },
      }}
      accessStatusTypes={{
        items: {
          data: [{
            id: 'access-type-id',
            attributes: {
              name: 'access type',
            },
          }],
        }
      }}
      model={model}
      {...props}
    />
  </Harness>
);

describe('Given ResourceEdit', () => {
  afterEach(() => {
    cleanup();
    onSubmitMock.mockClear();
    onCancelMock.mockClear();
  });

  it('should show title name', () => {
    const { getAllByText } = renderResourceEdit();

    expect(getAllByText('Title name')).toBeDefined();
  });

  it('should render coverage settings', () => {
    const { getByText } = renderResourceEdit();

    expect(getByText('Coverage settings')).toBeDefined();
  });

  it('should render holding status', () => {
    const { getByText } = renderResourceEdit();

    expect(getByText('Holding status')).toBeDefined();
  });

  describe('when resource is selected', () => {
    it('should render Custom labels accordion', () => {
      const { getByText } = renderResourceEdit({
        model: {
          ...model,
          isSelected: true,
        },
      });

      expect(getByText('ui-eholdings.resource.customLabels')).toBeDefined();
    });

    it('should render resource settings', () => {
      const { getByText } = renderResourceEdit({
        model: {
          ...model,
          isSelected: true,
        },
      });

      expect(getByText('Resource settings')).toBeDefined();
    });

    describe('when editing a field', () => {
      it('should enable form buttons', () => {
        const {
          getByText,
          getByLabelText,
        } = renderResourceEdit({
          model: {
            ...model,
            isSelected: true,
          },
        });

        fireEvent.change(getByLabelText('Label 1'), { target: { value: '123' } });

        expect(getByText('stripes-components.saveAndClose')).toBeEnabled();
        expect(getByText('stripes-components.cancel')).toBeEnabled();
      });
    });
  });

  describe('when request is rejected', () => {
    it('should show error message', () => {
      const { getByText } = renderResourceEdit({
        model: {
          ...model,
          isLoaded: false,
          request: {
            isRejected: true,
            errors: [{
              title: 'An error has occured',
            }],
          },
        },
      });

      expect(getByText('An error has occured')).toBeDefined();
    });
  });

  describe('when model has not loaded', () => {
    it('should render spinner', () => {
      const { queryByTestId } = renderResourceEdit({
        model: {
          ...model,
          isLoaded: false,
        },
      });

      expect(queryByTestId('spinner')).toBeDefined();
    });
  });

  describe('when title is custom', () => {
    it('should show title name', () => {
      const { getAllByText } = renderResourceEdit({
        model: {
          ...model,
          isTitleCustom: true,
        }
      });

      expect(getAllByText('Title name')).toBeDefined();
    });

    it('should render coverage settings', () => {
      const { getByText } = renderResourceEdit({
        model: {
          ...model,
          isTitleCustom: true,
        }
      });

      expect(getByText('Coverage settings')).toBeDefined();
    });

    it('should render holding status', () => {
      const { getByText } = renderResourceEdit({
        model: {
          ...model,
          isTitleCustom: true,
        }
      });

      expect(getByText('Holding status')).toBeDefined();
    });

    describe('when resource is selected', () => {
      it('should render Custom labels accordion', () => {
        const { getByText } = renderResourceEdit({
          model: {
            ...model,
            isSelected: true,
            isTitleCustom: true,
          },
        });

        expect(getByText('ui-eholdings.resource.customLabels')).toBeDefined();
      });

      it('should render resource settings', () => {
        const { getByText } = renderResourceEdit({
          model: {
            ...model,
            isSelected: true,
            isTitleCustom: true,
          },
        });

        expect(getByText('Resource settings')).toBeDefined();
      });

      describe('when editing a field', () => {
        it('should enable form buttons', () => {
          const {
            getByText,
            getByLabelText,
          } = renderResourceEdit({
            model: {
              ...model,
              isSelected: true,
              isTitleCustom: true,
            },
          });

          fireEvent.change(getByLabelText('Label 1'), { target: { value: '123' } });

          expect(getByText('stripes-components.saveAndClose')).toBeEnabled();
          expect(getByText('stripes-components.cancel')).toBeEnabled();
        });
      });
    });

    describe('when request is rejected', () => {
      it('should show error message', () => {
        const { getByText } = renderResourceEdit({
          model: {
            ...model,
            isLoaded: false,
            isTitleCustom: true,
            request: {
              isRejected: true,
              errors: [{
                title: 'An error has occured',
              }],
            },
          },
        });

        expect(getByText('An error has occured')).toBeDefined();
      });
    });

    describe('when model has not loaded', () => {
      it('should render spinner', () => {
        const { queryByTestId } = renderResourceEdit({
          model: {
            ...model,
            isLoaded: false,
            isTitleCustom: true,
          },
        });

        expect(queryByTestId('spinner')).toBeDefined();
      });
    });
  });

  describe('when click on close icon and form is not pristine', () => {
    it('should show navigation modal', () => {
      const {
        getByText,
        getAllByTestId,
        getByLabelText,
      } = renderResourceEdit({
        model: {
          ...model,
          isSelected: true,
          update: {
            isPending: false,
            isResolved: false,
          },
        },
      });

      const startDateInput = getByLabelText('Label 1');

      fireEvent.change(startDateInput, { target: { value: '01/10/2021' } });
      fireEvent.blur(startDateInput);

      fireEvent.click(getAllByTestId('close-details-view-button')[0]);

      expect(getByText('NavigationModal')).toBeDefined();
    });
  });
});
