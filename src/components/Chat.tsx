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
    <div id="message-container">
      <div>Chat</div>
      <div>
        <MessageList messages={messages} />
      </div>
      <div>
        <form
          onSubmit={handleSubmit}
          className="flex sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            className="w-full"
          />
          <Button>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
