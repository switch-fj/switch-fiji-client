'use client';
import { forwardRef, InputHTMLAttributes, type ReactNode, useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: ReactNode;
}

const InputField = forwardRef<HTMLInputElement, IInputProps>(
  ({ description, label, ...props }, ref) => {
    const { className, type, ...restProps } = props;
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';

    return (
      <FormItem className="w-full">
        <FormLabel>
          {label}
          {props.required && label != '' && <span className="text-red-300">*</span>}
        </FormLabel>
        <FormControl className="w-full">
          <div className="relative">
            <Input
              {...{ ref }}
              {...restProps}
              type={isPasswordField && showPassword ? 'text' : type}
              className={cn(isPasswordField && 'pr-10', className)}
            />
            {isPasswordField && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500  hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </FormControl>
        <FormDescription>{description}</FormDescription>
        <FormMessage />
      </FormItem>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
