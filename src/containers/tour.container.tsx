import { CallBackProps, Step } from 'react-joyride';
import { createElement, memo, useCallback, useEffect, useMemo } from 'react';
import { useBehavior } from '@performance-artist/react-utils';
import Joyride, { Props as JoyrideProps } from 'react-joyride';
import { TourSource, TourStepKey } from '../tour.source';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';

type TourContainerDeps<T extends TourStepKey> = {
  tourSource: TourSource<T>;
};

export type TourContainerProps = Omit<
  JoyrideProps,
  'steps' | 'stepIndex' | 'run'
>;

export type TourStep = Step & { isModal?: boolean };

export const makeTourContainer = <T extends TourStepKey>({
  getStep,
  stepKeys,
}: {
  getStep: (stepName: T) => TourStep;
  stepKeys: NonEmptyArray<T>;
}) =>
  pipe(
    selector.keys<TourContainerDeps<T>>()('tourSource'),
    selector.map(deps =>
      memo<TourContainerProps>(props => {
        const { tourSource } = deps;

        const state = useBehavior(tourSource.state);
        const steps = useMemo(() => stepKeys.map(getStep), [stepKeys]);

        useEffect(() => {
          steps.forEach(
            (step, index) =>
              step.isModal &&
              tourSource.dispatch('onStepReady')(stepKeys[index]),
          );
        }, [steps, stepKeys, tourSource]);

        const callback = useCallback(
          ({ action }: CallBackProps) =>
            action === 'close' &&
            state.isOpen &&
            tourSource.dispatch('setTourOpen')(false),
          [tourSource, state.isOpen],
        );

        return createElement(Joyride, {
          steps,
          stepIndex: state.currentStep.index,
          run: state.isOpen,
          callback,
          ...props,
        });
      }),
    ),
  );
