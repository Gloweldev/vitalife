import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', ...props }, ref) => {
        return (
            <textarea
                className={`flex min-h-[120px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all
          placeholder:text-gray-400 resize-none
          focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-100
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
