import { Fragment } from 'react';

export interface ModalBankItem {
  key: string;
  isOpen: boolean;
  render: () => React.ReactNode;
}

interface ModalBankProps {
  modals: ModalBankItem[];
}

const ModalBank = ({ modals }: ModalBankProps) => {
  return (
    <>
      {modals
        .filter((modal) => modal.isOpen)
        .map((modal) => (
          <Fragment key={modal.key}>{modal.render()}</Fragment>
        ))}
    </>
  );
};

export default ModalBank;
