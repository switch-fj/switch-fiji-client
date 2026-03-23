'use client';
import { forwardRef, type ReactNode } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface IInputProps extends NumericFormatProps {
  label: string;
  description?: ReactNode;
  required?: boolean;
}

const InputNumberField = forwardRef<HTMLInputElement, IInputProps>(
  ({ description, required, label, ...props }, ref) => {
    const { className, ...restProps } = props;
    return (
      <FormItem className="w-full">
        <FormLabel className="flex items-center justify-start space-x-1">{label}</FormLabel>
        <FormControl className="w-full">
          <NumericFormat
            className="placeholder:text-muted-foreground focus-visible:ring-ring flex h-11 w-full rounded-lg bg-neutral-100 px-3 py-1 text-sm font-semibold transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            {...{ ref }}
            {...restProps}
          />
        </FormControl>
        <FormDescription>{description}</FormDescription>
        <FormMessage />
      </FormItem>
    );
  }
);

InputNumberField.displayName = 'InputNumberField';

export default InputNumberField;
