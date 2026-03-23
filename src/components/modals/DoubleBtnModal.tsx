import { useStore } from '@/store';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { DialogModal } from '.';
import { AppModals } from '@/store/AppConfig/appModalTypes';

const DoubleBtnModal = () => {
  const {
    AppConfigStore: { toggleModals, isOpen, doubleBtnModal }
  } = useStore();
  return (
    <DialogModal
      closeModal={() => toggleModals({ name: AppModals.DOUBLE_BTN_MODAL, open: false })}
      isOpen={isOpen.DOUBLE_BTN_MODAL}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{doubleBtnModal.title}</DialogTitle>
          {doubleBtnModal.description && (
            <DialogDescription>{doubleBtnModal.description}</DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="mt-10">
          <Button size="sm" variant="secondary" onClick={doubleBtnModal.secondBtnFn}>
            {doubleBtnModal.secondBtnText}
          </Button>

          <Button
            size="sm"
            onClick={doubleBtnModal.firstBtnFn}
            disabled={doubleBtnModal.isLoading}
            isLoading={doubleBtnModal.isLoading}
          >
            {doubleBtnModal.firstBtnText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogModal>
  );
};

export default DoubleBtnModal;
