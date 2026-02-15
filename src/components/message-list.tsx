import { GetMessageReturnType } from "@/features/messages/api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Message } from "./message";
import { ChannelHero } from "./channel-hero";
import { useState, useMemo, useRef, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { Loader } from "lucide-react";
import { ConversationHero } from "./conversation-hero";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useAtomValue } from "jotai";
import { pendingMessagesAtom } from "@/features/messages/store/pending-messages";

const TIME_THRESHOLD = 5;

interface MessageListProps {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: "channel" | "thread" | "conversation";
  data: GetMessageReturnType | undefined;
  loadMore: () => void;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  channelId?: Id<"channels">;
  conversationId?: Id<"conversations">;
  parentMessageId?: Id<"messages">;
  header?: React.ReactNode;
}

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
};

type ItemType = "message" | "date_separator" | "channel_hero" | "conversation_hero";

interface ListItem {
  type: ItemType;
  id: string; // Unique ID for key
  message?: GetMessageReturnType[number];
  dateLabel?: string;
  isCompact?: boolean;
  isOptimistic?: boolean;
}

export const MessageList = ({
  memberName,
  memberImage,
  channelName,
  channelCreationTime,
  variant,
  data,
  loadMore,
  canLoadMore,
  isLoadingMore,
  channelId,
  conversationId,
  parentMessageId,
  header,
}: MessageListProps) => {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  
  const pendingMessages = useAtomValue(pendingMessagesAtom);

  const pendingMessagesForContext = useMemo(() => {
    return pendingMessages.filter((msg) => {
        if (channelId && msg.channelId === channelId) return true;
        if (conversationId && msg.conversationId === conversationId) return true;
        if (parentMessageId && msg.parentMessageId === parentMessageId) return true;
        return false;
    });
  }, [pendingMessages, channelId, conversationId, parentMessageId]);
  
  // Create a flat list of items (channel hero, dates, messages)
  const items = useMemo(() => {
    if (!data) return [];
    
    const list: ListItem[] = [];
    const reversedData = [...data].reverse(); // Oldest first for rendering
    
    // Add Channel/Conversation Hero at the beginning if no more to load
    if (!canLoadMore) {
      if (variant === "channel" && channelName && channelCreationTime) {
        list.push({
            type: "channel_hero",
            id: "channel-hero",
        });
      } else if (variant === "conversation") {
        list.push({
            type: "conversation_hero",
            id: "conversation-hero",
        });
      }
    }

    let lastDateKey = "";

    // Helper to process messages
    const processMessage = (message: any, isOptimistic = false) => {
        const creationTime = message._creationTime || message.createdAt;
        const date = new Date(creationTime);
        const dateKey = format(date, "yyyy-MM-dd");

        // Add date separator if date changes
        if (dateKey !== lastDateKey) {
            list.push({
            type: "date_separator",
            id: `date-${dateKey}`,
            dateLabel: formatDateLabel(dateKey),
            });
            lastDateKey = dateKey;
        }

        let isCompact = false;
        
        const lastItem = list[list.length - 1];
        if (lastItem && lastItem.type === "message" && lastItem.message) {
            const prevMessage: any = lastItem.message;
            const prevCreationTime = prevMessage._creationTime || prevMessage.createdAt;
            
            if (
                prevMessage.user?._id === message.user?._id &&
                differenceInMinutes(
                    new Date(creationTime),
                    new Date(prevCreationTime)
                ) < TIME_THRESHOLD
            ) {
                isCompact = true;
            }
        }
        
        if(lastItem && lastItem.type === "date_separator") {
            isCompact = false;
        }

        list.push({
            type: "message",
            id: message._id || message.id, // Handle optimistic ID
            message,
            isCompact,
            isOptimistic,
        });
    };

    // 1. Process Real Messages
    reversedData.forEach((message) => {
        processMessage(message);
    });
    
    // 2. Process Pending Messages (Append to end)
    pendingMessagesForContext.forEach((msg) => {
        const optimisticMessage: any = {
            ...msg,
            _id: msg.id as Id<"messages">,
            _creationTime: msg.createdAt,
            image: msg.previewUrl, // Use pre-generated URL
            reactions: [],
            updatedAt: undefined,
            threadCount: 0,
            threadImage: undefined,
            threadTimestamp: undefined,
            threadName: undefined,
        };
        
        processMessage(optimisticMessage, true);
    });

    return list;
  }, [data, canLoadMore, variant, channelName, channelCreationTime, pendingMessagesForContext]);

  return (
    <div className="flex-1 flex flex-col pb-4 h-full"> 
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%", width: "100%" }}
        data={items}
        initialTopMostItemIndex={items.length - 1}
        followOutput="auto"
        startReached={() => {
             if(canLoadMore && !isLoadingMore) {
                loadMore();
             }
        }}
        overscan={{ main: 500, reverse: 500 }}
        itemContent={(index, item) => {
          if (item.type === "channel_hero") {
             return <ChannelHero name={channelName || "Channel"} creationTime={channelCreationTime || Date.now()} />;
          }
          if (item.type === "conversation_hero") {
             return <ConversationHero name={memberName} image={memberImage} />;
          }
          if (item.type === "date_separator") {
            return (
              <div className="text-center my-2 relative">
                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                  {item.dateLabel}
                </span>
              </div>
            );
          }
          if (item.type === "message" && item.message) {
             const message = item.message;
             return (
               <div className={item.isOptimistic ? "opacity-70 pointer-events-none" : ""}>
               <Message
                key={message._id}
                id={message._id}
                memberId={message.memberId}
                authorImage={message.user.image}
                authorName={message.user.name}
                isAuthor={message.memberId === currentMember?._id}
                reactions={message.reactions}
                body={message.body}
                image={message.image}
                updatedAt={message.updatedAt}
                createdAt={message._creationTime}
                isEditing={editingId === message._id}
                setEditingId={setEditingId}
                isCompact={item.isCompact}
                hideThreadButton={variant === "thread"}
                threadCount={message.threadCount}
                threadImage={message.threadImage}
                threadTimestamp={message.threadTimestamp}
              />
              </div>
             )
          }
          return null;
        }}
        components={{
            Header: () => (
                <div>
                    {isLoadingMore && (
                        <div className="text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300"/>
                        <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                          <Loader className="size-4 animate-spin"/>
                        </span>
                        </div>
                    )}
                    {header}
                </div>
            )
        }}
      />
    </div>
  );
};