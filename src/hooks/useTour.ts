import { selector } from '@performance-artist/fp-ts-adt';
import { useBehavior } from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';
import { useEffect, useMemo } from 'react';
import { makeTourSelectorProp } from '../tour.utils';
import { TourSource, TourState, TourStepKey } from '../tour.source';

type Deps<T extends TourStepKey> = {
  tourSource: TourSource<T>;
};

export type TourProps = { 'data-tour': string; noInteraction: boolean };

export type NoStep = {
  type: 'noStep';
};
export const NO_STEP: NoStep = {
  type: 'noStep',
};

const isNoStep = (step: any): step is NoStep => step.type === 'noStep';

export type TourTargetProps<T extends TourStepKey> = {
  tourProps: TourProps | {};
  dispatch: TourSource<T>['dispatch'];
  state: TourState<T>;
};

export const makeUseTour = <T extends TourStepKey>() =>
  pipe(
    selector.keys<Deps<T>>()('tourSource'),
    selector.map(deps => (stepKey: T | NoStep): TourTargetProps<T> => {
      const { tourSource } = deps;

      const dispatch = useMemo(
        () =>
          (isNoStep(stepKey)
            ? () => () => {}
            : tourSource.dispatch) as TourSource<T>['dispatch'],
        [stepKey],
      );

      useEffect(() => {
        if (!isNoStep(stepKey)) {
          dispatch('onStepReady')(stepKey);
        }
      }, [dispatch, stepKey]);

      const tourProps = isNoStep(stepKey)
        ? {}
        : { ...makeTourSelectorProp(tourSource.id, stepKey) };

      const state = useBehavior(tourSource.state);

      return { tourProps, dispatch, state };
    }),
  );
