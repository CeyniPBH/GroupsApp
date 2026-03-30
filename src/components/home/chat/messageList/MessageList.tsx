import Message, { type MessageItem } from "../message/Message";

interface MessageListProps {
  messages: MessageItem[];
}


const MessagesList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex flex-col p-4">
      {messages.map((msg) => (
        <Message
          key={msg.id}
          id={msg.id}
          content={msg.content}
          isMine={msg.isMine}
          senderName={msg.senderName}
        />
      ))}
    </div>
  );
};

export default MessagesList;