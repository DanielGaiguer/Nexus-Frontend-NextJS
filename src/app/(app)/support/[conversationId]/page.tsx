"use client";

import { useParams } from "next/navigation";

import { SupportChatWindow } from "@/components/support/support-chat-window";

export default function SupportConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  return (
    <SupportChatWindow conversationId={Number(conversationId)} side="user" />
  );
}
