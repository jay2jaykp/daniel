import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";

export const Login = () => {
  const { handleLogin } = useContext(AuthContext);
  const [usernameValue, setUsernameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  return (
    <div className="flex justify-center">
      <div>
        <div className="flex gap-3 justify-between">
          <label>Username</label>
          <input
            value={usernameValue}
            onChange={(e) => setUsernameValue(e.target.value)}
            className="border-2 border-black"
          />
        </div>
        <div className="flex gap-3 justify-between">
          <label>Password</label>
          <input
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            className="border-2 border-black"
          />
        </div>
        <button
          onClick={async () => {
            await handleLogin(usernameValue, passwordValue);
          }}
          className="p-2 border-2 rounded"
        >
          Login
        </button>
        <Link to="/signup" className="p-2 border-2 rounded">
          Go to Sign up Page
        </Link>
      </div>
    </div>
  );
};
