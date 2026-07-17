import { createContext } from "svelte";

type newListDialogContext = {
	open: (tab: "new" | "load") => void;
};

export const [getNewListDialogContext, setNewListDialogContext] = createContext<newListDialogContext>();

export const [getJoinedContext, setJoinedContext] = createContext<{ joined?: boolean }>();
