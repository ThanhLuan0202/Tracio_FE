import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { groupService } from "../../services/groupService";

const GroupChat = () => {
  const { groupId } = useParams();
  const [message, setMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const response = await groupService.getGroupById(groupId);
        setGroupInfo(response);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch group information");
        setLoading(false);
      }
    };

    fetchGroupInfo();
  }, [groupId]);

  const messages = [
    {
      id: 1,
      user: "Duy Hào",
      avatar: "https://i.pravatar.cc/150?img=1",
      message: "Đạp xe ko ae ?",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      user: "Thành đô",
      avatar: "https://i.pravatar.cc/150?img=2",
      message: "Thời m ơi lười quá",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      user: "Luân db",
      avatar: "https://i.pravatar.cc/150?img=3",
      message: "T k có xe",
      timestamp: "10:35 AM",
    },
    {
      id: 4,
      user: "Nam nguyễn",
      avatar: "https://i.pravatar.cc/150?img=4",
      message: "Where???",
      timestamp: "10:36 AM",
    },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Add logic to send message
      setMessage("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Group Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4">
              <img
                src={groupInfo?.image || "https://via.placeholder.com/150"}
                alt={groupInfo?.title}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {groupInfo?.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {groupInfo?.members} members
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                List Route
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                Create Route
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3">
                  <img
                    src={msg.avatar}
                    alt={msg.user}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <h3 className="font-medium text-gray-900">{msg.user}</h3>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t bg-white"
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
