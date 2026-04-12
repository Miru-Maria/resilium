import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Context ──────────────────────────────────────────────────────────────────

interface TabsContextValue {
  activeTab: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

// ─── Tabs (Root) ──────────────────────────────────────────────────────────────

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
    const activeTab = value !== undefined ? value : internalValue;

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (value === undefined) setInternalValue(newValue);
        onValueChange?.(newValue);
      },
      [value, onValueChange],
    );

    return (
      <TabsContext.Provider value={{ activeTab, onValueChange: handleValueChange }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

// ─── TabsList ─────────────────────────────────────────────────────────────────

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
TabsList.displayName = "TabsList";

// ─── TabsTrigger ──────────────────────────────────────────────────────────────

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    const isActive = ctx?.activeTab === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        data-state={isActive ? "active" : "inactive"}
        aria-selected={isActive}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
          className,
        )}
        onClick={(e) => {
          ctx?.onValueChange(value);
          onClick?.(e);
        }}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

// ─── TabsContent ──────────────────────────────────────────────────────────────

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    const isActive = ctx?.activeTab === value;
    const shouldShow = isActive || !!forceMount;

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        hidden={!shouldShow}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        {...props}
      >
        {shouldShow ? children : null}
      </div>
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
