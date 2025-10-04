'use client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type Assistant = {
  id: string;
  name: string;
  model: string;
  instructions: string;
};

type AssistantsStore = {
  assistants: Assistant[];
  loading: boolean;
  error: string | null;
  fetchAssistants: () => Promise<void>;
  createAssistant: (payload: Omit<Assistant, 'id'>) => Promise<void>;
  updateAssistant: (id: string, payload: Omit<Assistant, 'id'>) => Promise<void>;
  deleteAssistant: (id: string) => Promise<void>;
};

export const useAssistantsStore = create<AssistantsStore>()(
  devtools((set, get) => ({
    assistants: [],
    loading: false,
    error: null,

    // Fetch all assistants
    fetchAssistants: async () => {
      set({ loading: true, error: null });
      try {
        const res = await fetch('/api/openai-assistant');
        const data = await res.json();
        set({ assistants: data.data || [], loading: false });
      } catch (err) {
        console.error(err);
        set({ error: 'Failed to fetch assistants', loading: false });
      }
    },

    // Create new assistant
    createAssistant: async (payload) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch('/api/openai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const newAssistant = await res.json();
        set((state) => ({ assistants: [...state.assistants, newAssistant], loading: false }));
      } catch (err) {
        console.error(err);
        set({ error: 'Failed to create assistant', loading: false });
      }
    },

    // Update assistant by ID
    updateAssistant: async (id, payload) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`/api/openai-assistant/${id}`, {
          method: 'POST', // or PUT depending on your API
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        set((state) => ({
          assistants: state.assistants.map((a) => (a.id === id ? updated : a)),
          loading: false,
        }));
      } catch (err) {
        console.error(err);
        set({ error: 'Failed to update assistant', loading: false });
      }
    },

    // Delete assistant by ID
    deleteAssistant: async (id) => {
      set({ loading: true, error: null });
      try {
        await fetch(`/api/openai-assistant/${id}`, { method: 'DELETE' });
        set((state) => ({
          assistants: state.assistants.filter((a) => a.id !== id),
          loading: false,
        }));
      } catch (err) {
        console.error(err);
        set({ error: 'Failed to delete assistant', loading: false });
      }
    },
  }))
);
