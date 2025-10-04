'use client';

import { useEffect, useState } from 'react';
import { useAssistantsStore, Assistant } from '@/stores/assistantsStore';

export default function AssistantsUI() {
  const { assistants, loading, error, fetchAssistants, createAssistant, updateAssistant, deleteAssistant } =
    useAssistantsStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Assistant, 'id'>>({ name: '', model: '', instructions: '' });

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateAssistant(editingId, formData);
      setEditingId(null);
    } else {
      await createAssistant({ ...formData });
    }
    setFormData({ name: '', model: '', instructions: '' });
  };

  const handleEdit = (assistant: Assistant) => {
    setEditingId(assistant.id);
    setFormData({ name: assistant.name, model: assistant.model, instructions: assistant.instructions });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assistants CRUD UI</h1>

      {/* Error */}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Model"
          className="w-full p-2 border rounded"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          required
        />
        <textarea
          placeholder="Instructions"
          className="w-full p-2 border rounded"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {editingId ? 'Update Assistant' : 'Create Assistant'}
        </button>
        {editingId && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 ml-2"
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', model: '', instructions: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Assistants List */}
      <ul className="space-y-3">
        {assistants.map((assistant) => (
          <li
            key={assistant.id}
            className="p-4 border rounded flex justify-between items-start bg-gray-50 dark:bg-gray-800"
          >
            <div>
              <p className="font-semibold">{assistant.name}</p>
              <p className="text-sm text-gray-600">{assistant.model}</p>
              <p className="text-sm">{assistant.instructions}</p>
            </div>
            <div className="space-x-2">
              <button
                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                onClick={() => handleEdit(assistant)}
              >
                Edit
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                onClick={() => deleteAssistant(assistant.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
