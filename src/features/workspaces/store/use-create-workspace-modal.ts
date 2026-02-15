import {atom, useAtom} from "jotai";

const modalState = atom(false);

export const useCreateWorkspaceModal = () => {
    return useAtom(modalState);
};

export const useCreateWorkspaceModalState = () => {
    const [state] = useAtom(modalState);
    return state;
};

export const useCreateWorkspaceModalActions = () => {
    const [, setState] = useAtom(modalState);
    return {
        open: () => setState(true),
        close: () => setState(false),
        toggle: () => setState(prev => !prev),
        setOpen: setState
    };
};