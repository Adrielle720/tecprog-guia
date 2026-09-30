/* Utilitários compartilhados: HTML, realce de Java e de pseudocódigo,
   mini-formato de texto, diff de linhas, armazenamento local, editor. */
(function () {
  "use strict";
  var G = window.Guia = window.Guia || {};

  G.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };

  var RE_JAVA = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(abstract|class|extends|static|void|int|long|double|boolean|char|new|return|if|else|while|for|do|break|continue|throw|public|private|protected|final|import|try|catch|null|this|true|false|switch|case|default)\b|\b(String|Integer|List|ArrayList|Deque|ArrayDeque|Queue|Map|HashMap|Set|HashSet|Arrays|Math|System|StringBuilder|Character|Collections|IllegalArgumentException|[A-Z][A-Za-z0-9]*)\b|\b(\d+)\b/g;
  G.realce = function (linha) {
    return G.esc(linha).replace(/&quot;/g, '"').replace(RE_JAVA, function (m, c, s, k, t, n) {
      if (c) return '<span class="c">' + c + "</span>";
      if (s) return '<span class="s">' + s.replace(/"/g, "&quot;") + "</span>";
      if (k) return '<span class="k">' + k + "</span>";
      if (t) return '<span class="ty">' + t + "</span>";
      if (n) return '<span class="n">' + n + "</span>";
      return m;
    });
  };
  G.realcePseudo = function (txt) {
    return G.esc(txt).replace(/\b(IF|THEN|ELSE|WHILE|DO|FOR|TO|RETURN|RETORNA|AND|OR|NOT|PARA CADA|DE|EM|CADA|IMPRIME|ERRO|TRUE|FALSE|Input|Output)\b/g, '<span class="kw">$1</span>');
  };

  // «código»  **negrito**  ~~~ bloco ~~~  - lista  [[aula-06|texto]] link
  function inline(t) {
    return G.esc(t)
      .replace(/«([^»]*)»/g, '<code class="inl">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, function (m, href, txt) { return '<a href="' + href + '">' + txt + "</a>"; })
      .replace(/(https:\/\/[^\s<)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }
  G.inline = inline;
  G.md = function (t) {
    if (!t) return "";
    var out = [], partes = String(t).split(/^~~~(\w*)\s*$/m);
    for (var i = 0; i < partes.length; i++) {
      var p = partes[i];
      if (i % 3 === 2) { // bloco de código
        var lang = partes[i - 1], cod = p.replace(/^\n|\n$/g, "");
        out.push(lang === "pseudo" ? '<div class="code pseudo"><pre>' + G.realcePseudo(cod) + "</pre></div>" : '<div class="code"><pre>' + cod.split("\n").map(G.realce).join("\n") + "</pre></div>");
        continue;
      }
      if (i % 3 === 1) continue;
      p.split(/\n{2,}/).forEach(function (bloco) {
        bloco = bloco.replace(/^\n+|\n+$/g, "");
        if (!bloco) return;
        var ls = bloco.split("\n"), k = ls.findIndex(function (l) { return /^(- |\d+\. )/.test(l); });
        if (k < 0) { out.push("<p>" + inline(ls.join(" ")) + "</p>"); return; }
        if (k > 0) out.push("<p>" + inline(ls.slice(0, k).join(" ")) + "</p>");
        var ord = /^\d+\. /.test(ls[k]), itens = [], atual = null;
        ls.slice(k).forEach(function (l) { if (/^(- |\d+\. )/.test(l)) { atual = l.replace(/^(- |\d+\. )/, ""); itens.push(atual); } else itens[itens.length - 1] += " " + l.trim(); });
        out.push((ord ? "<ol>" : "<ul>") + itens.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") + (ord ? "</ol>" : "</ul>"));
      });
    }
    return out.join("");
  };

  // diff de linhas (LCS): [["=", linha], ["+", linha], ["-", linha]]
  G.diff = function (a, b) {
    var n = a.length, m = b.length, L = [];
    for (var i = 0; i <= n; i++) L.push(new Uint16Array(m + 1));
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) L[i][j] = a[i].trim() === b[j].trim() ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var out = [], x = 0, y = 0;
    while (x < n || y < m) {
      if (x < n && y < m && a[x].trim() === b[y].trim()) { out.push(["=", b[y]]); x++; y++; }
      else if (y < m && (x >= n || L[x][y + 1] >= L[x + 1][y])) { out.push(["+", b[y]]); y++; }
      else { out.push(["-", a[x]]); x++; }
    }
    return out;
  };
  G.diffHtml = function (a, b) {
    return '<div class="code"><pre>' + G.diff(a.split("\n"), b.split("\n")).map(function (d) {
      var h = G.realce(d[1]) || " ";
      return d[0] === "+" ? '<span class="diff-add">' + h + "</span>" : d[0] === "-" ? '<span class="diff-rem">' + h + "</span>" : h;
    }).join("\n") + "</pre></div>";
  };

  G.guarda = function (k, v) {
    try {
      if (v === undefined) { var s = localStorage.getItem("tecprog-" + k); return s ? JSON.parse(s) : null; }
      localStorage.setItem("tecprog-" + k, JSON.stringify(v));
    } catch (e) { return null; }
  };

  // ------------------------------------------------------------ editor de código
  // área de texto transparente sobre um <pre> com realce; números de linha à esquerda
  G.editor = function (el, opts) {
    opts = opts || {};
    el.classList.add("ed");
    el.innerHTML = '<div class="ed-scroll"><div class="ed-in"><div class="ed-num"></div><div class="ed-area"><pre aria-hidden="true"></pre><textarea spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="' + G.esc(opts.rotulo || "Código Java") + '"></textarea></div></div></div>';
    var ta = el.querySelector("textarea"), pre = el.querySelector("pre"), num = el.querySelector(".ed-num"), erros = {};
    function pinta() {
      var ls = ta.value.split("\n");
      pre.innerHTML = ls.map(function (l, i) { var h = G.realce(l) || " "; return erros[i + 1] ? '<span class="lerr">' + h + "</span>" : h; }).join("\n") + "\n";
      num.textContent = ls.map(function (l, i) { return i + 1; }).join("\n");
      ta.style.height = "0px";
      ta.style.height = Math.max(pre.scrollHeight, (opts.minLinhas || 8) * 21.5) + "px";
      pre.style.minHeight = ta.style.height;
    }
    ta.addEventListener("input", function () { erros = {}; pinta(); if (opts.aoMudar) opts.aoMudar(ta.value); });
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Tab") { e.preventDefault(); ta.setRangeText("    ", ta.selectionStart, ta.selectionEnd, "end"); pinta(); }
      else if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
        var ini = ta.value.lastIndexOf("\n", ta.selectionStart - 1) + 1, linha = ta.value.slice(ini, ta.selectionStart);
        var ind = /^\s*/.exec(linha)[0] + (/\{\s*$/.test(linha) ? "    " : "");
        e.preventDefault(); ta.setRangeText("\n" + ind, ta.selectionStart, ta.selectionEnd, "end"); pinta();
      } else if (e.key === "}" ) {
        var ini2 = ta.value.lastIndexOf("\n", ta.selectionStart - 1) + 1, antes = ta.value.slice(ini2, ta.selectionStart);
        if (/^\s{4,}$/.test(antes)) { ta.setRangeText(antes.slice(4), ini2, ta.selectionStart, "end"); }
      }
      if (opts.aoTeclar) opts.aoTeclar(e);
    });
    var api = {
      valor: function (v) { if (v === undefined) return ta.value; ta.value = v; erros = {}; pinta(); },
      erros: function (ls) { erros = {}; (ls || []).forEach(function (l) { erros[l] = 1; }); pinta(); },
      foco: function () { ta.focus(); },
      textarea: ta
    };
    api.valor(opts.valor || "");
    return api;
  };
})();
