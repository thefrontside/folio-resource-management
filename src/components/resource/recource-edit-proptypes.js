import PropTypes from 'prop-types';

import { accessTypesReduxStateShape } from '../../constants';

export default {
  accessStatusTypes: accessTypesReduxStateShape.isRequired,
  closeSelectionModal: PropTypes.func.isRequired,
  getFooter: PropTypes.func.isRequired,
  getSectionHeader: PropTypes.func.isRequired,
  handelDeleteConfirmation: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  model: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  proxyTypes: PropTypes.object.isRequired,
  showSelectionModal: PropTypes.bool.isRequired,
};
