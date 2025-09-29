import { IoPersonOutline } from "react-icons/io5";

type Props = {
  title?: string;
  description?: string;
};

export default function EmptyChat({
  title = "Select a friend to chat",
  description = "Choose a friend from the list to start messaging or search for someone to connect with.",
}: Props) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <IoPersonOutline className="mx-auto text-5xl text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
