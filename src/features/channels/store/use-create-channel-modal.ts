import {atom, useAtom} from "jotai";

const modalState = atom(false);

export const useCreateChannelModal = () => {
    return useAtom(modalState);
};

export const useCreateChannelModalState = () => {
    const [state] = useAtom(modalState);
    return state;
};

export const useCreateChannelModalActions = () => {
    const [, setState] = useAtom(modalState);
    return {
        open: () => setState(true),
        close: () => setState(false),
        toggle: () => setState(prev => !prev),
        setOpen: setState
    };
};