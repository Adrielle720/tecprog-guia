// Compara o interpretador (js/java.js) com o Java de verdade (javac + java):
// mesma saída e mesma exceção (classe e mensagem) para cada programa.
//   node tests/diferencial.js
const fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");
const Java = require("../js/java.js");

const PASTA = path.join(__dirname, "java");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "tecprog-"));
const FLAGS = ["-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8", "-Xss8m"];
const ARGS = { Erros: [["0"], ["1"], ["2"], ["3"]] };
let ok = 0, falhas = 0;

function rodaJava(classe, args) {
  const r = spawnSync("java", [...FLAGS, "-cp", TMP, classe, ...args], { encoding: "utf8" });
  const m = /Exception in thread "main" ([\w.$]+)(?:: (.*))?/.exec(r.stderr) || /^(java\.lang\.StackOverflowError)/m.exec(r.stderr);
  return { saida: r.stdout.replace(/\r\n/g, "\n"), erro: m ? (m[1] + (m[2] ? ": " + m[2] : "")) : null };
}
function rodaInterp(src, args) {
  const c = Java.compilar(src);
  if (!c.ok) return { saida: "", erro: "COMPILAÇÃO: " + JSON.stringify(c.erros) };
  const r = Java.executar(c, { args, maxOps: 5e8 });
  return { saida: r.saida, erro: r.erro ? r.erro.nomeCompleto + (r.erro.msg !== null && r.erro.msg !== undefined ? ": " + r.erro.msg : "") : (r.limite ? "LIMITE " + r.limite : null) };
}
for (const arq of fs.readdirSync(PASTA).filter(f => f.endsWith(".java"))) {
  const classe = arq.replace(".java", ""), src = fs.readFileSync(path.join(PASTA, arq), "utf8");
  const jc = spawnSync("javac", ["-encoding", "UTF-8", "-d", TMP, path.join(PASTA, arq)], { encoding: "utf8" });
  if (jc.status !== 0) { console.log("javac falhou em " + arq + "\n" + jc.stderr); falhas++; continue; }
  for (const args of ARGS[classe] || [[]]) {
    const j = rodaJava(classe, args), t0 = Date.now(), i = rodaInterp(src, args);
    // StackOverflowError: o Java não põe mensagem; comparamos só a classe
    const igual = j.saida === i.saida && (j.erro === i.erro || (j.erro && i.erro && j.erro.split(":")[0] === "java.lang.StackOverflowError" && i.erro.split(":")[0] === j.erro.split(":")[0]));
    if (igual) { ok++; console.log(`  ok    ${classe} ${args.join(" ")}  (${Date.now() - t0} ms)${j.erro ? "  → " + j.erro : ""}`); }
    else {
      falhas++;
      console.log(`  FALHA ${classe} ${args.join(" ")}`);
      const lj = j.saida.split("\n"), li = i.saida.split("\n");
      for (let k = 0; k < Math.max(lj.length, li.length); k++) if (lj[k] !== li[k]) console.log(`     linha ${k + 1}\n       java  : ${JSON.stringify(lj[k])}\n       interp: ${JSON.stringify(li[k])}`);
      if (j.erro !== i.erro) console.log(`     erro java  : ${j.erro}\n     erro interp: ${i.erro}`);
    }
  }
}
console.log(`\n${ok} ok, ${falhas} falha(s)`);
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(falhas ? 1 : 0);
