import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

import UsageConsolidationFilters from './usage-consolidation-filters';
import UsageConsolidationContent from './usage-consolidation-content-title';

export default @interactor class TitleUsageConsolidation {
  accordion = new AccordionInteractor('#titleShowUsageConsolidation');
  isAccordionPresent = isPresent('#titleShowUsageConsolidation');

  filters = new UsageConsolidationFilters();
  content = new UsageConsolidationContent();

  whenLoaded() {
    return this.when(() => this.isAccordionPresent).timeout(1000);
  }
}
