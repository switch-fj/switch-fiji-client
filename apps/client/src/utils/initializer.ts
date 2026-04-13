export const errorInitializer = <T extends {} = Record<string, boolean>>(initialLoadingState: T) =>
  Object.keys(initialLoadingState).reduce(
    (acc, curr) => {
      acc[curr as keyof typeof initialLoadingState] = '';
      return acc;
    },
    {} as Record<keyof typeof initialLoadingState, string>
  );

const initializer = <T extends {} = Record<string, boolean>, U = string>(
  initializingObj: T,
  initilizeWith: U
) =>
  Object.keys(initializingObj).reduce(
    (acc, curr) => {
      acc[curr as keyof typeof initializingObj] = initilizeWith;
      return acc;
    },
    {} as Record<keyof typeof initializingObj, U>
  );

export default initializer;
