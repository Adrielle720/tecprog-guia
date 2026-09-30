(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };
  var CAMINHO = String.raw`public class CaminhoDFS {
    public static boolean existeCaminho(char[][] lab, int l, int c,
            int destinoL, int destinoC, boolean[][] visitado) {
        if (l < 0 || l >= lab.length || c < 0 || c >= lab[0].length) {
            return false;
        }
        if (lab[l][c] == '#' || visitado[l][c]) {
            return false;
        }
        if (l == destinoL && c == destinoC) {
            return true;
        }
        visitado[l][c] = true;
        return existeCaminho(lab, l - 1, c, destinoL, destinoC, visitado)
            || existeCaminho(lab, l + 1, c, destinoL, destinoC, visitado)
            || existeCaminho(lab, l, c - 1, destinoL, destinoC, visitado)
            || existeCaminho(lab, l, c + 1, destinoL, destinoC, visitado);
    }

    public static void main(String[] args) {
        char[][] lab = {{lab}};
        boolean[][] visitado = new boolean[lab.length][lab[0].length];
        System.out.println(existeCaminho(lab, {{li}}, {{ci}}, {{lf}}, {{cf}}, visitado));
    }
}`;
  var FLOOD = String.raw`public class FloodFill {
    public static void preencher(char[][] tela, int l, int c,
            char original, char nova) {
        if (original == nova || l < 0 || l >= tela.length
                || c < 0 || c >= tela[0].length || tela[l][c] != original) {
            return;
        }
        tela[l][c] = nova;
        preencher(tela, l - 1, c, original, nova);
        preencher(tela, l + 1, c, original, nova);
        preencher(tela, l, c - 1, original, nova);
        preencher(tela, l, c + 1, original, nova);
    }

    public static void main(String[] args) {
        char[][] tela = {{tela}};
        preencher(tela, {{l}}, {{c}}, tela[{{l}}][{{c}}], {{nova}});
        for (char[] linha : tela) {
            System.out.println(new String(linha));
        }
    }
}`;
  var REGIOES = String.raw`public class Regioes {
    public static int contarRegioes(char[][] mapa) {
        boolean[][] visitado = new boolean[mapa.length][mapa[0].length];
        int total = 0;
        for (int l = 0; l < mapa.length; l++) {
            for (int c = 0; c < mapa[0].length; c++) {
                if (mapa[l][c] == '.' && !visitado[l][c]) {
                    marcarRegiao(mapa, l, c, visitado);
                    total++;
                }
            }
        }
        return total;
    }

    private static void marcarRegiao(char[][] mapa, int l, int c, boolean[][] visitado) {
        if (l < 0 || l >= mapa.length || c < 0 || c >= mapa[0].length) {
            return;
        }
        if (mapa[l][c] != '.' || visitado[l][c]) {
            return;
        }
        visitado[l][c] = true;
        marcarRegiao(mapa, l - 1, c, visitado);
        marcarRegiao(mapa, l + 1, c, visitado);
        marcarRegiao(mapa, l, c - 1, visitado);
        marcarRegiao(mapa, l, c + 1, visitado);
    }

    public static void main(String[] args) {
        char[][] mapa = {{mapa}};
        System.out.println(contarRegioes(mapa));
    }
}`;
  function arvoreDFS(met) { return { tipo: "arvore", metodos: [met], titulo: "chamadas (cima, baixo, esquerda, direita)", rotulo: function (c) { return "(" + arg(c, "l") + "," + arg(c, "c") + ")"; }, retorno: function (c) { return c.ret === "true" ? "✓" : c.ret === "false" ? "✗" : ""; }, largura: 50 }; }
  var VIZ_CAM = [{ tipo: "grade", nome: "lab", rotulo: "labirinto", vis: "visitado", pos: ["l", "c"], rastro: "existeCaminho", nota: function (st) { var l = st.noTopo("l"), c = st.noTopo("c"); return l === undefined ? "" : "posição atual (" + l + ", " + c + ")"; } }, arvoreDFS("existeCaminho")];
  var DICAS_CAM = [
    { linha: /if \(l < 0 \|\| l >= lab.length/, texto: function (st) { var l = st.num("l"), c = st.num("c"), L = st.arr("lab").length, C = st.deref(st.arr("lab")[0]).a.length; return l < 0 || l >= L || c < 0 || c >= C ? "(" + l + ", " + c + ") está **fora** da matriz: volta com false." : "(" + l + ", " + c + ") está dentro da matriz."; } },
    { linha: /if \(lab\[l\]\[c\] == '#' \|\| visitado\[l\]\[c\]\)/, texto: function (st) { var l = st.num("l"), c = st.num("c"); var ch = st.deref(st.arr("lab")[l]).a[c], vi = st.deref(st.arr("visitado")[l]).a[c]; return ch === "#" ? "(" + l + ", " + c + ") é **parede**: volta." : vi ? "(" + l + ", " + c + ") **já foi visitada**: volta (sem isso, duas células vizinhas se chamariam para sempre)." : "Livre e ainda não visitada."; } },
    { linha: /visitado\[l\]\[c\] = true/, texto: function (st) { return "Marca (" + st.num("l") + ", " + st.num("c") + ") **antes** das chamadas recursivas."; } },
    { linha: /if \(l == destinoL && c == destinoC\)/, texto: function (st) { return st.num("l") === st.num("destinoL") && st.num("c") === st.num("destinoC") ? "**Chegou no destino!** O true vai subir pela pilha inteira." : ""; } },
    { linha: /public static boolean existeCaminho/, tipo: "chamada", texto: function (st) { return "Tenta a posição (" + st.num("l") + ", " + st.num("c") + "). Profundidade da pilha: " + st.frames.length + "."; } }
  ];
  var LAB = "S.#.\n#.#.\n#..D";

  G.algoritmo({
    slug: "dfs", titulo: "DFS em matrizes", aula: "Aula 13", grupo: "Matrizes e grafos",
    resumo: "Busca em **profundidade**: escolhe uma direção, segue por ela enquanto puder e **volta** quando chega num beco. Resolve caminho, flood fill e contagem de regiões.",
    custos: [["tempo", "O(linhas × colunas)"], ["visitado", "O(linhas × colunas)"], ["pilha", "até o tamanho da região"]],
    ideia: String.raw`Um labirinto vira uma **matriz**: «S» é a origem, «D» o destino, «#» parede e «.» caminho livre. De cada posição (l, c) dá para tentar quatro vizinhos: cima (l − 1, c), baixo (l + 1, c), esquerda (l, c − 1) e direita (l, c + 1).

A **DFS** (depth-first search) é uma recursão que recebe a posição atual e:
1. **valida**: está dentro da matriz? não é parede? ainda não foi visitada?
2. **marca** a posição como visitada;
3. **explora** os quatro vizinhos, um de cada vez, **até o fim** antes de tentar o próximo.

Se uma direção dá num beco, a chamada devolve «false» e o controle **volta** para a posição anterior, que tenta a próxima direção. É por isso que se chama "em profundidade": avança por um caminho inteiro antes de considerar alternativas. A pilha de chamadas guarda o caminho atual (em azul na animação).

**Marcar antes das chamadas é essencial**: sem isso, duas células vizinhas livres se chamariam para sempre. Com a matriz «visitado», cada célula é processada no máximo uma vez: **O(linhas × colunas)**.`,
    pseudo: String.raw`EXISTE-CAMINHO(lab, l, c, destinoL, destinoC, visitado)
    IF (l, c) está fora da matriz THEN
        RETURN FALSE
    IF lab[l][c] é parede OR visitado[l][c] THEN
        RETURN FALSE
    IF (l, c) = (destinoL, destinoC) THEN
        RETURN TRUE
    visitado[l][c] <- TRUE
    RETURN EXISTE-CAMINHO na posição acima
        OR EXISTE-CAMINHO na posição abaixo
        OR EXISTE-CAMINHO na posição à esquerda
        OR EXISTE-CAMINHO na posição à direita`,
    invariante: String.raw`**Toda célula marcada como visitada já foi (ou está sendo) explorada, e não precisa ser explorada de novo.** Isso garante que a recursão termina e que cada célula custa O(1) visitas.`,
    programas: [
      { id: "cam", nome: "Existe caminho? (labirinto)", codigo: CAMINHO,
        entradas: [{ nome: "lab", rotulo: "labirinto (# parede)", tipo: "char[][]", valor: LAB }, { nome: "li", rotulo: "linha origem", tipo: "int", valor: "0" }, { nome: "ci", rotulo: "coluna origem", tipo: "int", valor: "0" }, { nome: "lf", rotulo: "linha destino", tipo: "int", valor: "2" }, { nome: "cf", rotulo: "coluna destino", tipo: "int", valor: "3" }],
        exemplos: [{ rotulo: "sem saída", valores: { lab: "S.#.\n##..\n..#D", li: "0", ci: "0", lf: "2", cf: "3" } }, { rotulo: "labirinto maior", valores: { lab: "S..#....\n.#.#.##.\n.#...#..\n.####.#.\n......#D", li: "0", ci: "0", lf: "4", cf: "7" } }],
        viz: VIZ_CAM, dicas: DICAS_CAM },
      { id: "flood", nome: "Flood fill (balde de tinta)", codigo: FLOOD,
        entradas: [{ nome: "tela", rotulo: "tela (letras = cores)", tipo: "char[][]", valor: "aab\nabb\nbba" }, { nome: "l", rotulo: "linha", tipo: "int", valor: "0" }, { nome: "c", rotulo: "coluna", tipo: "int", valor: "0" }, { nome: "nova", rotulo: "cor nova", tipo: "char", valor: "x" }],
        exemplos: [{ rotulo: "pintar o b", valores: { l: "2", c: "0", nova: "o" } }, { rotulo: "mesma cor (não faz nada)", valores: { nova: "a" } }],
        viz: [{ tipo: "grade", nome: "tela", pos: ["l", "c"], rastro: "preencher", nota: function (st) { var o = st.val("original"), n = st.val("nova"); return o ? "trocando '" + o + "' por '" + n + "'" : ""; } }, arvoreDFS("preencher")],
        dicas: [{ linha: /if \(original == nova \|\| l < 0/, texto: function (st) { var l = st.num("l"), c = st.num("c"), t = st.arr("tela"); if (st.val("original") === st.val("nova")) return "Cor original = cor nova: não há o que pintar (e sem esse teste a recursão nunca pararia)."; if (l < 0 || l >= t.length || c < 0 || c >= st.deref(t[0]).a.length) return "(" + l + ", " + c + ") está fora da tela."; var ch = st.deref(t[l]).a[c]; return ch !== st.val("original") ? "(" + l + ", " + c + ") tem '" + ch + "', não a cor original: volta." : "(" + l + ", " + c + ") tem a cor original: pinta."; } },
          { linha: /tela\[l\]\[c\] = nova/, texto: function () { return "Pinta a célula. A própria troca de cor já funciona como marca de visitado."; } }] },
      { id: "reg", nome: "Contar regiões", codigo: REGIOES,
        entradas: [{ nome: "mapa", rotulo: "mapa (. livre, # parede)", tipo: "char[][]", valor: "..#..\n#.#.#\n..###\n##..#" }],
        viz: [{ tipo: "grade", nome: "mapa", vis: "visitado", pos: ["l", "c"], rastro: "marcarRegiao", nota: function (st) { var t = st.val("total"); return t !== undefined ? "regiões contadas: " + t : ""; } }],
        dicas: [{ linha: /if \(mapa\[l\]\[c\] == '\.' && !visitado\[l\]\[c\]\)/, texto: function (st) { var l = st.num("l"), c = st.num("c"); if (st.topo.metodo !== "contarRegioes") return ""; var ch = st.deref(st.arr("mapa")[l]).a[c], vi = st.deref(st.arr("visitado")[l]).a[c]; return ch === "." && !vi ? "(" + l + ", " + c + ") é livre e ninguém visitou: **região nova**! Uma DFS vai marcar ela inteira." : ""; } },
          { linha: /total\+\+/, texto: function (st) { return "A DFS terminou de marcar a região. total = " + st.num("total") + "."; } }] }
    ],
    problemas: {
      resolve: String.raw`Qualquer problema de **explorar tudo que está conectado** a partir de um ponto:
- **existe caminho** de A até B? (labirintos, mapas);
- **flood fill**: pintar uma região (balde de tinta), marcar uma área;
- **contar regiões / ilhas** e medir o tamanho de cada uma;
- detectar áreas cercadas, conectividade, componentes.

Atenção: DFS acha **algum** caminho, não o mais curto. Para o menor número de passos, use BFS.`,
      classicos: [
        { nome: "Number of Islands", onde: "LeetCode 200", ideia: "Contar ilhas de '1' num mapa de '0' e '1'.", muda: "é o contar regiões da aula com '1' no lugar de '.'. Pode marcar trocando '1' por '0' em vez de usar matriz visitado." },
        { nome: "Flood Fill", onde: "LeetCode 733", ideia: "Pintar a região da célula inicial.", muda: "nada: é o preencher da aula, com números em vez de letras." },
        { nome: "Max Area of Island", onde: "LeetCode 695", ideia: "O tamanho da maior ilha.", muda: "a DFS **devolve um int**: 1 + a soma das áreas dos quatro vizinhos (0 se inválido)." },
        { nome: "Surrounded Regions", onde: "LeetCode 130", ideia: "Capturar regiões de 'O' cercadas por 'X'.", muda: "DFS começando **pelas bordas** marca o que não pode ser capturado; o resto vira 'X'." },
        { nome: "Pacific Atlantic Water Flow", onde: "LeetCode 417", ideia: "De quais células a água chega aos dois oceanos?", muda: "duas DFS a partir das bordas, andando só \"morro acima\"; a resposta é a interseção." },
        { nome: "Word Search", onde: "LeetCode 79", ideia: "A palavra existe seguindo letras vizinhas?", muda: "DFS com **desmarcar ao voltar** (backtracking), porque um caminho que falhou pode ser usado por outro." }
      ]
    },
    variacoes: [
      { nome: "Tamanho da região (área da ilha)", curto: "área da região", quando: "além de achar, você precisa MEDIR a região (LeetCode 695).",
        muda: String.raw`A DFS passa a **devolver um int**: 0 para posição inválida, e «1 + área(cima) + área(baixo) + área(esquerda) + área(direita)» para uma célula válida. A estrutura de validar, marcar e explorar é a mesma.`,
        base: REGIOES.replace("{{mapa}}", '{\n            "..#..".toCharArray(),\n            "#.#.#".toCharArray(),\n            "..###".toCharArray(),\n            "##..#".toCharArray()\n        }'),
        codigo: String.raw`public class Regioes {
    public static int area(char[][] mapa, int l, int c, boolean[][] visitado) {
        if (l < 0 || l >= mapa.length || c < 0 || c >= mapa[0].length) {
            return 0;
        }
        if (mapa[l][c] != '.' || visitado[l][c]) {
            return 0;
        }
        visitado[l][c] = true;
        return 1 + area(mapa, l - 1, c, visitado)
                 + area(mapa, l + 1, c, visitado)
                 + area(mapa, l, c - 1, visitado)
                 + area(mapa, l, c + 1, visitado);
    }

    public static void main(String[] args) {
        char[][] mapa = {
            "..#..".toCharArray(),
            "#.#.#".toCharArray(),
            "..###".toCharArray(),
            "##..#".toCharArray()
        };
        boolean[][] visitado = new boolean[mapa.length][mapa[0].length];
        System.out.println(area(mapa, 0, 0, visitado));
    }
}`, programa: { viz: [{ tipo: "grade", nome: "mapa", vis: "visitado", pos: ["l", "c"], rastro: "area" }, { tipo: "arvore", metodos: ["area"], rotulo: function (c) { return "(" + arg(c, "l") + "," + arg(c, "c") + ")"; }, largura: 50 }] } },
      { nome: "8 direções (com diagonais)", curto: "8 direções", quando: "o problema considera vizinhas também as células na diagonal.",
        muda: String.raw`Em vez de quatro chamadas escritas à mão, dois arrays de deslocamento («dl» e «dc») com as **8** direções e um laço. Na tela quadriculada abaixo, com 4 direções só o canto seria pintado; com 8, todos os a ligados pela diagonal viram x. O custo continua O(linhas × colunas).`,
        base: FLOOD.replace("{{tela}}", '{\n            "aab".toCharArray(),\n            "abb".toCharArray(),\n            "bba".toCharArray()\n        }').replace(/\{\{l\}\}/g, "0").replace(/\{\{c\}\}/g, "0").replace("{{nova}}", "'x'"),
        codigo: String.raw`public class FloodFill {
    static int[] dl = {-1, -1, -1, 0, 0, 1, 1, 1};
    static int[] dc = {-1, 0, 1, -1, 1, -1, 0, 1};

    public static void preencher(char[][] tela, int l, int c,
            char original, char nova) {
        if (original == nova || l < 0 || l >= tela.length
                || c < 0 || c >= tela[0].length || tela[l][c] != original) {
            return;
        }
        tela[l][c] = nova;
        for (int k = 0; k < 8; k++) {
            preencher(tela, l + dl[k], c + dc[k], original, nova);
        }
    }

    public static void main(String[] args) {
        char[][] tela = {
            "aba".toCharArray(),
            "bab".toCharArray(),
            "aba".toCharArray()
        };
        preencher(tela, 0, 0, tela[0][0], 'x');
        for (char[] linha : tela) {
            System.out.println(new String(linha));
        }
    }
}`, programa: { viz: [{ tipo: "grade", nome: "tela", pos: ["l", "c"], rastro: "preencher" }] } },
      { nome: "DFS com pilha explícita (sem recursão)", curto: "pilha explícita", quando: "a região pode ser enorme e a recursão estouraria a pilha (StackOverflowError), ou você prefere um laço.",
        muda: String.raw`A pilha de chamadas vira uma **pilha de verdade** («ArrayDeque» com «push» e «pop»). Cada posição entra marcada; a cada passo tira o topo e empilha os vizinhos válidos ainda não visitados. É o DFS da aula 14. Trocando a pilha por uma **fila**, vira BFS.`,
        base: CAMINHO.replace("{{lab}}", '{\n            "S.#.".toCharArray(),\n            "#.#.".toCharArray(),\n            "#..D".toCharArray()\n        }').replace("{{li}}", "0").replace("{{ci}}", "0").replace("{{lf}}", "2").replace("{{cf}}", "3"),
        codigo: String.raw`import java.util.ArrayDeque;
import java.util.Deque;

public class CaminhoDFS {
    public static boolean existeCaminho(char[][] lab, int li, int ci, int lf, int cf) {
        boolean[][] visitado = new boolean[lab.length][lab[0].length];
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> pilha = new ArrayDeque<>();
        visitado[li][ci] = true;
        pilha.push(new int[] {li, ci});
        while (!pilha.isEmpty()) {
            int[] atual = pilha.pop();
            int l = atual[0];
            int c = atual[1];
            if (l == lf && c == cf) {
                return true;
            }
            for (int k = 0; k < 4; k++) {
                int nl = l + dl[k];
                int nc = c + dc[k];
                if (nl >= 0 && nl < lab.length && nc >= 0 && nc < lab[0].length
                        && lab[nl][nc] != '#' && !visitado[nl][nc]) {
                    visitado[nl][nc] = true;
                    pilha.push(new int[] {nl, nc});
                }
            }
        }
        return false;
    }

    public static void main(String[] args) {
        char[][] lab = {
            "S.#.".toCharArray(),
            "#.#.".toCharArray(),
            "#..D".toCharArray()
        };
        System.out.println(existeCaminho(lab, 0, 0, 2, 3));
    }
}`, programa: { viz: [{ tipo: "grade", nome: "lab", vis: "visitado", pos: ["l", "c"], cand: ["nl", "nc"], fila: "pilha" }, { tipo: "colecoes", nomes: ["pilha"], titulo: "pilha de posições (topo à esquerda)" }] } }
    ],
    erros: [
      { erro: "Marcar visitado DEPOIS das chamadas", curto: "marcar depois", porque: "Duas células livres vizinhas chamam uma à outra antes de qualquer uma ser marcada: (0,1) chama (1,1), que chama (0,1)… até o StackOverflowError.",
        codigo: CAMINHO.replace("        visitado[l][c] = true;\n        return existeCaminho(lab, l - 1, c, destinoL, destinoC, visitado)", "        boolean achou = existeCaminho(lab, l - 1, c, destinoL, destinoC, visitado)").replace("            || existeCaminho(lab, l, c + 1, destinoL, destinoC, visitado);", "            || existeCaminho(lab, l, c + 1, destinoL, destinoC, visitado);\n        visitado[l][c] = true;\n        return achou;").replace("{{lab}}", '{\n            "S.#.".toCharArray(),\n            "#.#.".toCharArray(),\n            "#..D".toCharArray()\n        }').replace("{{li}}", "0").replace("{{ci}}", "0").replace("{{lf}}", "2").replace("{{cf}}", "3") },
      { erro: "Acessar a matriz antes de conferir os limites", curto: "limites depois", porque: "Com o teste de parede antes do de limites, a chamada para (-1, 0) faz «lab[-1][0]»: ArrayIndexOutOfBoundsException. Sempre confira os limites primeiro.",
        codigo: CAMINHO.replace("        if (l < 0 || l >= lab.length || c < 0 || c >= lab[0].length) {\n            return false;\n        }\n        if (lab[l][c] == '#' || visitado[l][c]) {\n            return false;\n        }", "        if (lab[l][c] == '#' || visitado[l][c]) {\n            return false;\n        }\n        if (l < 0 || l >= lab.length || c < 0 || c >= lab[0].length) {\n            return false;\n        }").replace("{{lab}}", '{\n            "S.#.".toCharArray(),\n            "#.#.".toCharArray(),\n            "#..D".toCharArray()\n        }').replace("{{li}}", "0").replace("{{ci}}", "0").replace("{{lf}}", "2").replace("{{cf}}", "3") },
      { erro: "Flood fill com cor original igual à nova", curto: "original == nova", porque: "Sem o teste «original == nova», pintar 'a' de 'a' não muda nada: a célula continua com a cor procurada, os vizinhos a chamam de volta e a recursão nunca para.",
        codigo: FLOOD.replace("if (original == nova || l < 0", "if (l < 0").replace("{{tela}}", '{\n            "aab".toCharArray(),\n            "abb".toCharArray()\n        }').replace(/\{\{l\}\}/g, "0").replace(/\{\{c\}\}/g, "0").replace("{{nova}}", "'a'") },
      { erro: "Esquecer de testar a parede", curto: "sem parede", porque: "Sem «lab[l][c] == '#'», a busca atravessa paredes e diz que existe caminho num labirinto sem saída.",
        codigo: CAMINHO.replace("if (lab[l][c] == '#' || visitado[l][c])", "if (visitado[l][c])").replace("{{lab}}", '{\n            "S.#.".toCharArray(),\n            "##..".toCharArray(),\n            "..#D".toCharArray()\n        }').replace("{{li}}", "0").replace("{{ci}}", "0").replace("{{lf}}", "2").replace("{{cf}}", "3") }
    ],
    perguntas: [
      { g: "conceito", p: "O que a DFS faz ao chegar num \"beco sem saída\"?", r: "A chamada daquela posição devolve false (todos os vizinhos falharam) e o controle **volta** para a chamada anterior na pilha, que tenta a próxima direção. É o \"aprofundar e voltar\"." },
      { g: "conceito", p: "DFS encontra o caminho mais curto? Por quê?", r: "Não necessariamente. Ela segue uma direção até o fim antes de tentar outras, então pode achar primeiro um caminho longo. Para o menor número de movimentos, use **BFS**." },
      { g: "conceito", p: "Qual o custo da DFS numa matriz, e por quê?", r: "O(linhas × colunas): com a matriz «visitado», cada célula é processada no máximo uma vez, e cada uma examina no máximo 4 vizinhos." },
      { g: "conceito", p: "Por que contar regiões chama a DFS dentro de dois laços?", r: "Os laços percorrem todas as células. Cada vez que acham uma célula livre **ainda não visitada**, é uma região nova: a DFS marca ela inteira, e o contador sobe uma vez." },
      { g: "codigo", p: "Por que marcar «visitado» ANTES das chamadas recursivas?", r: "Senão, duas células vizinhas se chamam mutuamente antes de qualquer marcação: recursão infinita (StackOverflowError)." },
      { g: "codigo", p: "Por que o teste de limites vem antes do teste de parede?", r: "Para não ler «lab[-1][c]» ou «lab[l][colunas]»: o «||» para no primeiro verdadeiro, então conferir os limites primeiro evita ArrayIndexOutOfBoundsException." },
      { g: "codigo", p: "No flood fill não há matriz «visitado». O que impede visitas repetidas?", r: "A **troca de cor**: depois de pintada, a célula não tem mais a cor original, e o teste «tela[l][c] != original» a rejeita. Por isso é preciso o caso «original == nova»." },
      { g: "codigo", p: "Nos «||» de «existeCaminho», o que acontece quando a primeira chamada devolve true?", r: "Curto-circuito: as outras direções **não são exploradas**. O true sobe direto pela pilha." },
      { g: "variacao", p: "Como medir o tamanho de uma região com DFS?", r: "Faça a DFS devolver int: 0 para inválido; 1 + soma das quatro chamadas para uma célula válida." },
      { g: "variacao", p: "Como considerar vizinhos na diagonal?", r: "Use arrays de deslocamento com as 8 direções («dl» e «dc») e um laço sobre eles." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Quantas células foram marcadas?", enunciado: "O programa roda «existeCaminho» no labirinto da aula e conta quantas posições foram marcadas como visitadas até achar o destino. O que ele imprime?",
        codigo: CAMINHO.replace("{{lab}}", '{\n            "S.#.".toCharArray(),\n            "#.#.".toCharArray(),\n            "#..D".toCharArray()\n        }').replace("{{li}}", "0").replace("{{ci}}", "0").replace("{{lf}}", "2").replace("{{cf}}", "3").replace("        System.out.println(existeCaminho(lab, 0, 0, 2, 3, visitado));", "        boolean r = existeCaminho(lab, 0, 0, 2, 3, visitado);\n        int marcadas = 0;\n        for (boolean[] linha : visitado) {\n            for (boolean b : linha) {\n                if (b) {\n                    marcadas++;\n                }\n            }\n        }\n        System.out.println(r + \" \" + marcadas);"),
        formato: "true/false quantidade", explicacao: "Marca (0,0), (0,1), (1,1), (2,1), (2,2): 5 posições. O D é encontrado antes de ser marcado.", viz: VIZ_CAM },
      { tipo: "completar", titulo: "Complete a contagem de regiões", enunciado: "Complete o laço que conta regiões (use o «marcarRegiao» da aula).",
        modelo: String.raw`    public static int contarRegioes(char[][] mapa) {
        boolean[][] visitado = new boolean[mapa.length][mapa[0].length];
        int total = 0;
        for (int l = 0; l < mapa.length; l++) {
            for (int c = 0; c < ⟦⟧; c++) {
                if (mapa[l][c] == '.' && ⟦⟧) {
                    marcarRegiao(mapa, l, c, visitado);
                    ⟦⟧;
                }
            }
        }
        return total;
    }

    private static void marcarRegiao(char[][] mapa, int l, int c, boolean[][] visitado) {
        if (l < 0 || l >= mapa.length || c < 0 || c >= mapa[0].length) {
            return;
        }
        if (mapa[l][c] != '.' || visitado[l][c]) {
            return;
        }
        ⟦⟧ = true;
        marcarRegiao(mapa, l - 1, c, visitado);
        marcarRegiao(mapa, l + 1, c, visitado);
        marcarRegiao(mapa, l, c - 1, visitado);
        marcarRegiao(mapa, l, c + 1, visitado);
    }`, gabarito: ["mapa[0].length", "!visitado[l][c]", "total++", "visitado[l][c]"],
        solucao: REGIOES.split("\n").slice(1, 29).join("\n"),
        testes: [{ expr: "contarRegioes(new char[][] {\"..#..\".toCharArray(), \"#.#.#\".toCharArray(), \"..###\".toCharArray(), \"##..#\".toCharArray()})" }, { expr: "contarRegioes(new char[][] {\"...\".toCharArray()})" }, { expr: "contarRegioes(new char[][] {\"#.#\".toCharArray(), \".#.\".toCharArray()})" }, { expr: "contarRegioes(new char[][] {\"###\".toCharArray()})" }] },
      { tipo: "escrever", titulo: "Número de ilhas", enunciado: "Escreva «contarIlhas(char[][] mapa)»: o mapa tem '1' (terra) e '0' (água); ilhas são grupos de '1' conectados nas 4 direções. Dica: dá para \"afundar\" a ilha trocando '1' por '0' em vez de usar matriz visitado (LeetCode 200).",
        inicial: "    public static int contarIlhas(char[][] mapa) {\n        return 0;\n    }",
        solucao: String.raw`    public static int contarIlhas(char[][] mapa) {
        int total = 0;
        for (int l = 0; l < mapa.length; l++) {
            for (int c = 0; c < mapa[0].length; c++) {
                if (mapa[l][c] == '1') {
                    afundar(mapa, l, c);
                    total++;
                }
            }
        }
        return total;
    }

    static void afundar(char[][] mapa, int l, int c) {
        if (l < 0 || l >= mapa.length || c < 0 || c >= mapa[0].length || mapa[l][c] != '1') {
            return;
        }
        mapa[l][c] = '0';
        afundar(mapa, l - 1, c);
        afundar(mapa, l + 1, c);
        afundar(mapa, l, c - 1);
        afundar(mapa, l, c + 1);
    }`,
        testes: [{ expr: "contarIlhas(new char[][] {\"11000\".toCharArray(), \"11000\".toCharArray(), \"00100\".toCharArray(), \"00011\".toCharArray()})" }, { expr: "contarIlhas(new char[][] {\"111\".toCharArray(), \"010\".toCharArray()})" }, { expr: "contarIlhas(new char[][] {\"101\".toCharArray(), \"010\".toCharArray(), \"101\".toCharArray()})" }, { expr: "contarIlhas(new char[][] {\"000\".toCharArray()})" }],
        dica: "Dois laços para achar um '1'; uma DFS auxiliar que troca '1' por '0' e chama os 4 vizinhos." },
      { tipo: "escrever", titulo: "Área da maior região", enunciado: "Escreva «maiorArea(char[][] mapa)»: a área (número de células) da maior região de '.' conectada nas 4 direções.",
        inicial: "    public static int maiorArea(char[][] mapa) {\n        return 0;\n    }",
        solucao: String.raw`    public static int maiorArea(char[][] mapa) {
        boolean[][] vis = new boolean[mapa.length][mapa[0].length];
        int melhor = 0;
        for (int l = 0; l < mapa.length; l++) {
            for (int c = 0; c < mapa[0].length; c++) {
                int a = area(mapa, l, c, vis);
                if (a > melhor) {
                    melhor = a;
                }
            }
        }
        return melhor;
    }

    static int area(char[][] m, int l, int c, boolean[][] vis) {
        if (l < 0 || l >= m.length || c < 0 || c >= m[0].length || m[l][c] != '.' || vis[l][c]) {
            return 0;
        }
        vis[l][c] = true;
        return 1 + area(m, l - 1, c, vis) + area(m, l + 1, c, vis) + area(m, l, c - 1, vis) + area(m, l, c + 1, vis);
    }`,
        testes: [{ expr: "maiorArea(new char[][] {\"..#..\".toCharArray(), \"#.#.#\".toCharArray(), \"..###\".toCharArray(), \"##..#\".toCharArray()})" }, { expr: "maiorArea(new char[][] {\"###\".toCharArray()})" }, { expr: "maiorArea(new char[][] {\"...\".toCharArray(), \".#.\".toCharArray()})" }],
        dica: "Uma DFS que devolve int (1 + as quatro direções), chamada em cada célula." },
      { tipo: "escolha", titulo: "DFS ou BFS?", enunciado: "Qual pergunta **só** a BFS responde com garantia?", alternativas: ["qual o menor número de movimentos de S até D?", "existe caminho de S até D?", "quantas regiões livres existem?", "pinte a região que contém (2, 3)"], correta: 0, explicacao: "As outras três DFS e BFS resolvem. O menor número de passos exige explorar por camadas: BFS." },
      { tipo: "escolha", titulo: "Custo", enunciado: "Qual o custo de contar regiões numa matriz de 100 × 200?", alternativas: ["O(100 × 200): cada célula é visitada uma vez", "O(4^(100×200))", "O((100 × 200)²)", "depende do número de regiões ao quadrado"], correta: 0, explicacao: "Com visitado, cada célula entra numa DFS no máximo uma vez e olha 4 vizinhos." }
    ]
  });
})();
