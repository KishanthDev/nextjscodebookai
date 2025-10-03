// stores/chatStore.ts
import { create } from "zustand";

export type Message = { sender: string; text: string; senderType: "user" | "ai" | "agent"; };

interface ChatState {
    messages: Record<string, Message[]>;
    addMessage: (key: string, message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: {},
    addMessage: (key, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [key]: [...(state.messages[key] || []), message],
            },
        })),
}));
