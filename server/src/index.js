const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const {
  main,
  createChannel,
  getChannels,
  findUser,
  createUser,
  saveMessage,
  getmessages,
  deleteChannel,
} = require("./db");

dotenv.config();

const app = express();
const PORT = 5000;

// create database tables if not exists
main();

app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).send({
        message: "Missing Username and/or Password",
      });
    }

    // find if username already exists
    const existingUser = await findUser(username);

    if (existingUser.length > 0) {
      return res.status(400).send({
        message: "User already exists!",
      });
    }

    // encrypt password
    const encryptPassword = await bcrypt.hash(password, 10);

    // create user in database
    const user = await createUser(username, encryptPassword);
    // create token
    const token = jwt.sign(
      { user_id: user.insertId, username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    res.status(201).send({
      message: "User created",
      data: {
        username,
        token,
      },
    });
  } catch (error) {
    console.log("🚀 ~ file: index.js:23 ~ app.post ~ error:", error);
    res.sendStatus(500);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    const user = await findUser(username);

    if (user.length > 0 && (await bcrypt.compare(password, user[0].password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user[0].id, username },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // user
      return res.status(200).send({
        message: "Login successful",
        data: {
          username: user[0].username,
          token,
        },
      });
    } else {
      return res.status(400).send("Invalid Credentials");
    }
  } catch (error) {
    console.log("🚀 ~ file: index.js:81 ~ app.post ~ error:", error);
    res.sendStatus(500);
  }
});

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    console.log("🚀 ~ file: index.js:119 ~ authMiddleware ~ decoded:", decoded);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

const adminMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
    if (decoded.username === "admin") {
      return next();
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};

app.post("/verify", authMiddleware, async (req, res) => {
  res.sendStatus(200);
});

app.post("/verifyAdmin", adminMiddleware, async (req, res) => {
  res.sendStatus(200);
});

app.get("/channels", authMiddleware, async (req, res) => {
  try {
    const rows = await getChannels();
    res.send(rows);
  } catch (error) {
    console.log("🚀 ~ file: index.js:22 ~ app.get ~ error:", error);
    res.sendStatus(500);
  }
});

app.delete("/channel/:channel_id", adminMiddleware, async (req, res) => {
  const { channel_id } = req.params;
  try {
    const result = await deleteChannel(channel_id);
    return res.sendStatus(200);
  } catch (error) {
    console.log("🚀 ~ file: index.js:167 ~ app.delete ~ error:", error);
    return res.sendStatus(500);
  }
});

app.post("/channel", async (req, res) => {
  const { channelName } = req.body;
  try {
    await createChannel(channelName);
    res.sendStatus(201);
  } catch (error) {
    console.log("🚀 ~ file: index.js:30 ~ app.post ~ error:", error);
    res.sendStatus(500);
  }
});

app.post("/message", authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { channel_id, message } = req.body;
    const result = await saveMessage(user_id, channel_id, message);
    res.sendStatus(201);
  } catch (error) {
    console.log("🚀 ~ file: index.js:161 ~ app.post ~ error:", error);
    return res.sendStatus(500);
  }
  // res.send(result);
});

app.get("/messages/:channel_id", authMiddleware, async (req, res) => {
  const { channel_id } = req.params;
  const result = await getmessages(channel_id);
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
