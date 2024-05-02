import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { PseudoTerminal } from "./pseudoTerminal";
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { fetchDir, fetchFileContent, saveFile } from "./handleFiles";

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const SHELL = "bash";

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// let socket: Socket | null = null;

// io.on("connection", (s: Socket) => {
//   socket = s;

//   let term = fork(SHELL, [], {
//     cols: 100,
//     name: "xterm",
//     //   cwd: path.join(__dirname, `../../../workspace`),
//     cwd: ".",
//   });

//   term.on("data", (data: any) => {
//     if (socket) socket.emit("data", Buffer.from(data, "utf-8"));
//   });

//   console.log(`Socket connected: ${socket.id}`);
//   const pgId = socket.handshake.query.roomId as string;
//   console.log(pgId);

//   socket.on("data", (data) => {
//     term.write(data);
//   });

//   socket.on("disconnect", () => (socket = null));
// });

const pseudoTerminal = new PseudoTerminal();

io.on("connection", async (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  const pgId = socket.handshake.query.roomId as string;

  if (!pgId) {
    socket.disconnect();
    pseudoTerminal.clear(socket.id);
    return;
  }

  // load the files from the workspace
  socket.emit("loaded", {
    rootContent: await fetchDir(
      path.join(__dirname, `../../workspace/nodejs`),
      "."
    ),
  });

  socket.on("fetchDir", async (dir: string, callback) => {
    try {
      const dirPath = path.join(__dirname, `../../../workspace/${dir}`);
      const contents = await fetchDir(dirPath, dir);
      callback(contents);
    } catch (error) {
      console.error(`Error fetching directory: ${error}`);
      callback(error);
    }
  });

  socket.on(
    "fetchContent",
    async ({ path: filePath }: { path: string }, callback) => {
      try {
        const fullPath = path.join(
          __dirname,
          `../../workspace/nodejs/${filePath}`
        );
        const data = await fetchFileContent(fullPath);
        callback(data);
      } catch (error) {
        console.error(`Error fetching file content: ${error}`);
        callback(error);
      }
    }
  );

  socket.on(
    "updateContent",
    async ({ path: filePath, content }: { path: string; content: string }) => {
      const fullPath = path.join(
        __dirname,
        `../../workspace/nodejs/${filePath}`
      );
      await saveFile(fullPath, content);
    }
  );

  socket.on("createTerminal", async () => {
    pseudoTerminal.createPty(socket.id, pgId, (data, id) => {
      socket.emit("terminal", {
        data: Buffer.from(data, "utf-8"),
      });
    });
  });

  socket.on(
    "terminalData",
    async ({ data }: { data: string; terminalId: number }) => {
      pseudoTerminal.write(socket.id, data);
    }
  );
});

app.get("/server", (req, res) => {
  res.send("Server Running fine!");
});

app.get("/workspace", async (req, res) => {
  const dirPath = path.join(__dirname, `../../workspace/nodejs`);
  const contents = await fetchDir(dirPath, ".");
  res.send(contents);
});

app.get("/content", async (req, res) => {
  const fullPath = path.join(__dirname, `../../workspace/nodejs/index.js`);
  const data = await fetchFileContent(fullPath);
  res.send(data);
});

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
  console.log(`server listening on port:${port}`);
});
