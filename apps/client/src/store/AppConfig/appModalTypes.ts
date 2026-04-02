export enum AppModals {
  DOUBLE_BTN_MODAL = 'DOUBLE_BTN_MODAL'
}

export type TAppModalsAction =
  | { name?: undefined }
  | { name: ''; open?: boolean }
  | ({ name: AppModals.DOUBLE_BTN_MODAL } & (
      | {
          open: true;
          title: string;
          description?: string;
          firstBtnText: string;
          secondBtnText: string;
          firstBtnFn: () => void;
          isLoading?: boolean;
          secondBtnFn: () => void;
        }
      | { open?: false }
    ));
