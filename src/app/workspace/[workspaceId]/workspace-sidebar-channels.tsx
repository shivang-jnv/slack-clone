import { HashIcon } from "lucide-react";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannelModal, useCreateChannelModalActions } from "@/features/channels/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { WorkspaceSection } from "./workspace-section";
import { SidebarItem } from "./sidebar-item";

interface WorkspaceSidebarChannelsProps {
    isAdmin: boolean;
}

export const WorkspaceSidebarChannels = ({ isAdmin }: WorkspaceSidebarChannelsProps) => {
    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();
    // const [_open, setOpen] = useCreateChannelModal(); // Old
    const { setOpen } = useCreateChannelModalActions(); // New: No re-render on state change

    const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });

    if (channelsLoading) {
        // Optional: Render skeletal loading state here if needed
        return (
            <WorkspaceSection
                label="Channels"
                hint="New Channels"
            >
                {/* Skeleton or empty */}
                <></>
            </WorkspaceSection>
        );
    }

    return (
        <WorkspaceSection
            label="Channels"
            hint="New Channels"
            onNew={isAdmin ? () => setOpen(true) : undefined}
        >
            {channels?.map((item) => (
                <SidebarItem
                    key={item._id}
                    icon={HashIcon}
                    label={item.name}
                    id={item._id}
                    variant={channelId === item._id ? "active" : "default"}
                />
            ))}
        </WorkspaceSection>
    );
};
