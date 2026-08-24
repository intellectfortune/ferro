"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendTeamMessage, type TeamChatActionState } from "@/lib/actions/team-chat";
import type { TeamMessage } from "@/lib/queries/team-chat";
import type { TeamChatChannel } from "@/types/database";

const initialState: TeamChatActionState = { error: null };

const CHANNELS: { id: TeamChatChannel; label: string }[] = [
  { id: "general", label: "General" },
  { id: "bookings", label: "Bookings" },
  { id: "maintenance", label: "Maintenance" },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function ChatFeed({
  companyId,
  currentProfileId,
  memberNames,
  initialMessages,
}: {
  companyId: string;
  currentProfileId: string;
  memberNames: Record<string, string>;
  initialMessages: TeamMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [activeChannel, setActiveChannel] = useState<TeamChatChannel>("general");
  const [state, formAction, pending] = useActionState(sendTeamMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`team-chat-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          const row = payload.new as TeamMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  const channelMessages = useMemo(
    () => messages.filter((m) => m.channel === activeChannel),
    [messages, activeChannel]
  );

  const previewByChannel = useMemo(() => {
    const map = new Map<TeamChatChannel, TeamMessage>();
    for (const message of messages) {
      map.set(message.channel, message);
    }
    return map;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [channelMessages.length, activeChannel]);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-line bg-line md:grid md:grid-cols-[220px_1fr]">
      <div className="flex gap-1.5 overflow-x-auto border-b border-line bg-surface-2 p-2.5 md:flex-col md:gap-0.5 md:space-y-0.5 md:overflow-y-auto md:border-b-0 md:border-r">
        {CHANNELS.map((ch) => {
          const preview = previewByChannel.get(ch.id);
          const isSelf = preview?.author_id === currentProfileId;
          const previewText = preview
            ? `${isSelf ? "You" : (memberNames[preview.author_id] ?? "Someone")}: ${preview.body}`
            : "No messages yet";
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChannel(ch.id)}
              className={`flex-shrink-0 rounded-[9px] px-3 py-2.5 text-left transition md:w-full ${
                activeChannel === ch.id ? "bg-surface" : "hover:bg-surface/50"
              }`}
            >
              <div className="text-[13px] font-semibold">{ch.label}</div>
              <div className="mt-0.5 max-w-[160px] truncate text-[11.5px] text-muted md:max-w-none">
                {previewText}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-surface-2">
        <div className="flex-1 overflow-y-auto p-5">
          {channelMessages.length === 0 && (
            <p className="text-sm text-muted">
              No messages yet — say hello to the team.
            </p>
          )}
          {channelMessages.map((message) => {
            const isSelf = message.author_id === currentProfileId;
            const authorName = memberNames[message.author_id] ?? "Unknown";
            return (
              <div key={message.id} className={`mb-2.5 ${isSelf ? "text-right" : ""}`}>
                <div className="mb-1 text-[11px] text-muted">
                  {isSelf ? "You" : authorName} · {formatTime(message.created_at)}
                </div>
                <div
                  className={`inline-block max-w-[70%] rounded-[12px] px-3.5 py-2.5 text-left text-[13px] ${
                    isSelf
                      ? "bg-amber font-medium text-on-amber"
                      : "bg-surface text-paper"
                  }`}
                >
                  {message.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form
          ref={formRef}
          action={formAction}
          className="flex items-center gap-2.5 border-t border-line p-3.5"
        >
          <input type="hidden" name="channel" value={activeChannel} />
          <input
            name="body"
            placeholder="Message the team…"
            autoComplete="off"
            maxLength={4000}
            required
            className="flex-1 rounded-[9px] border border-line bg-surface px-3.5 py-2.5 text-[13px] outline-none focus:border-amber-text"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-[9px] bg-amber px-4 py-2.5 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
          >
            Send
          </button>
        </form>
        {state.error && (
          <p className="px-3.5 pb-3 text-sm text-red-400">{state.error}</p>
        )}
      </div>
    </div>
  );
}
