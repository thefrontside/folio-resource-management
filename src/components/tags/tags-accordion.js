import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedNumber,
} from 'react-intl';
import {
  Accordion,
  Headline,
  Icon,
  Badge,
} from '@folio/stripes/components';
import { getTagLabelsArr } from '../utilities';
import Tags from './tags';
import selectEntityTags from '../../redux/selectors/select-entity-tags';
import { updateEntityTags as updateEntityTagsAction } from '../../redux/actions';

class TagsAccordion extends Component {
  static propTypes = {
    entityTags: PropTypes.arrayOf(PropTypes.string),
    headerProps: PropTypes.object,
    id: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    tagsModel: PropTypes.object.isRequired,
    updateEntityTags: PropTypes.func.isRequired,
    updateFolioTags: PropTypes.func.isRequired,
  };

  render() {
    const {
      id,
      model,
      onToggle,
      open,
      tagsModel,
      updateFolioTags,
      updateEntityTags,
      entityTags,
      headerProps,
    } = this.props;

    return (
      <Accordion
        label={(
          <Headline
            size="large"
            tag="h3"
          >
            <FormattedMessage id="ui-eholdings.tags" />
          </Headline>
        )}
        open={open}
        id={id}
        onToggle={onToggle}
        displayWhenClosed={
          <Badge sixe='small'>
            <span data-testid="tags-accordion-tags-length">
              <FormattedNumber value={entityTags.length} />
            </span>
          </Badge>
        }
        headerProps={headerProps}
      >
        {(!tagsModel.request.isResolved || model.isLoading)
          ? (
            <Icon
              data-testid="spinner"
              icon="spinner-ellipsis"
            />
          )
          : (
            <Tags
              updateFolioTags={updateFolioTags}
              entityTags={entityTags}
              model={model}
              updateEntityTags={updateEntityTags}
              tags={getTagLabelsArr(tagsModel)}
            />
          )}
      </Accordion>
    );
  }
}

export default connect(
  (store, ownProps) => ({
    entityTags: selectEntityTags(ownProps.model.type, ownProps.model.id, store),
  }), {
    updateEntityTags: updateEntityTagsAction,
  }
)(TagsAccordion);
