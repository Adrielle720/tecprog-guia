(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };
  var CLASSE = String.raw`    static class Grafo {
        private final ArrayList<ArrayList<Integer>> adj;

        public Grafo(int n) {
            adj = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                adj.add(new ArrayList<>());
            }
        }

        public void adicionarAresta(int a, int b) {
            adj.get(a).add(b);
            adj.get(b).add(a);
        }

        public ArrayList<ArrayList<Integer>> lista() {
            return adj;
        }
    }`;
  var DFS = String.raw`import java.util.ArrayList;

public class GrafoDFS {
` + CLASSE + String.raw`

    public static boolean existeCaminho(ArrayList<ArrayList<Integer>> adj,
            int atual, int destino, boolean[] visitado) {
        if (atual == destino) {
            return true;
        }
        visitado[atual] = true;
        for (int vizinho : adj.get(atual)) {
            if (!visitado[vizinho]
                    && existeCaminho(adj, vizinho, destino, visitado)) {
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        Grafo g = new Grafo({{n}});
        {{arestas}}
        boolean[] visitado = new boolean[{{n}}];
        System.out.println(existeCaminho(g.lista(), {{origem}}, {{destino}}, visitado));
    }
}`;
  var BFS = String.raw`import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;

public class GrafoBFS {
` + CLASSE + String.raw`

    public static int[] distanciasBfs(ArrayList<ArrayList<Integer>> adj, int origem) {
        int[] dist = new int[adj.size()];
        Arrays.fill(dist, -1);
        Deque<Integer> fila = new ArrayDeque<>();
        dist[origem] = 0;
        fila.addLast(origem);
        while (!fila.isEmpty()) {
            int atual = fila.removeFirst();
            for (int vizinho : adj.get(atual)) {
                if (dist[vizinho] == -1) {
                    dist[vizinho] = dist[atual] + 1;
                    fila.addLast(vizinho);
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        Grafo g = new Grafo({{n}});
        {{arestas}}
        System.out.println(Arrays.toString(distanciasBfs(g.lista(), {{origem}})));
    }
}`;
  var COMP = String.raw`import java.util.ArrayList;

public class Componentes {
` + CLASSE + String.raw`

    public static int contarComponentes(ArrayList<ArrayList<Integer>> adj) {
        boolean[] visitado = new boolean[adj.size()];
        int componentes = 0;
        for (int v = 0; v < adj.size(); v++) {
            if (!visitado[v]) {
                marcarComponente(adj, v, visitado);
                componentes++;
            }
        }
        return componentes;
    }

    private static void marcarComponente(ArrayList<ArrayList<Integer>> adj, int atual, boolean[] visitado) {
        visitado[atual] = true;
        for (int vizinho : adj.get(atual)) {
            if (!visitado[vizinho]) {
                marcarComponente(adj, vizinho, visitado);
            }
        }
    }

    public static void main(String[] args) {
        Grafo g = new Grafo({{n}});
        {{arestas}}
        System.out.println(contarComponentes(g.lista()));
    }
}`;
  var ENT = function (extra) { return [{ nome: "n", rotulo: "vértices (0 até n−1)", tipo: "int", valor: "6" }, { nome: "arestas", rotulo: "arestas", tipo: "arestas", valor: "0-1, 0-2, 1-3, 2-3, 3-4" }].concat(extra || []); };
  var VIZ_DFS = [{ tipo: "grafo", adj: "adj", vis: "visitado", atual: "atual", vizinho: "vizinho" }, { tipo: "arvore", metodos: ["existeCaminho"], titulo: "chamadas (vértice atual)", rotulo: function (c) { return "v" + arg(c, "atual"); }, retorno: function (c) { return c.ret === "true" ? "✓" : "✗"; }, largura: 44 }];
  var VIZ_BFS = [{ tipo: "grafo", adj: "adj", dist: "dist", atual: "atual", vizinho: "vizinho", fila: "fila" }, { tipo: "colecoes", nomes: ["fila"], titulo: "fila de vértices" }, { tipo: "array", nome: "dist", ponteiros: [["atual", "#e0392b", "topo"]] }];
  function cheio(src, n, arestas, origem, destino) {
    return src.replace(/\{\{n\}\}/g, n).replace("{{arestas}}", arestas.split(",").map(function (p) { var q = p.trim().split("-"); return "g.adicionarAresta(" + q[0] + ", " + q[1] + ");"; }).join("\n        ")).replace("{{origem}}", origem).replace("{{destino}}", destino);
  }

  G.algoritmo({
    slug: "grafos", titulo: "Grafos: DFS e BFS", aula: "Aula 15", grupo: "Matrizes e grafos",
    resumo: "Vértices e arestas guardados numa **lista de adjacência**. DFS e BFS não mudam: só muda de onde vêm os vizinhos.",
    custos: [["DFS / BFS", "O(V + E)"], ["lista de adjacência", "O(V + E) de memória"], ["visitado / dist", "O(V)"]],
    ideia: String.raw`Salas ligadas por portas, pessoas ligadas por amizade, tarefas com dependências: itens e conexões. Isso é um **grafo**: cada item é um **vértice**, cada conexão é uma **aresta**, e os diretamente ligados são **vizinhos**.

A **lista de adjacência** guarda, para cada vértice, a lista dos seus vizinhos:
- 0: [1, 2]
- 1: [0, 3]
- 2: [0, 3]
- 3: [1, 2, 4]
- 4: [3]

Num grafo **não direcionado**, a aresta a–b aparece nas **duas** listas. Num **direcionado**, a→b aparece só em «adj[a]».

DFS e BFS são **as mesmas** das matrizes. No labirinto os vizinhos eram calculados (quatro coordenadas); aqui eles vêm prontos da lista, «for (int vizinho : adj.get(atual))». O «visitado» continua essencial: sem ele, a DFS iria de 0 para 1, de 1 de volta para 0, e assim para sempre.

**Custo:** cada vértice é visitado uma vez e cada lista é percorrida uma vez: **O(V + E)**.`,
    pseudo: String.raw`EXISTE-CAMINHO(adj, atual, destino, visitado)
    IF atual = destino THEN
        RETURN TRUE
    visitado[atual] <- TRUE
    FOR CADA vizinho EM adj[atual]
        IF NOT visitado[vizinho] THEN
            IF EXISTE-CAMINHO(adj, vizinho, destino, visitado) THEN
                RETURN TRUE
    RETURN FALSE

DISTANCIAS-BFS(adj, origem)
    dist <- vetor preenchido com -1
    fila <- FILA-VAZIA()
    dist[origem] <- 0
    ENFILEIRAR(fila, origem)
    WHILE NOT VAZIA(fila) DO
        atual <- DESENFILEIRAR(fila)
        FOR CADA vizinho EM adj[atual]
            IF dist[vizinho] = -1 THEN
                dist[vizinho] <- dist[atual] + 1
                ENFILEIRAR(fila, vizinho)
    RETURN dist`,
    invariante: String.raw`O mesmo das matrizes: **um vértice marcado não é explorado de novo** (DFS), e **a primeira distância anotada de um vértice é a menor** (BFS, porque a fila processa uma camada inteira antes da próxima).`,
    programas: [
      { id: "dfs", nome: "DFS: existe caminho?", codigo: DFS, entradas: ENT([{ nome: "origem", tipo: "int", valor: "0" }, { nome: "destino", tipo: "int", valor: "4" }]),
        exemplos: [{ rotulo: "destino isolado (5)", valores: { destino: "5" } }, { rotulo: "com ciclo", valores: { n: "5", arestas: "0-1, 1-2, 2-0, 2-3, 3-4", destino: "4" } }],
        viz: VIZ_DFS, dicas: [{ linha: /for \(int vizinho : adj.get\(atual\)\)/, texto: function (st) { var v = st.num("vizinho"); return v === undefined ? "" : "Vizinho de " + st.num("atual") + ": " + v + (st.arr("visitado")[v] ? " (já visitado, pula)." : " (novo: explora)."); } }, { linha: /visitado\[atual\] = true/, texto: function (st) { return "Marca o vértice " + st.num("atual") + " antes de explorar os vizinhos."; } }] },
      { id: "bfs", nome: "BFS: distâncias", codigo: BFS, entradas: ENT([{ nome: "origem", tipo: "int", valor: "0" }]),
        exemplos: [{ rotulo: "caminho longo", valores: { n: "6", arestas: "0-1, 1-2, 2-3, 3-4, 4-5, 0-5" } }],
        viz: VIZ_BFS, dicas: [{ linha: /int atual = fila.removeFirst\(\)/, texto: function (st) { return "Tira o vértice " + st.num("atual") + " da frente da fila (distância " + st.arr("dist")[st.num("atual")] + ")."; } }, { linha: /dist\[vizinho\] = dist\[atual\] \+ 1/, texto: function (st) { return "O vértice " + st.num("vizinho") + " foi descoberto agora: distância " + st.arr("dist")[st.num("vizinho")] + "."; } }],
        tabela: { quando: "int atual = fila.removeFirst()", colunas: [["removeu", "atual"], ["dist", function (st) { return st.arr("dist")[st.num("atual")]; }], ["dist (todos)", "dist"]] } },
      { id: "comp", nome: "Contar componentes", codigo: COMP, entradas: [{ nome: "n", rotulo: "vértices", tipo: "int", valor: "7" }, { nome: "arestas", tipo: "arestas", valor: "0-1, 1-2, 3-4, 5-5" }],
        viz: [{ tipo: "grafo", adj: "adj", vis: "visitado", atual: "atual", vizinho: "vizinho" }], dicas: [{ linha: /componentes\+\+/, texto: function (st) { return "Terminou uma componente inteira. componentes = " + st.num("componentes") + "."; } }] }
    ],
    problemas: {
      resolve: String.raw`Qualquer situação com **coisas ligadas a coisas**:
- **alcance**: dá para chegar de A a B? (rotas, redes, permissões);
- **componentes**: quantos grupos isolados existem (amigos, ilhas de uma rede);
- **menor número de conexões** entre dois pontos (graus de separação, número de escalas): BFS;
- **dependências** entre tarefas (grafo direcionado): ordem possível, existência de ciclo.`,
      classicos: [
        { nome: "Find if Path Exists in Graph", onde: "LeetCode 1971", ideia: "Existe caminho entre dois vértices?", muda: "nada: é o «existeCaminho» da aula (ou uma BFS)." },
        { nome: "Number of Provinces", onde: "LeetCode 547", ideia: "Quantos grupos de cidades conectadas.", muda: "contar componentes, mas o grafo vem como **matriz de adjacência**: os vizinhos de i são os j com «m[i][j] == 1»." },
        { nome: "Keys and Rooms", onde: "LeetCode 841", ideia: "Com as chaves de cada sala, dá para visitar todas?", muda: "grafo **direcionado** (sala → salas das chaves): DFS a partir da 0 e confere se todos ficaram visitados." },
        { nome: "Is Graph Bipartite?", onde: "LeetCode 785", ideia: "Dá para pintar com 2 cores sem vizinhos iguais?", muda: "BFS guardando uma **cor** em vez de dist: cada vizinho recebe a cor oposta; se algum vizinho já tem a mesma cor, não é bipartido." },
        { nome: "Course Schedule", onde: "LeetCode 207", ideia: "Dá para cursar tudo respeitando os pré-requisitos?", muda: "grafo direcionado: a resposta é não se existe **ciclo**. DFS com três estados (não visitado, na pilha, terminado)." },
        { nome: "Clone Graph", onde: "LeetCode 133", ideia: "Copiar um grafo inteiro.", muda: "DFS/BFS com um **HashMap** de original → cópia, que também serve de visitado." }
      ]
    },
    variacoes: [
      { nome: "Grafo direcionado", curto: "direcionado", quando: "as conexões têm sentido: segue, depende de, tem a chave de…",
        muda: String.raw`Só «adicionarAresta» muda: a→b entra **apenas** em «adj.get(a)». A mesma DFS agora responde "dá para chegar **seguindo as setas**?". De 0 chega em 3, mas de 3 não volta para 0.`,
        base: cheio(DFS, 6, "0-1, 0-2, 1-3, 2-3, 3-4", 0, 4),
        codigo: cheio(DFS.replace("            adj.get(a).add(b);\n            adj.get(b).add(a);", "            adj.get(a).add(b);"), 6, "0-1, 0-2, 1-3, 2-3, 3-4", 3, 0),
        programa: { viz: VIZ_DFS } },
      { nome: "Bipartido? (duas cores)", curto: "bipartido", quando: "você quer dividir os vértices em dois grupos sem aresta dentro do mesmo grupo (LeetCode 785).",
        muda: String.raw`A BFS guarda uma **cor** (0 ou 1) no lugar da distância. Cada vizinho novo recebe a cor oposta à do atual; se um vizinho já tem a **mesma** cor, há um conflito e o grafo não é bipartido. Um triângulo nunca é bipartido.`,
        base: cheio(BFS, 6, "0-1, 0-2, 1-3, 2-3, 3-4", 0),
        codigo: String.raw`import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;

public class GrafoBFS {
` + CLASSE + String.raw`

    public static boolean bipartido(ArrayList<ArrayList<Integer>> adj, int origem) {
        int[] cor = new int[adj.size()];
        Arrays.fill(cor, -1);
        Deque<Integer> fila = new ArrayDeque<>();
        cor[origem] = 0;
        fila.addLast(origem);
        while (!fila.isEmpty()) {
            int atual = fila.removeFirst();
            for (int vizinho : adj.get(atual)) {
                if (cor[vizinho] == -1) {
                    cor[vizinho] = 1 - cor[atual];
                    fila.addLast(vizinho);
                } else if (cor[vizinho] == cor[atual]) {
                    return false;
                }
            }
        }
        return true;
    }

    public static void main(String[] args) {
        Grafo g = new Grafo(6);
        g.adicionarAresta(0, 1);
        g.adicionarAresta(0, 2);
        g.adicionarAresta(1, 3);
        g.adicionarAresta(2, 3);
        g.adicionarAresta(3, 4);
        System.out.println(bipartido(g.lista(), 0));
    }
}`, programa: { viz: [{ tipo: "grafo", adj: "adj", dist: "cor", atual: "atual", vizinho: "vizinho", fila: "fila" }, { tipo: "array", nome: "cor" }] } },
      { nome: "Matriz de adjacência", curto: "matriz", quando: "o grafo já vem como uma tabela n × n de 0s e 1s (LeetCode 547).",
        muda: String.raw`Os vizinhos de «atual» deixam de vir de uma lista e passam a ser os «j» com «m[atual][j] == 1». É preciso olhar todos os n: custo O(V²), mesmo com poucas arestas.`,
        base: cheio(DFS, 6, "0-1, 0-2, 1-3, 2-3, 3-4", 0, 4),
        codigo: String.raw`public class GrafoDFS {
    public static boolean existeCaminho(int[][] m, int atual, int destino, boolean[] visitado) {
        if (atual == destino) {
            return true;
        }
        visitado[atual] = true;
        for (int vizinho = 0; vizinho < m.length; vizinho++) {
            if (m[atual][vizinho] == 1 && !visitado[vizinho]
                    && existeCaminho(m, vizinho, destino, visitado)) {
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        int[][] m = {
            {0, 1, 1, 0, 0},
            {1, 0, 0, 1, 0},
            {1, 0, 0, 1, 0},
            {0, 1, 1, 0, 1},
            {0, 0, 0, 1, 0}
        };
        System.out.println(existeCaminho(m, 0, 4, new boolean[5]));
    }
}`, programa: { viz: [{ tipo: "array", nome: "visitado", ponteiros: [["atual", "#e0392b", "topo"], ["vizinho", "#215c7a", "topo"]] }] } }
    ],
    erros: [
      { erro: "Aresta em um sentido só (grafo não direcionado)", curto: "aresta num sentido", porque: "Esquecendo «adj.get(b).add(a)», o grafo vira direcionado sem querer: de 4 não se volta para 0, e a DFS diz que não há caminho.",
        codigo: cheio(DFS.replace("            adj.get(a).add(b);\n            adj.get(b).add(a);", "            adj.get(a).add(b);"), 6, "0-1, 0-2, 1-3, 2-3, 3-4", 4, 0) },
      { erro: "Esquecer o visitado", curto: "sem visitado", porque: "Sem marcar, a DFS vai de 0 para 1 e de 1 de volta para 0 (a aresta existe nas duas listas): recursão infinita, StackOverflowError.",
        codigo: cheio(DFS.replace("        visitado[atual] = true;\n", "").replace("if (!visitado[vizinho]\n                    && existeCaminho", "if (existeCaminho"), 6, "0-1, 0-2, 1-3, 2-3, 3-4", 0, 5) },
      { erro: "Confundir vértice com índice da lista", porque: "Em «for (int vizinho : adj.get(atual))», «vizinho» já é o **número do vértice**, e não uma posição dentro da lista. Usar «adj.get(atual).get(vizinho)» pega outro elemento, ou dá IndexOutOfBoundsException." },
      { erro: "Usar DFS para menor número de conexões", porque: "A DFS acha **um** caminho, que pode ser longo. Para menor número de arestas, BFS." }
    ],
    perguntas: [
      { g: "conceito", p: "O que muda entre a DFS no labirinto e a DFS num grafo?", r: "Só **como se obtêm os vizinhos**: no labirinto eles são calculados (4 coordenadas, representação implícita); no grafo vêm prontos da lista de adjacência (explícita). A estratégia é a mesma." },
      { g: "conceito", p: "Como a aresta 1–3 aparece na lista de adjacência de um grafo não direcionado? E de um direcionado 1→3?", r: "Não direcionado: 3 em adj[1] **e** 1 em adj[3]. Direcionado: só 3 em adj[1]." },
      { g: "conceito", p: "Por que o custo de DFS/BFS com lista de adjacência é O(V + E)?", r: "Cada vértice é visitado uma vez (V) e a lista de cada vértice é percorrida uma vez, e a soma dos tamanhos das listas é proporcional ao número de arestas (E)." },
      { g: "conceito", p: "O que é uma componente conectada, e como contá-las?", r: "Um grupo de vértices com caminho entre todos eles. Percorra os vértices; cada vez que achar um não visitado, uma DFS marca a componente inteira e o contador sobe 1." },
      { g: "codigo", p: "No for-each «for (int vizinho : adj.get(atual))», o que «vizinho» guarda?", r: "O **número do vértice** vizinho (o valor guardado na lista), pronto para usar como índice em «visitado» ou «dist»." },
      { g: "codigo", p: "Para que serve o «&&» em «!visitado[vizinho] && existeCaminho(...)»?", r: "Curto-circuito: só chama a recursão para vizinhos **não visitados**. E se a chamada devolver true, o método devolve true imediatamente." },
      { g: "codigo", p: "Qual o valor de «dist» para um vértice que a BFS nunca alcança?", r: "Continua **-1**, o valor inicial do «Arrays.fill». Indica que não existe caminho a partir da origem." },
      { g: "variacao", p: "Como saber se um grafo pode ser pintado com 2 cores sem vizinhos iguais?", r: "BFS com um vetor «cor»: o vizinho novo recebe a cor oposta; um vizinho já colorido com a **mesma** cor do atual quer dizer não bipartido." },
      { g: "variacao", p: "O grafo veio como matriz n×n de 0/1. O que muda na DFS?", r: "Os vizinhos passam a ser os j com m[atual][j] == 1, e é preciso testar todos: O(V²)." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Distâncias da BFS", enunciado: "Qual a saída?",
        codigo: cheio(BFS, 7, "0-1, 0-2, 1-3, 2-4, 4-5, 3-5", 0).replace("{{n}}", "7"), formato: "[d0, d1, …]", explicacao: "0 está a 0. 1 e 2 a 1. 3 e 4 a 2. 5 a 3 (por 3 ou por 4). 6 não tem arestas: -1.", viz: VIZ_BFS },
      { tipo: "rastreio", titulo: "Ordem de visita da DFS", enunciado: "O programa imprime cada vértice quando a DFS o visita (a partir do 0). O que ele imprime?",
        codigo: String.raw`import java.util.ArrayList;
public class OrdemDFS {
    static void dfs(ArrayList<ArrayList<Integer>> adj, int v, boolean[] vis) {
        vis[v] = true;
        System.out.println(v);
        for (int w : adj.get(v)) {
            if (!vis[w]) {
                dfs(adj, w, vis);
            }
        }
    }
    public static void main(String[] args) {
        ArrayList<ArrayList<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            adj.add(new ArrayList<>());
        }
        int[][] arestas = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
        for (int[] a : arestas) {
            adj.get(a[0]).add(a[1]);
            adj.get(a[1]).add(a[0]);
        }
        dfs(adj, 0, new boolean[5]);
    }
}`, formato: "v v v …", explicacao: "De 0 vai ao primeiro vizinho, 1; de 1 vai ao 3; de 3, o primeiro não visitado é o 2 (a lista de 3 é [1, 2, 4]); de 2 não há novos; volta ao 3 e vai ao 4. Ordem: 0 1 3 2 4.",
        viz: [{ tipo: "grafo", adj: "adj", vis: "vis", atual: "v", vizinho: "w" }] },
      { tipo: "completar", titulo: "Complete a DFS em lista de adjacência", enunciado: "Complete «existeCaminho».",
        modelo: String.raw`    public static boolean existeCaminho(ArrayList<ArrayList<Integer>> adj,
            int atual, int destino, boolean[] visitado) {
        if (⟦⟧) {
            return true;
        }
        ⟦⟧ = true;
        for (int vizinho : ⟦⟧) {
            if (!visitado[vizinho] && existeCaminho(adj, ⟦⟧, destino, visitado)) {
                return true;
            }
        }
        return false;
    }

    static ArrayList<ArrayList<Integer>> grafo(int n, int[][] arestas) {
        ArrayList<ArrayList<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] a : arestas) {
            adj.get(a[0]).add(a[1]);
            adj.get(a[1]).add(a[0]);
        }
        return adj;
    }`, gabarito: ["atual == destino", "visitado[atual]", "adj.get(atual)", "vizinho"],
        solucao: String.raw`    public static boolean existeCaminho(ArrayList<ArrayList<Integer>> adj,
            int atual, int destino, boolean[] visitado) {
        if (atual == destino) {
            return true;
        }
        visitado[atual] = true;
        for (int vizinho : adj.get(atual)) {
            if (!visitado[vizinho] && existeCaminho(adj, vizinho, destino, visitado)) {
                return true;
            }
        }
        return false;
    }

    static ArrayList<ArrayList<Integer>> grafo(int n, int[][] arestas) {
        ArrayList<ArrayList<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] a : arestas) {
            adj.get(a[0]).add(a[1]);
            adj.get(a[1]).add(a[0]);
        }
        return adj;
    }`,
        testes: [{ expr: "existeCaminho(grafo(5, new int[][] {{0, 1}, {1, 2}, {3, 4}}), 0, 2, new boolean[5])" }, { expr: "existeCaminho(grafo(5, new int[][] {{0, 1}, {1, 2}, {3, 4}}), 0, 4, new boolean[5])" }, { expr: "existeCaminho(grafo(3, new int[][] {{0, 1}, {1, 2}, {2, 0}}), 2, 1, new boolean[3])" }, { expr: "existeCaminho(grafo(1, new int[][] {}), 0, 0, new boolean[1])" }] },
      { tipo: "escrever", titulo: "Contar componentes", enunciado: "Escreva «componentes(int n, int[][] arestas)»: monte a lista de adjacência (grafo não direcionado) e devolva o número de componentes conectadas.",
        inicial: "    public static int componentes(int n, int[][] arestas) {\n        return 0;\n    }",
        solucao: String.raw`    public static int componentes(int n, int[][] arestas) {
        ArrayList<ArrayList<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] a : arestas) {
            adj.get(a[0]).add(a[1]);
            adj.get(a[1]).add(a[0]);
        }
        boolean[] vis = new boolean[n];
        int total = 0;
        for (int v = 0; v < n; v++) {
            if (!vis[v]) {
                marcar(adj, v, vis);
                total++;
            }
        }
        return total;
    }

    static void marcar(ArrayList<ArrayList<Integer>> adj, int v, boolean[] vis) {
        vis[v] = true;
        for (int w : adj.get(v)) {
            if (!vis[w]) {
                marcar(adj, w, vis);
            }
        }
    }`,
        testes: [{ expr: "componentes(5, new int[][] {{0, 1}, {1, 2}, {3, 4}})" }, { expr: "componentes(4, new int[][] {})" }, { expr: "componentes(3, new int[][] {{0, 1}, {1, 2}, {2, 0}})" }, { expr: "componentes(6, new int[][] {{0, 5}, {2, 3}})" }],
        dica: "Monte adj com n listas vazias; cada aresta entra nos dois sentidos. Depois, o laço + DFS da aula." },
      { tipo: "escolha", titulo: "Custo", enunciado: "Qual o custo da BFS num grafo com V vértices e E arestas, usando lista de adjacência?", alternativas: ["O(V + E)", "O(V · E)", "O(V²) sempre", "O(E log V)"], correta: 0, explicacao: "Cada vértice entra na fila uma vez e cada lista de vizinhos é percorrida uma vez." },
      { tipo: "escolha", titulo: "Representação", enunciado: "Uma rede social tem 1 milhão de pessoas, e cada uma tem ~200 amigos. Qual representação usar?", alternativas: ["lista de adjacência", "matriz de adjacência 1.000.000 × 1.000.000", "tanto faz", "um único array de amigos"], correta: 0, explicacao: "A matriz teria 10¹² posições, quase todas zero. A lista guarda só as arestas existentes (~200 milhões)." }
    ]
  });
})();
