"use client";
import React from "react";
import { useChat } from "ai/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
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

  const { input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });
  return (
    <div>
      <div>headers</div>
      <div>messages</div>
      <div>
        <form onSubmit={handleSubmit} className="">
          <Input value={input} onChange={handleInputChange} className="" />
          <Button>send</Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
