import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";

export const SignUp = () => {
  const { handleSignUp } = useContext(AuthContext);
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
            await handleSignUp(usernameValue, passwordValue);
          }}
          className="p-2 border-2 rounded"
        >
          Sign Up
        </button>
        <Link to="/signup" className="p-2 border-2 rounded">
          Go to Login Page
        </Link>
      </div>
    </div>
  );
};
