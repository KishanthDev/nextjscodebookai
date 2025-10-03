'use client';
import { useMQTTChat, UserPair } from "./useMQTT";
import { ChatWindow } from "./ChatWindow";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const brokerUrl = "wss://broker.hivemq.com:8000/mqtt";

const userPairs: UserPair[] = [
    { user: "user1", ai: "Nexa" },
    { user: "user2", ai: "Luma" },
    { user: "user3", ai: "AssistIQ" },
    { user: "user4", ai: "Milo" },
];

export default function UserPage() {
    const { messages, inputs, setInputs, sendMessage, loading } = useMQTTChat(userPairs, brokerUrl, true);

    return (
        <div className="grid grid-cols-2 gap-4 p-4 items-start">
            {userPairs.map(({ user, ai }) => {
                const key = `${user}_${ai}`;
                return (
                    <Accordion key={key} type="multiple" className="border rounded p-2 h-full">
                        <AccordionItem value={key} className="flex flex-col h-full">
                            <AccordionTrigger className="flex justify-between items-center">
                                {user} ↔ {ai}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-2 mt-2 h-[350px]">
                                <ChatWindow messages={messages[key] || []} perspective="user" />
                                <div className="flex flex-col gap-2 mt-2">
                                    {loading[key] && (
                                        <div className="text-gray-500 text-sm">
                                            Waiting for {ai}'s response...
                                        </div>
                                    )}
                                    <div className="flex">
                                        <input
                                            value={inputs[key] || ""}
                                            onChange={(e) =>
                                                setInputs((prev) => ({ ...prev, [key]: e.target.value }))
                                            }
                                            className="border p-1 flex-1 rounded"
                                            disabled={loading[key]}
                                        />
                                        <button
                                            onClick={() => sendMessage(user, ai, "user")}
                                            className={`p-1 ml-2 rounded text-white ${loading[key]
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600"
                                                }`}
                                            disabled={loading[key]}
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            })}
        </div>
    );
}