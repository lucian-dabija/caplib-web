import * as React from 'react';
import { cn } from '../../utils';

export const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border bg-white/5 backdrop-blur-lg shadow-xl",
            className
        )}
        {...props}
    />
));
Card.displayName = "Card";

export const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: 'default' | 'destructive' | 'outline' | 'ghost';
        size?: 'default' | 'sm' | 'lg' | 'icon';
    }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-white/10 hover:bg-white/5",
        ghost: "hover:bg-white/5",
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
Button.displayName = "Button";

export const Input = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn(
            "flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    />
));
Input.displayName = "Input";

export const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium text-white/70 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    />
));
Label.displayName = "Label";

export const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
    <div className="relative">
        <select
            ref={ref}
            className={cn(
                "flex h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
        </div>
    </div>
));
Select.displayName = "Select";

export const Option = React.forwardRef<
    HTMLOptionElement,
    React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => (
    <option
        ref={ref}
        className={cn("text-sm", className)}
        {...props}
    />
));
Option.displayName = "Option";

export const Tabs = ({ children, defaultTab, onChange }: {
    children: React.ReactNode,
    defaultTab?: string,
    onChange?: (id: string) => void
}) => {
    const [activeTab, setActiveTab] = React.useState(defaultTab || "");

    const handleTabClick = (id: string) => {
        setActiveTab(id);
        if (onChange) {
            onChange(id);
        }
    };

    // Clone children to add active states
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            if (child.type === TabsHeader) {
                return React.cloneElement(child, {
                    children: React.Children.map(child.props.children, tab => {
                        if (React.isValidElement(tab) && tab.type === Tab) {
                            return React.cloneElement(tab, {
                                active: tab.props.id === activeTab,
                                onClick: () => handleTabClick(tab.props.id)
                            });
                        }
                        return tab;
                    })
                });
            }
            if (child.type === TabsContent) {
                return React.cloneElement(child, {
                    children: React.Children.map(child.props.children, panel => {
                        if (React.isValidElement(panel) && panel.type === TabPanel) {
                            return React.cloneElement(panel, {
                                active: panel.props.id === activeTab
                            });
                        }
                        return panel;
                    })
                });
            }
        }
        return child;
    });

    return <div className="w-full">{childrenWithProps}</div>;
};
Tabs.displayName = "Tabs";

export const TabsHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("flex space-x-1 border-b border-white/10", className)}>
            {children}
        </div>
    );
};
TabsHeader.displayName = "TabsHeader";

export const Tab = ({
    id,
    children,
    active,
    onClick,
    className
}: {
    id: string,
    children: React.ReactNode,
    active?: boolean,
    onClick?: () => void,
    className?: string
}) => {
    return (
        <button
            className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                active
                    ? "border-b-2 border-primary text-white"
                    : "text-white/60 hover:text-white/80",
                className
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
Tab.displayName = "Tab";

export const TabsContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("mt-2", className)}>
            {children}
        </div>
    );
};
TabsContent.displayName = "TabsContent";

export const TabPanel = ({
    id,
    children,
    active,
    className
}: {
    id: string,
    children: React.ReactNode,
    active?: boolean,
    className?: string
}) => {
    if (!active) return null;
    return (
        <div className={cn("", className)}>
            {children}
        </div>
    );
};
TabPanel.displayName = "TabPanel";