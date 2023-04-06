import { useContext, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { AuthContext } from "./context/authContext";
import { api } from "./utils/axios";

function App() {
  const { admin, username, token, handleLogout } = useContext(AuthContext);

  const [newChannel, setNewChannel] = useState("");
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);

  const getChannels = async () => {
    const res = await api.get("/channels", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res);
    setChannels(res.data);
  };

  const saveChannel = async () => {
    if (newChannel !== "") {
      const res = await api.post("/channel", {
        channelName: newChannel,
      });

      if (res.status === 201) {
        await getChannels();
        setNewChannel("");
      }
    }
  };

  const getMessages = async () => {
    const res = await api.get(`/messages/${selectedChannel}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setMessages(res.data);
  };

  const saveMessage = async () => {
    if (newMessage !== "" && selectedChannel !== null) {
      const res = await api.post(
        "/message",
        {
          message: newMessage,
          channel_id: selectedChannel,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        await getMessages();
        setNewMessage("");
      }
    }
  };

  const deleteChannel = async () => {
    const res = await api.delete(`/channel/${selectedChannel}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      await getChannels();
      setSelectedChannel(null);
    }
  };

  useEffect(() => {
    getChannels();
  }, []);

  useEffect(() => {
    getMessages();
  }, [selectedChannel]);

  return (
    <div className="flex flex-col ">
      <div className="my-2 flex justify-center gap-4 ">
        <p className="p-2 inline-block rounded bg-red-200">Hello, {username}</p>
        <button
          onClick={handleLogout}
          className="p-2 bg-black text-white rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex my-2 justify-center items-center gap-2">
        <label className="block">Select Channel</label>
        <select
          onChange={(e) => {
            setSelectedChannel(Number(e.target.value));
          }}
        >
          <option value="" disabled selected>
            Select Channel
          </option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex my-2 justify-center gap-2 items-center">
        <label className="">Create Channel</label>
        <input
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
        />
        <button
          className="p-2 bg-black text-white rounded"
          onClick={saveChannel}
        >
          Save Channel
        </button>
      </div>

      {admin && <button onClick={deleteChannel}>Delete Channel</button>}

      <div className="w-3/4 mx-auto bg-green-200 p-2 rounded">
        <div className="flex flex-col">
          {messages.map((message) => (
            <p className="p-1 my-1 bg-purple-100" key={message.id}>
              {message.username} says: {message.content}
            </p>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-grow"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="p-2  rounded bg-black text-white"
            onClick={saveMessage}
          >
            Save Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
