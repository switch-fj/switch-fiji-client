'use client';
import { Toaster } from 'sonner';
import ReactQueryProvider from '@/requests/query.tanstack';
import { StoreProvider } from '@/store';
import ModalBank from '@/components/modals/ModalBank';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Toaster position="top-center" />
      <ReactQueryProvider>
        {children}
        <ModalBank />
      </ReactQueryProvider>
    </StoreProvider>
  );
}
