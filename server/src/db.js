const mysql = require("mysql2/promise");

const connection = async () => {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db",
  });
};

const main = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db",
  });

  await connection.execute(`
  CREATE TABLE IF NOT EXISTS USERS (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  );`);

  await connection.execute(`
      CREATE TABLE IF NOT EXISTS CHANNELS (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        PRIMARY KEY (id)
      );
    `);

  await connection.execute(`
  CREATE TABLE IF NOT EXISTS MESSAGES (
    id INT NOT NULL AUTO_INCREMENT,
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    channel_id INT NOT NULL,
    reply_to_message_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES USERS(id),
    FOREIGN KEY (channel_id) REFERENCES CHANNELS(id) ON DELETE CASCADE
    );
    `);

  const [rows, fields] = await connection.execute(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA= 'db'
        AND TABLE_NAME= 'MESSAGES'
        AND COLUMN_NAME='reply_to_message_id'  
    `);

  if (rows.length === 0) {
    await connection.execute(`
          ALTER TABLE MESSAGES
              ADD CONSTRAINT fk_message
              FOREIGN KEY (reply_to_message_id)
              REFERENCES MESSAGES(id);
          `);
  }

  await connection.end();
};

const createChannel = async (channel_name) => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db",
  });

  await connection.execute(
    `
      INSERT INTO CHANNELS (name) VALUES (?)
    `,
    [channel_name]
  );

  await connection.end();
};

const getChannels = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db",
  });

  const [rows, fields] = await connection.execute(`
      SELECT * FROM CHANNELS;
    `);

  return rows;
};

const findUser = async (username) => {
  const conn = await connection();

  const [rows, field] = await conn.execute(
    `
        SELECT * FROM USERS WHERE username = ?
    `,
    [username]
  );

  await conn.end();

  return rows;
};

const createUser = async (username, password) => {
  const conn = await connection();

  const [rows, field] = await conn.execute(
    `
        INSERT INTO USERS (username, password)
        VALUES (? ,?)
    `,
    [username, password]
  );

  await conn.end();

  return rows;
};

const saveMessage = async (user_id, channel_id, message) => {
  const conn = await connection();
  const [rows, field] = await conn.execute(
    `
        INSERT INTO MESSAGES (content, user_id, channel_id)
        VALUES (?, ?, ?)
    `,
    [message, user_id, channel_id]
  );

  await conn.end();
  return rows;
};

const getmessages = async (channel_id) => {
  const conn = await connection();
  const [rows, field] = await conn.execute(
    `
      SELECT m.*, u.* FROM MESSAGES AS m
      INNER JOIN USERS AS u ON m.user_id = u.id
      WHERE m.channel_id = ?;
    `,
    [channel_id]
  );

  await conn.end();

  return rows;
};

const deleteChannel = async (channel_id) => {
  const conn = await connection();

  const [rows, fields] = await conn.execute(
    `
    DELETE FROM CHANNELS WHERE id = ? 
  `,
    [channel_id]
  );

  await conn.end();

  return rows;
};

module.exports = {
  main,
  createChannel,
  getChannels,
  findUser,
  createUser,
  saveMessage,
  getmessages,
  deleteChannel,
};
