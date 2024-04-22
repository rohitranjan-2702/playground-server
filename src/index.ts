import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import cors from "cors";
//@ts-ignore => someone fix this
import { fork, IPty } from "node-pty";
import path from "path";
import { PseudoTerminal } from "./pseudoTerminal";
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

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

let socket: Socket | null = null;

let term = fork(SHELL, [], {
  cols: 100,
  name: "xterm",
  //   cwd: path.join(__dirname, `../../../workspace`),
  cwd: ".",
});

term.on("data", (data: any) => {
  if (socket) socket.emit("data", Buffer.from(data, "utf-8"));
});

io.on("connection", (s: Socket) => {
  socket = s;
  console.log(`Socket connected: ${socket.id}`);
  const pgId = socket.handshake.query.roomId as string;
  console.log(pgId);

  socket.on("data", (data) => {
    term.write(data);
  });

  socket.on("disconnect", () => (socket = null));
});

// const pseudoTerminal = new PseudoTerminal();

// io.on("connection", async (socket) => {
//   console.log(`Socket connected: ${socket.id}`);
//   const pgId = socket.handshake.query.roomId as string;

//   if (!pgId) {
//     socket.disconnect();
//     pseudoTerminal.clear(socket.id);
//     return;
//   }

//   socket.on("createTerminal", async () => {
//     pseudoTerminal.createPty(socket.id, pgId, (data, id) => {
//       socket.emit("terminal", {
//         data: Buffer.from(data, "utf-8"),
//       });
//     });
//   });

//   socket.on(
//     "terminalData",
//     async ({ data }: { data: string; terminalId: number }) => {
//       pseudoTerminal.write(socket.id, data);
//     }
//   );
// });

app.get("/", (req, res) => {
  res.send("Server Running fine!");
});

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
  console.log(`server listening on port:${port}`);
});
