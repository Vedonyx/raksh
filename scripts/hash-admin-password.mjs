import { randomBytes, scryptSync } from "node:crypto";

if (!process.stdin.isTTY || !process.stdin.setRawMode) {
  console.error("Run in an interactive terminal so the password stays out of shell history.");
  process.exit(1);
}

process.stdout.write("Admin password (input hidden): ");
process.stdin.setRawMode(true);
process.stdin.resume();
let password = "";
process.stdin.on("data", (chunk) => {
  for (const char of chunk.toString("utf8")) {
    if (char === "\r" || char === "\n") {
      process.stdin.setRawMode(false);
      process.stdout.write("\n");
      const salt = randomBytes(24).toString("hex");
      console.log(`${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
      process.stdin.pause();
      return;
    }
    if (char === "\u0003") process.exit(130);
    if (char === "\u007f") password = password.slice(0, -1);
    else password += char;
  }
});
