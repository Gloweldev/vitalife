import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'success';
    size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            default: 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:ring-green-200',
            outline: 'border-2 border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600 hover:bg-green-50 focus:ring-green-100',
            ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-100',
            success: 'bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg focus:ring-green-200',
        };

        const sizes = {
            default: 'px-6 py-3 text-base gap-2',
            sm: 'px-4 py-2 text-sm gap-1.5',
            lg: 'px-8 py-4 text-lg gap-3',
        };

        return (
            <button
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
