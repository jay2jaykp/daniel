import express from "express";
import cors from "cors";
import { prismaClient } from "./prisma";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("hello world");
});

app.get("/channel", async (req, res) => {
  const result = await prismaClient.channel.findMany();
  res.send(result);
});

app.post("/channel", async (req, res) => {
  const { channelName } = req.body;
  const result = await prismaClient.channel.create({
    data: {
      name: channelName,
    },
  });
  res.send(result);
});

app.post("/create_user", async (req, res) => {});

app.post("/message", async (req, res) => {
  const { user_id, channel_id, message } = req.body;
  const result = await prismaClient.messages.create({
    data: {
      content: message,
      user_ref: {
        connect: {
          id: user_id,
        },
      },
      channel_ref: {
        connect: {
          id: channel_id,
        },
      },
    },
  });
  res.send(result);
});

app.get("/messages/:channel_id", async (req, res) => {
  const { channel_id } = req.params;
  const result = await prismaClient.messages.findMany({
    where: {
      channel_id: Number(channel_id),
    },
  });
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
