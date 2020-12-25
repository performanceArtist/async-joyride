import { memo, useEffect, useMemo } from 'react';
import { TOUR_SELECTOR } from '../tour.utils';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { TourSource, TourStepKey, TourState } from '../tour.source';
import { useBehavior } from '@performance-artist/react-utils';

const makeTourSelectorProp = (stepName: string) => ({
  [TOUR_SELECTOR]: stepName,
});

export type TourSelector = { 'data-tour': string };

export type TourTargetProps<T extends TourStepKey> = {
  tourSelector: TourSelector | {};
  dispatch: TourSource<T>['dispatch'];
  state: TourState<T>;
};

type NoStep = {
  type: 'noStep';
};
export const NO_STEP: NoStep = {
  type: 'noStep',
};

const isNoStep = (step: any): step is NoStep => step.type === 'noStep';

type Deps<T extends TourStepKey> = {
  tourSource: TourSource<T>;
};

export const makeTourTargetWrapper = <T extends TourStepKey>() =>
  pipe(
    selector.keys<Deps<T>>()('tourSource'),
    selector.map(deps =>
      memo<{
        stepName: T | NoStep;
        children: (props: TourTargetProps<T>) => JSX.Element;
      }>(props => {
        const { tourSource } = deps;
        const { stepName, children } = props;

        const dispatch = useMemo(
          () => (isNoStep(stepName) ? () => () => {} : tourSource.dispatch),
          [stepName],
        );

        useEffect(() => {
          if (!isNoStep(stepName)) {
            dispatch('onStepReady')(stepName);
          }
        }, [dispatch, stepName]);

        const tourSelector = isNoStep(stepName)
          ? {}
          : makeTourSelectorProp(stepName);

        const state = useBehavior(tourSource.state);

        return children({ tourSelector, dispatch: dispatch as any, state });
      }),
    ),
  );
