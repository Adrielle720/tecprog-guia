// Confere todo o conteúdo em js/dados/*.js:
//  - cada programa (com as entradas padrão), variação e erro comum roda no
//    interpretador E no Java de verdade (javac), com a mesma saída/exceção;
//  - cada exercício: solução compila e roda; gabarito de "completar" passa nos
//    testes com o mesmo resultado da solução; rastreio roda.
//   node tools/validar.js [slug]
const fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");
const RAIZ = path.join(__dirname, "..");
global.window = {};
global.document = { body: { getAttribute: () => null } };
const Java = require(path.join(RAIZ, "js/java.js"));
window.Java = Java; global.Java = Java;
require(path.join(RAIZ, "js/util.js"));
require(path.join(RAIZ, "js/depurador.js"));
require(path.join(RAIZ, "js/exercicios.js"));
require(path.join(RAIZ, "js/dados/indice.js"));
const G = window.Guia;
const so = process.argv[2];
for (const f of fs.readdirSync(path.join(RAIZ, "js/dados"))) if (f !== "indice.js" && (!so || f === so + ".js")) require(path.join(RAIZ, "js/dados", f));

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "tecprog-val-"));
let ok = 0, falhas = 0;
function falha(msg) { falhas++; console.log("  FALHA " + msg); }

function javaReal(src) {
  const m = /public\s+class\s+(\w+)/.exec(src) || /class\s+(\w+)/.exec(src);
  const dir = fs.mkdtempSync(path.join(TMP, "p"));
  fs.writeFileSync(path.join(dir, m[1] + ".java"), src);
  const c = spawnSync("javac", ["-encoding", "UTF-8", "-d", dir, path.join(dir, m[1] + ".java")], { encoding: "utf8" });
  if (c.status !== 0) return { comp: c.stderr };
  const r = spawnSync("java", ["-Dstdout.encoding=UTF-8", "-Xss16m", "-cp", dir, m[1]], { encoding: "utf8", timeout: 8000 });
  if (r.error) return { saida: r.stdout || "", erro: "TIMEOUT" };
  const e = /Exception in thread "main" ([\w.$]+)(?:: (.*))?/.exec(r.stderr) || /^(java\.lang\.StackOverflowError)/m.exec(r.stderr);
  return { saida: r.stdout.replace(/\r\n/g, "\n"), erro: e ? e[1] + (e[2] ? ": " + e[2] : "") : null };
}
function interp(src, maxOps) {
  const c = Java.compilar(src);
  if (!c.ok) return { comp: JSON.stringify(c.erros) };
  const r = Java.executar(c, { maxOps: maxOps || 5e7 });
  return { saida: r.saida, erro: r.erro ? r.erro.nomeCompleto + (r.erro.msg != null ? ": " + r.erro.msg : "") : r.limite ? "TIMEOUT" : null };
}
function compara(rotulo, src, esperaErro) {
  const i = interp(src), j = javaReal(src);
  if (i.comp) return falha(rotulo + ": não compila no interpretador " + i.comp);
  if (j.comp) return falha(rotulo + ": não compila no javac\n" + j.comp);
  const so = (e) => e && e.split(":")[0];
  const igual = i.saida === j.saida && (i.erro === j.erro || (so(i.erro) === "java.lang.StackOverflowError" && so(j.erro) === so(i.erro)) || (i.erro === "TIMEOUT" && j.erro === "TIMEOUT"));
  if (!igual) return falha(rotulo + "\n     java  : " + JSON.stringify(j) + "\n     interp: " + JSON.stringify(i));
  if (!esperaErro && (i.erro || !i.saida.trim())) return falha(rotulo + ": deveria rodar sem erro e imprimir algo → " + JSON.stringify(i));
  ok++;
  console.log("  ok    " + rotulo + "  →  " + (i.erro ? i.erro : JSON.stringify(i.saida.trim().slice(0, 60))));
}

for (const slug of Object.keys(G.ALG)) {
  const A = G.ALG[slug];
  console.log("\n" + slug);
  A.programas.forEach((p) => {
    compara("programa " + p.nome, G.montaCodigo(p, G.valoresPadrao(p)));
    (p.exemplos || []).forEach((ex) => { const v = Object.assign(G.valoresPadrao(p), ex.valores); compara("  exemplo " + ex.rotulo, G.montaCodigo(p, v), ex.erro); });
  });
  (A.variacoes || []).forEach((v) => compara("variação " + v.nome, v.codigo));
  (A.erros || []).forEach((e) => { if (e.codigo) compara("erro " + e.erro, e.codigo, true); });
  (A.exercicios || []).concat(A.simulado || []).forEach((ex) => {
    const rot = "exercício [" + ex.tipo + "] " + ex.titulo;
    try {
      if (ex.tipo === "rastreio") return compara(rot, ex.codigo, ex.erroEsperado);
      if (ex.tipo === "escolha") { if (ex.correta === undefined || !ex.alternativas[ex.correta]) return falha(rot + ": sem alternativa correta"); ok++; return; }
      const esp = G.esperados(ex);
      if (esp.some((x) => x === null)) return falha(rot + ": a solução não gerou saída para algum teste " + JSON.stringify(esp));
      // a solução também confere no Java real
      compara(rot + " (solução)", G.montaPrograma(ex.solucao, ex.testes, true));
      if (ex.tipo === "completar") {
        let k = 0;
        const preenchido = ex.modelo.replace(/⟦⟧/g, () => ex.gabarito[k++]);
        if (k !== ex.gabarito.length) return falha(rot + ": " + k + " lacunas mas " + ex.gabarito.length + " respostas");
        const c = Java.compilar(G.montaPrograma(preenchido, ex.testes, true));
        if (!c.ok) return falha(rot + ": gabarito não compila " + JSON.stringify(c.erros));
        const r = Java.executar(c, {});
        const obt = r.saida.split(/@@T\d+\n/).slice(1).map((s) => s.replace(/\n$/, ""));
        if (JSON.stringify(obt) !== JSON.stringify(esp)) return falha(rot + ": gabarito dá " + JSON.stringify(obt) + " e solução dá " + JSON.stringify(esp));
        ok++; console.log("  ok    " + rot + " (gabarito)");
      }
      if (ex.tipo === "escrever") {
        const c = Java.compilar(G.montaPrograma(ex.inicial, ex.testes, true));
        if (!c.ok) return falha(rot + ": o código inicial não compila " + JSON.stringify(c.erros));
      }
    } catch (e) { falha(rot + ": " + e.message); }
  });
}
console.log("\n" + ok + " ok, " + falhas + " falha(s)");
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(falhas ? 1 : 0);
