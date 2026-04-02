import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { DialogModal } from '.';

export interface DoubleBtnModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  firstBtnText: string;
  secondBtnText: string;
  firstBtnFn: () => void;
  secondBtnFn: () => void;
  isLoading?: boolean;
}

const DoubleBtnModal = ({
  isOpen,
  onClose,
  title,
  description,
  firstBtnText,
  secondBtnText,
  firstBtnFn,
  secondBtnFn,
  isLoading = false
}: DoubleBtnModalProps) => {
  return (
    <DialogModal closeModal={onClose} isOpen={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogFooter className="mt-10">
          <Button size="sm" variant="secondary" onClick={secondBtnFn}>
            {secondBtnText}
          </Button>

          <Button size="sm" onClick={firstBtnFn} disabled={isLoading} isLoading={isLoading}>
            {firstBtnText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogModal>
  );
};

export default DoubleBtnModal;
