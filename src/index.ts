import { selector } from '@performance-artist/fp-ts-adt';
import { medium } from '@performance-artist/medium';
import { useSubscription, withHook } from '@performance-artist/react-utils';
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';
import { pipe } from 'fp-ts/lib/pipeable';
import { makeTourArea } from './components/tour-area.component';
import { makeTourWrapper } from './components/tour-wrapper.component';
import { makeTourContainer, TourStep } from './containers/tour.container';
import { makeTourMedium } from './tour.medium';
import { DEFAULT_ID, makeTourSource, TourStepKey } from './tour.source';
import { makeTourSelector } from './tour.utils';

export type TourConfigStep = Omit<TourStep, 'target'>;
type TourConfig<T extends TourStepKey> = {
  id?: string;
  getStep: (stepName: T) => TourConfigStep;
  stepKeys: NonEmptyArray<T>;
};

export const makeEagerTour = <T extends TourStepKey>(config: TourConfig<T>) => {
  const { id, getStep: getConfigStep, stepKeys } = config;

  const tourSource = makeTourSource(stepKeys)(id);

  const getStep = (stepName: T): TourStep => {
    const options = getConfigStep(stepName);

    return {
      ...options,
      target: options.isModal
        ? 'body'
        : makeTourSelector(tourSource.id, stepName),
    };
  };

  const TourContainer = pipe(
    makeTourContainer({ getStep, stepKeys }),
    selector.map(TourContainer =>
      withHook(TourContainer)(() => {
        useSubscription(
          () => pipe(makeTourMedium<T>(), medium.run({ tourSource })),
          [],
        );
      }),
    ),
  );

  const components = pipe(
    selector.combine(makeTourWrapper<T>(), makeTourArea<T>(), TourContainer),
    selector.map(([TourWrapper, TourArea, TourContainer]) => ({
      TourWrapper,
      TourArea,
      TourContainer,
    })),
  ).run({ tourSource });

  return {
    source: tourSource,
    ...components,
  };
};

export const makeLazyTour = <T extends TourStepKey>(config: TourConfig<T>) => {
  const { id, getStep: getConfigStep, stepKeys } = config;

  const getStep = (stepName: T): TourStep => {
    const options = getConfigStep(stepName);

    return {
      ...options,
      target: options.isModal
        ? 'body'
        : makeTourSelector(id || DEFAULT_ID, stepName),
    };
  };

  const source = () => makeTourSource(stepKeys)(id);
  const medium = makeTourMedium<T>();
  const TourWrapper = makeTourWrapper<T>();
  const TourArea = makeTourArea<T>();
  const TourContainer = makeTourContainer({ getStep, stepKeys });

  return {
    medium,
    source,
    TourWrapper,
    TourArea,
    TourContainer,
  };
};
