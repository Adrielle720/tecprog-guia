/* =============================================================================
   JAVA — interpretador de um subconjunto de Java, escrito em JavaScript.
   Cobre o Java usado em Técnicas de Programação: classes com métodos static,
   campos, classes simples com construtor, arrays (1D e 2D), String,
   StringBuilder, ArrayList/List, ArrayDeque/Deque/Queue/Stack,
   HashMap/HashSet, Math, Arrays, Collections, Integer, Character.

   Semântica de Java: int de 32 bits (estoura), divisão inteira, char como
   caractere, exceções com as mesmas mensagens da JVM.

   Com opts.rastrear, grava cada passo (linha executada, variáveis de cada
   chamada, conteúdo dos arrays, leituras/escritas, árvore de chamadas).

   API:
     Java.compilar(fonte)                      -> { ok, prog, erros }
     Java.executar(prog, opts)                 -> roda o main()
     Java.chamar(prog, metodo, argsJS, opts)   -> chama um método static
   ============================================================================= */
(function (G) {
  "use strict";

  // ------------------------------------------------------------------ LEXER
  var KW = new Set(("abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws try void volatile while true false var").split(" "));
  var OPS = [">>>=", "<<=", ">>=", "...", "->", "::", "++", "--", "&&", "||", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<",
    "(", ")", "{", "}", "[", "]", ";", ",", ".", "@", "=", "<", ">", "!", "~", "?", ":", "+", "-", "*", "/", "&", "|", "^", "%"];

  function ErroCompilacao(msg, linha, col) { this.msg = msg; this.linha = linha; this.col = col; }

  function lexer(src) {
    var toks = [], i = 0, linha = 1, iniLinha = 0, n = src.length;
    function erro(m) { throw new ErroCompilacao(m, linha, i - iniLinha + 1); }
    while (i < n) {
      var c = src[i];
      if (c === "\n") { linha++; i++; iniLinha = i; continue; }
      if (c === " " || c === "\t" || c === "\r" || c === "\f") { i++; continue; }
      if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") {
        i += 2;
        while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") { linha++; iniLinha = i + 1; } i++; }
        if (i >= n) erro("comentário /* sem fechamento");
        i += 2; continue;
      }
      var ini = i, col = i - iniLinha + 1, tok = { linha: linha, col: col, pos: i };
      if (/[A-Za-z_$]/.test(c)) {
        while (i < n && /[A-Za-z0-9_$]/.test(src[i])) i++;
        var w = src.slice(ini, i);
        tok.t = KW.has(w) ? "kw" : "id"; tok.v = w;
      } else if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] || ""))) {
        var hex = false;
        if (c === "0" && /[xX]/.test(src[i + 1] || "")) { i += 2; hex = true; while (i < n && /[0-9a-fA-F_]/.test(src[i])) i++; }
        else {
          while (i < n && /[0-9_]/.test(src[i])) i++;
          if (src[i] === "." && /[0-9]/.test(src[i + 1] || "")) { i++; while (i < n && /[0-9_]/.test(src[i])) i++; }
          else if (src[i] === "." && !/[A-Za-z_]/.test(src[i + 1] || "")) i++;
          if (/[eE]/.test(src[i] || "")) { i++; if (/[+-]/.test(src[i])) i++; while (i < n && /[0-9]/.test(src[i])) i++; }
        }
        var txt = src.slice(ini, i).replace(/_/g, ""), suf = src[i] || "";
        tok.t = "num";
        if (/[lL]/.test(suf)) { i++; tok.tipo = "long"; tok.v = hex ? parseInt(txt, 16) : parseInt(txt, 10); }
        else if (/[fFdD]/.test(suf) && !hex) { i++; tok.tipo = "double"; tok.v = parseFloat(txt); }
        else if (!hex && /[.eE]/.test(txt)) { tok.tipo = "double"; tok.v = parseFloat(txt); }
        else {
          tok.tipo = "int"; tok.v = hex ? parseInt(txt, 16) | 0 : Number(txt);
          if (!hex && tok.v > 2147483648) { i = ini; erro("número inteiro grande demais para int: " + txt); }
        }
      } else if (c === '"') {
        if (src.slice(i, i + 3) === '"""') erro("text blocks (\"\"\") não são suportados");
        i++; var s = "";
        while (i < n && src[i] !== '"') { if (src[i] === "\n") erro("string sem fechamento"); if (src[i] === "\\") { s += escape(); } else s += src[i++]; }
        if (i >= n) erro("string sem fechamento");
        i++; tok.t = "str"; tok.v = s;
      } else if (c === "'") {
        i++; var ch;
        if (src[i] === "\\") ch = escape(); else ch = src[i++];
        if (src[i] !== "'") erro("literal de char inválido");
        i++; tok.t = "chr"; tok.v = ch;
      } else {
        var op = null;
        for (var k = 0; k < OPS.length; k++) if (src.startsWith(OPS[k], i)) { op = OPS[k]; break; }
        if (!op) erro("símbolo inesperado: " + c);
        i += op.length; tok.t = "op"; tok.v = op;
      }
      tok.fim = i;
      toks.push(tok);
    }
    toks.push({ t: "eof", v: "<fim do arquivo>", linha: linha, col: i - iniLinha + 1, pos: n, fim: n });
    return toks;
    function escape() {
      i++; var e = src[i++];
      switch (e) {
        case "n": return "\n"; case "t": return "\t"; case "r": return "\r"; case "b": return "\b"; case "f": return "\f";
        case "0": return "\0"; case "'": return "'"; case '"': return '"'; case "\\": return "\\";
        case "u": { while (src[i] === "u") i++; var h = src.substr(i, 4); i += 4; return String.fromCharCode(parseInt(h, 16)); }
        default: erro("escape inválido: \\" + e);
      }
    }
  }

  // ------------------------------------------------------------------ TIPOS
  function T(n, d, a) { return { n: n, d: d || 0, a: a || [] }; }
  var PRIM = new Set(["int", "long", "short", "byte", "char", "boolean", "double", "float", "void"]);
  var BOX = { Integer: "int", Long: "long", Short: "short", Byte: "byte", Character: "char", Boolean: "boolean", Double: "double", Float: "float" };
  var UNBOX_INV = { int: "Integer", long: "Long", short: "Short", byte: "Byte", char: "Character", boolean: "Boolean", double: "Double", float: "Float" };
  var T_INT = T("int"), T_LONG = T("long"), T_DOUBLE = T("double"), T_BOOL = T("boolean"), T_CHAR = T("char"), T_STR = T("String"), T_VOID = T("void"), T_NULL = T("null"), T_OBJ = T("Object"), T_DESC = T("?");
  function tStr(t) {
    if (!t) return "?";
    var s = t.n + (t.a.length ? "<" + t.a.map(tStr).join(", ") + ">" : "");
    for (var i = 0; i < t.d; i++) s += "[]";
    return s;
  }
  function prim(t) { if (!t || t.d) return null; if (PRIM.has(t.n)) return t.n; if (BOX[t.n]) return BOX[t.n]; return null; }
  function numerico(t) { var p = prim(t); return p && p !== "boolean" && p !== "void"; }
  function integral(t) { var p = prim(t); return p === "int" || p === "long" || p === "short" || p === "byte" || p === "char"; }
  function ehString(t) { return t && t.d === 0 && t.n === "String"; }
  function ehChar(t) { return prim(t) === "char"; }
  function ehDouble(t) { var p = prim(t); return p === "double" || p === "float"; }
  function promove(a, b) {
    var x = prim(a), y = prim(b);
    if (x === "double" || y === "double" || x === "float" || y === "float") return T_DOUBLE;
    if (x === "long" || y === "long") return T_LONG;
    return T_INT;
  }
  function elem(t) { if (!t) return T_DESC; if (t.d > 0) return T(t.n, t.d - 1, t.a); return T_DESC; }
  function arg(t, i) { return t && t.a && t.a[i] ? t.a[i] : T_DESC; }
  function mesmoTipo(a, b) { return tStr(a) === tStr(b); }

  // ------------------------------------------------------------------ PARSER
  function Parser(src) {
    this.src = src;
    this.toks = lexer(src);
    this.i = 0;
  }
  var P = Parser.prototype;
  P.pk = function (k) { return this.toks[Math.min(this.i + (k || 0), this.toks.length - 1)]; };
  P.nx = function () { return this.toks[this.i++]; };
  P.eh = function (v, k) { var t = this.pk(k); return (t.t === "op" || t.t === "kw") && t.v === v; };
  P.aceita = function (v) { if (this.eh(v)) { return this.nx(); } return null; };
  P.erro = function (msg, tok) { tok = tok || this.pk(); throw new ErroCompilacao(msg, tok.linha, tok.col); };
  P.espera = function (v, oque) {
    if (this.eh(v)) return this.nx();
    var t = this.pk();
    this.erro("esperava '" + v + "'" + (oque ? " " + oque : "") + ", mas encontrou '" + t.v + "'");
  };
  P.id = function (oque) {
    var t = this.pk();
    if (t.t !== "id") this.erro("esperava " + (oque || "um nome") + ", mas encontrou '" + t.v + "'");
    return this.nx().v;
  };
  P.no = function (tipo, tok, extra) {
    var n = extra || {};
    n.k = tipo; n.linha = tok.linha; n.pos = tok.pos;
    return n;
  };
  P.fecha = function (n) { n.fim = this.toks[this.i - 1].fim; return n; };

  P.programa = function () {
    var classes = [];
    while (this.pk().t !== "eof") {
      if (this.aceita("import") || this.aceita("package")) { while (!this.aceita(";")) { if (this.pk().t === "eof") this.erro("esperava ';'"); this.nx(); } continue; }
      if (this.aceita(";")) continue;
      this.modificadores();
      if (this.eh("class")) this.classe(classes, null);
      else if (this.eh("interface") || this.eh("enum")) this.erro("interface/enum não são suportados aqui");
      else if (classes.length === 0) {
        // sem "class": trata tudo como corpo de uma classe
        return this.soltos();
      } else this.erro("esperava 'class', mas encontrou '" + this.pk().v + "'");
    }
    if (!classes.length) this.erro("nenhuma classe encontrada");
    return { classes: classes };
  };
  // código solto (só métodos): embrulha numa classe Main
  P.soltos = function () {
    this.i = 0;
    var cl = { nome: "Main", campos: [], metodos: [], construtores: [], linha: 1 };
    while (this.pk().t !== "eof") this.membro(cl, []);
    return { classes: [cl] };
  };
  P.modificadores = function () {
    var m = { estatico: false };
    for (;;) {
      var t = this.pk();
      if (t.t === "kw" && /^(public|private|protected|static|final|abstract|synchronized|transient|volatile)$/.test(t.v)) { if (t.v === "static") m.estatico = true; this.nx(); continue; }
      if (t.t === "op" && t.v === "@") { this.nx(); this.id("anotação"); if (this.eh("(")) { var p = 0; do { if (this.eh("(")) p++; if (this.eh(")")) p--; this.nx(); } while (p > 0); } continue; }
      return m;
    }
  };
  P.classe = function (classes, externa) {
    var tk = this.espera("class");
    var cl = { nome: this.id("o nome da classe"), campos: [], metodos: [], construtores: [], linha: tk.linha, externa: externa };
    if (this.aceita("<")) this.erro("classes genéricas não são suportadas");
    if (this.aceita("extends")) this.tipo();
    if (this.aceita("implements")) { this.tipo(); while (this.aceita(",")) this.tipo(); }
    classes.push(cl);
    this.espera("{", "para abrir a classe");
    while (!this.aceita("}")) {
      if (this.pk().t === "eof") this.erro("faltou '}' para fechar a classe " + cl.nome);
      this.membro(cl, classes);
    }
    return cl;
  };
  P.membro = function (cl, classes) {
    if (this.aceita(";")) return;
    var tk = this.pk(), mods = this.modificadores();
    if (this.eh("class")) { this.classe(classes, cl.nome); return; }
    if (this.eh("{")) { this.bloco(); return; }
    if (this.pk().t === "id" && this.pk().v === cl.nome && this.eh("(", 1)) {
      var tkc = this.nx();
      var ctor = { nome: cl.nome, params: this.params(), classe: cl.nome, estatico: false, linha: tkc.linha, ctor: true };
      if (this.aceita("throws")) { this.tipo(); while (this.aceita(",")) this.tipo(); }
      ctor.corpo = this.bloco();
      cl.construtores.push(ctor);
      return;
    }
    if (this.eh("<")) this.erro("métodos genéricos não são suportados");
    var tipo = this.tipo(), tkn = this.pk(), nome = this.id("o nome do método ou campo");
    if (this.eh("(")) {
      var m = { nome: nome, tipoRet: tipo, params: this.params(), classe: cl.nome, estatico: mods.estatico, linha: tkn.linha };
      while (this.aceita("[")) { this.espera("]"); m.tipoRet = T(tipo.n, tipo.d + 1, tipo.a); }
      if (this.aceita("throws")) { this.tipo(); while (this.aceita(",")) this.tipo(); }
      if (this.aceita(";")) this.erro("método sem corpo: " + nome);
      m.corpo = this.bloco();
      cl.metodos.push(m);
      return;
    }
    // campo(s)
    for (;;) {
      var t = tipo;
      while (this.aceita("[")) { this.espera("]"); t = T(t.n, t.d + 1, t.a); }
      var campo = { nome: nome, tipo: t, estatico: mods.estatico, linha: tkn.linha, init: null };
      if (this.aceita("=")) campo.init = this.eh("{") ? this.arrayInit() : this.expr();
      cl.campos.push(campo);
      if (!this.aceita(",")) break;
      tkn = this.pk(); nome = this.id();
    }
    this.espera(";", "no fim da declaração");
  };
  P.params = function () {
    this.espera("(");
    var ps = [];
    if (!this.aceita(")")) {
      do {
        this.modificadores();
        var t = this.tipo();
        if (this.aceita("...")) t = T(t.n, t.d + 1, t.a);
        var nome = this.id("o nome do parâmetro");
        while (this.aceita("[")) { this.espera("]"); t = T(t.n, t.d + 1, t.a); }
        ps.push({ tipo: t, nome: nome });
      } while (this.aceita(","));
      this.espera(")");
    }
    return ps;
  };
  // tipo: primitivo | Nome(.Nome)*[<args>] ([])*
  P.tipo = function () {
    var t = this.pk(), nome;
    if (t.t === "kw" && PRIM.has(t.v)) { this.nx(); nome = t.v; }
    else if (t.t === "kw" && t.v === "var") { this.nx(); nome = "var"; }
    else if (t.t === "id") { nome = this.nx().v; while (this.eh(".") && this.pk(1).t === "id") { this.nx(); nome = this.nx().v; } }
    else this.erro("esperava um tipo, mas encontrou '" + t.v + "'");
    var args = [];
    if (this.eh("<")) {
      this.nx();
      if (!this.eh(">")) {
        do {
          if (this.aceita("?")) { if (this.aceita("extends") || this.aceita("super")) args.push(this.tipo()); else args.push(T_OBJ); }
          else args.push(this.tipo());
        } while (this.aceita(","));
      } else args.diamante = true;
      if (this.eh(">>")) { this.toks[this.i] = Object.assign({}, this.pk(), { v: ">" }); }
      else if (this.eh(">>>")) { this.toks[this.i] = Object.assign({}, this.pk(), { v: ">>" }); }
      else this.espera(">", "para fechar o tipo genérico");
    }
    var d = 0;
    while (this.eh("[") && this.eh("]", 1)) { this.nx(); this.nx(); d++; }
    var r = T(nome, d, args);
    if (args.diamante) r.diamante = true;
    return r;
  };
  // tenta ler "Tipo nome" sem consumir se não for declaração
  P.ehDeclaracao = function () {
    var t = this.pk();
    if (!(t.t === "id" || (t.t === "kw" && (PRIM.has(t.v) || t.v === "var" || t.v === "final")))) return false;
    var salvo = this.i;
    try {
      while (this.aceita("final")) {}
      this.tipo();
      var ok = this.pk().t === "id" && (this.eh("=", 1) || this.eh(";", 1) || this.eh(",", 1) || this.eh("[", 1) || this.eh(":", 1));
      this.i = salvo;
      return ok;
    } catch (e) { this.i = salvo; if (e instanceof ErroCompilacao) return false; throw e; }
  };

  // ---- comandos
  P.bloco = function () {
    var tk = this.espera("{", "para abrir o bloco");
    var cs = [];
    while (!this.aceita("}")) {
      if (this.pk().t === "eof") this.erro("faltou '}' para fechar o bloco aberto na linha " + tk.linha);
      cs.push(this.comando());
    }
    return this.fecha(this.no("bloco", tk, { cs: cs }));
  };
  P.comando = function () {
    var tk = this.pk();
    if (this.eh("{")) return this.bloco();
    if (this.aceita(";")) return this.no("vazio", tk);
    if (this.aceita("if")) {
      this.espera("(", "depois de if"); var c = this.expr(); this.espera(")", "para fechar a condição do if");
      var fimCond = this.toks[this.i - 1].fim;
      var entao = this.comando(), senao = null;
      if (this.aceita("else")) senao = this.comando();
      return this.no("if", tk, { cond: c, entao: entao, senao: senao, fimCab: fimCond });
    }
    if (this.aceita("while")) {
      this.espera("(", "depois de while"); var c2 = this.expr(); this.espera(")", "para fechar a condição do while");
      var fimW = this.toks[this.i - 1].fim;
      return this.no("while", tk, { cond: c2, corpo: this.comando(), fimCab: fimW });
    }
    if (this.aceita("do")) {
      var corpo = this.comando(); var tkw = this.espera("while"); this.espera("(");
      var c3 = this.expr(); this.espera(")"); this.espera(";");
      return this.no("do", tk, { cond: c3, corpo: corpo, linhaCond: tkw.linha });
    }
    if (this.aceita("for")) return this.comandoFor(tk);
    if (this.aceita("return")) {
      var e = this.eh(";") ? null : this.expr();
      this.espera(";", "depois do return");
      return this.fecha(this.no("return", tk, { e: e }));
    }
    if (this.aceita("break")) { if (this.pk().t === "id") this.erro("break com rótulo não é suportado"); this.espera(";"); return this.no("break", tk); }
    if (this.aceita("continue")) { this.espera(";"); return this.no("continue", tk); }
    if (this.aceita("throw")) { var ex = this.expr(); this.espera(";"); return this.fecha(this.no("throw", tk, { e: ex })); }
    if (this.aceita("try")) {
      var b = this.bloco(), catches = [], fin = null;
      while (this.aceita("catch")) {
        this.espera("("); this.modificadores();
        var tipos = [this.tipo().n];
        while (this.aceita("|")) tipos.push(this.tipo().n);
        var nm = this.id(); this.espera(")");
        catches.push({ tipos: tipos, nome: nm, bloco: this.bloco() });
      }
      if (this.aceita("finally")) fin = this.bloco();
      if (!catches.length && !fin) this.erro("try sem catch nem finally");
      return this.no("try", tk, { bloco: b, catches: catches, fin: fin });
    }
    if (this.aceita("switch")) return this.comandoSwitch(tk);
    if (this.eh("class")) this.erro("classe local não é suportada");
    if (this.ehDeclaracao()) { var d = this.declaracao(); this.espera(";", "no fim da declaração"); return this.fecha(d); }
    var ex2 = this.expr();
    if (!/^(atrib|chamada|incdec|novo)$/.test(ex2.k)) this.erro("isto não é um comando (faltou uma atribuição ou chamada?)", tk);
    this.espera(";", "no fim do comando");
    return this.fecha(this.no("expr", tk, { e: ex2 }));
  };
  P.declaracao = function () {
    var tk = this.pk();
    while (this.aceita("final")) {}
    var tipo = this.tipo(), ds = [];
    do {
      var tkn = this.pk(), nome = this.id("o nome da variável"), t = tipo;
      while (this.aceita("[")) { this.espera("]"); t = T(t.n, t.d + 1, t.a); }
      var init = null;
      if (this.aceita("=")) init = this.eh("{") ? this.arrayInit() : this.expr();
      ds.push({ nome: nome, tipo: t, init: init, linha: tkn.linha });
    } while (this.aceita(","));
    return this.no("decl", tk, { tipo: tipo, ds: ds });
  };
  P.comandoFor = function (tk) {
    this.espera("(", "depois de for");
    if (this.ehDeclaracao()) {
      var salvo = this.i;
      while (this.aceita("final")) {}
      var t = this.tipo(), tkn = this.pk(), nome = this.id();
      if (this.aceita(":")) {
        var col = this.expr(); this.espera(")");
        var fimC = this.toks[this.i - 1].fim;
        return this.no("foreach", tk, { tipo: t, nome: nome, col: col, corpo: this.comando(), fimCab: fimC });
      }
      this.i = salvo;
    }
    var init = [];
    if (!this.eh(";")) {
      if (this.ehDeclaracao()) init.push(this.fecha(this.declaracao()));
      else do { var tke = this.pk(); init.push(this.fecha(this.no("expr", tke, { e: this.expr() }))); } while (this.aceita(","));
    }
    this.espera(";", "no for");
    var cond = this.eh(";") ? null : this.expr();
    this.espera(";", "no for");
    var upd = [];
    if (!this.eh(")")) do { var tku = this.pk(); upd.push(this.fecha(this.no("expr", tku, { e: this.expr() }))); } while (this.aceita(","));
    this.espera(")", "para fechar o for");
    var fimCab = this.toks[this.i - 1].fim;
    return this.no("for", tk, { init: init, cond: cond, upd: upd, corpo: this.comando(), fimCab: fimCab });
  };
  P.comandoSwitch = function (tk) {
    this.espera("("); var e = this.expr(); this.espera(")"); this.espera("{");
    var casos = [];
    while (!this.aceita("}")) {
      var rot = [], def = false;
      if (this.aceita("default")) { def = true; }
      else { this.espera("case"); rot.push(this.expr()); while (this.aceita(",")) rot.push(this.expr()); }
      if (this.aceita("->")) this.erro("switch com -> não é suportado; use case X:");
      this.espera(":");
      var cs = [];
      while (!this.eh("case") && !this.eh("default") && !this.eh("}")) cs.push(this.comando());
      casos.push({ rot: rot, def: def, cs: cs });
    }
    return this.no("switch", tk, { e: e, casos: casos });
  };

  // ---- expressões
  var PREC = { "||": 1, "&&": 2, "|": 3, "^": 4, "&": 5, "==": 6, "!=": 6, "<": 7, ">": 7, "<=": 7, ">=": 7, "instanceof": 7, "<<": 8, ">>": 8, ">>>": 8, "+": 9, "-": 9, "*": 10, "/": 10, "%": 10 };
  var ATRIB = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>=", ">>>="]);
  P.expr = function () {
    var tk = this.pk(), e = this.ternario();
    var op = this.pk();
    if (op.t === "op" && ATRIB.has(op.v)) {
      this.nx();
      if (!/^(nome|campo|indice)$/.test(e.k)) this.erro("o lado esquerdo da atribuição precisa ser uma variável", tk);
      var v = this.expr();
      return this.fecha(this.no("atrib", tk, { op: op.v, alvo: e, v: v }));
    }
    // >>= escrito como > e >=
    if (op.t === "op" && op.v === ">" && this.pk(1).v === ">=" && this.pk(1).pos === op.fim) {
      this.nx(); this.nx(); var v2 = this.expr();
      return this.fecha(this.no("atrib", tk, { op: ">>=", alvo: e, v: v2 }));
    }
    return e;
  };
  P.ternario = function () {
    var tk = this.pk(), c = this.binario(1);
    if (this.aceita("?")) {
      var a = this.expr(); this.espera(":", "no operador ?:"); var b = this.ternario();
      return this.fecha(this.no("cond", tk, { c: c, a: a, b: b }));
    }
    return c;
  };
  P.opBin = function () {
    var t = this.pk();
    if (t.t === "kw" && t.v === "instanceof") return { op: "instanceof", n: 1 };
    if (t.t !== "op") return null;
    if (t.v === ">") {
      var t1 = this.pk(1), t2 = this.pk(2);
      if (t1.v === ">" && t1.pos === t.fim) {
        if (t2.v === ">" && t2.pos === t1.fim) return { op: ">>>", n: 3 };
        if (t2.v === ">=" && t2.pos === t1.fim) return null;
        return { op: ">>", n: 2 };
      }
      if (t1.v === ">=" && t1.pos === t.fim) return null; // >>= (atribuição)
    }
    return PREC[t.v] ? { op: t.v, n: 1 } : null;
  };
  P.binario = function (min) {
    var tk = this.pk(), e = this.unario();
    for (;;) {
      var o = this.opBin();
      if (!o || PREC[o.op] < min) return e;
      for (var k = 0; k < o.n; k++) this.nx();
      if (o.op === "instanceof") { var t = this.tipo(); e = this.fecha(this.no("instanceof", tk, { e: e, tipo: t })); continue; }
      var d = this.binario(PREC[o.op] + 1);
      e = this.fecha(this.no("bin", tk, { op: o.op, a: e, b: d }));
    }
  };
  P.unario = function () {
    var tk = this.pk();
    if (tk.t === "op") {
      if (tk.v === "++" || tk.v === "--") { this.nx(); var alvo = this.unario(); return this.fecha(this.no("incdec", tk, { op: tk.v, pre: true, alvo: alvo })); }
      if (tk.v === "-" || tk.v === "+" || tk.v === "!" || tk.v === "~") {
        this.nx();
        // literal negativo: -2147483648
        if (tk.v === "-" && this.pk().t === "num" && this.pk().pos === tk.fim) {
          var nt = this.nx();
          var lit = this.no("lit", tk, { v: -nt.v, tipo: T(nt.tipo) });
          if (nt.tipo === "int" && nt.v > 2147483648) this.erro("número grande demais para int");
          return this.pos(this.fecha(lit));
        }
        var e = this.unario();
        return this.fecha(this.no("un", tk, { op: tk.v, e: e }));
      }
      if (tk.v === "(") {
        var t1 = this.pk(1);
        // cast para primitivo: (int) x
        if (t1.t === "kw" && PRIM.has(t1.v)) {
          this.nx(); var tp = this.tipo(); this.espera(")");
          return this.fecha(this.no("cast", tk, { tipo: tp, e: this.unario() }));
        }
        // cast para referência: (String) x, (Integer) x
        if (t1.t === "id" && /^[A-Z]/.test(t1.v)) {
          var salvo = this.i;
          try {
            this.nx(); var tr = this.tipo();
            if (this.aceita(")")) {
              var prox = this.pk();
              if (prox.t === "id" || prox.t === "num" || prox.t === "str" || prox.t === "chr" || (prox.t === "kw" && /^(new|this|true|false|null)$/.test(prox.v)) || (prox.t === "op" && (prox.v === "(" || prox.v === "!"))) {
                return this.fecha(this.no("cast", tk, { tipo: tr, e: this.unario() }));
              }
            }
          } catch (er) { if (!(er instanceof ErroCompilacao)) throw er; }
          this.i = salvo;
        }
      }
    }
    return this.pos(this.primario());
  };
  P.pos = function (e) {
    for (;;) {
      var tk = this.pk();
      if (this.eh(".")) {
        this.nx();
        var ntk = this.pk();
        if (ntk.t === "kw" && ntk.v === "class") this.erro(".class não é suportado");
        var nome = this.id("um nome depois do ponto");
        var base = e;
        if (this.eh("(")) e = this.fecha(this.no("chamada", ntk, { obj: base, nome: nome, args: this.argumentos() }));
        else e = this.fecha(this.no("campo", ntk, { obj: base, nome: nome }));
        e.pos = base.pos; continue;
      }
      if (this.eh("[")) { this.nx(); var ix = this.expr(); this.espera("]", "para fechar o índice"); var b2 = e; e = this.fecha(this.no("indice", tk, { a: b2, i: ix })); e.pos = b2.pos; e.linha = b2.linha; continue; }
      if (this.eh("++") || this.eh("--")) { this.nx(); var b3 = e; e = this.fecha(this.no("incdec", tk, { op: tk.v, pre: false, alvo: b3 })); e.pos = b3.pos; e.linha = b3.linha; continue; }
      if (this.eh("::")) this.erro("referência de método (::) não é suportada");
      return e;
    }
  };
  P.argumentos = function () {
    this.espera("(");
    var as = [];
    if (!this.aceita(")")) { do { as.push(this.expr()); } while (this.aceita(",")); this.espera(")", "para fechar os argumentos"); }
    return as;
  };
  P.primario = function () {
    var tk = this.pk();
    if (tk.t === "num") { this.nx(); return this.fecha(this.no("lit", tk, { v: tk.v, tipo: T(tk.tipo) })); }
    if (tk.t === "str") { this.nx(); return this.fecha(this.no("lit", tk, { v: tk.v, tipo: T_STR })); }
    if (tk.t === "chr") { this.nx(); return this.fecha(this.no("lit", tk, { v: tk.v, tipo: T_CHAR })); }
    if (tk.t === "kw") {
      if (tk.v === "true" || tk.v === "false") { this.nx(); return this.fecha(this.no("lit", tk, { v: tk.v === "true", tipo: T_BOOL })); }
      if (tk.v === "null") { this.nx(); return this.fecha(this.no("lit", tk, { v: null, tipo: T_NULL })); }
      if (tk.v === "this") { this.nx(); if (this.eh("(")) this.erro("this(...) não é suportado"); return this.fecha(this.no("this", tk)); }
      if (tk.v === "new") return this.novo();
      if (tk.v === "super") this.erro("super não é suportado");
    }
    if (tk.t === "op" && tk.v === "(") {
      this.nx();
      if (this.pk().t === "id" && this.eh("->", 1) || this.eh(")") && this.eh("->", 1)) this.erro("expressões lambda não são suportadas");
      var e = this.expr(); this.espera(")", "para fechar o parêntese");
      return this.fecha(this.no("paren", tk, { e: e }));
    }
    if (tk.t === "id") {
      this.nx();
      if (this.eh("->")) this.erro("expressões lambda não são suportadas");
      if (this.eh("(")) return this.fecha(this.no("chamada", tk, { obj: null, nome: tk.v, args: this.argumentos() }));
      return this.fecha(this.no("nome", tk, { nome: tk.v }));
    }
    this.erro("expressão inválida: '" + tk.v + "'");
  };
  P.novo = function () {
    var tk = this.espera("new"), t = this.pk(), base;
    if (t.t === "kw" && PRIM.has(t.v)) { this.nx(); base = T(t.v); }
    else {
      var nome = this.id("um tipo depois de new");
      while (this.eh(".") && this.pk(1).t === "id") { this.nx(); nome = this.nx().v; }
      var args = [];
      if (this.aceita("<")) {
        if (!this.eh(">")) { do { args.push(this.tipo()); } while (this.aceita(",")); }
        else args.diamante = true;
        if (this.eh(">>")) this.toks[this.i] = Object.assign({}, this.pk(), { v: ">" }); else this.espera(">");
      }
      base = T(nome, 0, args);
      if (args.diamante) base.diamante = true;
    }
    if (this.eh("[")) {
      var dims = [], extra = 0;
      while (this.eh("[")) {
        this.nx();
        if (this.aceita("]")) { extra++; continue; }
        if (extra) this.erro("dimensão sem tamanho antes de dimensão com tamanho");
        dims.push(this.expr()); this.espera("]");
      }
      var tipoArr = T(base.n, dims.length + extra, base.a);
      if (!dims.length) {
        if (!this.eh("{")) this.erro("array precisa de tamanho ou de valores iniciais { ... }");
        var ini = this.arrayInit();
        ini.tipo = tipoArr;
        return this.fecha(this.no("novoArray", tk, { tipo: tipoArr, dims: [], init: ini }));
      }
      return this.fecha(this.no("novoArray", tk, { tipo: tipoArr, dims: dims }));
    }
    if (this.eh("(")) {
      var as = this.argumentos();
      if (this.eh("{")) this.erro("classes anônimas não são suportadas");
      return this.fecha(this.no("novo", tk, { tipo: base, args: as }));
    }
    this.erro("esperava '(' ou '[' depois de new " + tStr(base));
  };
  P.arrayInit = function () {
    var tk = this.espera("{"), els = [];
    if (!this.aceita("}")) {
      do {
        if (this.eh("}")) break;
        els.push(this.eh("{") ? this.arrayInit() : this.expr());
      } while (this.aceita(","));
      this.espera("}", "para fechar os valores do array");
    }
    return this.fecha(this.no("arrayInit", tk, { els: els }));
  };

  // ------------------------------------------------------------------ BIBLIOTECA (tipos)
  var LISTA = new Set(["List", "ArrayList", "LinkedList", "Collection", "Iterable", "AbstractList", "Vector"]);
  var FILA = new Set(["Deque", "ArrayDeque", "Queue"]);
  var MAPA = new Set(["Map", "HashMap", "TreeMap", "LinkedHashMap"]);
  var CONJ = new Set(["Set", "HashSet", "TreeSet", "LinkedHashSet"]);
  var EXC = { Throwable: null, Exception: "Throwable", Error: "Throwable", RuntimeException: "Exception", IllegalArgumentException: "RuntimeException", IllegalStateException: "RuntimeException", ArithmeticException: "RuntimeException", NullPointerException: "RuntimeException", IndexOutOfBoundsException: "RuntimeException", ArrayIndexOutOfBoundsException: "IndexOutOfBoundsException", StringIndexOutOfBoundsException: "IndexOutOfBoundsException", NegativeArraySizeException: "RuntimeException", UnsupportedOperationException: "RuntimeException", NumberFormatException: "IllegalArgumentException", ClassCastException: "RuntimeException", EmptyStackException: "RuntimeException", NoSuchElementException: "RuntimeException", StackOverflowError: "Error", OutOfMemoryError: "Error", InterruptedException: "Exception" };
  var PACOTE = { NoSuchElementException: "java.util.", EmptyStackException: "java.util." };
  var CLASSES_LIB = new Set(["String", "StringBuilder", "Math", "Arrays", "Collections", "Integer", "Long", "Double", "Character", "Boolean", "System", "Object", "Stack", "Objects", "Short", "Byte", "Float"].concat(Array.from(LISTA), Array.from(FILA), Array.from(MAPA), Array.from(CONJ), Object.keys(EXC)));
  function ehLista(t) { return t && t.d === 0 && LISTA.has(t.n); }
  function ehFila(t) { return t && t.d === 0 && (FILA.has(t.n) || t.n === "LinkedList"); }

  // ------------------------------------------------------------------ ANÁLISE (tipos + resolução)
  function analisar(prog, src) {
    var classes = Object.create(null);
    prog.classes.forEach(function (c) {
      if (classes[c.nome]) throw new ErroCompilacao("classe " + c.nome + " declarada duas vezes", c.linha, 1);
      classes[c.nome] = c;
      c.metodosPorNome = Object.create(null);
      c.metodos.forEach(function (m) { (c.metodosPorNome[m.nome] = c.metodosPorNome[m.nome] || []).push(m); });
      c.campoPorNome = Object.create(null);
      c.campos.forEach(function (f) { c.campoPorNome[f.nome] = f; });
    });
    prog.porNome = classes;
    var classeAtual, metodoAtual, escopos;

    function erro(msg, n) { throw new ErroCompilacao(msg, n ? n.linha : 0, 1); }
    function declara(nome, tipo, n) {
      for (var i = escopos.length - 1; i >= 0; i--) if (escopos[i][nome]) erro("a variável " + nome + " já foi declarada neste método", n);
      escopos[escopos.length - 1][nome] = tipo;
    }
    function acha(nome) { for (var i = escopos.length - 1; i >= 0; i--) if (escopos[i][nome]) return escopos[i][nome]; return null; }
    function campo(cls, nome) { var c = classes[cls]; while (c) { if (c.campoPorNome[nome]) return c.campoPorNome[nome]; c = c.externa ? classes[c.externa] : null; } return null; }
    function atribuivel(de, para) {
      if (!de || !para || de.n === "?" || para.n === "?" || para.n === "Object" || para.n === "var") return true;
      if (de.n === "null") return !prim(para) || !PRIM.has(para.n);
      var pd = prim(de), pp = prim(para);
      if (pd && pp && !de.d && !para.d) {
        if (pd === pp) return true;
        var ordem = ["byte", "short", "char", "int", "long", "float", "double"];
        if (pd === "boolean" || pp === "boolean") return false;
        if (pd === "char" && (pp === "short" || pp === "byte")) return false;
        return ordem.indexOf(pd) <= ordem.indexOf(pp) && !(pp === "char");
      }
      if (de.d !== para.d) return false;
      if (de.d) return de.n === para.n || (!PRIM.has(de.n) && !PRIM.has(para.n));
      return true;
    }
    function escolhe(cands, tipos, n, nome) {
      var ok = cands.filter(function (m) { return m.params.length === tipos.length && m.params.every(function (p, i) { return atribuivel(tipos[i], p.tipo); }); });
      if (!ok.length) {
        var mesmo = cands.filter(function (m) { return m.params.length === tipos.length; });
        erro("não existe " + nome + "(" + tipos.map(tStr).join(", ") + ")" + (cands.length ? ". Existe: " + cands.map(function (m) { return nome + "(" + m.params.map(function (p) { return tStr(p.tipo); }).join(", ") + ")"; }).join(" ; ") : ""), n);
      }
      if (ok.length > 1) {
        var exato = ok.filter(function (m) { return m.params.every(function (p, i) { return mesmoTipo(p.tipo, tipos[i]) || tipos[i].n === "?"; }); });
        if (exato.length) return exato[0];
      }
      return ok[0];
    }

    prog.classes.forEach(function (c) {
      classeAtual = c;
      c.campos.forEach(function (f) { if (f.init) { escopos = [{}]; metodoAtual = { estatico: f.estatico }; tipoInit(f.init, f.tipo); } });
      c.metodos.concat(c.construtores).forEach(function (m) {
        metodoAtual = m;
        escopos = [{}];
        m.params.forEach(function (p) { declara(p.nome, p.tipo, m); });
        cmd(m.corpo);
      });
    });
    return prog;

    function tipoInit(e, alvo) {
      if (e.k === "arrayInit") { if (!alvo.d) erro("{ ... } só serve para inicializar arrays", e); initArr(e, alvo); return alvo; }
      var t = expr(e, alvo);
      if (!atribuivel(t, alvo)) erro("tipos incompatíveis: não dá para guardar " + tStr(t) + " em " + tStr(alvo), e);
      return t;
    }
    function initArr(e, tipo) {
      e.tipo = tipo;
      var el = elem(tipo);
      e.els.forEach(function (x) { if (x.k === "arrayInit") initArr(x, el); else { var t = expr(x, el); if (!atribuivel(t, el)) erro("valor " + tStr(t) + " em array de " + tStr(el), x); } });
    }

    function cmd(s) {
      switch (s.k) {
        case "bloco": escopos.push({}); s.cs.forEach(cmd); escopos.pop(); break;
        case "vazio": case "break": case "continue": break;
        case "decl":
          s.ds.forEach(function (d) {
            if (d.tipo.n === "var") { if (!d.init) erro("var precisa de valor inicial", s); d.tipo = expr(d.init); }
            else if (d.init) tipoInit(d.init, d.tipo);
            declara(d.nome, d.tipo, s);
          });
          break;
        case "expr": expr(s.e); break;
        case "if": cond(s.cond); cmdEsc(s.entao); if (s.senao) cmdEsc(s.senao); break;
        case "while": cond(s.cond); cmdEsc(s.corpo); break;
        case "do": cmdEsc(s.corpo); cond(s.cond); break;
        case "for":
          escopos.push({});
          s.init.forEach(cmd);
          if (s.cond) cond(s.cond);
          s.upd.forEach(cmd);
          cmdEsc(s.corpo);
          escopos.pop(); break;
        case "foreach": {
          var tc = expr(s.col), te;
          if (tc.d) te = elem(tc);
          else if (tc.n === "String") erro("não dá para usar for-each em String; use toCharArray()", s);
          else if (MAPA.has(tc.n)) erro("para percorrer um Map use keySet(), values() ou entrySet()", s);
          else te = arg(tc, 0);
          if (s.tipo.n === "var") s.tipo = te;
          escopos.push({}); declara(s.nome, s.tipo, s); s.tipoCol = tc; cmdEsc(s.corpo); escopos.pop(); break;
        }
        case "return": {
          var tr = metodoAtual.tipoRet;
          if (s.e) {
            if (tr && tr.n === "void") erro("método void não pode retornar valor", s);
            var t = expr(s.e, tr);
            if (tr && !atribuivel(t, tr)) erro("tipo de retorno incompatível: " + tStr(t) + " não é " + tStr(tr), s);
          } else if (tr && tr.n !== "void") erro("faltou o valor do return (o método devolve " + tStr(tr) + ")", s);
          break;
        }
        case "throw": expr(s.e); break;
        case "try":
          cmd(s.bloco);
          s.catches.forEach(function (c) { escopos.push({}); declara(c.nome, T(c.tipos[0]), s); cmd(c.bloco); escopos.pop(); });
          if (s.fin) cmd(s.fin); break;
        case "switch":
          expr(s.e); escopos.push({});
          s.casos.forEach(function (c) { c.rot.forEach(function (r) { expr(r); }); c.cs.forEach(cmd); });
          escopos.pop(); break;
        default: erro("comando desconhecido " + s.k, s);
      }
    }
    function cmdEsc(s) { escopos.push({}); cmd(s); escopos.pop(); }
    function cond(e) { var t = expr(e); if (prim(t) !== "boolean" && t.n !== "?") erro("a condição precisa ser boolean, mas é " + tStr(t), e); }

    function expr(e, alvo) { var t = expr0(e, alvo); e.t = t; return t; }
    function expr0(e, alvo) {
      switch (e.k) {
        case "lit": return e.tipo;
        case "paren": return expr(e.e, alvo);
        case "this": if (metodoAtual.estatico) erro("this não existe em método static", e); return T(classeAtual.nome);
        case "nome": {
          var t = acha(e.nome);
          if (t) { e.onde = "local"; return t; }
          var f = campo(classeAtual.nome, e.nome);
          if (f) {
            e.onde = f.estatico ? "estatico" : "inst"; e.dono = donoCampo(classeAtual.nome, e.nome);
            if (!f.estatico && metodoAtual.estatico) erro("o campo " + e.nome + " não é static e não pode ser usado num método static", e);
            return f.tipo;
          }
          if (classes[e.nome] || CLASSES_LIB.has(e.nome)) { e.onde = "classe"; return T("#classe:" + e.nome); }
          erro("variável não declarada: " + e.nome, e);
        }
        case "campo": {
          var to = expr(e.obj);
          if (to.n.indexOf("#classe:") === 0) {
            var cn = to.n.slice(8);
            e.estatico = cn;
            if (cn === "System" && (e.nome === "out" || e.nome === "err")) return T("#out");
            if (cn === "Integer" && (e.nome === "MAX_VALUE" || e.nome === "MIN_VALUE")) return T_INT;
            if (cn === "Long" && (e.nome === "MAX_VALUE" || e.nome === "MIN_VALUE")) return T_LONG;
            if (cn === "Double" && /^(MAX_VALUE|MIN_VALUE|POSITIVE_INFINITY|NEGATIVE_INFINITY)$/.test(e.nome)) return T_DOUBLE;
            if (cn === "Character" && /^(MAX_VALUE|MIN_VALUE)$/.test(e.nome)) return T_CHAR;
            if (cn === "Math" && (e.nome === "PI" || e.nome === "E")) return T_DOUBLE;
            if (classes[cn]) { var fc = classes[cn].campoPorNome[e.nome]; if (fc && fc.estatico) return fc.tipo; }
            erro("campo estático desconhecido: " + cn + "." + e.nome, e);
          }
          if (to.d && e.nome === "length") return T_INT;
          if (classes[to.n] && !to.d) { var fi = campo(to.n, e.nome); if (fi) return fi.tipo; }
          if (to.n === "?") return T_DESC;
          erro("campo desconhecido: " + tStr(to) + "." + e.nome + (e.nome === "length" ? " (String usa length(), e List usa size())" : e.nome === "size" ? " (use size())" : ""), e);
        }
        case "indice": {
          var ta = expr(e.a), ti = expr(e.i);
          if (!ta.d && ta.n !== "?") erro(tStr(ta) + " não é array; " + (ehLista(ta) ? "para List use get(i)" : ehString(ta) ? "para String use charAt(i)" : "use [] só em arrays"), e);
          if (!integral(ti) && ti.n !== "?") erro("índice de array precisa ser inteiro, mas é " + tStr(ti), e);
          return elem(ta);
        }
        case "atrib": {
          var tl = expr(e.alvo);
          if (e.alvo.k === "nome" && e.alvo.onde === "classe") erro("não dá para atribuir a " + e.alvo.nome, e);
          if (e.v.k === "arrayInit") erro("{ ... } só vale na declaração; use new " + tStr(tl) + " { ... }", e);
          var tv = expr(e.v, tl);
          if (e.op === "=") { if (!atribuivel(tv, tl)) erro("tipos incompatíveis: não dá para guardar " + tStr(tv) + " em " + tStr(tl), e); }
          else if (e.op === "+=" && ehString(tl)) { }
          else if (!numerico(tl) || !numerico(tv)) { if (!(prim(tl) === "boolean" && /^[&|^]=$/.test(e.op))) erro("operador " + e.op + " não funciona com " + tStr(tl) + " e " + tStr(tv), e); }
          return tl;
        }
        case "incdec": { var tt = expr(e.alvo); if (!numerico(tt)) erro(e.op + " só funciona com números", e); if (!/^(nome|campo|indice)$/.test(e.alvo.k)) erro(e.op + " precisa de uma variável", e); return tt; }
        case "un": {
          var tu = expr(e.e);
          if (e.op === "!") { if (prim(tu) !== "boolean") erro("! só funciona com boolean", e); return T_BOOL; }
          if (!numerico(tu)) erro("operador " + e.op + " não funciona com " + tStr(tu), e);
          return e.op === "~" ? promove(tu, T_INT) : promove(tu, T_INT);
        }
        case "bin": {
          var a = expr(e.a), b = expr(e.b), op = e.op;
          if (op === "+" && (ehString(a) || ehString(b))) { e.concat = true; return T_STR; }
          if (op === "&&" || op === "||") { if (prim(a) !== "boolean" || prim(b) !== "boolean") erro(op + " precisa de boolean dos dois lados (" + tStr(a) + " " + op + " " + tStr(b) + ")", e); return T_BOOL; }
          if (op === "==" || op === "!=") {
            if (numerico(a) && numerico(b)) e.num = true;
            else if (prim(a) === "boolean" && prim(b) === "boolean") e.num = false;
            else if ((prim(a) && PRIM.has(a.n)) !== (prim(b) && PRIM.has(b.n)) && a.n !== "null" && b.n !== "null" && !(numerico(a) || numerico(b))) erro("comparação entre tipos incompatíveis: " + tStr(a) + " e " + tStr(b), e);
            if (ehString(a) && ehString(b)) e.strRef = true;
            return T_BOOL;
          }
          if (/^(<|>|<=|>=)$/.test(op)) { if (!numerico(a) || !numerico(b)) erro(op + " precisa de números: " + tStr(a) + " " + op + " " + tStr(b) + (ehString(a) ? " (compare Strings com compareTo)" : ""), e); return T_BOOL; }
          if (/^[&|^]$/.test(op) && prim(a) === "boolean" && prim(b) === "boolean") return T_BOOL;
          if (!numerico(a) || !numerico(b)) erro("operador " + op + " não funciona com " + tStr(a) + " e " + tStr(b), e);
          if (/^(<<|>>|>>>)$/.test(op)) return prim(a) === "long" ? T_LONG : T_INT;
          return promove(a, b);
        }
        case "cond": { cond(e.c); var x = expr(e.a, alvo), y = expr(e.b, alvo); if (numerico(x) && numerico(y) && !mesmoTipo(x, y)) return promove(x, y); return x.n === "null" ? y : x; }
        case "cast": {
          var tc = expr(e.e);
          if (prim(e.tipo) && PRIM.has(e.tipo.n)) { if (!numerico(tc) && !(prim(tc) === "boolean" && e.tipo.n === "boolean")) erro("não dá para converter " + tStr(tc) + " em " + e.tipo.n, e); }
          return e.tipo;
        }
        case "instanceof": expr(e.e); return T_BOOL;
        case "arrayInit": erro("{ ... } fora de declaração de array", e); break;
        case "novoArray":
          e.dims.forEach(function (d) { var td = expr(d); if (!integral(td)) erro("tamanho do array precisa ser inteiro", d); });
          if (e.init) initArr(e.init, e.tipo);
          return e.tipo;
        case "novo": {
          var tn = e.tipo;
          if (tn.diamante && alvo && alvo.a && alvo.a.length) { tn = T(tn.n, 0, alvo.a); e.tipo = tn; }
          var targs = e.args.map(function (x) { return expr(x); });
          if (tn.diamante && e.args.length === 1 && targs[0].a && targs[0].a.length && (LISTA.has(tn.n) || CONJ.has(tn.n) || FILA.has(tn.n))) { tn = T(tn.n, 0, targs[0].a); e.tipo = tn; }
          if (classes[tn.n]) {
            var cl = classes[tn.n];
            if (cl.construtores.length) e.ctor = escolhe(cl.construtores, targs, e, "new " + tn.n);
            else if (e.args.length) erro("a classe " + tn.n + " não tem construtor com argumentos", e);
            return tn;
          }
          if (EXC.hasOwnProperty(tn.n)) return tn;
          if (/^(ArrayList|LinkedList|ArrayDeque|HashMap|HashSet|TreeMap|TreeSet|LinkedHashMap|LinkedHashSet|Stack|StringBuilder|Vector|Object)$/.test(tn.n)) return tn;
          if (/^(List|Deque|Queue|Map|Set)$/.test(tn.n)) erro(tn.n + " é uma interface; use new " + { List: "ArrayList", Deque: "ArrayDeque", Queue: "ArrayDeque", Map: "HashMap", Set: "HashSet" }[tn.n] + "<>()", e);
          if (tn.n === "String") return T_STR;
          if (/^(Integer|Double|Character|Boolean|Long)$/.test(tn.n)) return tn;
          erro("classe desconhecida: " + tn.n, e);
        }
        case "chamada": return chamada(e, alvo);
      }
      erro("expressão desconhecida", e);
    }
    function donoCampo(cls, nome) { var c = classes[cls]; while (c) { if (c.campoPorNome[nome]) return c.nome; c = c.externa ? classes[c.externa] : null; } return cls; }

    function chamada(e, alvo) {
      var tipos = e.args.map(function (x) { return expr(x); });
      if (!e.obj) {
        var c = classeAtual;
        while (c) {
          if (c.metodosPorNome[e.nome]) {
            var m = escolhe(c.metodosPorNome[e.nome], tipos, e, e.nome);
            if (!m.estatico && metodoAtual.estatico && c === classeAtual) erro("o método " + e.nome + " não é static; num método static só dá para chamar métodos static", e);
            e.m = m; return m.tipoRet;
          }
          c = c.externa ? classes[c.externa] : null;
        }
        erro("método não encontrado: " + e.nome + "(" + tipos.map(tStr).join(", ") + ")", e);
      }
      var to = expr(e.obj);
      if (to.n === "#out") {
        if (!/^(println|print|printf|format)$/.test(e.nome)) erro("System.out." + e.nome + " não existe", e);
        e.lib = "out"; return T_VOID;
      }
      if (to.n.indexOf("#classe:") === 0) {
        var cn = to.n.slice(8);
        if (classes[cn]) {
          var ms = (classes[cn].metodosPorNome[e.nome] || []).filter(function (m) { return m.estatico; });
          if (!ms.length) erro("método static não encontrado: " + cn + "." + e.nome, e);
          e.m = escolhe(ms, tipos, e, cn + "." + e.nome); return e.m.tipoRet;
        }
        e.lib = "static"; e.cls = cn;
        return tipoEstatico(cn, e.nome, tipos, e, alvo);
      }
      if (classes[to.n] && !to.d) {
        var ms2 = classes[to.n].metodosPorNome[e.nome];
        if (!ms2) {
          if (e.nome === "toString" && !tipos.length) { e.lib = "inst"; return T_STR; }
          if (e.nome === "equals") { e.lib = "inst"; return T_BOOL; }
          erro("método não encontrado: " + to.n + "." + e.nome, e);
        }
        e.m = escolhe(ms2, tipos, e, to.n + "." + e.nome); return e.m.tipoRet;
      }
      e.lib = "inst";
      e.tObj = to;
      return tipoInstancia(to, e.nome, tipos, e);
    }
    function tipoEstatico(cn, nome, ts, e, alvo) {
      var n = ts.length;
      switch (cn + "." + nome) {
        case "Math.max": case "Math.min": return promove(ts[0], ts[1]);
        case "Math.abs": return promove(ts[0], T_INT);
        case "Math.pow": case "Math.sqrt": case "Math.floor": case "Math.ceil": case "Math.log": case "Math.log10": case "Math.random": case "Math.cbrt": case "Math.exp": return T_DOUBLE;
        case "Math.round": return ehDouble(ts[0]) ? T_LONG : T_INT;
        case "Math.floorMod": case "Math.floorDiv": return promove(ts[0], ts[1]);
        case "Arrays.fill": case "Arrays.sort": return T_VOID;
        case "Arrays.toString": case "Arrays.deepToString": return T_STR;
        case "Arrays.copyOf": case "Arrays.copyOfRange": return ts[0];
        case "Arrays.equals": return T_BOOL;
        case "Arrays.asList": case "List.of": return T("List", 0, [n ? (prim(ts[0]) && PRIM.has(ts[0].n) ? T(UNBOX_INV[ts[0].n]) : ts[0]) : T_OBJ]);
        case "Arrays.stream": erro("streams não são suportados", e); break;
        case "Collections.sort": case "Collections.reverse": case "Collections.swap": return T_VOID;
        case "Collections.max": case "Collections.min": return arg(ts[0], 0);
        case "Integer.valueOf": return T("Integer");
        case "Integer.parseInt": case "Integer.compare": case "Integer.signum": case "Character.getNumericValue": case "Integer.bitCount": return T_INT;
        case "Integer.toString": case "String.valueOf": case "Integer.toBinaryString": case "Long.toString": case "Double.toString": case "Character.toString": return T_STR;
        case "Integer.max": case "Integer.min": case "Integer.sum": return T_INT;
        case "Long.parseLong": return T_LONG;
        case "Double.parseDouble": return T_DOUBLE;
        case "Character.isDigit": case "Character.isLetter": case "Character.isLetterOrDigit": case "Character.isUpperCase": case "Character.isLowerCase": case "Character.isWhitespace": case "Character.isAlphabetic": return T_BOOL;
        case "Character.toUpperCase": case "Character.toLowerCase": return T_CHAR;
        case "Objects.equals": return T_BOOL;
        case "Objects.hash": return T_INT;
        case "String.join": return T_STR;
      }
      erro("método desconhecido: " + cn + "." + nome, e);
    }
    function tipoInstancia(t, nome, ts, e) {
      var n = ts.length;
      if (t.n === "?") return T_DESC;
      if (t.d) {
        if (nome === "clone") return t;
        if (nome === "length") erro("em array é .length, sem parênteses", e);
        erro("arrays não têm o método " + nome, e);
      }
      var E0 = arg(t, 0), E1 = arg(t, 1);
      if (t.n === "String") {
        switch (nome) {
          case "length": case "indexOf": case "lastIndexOf": case "compareTo": case "compareToIgnoreCase": case "hashCode": return T_INT;
          case "charAt": return T_CHAR;
          case "equals": case "isEmpty": case "contains": case "startsWith": case "endsWith": case "equalsIgnoreCase": case "isBlank": case "matches": return T_BOOL;
          case "substring": case "toUpperCase": case "toLowerCase": case "trim": case "strip": case "repeat": case "replace": case "concat": case "toString": return T_STR;
          case "toCharArray": return T("char", 1);
          case "split": return T("String", 1);
        }
      }
      if (t.n === "StringBuilder") {
        switch (nome) {
          case "append": case "reverse": case "insert": case "deleteCharAt": case "setLength": return nome === "setLength" ? T_VOID : T("StringBuilder");
          case "toString": return T_STR;
          case "length": case "indexOf": return T_INT;
          case "charAt": return T_CHAR;
          case "setCharAt": return T_VOID;
        }
      }
      if (/^(Integer|Long|Double|Character|Boolean)$/.test(t.n)) {
        if (nome === "equals") return T_BOOL;
        if (nome === "intValue" || nome === "compareTo" || nome === "hashCode") return T_INT;
        if (nome === "doubleValue") return T_DOUBLE;
        if (nome === "charValue") return T_CHAR;
        if (nome === "toString") return T_STR;
      }
      if (LISTA.has(t.n) || FILA.has(t.n) || t.n === "Stack") {
        switch (nome) {
          case "size": case "indexOf": case "lastIndexOf": case "hashCode": return T_INT;
          case "isEmpty": case "contains": case "equals": case "empty": case "offer": case "offerLast": case "offerFirst": case "containsAll": return T_BOOL;
          case "add": return n === 2 ? T_VOID : T_BOOL;
          case "addAll": return T_BOOL;
          case "get": case "set": case "getFirst": case "getLast": case "peek": case "peekFirst": case "peekLast": case "poll": case "pollFirst": case "pollLast": case "pop": case "removeFirst": case "removeLast": case "element": case "firstElement": case "lastElement": return E0;
          case "push": return t.n === "Stack" ? E0 : T_VOID;
          case "remove":
            if (n === 0) return E0;
            if (LISTA.has(t.n) && prim(ts[0]) === "int" && PRIM.has(ts[0].n)) { e.removeIndice = true; return E0; }
            return T_BOOL;
          case "addFirst": case "addLast": case "clear": case "sort": return T_VOID;
          case "toString": return T_STR;
          case "subList": return T("List", 0, [E0]);
          case "iterator": erro("iterator() não é suportado; use for-each", e); break;
          case "stream": erro("streams não são suportados", e); break;
        }
      }
      if (MAPA.has(t.n)) {
        switch (nome) {
          case "put": case "get": case "remove": case "getOrDefault": case "putIfAbsent": case "merge": return nome === "merge" ? E1 : E1;
          case "containsKey": case "containsValue": case "isEmpty": return T_BOOL;
          case "size": return T_INT;
          case "keySet": return T("Set", 0, [E0]);
          case "values": return T("List", 0, [E1]);
          case "entrySet": erro("entrySet() não é suportado aqui; use keySet() e get()", e); break;
          case "clear": return T_VOID;
          case "toString": return T_STR;
        }
      }
      if (CONJ.has(t.n)) {
        switch (nome) {
          case "add": case "contains": case "remove": case "isEmpty": case "addAll": case "containsAll": case "equals": return T_BOOL;
          case "size": return T_INT;
          case "clear": return T_VOID;
          case "toString": return T_STR;
        }
      }
      if (EXC.hasOwnProperty(t.n) && nome === "getMessage") return T_STR;
      if (nome === "toString") return T_STR;
      if (nome === "equals") return T_BOOL;
      if (nome === "hashCode") return T_INT;
      erro("método desconhecido: " + tStr(t) + "." + nome + "(" + ts.map(tStr).join(", ") + ")", e);
    }
  }

  // ------------------------------------------------------------------ VALORES EM EXECUÇÃO
  function JavaExc(classe, msg, linha) { this.classe = classe; this.msg = msg === undefined ? null : msg; this.linha = linha; }
  function Retorno(v) { this.v = v; }
  var BREAK = { k: "break" }, CONTINUE = { k: "continue" };
  function Limite(tipo) { this.tipo = tipo; }

  function subclasse(c, pai) { while (c) { if (c === pai) return true; c = EXC[c]; } return false; }
  function nomeCompleto(c) { if (!EXC.hasOwnProperty(c)) return c; return (PACOTE[c] || "java.lang.") + c; }

  // hashCode ao estilo Java (para a ordem de HashMap/HashSet)
  function hashJava(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "boolean") return v ? 1231 : 1237;
    if (typeof v === "number") {
      if (Number.isInteger(v) && v >= -2147483648 && v <= 2147483647) return v | 0;
      var buf = new DataView(new ArrayBuffer(8)); buf.setFloat64(0, v);
      return (buf.getInt32(0) ^ buf.getInt32(4)) | 0;
    }
    if (typeof v === "string") { var h = 0; for (var i = 0; i < v.length; i++) h = (Math.imul(31, h) + v.charCodeAt(i)) | 0; return h; }
    if (v.k === "list" || v.k === "deque") { var hl = 1; v.a.forEach(function (x) { hl = (Math.imul(31, hl) + hashJava(x)) | 0; }); return hl; }
    return v.id * 2654435761 | 0;
  }
  function chave(v) { return typeof v === "object" && v !== null ? (v.k === "list" ? "L" + JSON.stringify(v.a.map(chave)) : "#" + v.id) : typeof v + ":" + String(v); }
  function igualJava(a, b) {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
    if ((a.k === "list" || a.k === "deque") && (b.k === "list" || b.k === "deque")) return a.a.length === b.a.length && a.a.every(function (x, i) { return igualJava(x, b.a[i]); });
    return false;
  }
  // HashMap/HashSet com a mesma ordem de iteração do Java (buckets)
  function novoMapa(id, tipo, ordenado, insercao) { return { id: id, k: "map", t: tipo, m: new Map(), cap: 16, seq: 0, ordenado: ordenado, insercao: insercao }; }
  function mapaPut(M, k, v) {
    var c = chave(k), e = M.m.get(c);
    if (e) { var old = e.v; e.v = v; return old; }
    M.m.set(c, { k: k, v: v, s: M.seq++ });
    if (M.m.size > M.cap * 0.75) M.cap *= 2;
    return null;
  }
  function mapaOrdem(M) {
    var es = Array.from(M.m.values());
    if (M.insercao) return es;
    if (M.ordenado) return es.sort(function (x, y) { return x.k < y.k ? -1 : x.k > y.k ? 1 : 0; });
    return es.map(function (e) { var h = hashJava(e.k); h = h ^ (h >>> 16); return { e: e, b: h & (M.cap - 1) }; })
      .sort(function (x, y) { return x.b - y.b || x.e.s - y.e.s; }).map(function (x) { return x.e; });
  }

  // formatação de double igual ao Double.toString do Java
  function javaDouble(d) {
    if (isNaN(d)) return "NaN";
    if (d === Infinity) return "Infinity";
    if (d === -Infinity) return "-Infinity";
    if (d === 0) return 1 / d < 0 ? "-0.0" : "0.0";
    var a = Math.abs(d);
    if (a >= 1e-3 && a < 1e7) { var s = String(d); return s.indexOf(".") < 0 && s.indexOf("e") < 0 ? s + ".0" : s; }
    var ex = d.toExponential(), p = ex.split("e"), mant = p[0], exp = parseInt(p[1], 10);
    if (mant.indexOf(".") < 0) mant += ".0";
    return mant + "E" + exp;
  }

  // ------------------------------------------------------------------ INTERPRETADOR
  function Maquina(prog, src, opts) {
    this.prog = prog; this.src = src; this.opts = opts || {};
    this.cls = prog.porNome;
    this.saida = "";
    this.idSeq = 1;
    this.ops = 0;
    this.maxOps = this.opts.maxOps || 30000000;
    this.pilha = [];
    this.estaticos = {};
    this.rastrear = !!this.opts.rastrear;
    this.maxPassos = this.opts.maxPassos || 6000;
    this.passos = [];
    this.chamadas = [];
    this.acessos = [];
    this.heapVivo = new Map();
    this.linhas = src.split("\n");
    this.maxProf = this.opts.maxProf || 2600;
  }
  var M = Maquina.prototype;

  M.novoId = function () { return this.idSeq++; };
  M.lanca = function (classe, msg, linha) { throw new JavaExc(classe, msg, linha || this.linhaAtual); };
  M.conta = function () { if (++this.ops > this.maxOps) throw new Limite("ops"); };
  M.texto = function (n) { return n && n.fim ? this.src.slice(n.pos, n.fim) : ""; };

  M.inicializaEstaticos = function () {
    var self = this;
    this.prog.classes.forEach(function (c) {
      self.estaticos[c.nome] = {};
      c.campos.forEach(function (f) { if (f.estatico) self.estaticos[c.nome][f.nome] = self.padrao(f.tipo); });
    });
    this.prog.classes.forEach(function (c) {
      c.campos.forEach(function (f) {
        if (f.estatico && f.init) {
          self.pilha.push({ metodo: { nome: "<clinit>", classe: c.nome, estatico: true }, esc: [new Map()], este: null, linha: f.linha, id: 0 });
          self.estaticos[c.nome][f.nome] = self.coage(f.init.k === "arrayInit" ? self.arrInit(f.init) : self.ev(f.init), f.tipo, f.init.t);
          self.pilha.pop();
        }
      });
    });
  };
  M.padrao = function (t) {
    if (t.d) return null;
    switch (t.n) { case "int": case "long": case "short": case "byte": case "double": case "float": return 0; case "boolean": return false; case "char": return "\0"; }
    return null;
  };
  // converte o valor para o tipo de destino (atribuição, parâmetro, retorno)
  M.coage = function (v, para, de) {
    if (!para || para.d || v === null) return v;
    var p = PRIM.has(para.n) ? para.n : null;
    if (!p) {
      if (BOX[para.n] && de && prim(de) && prim(de) !== BOX[para.n] && numerico(de)) return this.coage(v, T(BOX[para.n]), de);
      return v;
    }
    if (typeof v === "string" && v.length === 1 && de && ehChar(de) && p !== "char") v = v.charCodeAt(0);
    switch (p) {
      case "int": return typeof v === "number" ? (ehDouble(de) ? toIntJava(v) : v | 0) : v;
      case "short": return typeof v === "number" ? (v << 16) >> 16 : v;
      case "byte": return typeof v === "number" ? (v << 24) >> 24 : v;
      case "long": return typeof v === "number" ? Math.trunc(v) : v;
      case "double": case "float": return v;
      case "char": return typeof v === "number" ? String.fromCharCode(v & 0xffff) : v;
    }
    return v;
  };
  function toIntJava(d) { if (isNaN(d)) return 0; if (d >= 2147483647) return 2147483647; if (d <= -2147483648) return -2147483648; return Math.trunc(d); }

  // valor numérico de um operando (char vira código)
  function num(v) { return typeof v === "string" ? v.charCodeAt(0) : v; }

  M.acha = function (nome) {
    var f = this.pilha[this.pilha.length - 1];
    for (var i = f.esc.length - 1; i >= 0; i--) if (f.esc[i].has(nome)) return f.esc[i];
    return null;
  };

  // ---------------------------------------------------------- execução de comandos
  M.exec = function (s) {
    this.conta();
    this.linhaAtual = s.linha;
    var f = this.pilha[this.pilha.length - 1];
    f.linha = s.linha;
    switch (s.k) {
      case "bloco": return this.execBloco(s.cs);
      case "vazio": return;
      case "decl": {
        var self = this, partes = [];
        s.ds.forEach(function (d) {
          var v = d.init ? (d.init.k === "arrayInit" ? self.arrInit(d.init) : self.coage(self.ev(d.init), d.tipo, d.init.t)) : undefined;
          f.esc[f.esc.length - 1].set(d.nome, { v: v, t: d.tipo });
          if (d.init) {
            var simples = d.init.k === "lit" || d.init.k === "arrayInit" || d.init.k === "novoArray" || d.init.k === "novo" || self.texto(d.init) === self.mostra(v, d.tipo);
            partes.push(d.nome + " = " + (simples ? self.mostra(v, d.tipo) : self.texto(d.init) + "   ⟶  " + d.nome + " = " + self.mostra(v, d.tipo)));
          }
        });
        this.passo(s, partes.length ? tStr(s.tipo) + " " + partes.join(", ") : "declara " + s.ds.map(function (d) { return d.nome; }).join(", "));
        return;
      }
      case "expr": {
        var e = s.e, v = this.ev(e);
        if (e.k === "chamada" && e.m) return;
        this.passo(s, this.descreveEfeito(e, v));
        return;
      }
      case "if": {
        var c = this.ev(s.cond);
        this.passo(s, "if (" + this.texto(s.cond) + ")" + this.comValores(s.cond) + " → " + (c ? "verdadeiro" : "falso"), { cond: c });
        if (c) return this.execEsc(s.entao);
        if (s.senao) return this.execEsc(s.senao);
        return;
      }
      case "while": {
        for (;;) {
          this.linhaAtual = s.linha; f.linha = s.linha;
          var cw = this.ev(s.cond);
          this.passo(s, "while (" + this.texto(s.cond) + ")" + this.comValores(s.cond) + " → " + (cw ? "verdadeiro: entra no laço" : "falso: sai do laço"), { cond: cw });
          if (!cw) return;
          var r = this.execEsc(s.corpo);
          if (r === BREAK) return;
          if (r instanceof Retorno) return r;
          this.conta();
        }
      }
      case "do": {
        for (;;) {
          var rd = this.execEsc(s.corpo);
          if (rd === BREAK) return;
          if (rd instanceof Retorno) return rd;
          this.linhaAtual = s.linhaCond; f.linha = s.linhaCond;
          var cd = this.ev(s.cond);
          this.passo({ linha: s.linhaCond }, "while (" + this.texto(s.cond) + ") → " + (cd ? "verdadeiro: repete" : "falso: sai"), { cond: cd });
          if (!cd) return;
        }
      }
      case "for": {
        f.esc.push(new Map());
        try {
          for (var i = 0; i < s.init.length; i++) this.exec(s.init[i]);
          for (;;) {
            this.linhaAtual = s.linha; f.linha = s.linha;
            var cf = s.cond ? this.ev(s.cond) : true;
            if (s.cond) this.passo(s, "for: " + this.texto(s.cond) + this.comValores(s.cond) + " → " + (cf ? "verdadeiro: executa o corpo" : "falso: sai do for"), { cond: cf });
            if (!cf) return;
            var rf = this.execEsc(s.corpo);
            if (rf === BREAK) return;
            if (rf instanceof Retorno) return rf;
            this.linhaAtual = s.linha; f.linha = s.linha;
            for (var u = 0; u < s.upd.length; u++) this.exec(s.upd[u]);
          }
        } finally { f.esc.pop(); }
      }
      case "foreach": {
        var col = this.ev(s.col), itens;
        if (col === null) this.lanca("NullPointerException");
        if (col.k === "arr" || col.k === "list" || col.k === "deque") itens = col.a.slice();
        else if (col.k === "map") itens = mapaOrdem(col).map(function (e) { return e.k; });
        else if (col.k === "keys") itens = col.itens;
        else this.lanca("UnsupportedOperationException", "for-each");
        f.esc.push(new Map());
        try {
          for (var j = 0; j < itens.length; j++) {
            this.linhaAtual = s.linha; f.linha = s.linha;
            var x = this.coage(itens[j], s.tipo, s.tipoCol && s.tipoCol.d ? elem(s.tipoCol) : arg(s.tipoCol, 0));
            f.esc[f.esc.length - 1].set(s.nome, { v: x, t: s.tipo });
            this.passo(s, "for-each: " + s.nome + " = " + this.mostra(x, s.tipo) + " (" + (j + 1) + "º de " + itens.length + ")");
            var rr = this.execEsc(s.corpo);
            if (rr === BREAK) break;
            if (rr instanceof Retorno) return rr;
          }
          this.linhaAtual = s.linha;
          if (!itens.length) this.passo(s, "for-each: coleção vazia, não executa o corpo");
        } finally { f.esc.pop(); }
        return;
      }
      case "return": {
        var rv = s.e ? this.coage(this.ev(s.e), f.metodo.tipoRet, s.e.t) : undefined;
        this.linhaAtual = s.linha; f.linha = s.linha;
        this.passo(s, s.e ? "return " + this.mostra(rv, f.metodo.tipoRet) + (s.e.k === "lit" || s.e.k === "nome" ? "" : "   (" + this.texto(s.e) + ")") : "return", { ret: true, valor: rv });
        return new Retorno(rv);
      }
      case "break": this.passo(s, "break: sai do laço"); return BREAK;
      case "continue": this.passo(s, "continue: vai para a próxima volta"); return CONTINUE;
      case "throw": {
        var ex = this.ev(s.e);
        if (ex === null) this.lanca("NullPointerException");
        throw new JavaExc(ex.classe, ex.msg, s.linha);
      }
      case "try": {
        try { return this.exec(s.bloco); }
        catch (err) {
          if (!(err instanceof JavaExc)) throw err;
          for (var k = 0; k < s.catches.length; k++) {
            var ca = s.catches[k];
            if (ca.tipos.some(function (t) { return subclasse(err.classe, t); })) {
              f.esc.push(new Map([[ca.nome, { v: { id: this.novoId(), k: "exc", classe: err.classe, msg: err.msg }, t: T(err.classe) }]]));
              this.passo({ linha: ca.bloco.linha }, "catch: capturou " + err.classe + (err.msg ? ": " + err.msg : ""));
              try { return this.exec(ca.bloco); } finally { f.esc.pop(); }
            }
          }
          throw err;
        } finally { if (s.fin) this.exec(s.fin); }
      }
      case "switch": {
        var sv = this.ev(s.e), achou = -1;
        for (var ci = 0; ci < s.casos.length && achou < 0; ci++) for (var ri = 0; ri < s.casos[ci].rot.length; ri++) if (igualJava(this.ev(s.casos[ci].rot[ri]), sv)) { achou = ci; break; }
        if (achou < 0) achou = s.casos.findIndex(function (c) { return c.def; });
        this.passo(s, "switch (" + this.mostra(sv, s.e.t) + ")" + (achou < 0 ? ": nenhum case" : ""));
        if (achou < 0) return;
        f.esc.push(new Map());
        try {
          for (var q = achou; q < s.casos.length; q++) for (var z = 0; z < s.casos[q].cs.length; z++) {
            var rs = this.exec(s.casos[q].cs[z]);
            if (rs === BREAK) return;
            if (rs) return rs;
          }
        } finally { f.esc.pop(); }
        return;
      }
    }
  };
  M.execBloco = function (cs) {
    var f = this.pilha[this.pilha.length - 1];
    f.esc.push(new Map());
    try {
      for (var i = 0; i < cs.length; i++) { var r = this.exec(cs[i]); if (r) return r; }
    } finally { f.esc.pop(); }
  };
  M.execEsc = function (s) {
    if (s.k === "bloco") return this.execBloco(s.cs);
    var f = this.pilha[this.pilha.length - 1];
    f.esc.push(new Map());
    try { return this.exec(s); } finally { f.esc.pop(); }
  };
  M.arrInit = function (e) {
    var self = this, el = elem(e.tipo);
    var a = e.els.map(function (x) { return x.k === "arrayInit" ? self.arrInit(x) : self.coage(self.ev(x), el, x.t); });
    return this.novoArr(el, a);
  };
  M.novoArr = function (el, a) { var o = { id: this.novoId(), k: "arr", t: el, a: a }; return o; };

  // ---------------------------------------------------------- expressões
  M.ev = function (e) {
    this.conta();
    switch (e.k) {
      case "lit": return e.v;
      case "paren": return this.ev(e.e);
      case "this": return this.pilha[this.pilha.length - 1].este;
      case "nome": return this.leNome(e);
      case "campo": {
        if (e.estatico) {
          var cn = e.estatico, nm = e.nome;
          if (cn === "Integer") return nm === "MAX_VALUE" ? 2147483647 : -2147483648;
          if (cn === "Long") return nm === "MAX_VALUE" ? 9223372036854775807 : -9223372036854775808;
          if (cn === "Double") return { MAX_VALUE: Number.MAX_VALUE, MIN_VALUE: Number.MIN_VALUE, POSITIVE_INFINITY: Infinity, NEGATIVE_INFINITY: -Infinity }[nm];
          if (cn === "Character") return nm === "MAX_VALUE" ? "￿" : "\0";
          if (cn === "Math") return nm === "PI" ? Math.PI : Math.E;
          if (cn === "System") return { k: "out" };
          return this.estaticos[cn][nm];
        }
        var o = this.ev(e.obj);
        if (o === null || o === undefined) this.lanca("NullPointerException", "Cannot read field \"" + e.nome + "\" because \"" + this.texto(e.obj) + "\" is null");
        if (o.k === "arr" && e.nome === "length") return o.a.length;
        if (o.k === "obj") return o.campos[e.nome];
        this.lanca("RuntimeException", "campo " + e.nome);
      }
      case "indice": {
        var arr = this.ev(e.a), i = num(this.ev(e.i));
        if (arr === null) this.lanca("NullPointerException", "Cannot load from " + (elem(e.a.t).n) + " array because \"" + this.texto(e.a) + "\" is null");
        if (i < 0 || i >= arr.a.length) this.lanca("ArrayIndexOutOfBoundsException", "Index " + i + " out of bounds for length " + arr.a.length);
        this.acessos.push({ r: arr.id, i: i, w: false });
        return arr.a[i];
      }
      case "atrib": return this.atrib(e);
      case "incdec": {
        var velho = this.ev(e.alvo), t = e.t, nv;
        if (ehChar(t)) nv = String.fromCharCode((velho.charCodeAt(0) + (e.op === "++" ? 1 : -1)) & 0xffff);
        else nv = this.coage(num(velho) + (e.op === "++" ? 1 : -1), t, T_LONG);
        if (prim(t) === "int") nv = (num(velho) + (e.op === "++" ? 1 : -1)) | 0;
        this.escreve(e.alvo, nv);
        return e.pre ? nv : velho;
      }
      case "un": {
        var v = this.ev(e.e);
        if (e.op === "!") return !v;
        var n = num(v), tt = e.t;
        if (e.op === "-") return prim(tt) === "int" ? (-n) | 0 : -n;
        if (e.op === "+") return n;
        if (e.op === "~") return ~n;
      }
      case "bin": return this.bin(e);
      case "cond": return this.ev(e.c) ? this.ev(e.a) : this.ev(e.b);
      case "cast": {
        var cv = this.ev(e.e), p = e.tipo.n;
        if (e.tipo.d || !PRIM.has(p)) {
          if (cv !== null && BOX[p] && typeof cv === "number" && BOX[p] === "char") return String.fromCharCode(cv);
          return cv;
        }
        if (p === "boolean") return cv;
        var x = num(cv);
        switch (p) {
          case "int": return ehDouble(e.e.t) ? toIntJava(x) : x | 0;
          case "long": return Math.trunc(x);
          case "short": return (x << 16) >> 16;
          case "byte": return (x << 24) >> 24;
          case "char": return String.fromCharCode(Math.trunc(x) & 0xffff);
          case "double": case "float": return x;
        }
        return cv;
      }
      case "instanceof": { var io = this.ev(e.e); return io !== null && io !== undefined; }
      case "novoArray": {
        if (e.init) return this.arrInit(e.init);
        var self = this, dims = e.dims.map(function (d) { var n = num(self.ev(d)); if (n < 0) self.lanca("NegativeArraySizeException", String(n)); return n; });
        var cria = function (k, tipo) {
          var el = elem(tipo), a = new Array(dims[k]);
          for (var q = 0; q < dims[k]; q++) a[q] = k + 1 < dims.length ? cria(k + 1, el) : self.padrao(el);
          return self.novoArr(el, a);
        };
        return cria(0, e.tipo);
      }
      case "novo": return this.novo(e);
      case "chamada": return this.chamada(e);
    }
    throw new Error("expressão não tratada: " + e.k);
  };
  M.leNome = function (e) {
    if (e.onde === "local") {
      var esc = this.acha(e.nome), c = esc.get(e.nome);
      if (c.v === undefined) this.lanca("Error", "variável " + e.nome + " usada sem valor");
      return c.v;
    }
    if (e.onde === "estatico") return this.estaticos[e.dono][e.nome];
    if (e.onde === "inst") return this.pilha[this.pilha.length - 1].este.campos[e.nome];
    return null;
  };
  M.escreve = function (alvo, v) {
    if (alvo.k === "nome") {
      if (alvo.onde === "local") { this.acha(alvo.nome).get(alvo.nome).v = v; return; }
      if (alvo.onde === "estatico") { this.estaticos[alvo.dono][alvo.nome] = v; return; }
      if (alvo.onde === "inst") { this.pilha[this.pilha.length - 1].este.campos[alvo.nome] = v; return; }
    }
    if (alvo.k === "campo") {
      if (alvo.estatico) { this.estaticos[alvo.estatico][alvo.nome] = v; return; }
      var o = this.ev(alvo.obj);
      if (o === null) this.lanca("NullPointerException");
      if (o.k === "arr") this.lanca("Error", "length é só leitura");
      o.campos[alvo.nome] = v; return;
    }
    if (alvo.k === "indice") {
      var arr = this.ev(alvo.a), i = num(this.ev(alvo.i));
      if (arr === null) this.lanca("NullPointerException", "Cannot store to " + elem(alvo.a.t).n + " array because \"" + this.texto(alvo.a) + "\" is null");
      if (i < 0 || i >= arr.a.length) this.lanca("ArrayIndexOutOfBoundsException", "Index " + i + " out of bounds for length " + arr.a.length);
      arr.a[i] = v;
      this.acessos.push({ r: arr.id, i: i, w: true });
    }
  };
  M.atrib = function (e) {
    var t = e.alvo.t, v;
    if (e.op === "=") {
      // em a[i] = expr, o Java avalia a e i ANTES do lado direito
      if (e.alvo.k === "indice") {
        var arr = this.ev(e.alvo.a), i = num(this.ev(e.alvo.i));
        v = this.coage(this.ev(e.v), t, e.v.t);
        if (arr === null) this.lanca("NullPointerException", "Cannot store to " + elem(e.alvo.a.t).n + " array because \"" + this.texto(e.alvo.a) + "\" is null");
        if (i < 0 || i >= arr.a.length) this.lanca("ArrayIndexOutOfBoundsException", "Index " + i + " out of bounds for length " + arr.a.length);
        arr.a[i] = v;
        this.acessos.push({ r: arr.id, i: i, w: true });
        return v;
      }
      v = this.coage(this.ev(e.v), t, e.v.t);
      this.escreve(e.alvo, v);
      return v;
    }
    var velho = this.ev(e.alvo), dir = this.ev(e.v), op = e.op.slice(0, -1);
    if (op === "+" && ehString(t)) v = velho + this.str(dir, e.v.t);
    else if (prim(t) === "boolean") v = op === "&" ? velho && dir : op === "|" ? velho || dir : velho !== dir;
    else {
      var tp = promove(t, e.v.t), r = this.aritm(op, num(velho), num(dir), tp);
      v = this.coage(r, t, tp);
    }
    this.escreve(e.alvo, v);
    return v;
  };
  M.aritm = function (op, a, b, tp) {
    var inteiro = !ehDouble(tp), ehInt = prim(tp) === "int";
    if (prim(tp) === "long" && /^(<<|>>|>>>)$/.test(op)) {
      var A = BigInt.asIntN(64, BigInt(Math.trunc(a))), B = BigInt(b & 63);
      return Number(op === "<<" ? BigInt.asIntN(64, A << B) : op === ">>" ? A >> B : BigInt.asIntN(64, BigInt.asUintN(64, A) >> B));
    }
    switch (op) {
      case "+": return ehInt ? (a + b) | 0 : a + b;
      case "-": return ehInt ? (a - b) | 0 : a - b;
      case "*": return ehInt ? Math.imul(a, b) : a * b;
      case "/": if (inteiro) { if (b === 0) this.lanca("ArithmeticException", "/ by zero"); return ehInt ? (a / b) | 0 : Math.trunc(a / b); } return a / b;
      case "%": if (inteiro) { if (b === 0) this.lanca("ArithmeticException", "/ by zero"); return a % b; } return a % b;
      case "<<": return a << b;
      case ">>": return a >> b;
      case ">>>": return a >>> b | 0;
      case "&": return a & b;
      case "|": return a | b;
      case "^": return a ^ b;
    }
  };
  M.bin = function (e) {
    var op = e.op;
    if (op === "&&") return this.ev(e.a) ? !!this.ev(e.b) : false;
    if (op === "||") return this.ev(e.a) ? true : !!this.ev(e.b);
    var a = this.ev(e.a), b = this.ev(e.b);
    if (e.concat) return this.str(a, e.a.t) + this.str(b, e.b.t);
    if (op === "==" || op === "!=") {
      var ig;
      if (e.num) ig = num(a) === num(b);
      else ig = a === b;
      return op === "==" ? ig : !ig;
    }
    if (op === "<") return num(a) < num(b);
    if (op === ">") return num(a) > num(b);
    if (op === "<=") return num(a) <= num(b);
    if (op === ">=") return num(a) >= num(b);
    if (prim(e.t) === "boolean") return op === "&" ? a && b : op === "|" ? a || b : a !== b;
    if (a === null || b === null) this.lanca("NullPointerException");
    return this.aritm(op, num(a), num(b), e.t);
  };
  M.novo = function (e) {
    var tn = e.tipo.n, self = this, args = e.args.map(function (x) { return self.ev(x); });
    if (this.cls[tn]) {
      var cl = this.cls[tn], o = { id: this.novoId(), k: "obj", classe: tn, campos: {} };
      cl.campos.forEach(function (f) { if (!f.estatico) o.campos[f.nome] = self.padrao(f.tipo); });
      // inicializadores de campo
      if (cl.campos.some(function (f) { return !f.estatico && f.init; })) {
        this.pilha.push({ metodo: { nome: "<init>", classe: tn }, esc: [new Map()], este: o, linha: cl.linha, id: 0 });
        try { cl.campos.forEach(function (f) { if (!f.estatico && f.init) o.campos[f.nome] = self.coage(f.init.k === "arrayInit" ? self.arrInit(f.init) : self.ev(f.init), f.tipo, f.init.t); }); }
        finally { this.pilha.pop(); }
      }
      if (e.ctor) this.invoca(e.ctor, args, o, e);
      return o;
    }
    if (EXC.hasOwnProperty(tn)) return { id: this.novoId(), k: "exc", classe: tn, msg: args.length ? (args[0] === null ? null : this.str(args[0], e.args[0].t)) : null };
    switch (tn) {
      case "ArrayList": case "LinkedList": case "Vector": {
        var l = { id: this.novoId(), k: "list", t: e.tipo, a: [], ll: tn === "LinkedList" };
        if (args.length && args[0] && typeof args[0] === "object") l.a = colecaoItens(args[0]);
        return l;
      }
      case "ArrayDeque": {
        var d = { id: this.novoId(), k: "deque", t: e.tipo, a: [] };
        if (args.length && args[0] && typeof args[0] === "object") d.a = colecaoItens(args[0]);
        return d;
      }
      case "Stack": return { id: this.novoId(), k: "deque", t: e.tipo, a: [], pilha: true };
      case "HashMap": case "TreeMap": case "LinkedHashMap": return novoMapa(this.novoId(), e.tipo, tn === "TreeMap", tn === "LinkedHashMap");
      case "HashSet": case "TreeSet": case "LinkedHashSet": {
        var s = novoMapa(this.novoId(), e.tipo, tn === "TreeSet", tn === "LinkedHashSet"); s.conj = true;
        if (args.length && args[0] && typeof args[0] === "object") colecaoItens(args[0]).forEach(function (x) { mapaPut(s, x, true); });
        return s;
      }
      case "StringBuilder": return { id: this.novoId(), k: "sb", s: args.length ? (typeof args[0] === "string" ? args[0] : "") : "" };
      case "String": return args.length ? (args[0] && args[0].k === "arr" ? args[0].a.join("") : String(args[0])) : "";
      case "Object": return { id: this.novoId(), k: "obj", classe: "Object", campos: {} };
      case "Integer": case "Double": case "Long": case "Character": case "Boolean": return args[0];
    }
    this.lanca("RuntimeException", "não sei criar " + tn);
  };
  function colecaoItens(c) {
    if (c.k === "list" || c.k === "deque" || c.k === "arr") return c.a.slice();
    if (c.k === "map") return mapaOrdem(c).map(function (e) { return e.k; });
    if (c.k === "keys") return c.itens.slice();
    return [];
  }

  M.chamada = function (e) {
    var self = this;
    if (e.m) {
      var este = null;
      if (!e.m.estatico) {
        if (e.obj) { este = this.ev(e.obj); if (este === null) this.lanca("NullPointerException", "Cannot invoke \"" + e.m.classe + "." + e.nome + "()\" because \"" + this.texto(e.obj) + "\" is null"); }
        else este = this.pilha[this.pilha.length - 1].este;
      }
      var args = e.args.map(function (x) { return self.ev(x); });
      return this.invoca(e.m, args, este, e);
    }
    if (e.lib === "out") {
      var a = e.args.length ? this.ev(e.args[0]) : undefined, txt = "";
      if (e.nome === "printf" || e.nome === "format") {
        var vals = e.args.slice(1).map(function (x) { return { v: self.ev(x), t: x.t }; });
        txt = this.printf(a, vals);
      } else txt = a === undefined ? "" : this.str(a, e.args[0].t);
      if (e.nome === "println") txt += "\n";
      this.saida += txt;
      if (this.saida.length > 200000) this.lanca("Error", "saída grande demais");
      return;
    }
    if (e.lib === "static") return this.estatico(e);
    return this.instancia(e);
  };
  M.invoca = function (m, args, este, noChamada) {
    if (this.pilha.length >= this.maxProf) this.lanca("StackOverflowError");
    var esc = new Map(), self = this;
    m.params.forEach(function (p, i) { esc.set(p.nome, { v: self.coage(args[i], p.tipo, noChamada && noChamada.args[i] ? noChamada.args[i].t : null), t: p.tipo }); });
    var id = this.chamadas.length, pai = this.pilha.length ? this.pilha[this.pilha.length - 1].chamada : null;
    var f = { metodo: m, esc: [esc], este: este, linha: m.linha, id: id, chamada: id };
    var reg = { id: id, pai: pai, metodo: m.nome, classe: m.classe, args: m.params.map(function (p, i) { return p.nome + "=" + self.mostraCurto(esc.get(p.nome).v, p.tipo); }), argsV: m.params.map(function (p) { return esc.get(p.nome).v; }), ini: this.passos.length, prof: this.pilha.length };
    if (this.rastrear) this.chamadas.push(reg); else this.chamadas.length++;
    this.pilha.push(f);
    var salvaLinha = this.linhaAtual;
    this.linhaAtual = m.linha;
    this.passo({ linha: m.linha }, "chama " + (m.ctor ? "new " + m.classe : m.nome) + "(" + reg.args.join(", ") + ")", { chamada: true });
    var r;
    try {
      r = this.execBloco(m.corpo.cs);
      if (!(r instanceof Retorno)) {
        if (m.tipoRet && m.tipoRet.n !== "void" && !m.ctor) this.lanca("Error", "o método " + m.nome + " terminou sem return");
        r = undefined;
      } else r = r.v;
      reg.ret = m.tipoRet && m.tipoRet.n !== "void" && !m.ctor ? this.mostraCurto(r, m.tipoRet) : null;
      reg.retV = r;
      reg.fim = this.passos.length;
      return r;
    } catch (err) {
      if (err instanceof RangeError) throw new JavaExc("StackOverflowError", null, this.linhaAtual);
      reg.fim = this.passos.length; reg.erro = true;
      throw err;
    } finally {
      this.pilha.pop();
      this.linhaAtual = salvaLinha;
      if (!reg.erro && this.rastrear && this.pilha.length) this.passo({ linha: salvaLinha }, (m.ctor ? "new " + m.classe : m.nome) + "(" + reg.args.join(", ") + ") terminou" + (reg.ret !== null && reg.ret !== undefined ? " e devolveu " + reg.ret : ""), { voltou: id });
    }
  };

  // ---------------------------------------------------------- biblioteca
  M.estatico = function (e) {
    var self = this, a = e.args.map(function (x) { return self.ev(x); }), t = e.args.map(function (x) { return x.t; });
    var nome = e.cls + "." + e.nome;
    function nn(i) { return num(a[i]); }
    function arrOk(i) { if (a[i] === null) self.lanca("NullPointerException"); return a[i]; }
    switch (nome) {
      case "Math.max": return Math.max(nn(0), nn(1));
      case "Math.min": return Math.min(nn(0), nn(1));
      case "Math.abs": return prim(e.t) === "int" ? Math.abs(nn(0)) | 0 : Math.abs(nn(0));
      case "Math.pow": return Math.pow(nn(0), nn(1));
      case "Math.sqrt": return Math.sqrt(nn(0));
      case "Math.cbrt": return Math.cbrt(nn(0));
      case "Math.floor": return Math.floor(nn(0));
      case "Math.ceil": return Math.ceil(nn(0));
      case "Math.log": return Math.log(nn(0));
      case "Math.log10": return Math.log10(nn(0));
      case "Math.exp": return Math.exp(nn(0));
      case "Math.round": return Math.floor(nn(0) + 0.5);
      case "Math.random": return Math.random();
      case "Math.floorMod": return ((nn(0) % nn(1)) + nn(1)) % nn(1);
      case "Math.floorDiv": return Math.floor(nn(0) / nn(1));
      case "Integer.max": return Math.max(nn(0), nn(1));
      case "Integer.min": return Math.min(nn(0), nn(1));
      case "Integer.sum": return (nn(0) + nn(1)) | 0;
      case "Integer.compare": return nn(0) < nn(1) ? -1 : nn(0) > nn(1) ? 1 : 0;
      case "Integer.signum": return Math.sign(nn(0));
      case "Integer.bitCount": { var x = nn(0) >>> 0, c = 0; while (x) { c += x & 1; x >>>= 1; } return c; }
      case "Integer.parseInt": case "Integer.valueOf": {
        if (typeof a[0] === "number") return a[0];
        var s = a[0];
        if (!/^[+-]?\d+$/.test(s || "") || Math.abs(Number(s)) > 2147483648) this.lanca("NumberFormatException", "For input string: \"" + s + "\"");
        return Number(s) | 0;
      }
      case "Long.parseLong": return Number(a[0]);
      case "Double.parseDouble": return parseFloat(a[0]);
      case "Integer.toString": case "Long.toString": case "Double.toString": case "String.valueOf": case "Character.toString": return a[0] && a[0].k === "arr" ? a[0].a.join("") : this.str(a[0], t[0]);
      case "Integer.toBinaryString": return (nn(0) >>> 0).toString(2);
      case "Character.isDigit": return /[0-9]/.test(a[0]);
      case "Character.isLetter": case "Character.isAlphabetic": return /\p{L}/u.test(a[0]);
      case "Character.isLetterOrDigit": return /[\p{L}0-9]/u.test(a[0]);
      case "Character.isUpperCase": return a[0] !== a[0].toLowerCase();
      case "Character.isLowerCase": return a[0] !== a[0].toUpperCase();
      case "Character.isWhitespace": return /\s/.test(a[0]);
      case "Character.toUpperCase": return typeof a[0] === "string" ? a[0].toUpperCase() : a[0];
      case "Character.toLowerCase": return typeof a[0] === "string" ? a[0].toLowerCase() : a[0];
      case "Character.getNumericValue": return /[0-9]/.test(a[0]) ? Number(a[0]) : /[a-z]/i.test(a[0]) ? a[0].toLowerCase().charCodeAt(0) - 87 : -1;
      case "Objects.equals": return igualJava(a[0], a[1]) || (a[0] !== null && a[0] === a[1]);
      case "String.join": return (a[1] && a[1].k ? colecaoItens(a[1]) : a.slice(1)).join(a[0]);
      case "Arrays.fill": {
        var arr = arrOk(0);
        if (a.length === 2) { for (var i = 0; i < arr.a.length; i++) { arr.a[i] = this.coage(a[1], arr.t, t[1]); } }
        else { if (nn(1) > nn(2)) this.lanca("IllegalArgumentException", "fromIndex(" + nn(1) + ") > toIndex(" + nn(2) + ")"); for (var j = nn(1); j < nn(2); j++) { if (j < 0 || j >= arr.a.length) this.lanca("ArrayIndexOutOfBoundsException", "Array index out of range: " + j); arr.a[j] = this.coage(a[3], arr.t, t[3]); } }
        return;
      }
      case "Arrays.toString": {
        if (a[0] === null) return "null";
        var el = a[0].t;
        return "[" + a[0].a.map(function (v) { return self.str(v, el); }).join(", ") + "]";
      }
      case "Arrays.deepToString": {
        if (a[0] === null) return "null";
        var deep = function (o) { return "[" + o.a.map(function (v) { return v && v.k === "arr" ? deep(v) : self.str(v, o.t); }).join(", ") + "]"; };
        return deep(a[0]);
      }
      case "Arrays.sort": {
        var arr2 = arrOk(0), ini = a.length > 1 ? nn(1) : 0, fim = a.length > 2 ? nn(2) : arr2.a.length;
        var parte = arr2.a.slice(ini, fim).sort(function (x, y) { x = num(x); y = num(y); return typeof x === "string" ? (x < y ? -1 : x > y ? 1 : 0) : x - y; });
        for (var q = 0; q < parte.length; q++) arr2.a[ini + q] = parte[q];
        return;
      }
      case "Arrays.copyOf": { var o = arrOk(0), n = nn(1), c2 = []; if (n < 0) this.lanca("NegativeArraySizeException", String(n)); for (var z = 0; z < n; z++) c2.push(z < o.a.length ? o.a[z] : this.padrao(o.t)); return this.novoArr(o.t, c2); }
      case "Arrays.copyOfRange": { var o2 = arrOk(0), de = nn(1), ate = nn(2), c3 = []; if (de > ate) this.lanca("IllegalArgumentException", de + " > " + ate); if (de < 0 || de > o2.a.length) this.lanca("ArrayIndexOutOfBoundsException", "Array index out of range: " + de); for (var w = de; w < ate; w++) c3.push(w < o2.a.length ? o2.a[w] : this.padrao(o2.t)); return this.novoArr(o2.t, c3); }
      case "Arrays.equals": return a[0] && a[1] && a[0].a.length === a[1].a.length && a[0].a.every(function (v, i) { return v === a[1].a[i]; });
      case "Arrays.asList": case "List.of": {
        var itens = a.length === 1 && a[0] && a[0].k === "arr" && !PRIM.has(a[0].t.n) ? a[0].a.slice() : a;
        return { id: this.novoId(), k: "list", t: e.t, a: itens.slice(), fixa: nome === "List.of" ? "imutavel" : "tamanho" };
      }
      case "Collections.sort": { var l = a[0]; l.a.sort(function (x, y) { x = num(x); y = num(y); return typeof x === "string" ? (x < y ? -1 : x > y ? 1 : 0) : x - y; }); return; }
      case "Collections.reverse": a[0].a.reverse(); return;
      case "Collections.swap": { var tmp = a[0].a[nn(1)]; a[0].a[nn(1)] = a[0].a[nn(2)]; a[0].a[nn(2)] = tmp; return; }
      case "Collections.max": return a[0].a.reduce(function (x, y) { return num(y) > num(x) ? y : x; });
      case "Collections.min": return a[0].a.reduce(function (x, y) { return num(y) < num(x) ? y : x; });
      case "Objects.hash": return a.reduce(function (h, v) { return (Math.imul(31, h) + hashJava(v)) | 0; }, 1);
    }
    this.lanca("RuntimeException", "método não implementado: " + nome);
  };
  M.instancia = function (e) {
    var o = this.ev(e.obj), self = this;
    var a = e.args.map(function (x) { return self.ev(x); }), t = e.args.map(function (x) { return x.t; });
    if (o === null || o === undefined) this.lanca("NullPointerException", "Cannot invoke \"" + tStr(e.obj.t) + "." + e.nome + "()\" because \"" + this.texto(e.obj) + "\" is null");
    var nome = e.nome;
    function nn(i) { return num(a[i]); }
    function idx(i, len) { if (i < 0 || i >= len) self.lanca("IndexOutOfBoundsException", "Index " + i + " out of bounds for length " + len); }
    if (typeof o === "string") {
      switch (nome) {
        case "length": return o.length;
        case "charAt": if (nn(0) < 0 || nn(0) >= o.length) this.lanca("StringIndexOutOfBoundsException", "Index " + nn(0) + " out of bounds for length " + o.length); return o[nn(0)];
        case "equals": return typeof a[0] === "string" && a[0] === o && !ehChar(t[0]);
        case "equalsIgnoreCase": return typeof a[0] === "string" && a[0].toLowerCase() === o.toLowerCase();
        case "isEmpty": return o.length === 0;
        case "isBlank": return o.trim().length === 0;
        case "substring": { var b = nn(0), en = a.length > 1 ? nn(1) : o.length; if (b < 0 || en > o.length || b > en) this.lanca("StringIndexOutOfBoundsException", "begin " + b + ", end " + en + ", length " + o.length); return o.slice(b, en); }
        case "indexOf": return o.indexOf(a[0], a.length > 1 ? nn(1) : 0);
        case "lastIndexOf": return o.lastIndexOf(a[0]);
        case "contains": return o.indexOf(a[0]) >= 0;
        case "startsWith": return o.startsWith(a[0]);
        case "endsWith": return o.endsWith(a[0]);
        case "toUpperCase": return o.toUpperCase();
        case "toLowerCase": return o.toLowerCase();
        case "trim": case "strip": return o.trim();
        case "repeat": return o.repeat(nn(0));
        case "replace": return o.split(a[0]).join(a[1]);
        case "concat": return o + a[0];
        case "compareTo": { for (var i = 0; i < Math.min(o.length, a[0].length); i++) if (o[i] !== a[0][i]) return o.charCodeAt(i) - a[0].charCodeAt(i); return o.length - a[0].length; }
        case "compareToIgnoreCase": { var x = o.toLowerCase(), y = a[0].toLowerCase(); for (var j = 0; j < Math.min(x.length, y.length); j++) if (x[j] !== y[j]) return x.charCodeAt(j) - y.charCodeAt(j); return x.length - y.length; }
        case "toCharArray": return this.novoArr(T_CHAR, o.split(""));
        case "split": { var partes = o.split(new RegExp(a[0])); while (partes.length && partes[partes.length - 1] === "") partes.pop(); return this.novoArr(T_STR, partes); }
        case "matches": return new RegExp("^(?:" + a[0] + ")$").test(o);
        case "hashCode": return hashJava(o);
        case "toString": return o;
      }
    }
    if (typeof o === "number" || typeof o === "boolean") {
      if (nome === "equals") return o === a[0];
      if (nome === "intValue") return o | 0;
      if (nome === "doubleValue") return o;
      if (nome === "compareTo") return o < a[0] ? -1 : o > a[0] ? 1 : 0;
      if (nome === "toString") return this.str(o, e.obj.t);
      if (nome === "hashCode") return hashJava(o);
    }
    if (o.k === "sb") {
      switch (nome) {
        case "append": o.s += a[0] && a[0].k === "arr" ? a[0].a.join("") : this.str(a[0], t[0]); return o;
        case "toString": return o.s;
        case "length": return o.s.length;
        case "charAt": if (nn(0) < 0 || nn(0) >= o.s.length) this.lanca("StringIndexOutOfBoundsException", "index " + nn(0) + ",length " + o.s.length); return o.s[nn(0)];
        case "reverse": o.s = o.s.split("").reverse().join(""); return o;
        case "insert": o.s = o.s.slice(0, nn(0)) + this.str(a[1], t[1]) + o.s.slice(nn(0)); return o;
        case "deleteCharAt": if (nn(0) < 0 || nn(0) >= o.s.length) this.lanca("StringIndexOutOfBoundsException", "index " + nn(0) + ",length " + o.s.length); o.s = o.s.slice(0, nn(0)) + o.s.slice(nn(0) + 1); return o;
        case "setCharAt": o.s = o.s.slice(0, nn(0)) + a[1] + o.s.slice(nn(0) + 1); return;
        case "setLength": o.s = o.s.slice(0, nn(0)); return;
        case "indexOf": return o.s.indexOf(a[0]);
      }
    }
    if (o.k === "list" || o.k === "deque") {
      var L = o.a, ehFilaObj = o.k === "deque";
      var mut = function () { if (o.fixa === "imutavel") self.lanca("UnsupportedOperationException"); };
      var cresce = function () { if (o.fixa) self.lanca("UnsupportedOperationException"); };
      var vazia = function () { if (!L.length) self.lanca(o.pilha ? "EmptyStackException" : "NoSuchElementException"); };
      switch (nome) {
        case "size": return L.length;
        case "isEmpty": case "empty": return L.length === 0;
        case "add":
          cresce();
          if (a.length === 2) { if (nn(0) < 0 || nn(0) > L.length) this.lanca("IndexOutOfBoundsException", "Index: " + nn(0) + ", Size: " + L.length); L.splice(nn(0), 0, this.boxa(a[1], t[1])); return; }
          if (ehFilaObj && a[0] === null && !o.pilha) this.lanca("NullPointerException");
          L.push(this.boxa(a[0], t[0])); return true;
        case "addLast": case "offer": case "offerLast": cresce(); if (a[0] === null) this.lanca("NullPointerException"); L.push(this.boxa(a[0], t[0])); return nome === "addLast" ? undefined : true;
        case "addFirst": case "offerFirst": if (a[0] === null) this.lanca("NullPointerException"); L.unshift(this.boxa(a[0], t[0])); return nome === "addFirst" ? undefined : true;
        case "push": if (o.pilha) { L.push(this.boxa(a[0], t[0])); return a[0]; } if (a[0] === null) this.lanca("NullPointerException"); L.unshift(this.boxa(a[0], t[0])); return;
        case "pop": vazia(); return o.pilha ? L.pop() : L.shift();
        case "peek": if (o.pilha) { vazia(); return L[L.length - 1]; } return L.length ? L[0] : null;
        case "peekFirst": return L.length ? L[0] : null;
        case "peekLast": return L.length ? L[L.length - 1] : null;
        case "poll": case "pollFirst": return L.length ? L.shift() : null;
        case "pollLast": return L.length ? L.pop() : null;
        case "removeFirst": case "element": case "getFirst": case "firstElement": vazia(); return nome === "removeFirst" ? L.shift() : L[0];
        case "removeLast": case "getLast": case "lastElement": vazia(); return nome === "removeLast" ? L.pop() : L[L.length - 1];
        case "get": idx(nn(0), L.length); return L[nn(0)];
        case "set": { mut(); idx(nn(0), L.length); var ant = L[nn(0)]; L[nn(0)] = this.boxa(a[1], t[1]); return ant; }
        case "remove":
          if (!a.length) { vazia(); return L.shift(); }
          cresce();
          if (e.removeIndice) { idx(nn(0), L.length); return L.splice(nn(0), 1)[0]; }
          { var p = L.findIndex(function (x) { return igualJava(x, a[0]) || x === a[0]; }); if (p >= 0) { L.splice(p, 1); return true; } return false; }
        case "contains": return L.some(function (x) { return x === a[0] || igualJava(x, a[0]); });
        case "indexOf": return L.findIndex(function (x) { return x === a[0] || igualJava(x, a[0]); });
        case "lastIndexOf": { for (var k = L.length - 1; k >= 0; k--) if (L[k] === a[0] || igualJava(L[k], a[0])) return k; return -1; }
        case "clear": cresce(); L.length = 0; return;
        case "addAll": cresce(); colecaoItens(a[0]).forEach(function (x) { L.push(x); }); return true;
        case "equals": return igualJava(o, a[0]);
        case "hashCode": return hashJava(o);
        case "toString": return this.str(o, e.obj.t);
        case "subList": return { id: this.novoId(), k: "list", t: e.obj.t, a: L.slice(nn(0), nn(1)) };
        case "sort": L.sort(function (x, y) { return num(x) - num(y); }); return;
      }
    }
    if (o.k === "map") {
      if (o.conj) {
        switch (nome) {
          case "add": { if (o.m.has(chave(a[0]))) return false; mapaPut(o, this.boxa(a[0], t[0]), true); return true; }
          case "contains": return o.m.has(chave(a[0]));
          case "remove": return o.m.delete(chave(a[0]));
          case "size": return o.m.size;
          case "isEmpty": return o.m.size === 0;
          case "clear": o.m.clear(); return;
          case "addAll": { var mud = false; colecaoItens(a[0]).forEach(function (x) { if (!o.m.has(chave(x))) { mapaPut(o, x, true); mud = true; } }); return mud; }
          case "toString": return this.str(o, e.obj.t);
          case "equals": return false;
        }
      }
      switch (nome) {
        case "put": return mapaPut(o, this.boxa(a[0], t[0]), this.boxa(a[1], t[1]));
        case "get": { var en = o.m.get(chave(a[0])); return en ? en.v : null; }
        case "getOrDefault": { var en2 = o.m.get(chave(a[0])); return en2 ? en2.v : a[1]; }
        case "putIfAbsent": { var en3 = o.m.get(chave(a[0])); if (en3) return en3.v; mapaPut(o, a[0], a[1]); return null; }
        case "containsKey": return o.m.has(chave(a[0]));
        case "containsValue": return Array.from(o.m.values()).some(function (x) { return x.v === a[1 - 1]; });
        case "remove": { var en4 = o.m.get(chave(a[0])); if (!en4) return null; o.m.delete(chave(a[0])); return en4.v; }
        case "size": return o.m.size;
        case "isEmpty": return o.m.size === 0;
        case "clear": o.m.clear(); return;
        case "keySet": return { id: this.novoId(), k: "keys", itens: mapaOrdem(o).map(function (x) { return x.k; }), t: e.t };
        case "values": return { id: this.novoId(), k: "list", t: e.t, a: mapaOrdem(o).map(function (x) { return x.v; }) };
        case "toString": return this.str(o, e.obj.t);
      }
    }
    if (o.k === "keys") {
      switch (nome) {
        case "size": return o.itens.length;
        case "contains": return o.itens.some(function (x) { return x === a[0]; });
        case "isEmpty": return !o.itens.length;
        case "toString": return "[" + o.itens.map(function (x) { return self.str(x, arg(o.t, 0)); }).join(", ") + "]";
      }
    }
    if (o.k === "exc" && nome === "getMessage") return o.msg;
    if (o.k === "arr" && nome === "clone") return this.novoArr(o.t, o.a.slice());
    if (nome === "toString") return this.str(o, e.obj.t);
    if (nome === "equals") return o === a[0] || igualJava(o, a[0]);
    if (nome === "hashCode") return hashJava(o);
    this.lanca("RuntimeException", "método não implementado: " + nome);
  };
  // valores primitivos guardados em coleções mantêm a forma (char continua string)
  M.boxa = function (v) { return v; };

  // ---------------------------------------------------------- texto
  M.str = function (v, t) {
    if (v === null || v === undefined) return "null";
    if (typeof v === "string") return v;
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") {
      if (t && ehDouble(t)) return javaDouble(v);
      if (t && ehChar(t)) return String.fromCharCode(v);
      if (!Number.isInteger(v)) return javaDouble(v);
      return String(v);
    }
    var self = this;
    switch (v.k) {
      case "arr": return "[" + ({ int: "I", char: "C", boolean: "Z", double: "D", long: "J", byte: "B", short: "S", float: "F" }[v.t.d ? "" : v.t.n] || (v.t.d ? "[" : "L" + (v.t.n === "String" ? "java.lang.String" : v.t.n) + ";")) + "@" + (0x1b6d3586 + v.id * 97).toString(16);
      case "list": case "deque": { var et = arg(v.t, 0); return "[" + v.a.map(function (x) { return self.str(x, et); }).join(", ") + "]"; }
      case "map": {
        var ents = mapaOrdem(v), kt = arg(v.t, 0), vt = arg(v.t, 1);
        if (v.conj) return "[" + ents.map(function (x) { return self.str(x.k, kt); }).join(", ") + "]";
        return "{" + ents.map(function (x) { return self.str(x.k, kt) + "=" + self.str(x.v, vt); }).join(", ") + "}";
      }
      case "keys": return "[" + v.itens.map(function (x) { return self.str(x, arg(v.t, 0)); }).join(", ") + "]";
      case "sb": return v.s;
      case "exc": return nomeCompleto(v.classe) + (v.msg !== null ? ": " + v.msg : "");
      case "obj": {
        var cl = this.cls[v.classe];
        if (cl && cl.metodosPorNome.toString) { var m = cl.metodosPorNome.toString.find(function (x) { return !x.params.length; }); if (m) return this.invoca(m, [], v, null); }
        return v.classe + "@" + (0x4e25154f + v.id * 131).toString(16);
      }
      case "out": return "java.io.PrintStream@1";
    }
    return String(v);
  };
  M.printf = function (fmt, vals) {
    var self = this, i = 0;
    return String(fmt).replace(/%(-?\d*)(?:\.(\d+))?([dsfnc%b])/g, function (m, w, prec, c) {
      if (c === "%") return "%"; if (c === "n") return "\n";
      var x = vals[i++], s;
      if (!x) return m;
      if (c === "d") s = String(num(x.v));
      else if (c === "f") s = Number(num(x.v)).toFixed(prec === undefined ? 6 : Number(prec)).replace(".", ",");
      else if (c === "c") s = typeof x.v === "number" ? String.fromCharCode(x.v) : x.v;
      else if (c === "b") s = String(!!x.v);
      else s = self.str(x.v, x.t);
      if (w) { var n = Math.abs(Number(w)); while (s.length < n) s = Number(w) < 0 ? s + " " : " " + s; }
      return s;
    });
  };
  // valor para narração
  M.mostra = function (v, t) {
    if (typeof v === "string" && t && ehChar(t)) return "'" + (v === "\0" ? "\\0" : v) + "'";
    if (typeof v === "string" && t && ehString(t)) return '"' + v + '"';
    if (v && typeof v === "object") {
      if (v.k === "arr") return v.t.d ? "array 2D" : "{" + v.a.map(function (x) { return x === null ? "null" : typeof x === "object" ? "…" : this.mostra(x, v.t); }, this).join(", ") + "}";
      if (v.k === "list" || v.k === "deque" || v.k === "map" || v.k === "keys") return this.str(v, t);
      if (v.k === "sb") return '"' + v.s + '"';
    }
    return this.str(v, t);
  };
  M.mostraCurto = function (v, t) {
    if (v && typeof v === "object" && v.k === "arr") return v.t.d ? "[" + v.a.length + "][…]" : (v.a.length > 8 ? "{" + v.a.slice(0, 7).map(function (x) { return this.mostra(x, v.t); }, this).join(",") + ",…}" : this.mostra(v, t));
    if (v && typeof v === "object" && (v.k === "list" || v.k === "deque")) { var s = this.str(v, t); return s.length > 30 ? s.slice(0, 28) + "…]" : s; }
    return this.mostra(v, t);
  };
  // "  (0 <= 8)" : a expressão com os valores trocados
  M.comValores = function (e) {
    var self = this, mudou = false;
    function r(x) {
      switch (x.k) {
        case "lit": return self.texto(x);
        case "paren": return "(" + r(x.e) + ")";
        case "nome": if (x.onde === "classe") return x.nome; mudou = true; try { return self.mostra(self.leNome(x), x.t); } catch (e) { return x.nome; }
        case "indice": case "campo": mudou = true; try { return self.mostra(self.olha(x), x.t); } catch (e) { return self.texto(x); }
        case "bin": return r(x.a) + " " + x.op + " " + r(x.b);
        case "un": return x.op + r(x.e);
        case "chamada": if (puro(x)) { mudou = true; try { return self.mostra(self.olha(x), x.t); } catch (e) { return self.texto(x); } } return self.texto(x);
        default: return self.texto(x);
      }
    }
    var s = r(e);
    return mudou && s !== this.texto(e) ? "  ⟶  " + s : "";
  };
  // a expressão pode ser reavaliada sem efeito colateral?
  function puro(x) {
    if (!x || typeof x !== "object") return true;
    switch (x.k) {
      case "lit": case "nome": case "this": return true;
      case "paren": return puro(x.e);
      case "campo": return puro(x.obj);
      case "indice": return puro(x.a) && puro(x.i);
      case "bin": return puro(x.a) && puro(x.b);
      case "un": return puro(x.e);
      case "cast": return puro(x.e);
      case "cond": return puro(x.c) && puro(x.a) && puro(x.b);
      case "chamada": return x.lib === "inst" && /^(size|length|isEmpty|charAt|get|contains|equals|peek|peekFirst|peekLast|containsKey|getOrDefault|indexOf)$/.test(x.nome) && puro(x.obj) && x.args.every(puro);
      default: return false;
    }
  }
  // avalia sem efeitos colaterais (só leitura) para a narração
  M.olha = function (x) {
    if (!puro(x)) throw new Error("impuro");
    var salva = this.acessos.length, ops = this.ops;
    try { return this.ev(x); } finally { this.acessos.length = salva; this.ops = ops; }
  };
  M.descreveEfeito = function (e, v) {
    if (e.k === "atrib") {
      var alvo = e.alvo.k === "indice" ? this.texto(e.alvo.a) + "[" + this.mostra(this.olhaSeguro(e.alvo.i), e.alvo.i.t) + "]" : this.texto(e.alvo);
      return alvo + " " + (e.op === "=" ? "=" : e.op) + " " + this.texto(e.v) + (e.op === "=" && (e.v.k === "lit" || this.texto(e.v) === this.mostra(v, e.alvo.t)) ? "" : "   ⟶  " + alvo + " = " + this.mostra(v, e.alvo.t));
    }
    if (e.k === "incdec") return this.texto(e) + "   ⟶  " + this.texto(e.alvo) + " = " + this.mostra(this.olhaSeguro(e.alvo), e.alvo.t);
    if (e.k === "chamada" && e.lib === "out") { var ult = this.saida.split("\n"); return "imprime: " + (e.nome === "println" ? ult[ult.length - 2] : ult[ult.length - 1]); }
    if (e.k === "chamada") return this.texto(e) + (v !== undefined ? "   ⟶  " + this.mostraCurto(v, e.t) : "");
    return this.texto(e);
  };
  M.olhaSeguro = function (x) { try { return this.olha(x); } catch (e) { return "?"; } };

  // ---------------------------------------------------------- rastreio
  M.passo = function (s, narr, extra) {
    if (!this.rastrear) return;
    if (this.passos.length >= this.maxPassos) throw new Limite("passos");
    var self = this, vistos = {}, heap = {};
    function snapVal(v, t) {
      if (v === undefined) return { u: 1 };
      if (v === null) return null;
      if (typeof v !== "object") return { v: v, t: t ? tStr(t) : null };
      snapObj(v);
      return { r: v.id };
    }
    function snapObj(o) {
      if (vistos[o.id]) return;
      vistos[o.id] = 1;
      var s;
      switch (o.k) {
        case "arr": s = { k: "arr", t: tStr(o.t), a: o.a.map(function (x) { return x !== null && typeof x === "object" ? snapVal(x) : x; }) }; break;
        case "list": case "deque": s = { k: o.k, t: tStr(arg(o.t, 0)), a: o.a.map(function (x) { return x !== null && typeof x === "object" ? snapVal(x) : x; }), pilha: !!o.pilha }; break;
        case "map": s = { k: o.conj ? "set" : "map", e: mapaOrdem(o).map(function (x) { return [typeof x.k === "object" ? snapVal(x.k) : x.k, x.v !== null && typeof x.v === "object" ? snapVal(x.v) : x.v]; }), kt: tStr(arg(o.t, 0)), vt: tStr(arg(o.t, 1)) }; break;
        case "sb": s = { k: "sb", s: o.s }; break;
        case "obj": s = { k: "obj", classe: o.classe, c: Object.keys(o.campos).map(function (n) { return [n, snapVal(o.campos[n])]; }) }; break;
        case "keys": s = { k: "list", a: o.itens.slice(), t: "?" }; break;
        default: s = { k: o.k }; break;
      }
      heap[o.id] = s;
    }
    var frames = this.pilha.filter(function (f) { return f.id !== undefined && f.metodo.nome.charAt(0) !== "<"; }).map(function (f) {
      var vars = [], pos = {};
      for (var i = 0; i < f.esc.length; i++) f.esc[i].forEach(function (c, n) {
        var sv = [n, snapVal(c.v, c.t), c.t ? tStr(c.t) : null];
        if (pos[n] !== undefined) vars[pos[n]] = sv; else { pos[n] = vars.length; vars.push(sv); }
      });
      if (f.este) vars.unshift(["this", snapVal(f.este)]);
      return { metodo: f.metodo.nome, classe: f.metodo.classe, linha: f.linha, vars: vars, chamada: f.chamada };
    });
    var est = [];
    Object.keys(this.estaticos).forEach(function (c) { Object.keys(self.estaticos[c]).forEach(function (n) { var cl = self.cls[c], fd = cl && cl.campoPorNome[n]; est.push([n, snapVal(self.estaticos[c][n], fd && fd.tipo)]); }); });
    var p = { linha: s.linha, narr: narr, frames: frames, estaticos: est, heap: heap, saida: this.saida.length, acessos: this.acessos, chamadaAtual: frames.length ? frames[frames.length - 1].chamada : null };
    if (extra) Object.keys(extra).forEach(function (k) { p[k] = k === "valor" ? snapVal(extra[k]) : extra[k]; });
    this.acessos = [];
    this.passos.push(p);
  };

  // ------------------------------------------------------------------ API
  function compilar(src) {
    try {
      var prog = new Parser(src).programa();
      analisar(prog, src);
      return { ok: true, prog: prog, src: src };
    } catch (e) {
      if (e instanceof ErroCompilacao) return { ok: false, erros: [{ linha: e.linha, col: e.col, msg: e.msg }] };
      throw e;
    }
  }
  function acharMain(prog) {
    for (var i = 0; i < prog.classes.length; i++) {
      var ms = prog.classes[i].metodosPorNome.main;
      if (ms) { var m = ms.find(function (x) { return x.estatico && x.params.length === 1 && x.params[0].tipo.n === "String" && x.params[0].tipo.d === 1; }); if (m) return m; }
    }
    return null;
  }
  function rodar(maq, fn) {
    var res = { saida: "", erro: null, limite: null };
    try { maq.inicializaEstaticos(); res.valor = fn(); }
    catch (e) {
      if (e instanceof JavaExc) res.erro = { classe: e.classe, nomeCompleto: nomeCompleto(e.classe), msg: e.msg, linha: e.linha, pilha: maq.pilha.map(function (f) { return f.metodo.classe + "." + f.metodo.nome; }).reverse() };
      else if (e instanceof Limite) res.limite = e.tipo;
      else if (e instanceof RangeError) res.erro = { classe: "StackOverflowError", nomeCompleto: "java.lang.StackOverflowError", msg: null, linha: maq.linhaAtual };
      else throw e;
      if (res.erro && maq.rastrear && maq.passos.length < maq.maxPassos) {
        maq.passos.push({ linha: res.erro.linha, narr: "exceção: " + res.erro.nomeCompleto + (res.erro.msg ? ": " + res.erro.msg : ""), frames: maq.passos.length ? maq.passos[maq.passos.length - 1].frames : [], estaticos: [], heap: maq.passos.length ? maq.passos[maq.passos.length - 1].heap : {}, saida: maq.saida.length, acessos: maq.acessos, erro: res.erro, chamadaAtual: maq.passos.length ? maq.passos[maq.passos.length - 1].chamadaAtual : null });
      }
    }
    res.saida = maq.saida;
    res.passos = maq.passos;
    res.chamadas = maq.chamadas;
    res.ops = maq.ops;
    return res;
  }
  function executar(c, opts) {
    if (!c.ok) throw new Error("programa não compilado");
    var main = acharMain(c.prog);
    if (!main) return { saida: "", erro: { classe: "Erro", nomeCompleto: "Erro", msg: "não encontrei public static void main(String[] args)", linha: 1 }, passos: [], chamadas: [] };
    var maq = new Maquina(c.prog, c.src, opts);
    return rodar(maq, function () { maq.invoca(main, [maq.novoArr(T_STR, (opts && opts.args) || [])], null, null); });
  }
  // converte valores JS <-> Java para os testes
  function paraJava(maq, v, t) {
    if (v === null || v === undefined) return null;
    if (t.d) {
      var el = elem(t);
      var a = (typeof v === "string" && el.n === "char" && !el.d) ? v.split("") : v;
      return maq.novoArr(el, a.map(function (x) { return paraJava(maq, x, el); }));
    }
    if (ehLista(t) || ehFila(t)) return { id: maq.novoId(), k: ehFila(t) && !ehLista(t) ? "deque" : "list", t: t, a: v.map(function (x) { return paraJava(maq, x, arg(t, 0)); }) };
    if (prim(t) === "char") return typeof v === "number" ? String.fromCharCode(v) : v;
    return v;
  }
  function paraJS(v) {
    if (v === null || v === undefined || typeof v !== "object") return v;
    if (v.k === "arr" || v.k === "list" || v.k === "deque") return v.a.map(paraJS);
    if (v.k === "keys") return v.itens.map(paraJS);
    if (v.k === "map") { if (v.conj) return mapaOrdem(v).map(function (x) { return paraJS(x.k); }); var o = {}; mapaOrdem(v).forEach(function (x) { o[String(x.k)] = paraJS(x.v); }); return o; }
    if (v.k === "sb") return v.s;
    return "[objeto]";
  }
  function chamar(c, nome, args, opts) {
    var cands = [];
    c.prog.classes.forEach(function (cl) { (cl.metodosPorNome[nome] || []).forEach(function (m) { if (m.estatico && m.params.length === args.length) cands.push(m); }); });
    if (!cands.length) return { erro: { classe: "Erro", nomeCompleto: "Erro", msg: "não encontrei o método static " + nome + " com " + args.length + " parâmetro(s)" }, saida: "" };
    var m = cands[0], maq = new Maquina(c.prog, c.src, opts);
    var r = rodar(maq, function () {
      var jargs = args.map(function (a, i) { return paraJava(maq, a, m.params[i].tipo); });
      var ret = maq.invoca(m, jargs, null, null);
      return { ret: paraJS(ret), argsDepois: jargs.map(paraJS), tipoRet: tStr(m.tipoRet) };
    });
    if (r.valor) { r.ret = r.valor.ret; r.argsDepois = r.valor.argsDepois; r.tipoRet = r.valor.tipoRet; }
    return r;
  }

  var Java = { compilar: compilar, executar: executar, chamar: chamar, javaDouble: javaDouble, tStr: tStr };
  if (typeof module !== "undefined" && module.exports) module.exports = Java;
  else G.Java = Java;
})(typeof window !== "undefined" ? window : this);
