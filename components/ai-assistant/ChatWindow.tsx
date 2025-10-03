'use client';

import React from 'react';

interface Message {
    sender: string;
    text: string;
    senderType: "user" | "ai" | "agent";
}

interface ChatWindowProps {
    messages: Message[];
    perspective: "user" | "assistant";
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, perspective }) => {
    return (
        <div className="border h-96 overflow-auto p-2 mb-2 flex flex-col gap-1">
            {messages.map((m, i) => {
                let isMine = false;
                let bubbleClasses = "bg-gray-200 text-black"; // default for "others"

                if (perspective === "user") {
                    // user page → only user is right
                    if (m.senderType === "user") {
                        isMine = true;
                        bubbleClasses = "bg-blue-500 text-white";
                    }
                } else {
                    // assistant page
                    if (m.senderType === "agent") {
                        isMine = true;
                        bubbleClasses = "bg-green-500 text-white";
                    } else if (m.senderType === "ai") {
                        // bot messages also on right, highlighted
                        isMine = true;
                        bubbleClasses =
                            "bg-purple-500 text-white font-semibold border border-purple-600";
                    }
                }

                return (
                    <div
                        key={i}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                        <span
                            className={`inline-block px-3 py-1 rounded-lg max-w-xs break-words ${bubbleClasses}`}
                        >
                            {/* Always show sender for AI/Agent (not for self user) */}
                            {(m.senderType !== "user" || perspective === "assistant") && (
                                <strong>{m.sender}: </strong>
                            )}
                            {m.text}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
