import { useAgent } from "agents-sdk/react";
import { useAgentChat } from "agents-sdk/ai-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, Trash2 } from "lucide-react";
import { AIMarkdown } from "./AIMarkdown";

export function ChatInterface() {
  // Connect to the agent
  const agent = useAgent({
    agent: "dialogue-agent",
  });

  // Set up the chat interaction
  const { messages, input, handleInputChange, handleSubmit, clearHistory } =
    useAgentChat({
      agent,
      maxSteps: 5,
    });

  return (
    <div className="flex flex-col h-[calc(100vh-40px)]">
      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                message.role === "user"
                  ? "bg-amber-700/80 text-white rounded-tr-none"
                  : "bg-transparent border rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap markdown-content">
                <AIMarkdown content={message.content} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-medium text-gray-400">
            {messages.length > 0 ? `${messages.length} messages` : "No messages"}
          </div>
          {messages.length > 0 && (
            <Button
              onClick={clearHistory}
              variant="outline"
              size="sm"
              className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 text-xs flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear chat
            </Button>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-gray-700 focus-visible:ring-gray-600 text-white placeholder:text-gray-500"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-amber-800 hover:bg-amber-700 text-white rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
