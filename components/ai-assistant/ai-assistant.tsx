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

const assistants = ["Nexa", "Luma", "AssistIQ", "Milo"];
const users = ["user1", "user2", "user3", "user4"];
const pairs: UserPair[] = assistants.map((ai, i) => ({ user: users[i], ai }));

export default function AIAssistantPage() {
    const { messages, inputs, setInputs, sendMessage } = useMQTTChat(pairs, brokerUrl, false);

    return (
        <div className="grid grid-cols-2 gap-4 p-4 items-start">
            {pairs.map(({ user, ai }) => {
                const key = `${user}_${ai}`;
                return (
                    <Accordion key={key} type="multiple" className="border rounded p-2 h-full">
                        <AccordionItem value={key} className="flex flex-col h-full">
                            <AccordionTrigger className="flex justify-between items-center">
                                {ai} ↔ {user}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-2 mt-2 h-[350px]">
                                <ChatWindow messages={messages[key] || []} perspective="assistant" />
                                <div className="flex mt-2">
                                    <input
                                        value={inputs[key] || ""}
                                        onChange={(e) =>
                                            setInputs((prev) => ({ ...prev, [key]: e.target.value }))
                                        }
                                        className="border p-1 flex-1 rounded"
                                    />
                                    <button
                                        onClick={() => sendMessage(user, ai, "agent")}
                                        className="bg-green-500 text-white p-1 ml-2 rounded"
                                    >
                                        Send as Agent
                                    </button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            })}
        </div>
    );
}