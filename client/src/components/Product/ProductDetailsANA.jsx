import React, { useState } from "react";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import { addQuestion, addReply } from "../../api/productService";

const ProductDetailsANA = ({ productId, qaData, sellerId }) => {
  const currentUserId = "6922ec91a628dffaa2414479"; // Example current user ID

  const [chatList, setChatList] = useState(qaData || []);

  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);

  const anonymizeName = (fullName) => {
    if (!fullName || fullName.length < 7) return fullName || "Unknown";
    return `${fullName.slice(0, 3)}xxxx${fullName.slice(-3)}`;
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      if (replyTo) {
        const response = await addReply(productId, replyTo, newMessage.trim());

        setChatList(response.chat);
        setReplyTo(null);
      } else {
        const response = await addQuestion(
          productId,
          newMessage.trim(),
          "public"
        );
        setChatList(response.chat);
      }

      setNewMessage("");
      alert("Gửi thành công!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  if (!qaData) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">Đang tải câu hỏi...</p>
      </div>
    );
  }

  return (
    <div className="py-6 overflow-y-auto max-h-[120vh]">
      <div className="max-w-4xl mx-auto">
        {/* Comment List */}
        <div className="space-y-6">
          {chatList.length > 0 ? (
            chatList.map((item) => (
              <div key={item._id} className="flex gap-3">
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
                      {anonymizeName(item.sendId?.fullName)}
                    </span>
                    {item.sendId?._id === sellerId && (
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
                      onClick={() => setReplyTo(item._id)}
                      className="flex items-center gap-1 hover:text-blue-600"
                      disabled={sending}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Trả lời</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-800">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Replies */}
                  {item.replies && item.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                      {item.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 text-xs">👤</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs">
                                {anonymizeName(reply.sendId?.fullName)}
                              </span>
                              {reply.sendId?._id === sellerId && (
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
                  {item.replies && item.replies.length > 2 && (
                    <button className="text-xs text-blue-600 mt-2 hover:underline">
                      Xem tất cả {item.replies.length} phản hồi
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="mt-8 border-t pt-4">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
              <span>Đang trả lời...</span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-blue-600 hover:underline"
                disabled={sending}
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
                onKeyPress={(e) =>
                  e.key === "Enter" && !sending && handleSendMessage()
                }
                placeholder="Viết câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsANA;
