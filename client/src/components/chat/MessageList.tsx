import { useMemo } from "react";
import type { Message } from "../../types/interface";
import { format, isToday, isYesterday, parseISO, isSameDay } from "date-fns";
import Skeleton from "react-loading-skeleton";
import { BsCheck2All, BsCheck2 } from "react-icons/bs";

export default function MessageList({
  messages,
  loading,
  error,
  currUserId,
  messagesEndRef,
}: {
  messages: Message[];
  loading: boolean;
  error: string;
  currUserId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const groupedMessages = useMemo(() => {
    if (!messages) return [];

    return messages.reduce((acc, message) => {
      if (!message.createdAt) return acc;

      let msgDate: Date;
      try {
        msgDate = parseISO(message.createdAt);
      } catch {
        return acc;
      }

      const lastGroup = acc[acc.length - 1];
      if (
        lastGroup &&
        lastGroup.senderId._id === message.senderId._id &&
        isSameDay(lastGroup.date, msgDate) &&
        Math.abs(
          msgDate.getTime() -
            parseISO(
              lastGroup.messages[lastGroup.messages.length - 1].createdAt!
            ).getTime()
        ) < 600000 // 10 mins
      ) {
        lastGroup.messages.push(message);
      } else {
        acc.push({
          senderId: message.senderId,
          date: msgDate,
          messages: [message],
        });
      }

      return acc;
    }, [] as { senderId: Message["senderId"]; date: Date; messages: Message[] }[]);
  }, [messages]);

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const getMessageTime = (date: Date) => format(date, "h:mm a");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <Skeleton
                width={Math.floor(Math.random() * 200) + 100}
                height={40}
                className={`rounded-lg ${
                  i % 2 === 0 ? "rounded-br-none" : "rounded-bl-none"
                }`}
              />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : groupedMessages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          No messages yet. Start a conversation!
        </div>
      ) : (
        groupedMessages.map((group, groupIndex) => {
          const isCurrentUser = group.senderId._id === currUserId;
          const showDateHeader =
            groupIndex === 0 ||
            !isSameDay(
              parseISO(groupedMessages[groupIndex - 1].messages[0].createdAt!),
              group.date
            );

          return (
            <div key={groupIndex} className="space-y-1">
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDateHeader(group.date)}
                  </span>
                </div>
              )}

              <div
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex flex-col space-y-1 max-w-xs lg:max-w-md ${
                    isCurrentUser ? "items-end" : "items-start"
                  }`}
                >
                  {group.messages.map((message, msgIndex) => (
                    <div key={msgIndex} className="space-y-1">
                      {/* Bubble */}
                      <div
                        className={`p-3 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <div className="break-words">{message.content}</div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span
                            className={`text-xs ${
                              isCurrentUser ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {message.createdAt
                              ? getMessageTime(parseISO(message.createdAt))
                              : ""}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs">
                              {message.status === "read" ? (
                                <BsCheck2All className="text-blue-100" />
                              ) : message.status === "delivered" ? (
                                <BsCheck2All className="text-gray-300" />
                              ) : (
                                <BsCheck2 className="text-gray-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reactions */}
                      {message.reactions?.length ? (
                        <div
                          className={`flex gap-1 mt-1 text-sm ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.reactions.map((reaction, i) => (
                            <span
                              key={i}
                              className="bg-white shadow px-2 py-1 rounded-full flex items-center gap-1"
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-xs text-gray-500">
                                {reaction.user}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
