import { useGetMembers } from "@/features/members/api/use-get-members";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { WorkspaceSection } from "./workspace-section";
import { UserItem } from "./user-item";

export const WorkspaceSidebarMembers = () => {
    const workspaceId = useWorkspaceId();
    const memberId = useMemberId();

    const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });

    if (membersLoading) {
        return (
            <WorkspaceSection label="Direct Messages" hint="New direct message">
                 {/* Skeleton or empty */}
                 <></>
            </WorkspaceSection>
        )
    }

    return (
        <WorkspaceSection
            label="Direct Messages"
            hint="New direct message"
        >
            {members?.map((item) => (
                <UserItem
                    key={item._id}
                    id={item._id}
                    label={item.user.name}
                    image={item.user.image}
                    variant={item._id === memberId ? "active" : "default"}
                />
            ))}
        </WorkspaceSection>
    );
};
