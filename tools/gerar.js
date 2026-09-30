// Gera as páginas: index.html, simulados.html e algoritmos/<slug>.html.
//   node tools/gerar.js
// O conteúdo de cada algoritmo fica em js/dados/<slug>.js; as páginas só
// carregam os scripts certos e o js/pagina.js monta tudo.
const fs = require("fs");
const path = require("path");
const RAIZ = path.join(__dirname, "..");
global.window = {};
require(path.join(RAIZ, "js/dados/indice.js"));
const INDICE = window.Guia.INDICE;
const todos = [].concat(...INDICE.map((g) => g.itens));
const ICONE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23112c2a'/%3E%3Ctext x='16' y='22' font-family='monospace' font-size='15' font-weight='700' fill='%2397efbd' text-anchor='middle'%3E%7B%20%7D%3C/text%3E%3C/svg%3E";
const BASE_JS = ["java.js", "util.js", "viz.js", "depurador.js", "exercicios.js", "dados/indice.js"];

function pagina({ titulo, descricao, base, attrs, dados }) {
  const js = BASE_JS.concat(dados.map((d) => "dados/" + d + ".js"), ["pagina.js"]);
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="${descricao}">
<link rel="icon" href="${ICONE}">
<link rel="stylesheet" href="${base}css/guia.css">
</head>
<body ${attrs} data-base="${base}">
<noscript><p style="padding:20px">Este guia precisa de JavaScript: os algoritmos rodam no navegador.</p></noscript>
${js.map((j) => `<script src="${base}js/${j}"></script>`).join("\n")}
</body>
</html>
`;
}

fs.mkdirSync(path.join(RAIZ, "algoritmos"), { recursive: true });
let n = 0;
for (const a of todos) {
  const temDados = fs.existsSync(path.join(RAIZ, "js/dados", a.slug + ".js"));
  fs.writeFileSync(path.join(RAIZ, "algoritmos", a.slug + ".html"), pagina({
    titulo: `${a.titulo} · Algoritmos em movimento`, descricao: a.resumo.replace(/\*\*/g, ""), base: "../",
    attrs: `data-pagina="algoritmo" data-algo="${a.slug}"`, dados: temDados ? [a.slug] : []
  }));
  n++;
}
const comDados = todos.filter((a) => fs.existsSync(path.join(RAIZ, "js/dados", a.slug + ".js"))).map((a) => a.slug);
fs.writeFileSync(path.join(RAIZ, "index.html"), pagina({ titulo: "Algoritmos em movimento", descricao: "Técnicas de Programação: cada algoritmo rodando linha por linha, com perguntas e simulados.", base: "", attrs: 'data-pagina="inicio"', dados: [] }));
fs.writeFileSync(path.join(RAIZ, "simulados.html"), pagina({ titulo: "Simulados · Algoritmos em movimento", descricao: "Simule, complete e escreva código Java, com correção automática.", base: "", attrs: 'data-pagina="simulados"', dados: comDados }));
console.log(`ok: ${n} páginas de algoritmo (${comDados.length} com conteúdo: ${comDados.join(", ")}) + index.html + simulados.html`);
