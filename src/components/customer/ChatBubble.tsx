import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  timestamp?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, sender }) => {
  const isUser = sender === 'user';

  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
        isUser 
          ? "bg-primary text-white rounded-tr-none" 
          : "bg-[#F5F0E8] text-[#191C19] rounded-tl-none border border-[#E8E8E4]"
      )}>
        {message}
      </div>
    </div>
  );
};

export default ChatBubble;
