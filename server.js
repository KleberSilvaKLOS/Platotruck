const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Configuração do Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Public"))); // <-- Corrigido

// Configuração da sessão
app.use(
  session({
    secret: "segredo-muito-seguro", // troque por algo mais aleatório
    resave: false,
    saveUninitialized: false,
  })
);

// Senha única
const SENHA_ADMIN = "12345"; // 🔒 troque por uma senha segura!

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "index.html"));
});

// Página de login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "login.html"));
});

// Verifica a senha enviada
app.post("/login", (req, res) => {
  const { senha } = req.body;
  if (senha === SENHA_ADMIN) {
    req.session.autenticado = true;
    return res.redirect("/admin");
  }
  res.send("<p>Senha incorreta! <a href='/login'>Tentar novamente</a></p>");
});

// Middleware que protege a área administrativa
function proteger(req, res, next) {
  if (req.session.autenticado) {
    return next();
  }
  res.redirect("/login");
}

// Rota protegida
app.get("/admin", proteger, (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "admin.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Inicia o servidor
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
