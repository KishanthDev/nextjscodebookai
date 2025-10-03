"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BotSelector from "@/components/agent-training/SelectBots";

type Block = { id: string; type: string; message: string; next?: string; buttons?: { label: string; action: string }[]; };
type Flow = { _id?: string; flow_id: string; title: string; blocks: Block[]; };

export default function FlowBuilder() {
    const [flows, setFlows] = useState<Flow[]>([]);
    const [botId, setBotId] = useState<string>("");
    const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
    const [newFlowTitle, setNewFlowTitle] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => { if (botId) loadFlows(); }, [botId]);

    const loadFlows = async () => {
        const res = await fetch(`/api/agent-training/flows?botId=${botId}`);
        const data = await res.json();
        setFlows(data);
    };

    const createFlow = async () => {
        if (!botId) { setMessage("❌ Please select a bot first."); return; }
        const flow: Flow = {
            flow_id: newFlowTitle.toLowerCase().replace(/\s+/g, "_"),
            title: newFlowTitle,
            blocks: [{ id: "start", type: "start", message: "New flow start message" }],
        };
        const res = await fetch("/api/agent-training/flows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...flow, botId }), // ✅ attach botId
        });
        const saved = await res.json();
        setFlows([...flows, saved]);
        setSelectedFlow(saved);
        setNewFlowTitle("");
    };

    // Add block
    const addBlock = () => {
        if (!selectedFlow) return;
        const newBlock: Block = {
            id: `block_${Date.now()}`,
            type: "send_message",
            message: "New message",
        };
        setSelectedFlow({
            ...selectedFlow,
            blocks: [...selectedFlow.blocks, newBlock],
        });
    };

    // Save flow
    const saveFlow = async () => {
        if (!botId || !selectedFlow) return;
        await fetch(`/api/agent-training/flows/${selectedFlow._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...selectedFlow, botId }), // ✅ attach botId
        });
        alert("Flow saved!");
    };

    return (
        <div className="grid grid-cols-4 gap-4 p-6">
            <div className="col-span-1">
                <BotSelector onSelect={setBotId} /> {/* ✅ dropdown */}
                {flows.map((flow) => (
                    <Card
                        key={flow._id}
                        onClick={() => setSelectedFlow(flow)}
                        className={`cursor-pointer ${selectedFlow?._id === flow._id ? "border-blue-500" : ""
                            }`}
                    >
                        <CardContent className="p-2">{flow.title}</CardContent>
                    </Card>
                ))}

                <div className="flex gap-2 mt-4">
                    <Input
                        placeholder="New flow title"
                        value={newFlowTitle}
                        onChange={(e) => setNewFlowTitle(e.target.value)}
                    />
                    <Button onClick={createFlow}>Add</Button>
                </div>
            </div>

            {/* Editor */}
            <div className="col-span-3">
                {selectedFlow ? (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">{selectedFlow.title}</h2>

                        {selectedFlow.blocks.map((block, i) => (
                            <Card key={block.id}>
                                <CardContent className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={block.type}
                                            onChange={(e) => {
                                                const newBlocks = [...selectedFlow.blocks];
                                                newBlocks[i].type = e.target.value;
                                                setSelectedFlow({ ...selectedFlow, blocks: newBlocks });
                                            }}
                                        />
                                        <Textarea
                                            value={block.message}
                                            onChange={(e) => {
                                                const newBlocks = [...selectedFlow.blocks];
                                                newBlocks[i].message = e.target.value;
                                                setSelectedFlow({ ...selectedFlow, blocks: newBlocks });
                                            }}
                                        />
                                    </div>

                                    {/* Render buttons if block type is send_button_list */}
                                    {block.type === "send_button_list" && (
                                        <div className="space-y-2">
                                            {block.buttons?.map((btn, j) => (
                                                <div key={j} className="flex gap-2">
                                                    <Input
                                                        placeholder="Label"
                                                        value={btn.label}
                                                        onChange={(e) => {
                                                            const newBlocks = [...selectedFlow.blocks];
                                                            newBlocks[i].buttons![j].label = e.target.value;
                                                            setSelectedFlow({ ...selectedFlow, blocks: newBlocks });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Action"
                                                        value={btn.action}
                                                        onChange={(e) => {
                                                            const newBlocks = [...selectedFlow.blocks];
                                                            newBlocks[i].buttons![j].action = e.target.value;
                                                            setSelectedFlow({ ...selectedFlow, blocks: newBlocks });
                                                        }}
                                                    />
                                                </div>
                                            ))}

                                            <Button
                                                onClick={() => {
                                                    const newBlocks = [...selectedFlow.blocks];
                                                    if (!newBlocks[i].buttons) newBlocks[i].buttons = [];
                                                    newBlocks[i].buttons.push({ label: "New Button", action: "" });
                                                    setSelectedFlow({ ...selectedFlow, blocks: newBlocks });
                                                }}
                                            >
                                                + Add Button
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}


                        <Button onClick={addBlock}>+ Add Block</Button>
                        <Button onClick={saveFlow} className="ml-4">
                            Save Flow
                        </Button>
                    </div>
                ) : (
                    <p>Select a flow to edit</p>
                )}
            </div>
        </div>
    );
}
