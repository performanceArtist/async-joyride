import { source, SourceOf } from '@performance-artist/medium';
import { array, option } from 'fp-ts';
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';
import { pipe } from 'fp-ts/lib/pipeable';

export type TourStepKey = string;

export type TourStep<T extends TourStepKey> = {
  index: number;
  key: T;
};

export type TourState<T extends TourStepKey> = {
  currentStep: TourStep<T>;
  isOpen: boolean;
};

const makeInitialState = <T extends TourStepKey>(
  stepKeys: NonEmptyArray<T>,
): TourState<T> => ({
  currentStep: {
    index: 0,
    key: stepKeys[0],
  },
  isOpen: false,
});

export type TourSource<T extends TourStepKey> = SourceOf<
  TourState<T>,
  {
    setTourOpen: boolean;
    onStepReady: T;
    setCurrentStep: T;
    setCurrentStepIndex: number;
  }
>;

export const DEFAULT_ID = 'tour';

export const makeTourSource = <T extends TourStepKey>(
  stepKeys: NonEmptyArray<T>,
) => (id = DEFAULT_ID): TourSource<T> => {
  const setCurrentStep = (state: TourState<T>) => (currentStep: T) =>
    pipe(
      stepKeys,
      array.findIndex(step => step === currentStep),
      option.fold(
        () => state,
        index => ({ ...state, currentStep: { key: currentStep, index } }),
      ),
    );

  const setCurrentStepIndex = (state: TourState<T>) => (index: number) =>
    pipe(
      stepKeys,
      array.lookup(index),
      option.fold(() => state, setCurrentStep(state)),
    );

  return source.create(
    id,
    makeInitialState(stepKeys),
  )({
    setTourOpen: source.input(),
    onStepReady: source.input(),
    setCurrentStep,
    setCurrentStepIndex,
  });
};
