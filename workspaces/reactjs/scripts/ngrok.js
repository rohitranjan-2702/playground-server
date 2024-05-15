import ngrok from "ngrok";

(async function () {
  // Establish connectivity
  const listener = await ngrok.connect({
    addr: 3003,
    authtoken_from_env: true,
  });

  // Output ngrok url to console
  console.log(`Ingress established at: ${listener}`);
})();
