import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { addQuestion, addReply } from "../../api/productService";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const ProductDetailsANA = ({ productId, qaData, sellerId, authUser }) => {
  const axiosPrivate = useAxiosPrivate();
  const [chatList, setChatList] = useState(qaData || []);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  const currentUserId = authUser?.id;

  const isSeller =
    currentUserId && sellerId?._id && currentUserId === sellerId._id;

  const isLoggedIn = authUser?.accessToken;

  const maskBidderName = (name) => {
    if (!name || name.length <= 4) return name;
    return name.substring(0, 4) + "***";
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

  const handleSendQuestion = async () => {
    if (!newMessage.trim()) return;

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để gửi câu hỏi.");
      return;
    }

    try {
      setSending(true);
      const response = await addQuestion(
        productId,
        newMessage.trim(),
        "public",
        axiosPrivate
      );
      setChatList(response.chat);
      setNewMessage("");
      toast.success("Gửi câu hỏi thành công!");
    } catch (error) {
      console.error("Error sending question:", error);
      toast.error("Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async (chatId) => {
    if (!replyMessage.trim()) return;

    try {
      setSending(true);
      const response = await addReply(
        productId,
        chatId,
        replyMessage.trim(),
        axiosPrivate
      );
      setChatList(response.chat);
      setReplyTo(null);
      setReplyMessage("");
      toast.success("Trả lời thành công!");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(
        error.response?.data?.message || "Gửi thất bại. Vui lòng thử lại."
      );
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
                      {maskBidderName(item.sendId?.fullName)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(item.time)}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-800 mb-2">{item.message}</p>

                  {/* Only show reply button to seller */}
                  {item.reply?.message && (
                    <div className="mt-3 border-l-2 border-blue-400 pl-4 bg-blue-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-semibold">
                          Seller
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(item.reply.time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">
                        {item.reply.message}
                      </p>
                    </div>
                  )}

                  {/* Seller Reply */}
                  {isSeller && !item.reply?.message && (
                    <>
                      {replyTo !== item._id ? (
                        // Nút "Trả lời"
                        <button
                          onClick={() => {
                            setReplyTo(item._id);
                            setReplyMessage("");
                          }}
                          className="mt-2 flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                          disabled={sending}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Trả lời</span>
                        </button>
                      ) : (
                        // Inline Reply Box
                        <div className="mt-3 border-l-2 border-blue-400 pl-4 bg-blue-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-blue-600">
                              Trả lời câu hỏi
                            </span>
                            <button
                              onClick={() => {
                                setReplyTo(null);
                                setReplyMessage("");
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              disabled={sending}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !sending) {
                                  handleSendReply(item._id);
                                }
                              }}
                              placeholder="Nhập câu trả lời..."
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              disabled={sending}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSendReply(item._id)}
                              disabled={!replyMessage.trim() || sending}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {sending ? "Đang gửi..." : "Gửi"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
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
          {!isLoggedIn && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm text-gray-700 mb-2">
                Bạn cần đăng nhập để đặt câu hỏi
              </p>
              <a
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Đăng nhập ngay
              </a>
            </div>
          )}

          {isLoggedIn && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !sending) {
                      handleSendQuestion();
                    }
                  }}
                  placeholder="Viết câu hỏi của bạn..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                  disabled={sending}
                />
                <button
                  onClick={handleSendQuestion}
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsANA;
