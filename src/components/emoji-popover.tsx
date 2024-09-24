import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import React, { useState } from "react";

interface EmojiPopoverProps {
  children: React.ReactNode;
  hint?: string;
  onEmojiSelect: (emoji: any) => void;
};

export const EmojiPopover = ({
  children,
  hint = "Emoji",
  onEmojiSelect,
}: EmojiPopoverProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltioOpen, setTooltipOpen] = useState(false);

  const onSelect = (emoji:any) => {
    onEmojiSelect(emoji);
    setPopoverOpen(false);

    setTimeout(()=> {
      setTooltipOpen(false);
    },500)
  };

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip
        open={tooltioOpen}
        onOpenChange={setTooltipOpen}
        delayDuration={50}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
            {children}
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent className="bg-black text-white border-white/5">
            <p className="font-medium text-xs">{hint}</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-full p-0 border-none shadow-none">
          <Picker data={data} onEmojiSelect={onSelect} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
