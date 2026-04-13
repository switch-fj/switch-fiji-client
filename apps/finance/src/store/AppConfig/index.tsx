import { makeObservable, observable, action } from 'mobx';
import { RootStore } from '@/store';
import initializer from '@/utils/initializer';
import { AppModals, TAppModalsAction } from './appModalTypes';

const INIT_IS_OPEN = initializer(AppModals, false);

const INIT_IS_LOADING = {
  isDeletingFood: false,
  isAddingFood: false
};

class AppConfigStore {
  rootStore: RootStore;
  nuonce = 0;
  isOpen = { ...INIT_IS_OPEN };
  isLoading = { ...INIT_IS_LOADING };
  errors = initializer(this.isLoading, '');
  doubleBtnModal = {
    title: '',
    description: '',
    firstBtnText: '',
    secondBtnText: '',
    firstBtnFn: () => {},
    isLoading: false,
    secondBtnFn: () => {}
  };

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      nuonce: observable,
      isOpen: observable,
      isLoading: observable,
      errors: observable,
      doubleBtnModal: observable,

      toggleModals: action.bound
    });
    this.rootStore = rootStore;
  }

  setModalOpenState(name: AppModals, open?: boolean) {
    this.isOpen[name] = typeof open === 'undefined' ? !this.isOpen[name] : open;
  }

  toggleModals(modal: TAppModalsAction = {}) {
    switch (modal.name) {
      case '':
        break;
      case AppModals.DOUBLE_BTN_MODAL:
        if (modal.open) {
          this.doubleBtnModal = {
            title: modal.title,
            description: modal.description ?? '',
            firstBtnText: modal.firstBtnText,
            secondBtnText: modal.secondBtnText,
            firstBtnFn: modal.firstBtnFn,
            isLoading: modal.isLoading || false,
            secondBtnFn: modal.secondBtnFn
          };
        }
        break;
      default:
        this.isOpen = { ...INIT_IS_OPEN };
        break;
    }
    if (modal.name && AppModals[modal.name] !== undefined) {
      this.setModalOpenState(modal.name, modal.open);
    }

    this.nuonce = new Date().getTime();
  }
}

export default AppConfigStore;
