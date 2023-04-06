import React, { useState, createContext, useEffect } from "react";
import { api } from "../utils/axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = (props) => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");

  const handleLogin = async (user, pass) => {
    const res = await api.post("/login", {
      username: user,
      password: pass,
    });

    const { username, token } = res.data.data;

    setUsername(username);
    setToken(token);
  };

  const handleSignUp = async (user, pass) => {
    const res = await api.post("/register", {
      username: user,
      password: pass,
    });

    const { username, token } = res.data.data;

    setUsername(username);
    setToken(token);
  };

  const handleLogout = async () => {
    setUsername("");
    setToken("");
  };

  const verifyUser = async () => {
    const res = await api.post(
      "/verify",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    try {
      const resAdmin = await api.post(
        "/verifyAdmin",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resAdmin.status === 200) {
        setAdmin(true);
      }
    } catch (error) {
      console.log("🚀 ~ file: authContext.jsx:69 ~ verifyUser ~ error:", error);
    }

    if (res.status === 200) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    if (token === "") {
      navigate("/login");
    } else {
      verifyUser();
    }
  }, [token]);

  useEffect(() => {
    if (token === "") {
      navigate("/login");
    } else {
      verifyUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        username,
        token,
        admin,
        handleLogin,
        handleLogout,
        handleSignUp,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
