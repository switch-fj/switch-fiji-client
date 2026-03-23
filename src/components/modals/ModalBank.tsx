import { useStore } from '@/store';
import { AppModals } from '@/store/AppConfig/appModalTypes';
import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const ModalsMap = {
  [AppModals.DOUBLE_BTN_MODAL]: dynamic(() => import('@/components/modals/DoubleBtnModal'))
};

const ModalsBank = () => {
  const {
    AppConfigStore: { isOpen, nuonce }
  } = useStore();

  const OpenedModalsComponent = useMemo(() => {
    return Object.entries(ModalsMap).reduce(
      (acc: { Render: React.ReactNode; name: string }[], [keyName, Component]) => {
        if (isOpen[keyName as keyof typeof AppModals]) {
          acc.push({ Render: <Component key={keyName} />, name: keyName });
        }
        return acc;
      },
      []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, nuonce]);

  return <>{OpenedModalsComponent.map((Modal) => Modal.Render)}</>;
};

export default observer(ModalsBank);
