import { atom } from "jotai";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

export type PendingMessage = {
    id: string; // Temporary ID
    body: string;
    image?: File | null;
    previewUrl?: string;
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">;
    parentMessageId?: Id<"messages">;
    workspaceId: Id<"workspaces">;
    memberId: Id<"members">; // Current user's member ID
    user: Doc<"users">; // Current user's details for display
    createdAt: number;
};

export const pendingMessagesAtom = atom<PendingMessage[]>([]);
