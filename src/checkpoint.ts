import { spawn } from "node:child_process";

export class GitCheckpointService {
  async create(projectRoot: string, message: string): Promise<void> {
    await this.run(projectRoot, ["add", "."]);
    await this.run(projectRoot, [
      "commit",
      "--allow-empty",
      "-m",
      message
    ]);
  }

  private async run(cwd: string, args: string[]): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("git", args, {
        cwd,
        shell: process.platform === "win32",
        stdio: "ignore"
      });

      child.on("error", reject);
      child.on("close", code => {
        if (code === 0) resolve();
        else reject(new Error(`git ${args.join(" ")} fallito con codice ${code}`));
      });
    });
  }
}
