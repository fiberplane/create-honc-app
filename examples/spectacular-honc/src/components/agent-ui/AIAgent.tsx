import { useAgent } from "agents-sdk/react";
import { useAgentChat } from "agents-sdk/ai-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, Trash2 } from "lucide-react";
import { AIMarkdown } from "./AIMarkdown";
import type { UIMessage } from "ai";

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

  console.log("Messages", messages);

  return (
    <div className="flex flex-col h-[calc(100vh-40px)]">
      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            Start chatting to create a software specification!
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/10 px-4 pt-1 pb-3 bg-card">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-medium text-muted-foreground">
            {messages.length > 0 ? `${messages.length} messages` : "No messages"}
          </div>
          {messages.length > 0 && (
            <Button
              onClick={clearHistory}
              variant="outline"
              size="sm"
              className="p-1 text-muted-foreground hover:text-foreground border-border/10 hover:border-border hover:bg-muted/50 text-xs flex items-center gap-1.5 transition-colors duration-200"
            >
              <Trash2 className="h-3 w-3" />
              Clear chat
            </Button>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-3"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-background/50 border-border/10 focus-visible:ring-primary/30 text-foreground placeholder:text-muted-foreground/60 rounded-xl py-5"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const toolInvocations = message.parts.filter(part => part.type === "tool-invocation")
  const generateSpecInvocations = toolInvocations.filter(invocation => invocation.toolInvocation.toolName === "generate_implementation_plan")
  return (
    <>
      {generateSpecInvocations.length > 0 && <SpecCreated title={generateSpecInvocations[0].toolInvocation.args?.title} />}
      <div
        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
          }`}
      >
        <div
          className={`rounded-xl px-3 py-2 max-w-[85%] flex items-center ${message.role === "user"
              ? "bg-primary/80 text-primary-foreground"
              : "bg-card"
            }`}
        >
          <div className="whitespace-pre-wrap markdown-content flex items-center">
            <AIMarkdown content={message.content} />
          </div>
        </div>
      </div>
    </>
  )
}

function SpecCreated({ title }: { title: string }) {
  return (
    <div
      className={"flex justify-start"}
    >
      <div
        className={"rounded-xl px-3 py-2 max-w-[85%] flex items-center bg-card"}
      >
        Create Specification: {title}
      </div>
    </div>
  )
}
