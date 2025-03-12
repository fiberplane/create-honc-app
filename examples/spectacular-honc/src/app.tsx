import { useEffect, useState, useRef } from "react";
import { ChatInterface } from "./components/agent-ui/AIAgent";
import { Button } from "./components/ui/button";
import { SpecModal } from "./components/specifications";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    // Check localStorage first, default to dark if not found
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "dark" | "light") || "dark";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Apply theme class on mount and when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll to bottom on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    scrollToBottom();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border/10 h-[48px] px-6 py-2 flex justify-between items-center sticky top-0 left-0 right-0 z-10 backdrop-blur-sm bg-opacity-80">
        <h1 className="text-lg font-semibold text-foreground tracking-wide">✨ <span className="text-primary">Spectacular</span> <span className="text-secondary">Honc</span></h1>
        <div className="flex gap-2">
          <SpecModal />
          <Button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-background/50 hover:bg-muted shadow-none cursor-pointer transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "🌸"}
          </Button>
        </div>
      </nav>

      <ChatInterface />
    </div>
  );
}
