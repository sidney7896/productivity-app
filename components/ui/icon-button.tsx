"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  disabled?: boolean;
  side?: "top" | "bottom" | "left" | "right";
}

export function IconButton({
  icon,
  tooltip,
  onClick,
  className,
  variant = "ghost",
  size = "sm",
  disabled,
  side = "top",
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={variant}
            size={size}
            onClick={onClick}
            disabled={disabled}
            className={className}
            aria-label={tooltip}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
