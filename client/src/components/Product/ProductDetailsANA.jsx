import React, { useState } from "react";
import { ThumbsUp, MessageCircle, MoreHorizontal } from "lucide-react";

const ProductDetailsANA = () => {
  const currentUserId = "12345678"; // Example current user ID
  const receiveId = "87654321"; // Example seller ID

  const [chatList, setChatList] = useState([
    {
      id: 1,
      type: "public",
      sendId: "12345678",
      receiveId: "87654321",
      time: "2025-11-18 08:10:00",
      message: "Hello, I am interested in your product. Is it still available?",
      replies: [],
    },
    {
      id: 2,
      type: "public",
      sendId: "87654321",
      receiveId: "12345678",
      time: "2025-11-18 08:12:00",
      message:
        "Yes, the product is still available. Let me know if you have any questions.",
      replies: [],
    },
    {
      id: 3,
      type: "public",
      sendId: "12345678",
      receiveId: "87654321",
      time: "2025-11-18 08:15:00",
      message:
        "Great! Can you provide more details about its condition and any accessories included?",
      replies: [
        {
          id: 31,
          sendId: "87654321",
          message:
            "The product is in excellent condition with all accessories.",
          time: "2025-11-18 08:20:00",
        },
      ],
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const anonymizeId = (id) => {
    if (id.length < 7) return id;
    return `${id.slice(0, 3)}xxxx${id.slice(-3)}`;
  };

  const formatDateTime = (time) => {
    const date = new Date(time);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (replyTo) {
      setChatList(
        chatList.map((item) =>
          item.id === replyTo
            ? {
                ...item,
                replies: [
                  ...item.replies,
                  {
                    id: Date.now(),
                    sendId: currentUserId,
                    message: newMessage,
                    time: new Date().toISOString(),
                  },
                ],
              }
            : item
        )
      );
      setReplyTo(null);
    } else {
      setChatList([
        ...chatList,
        {
          id: Date.now(),
          type: "public",
          sendId: currentUserId,
          receiveId: receiveId,
          message: newMessage,
          time: new Date().toISOString(),
          replies: [],
        },
      ]);
    }
    setNewMessage("");
  };

  return (
    <div className="py-6 overflow-y-auto max-h-[120vh]">
      <div className="max-w-4xl mx-auto">
        {/* Comment List */}
        <div className="space-y-6">
          {chatList.map((item) => (
            <div key={item.id} className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">👤</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {anonymizeId(item.sendId)}
                  </span>
                  {item.sendId === receiveId && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      Seller
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDateTime(item.time)}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-800 mb-2">{item.message}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <button
                    onClick={() => setReplyTo(item.id)}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Trả lời</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-800">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Replies */}
                {item.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                    {item.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 text-xs">👤</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs">
                              {anonymizeId(reply.sendId)}
                            </span>
                            {reply.sendId === receiveId && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                Seller
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDateTime(reply.time)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-800">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show more replies */}
                {item.replies.length > 2 && (
                  <button className="text-xs text-blue-600 mt-2 hover:underline">
                    Xem tất cả {item.replies.length} phản hồi
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="mt-8 border-t pt-4">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
              <span>Đang trả lời...</span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-blue-600 hover:underline"
              >
                Hủy
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Viết câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsANA;
