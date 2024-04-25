//@ts-ignore
import { fork, IPty } from "node-pty";
import path from "path";

const SHELL = "bash";

export class PseudoTerminal {
  private sessions: { [id: string]: { terminal: IPty; pgId: string } } = {};

  constructor() {
    this.sessions = {};
  }

  createPty(
    id: string,
    pgId: string,
    onData: (data: string, id: number) => void
  ) {
    let term = fork(SHELL, [], {
      cols: 100,
      name: "xterm",
      // cwd: path.join(__dirname, `../tmp/${pgId}`),
      cwd: "../workspace/nodejs",
    });

    term.on("data", (data: string) => onData(data, term.pid));
    this.sessions[id] = {
      terminal: term,
      pgId,
    };
    term.on("exit", () => {
      delete this.sessions[term.pid];
    });
    console.log(this.sessions);
    return term;
  }

  write(terminalId: string, data: string) {
    this.sessions[terminalId]?.terminal.write(data);
  }

  clear(terminalId: string) {
    this.sessions[terminalId].terminal.kill();
    delete this.sessions[terminalId];
  }
}
