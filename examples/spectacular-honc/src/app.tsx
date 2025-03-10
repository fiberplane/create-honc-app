import { useEffect, useState, useRef } from "react";
import { ChatInterface } from "./components/agent-ui/AIAgent";
import { Button } from "./components/ui/button";

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
      <nav className="bg-background border-b border-b-gray-200 dark:border-b-gray-700 h-[40px] px-4 py-1 flex justify-between items-center sticky top-0 left-0 right-0 z-10">
        <h1 className="text-md font-bold">Spectacular Honc</h1>
        <Button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full bg-transparent hover:bg-transparent"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </Button>
      </nav>
      <ChatInterface />
    </div>
  );
}
