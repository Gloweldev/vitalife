import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', type = 'text', ...props }, ref) => {
        return (
            <input
                type={type}
                className={`flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-gray-400
          focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-100
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
