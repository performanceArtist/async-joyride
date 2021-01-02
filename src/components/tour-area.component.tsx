import React, { CSSProperties, Fragment, memo } from 'react';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { TourStepKey } from '../tour.source';
import { makeUseTour, NoStep } from '../hooks/useTour';

type TourAreaProps<T extends TourStepKey> = {
  stepKey: T | NoStep;
} & Pick<CSSProperties, 'width' | 'height'> &
  Partial<Pick<CSSProperties, 'top' | 'bottom' | 'left' | 'right'>>;

export const makeTourArea = <T extends TourStepKey>() =>
  pipe(
    makeUseTour<T>(),
    selector.map(useTour =>
      memo<TourAreaProps<T>>(props => {
        const { stepKey, ...style } = props;
        const { tourProps, state } = useTour(stepKey);

        return state.isOpen && state.currentStep.key === stepKey ? (
          <div {...tourProps} style={{ position: 'absolute', ...style }}></div>
        ) : (
          <Fragment />
        );
      }),
    ),
  );
