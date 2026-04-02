import { ButtonHTMLAttributes, useMemo } from 'react';
import { ClipLoader } from 'react-spinners';

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant:
  | 'primary'
  | 'primary-outlined'
  | 'transparent'
  | 'outlined'
  | 'light'
  | 'underlined'
  | 'danger'
  | 'secondary'
  | 'danger-outlined';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = ({
  text,
  size = 'md',
  variant,
  className,
  children,
  isLoading,
  leftIcon,
  rightIcon,
  ...rest
}: IButtonProps) => {
  const style = useMemo(() => {
    switch (variant) {
      case 'primary':
        return 'button-primary';
      case 'light':
        return 'button-light';
      case 'outlined':
        return 'button-outlined';
      case 'primary-outlined':
        return 'button-primary-outlined';
      case 'transparent':
        return 'button-transparent';
      case 'underlined':
        return 'button-underlined';
      case 'danger':
        return 'button-danger';
      case 'secondary':
        return 'button-secondary';
      case 'danger-outlined':
        return 'button-danger-outlined';
      default:
        break;
    }
  }, [variant]);

  const styleSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'button-sm';
      case 'md':
        return 'button-md';
      case 'lg':
        return 'button-lg';
      default:
        break;
    }
  }, [size]);

  return (
    <button className={`button group cursor-pointer ${style} ${styleSize} ${className}`} {...rest}>
      {isLoading ? (
        <ClipLoader color="#ffffff" size={20} aria-label="Loading Spinner" data-testid="loader" />
      ) : (
        <>
          {leftIcon}
          {children || <p className={`${leftIcon && 'ml-2'} ${rightIcon && 'mr-2'}`}>{text}</p>}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;
