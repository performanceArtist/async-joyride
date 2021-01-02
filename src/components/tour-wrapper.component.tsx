import { memo } from 'react';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { TourStepKey } from '../tour.source';
import { makeUseTour, NoStep, TourTargetProps } from '../hooks/useTour';

export const makeTourWrapper = <T extends TourStepKey>() =>
  pipe(
    makeUseTour<T>(),
    selector.map(useTour =>
      memo<{
        stepKey: T | NoStep;
        children: (
          props: TourTargetProps<T> & { isActive: boolean },
        ) => JSX.Element;
      }>(props => {
        const { stepKey, children } = props;
        const tourProps = useTour(stepKey);

        return children({
          ...tourProps,
          isActive:
            tourProps.state.isOpen &&
            tourProps.state.currentStep.key === stepKey,
        });
      }),
    ),
  );
