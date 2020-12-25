export const TOUR_SELECTOR = 'data-tour';
export const makeTourSelector = (stepName: string) =>
  `[${TOUR_SELECTOR}=${stepName}]`;
