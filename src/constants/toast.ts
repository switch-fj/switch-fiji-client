import { ExternalToast, toast as sonnerToast } from 'sonner';

const baseStyle = {
  padding: '14px',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  fontWeight: '700'
};

const styles = {
  success: {
    ...baseStyle,
    border: '2px solid #28a745',
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  error: {
    ...baseStyle,
    border: '2px solid #dc3545',
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  warning: {
    ...baseStyle,
    border: '2px solid #ffc107',
    backgroundColor: '#fff3cd',
    color: '#856404'
  },
  info: {
    ...baseStyle,
    border: '2px solid #262626',
    backgroundColor: '#EFEFEF',
    color: '#262626'
  }
};

export const toast = {
  success: (message: React.ReactNode, data: ExternalToast = {}) =>
    sonnerToast.success(message, { style: styles.success, ...data }),

  error: (message: React.ReactNode, data: ExternalToast = {}) =>
    sonnerToast.error(message, { style: styles.error, ...data }),

  warning: (message: React.ReactNode, data: ExternalToast = {}) =>
    sonnerToast.warning(message, { style: styles.warning, ...data }),

  info: (message: React.ReactNode, data: ExternalToast = {}) =>
    sonnerToast.info(message, { style: styles.info, ...data })
};
