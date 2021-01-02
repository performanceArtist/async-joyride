export const TOUR_SELECTOR = 'data-tour';
export const makeTourSelector = (id: string, stepName: string) =>
  `[${TOUR_SELECTOR}=${id}-${stepName}]`;

export const makeTourSelectorProp = (id: string, stepName: string) => ({
  [TOUR_SELECTOR]: `${id}-${stepName}`,
});
