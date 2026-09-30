/* =============================================================================
   DEPURADOR — roda um programa Java no interpretador (js/java.js) com rastreio
   e anima o resultado: código ativo, visualização, variáveis, saída, narração,
   tabela de simulação. Programa (em js/dados/<algoritmo>.js):
   {
     id, nome, codigo: "... int[] v = {{v}}; ...",
     entradas: [{ nome: "v", tipo: "int[]", valor: "3, 8, 12" }, ...],
     exemplos: [{ rotulo: "alvo ausente", valores: { alvo: "4" } }],
     viz: [ ...ver js/viz.js... ],
     tabela: { quando: "int meio" | fn(st), colunas: [["meio", "meio"], ["v[meio]", "v[meio]"], ["decisão", fn]] },
     dicas: [{ linha: /regex no texto da linha/, texto: fn(st) }]
   }
   ============================================================================= */
(function () {
  "use strict";
  var G = window.Guia, esc = G.esc;

  // ---------------------------------------------------------- entradas
  function lista(txt) { return String(txt).split(/[\s,;]+/).filter(Boolean); }
  var TIPOS = {
    "int[]": function (v) {
      var xs = lista(v.replace(/[{}\[\]]/g, " "));
      xs.forEach(function (x) { if (!/^-?\d+$/.test(x)) throw new Error("\"" + x + "\" não é um número inteiro"); });
      return "{" + xs.join(", ") + "}";
    },
    "int": function (v) { v = String(v).trim(); if (!/^-?\d+$/.test(v)) throw new Error("\"" + v + "\" não é um número inteiro"); return v; },
    "char[][]": function (v) {
      var ls = String(v).split("\n").map(function (l) { return l.replace(/\s+/g, ""); }).filter(Boolean);
      if (!ls.length) throw new Error("a matriz está vazia");
      if (ls.some(function (l) { return l.length !== ls[0].length; })) throw new Error("todas as linhas precisam ter o mesmo tamanho");
      return "{\n            " + ls.map(function (l) { return JSON.stringify(l) + ".toCharArray()"; }).join(",\n            ") + "\n        }";
    },
    "int[][]": function (v) {
      var ls = String(v).split("\n").filter(function (l) { return l.trim(); });
      return "{" + ls.map(function (l) { return TIPOS["int[]"](l); }).join(", ") + "}";
    },
    "String": function (v) { return JSON.stringify(String(v)); },
    "char": function (v) { v = String(v).trim(); if (v.length !== 1) throw new Error("digite um único caractere"); return "'" + v + "'"; },
    "arestas": function (v) {
      var pares = String(v).split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      return pares.map(function (p) {
        var m = /^(\d+)\s*[-–]\s*(\d+)$/.exec(p);
        if (!m) throw new Error("aresta inválida \"" + p + "\": use o formato 0-1");
        return "g.adicionarAresta(" + m[1] + ", " + m[2] + ");";
      }).join("\n        ");
    }
  };
  function montaCodigo(prog, valores) {
    return prog.codigo.replace(/\{\{(\w+)\}\}/g, function (m, nome) {
      var ent = (prog.entradas || []).find(function (e) { return e.nome === nome; });
      if (!ent) return m;
      try { return TIPOS[ent.tipo](valores[nome]); }
      catch (e) { throw new Error((ent.rotulo || nome) + ": " + e.message); }
    });
  }

  G.montaCodigo = montaCodigo;
  G.valoresPadrao = function (prog) { var v = {}; (prog.entradas || []).forEach(function (e) { v[e.nome] = e.valor; }); return v; };

  // ---------------------------------------------------------- componente
  G.depurador = function (el, cfg) {
    var progs = cfg.programas.slice(), prog = progs[0], valores = {}, res = null, codigoAtual = "", i = 0, timer = null, editado = null;
    var uid = "dp" + Math.random().toString(36).slice(2, 7);
    el.classList.add("dp");
    el.innerHTML =
      '<div class="dp-topo">' +
        '<div class="dp-progs" data-r="progs"></div>' +
        '<div class="dp-ent" data-r="ent"></div>' +
        '<div class="dp-exs dp-progs" data-r="exs"></div>' +
        '<div data-r="msg"></div>' +
      "</div>" +
      '<div class="dp-editor" data-r="editor" hidden>' +
        '<div class="barra"><span class="t">✎ Seu código — edite à vontade e rode para ver a execução</span>' +
          '<button type="button" class="btn play" data-a="rodaEd">▶ Rodar meu código</button><button type="button" class="btn" data-a="restaura">↺ Voltar ao original</button><button type="button" class="btn" data-a="fechaEd">Fechar editor</button></div>' +
        '<div data-r="ed"></div><div data-r="edmsg"></div>' +
      "</div>" +
      '<div class="dp-palco">' +
        '<div class="dp-col"><div class="pn"><h5>Visualização <span class="extra" data-r="vizx"></span></h5><div class="pn-corpo viz" data-r="viz"></div></div>' +
          '<div class="pn"><h5>Saída <span class="extra">System.out</span></h5><div class="saida" data-r="saida"></div></div></div>' +
        '<div class="dp-col"><div class="pn"><h5><span data-r="codh">Código</span><span class="extra" data-r="codx"></span></h5><div class="cod" data-r="cod"></div></div>' +
          '<div class="pn"><h5>Variáveis <span class="extra">pilha de chamadas · topo em cima</span></h5><div class="pn-corpo"><div class="frames" data-r="vars"></div><div data-r="est"></div></div></div></div>' +
      "</div>" +
      '<div class="dp-narra"><span class="pn-n" data-r="pn">—</span><span class="tx" data-r="tx"></span></div>' +
      '<div class="dp-ctrl">' +
        '<button class="btn" type="button" data-a="ini" title="Início (Home)">⏮</button>' +
        '<button class="btn" type="button" data-a="ant" title="Passo anterior (←)">◀</button>' +
        '<button class="btn play" type="button" data-a="play" title="Rodar sozinho (espaço)">▶ Rodar</button>' +
        '<button class="btn" type="button" data-a="prox" title="Próximo passo (→)">▶|</button>' +
        '<button class="btn" type="button" data-a="sobre" title="Passar por cima: não entra nas chamadas">⤼ por cima</button>' +
        '<button class="btn" type="button" data-a="sai" title="Sair da chamada atual">⤴ sair</button>' +
        '<button class="btn" type="button" data-a="fim" title="Fim (End)">⏭</button>' +
        '<span class="sl"><input type="range" class="tempo" data-r="sl" min="0" max="0" value="0" aria-label="Linha do tempo"><canvas data-r="faixa" height="5" aria-hidden="true"></canvas></span>' +
        '<span class="conta" data-r="conta"></span>' +
        '<label class="vel" for="' + uid + '-v">vel.<input type="range" id="' + uid + '-v" data-r="vel" min="1" max="10" value="5"></label>' +
      "</div>" +
      '<details class="dp-tabela" data-r="tabbox" open><summary>Tabela de simulação <span style="font-weight:400;color:var(--ink-3);font-size:13px">(montada a partir da execução, como na aula)</span></summary><div class="tab-wrap" data-r="tab"></div></details>';
    var R = {};
    Array.prototype.forEach.call(el.querySelectorAll("[data-r]"), function (x) { R[x.getAttribute("data-r")] = x; });
    var ed = G.editor(R.ed, { minLinhas: 12, aoTeclar: function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); rodaEditado(); } } });

    // ---------------- abas de programa
    function pintaProgs() {
      R.progs.innerHTML = '<span class="lb">Programa</span>' + progs.map(function (p, k) {
        return '<button type="button" class="preset" data-prog="' + k + '" aria-pressed="' + (p === prog) + '">' + esc(p.nome) + "</button>";
      }).join("") + '<button type="button" class="preset" data-a="abreEd" style="margin-left:auto" aria-pressed="' + !!editado + '">✎ Editar o código</button>';
    }
    function escolhe(p, rodar) {
      parar(); prog = p; editado = null; R.editor.hidden = true;
      valores = {};
      (p.entradas || []).forEach(function (e) { valores[e.nome] = e.valor; });
      pintaProgs(); pintaEntradas();
      executa(rodar);
    }
    function pintaEntradas() {
      var ents = prog.entradas || [];
      R.ent.innerHTML = ents.map(function (e) {
        var id = uid + "-" + e.nome, grande = e.tipo === "char[][]" || e.tipo === "int[][]" || e.tipo === "arestas";
        return '<div class="dp-campo"><label for="' + id + '">' + esc(e.rotulo || e.nome) + " <code>" + esc(e.tipo === "arestas" ? "arestas a-b" : e.tipo) + "</code></label>" +
          (grande ? '<textarea id="' + id + '" data-ent="' + e.nome + '" rows="' + Math.min(8, String(e.valor).split("\n").length + 1) + '" spellcheck="false">' + esc(valores[e.nome]) + "</textarea>"
            : '<input id="' + id + '" data-ent="' + e.nome + '" value="' + esc(valores[e.nome]) + '" spellcheck="false" class="' + (e.tipo === "int[]" ? "largo" : "") + '">') + "</div>";
      }).join("") + (ents.length ? '<div class="acoes"><button type="button" class="btn play" data-a="roda">▶ Rodar com estes valores</button></div>' : "");
      Array.prototype.forEach.call(R.ent.querySelectorAll("[data-ent]"), function (x) { x.disabled = !!editado; });
      R.exs.innerHTML = (prog.exemplos || []).length ? '<span class="lb">Experimente</span>' + prog.exemplos.map(function (x, k) { return '<button type="button" class="preset" data-ex="' + k + '">' + esc(x.rotulo) + "</button>"; }).join("") : "";
    }

    // ---------------- execução
    function executa(tocarDepois) {
      parar();
      R.msg.innerHTML = "";
      var codigo;
      try { codigo = editado !== null ? editado : montaCodigo(prog, valores); }
      catch (e) { R.msg.innerHTML = '<div class="dp-erro-comp">' + esc(e.message) + "</div>"; return; }
      var c = Java.compilar(codigo);
      if (!c.ok) {
        var er = c.erros[0];
        var alvo = editado !== null ? R.edmsg : R.msg;
        alvo.innerHTML = '<div class="dp-erro-comp">Erro de compilação na linha ' + er.linha + ": " + esc(er.msg) + "</div>";
        if (editado !== null) ed.erros([er.linha]);
        return false;
      }
      R.edmsg.innerHTML = "";
      codigoAtual = codigo;
      res = Java.executar(c, { rastrear: true, maxPassos: cfg.maxPassos || 5000, maxOps: 8000000, maxProf: 250 });
      if (!res.passos.length) { R.msg.innerHTML = '<div class="dp-erro-comp">' + esc(res.erro ? res.erro.msg : "nada para mostrar") + "</div>"; return false; }
      if (res.limite) R.msg.innerHTML = '<div class="dp-erro-comp">Parei depois de ' + res.passos.length + " passos: o programa não terminou. Provavelmente é um laço infinito (ou uma recursão que não chega no caso base).</div>";
      codLinhas = codigo.split("\n");
      R.cod.innerHTML = codLinhas.map(function (l, k) { return '<span class="l" data-l="' + (k + 1) + '"><span class="ln">' + (k + 1) + "</span>" + (G.realce(l) || " ") + "</span>"; }).join("");
      R.sl.max = String(res.passos.length - 1);
      tabela = montaTabela();
      desenhaFaixa();
      ir(0);
      if (tocarDepois) tocar();
      return true;
    }
    var codLinhas = [], tabela = null;
    function rodaEditado() { editado = ed.valor(); pintaProgs(); pintaEntradas(); executa(true); }

    // ---------------- navegação
    function parar() { if (timer) { clearTimeout(timer); timer = null; } var b = el.querySelector('[data-a="play"]'); if (b) b.textContent = "▶ Rodar"; }
    function atraso() { var v = +R.vel.value; return Math.round(1500 * Math.pow(0.66, v - 1)); }
    function tocar() {
      if (!res) return;
      if (timer) return parar();
      if (i >= res.passos.length - 1) ir(0);
      el.querySelector('[data-a="play"]').textContent = "‖ Pausar";
      (function t() { if (i >= res.passos.length - 1) return parar(); ir(i + 1); timer = setTimeout(t, atraso()); })();
    }
    function prof(k) { return res.passos[k].frames.length; }
    function sobre() { var p0 = prof(i), k = i + 1; while (k < res.passos.length - 1 && prof(k) > p0) k++; ir(k); }
    function sai() { var p0 = prof(i), k = i + 1; while (k < res.passos.length - 1 && prof(k) >= p0) k++; ir(k); }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.hasAttribute("data-prog")) return escolhe(progs[+b.getAttribute("data-prog")], false);
      if (b.hasAttribute("data-ex")) {
        var ex = prog.exemplos[+b.getAttribute("data-ex")];
        Object.keys(ex.valores).forEach(function (k) { valores[k] = ex.valores[k]; });
        pintaEntradas(); return executa(true);
      }
      var a = b.getAttribute("data-a");
      switch (a) {
        case "roda": leEntradas(); executa(true); break;
        case "ini": parar(); ir(0); break;
        case "fim": parar(); ir(res.passos.length - 1); break;
        case "ant": parar(); ir(i - 1); break;
        case "prox": parar(); ir(i + 1); break;
        case "sobre": parar(); sobre(); break;
        case "sai": parar(); sai(); break;
        case "play": tocar(); break;
        case "abreEd": R.editor.hidden = false; ed.valor(editado !== null ? editado : codigoAtual || montaCodigo(prog, valores)); ed.foco(); R.editor.scrollIntoView({ block: "nearest", behavior: "smooth" }); break;
        case "rodaEd": rodaEditado(); break;
        case "restaura": editado = null; R.edmsg.innerHTML = ""; ed.valor(montaCodigo(prog, valores)); pintaProgs(); pintaEntradas(); executa(false); break;
        case "fechaEd": R.editor.hidden = true; break;
      }
    });
    function leEntradas() { Array.prototype.forEach.call(R.ent.querySelectorAll("[data-ent]"), function (x) { valores[x.getAttribute("data-ent")] = x.value; }); }
    R.ent.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); leEntradas(); executa(true); } });
    R.sl.addEventListener("input", function () { parar(); ir(+R.sl.value); });
    el.addEventListener("keydown", function (e) {
      var t = e.target.tagName;
      if (t === "TEXTAREA" || t === "INPUT" && e.target.type !== "range" || t === "SELECT") return;
      if (e.key === "ArrowRight") { e.preventDefault(); parar(); ir(i + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); parar(); ir(i - 1); }
      else if (e.key === " ") { e.preventDefault(); tocar(); }
      else if (e.key === "Home") { e.preventDefault(); parar(); ir(0); }
      else if (e.key === "End") { e.preventDefault(); parar(); ir(res.passos.length - 1); }
    });
    el.tabIndex = -1;

    function desenhaFaixa() {
      var cv = R.faixa, w = cv.clientWidth || 400, n = res.passos.length, maxP = 1;
      cv.width = w;
      res.passos.forEach(function (p) { maxP = Math.max(maxP, p.frames.length); });
      var ctx = cv.getContext("2d");
      for (var x = 0; x < w; x++) {
        var p = res.passos[Math.min(n - 1, Math.floor(x / w * n))];
        ctx.fillStyle = p.erro ? "#c0392b" : p.chamada ? "#215c7a" : p.ret ? "#14674c" : "hsl(160," + (20 + 50 * p.frames.length / maxP) + "%," + (80 - 40 * p.frames.length / maxP) + "%)";
        ctx.fillRect(x, 0, 1, 5);
      }
    }
    if (window.ResizeObserver) new ResizeObserver(function () { if (res) desenhaFaixa(); }).observe(R.faixa);

    // ---------------- tabela de simulação
    function montaTabela() {
      var tb = prog.tabela;
      if (!tb || editado !== null && !tb.sempre) { R.tabbox.hidden = !tb; if (tb) R.tab.innerHTML = '<span style="font-size:13px;color:var(--ink-3)">(a tabela usa o código original; com código editado, veja as variáveis ao lado)</span>'; return null; }
      R.tabbox.hidden = false;
      var linhas = [];
      res.passos.forEach(function (p, k) {
        var txt = codLinhas[p.linha - 1] || "", st = null;
        var ok = typeof tb.quando === "function" ? tb.quando(st = G.Estado(res, k), txt) : txt.indexOf(tb.quando) >= 0 && !p.chamada && p.voltou === undefined;
        if (!ok) return;
        st = st || G.Estado(res, k);
        linhas.push({ k: k, cels: tb.colunas.map(function (c) { return valorCol(c[1], st); }) });
      });
      return { linhas: linhas, cab: tb.colunas.map(function (c) { return c[0]; }) };
    }
    function valorCol(expr, st) {
      if (typeof expr === "function") { try { var r = expr(st); return r === undefined || r === null ? "—" : String(r); } catch (e) { return "—"; } }
      var m = /^(\w+)\[(\w+)\]$/.exec(expr);
      if (m) { var a = st.arr(m[1]), ix = /^\d+$/.test(m[2]) ? +m[2] : st.num(m[2]); return a && ix !== undefined && ix >= 0 && ix < a.length ? G.mostraVal(st.deref(a[ix])) : "—"; }
      var v = st.val(expr);
      if (v === undefined) return "—";
      if (v && typeof v === "object") return v.a ? "{" + v.a.map(function (x) { return G.mostraVal(st.deref(x)); }).join(", ") + "}" : "…";
      return G.mostraVal(v);
    }
    function pintaTabela() {
      if (!tabela) return;
      if (!tabela.linhas.length) { R.tab.innerHTML = '<span style="font-size:13px;color:var(--ink-3)">nenhuma linha nesta execução</span>'; return; }
      var atual = -1;
      tabela.linhas.forEach(function (l, n) { if (l.k <= i) atual = n; });
      R.tab.innerHTML = '<table class="tab-sim"><tr><th>#</th>' + tabela.cab.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>" +
        tabela.linhas.map(function (l, n) { return '<tr class="' + (n === atual ? "on" : l.k > i ? "fut" : "") + '"><td>' + (n + 1) + "</td>" + l.cels.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</table>";
    }

    // ---------------- desenho de um passo
    function ir(k) {
      if (!res) return;
      i = Math.max(0, Math.min(res.passos.length - 1, k));
      var p = res.passos[i], ant = i > 0 ? res.passos[i - 1] : null, st = G.Estado(res, i);
      R.sl.value = String(i);
      R.conta.textContent = (i + 1) + " / " + res.passos.length;

      // código
      var velhos = R.cod.querySelectorAll(".l.on, .l.pai");
      for (var q = 0; q < velhos.length; q++) velhos[q].className = "l";
      p.frames.slice(0, -1).forEach(function (f) { var l = R.cod.children[f.linha - 1]; if (l) l.className = "l pai"; });
      var ln = R.cod.children[p.linha - 1];
      if (ln) {
        ln.className = "l on" + (p.erro ? " err" : p.ret ? " ret" : p.chamada ? " cha" : "");
        var box = R.cod;
        if (ln.offsetTop < box.scrollTop + 30 || ln.offsetTop > box.scrollTop + box.clientHeight - 40) box.scrollTop = ln.offsetTop - box.clientHeight / 2;
      }
      var topo = p.frames[p.frames.length - 1];
      R.codx.textContent = topo ? "executando " + topo.metodo + "() · linha " + p.linha : "";

      // visualização
      R.viz.innerHTML = G.desenhaViz(prog.viz || [], st);
      var arv = R.viz.querySelector("[data-arv]");
      if (arv) { var alvo = arv.querySelector(".an.topo rect") || arv.querySelector(".an.entra rect"); if (alvo) { arv.scrollLeft = Math.max(0, +alvo.getAttribute("x") - arv.clientWidth / 2 + 40); arv.scrollTop = Math.max(0, +alvo.getAttribute("y") - arv.clientHeight / 2); } }
      R.vizx.textContent = p.frames.length > 1 ? "profundidade da pilha: " + p.frames.length : "";

      // variáveis
      R.vars.innerHTML = p.frames.map(function (f, n) {
        var fa = ant && ant.frames[n] && ant.frames[n].chamada === f.chamada ? ant.frames[n] : null;
        var velhoV = {};
        if (fa) fa.vars.forEach(function (v) { velhoV[v[0]] = JSON.stringify(st.deref(v[1]) && v[1] && v[1].r !== undefined ? ant.heap[v[1].r] : v[1]); });
        var linhas = f.vars.map(function (v) {
          var atualS = JSON.stringify(v[1] && v[1].r !== undefined ? p.heap[v[1].r] : v[1]);
          var mudou = fa && (velhoV[v[0]] === undefined || velhoV[v[0]] !== atualS);
          return '<tr class="' + (mudou ? "mudou" : "") + '"><td class="nome">' + esc(v[0]) + '</td><td class="val">' + mostraSnap(v[1], st, v[2]) + "</td></tr>";
        }).join("");
        var novo = !ant || !ant.frames[n] || ant.frames[n].chamada !== f.chamada;
        return '<div class="fr' + (n === p.frames.length - 1 ? " topo" : "") + (novo && ant ? " novo" : "") + '"><div class="nm"><span>' + esc(f.metodo) + "()</span><small>" + (n === p.frames.length - 1 ? "rodando agora" : "esperando · linha " + f.linha) + "</small></div>" +
          (linhas ? "<table>" + linhas + "</table>" : '<span style="font-size:12px;color:var(--ink-3)">sem variáveis</span>') + "</div>";
      }).join("");
      var est = (p.estaticos || []).filter(function (e) { return e[1] && !e[1].u; });
      R.est.innerHTML = est.length ? '<div class="estaticos">static: ' + est.map(function (e) { return esc(e[0]) + " = " + mostraSnap(e[1], st); }).join(" · ") + "</div>" : "";

      // saída
      var s = res.saida.slice(0, p.saida), sAnt = ant ? res.saida.slice(0, ant.saida) : "";
      R.saida.innerHTML = s.length ? esc(sAnt) + (s.length > sAnt.length ? '<span class="nova">' + esc(s.slice(sAnt.length)) + "</span>" : "") : '<span style="color:#6f8b92">(nada impresso ainda)</span>';
      if (p.erro && p.erro.classe === "StackOverflowError") R.saida.innerHTML += '<span class="err">(aqui a pilha para em 250 chamadas; o Java de verdade aguenta alguns milhares, mas o erro é o mesmo)\n</span>';
      if (p.erro) R.saida.innerHTML += '<span class="err">Exception in thread "main" ' + esc(p.erro.nomeCompleto + (p.erro.msg ? ": " + p.erro.msg : "")) + "</span>";
      R.saida.scrollTop = R.saida.scrollHeight;

      // narração
      R.pn.textContent = p.erro ? "exceção" : p.chamada ? "chamada" : p.ret ? "return" : p.voltou !== undefined ? "voltou" : "linha " + p.linha;
      R.pn.className = "pn-n" + (p.erro ? " err" : p.chamada ? " cha" : p.ret || p.voltou !== undefined ? " ret" : "");
      var dica = "";
      (prog.dicas || []).some(function (d) {
        var txt = codLinhas[p.linha - 1] || "";
        if (d.linha.test(txt) && (!d.tipo || (d.tipo === "chamada") === !!p.chamada)) { try { dica = d.texto(st) || ""; } catch (e) { dica = ""; } return !!dica; }
        return false;
      });
      R.tx.innerHTML = esc(p.narr) + (dica ? '<span class="dica-alg">' + G.inline(dica) + "</span>" : "") + (i === res.passos.length - 1 && !p.erro && !res.limite ? '<span class="dica-alg">✓ Fim da execução.</span>' : "");
      R.tx.className = "tx" + (p.erro ? " erro" : "");
      pintaTabela();
    }
    function mostraSnap(sv, st, tipo) {
      if (sv === null) return "null";
      if (!sv || sv.u) return '<span style="color:var(--ink-3)">—</span>';
      if (sv.r === undefined) {
        var v = sv.v;
        if (typeof v === "string") return esc(sv.t === "String" ? '"' + v + '"' : "'" + (v === "\0" ? "\\0" : v) + "'");
        return esc(String(v));
      }
      var o = st.heap[sv.r];
      if (!o) return '<span class="ref">→ #' + sv.r + "</span>";
      function curto(x) {
        var d = st.deref(x);
        if (d && typeof d === "object") return d.a ? "[" + d.a.slice(0, 6).map(curto).join(",") + (d.a.length > 6 ? ",…" : "") + "]" : "…";
        return G.mostraVal(d);
      }
      if (o.k === "arr") return '<span class="ref">' + (o.a.length && o.a[0] && typeof o.a[0] === "object" ? "[" + o.a.length + "][" + (st.deref(o.a[0]) ? st.deref(o.a[0]).a.length : "?") + "]" : "{" + o.a.map(function (x) { return G.mostraVal(x); }).join(", ") + "}") + "</span>";
      if (o.k === "list" || o.k === "deque") return '<span class="ref">[' + o.a.map(curto).join(", ") + "]</span>";
      if (o.k === "set") return '<span class="ref">[' + o.e.map(function (x) { return x[0]; }).join(", ") + "]</span>";
      if (o.k === "map") return '<span class="ref">{' + o.e.map(function (x) { return x[0] + "=" + curto(x[1]); }).join(", ") + "}</span>";
      if (o.k === "sb") return '<span class="ref">"' + esc(o.s) + '"</span>';
      if (o.k === "obj") return '<span class="ref">' + esc(o.classe) + "</span>";
      return '<span class="ref">…</span>';
    }

    escolhe(prog, false);
    return {
      adicionar: function (p, rodar) {
        var k = progs.findIndex(function (x) { return x.id === p.id; });
        if (k < 0) { progs.push(p); k = progs.length - 1; }
        escolhe(progs[k], rodar);
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      codigo: function () { return codigoAtual; }
    };
  };
})();
