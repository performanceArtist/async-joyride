import { test } from '@performance-artist/medium';
import { makeTourMedium } from './tour.medium';
import { makeTourSource } from './tour.source';

type Steps = ['one', 'two'];
const steps: Steps = ['one', 'two'];
type StepKey = Steps[number];

const tourMedium = makeTourMedium<StepKey>();
const withTour = test.withMedium(tourMedium);

describe('tour', () => {
  it(
    'Opens tour if the current step is ready',
    withTour(
      () => ({ tourSource: makeTourSource(steps)() }),
      (deps, history, output) => {
        const { tourSource } = deps;

        tourSource.dispatch('setTourOpen')(true);
        expect(history.take()).toStrictEqual([output('isOpen')(false)]);

        tourSource.dispatch('onStepReady')('one');
        expect(
          test.unorderedEqualStrict(history.take(), [
            output('onStepReady')('one'),
            output('isOpen')(true),
          ]),
        ).toBe(true);
      },
    ),
  );
});
