import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('@/requests', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('@/constants/api', () => ({
  API: {
    GET: '/'
  }
}));

vi.mock('@/store', () => ({
  useStore: () => ({
    AppConfigStore: {
      toggleModals: vi.fn()
    }
  })
}));
