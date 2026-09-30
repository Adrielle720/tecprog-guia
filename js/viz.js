/* =============================================================================
   VISUALIZAÇÕES — desenham o estado de um passo do rastreio.
   Cada algoritmo descreve o que desenhar (em js/dados/<algoritmo>.js):
     { tipo: "array",    nome: "v", ponteiros: [["inicio", cor], ...], faixas: fn(st) }
     { tipo: "grade",    nome: "lab", vis: "visitado", dist: "dist", pos: ["l","c"], fila: "fila" }
     { tipo: "grafo",    adj: "adj", vis: "visitado", dist: "dist", atual: "atual", vizinho: "vizinho", fila: "fila" }
     { tipo: "arvore",   rotulo: fn(chamada) }
     { tipo: "colecoes", nomes: ["fila", "atual", "respostas"] }
   ============================================================================= */
(function () {
  "use strict";
  var G = window.Guia, esc = G.esc;

  // ------------------------------------------------------------ acesso ao estado
  // st.num("meio"), st.arr("v"), st.val("x") — procura do topo da pilha para baixo
  G.Estado = function (res, i) {
    var p = res.passos[i], heap = p.heap, frames = p.frames;
    function busca(nome) {
      for (var f = frames.length - 1; f >= 0; f--) { var vs = frames[f].vars; for (var k = 0; k < vs.length; k++) if (vs[k][0] === nome) return vs[k][1]; }
      for (var e = 0; e < (p.estaticos || []).length; e++) if (p.estaticos[e][0] === nome) return p.estaticos[e][1];
      return undefined;
    }
    function bruto(sv) { if (!sv) return sv === null ? null : undefined; if (sv.u) return undefined; if (sv.r !== undefined) return heap[sv.r]; return sv.v; }
    var st = {
      passo: p, i: i, res: res, frames: frames, heap: heap,
      topo: frames[frames.length - 1],
      bruto: bruto,
      val: function (nome) { return bruto(busca(nome)); },
      noTopo: function (nome) { var f = frames[frames.length - 1]; if (!f) return undefined; for (var k = 0; k < f.vars.length; k++) if (f.vars[k][0] === nome) return bruto(f.vars[k][1]); return undefined; },
      num: function (nome) { var v = st.val(nome); if (typeof v === "string" && v.length === 1) return v.charCodeAt(0); return typeof v === "number" ? v : undefined; },
      ref: function (nome) { var sv = busca(nome); return sv && sv.r !== undefined ? sv.r : null; },
      obj: function (nome) { var v = st.val(nome); return v && typeof v === "object" ? v : null; },
      arr: function (nome) { var o = st.obj(nome); return o && (o.k === "arr" || o.k === "list" || o.k === "deque") ? o.a : null; },
      deref: function (x) { return x && typeof x === "object" && x.r !== undefined ? heap[x.r] : x; }
    };
    return st;
  };
  function mostraVal(v) {
    if (v === null) return "null";
    if (typeof v === "string") return v === "\0" ? "·" : v;
    if (typeof v === "boolean") return v ? "T" : "F";
    return String(v);
  }
  G.mostraVal = mostraVal;

  var V = G.Viz = {};

  // ------------------------------------------------------------ array
  V.array = function (cfg, st) {
    var o = st.obj(cfg.nome);
    if (!o || !o.a) return cfg.oculto ? "" : '<div class="vz-rot">' + esc(cfg.rotulo || cfg.nome) + '</div><div class="colv"><span class="vazio">' + esc(cfg.nome) + " ainda não existe</span></div>";
    var a = o.a, id = st.ref(cfg.nome), n = a.length;
    var lidos = {}, escritos = {};
    (st.passo.acessos || []).forEach(function (x) { if (x.r === id) (x.w ? escritos : lidos)[x.i] = 1; });
    var classes = new Array(n).fill("");
    (cfg.faixas ? cfg.faixas(st, n) || [] : []).forEach(function (f) {
      for (var k = Math.max(0, f.de); k < Math.min(n, f.ate); k++) classes[k] += " " + f.cls;
    });
    var pts = {}, foraDaFaixa = [];
    (cfg.ponteiros || []).forEach(function (p) {
      var v = st.num(p[0]);
      if (v === undefined) return;
      if (p[2] === "topo" && st.noTopo(p[0]) === undefined) return;
      if (v >= 0 && v < n) (pts[v] = pts[v] || []).push(p);
      else foraDaFaixa.push(p[0] + " = " + v);
    });
    var max = cfg.barras ? Math.max.apply(null, a.map(function (x) { return Math.abs(Number(x)) || 0; }).concat([1])) : 0;
    var html = '<div class="vz-rot">' + esc(cfg.rotulo || cfg.nome) + (cfg.nota ? " <code>" + esc(cfg.nota(st) || "") + "</code>" : "") + '</div><div class="arr' + (cfg.barras ? " barras" : "") + '">';
    for (var k = 0; k < n; k++) {
      var alt = cfg.barras ? 30 + Math.round((Math.abs(Number(a[k])) || 0) / max * 90) : 0;
      html += '<div class="cel' + classes[k] + (lidos[k] ? " lido" : "") + (escritos[k] ? " escrito" : "") + '"><div class="cx"' + (alt ? ' style="height:' + alt + 'px"' : "") + ">" + esc(mostraVal(a[k])) + '</div><span class="ix">' + k + "</span>" +
        (pts[k] ? '<div class="pts">' + pts[k].map(function (p) { return '<span class="pt" style="background:' + p[1] + '">' + esc(p[0]) + "</span>"; }).join("") + "</div>" : "") + "</div>";
    }
    html += "</div>";
    var rodape = [];
    if (foraDaFaixa.length) rodape.push("fora do array: " + foraDaFaixa.join(", "));
    if (cfg.extra) { var ex = cfg.extra(st); if (ex) rodape.push(ex); }
    if (rodape.length) html += '<div class="faixa-leg">' + rodape.join(" · ") + "</div>";
    if (cfg.legenda) html += '<div class="faixa-leg">' + cfg.legenda.map(function (l) { return '<span><i class="' + l[0] + '" style="background:' + l[2] + '"></i>' + esc(l[1]) + "</span>"; }).join("") + "</div>";
    return html;
  };

  // ------------------------------------------------------------ matriz / labirinto
  V.grade = function (cfg, st) {
    var o = st.obj(cfg.nome);
    if (!o || !o.a) return '<div class="vz-rot">' + esc(cfg.rotulo || cfg.nome) + '</div><span class="vazio">' + esc(cfg.nome) + " ainda não existe</span>";
    var linhas = o.a.map(function (r) { return st.deref(r); });
    var vis = cfg.vis ? st.obj(cfg.vis) : null, dist = cfg.dist ? st.obj(cfg.dist) : null;
    function m(mat, l, c) { if (!mat) return undefined; var r = st.deref(mat.a[l]); return r ? r.a[c] : undefined; }
    var atual = null;
    if (cfg.pos) { var l0 = st.num(cfg.pos[0]), c0 = st.num(cfg.pos[1]); if (l0 !== undefined && c0 !== undefined) atual = l0 + "," + c0; }
    var cand = null;
    if (cfg.cand) { var l1 = st.num(cfg.cand[0]), c1 = st.num(cfg.cand[1]); if (l1 !== undefined && c1 !== undefined) cand = l1 + "," + c1; }
    var naFila = {};
    if (cfg.fila) { var f = st.obj(cfg.fila); if (f && f.a) f.a.forEach(function (x) { var q = st.deref(x); if (q && q.a) naFila[q.a[0] + "," + q.a[1]] = 1; }); }
    var rastro = {};
    if (cfg.rastro) st.frames.forEach(function (fr) {
      if (fr.metodo !== cfg.rastro) return;
      var l = null, c = null;
      fr.vars.forEach(function (v) { if (v[0] === cfg.pos[0]) l = v[1] && v[1].v; if (v[0] === cfg.pos[1]) c = v[1] && v[1].v; });
      if (l !== null && c !== null) rastro[l + "," + c] = 1;
    });
    var ncol = linhas.reduce(function (x, r) { return Math.max(x, r ? r.a.length : 0); }, 0);
    var html = '<div class="vz-rot">' + esc(cfg.rotulo || cfg.nome) + (cfg.nota ? " <code>" + esc(cfg.nota(st) || "") + "</code>" : "") + '</div><div style="overflow-x:auto"><div class="grade" style="grid-template-columns:repeat(' + ncol + ',38px)">';
    linhas.forEach(function (r, l) {
      if (!r) return;
      r.a.forEach(function (x, c) {
        var k = l + "," + c, cls = "gc";
        if (x === "#" || x === 1 && cfg.paredeUm) cls += " parede";
        var vv = m(vis, l, c), dd = m(dist, l, c);
        if (vv === true || (dd !== undefined && dd >= 0)) cls += " vis";
        if (rastro[k]) cls += " cand";
        if (naFila[k]) cls += " fila";
        if (k === cand) cls += " cand";
        if (k === atual) cls += " atual";
        html += '<div class="' + cls + '" title="(' + l + ", " + c + ')"><span class="tx">' + esc(mostraVal(x)) + "</span>" + (dd !== undefined && dd >= 0 ? '<span class="dist">' + dd + "</span>" : "") + "</div>";
      });
    });
    html += "</div></div>";
    var leg = ['<span><i style="background:#ffdcd6;border:1px solid #e0392b"></i>posição atual</span>'];
    if (cfg.vis || cfg.dist) leg.push('<span><i style="background:#d7f4e5;border:1px solid #14674c"></i>' + (cfg.dist ? "distância já descoberta" : "visitado") + "</span>");
    if (cfg.rastro) leg.push('<span><i style="background:#e2edf3;border:1px solid #215c7a"></i>na pilha de chamadas</span>');
    if (cfg.fila) leg.push('<span><i style="box-shadow:inset 0 0 0 3px #e0a458"></i>na fila</span>');
    return html + '<div class="faixa-leg">' + leg.join("") + "</div>";
  };

  // ------------------------------------------------------------ grafo
  V.grafo = function (cfg, st) {
    var adj = st.obj(cfg.adj);
    if (!adj || !adj.a) return '<div class="vz-rot">grafo</div><span class="vazio">' + esc(cfg.adj) + " ainda não existe</span>";
    var listas = adj.a.map(function (x) { var l = st.deref(x); return l && l.a ? l.a : []; });
    var n = listas.length, R = 110, cx = 150, cy = 135, pos = [];
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + 2 * Math.PI * i / n;
      pos.push(cfg.posicoes && cfg.posicoes[i] ? cfg.posicoes[i] : [cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
    }
    var vis = cfg.vis ? st.arr(cfg.vis) : null, dist = cfg.dist ? st.arr(cfg.dist) : null;
    var atual = cfg.atual ? st.num(cfg.atual) : undefined, viz = cfg.vizinho ? st.num(cfg.vizinho) : undefined;
    var naFila = {};
    if (cfg.fila) { var f = st.arr(cfg.fila); if (f) f.forEach(function (x) { naFila[x] = 1; }); }
    var ed = "", feitas = {};
    listas.forEach(function (l, a) {
      l.forEach(function (b) {
        var k = Math.min(a, b) + "-" + Math.max(a, b);
        if (feitas[k] || !pos[b]) return; feitas[k] = 1;
        var on = (a === atual && b === viz) || (b === atual && a === viz);
        ed += '<line class="ge' + (on ? " on" : "") + '" x1="' + pos[a][0] + '" y1="' + pos[a][1] + '" x2="' + pos[b][0] + '" y2="' + pos[b][1] + '"/>';
      });
    });
    var nos = pos.map(function (p, v) {
      var cls = "gv" + (vis && vis[v] === true ? " vis" : "") + (dist && dist[v] >= 0 ? " vis" : "") + (naFila[v] ? " fila" : "") + (v === viz ? " viz" : "") + (v === atual ? " atual" : "");
      return '<g class="' + cls + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="19"/><text x="' + p[0] + '" y="' + (p[1] + 5) + '">' + v + "</text>" +
        (dist && dist[v] !== undefined ? '<text class="dist" x="' + (p[0] + 25) + '" y="' + (p[1] - 16) + '">d=' + dist[v] + "</text>" : "") + "</g>";
    }).join("");
    var lst = listas.map(function (l, v) { return v + ": [" + l.join(", ") + "]"; }).join("   ");
    return '<div class="vz-rot">grafo <code>' + esc(cfg.adj) + '</code></div><div class="grafo"><svg viewBox="0 0 300 270" width="300" height="270" role="img" aria-label="grafo">' + ed + nos + "</svg></div>" +
      '<div class="faixa-leg"><span><i style="background:#ffdcd6;border:1px solid #e0392b"></i>atual</span><span><i style="background:#fff;border:2px solid #215c7a"></i>vizinho examinado</span><span><i style="background:#d7f4e5;border:1px solid #14674c"></i>' + (cfg.dist ? "distância descoberta" : "visitado") + "</span>" + (cfg.fila ? '<span><i style="background:#fff;border:2px solid #e0a458"></i>na fila</span>' : "") + '</div><div class="faixa-leg" style="font-family:var(--m)">' + esc(lst) + "</div>";
  };

  // ------------------------------------------------------------ árvore de chamadas
  V.arvore = function (cfg, st) {
    var ch = st.res.chamadas, i = st.i, ativos = {};
    st.frames.forEach(function (f) { ativos[f.chamada] = 1; });
    var metodos = cfg.metodos ? new Set(cfg.metodos) : null;
    var vis = ch.filter(function (c) { return c && c.ini <= i && c.metodo !== "main" && (!metodos || metodos.has(c.metodo)); });
    if (!vis.length) return '<div class="vz-rot">' + esc(cfg.titulo || "árvore de chamadas") + '</div><span class="vazio" style="font-size:13px;color:var(--ink-3)">nenhuma chamada ainda</span>';
    var porId = {}, filhos = {};
    vis.forEach(function (c) { porId[c.id] = c; filhos[c.id] = []; });
    function paiVis(c) { var p = c.pai; while (p !== null && p !== undefined && !porId[p]) p = ch[p] ? ch[p].pai : null; return p; }
    var raizes = [];
    vis.forEach(function (c) { var p = paiVis(c); if (p !== null && p !== undefined && porId[p]) filhos[p].push(c.id); else raizes.push(c.id); });
    var pos = {}, prox = 0, prof = 0;
    function lay(id, d) {
      prof = Math.max(prof, d);
      var fs = filhos[id];
      if (!fs.length) { pos[id] = { x: prox++, y: d }; return; }
      fs.forEach(function (f) { lay(f, d + 1); });
      pos[id] = { x: (pos[fs[0]].x + pos[fs[fs.length - 1]].x) / 2, y: d };
    }
    raizes.forEach(function (r) { lay(r, 0); });
    var W = cfg.largura || 96, H = 58, PAD = 14;
    var larg = prox * W + PAD * 2, alt = (prof + 1) * H + PAD * 2;
    function px(id) { return PAD + pos[id].x * W + W / 2; }
    function py(id) { return PAD + pos[id].y * H + 16; }
    var ed = "", nos = "";
    vis.forEach(function (c) {
      filhos[c.id].forEach(function (f) { ed += '<path class="ae' + (ativos[f] ? " ativo" : "") + '" d="M' + px(c.id) + " " + (py(c.id) + 12) + " L" + px(f) + " " + (py(f) - 12) + '"/>'; });
    });
    var topo = st.passo.chamadaAtual;
    vis.forEach(function (c) {
      var rot = cfg.rotulo ? cfg.rotulo(c, st) : c.metodo + "(" + c.args.map(function (a) { return a.split("=")[1]; }).join(",") + ")";
      var feito = c.fim !== undefined && c.fim <= i;
      var w = Math.min(W - 6, Math.max(40, rot.length * 6.7 + 12));
      var cls = "an" + (feito ? " feito" : "") + (ativos[c.id] ? " ativo" : "") + (c.id === topo ? " topo" : "") + (c.ini === i ? " entra" : "");
      var ret = feito && c.ret !== null && c.ret !== undefined ? (cfg.retorno ? cfg.retorno(c) : "↩ " + c.ret) : "";
      nos += '<g class="' + cls + '"><title>' + esc(c.metodo + "(" + c.args.join(", ") + ")" + (c.ret != null ? " → " + c.ret : "")) + '</title><rect x="' + (px(c.id) - w / 2) + '" y="' + (py(c.id) - 12) + '" width="' + w + '" height="24" rx="6"/><text x="' + px(c.id) + '" y="' + (py(c.id) + 4) + '">' + esc(rot) + "</text>" +
        (ret ? '<text class="rv" x="' + px(c.id) + '" y="' + (py(c.id) + 27) + '">' + esc(ret) + "</text>" : "") + "</g>";
    });
    return '<div class="vz-rot">' + esc(cfg.titulo || "árvore de chamadas") + ' <code>' + vis.length + " chamada(s)</code></div>" +
      '<div class="arv" data-arv><svg width="' + larg + '" height="' + alt + '" viewBox="0 0 ' + larg + " " + alt + '" role="img" aria-label="árvore de chamadas">' + ed + nos + "</svg></div>" +
      '<div class="faixa-leg"><span><i style="background:#ffdcd6;border:1px solid #e0392b"></i>rodando agora</span><span><i style="background:#fff6f4;border:1px solid #e0392b"></i>na pilha, esperando</span><span><i style="background:#f3f7f6;border:1px solid #c9d5d6"></i>já terminou (↩ valor devolvido)</span></div>';
  };

  // ------------------------------------------------------------ coleções (fila, pilha, listas)
  V.colecoes = function (cfg, st) {
    var html = '<div class="vz-rot">' + esc(cfg.titulo || "coleções") + '</div><div class="cols">';
    cfg.nomes.forEach(function (nome) {
      var o = st.obj(nome);
      html += '<div class="colv"><span class="nm">' + esc(nome) + "</span>";
      if (!o) { html += '<span class="vazio">ainda não existe</span></div>'; return; }
      var itens = o.k === "set" || o.k === "map" ? o.e.map(function (x) { return o.k === "map" ? x[0] + "=" + fmt(x[1]) : x[0]; }) : (o.a || []).map(fmt);
      if (!itens.length) html += '<span class="vazio">vazia</span>';
      itens.forEach(function (x, k) {
        var cls = "chip" + (o.k === "deque" && !o.pilha && k === 0 ? " frente" : "") + ((o.k === "deque" && o.pilha && k === itens.length - 1) ? " topo" : "");
        html += '<span class="' + cls + '">' + esc(x) + "</span>";
      });
      if (o.k === "deque" && itens.length) html += '<span class="vazio">' + (o.pilha ? "← topo" : "← frente … fim →") + "</span>";
      html += "</div>";
    });
    function fmt(x) {
      var d = st.deref(x);
      if (d && typeof d === "object") return d.a ? "[" + d.a.map(fmt).join(", ") + "]" : d.k === "sb" ? d.s : "…";
      return mostraVal(d);
    }
    return html + "</div>";
  };

  // ------------------------------------------------------------ html livre
  V.html = function (cfg, st) { return cfg.fn(st) || ""; };

  G.desenhaViz = function (lista, st) {
    return lista.map(function (cfg) {
      var f = V[cfg.tipo];
      try { return '<div class="vz">' + (f ? f(cfg, st) : "") + "</div>"; }
      catch (e) { return '<div class="vz"><span class="vazio">(visualização indisponível neste passo)</span></div>'; }
    }).join("");
  };
})();
