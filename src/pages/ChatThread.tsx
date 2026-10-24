import { useCallback, useEffect, useState, type FormEvent } from "react";
import Button from "../components/ui/Button";
import type { AppSupabaseClient } from "../data/supabase-client";
import { listMessages, sendMessage, type RequestMessage } from "../data/marketplace-service";

function ChatThread({
  client,
  requestId,
  userId,
}: {
  client: AppSupabaseClient;
  requestId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMessages(await listMessages(client, requestId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load messages.");
    }
  }, [client, requestId]);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    try {
      await sendMessage(client, requestId, userId, body);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send the message.");
    }
  }

  return (
    <div className="mt-3 rounded-control border border-line bg-canvas p-3">
      <ul aria-label="Messages" className="max-h-60 space-y-2 overflow-y-auto">
        {messages.length === 0 && <li className="text-caption text-muted">No messages yet.</li>}
        {messages.map((message) => (
          <li
            className={`max-w-[85%] rounded-control px-3 py-2 text-label ${
              message.sender_id === userId
                ? "ml-auto bg-primary text-white"
                : "bg-surface text-ink"
            }`}
            key={message.id}
          >
            {message.body}
          </li>
        ))}
      </ul>
      {error && (
        <p className="mt-2 text-caption text-danger" role="alert">
          {error}
        </p>
      )}
      <form className="mt-3 flex gap-2" onSubmit={submit}>
        <input
          aria-label="Message"
          className="min-h-10 flex-1 rounded-control border border-line bg-surface px-3 text-label"
          maxLength={2000}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          value={draft}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

export default ChatThread;

