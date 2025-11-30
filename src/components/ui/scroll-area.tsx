"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      className={cn("relative overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// 互換用にダミーの ScrollBar をエクスポートしておく（現在は未使用）
function ScrollBar() {
  return null;
}

export { ScrollArea, ScrollBar };
