import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Pluggable,
} from '@folio/stripes-core';

import {
  Accordion,
  Headline,
  Button,
  Badge,
} from '@folio/stripes/components';

import Toaster from '../../components/toaster';

import { selectPropFromData } from '../../redux/selectors';
import {
  attachAgreement as attachAgreementAction,
  getAgreements as getAgreementsAction,
  unassignAgreement as unassignAgreementAction,
  confirmUnassignAgreement as confirmUnassignAgreementAction,
} from '../../redux/actions';

import AgreementsList from '../../components/agreements-list';

import Agreement from './model';
import styles from './agreements-accordion.css';

class AgreementsAccordion extends Component {
  static propTypes = {
    agreements: PropTypes.shape({
      errors: PropTypes.array.isRequired,
      isLoading: PropTypes.bool.isRequired,
      isUnassigned: PropTypes.bool.isRequired,
      items: PropTypes.arrayOf({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    attachAgreement: PropTypes.func.isRequired,
    confirmUnassignAgreement: PropTypes.func.isRequired,
    getAgreements: PropTypes.func.isRequired,
    headerProps: PropTypes.object,
    id: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    refId: PropTypes.string.isRequired,
    refType: PropTypes.string,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    unassignAgreement: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const {
      getAgreements,
      refId,
      stripes,
    } = this.props;

    if (stripes.hasPerm('erm.agreements.collection.get')) {
      getAgreements(refId);
    }
  }

  componentDidUpdate() {
    const {
      agreements: { isUnassigned },
      confirmUnassignAgreement,
    } = this.props;

    if (isUnassigned) {
      confirmUnassignAgreement();
    }
  }

  getAgreementsAccordionHeader = () => {
    return (
      <Headline
        size="large"
        tag="h3"
      >
        <FormattedMessage id="ui-eholdings.agreements" />
      </Headline>
    );
  }

  renderFindAgreementTrigger = (props) => {
    return (
      <Button {...props}>
        <FormattedMessage id="ui-eholdings.add" />
      </Button>
    );
  }

  getAgreementsAccordionButtons() {
    const {
      refType,
      refId,
    } = this.props;

    return (
      <>
        <Pluggable
          dataKey="find-agreements"
          type="find-agreement"
          renderTrigger={this.renderFindAgreementTrigger}
          onAgreementSelected={this.onAddAgreementHandler}
        />
        <Button
          data-test-new-button
          buttonClass={styles['new-button']}
          to={`/erm/agreements/create?authority=${refType}&referenceId=${refId}`}
        >
          <FormattedMessage id="ui-eholdings.new" />
        </Button>
      </>
    );
  }

  renderBadge() {
    return (
      <Badge>
        {this.props.agreements.items.length}
      </Badge>
    );
  }

  onAddAgreementHandler = ({ name, id }) => {
    const {
      refId,
      refType,
      attachAgreement,
    } = this.props;

    const agreementParams = {
      id,
      refId,
      authorityType: refType,
      label: name,
    };

    attachAgreement(new Agreement(agreementParams));
  };

  get toasts() {
    const {
      id,
      agreements: {
        errors,
        isUnassigned,
      },
    } = this.props;

    const toasts = errors.map(error => ({
      message: error.title,
      type: 'error',
    }));

    if (isUnassigned) {
      toasts.push({
        id: `success-agreement-unlink-${id}-${Date.now()}`,
        message: <FormattedMessage id="ui-eholdings.agreements.unlink" />,
        type: 'success'
      });
    }

    return toasts;
  }

  render() {
    const {
      agreements,
      isOpen,
      id,
      onToggle,
      headerProps,
      unassignAgreement,
    } = this.props;

    return (
      <>
        <Accordion
          id={id}
          open={isOpen}
          label={this.getAgreementsAccordionHeader()}
          displayWhenOpen={this.getAgreementsAccordionButtons()}
          displayWhenClosed={this.renderBadge()}
          onToggle={onToggle}
          headerProps={headerProps}
        >
          <AgreementsList
            agreements={agreements}
            unassignAgreement={unassignAgreement}
          />
        </Accordion>

        <Toaster
          position="bottom"
          toasts={this.toasts}
        />
      </>
    );
  }
}

export default connect(
  (store) => ({
    agreements: selectPropFromData(store, 'agreements'),
  }), {
    getAgreements: getAgreementsAction,
    attachAgreement: attachAgreementAction,
    unassignAgreement: unassignAgreementAction,
    confirmUnassignAgreement: confirmUnassignAgreementAction,
  }
)(AgreementsAccordion);
