const net = require("node:net");

const host = "127.0.0.1";

const services = [
  { name: "Authentication", port: 9099 },
  { name: "Firestore", port: 8080 },
  { name: "Functions", port: 5001 },
];

const checkPort = ({ name, port }) =>
  new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    let settled = false;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      socket.destroy();

      if (error) {
        reject(new Error(`${name} emulator: ${error.message}`));
        return;
      }

      console.log(`PASS ${name}: ${host}:${port}`);
      resolve();
    };

    socket.setTimeout(5000);
    socket.once("connect", () => finish());
    socket.once("timeout", () => finish(new Error("Connection timed out")));
    socket.once("error", finish);
  });

Promise.all(services.map(checkPort)).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
