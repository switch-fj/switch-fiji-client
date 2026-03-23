import { QueryClient, QueryClientProvider, QueryFunction, QueryKey } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';
import server from '@/requests';

export const staleTime = 1000 * 60 * 5; // 5 minutes
export const refetchInterval = 1000 * 60 * 8; // 8 minutes
export const gcTime = 1000 * 60 * 60; // 1 hour

const call = {
  server
};

export type TRequestClient = keyof typeof call;

function getReqClient(client: TRequestClient = 'server') {
  return call[client] ?? client;
}

const queryFn: QueryFunction<unknown, QueryKey, number> = async ({ signal, pageParam, meta }) => {
  const server = getReqClient(meta?.requestServer as TRequestClient);

  const { data } = await server.get(meta?.path as string, {
    signal,
    params: { ...(meta?.params ?? {}), ...(pageParam ? { cursor: pageParam } : {}) }
  });

  return data;
};

function ReactQueryProvider({ children }: PropsWithChildren<{}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { gcTime, staleTime, refetchInterval, retryOnMount: false, queryFn }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default ReactQueryProvider;
