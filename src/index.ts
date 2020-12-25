import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';
import { makeTourTargetWrapper } from './components/tour-target.component';
import { makeTourContainer, TourStep } from './containers/tour.container';
import { makeTourMedium } from './tour.medium';
import { makeTourSource, TourStepKey } from './tour.source';

type TourConfig<T extends TourStepKey> = {
  getStep: (stepName: T) => TourStep;
  stepKeys: NonEmptyArray<T>;
};

export const makeTour = <T extends TourStepKey>(config: TourConfig<T>) => {
  const { getStep, stepKeys } = config;

  const medium = makeTourMedium<T>();
  const source = makeTourSource(stepKeys);
  const TourTarget = makeTourTargetWrapper<T>();
  const TourContainer = makeTourContainer({ getStep, stepKeys });

  return {
    medium,
    source,
    TourTarget,
    TourContainer,
  };
};
