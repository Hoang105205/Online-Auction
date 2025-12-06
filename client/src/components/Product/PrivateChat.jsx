import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { toast } from "react-toastify";
import { getProductPrivateQA, addPrivateChat } from "../../api/productService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const PrivateChat = ({ productId, authUser, sellerId, highestBidderId }) => {
  const axiosPrivate = useAxiosPrivate();
  const [isOpen, setIsOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = authUser?.id;
  const isSeller = currentUserId === sellerId;
  const isHighestBidder = currentUserId === highestBidderId;

  const hasUnreadMessage = () => {
    if (chatList.length === 0) return false;
    const lastMessage = chatList[chatList.length - 1];
    return lastMessage.sendId._id !== currentUserId;
  };

  // Fetch private Q&A when chat opens
  useEffect(() => {
    if (isOpen) {
      fetchPrivateQA();
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchPrivateQA = async () => {
    try {
      setLoading(true);
      const data = await getProductPrivateQA(productId, axiosPrivate);
      setChatList(data);
    } catch (error) {
      console.error("Error fetching private Q&A:", error);
      toast.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      // Check if there's a question to reply to (for seller)
      const response = await addPrivateChat(
        productId,
        newMessage.trim(),
        "private",
        axiosPrivate
      );

      setChatList(response.chat);

      setNewMessage("");
      toast.success("Gửi thành công!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const formatDateTime = (time) => {
    const date = new Date(time);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getOtherUserName = () => {
    if (isSeller) return "Người mua";
    return "Người bán";
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open private chat"
        >
          <MessageCircle className="w-6 h-6" />
          {hasUnreadMessage() && (
            <span className="absolute top-0 right-0 bg-red-500 rounded-full w-3 h-3 border-2 border-white"></span>
          )}
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div
          className="fixed bottom-2 right-2 left-2 z-50 bg-white rounded-lg shadow-2xl
                      h-[calc(100vh-1rem)]
                      sm:bottom-4 sm:right-4 sm:left-auto sm:h-[500px]
                      sm:w-[340px]
                      md:w-[360px] md:h-[550px]
                      lg:w-[380px] lg:h-[600px]
                      flex flex-col"
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-sm">Chat riêng tư</h3>
                <p className="text-xs opacity-90">{getOtherUserName()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : chatList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">Chưa có tin nhắn nào</p>
                <p className="text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              <>
                {/* ✅ Simple chat messages - no reply structure */}
                {chatList.map((chat) => (
                  <div
                    key={chat._id}
                    className={`flex ${
                      chat.sendId._id === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        chat.sendId._id === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm break-words">{chat.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatDateTime(chat.time)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !sending && handleSendMessage()
                }
                placeholder="Nhập tin nhắn..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivateChat;
