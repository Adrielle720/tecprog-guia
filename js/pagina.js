/* =============================================================================
   PÁGINAS — monta o esqueleto (topo + trilho) e o conteúdo de cada página:
   <body data-pagina="algoritmo" data-algo="busca-binaria" data-base="../">
   <body data-pagina="inicio" data-base="">   <body data-pagina="simulados" data-base="">
   ============================================================================= */
(function () {
  "use strict";
  var G = window.Guia, esc = G.esc, md = G.md;
  var B = document.body, base = B.getAttribute("data-base") || "", tipo = B.getAttribute("data-pagina"), slugAtual = B.getAttribute("data-algo");

  G.url = function (slug) { return base + "algoritmos/" + slug + ".html"; };
  G.todos = function () { var t = []; G.INDICE.forEach(function (g) { g.itens.forEach(function (x) { x.grupo = g.grupo; t.push(x); }); }); return t; };

  function esqueleto(conteudo) {
    var nav = G.INDICE.map(function (g) {
      return '<div class="sn-grupo"><div class="sn-cab">' + esc(g.grupo) + "</div>" + g.itens.map(function (x) {
        var on = x.slug === slugAtual;
        return '<a class="sn-link' + (on ? " on" : "") + '" href="' + G.url(x.slug) + '"' + (on ? ' aria-current="page"' : "") + '><span class="n">' + esc(x.aula) + "</span>" + esc(x.titulo) + "</a>" +
          (on ? ["ideia", "depurador", "problemas", "variacoes", "erros", "perguntas", "pratique"].map(function (s) { return '<a class="sn-sub" href="#' + s + '">' + { ideia: "A ideia", depurador: "Veja rodar", problemas: "Problemas que resolve", variacoes: "O que muda em cada problema", erros: "Erros comuns", perguntas: "Perguntas", pratique: "Pratique" }[s] + "</a>"; }).join("") : "");
      }).join("") + "</div>";
    }).join("");
    B.innerHTML =
      '<header class="topbar"><button type="button" class="menu-btn" aria-label="Abrir menu" data-menu>☰</button>' +
        '<a class="brand" href="' + base + 'index.html"><span class="brand-icon">{ }</span><span>Algoritmos em movimento <small>· Técnicas de Programação</small></span></a>' +
        '<span class="profile"><span class="av">A</span><span class="nome">Espaço da Adrielle</span></span></header>' +
      '<div class="shell"><aside class="side" aria-label="Algoritmos"><div class="side-t">Sua trilha de estudo</div>' +
        '<div class="sn-grupo"><a class="sn-link' + (tipo === "inicio" ? " on" : "") + '" href="' + base + 'index.html"><span class="n">★</span>Início</a>' +
        '<a class="sn-link' + (tipo === "simulados" ? " on" : "") + '" href="' + base + 'simulados.html"><span class="n">✎</span>Simulados</a></div>' + nav +
      '</aside><main class="wrap" id="conteudo">' + conteudo + '<footer class="rod">Material de base: Técnicas de Programação (Insper), aulas 05 a 17. Os códigos rodam num interpretador de Java feito em JavaScript e conferido contra o <code class="inl">javac</code>: mesmas saídas e mesmas exceções.</footer></main></div>';
    B.addEventListener("click", function (e) { if (e.target.closest("[data-menu]")) B.classList.toggle("menu-aberto"); else if (!e.target.closest(".side")) B.classList.remove("menu-aberto"); });
  }

  // ------------------------------------------------------------ página de algoritmo
  function paginaAlgoritmo() {
    var A = G.ALG[slugAtual];
    if (!A) { esqueleto("<p>Algoritmo não encontrado.</p>"); return; }
    document.title = A.titulo + " · Algoritmos em movimento";
    var h = '<div class="breadcrumb"><a href="' + base + 'index.html">Início</a> / ' + esc(A.grupo) + " / " + esc(A.titulo) + "</div>" +
      '<header class="hero"><div class="eyebrow">' + esc(A.aula) + " · " + esc(A.grupo) + "</div><h1>" + esc(A.titulo) + '</h1><p class="lead">' + G.inline(A.resumo) + "</p>" +
      '<div class="custos">' + (A.custos || []).map(function (c) { return '<div class="custo"><span>' + esc(c[0]) + "</span><b>" + esc(c[1]) + "</b></div>"; }).join("") + "</div>" +
      '<nav class="indice-pagina" aria-label="Nesta página"><a href="#ideia">A ideia</a><a href="#depurador">▶ Veja rodar</a><a href="#problemas">Problemas que resolve</a><a href="#variacoes">O que muda</a><a href="#erros">Erros comuns</a><a href="#perguntas">Perguntas</a><a href="#pratique">Pratique</a></nav></header>';

    h += '<section class="sec" id="ideia"><div class="eyebrow">1 · a ideia</div><h2>Como funciona</h2><div class="prose">' + md(A.ideia) + "</div>" +
      (A.pseudo ? '<h3>Pseudocódigo (como na aula)</h3><div class="code pseudo"><pre>' + G.realcePseudo(A.pseudo) + "</pre></div>" : "") +
      (A.invariante ? '<div class="nota inv"><b>Invariante: a frase que explica por que funciona</b>' + md(A.invariante) + "</div>" : "") + "</section>";

    h += '<section class="sec" id="depurador"><div class="eyebrow">2 · veja rodar</div><h2>O algoritmo rodando, linha por linha</h2>' +
      '<p class="sub">Aperte <b>▶ Rodar</b> e acompanhe sozinho, ou vá passo a passo com <b>▶|</b> (ou as setas do teclado). <b>⤼ por cima</b> pula para depois de uma chamada; <b>⤴ sair</b> termina a chamada atual. Troque os valores da entrada ou clique em <b>✎ Editar o código</b> para rodar a sua própria versão.</p>' +
      '<div data-dep></div></section>';

    h += '<section class="sec" id="problemas"><div class="eyebrow">3 · para que serve</div><h2>Que problemas resolve</h2><div class="prose">' + md(A.problemas.resolve) + "</div>" +
      '<h3>Problemas clássicos</h3><div class="grade2">' + A.problemas.classicos.map(function (p) {
        return '<div class="prob"><h4>' + esc(p.nome) + "</h4>" + (p.onde ? '<span class="lc">' + esc(p.onde) + "</span>" : "") + "<p>" + G.inline(p.ideia) + '</p><div class="muda"><b>O que muda:</b> ' + G.inline(p.muda) + "</div></div>";
      }).join("") + "</div></section>";

    h += '<section class="sec" id="variacoes"><div class="eyebrow">4 · adaptar</div><h2>O que muda no algoritmo para cada problema</h2><p class="sub">A ideia central fica. Muda um detalhe: a condição, a direção ou o que você guarda. Em verde, as linhas que mudam em relação à versão da aula; em vermelho, as que saem. Rode cada variação no depurador.</p>' +
      A.variacoes.map(function (v, k) {
        return '<div class="var"><h4>' + esc(v.nome) + '</h4><p class="quando"><b>Quando:</b> ' + G.inline(v.quando) + '</p><div class="prose">' + md(v.muda) + "</div>" +
          G.diffHtml(v.base || G.montaCodigo(A.programas[0], G.valoresPadrao(A.programas[0])), v.codigo) +
          '<div class="acoes"><button type="button" class="btn play" data-var="' + k + '">▶ Rodar esta variação no depurador</button></div></div>';
      }).join("") + "</section>";

    h += '<section class="sec" id="erros"><div class="eyebrow">5 · cuidado</div><h2>Erros comuns</h2><div class="grade2">' + A.erros.map(function (e, k) {
      return '<div class="erro-c"><h4>' + esc(e.erro) + "</h4><p>" + G.inline(e.porque) + "</p>" + (e.codigo ? '<button type="button" class="btn" data-erro="' + k + '">▶ ver o erro acontecer</button>' : "") + "</div>";
    }).join("") + "</div></section>";

    h += '<section class="sec" id="perguntas"><div class="eyebrow">6 · teste-se</div><h2>Perguntas</h2><p class="sub">Tente responder antes de abrir. Marque <b>✓ sei</b> ou <b>↺ revisar</b>: fica salvo neste navegador.</p><div data-perg></div></section>';

    var exs = (A.exercicios || []);
    h += '<section class="sec" id="pratique"><div class="eyebrow">7 · mão na massa</div><h2>Pratique</h2><p class="sub">Simule, complete as linhas que faltam e escreva o código do zero. A correção roda testes de verdade. Mais exercícios de todos os algoritmos em <a href="' + base + 'simulados.html">Simulados</a>.</p><div class="pg-lista" data-exs></div></section>';

    esqueleto(h);
    var dep = G.depurador(document.querySelector("[data-dep]"), { programas: A.programas });
    document.querySelectorAll("[data-var]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = A.variacoes[+b.getAttribute("data-var")];
        dep.adicionar(Object.assign({ id: "var" + b.getAttribute("data-var"), nome: "variação: " + (v.curto || v.nome) }, v.programa || {}, { codigo: v.codigo, entradas: (v.programa && v.programa.entradas) || [], viz: (v.programa && v.programa.viz) || A.programas[0].viz, tabela: (v.programa && v.programa.tabela) || null, dicas: (v.programa && v.programa.dicas) || [] }), true);
      });
    });
    document.querySelectorAll("[data-erro]").forEach(function (b) {
      b.addEventListener("click", function () {
        var e = A.erros[+b.getAttribute("data-erro")];
        dep.adicionar({ id: "erro" + b.getAttribute("data-erro"), nome: "com erro: " + (e.curto || e.erro), codigo: e.codigo, entradas: [], viz: e.viz || A.programas[0].viz, dicas: [] }, true);
      });
    });
    G.perguntas(document.querySelector("[data-perg]"), slugAtual, A.perguntas);
    var box = document.querySelector("[data-exs]");
    exs.forEach(function (ex) { var d = document.createElement("div"); box.appendChild(d); G.exercicio(d, ex); });
  }

  // ------------------------------------------------------------ início
  function paginaInicio() {
    var h = '<header class="hero"><div class="eyebrow">Técnicas de Programação · Insper</div><h1>Algoritmos em movimento</h1>' +
      '<p class="lead">Cada algoritmo da disciplina rodando de verdade, linha por linha: o código Java acende a linha atual, os ponteiros andam pelo array, a pilha de chamadas cresce e encolhe e as variáveis mudam na sua frente. Depois, perguntas, problemas clássicos, o que muda em cada variação e simulados com código para completar e para escrever.</p></header>';
    G.INDICE.forEach(function (g) {
      h += '<section class="sec"><div class="eyebrow">' + esc(g.grupo) + '</div><div class="cards-alg">' + g.itens.map(function (x) {
        return '<a class="ca" href="' + G.url(x.slug) + '"><span class="au">' + esc(x.aula) + "</span><h3>" + esc(x.titulo) + "</h3><p>" + G.inline(x.resumo) + '</p><span class="cx2">' + esc(x.custo || "") + "</span></a>";
      }).join("") + "</div></section>";
    });
    h += '<section class="sec"><div class="eyebrow">treino</div><div class="cards-alg"><a class="ca" href="simulados.html"><span class="au">todos os algoritmos</span><h3>Simulados</h3><p>Simule o código, complete as linhas que faltam e escreva do zero. Tudo corrigido rodando testes.</p><span class="cx2">▶ começar</span></a></div></section>';
    esqueleto(h);
  }

  // ------------------------------------------------------------ simulados
  function paginaSimulados() {
    var todos = [];
    G.todos().forEach(function (x) {
      var A = G.ALG[x.slug];
      if (A) (A.exercicios || []).concat(A.simulado || []).forEach(function (ex) { ex.algo = x.slug; ex.algoNome = x.titulo; ex.algoUrl = G.url(x.slug); todos.push(ex); });
    });
    var h = '<header class="hero"><div class="eyebrow">treino para a prova</div><h1>Simulados</h1><p class="lead">' + todos.length + ' exercícios de todos os algoritmos. <b>Simule</b> o código e digite o resultado, <b>complete</b> as linhas que faltam ou <b>escreva</b> o método do zero no editor. A correção roda o seu código contra testes, então qualquer solução correta passa.</p></header>' +
      '<div class="progresso"><div class="barra"><span class="b1"></span></div><span class="t" data-placar></span></div>' +
      '<div class="filtros" data-ftipo><button type="button" class="preset" data-t="todos" aria-pressed="true">todos os tipos</button>' + Object.keys(G.ROTULO_EX).map(function (t) { return '<button type="button" class="preset" data-t="' + t + '" aria-pressed="false">' + G.ROTULO_EX[t] + "</button>"; }).join("") + "</div>" +
      '<div class="filtros" data-falgo><button type="button" class="preset" data-a="todos" aria-pressed="true">todos os algoritmos</button>' + G.todos().map(function (x) { return '<button type="button" class="preset" data-a="' + x.slug + '" aria-pressed="false">' + esc(x.titulo) + "</button>"; }).join("") + "</div>" +
      '<div class="pg-lista" data-lista></div>';
    esqueleto(h);
    var lista = document.querySelector("[data-lista]"), fT = "todos", fA = "todos", els = [];
    todos.forEach(function (ex) { var d = document.createElement("div"); lista.appendChild(d); G.exercicio(d, ex, { mostraAlgo: true, aoMudar: placar }); els.push([d, ex]); });
    function filtra() { els.forEach(function (x) { x[0].hidden = !((fT === "todos" || x[1].tipo === fT) && (fA === "todos" || x[1].algo === fA)); }); }
    function placar() {
      var ok = todos.filter(function (ex) { var s = G.guarda("ex-" + ex.id); return s && s.ok; }).length;
      document.querySelector(".progresso .b1").style.width = ok / todos.length * 100 + "%";
      document.querySelector("[data-placar]").textContent = ok + " de " + todos.length + " feitos";
    }
    document.querySelector("[data-ftipo]").addEventListener("click", function (e) { var b = e.target.closest("[data-t]"); if (!b) return; fT = b.getAttribute("data-t"); this.querySelectorAll("[data-t]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); filtra(); });
    document.querySelector("[data-falgo]").addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (!b) return; fA = b.getAttribute("data-a"); this.querySelectorAll("[data-a]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); filtra(); });
    var alvo = location.hash.slice(1);
    if (alvo && G.ALG[alvo]) { fA = alvo; document.querySelectorAll("[data-falgo] [data-a]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-a") === alvo); }); filtra(); }
    placar();
  }

  if (tipo === "algoritmo") paginaAlgoritmo();
  else if (tipo === "simulados") paginaSimulados();
  else paginaInicio();
})();
