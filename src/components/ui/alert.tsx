import * as React from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const baseAlertClass =
  "relative w-full rounded-lg border px-4 py-3 text-sm flex flex-col gap-2 items-start [&>svg]:size-4 [&>svg]:text-current";

const variantClassMap: Record<AlertVariant, string> = {
  default: "bg-card text-card-foreground",
  destructive:
    "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
};

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(baseAlertClass, variantClassMap[variant], className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("min-h-4 font-medium tracking-tight w-full", className)}
      style={{ writingMode: "horizontal-tb", display: "block", whiteSpace: "normal" }}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground block text-sm [&_p]:leading-relaxed w-full",
        className,
      )}
      style={{ writingMode: "horizontal-tb", display: "block", whiteSpace: "normal" }}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
