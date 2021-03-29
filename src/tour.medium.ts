import { medium, effect } from '@performance-artist/medium';
import { behavior } from '@performance-artist/rx-utils';
import { set } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import * as rxo from 'rxjs/operators';
import * as rx from 'rxjs';

import { TourSource, TourStepKey } from './tour.source';

type TourMediumDeps<T extends TourStepKey> = {
  tourSource: TourSource<T>;
};

export const makeTourMedium = <T extends TourStepKey>() =>
  medium.map(medium.id<TourMediumDeps<T>>()('tourSource'), (deps, on) => {
    const { tourSource } = deps;

    const stepReady = behavior.of<Set<T>>(set.empty);

    const currentStep$ = pipe(
      tourSource.state.value$,
      rxo.map(state => state.currentStep),
      rxo.distinctUntilChanged(),
    );

    const isOpen = pipe(
      rx.combineLatest([
        on(tourSource.create('setTourOpen')),
        stepReady.value$,
        currentStep$,
      ]),
      rxo.map(
        ([isTourOpen, stepReady, currentStep]) =>
          isTourOpen && stepReady.has(currentStep.key),
      ),
      effect.tag('isOpen', isOpen =>
        tourSource.state.modify(state => ({ ...state, isOpen })),
      ),
    );

    const onStepReady = pipe(
      on(tourSource.create('onStepReady')),
      effect.tag('onStepReady', step =>
        stepReady.modify(stepReady => stepReady.add(step)),
      ),
    );

    return {
      isOpen,
      onStepReady,
    };
  });
