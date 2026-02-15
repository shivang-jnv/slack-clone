import { useRef, useState } from "react"
import { toast } from "sonner";
import Quill from "quill"
import dynamic from "next/dynamic"

import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { compressImage } from "@/lib/image-compression";
import { useSetAtom } from "jotai";
import { pendingMessagesAtom } from "@/features/messages/store/pending-messages";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useCurrentUser } from "@/features/auth/api/use-current-user";

const Editor = dynamic(() => import("@/components/editor"), {ssr: false});

interface ChatInputProps {
  placeholder: string; 
};

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage"> | undefined;
}

export const ChatInput = ({placeholder}:ChatInputProps) => {
  const [isPending, setIsPending] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const editorRef = useRef<Quill | null>(null);

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

    const {mutate: generateUploadUrl} = useGenerateUploadUrl();
    const { mutate: createMessage} = useCreateMessage();

  const setPendingMessages = useSetAtom(pendingMessagesAtom);
  const { data: member } = useCurrentMember({ workspaceId });
  const { data: user } = useCurrentUser();

  const handleSubmit = async({
    body,
    image
  }: {
    body: string;
    image: File | null
  }) => {
    const tempId = crypto.randomUUID();
    const previewUrl = image ? URL.createObjectURL(image) : undefined;
    
    try{
      setIsPending(true);
      editorRef?.current?.enable(false);

      // Optimistic Update
      if (member && user) {
          setPendingMessages(prev => [...prev, {
              id: tempId,
              body,
              image,
              previewUrl,
              memberId: member._id,
              user: user,
              workspaceId,
              channelId,
              createdAt: Date.now(),
          }]);
      }

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        body,
        image: undefined,
      };

      if(image){
        const url = await generateUploadUrl({}, {throwError: true});

        if(!url) {
          throw new Error("Url not found");
        };

        const compressedImage = await compressImage(image);

        const result = await fetch(url, {
          method: "POST",
          headers: {"Content-type": compressedImage.type},
          body: compressedImage,
        });

        if (!result.ok ){
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();

        values.image = storageId;

      }

      await  createMessage(values,{  throwError: true  });
  
      setEditorKey((prevKey) => prevKey + 1);
    } catch (error){
        toast.error("Failed to send message");
    } finally{
        setIsPending(false);
        editorRef?.current?.enable(true);
        // Remove pending message
        setPendingMessages(prev => prev.filter(msg => msg.id !== tempId));
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
   
  }
  

  


  return (
    <div className="px-5 w-full">
      <Editor 
      key={editorKey}
      placeholder={placeholder}
      onSubmit={handleSubmit}
      disabled={isPending}
      innerRef={editorRef}
      />
    </div>
  )
}