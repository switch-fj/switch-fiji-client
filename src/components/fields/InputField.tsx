import { forwardRef, InputHTMLAttributes, type ReactNode } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: ReactNode;
}

const InputField = forwardRef<HTMLInputElement, IInputProps>(
  ({ description, label, ...props }, ref) => {
    return (
      <FormItem className="w-full">
        {label && (
          <FormLabel className="flex items-center justify-start space-x-1">{label}</FormLabel>
        )}
        <FormControl>
          <Input ref={ref} {...props} />
        </FormControl>
        <FormDescription>{description}</FormDescription>
        <FormMessage />
      </FormItem>
    );
  }
);

InputField.displayName = 'InputField';
export default InputField;
