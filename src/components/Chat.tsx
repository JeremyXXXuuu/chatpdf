"use client";
import React from "react";
import { useChat } from "ai/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import MessageList from "./MessageList";
import { Send } from "lucide-react";

type Props = {
  chatId: string;
};

const Chat = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await axios.post<Message[]>(`/api/get-messages`, {
        chatId,
      });
      return res.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div id="message-container" className="flex flex-col h-screen">
      <div className="h-10 m-auto text-lg">Chat</div>
      <div className="flex-grow overflow-auto">
        <MessageList messages={messages} />
      </div>
      <div className="">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 inset-x-0 px-2 py-4 bg-white"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-gray-600">
            <Send className="h-4 w-6" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
