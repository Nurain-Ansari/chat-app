import { FiSend } from "react-icons/fi";

export default function MessageInput({
  text,
  setText,
  sendMessage,
  handleTyping,
  handleKeyDown,
}: {
  text: string;
  setText: (text: string) => void;
  sendMessage: () => void;
  handleTyping: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}) {
  // const debouncedText = useDebounce(text, 500);

  // // Only trigger typing indicator after debounce
  // useEffect(() => {
  //   if (debouncedText.trim()) {
  //     handleTyping();
  //   }
  // }, [debouncedText, handleTyping]);
  return (
    <div className="bg-white border-t p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex space-x-2"
      >
        <input
          type="text"
          className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim()}
          title="Send message"
          type="submit"
        >
          <FiSend className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
