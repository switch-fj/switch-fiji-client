declare module '*.css' {
  const content: Record<string, string>;

  export default content;
}

type TOption = { value: string; label: string; disable?: boolean };

interface IQueryHookResponse<D> {
  data: D;
  isLoading: boolean;
  error: unknown;
  isFetching: boolean;
  status: 'error' | 'success' | 'pending';
}
