export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Request failed"

export type CursorPageResult<TItem> = {
  items: TItem[]
  pagination: {
    limit: number
    next_cursor: string | null
    prev_cursor: string | null
  }
}

/**
 * Walks a cursor-paginated list endpoint to collect every page into one array.
 * `fetchPage` is called with the previous page's `next_cursor` (undefined on
 * the first call); pass it a request function that forwards that cursor.
 * Stops once a page reports no `next_cursor`, or after `maxPages` (default
 * 20) as a safety net against a misbehaving endpoint looping forever.
 */
export async function fetchAllCursorPages<TItem>(
  fetchPage: (cursor?: string) => Promise<{ data: CursorPageResult<TItem> }>,
  options?: { maxPages?: number }
): Promise<TItem[]> {
  const maxPages = options?.maxPages ?? 20
  const items: TItem[] = []
  let cursor: string | undefined

  for (let page = 0; page < maxPages; page++) {
    const { data } = await fetchPage(cursor)
    items.push(...data.items)
    if (!data.pagination.next_cursor) break
    cursor = data.pagination.next_cursor
  }

  return items
}
