// src/components/ChatInterface.jsx
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL; // <-- use env variable

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: input,
      });

      const botMessage = { role: "bot", content: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">🍽️ FoodWise Chat</h2>

      <div className="h-96 overflow-y-auto border p-3 rounded-md bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-2 p-2 rounded-md ${
              msg.role === "user"
                ? "bg-blue-100 text-right"
                : "bg-green-100 text-left"
            }`}
          >
            <span className="font-semibold">
              {msg.role === "user" ? "You: " : "FoodWise: "}
            </span>
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-500 italic">Thinking...</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>

      <div className="flex mt-4 gap-2">
        <input
          type="text"
          className="flex-1 border rounded-md p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about food, diet, or nutrition..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
