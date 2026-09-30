/* =============================================================================
   EXERCÍCIOS — quatro tipos, corrigidos rodando Java no interpretador:
   escolha   { alternativas: [...], correta, explicacao }
   rastreio  { codigo: programa com main; a SAÍDA dele é o gabarito }
   completar { modelo: métodos com lacunas ⟦⟧, gabarito: [...], testes, solucao }
   escrever  { inicial: assinatura, solucao, testes }
   testes: [{ expr: "buscar(new int[] {1, 3}, 3)" } | { codigo: "int[] v = {3,1}; ordenar(v); System.out.println(Arrays.toString(v));" }]
   O resultado esperado de cada teste vem de rodar a SOLUÇÃO de referência.
   ============================================================================= */
(function () {
  "use strict";
  var G = window.Guia, esc = G.esc;
  var ROT = { escolha: "múltipla escolha", rastreio: "simule o código", completar: "complete as linhas", escrever: "escreva o código" };
  G.ROTULO_EX = ROT;

  // monta a classe de teste: métodos do aluno + main que roda cada teste separado por marcadores
  function montaPrograma(metodos, testes, protegido) {
    var corpo = testes.map(function (t, k) {
      var cmd = t.codigo || "System.out.println(" + t.expr + ");";
      return '        System.out.println("@@T' + k + '");\n' + (protegido ? "        try {\n            " + cmd + "\n        } catch (Throwable e) {\n            System.out.println(\"EXCEÇÃO \" + e);\n        }" : "        " + cmd);
    }).join("\n");
    return "import java.util.*;\npublic class Solucao {\n" + metodos + "\n    public static void main(String[] args) {\n" + corpo + "\n    }\n}\n";
  }
  G.montaPrograma = montaPrograma;
  function separa(saida, n) {
    var out = [], partes = saida.split(/@@T(\d+)\n/);
    for (var k = 0; k < n; k++) out.push(null);
    for (var j = 1; j < partes.length; j += 2) out[+partes[j]] = partes[j + 1].replace(/\n$/, "");
    return out;
  }
  var cacheEsperado = {};
  function esperados(ex) {
    if (cacheEsperado[ex.id]) return cacheEsperado[ex.id];
    var src = montaPrograma(ex.solucao, ex.testes, true), c = Java.compilar(src);
    if (!c.ok) throw new Error("solução de referência não compila: " + JSON.stringify(c.erros));
    var r = Java.executar(c, { maxOps: 5e7 });
    return (cacheEsperado[ex.id] = separa(r.saida, ex.testes.length));
  }
  G.esperados = esperados;
  // roda os testes no código do aluno
  function rodaTestes(ex, metodos) {
    var src = montaPrograma(metodos, ex.testes, true), c = Java.compilar(src);
    if (!c.ok) { var er = c.erros[0]; return { compilou: false, linha: er.linha - 2, msg: er.msg }; }
    var r = Java.executar(c, { maxOps: 2e7, maxProf: 1500 });
    var obtidos = separa(r.saida, ex.testes.length), esp = esperados(ex);
    var res = ex.testes.map(function (t, k) {
      var o = obtidos[k];
      if (o === null) o = r.limite ? "⏱ demorou demais (laço infinito?)" : r.erro ? "EXCEÇÃO " + r.erro.nomeCompleto + (r.erro.msg ? ": " + r.erro.msg : "") : "(não executou)";
      return { teste: t.expr || t.codigo, esperado: esp[k], obtido: o, ok: o === esp[k] };
    });
    return { compilou: true, testes: res, ok: res.every(function (x) { return x.ok; }) };
  }
  // normaliza respostas de rastreio: compara só os "átomos" (números, palavras)
  function atomos(s) { return String(s).toLowerCase().replace(/\btrue\b/g, "true").match(/-?\d+(\.\d+)?|[a-zà-ú_]+/gi) || []; }
  function confere(resp, gab) { var a = atomos(resp), b = atomos(gab); return a.length === b.length && a.every(function (x, k) { return x === b[k]; }); }

  function tabelaTestes(r) {
    if (!r.compilou) return '<div class="fb ruim">Não compilou (linha ' + r.linha + "): " + esc(r.msg) + "</div>";
    var n = r.testes.filter(function (t) { return t.ok; }).length;
    return '<div class="fb ' + (r.ok ? "ok" : "ruim") + '">' + (r.ok ? "✓ Passou em todos os " + n + " testes!" : "Passou em " + n + " de " + r.testes.length + " testes.") + "</div>" +
      '<div class="tab-wrap"><table class="testes"><tr><th></th><th>teste</th><th>esperado</th><th>obtido</th></tr>' + r.testes.map(function (t) {
        return '<tr><td class="' + (t.ok ? "ok" : "ruim") + '">' + (t.ok ? "✓" : "✗") + "</td><td>" + esc(t.teste) + "</td><td>" + esc(t.esperado) + '</td><td class="' + (t.ok ? "" : "ruim") + '">' + esc(t.obtido) + "</td></tr>";
      }).join("") + "</table></div>";
  }

  // ------------------------------------------------------------ um exercício
  G.exercicio = function (el, ex, opts) {
    opts = opts || {};
    var CH = "ex-" + ex.id, salvo = G.guarda(CH) || {};
    el.classList.add("ex");
    el.id = el.id || "ex-" + ex.id;
    var cab = '<header><span class="tipo ' + ex.tipo + '">' + ROT[ex.tipo] + "</span>" + (opts.mostraAlgo && ex.algoNome ? '<a class="algo" href="' + ex.algoUrl + '">' + esc(ex.algoNome) + "</a>" : "") + '<span class="estado" data-r="estado"></span></header>' +
      "<h4>" + esc(ex.titulo) + '</h4><div class="enun prose">' + G.md(ex.enunciado) + "</div>";
    var html = cab;
    if (ex.tipo === "escolha") {
      html += '<div class="escolhas">' + ex.alternativas.map(function (a, k) { return '<button type="button" data-alt="' + k + '">' + G.inline(a) + "</button>"; }).join("") + "</div>";
    } else if (ex.tipo === "rastreio") {
      html += '<div class="code"><pre>' + ex.codigo.split("\n").map(G.realce).join("\n") + "</pre></div>" +
        '<div class="resp"><input type="text" data-r="resp" placeholder="' + esc(ex.formato || "sua resposta") + '" spellcheck="false" aria-label="Sua resposta"><button type="button" class="btn play" data-a="confere">Conferir</button><button type="button" class="btn" data-a="ver">▶ ver passo a passo</button></div>';
    } else if (ex.tipo === "completar") {
      var k = 0;
      var modelo = G.esc(ex.modelo).replace(/⟦⟧/g, function () { var n = k++; return "\u0000" + n + "\u0000"; });
      var linhas = modelo.split("\n").map(function (l) {
        var partes = l.split(/\u0000(\d+)\u0000/), out = "";
        for (var j = 0; j < partes.length; j++) out += j % 2 ? '<input class="lacuna" data-lac="' + partes[j] + '" spellcheck="false" autocomplete="off" aria-label="lacuna ' + (+partes[j] + 1) + '" size="' + Math.max(6, (ex.gabarito[+partes[j]] || "").length + 3) + '">' : G.realce(partes[j].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
        return out;
      });
      html += '<div class="code"><pre>' + linhas.join("\n") + "</pre></div>" +
        '<div class="resp"><button type="button" class="btn play" data-a="testa">▶ Rodar os testes</button><button type="button" class="btn" data-a="ver">▶ depurar</button><button type="button" class="btn" data-a="gab">ver gabarito</button></div>';
    } else if (ex.tipo === "escrever") {
      html += '<div data-r="ed"></div><div class="resp"><button type="button" class="btn play" data-a="testa">▶ Rodar os testes</button><button type="button" class="btn" data-a="ver">▶ depurar meu código</button><button type="button" class="btn" data-a="gab">ver uma solução</button><button type="button" class="btn" data-a="limpa">recomeçar</button></div>';
    }
    if (ex.dica) html += '<details class="dica"><summary>dica</summary><p>' + G.inline(ex.dica) + "</p></details>";
    html += '<div data-r="fb"></div><div data-r="dep"></div>';
    el.innerHTML = html;
    var R = {};
    Array.prototype.forEach.call(el.querySelectorAll("[data-r]"), function (x) { R[x.getAttribute("data-r")] = x; });
    var editor = null;
    if (ex.tipo === "escrever") editor = G.editor(R.ed, { valor: salvo.codigo || ex.inicial, minLinhas: 8, aoMudar: function (v) { salvo.codigo = v; G.guarda(CH, salvo); } });
    if (ex.tipo === "completar" && salvo.lacunas) salvo.lacunas.forEach(function (v, n) { var inp = el.querySelector('[data-lac="' + n + '"]'); if (inp) inp.value = v; });
    if (ex.tipo === "rastreio" && salvo.resp) R.resp.value = salvo.resp;

    function marca(ok, txt) {
      salvo.ok = ok; G.guarda(CH, salvo);
      R.estado.textContent = ok ? "✓ feito" : "✗ tente de novo";
      R.estado.className = "estado " + (ok ? "ok" : "ruim");
      if (opts.aoMudar) opts.aoMudar();
    }
    if (salvo.ok !== undefined) { R.estado.textContent = salvo.ok ? "✓ feito" : "✗ tente de novo"; R.estado.className = "estado " + (salvo.ok ? "ok" : "ruim"); }
    function codigoCompletado() {
      var k2 = 0;
      return ex.modelo.replace(/⟦⟧/g, function () { var inp = el.querySelector('[data-lac="' + (k2++) + '"]'); return inp ? inp.value : ""; });
    }
    function mostraDepurador(codigo) {
      R.dep.innerHTML = "";
      var box = document.createElement("div");
      R.dep.appendChild(box);
      G.depurador(box, { programas: [{ id: "ex", nome: ex.titulo, codigo: codigo, entradas: [], viz: ex.viz || [] }] });
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.hasAttribute("data-alt")) {
        if (salvo.escolha !== undefined) return;
        salvo.escolha = +b.getAttribute("data-alt");
        pintaEscolha(); marca(salvo.escolha === ex.correta); return;
      }
      var a = b.getAttribute("data-a");
      if (a === "confere") {
        var gab = gabaritoRastreio();
        salvo.resp = R.resp.value;
        var ok = confere(R.resp.value, gab);
        R.fb.innerHTML = '<div class="fb ' + (ok ? "ok" : "ruim") + '">' + (ok ? "✓ Isso mesmo!" : "Ainda não. ") + (ok || salvo.tentou ? " Resposta: <code class=\"inl\">" + esc(gab) + "</code>" : "Confira de novo, ou use ▶ ver passo a passo.") + "</div>" + (ok && ex.explicacao ? '<div class="prose" style="margin-top:8px">' + G.md(ex.explicacao) + "</div>" : "");
        salvo.tentou = true; marca(ok);
      } else if (a === "ver") {
        if (ex.tipo === "rastreio") mostraDepurador(ex.codigo);
        else {
          var metodos = ex.tipo === "escrever" ? editor.valor() : codigoCompletado();
          mostraDepurador(montaPrograma(metodos, ex.testes, false));
        }
      } else if (a === "testa") {
        var metodos2 = ex.tipo === "escrever" ? editor.valor() : codigoCompletado();
        if (ex.tipo === "completar") { salvo.lacunas = Array.prototype.map.call(el.querySelectorAll("[data-lac]"), function (x) { return x.value; }); }
        var r = rodaTestes(ex, metodos2);
        if (editor) editor.erros(r.compilou ? [] : [r.linha]);
        R.fb.innerHTML = tabelaTestes(r) + (r.ok && ex.explicacao ? '<div class="prose" style="margin-top:8px">' + G.md(ex.explicacao) + "</div>" : "");
        marca(!!r.ok);
      } else if (a === "gab") {
        if (ex.tipo === "completar") {
          el.querySelectorAll("[data-lac]").forEach(function (inp, n) { inp.classList.toggle("ok", inp.value.replace(/\s/g, "") === ex.gabarito[n].replace(/\s/g, "")); inp.placeholder = ex.gabarito[n]; });
          R.fb.innerHTML = '<div class="fb ok">Gabarito: ' + ex.gabarito.map(function (g, n) { return "lacuna " + (n + 1) + " = <code class=\"inl\">" + esc(g) + "</code>"; }).join(" · ") + (ex.explicacao ? '</div><div class="prose" style="margin-top:8px">' + G.md(ex.explicacao) : "") + "</div>";
        } else R.fb.innerHTML = '<div class="fb ok">Uma solução possível (existem outras):</div><div class="code"><pre>' + ex.solucao.split("\n").map(G.realce).join("\n") + "</pre></div>" + (ex.explicacao ? '<div class="prose">' + G.md(ex.explicacao) + "</div>" : "");
      } else if (a === "limpa") { editor.valor(ex.inicial); salvo.codigo = ex.inicial; G.guarda(CH, salvo); R.fb.innerHTML = ""; }
    });
    function gabaritoRastreio() {
      if (ex._gab === undefined) { var r = Java.executar(Java.compilar(ex.codigo), {}); ex._gab = r.saida.trim() + (r.erro ? (r.saida.trim() ? "\n" : "") + "EXCEÇÃO " + r.erro.nomeCompleto : ""); }
      return ex._gab;
    }
    function pintaEscolha() {
      el.querySelectorAll("[data-alt]").forEach(function (b2) {
        var k3 = +b2.getAttribute("data-alt");
        b2.className = k3 === ex.correta ? "certa" : k3 === salvo.escolha ? "errada" : "";
      });
      R.fb.innerHTML = '<div class="fb ' + (salvo.escolha === ex.correta ? "ok" : "ruim") + '">' + (salvo.escolha === ex.correta ? "✓ Correto." : "Não é essa.") + "</div>" + (ex.explicacao ? '<div class="prose" style="margin-top:8px">' + G.md(ex.explicacao) + "</div>" : "");
    }
    if (ex.tipo === "escolha" && salvo.escolha !== undefined) pintaEscolha();
  };

  // ------------------------------------------------------------ perguntas (revelar + sei/revisar)
  var GRUPOS = { conceito: "sobre o algoritmo", codigo: "sobre o código", variacao: "variações e problemas" };
  G.perguntas = function (el, chave, itens) {
    var CH = "perg-" + chave, marcas = G.guarda(CH) || {}, filtro = "todas";
    var grupos = Object.keys(GRUPOS).filter(function (g) { return itens.some(function (p) { return p.g === g; }); });
    el.innerHTML = '<div class="progresso"><div class="barra"><span class="b1"></span><span class="b2"></span></div><span class="t"></span></div>' +
      '<div class="filtros"><button type="button" class="preset" data-f="todas" aria-pressed="true">todas · ' + itens.length + "</button>" +
      grupos.map(function (g) { return '<button type="button" class="preset" data-f="' + g + '" aria-pressed="false">' + GRUPOS[g] + " · " + itens.filter(function (p) { return p.g === g; }).length + "</button>"; }).join("") +
      '<button type="button" class="preset" data-f="rev" aria-pressed="false">↺ para revisar</button></div>' +
      '<div class="pg-lista">' + itens.map(function (p, k) {
        return '<article class="pg-card g-' + ({ conceito: "con", codigo: "cod", variacao: "var" }[p.g] || "con") + '" data-k="' + k + '"><header><span class="pg-num">' + (k + 1) + '</span><span class="pg-tag">' + (GRUPOS[p.g] || "") + '</span></header><div class="pg-p">' + G.md(p.p) + "</div>" +
          (p.d ? '<details class="dica"><summary>dica</summary><p>' + G.inline(p.d) + "</p></details>" : "") +
          '<div class="pg-acoes"><button type="button" class="btn" data-a="ver" aria-expanded="false">Mostrar resposta</button><button type="button" class="btn sei" data-m="sei">✓ sei</button><button type="button" class="btn revisar" data-m="rev">↺ revisar</button></div><div class="pg-r prose" hidden>' + G.md(p.r) + "</div></article>";
      }).join("") + "</div>";
    function pinta() {
      var sei = 0, rev = 0;
      el.querySelectorAll(".pg-card").forEach(function (c) {
        var k = c.getAttribute("data-k"), m = marcas[k], p = itens[+k];
        if (m === "sei") sei++; if (m === "rev") rev++;
        c.classList.toggle("marcou-sei", m === "sei"); c.classList.toggle("marcou-rev", m === "rev");
        c.hidden = !(filtro === "todas" || filtro === p.g || (filtro === "rev" && m === "rev"));
      });
      el.querySelector(".b1").style.width = sei / itens.length * 100 + "%";
      el.querySelector(".b2").style.width = rev / itens.length * 100 + "%";
      el.querySelector(".progresso .t").textContent = sei + " sei · " + rev + " para revisar · " + (itens.length - sei - rev) + " sem marcar";
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-f")) { filtro = b.getAttribute("data-f"); el.querySelectorAll("[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); return pinta(); }
      var c = b.closest(".pg-card");
      if (b.getAttribute("data-a") === "ver") { var r = c.querySelector(".pg-r"); r.hidden = !r.hidden; b.textContent = r.hidden ? "Mostrar resposta" : "Esconder resposta"; b.setAttribute("aria-expanded", !r.hidden); }
      else if (b.hasAttribute("data-m")) { var k = c.getAttribute("data-k"), m = b.getAttribute("data-m"); if (marcas[k] === m) delete marcas[k]; else marcas[k] = m; G.guarda(CH, marcas); pinta(); }
    });
    pinta();
  };
})();
