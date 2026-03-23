import { Dialog } from '@/components/ui/dialog';

interface IXModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  closeModal: () => void;
}

export const DialogModal = ({ children, isOpen, closeModal }: IXModalProps) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={closeModal}>
      {children}
    </Dialog>
  );
};
