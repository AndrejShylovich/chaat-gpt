import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_HOST}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMessage = { role: "assistant", text: data.reply };
          console.log(messages, input, loading, botMessage)

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Ошибка соединения с сервером" },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          height: 400,
          overflowY: "auto",
          marginBottom: 12,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                background: msg.role === "user" ? "#e9f5ff" : "#f1f1f1",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div>ChatGPT печатает...</div>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage} disabled={loading}>
          →
        </button>
      </div>
    </div>
  );
}