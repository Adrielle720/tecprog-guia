(function () {
  var G = window.Guia;
  var BFS = String.raw`import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class LabirintoBFS {
    public static int menorDistancia(char[][] lab, int li, int ci, int lf, int cf) {
        if (!livre(lab, li, ci) || !livre(lab, lf, cf)) {
            return -1;
        }
        int[][] dist = new int[lab.length][lab[0].length];
        for (int[] linha : dist) {
            Arrays.fill(linha, -1);
        }
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        dist[li][ci] = 0;
        fila.addLast(new int[] {li, ci});
        while (!fila.isEmpty()) {
            int[] atual = fila.removeFirst();
            int l = atual[0];
            int c = atual[1];
            if (l == lf && c == cf) {
                return dist[l][c];
            }
            for (int k = 0; k < 4; k++) {
                int nl = l + dl[k];
                int nc = c + dc[k];
                if (livre(lab, nl, nc) && dist[nl][nc] == -1) {
                    dist[nl][nc] = dist[l][c] + 1;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
        return -1;
    }

    private static boolean livre(char[][] lab, int l, int c) {
        return l >= 0 && l < lab.length && c >= 0 && c < lab[0].length
            && lab[l][c] != '#';
    }

    public static void main(String[] args) {
        char[][] lab = {{lab}};
        System.out.println(menorDistancia(lab, {{li}}, {{ci}}, {{lf}}, {{cf}}));
    }
}`;
  function cheio(lab, li, ci, lf, cf) {
    return BFS.replace("{{lab}}", "{\n            " + lab.split("\n").map(function (l) { return JSON.stringify(l) + ".toCharArray()"; }).join(",\n            ") + "\n        }").replace("{{li}}", li).replace("{{ci}}", ci).replace("{{lf}}", lf).replace("{{cf}}", cf);
  }
  var VIZ = [{ tipo: "grade", nome: "lab", rotulo: "labirinto (número = distância já descoberta)", dist: "dist", pos: ["l", "c"], cand: ["nl", "nc"], fila: "fila", nota: function (st) { var l = st.noTopo("l"), c = st.noTopo("c"); return l === undefined ? "" : "processando (" + l + ", " + c + ")"; } },
    { tipo: "colecoes", nomes: ["fila"], titulo: "fila de coordenadas {linha, coluna}" }];
  var DICAS = [
    { linha: /int\[\] atual = fila.removeFirst\(\)/, texto: function (st) { var a = st.arr("atual"); return a ? "Tira da **frente** da fila a posição (" + a[0] + ", " + a[1] + "), descoberta há mais tempo." : ""; } },
    { linha: /if \(livre\(lab, nl, nc\) && dist\[nl\]\[nc\] == -1\)/, texto: function (st) { var nl = st.num("nl"), nc = st.num("nc"), lab = st.arr("lab"); if (nl < 0 || nl >= lab.length || nc < 0 || nc >= st.deref(lab[0]).a.length) return "(" + nl + ", " + nc + ") está fora do labirinto."; if (st.deref(lab[nl]).a[nc] === "#") return "(" + nl + ", " + nc + ") é parede."; var d = st.deref(st.arr("dist")[nl]).a[nc]; return d === -1 ? "(" + nl + ", " + nc + ") é nova: distância " + (st.deref(st.arr("dist")[st.num("l")]).a[st.num("c")] + 1) + ", entra no **fim** da fila." : "(" + nl + ", " + nc + ") já foi descoberta (dist = " + d + "): ignora."; } },
    { linha: /dist\[nl\]\[nc\] = dist\[l\]\[c\] \+ 1/, texto: function () { return "Marca a distância **ao entrar na fila**. Isso já serve de visitado, e outra posição da mesma camada não a coloca na fila de novo."; } },
    { linha: /if \(l == lf && c == cf\)/, texto: function (st) { return st.num("l") === st.num("lf") && st.num("c") === st.num("cf") ? "**Chegou no destino.** Como a fila processa camada por camada, essa é a menor distância." : ""; } }
  ];
  var LAB = "S..#\n##.#\n...D";

  G.algoritmo({
    slug: "bfs", titulo: "BFS e filas", aula: "Aula 14", grupo: "Matrizes e grafos",
    resumo: "Busca em **largura**: explora primeiro tudo a 1 passo, depois tudo a 2 passos… usando uma **fila**. Por isso encontra o **menor número de movimentos**.",
    custos: [["tempo", "O(linhas × colunas)"], ["memória (dist + fila)", "O(linhas × colunas)"], ["garante o menor caminho?", "sim, sem pesos"]],
    ideia: String.raw`A DFS pode achar um caminho, mas talvez um caminho longo. A **BFS** (breadth-first search) examina primeiro **todas** as posições a um movimento da origem, depois todas a dois movimentos, e assim por diante. Quando o destino aparece pela primeira vez, a distância dele é a menor possível.

Quem organiza essas camadas é a **fila** («ArrayDeque», «addLast» e «removeFirst»): sempre sai a posição descoberta **há mais tempo**, e as novas entram no fim. Assim, as posições de distância 0 saem antes das de distância 1, que saem antes das de distância 2.

A matriz «dist» começa com -1 (não descoberta). A **primeira** atribuição de «dist[vizinho]» também é a marca de visitado, e ela acontece **antes** de enfileirar. Desse modo, outro caminho da mesma camada não coloca a mesma posição na fila de novo.

Com uma **pilha** no lugar da fila, o mesmo código vira DFS, e perde a garantia do menor caminho.`,
    pseudo: String.raw`MENOR-DISTANCIA(lab, origem, destino)
    dist <- matriz preenchida com -1
    fila <- FILA-VAZIA()
    dist[origem] <- 0
    ENFILEIRAR(fila, origem)
    WHILE NOT VAZIA(fila) DO
        atual <- DESENFILEIRAR(fila)
        IF atual = destino THEN
            RETURN dist[atual]
        PARA CADA vizinho nas quatro direções DE atual
            IF vizinho é válido, livre e dist[vizinho] = -1 THEN
                dist[vizinho] <- dist[atual] + 1
                ENFILEIRAR(fila, vizinho)
    RETURN -1`,
    invariante: String.raw`**A fila sempre tem posições de no máximo duas distâncias consecutivas, d e d + 1, com as de distância d na frente.** Por isso, quando uma posição é descoberta pela primeira vez, a distância anotada é a menor possível.`,
    programas: [
      { id: "bfs", nome: "Menor distância (aula 14)", codigo: BFS,
        entradas: [{ nome: "lab", rotulo: "labirinto (# parede)", tipo: "char[][]", valor: LAB }, { nome: "li", rotulo: "linha origem", tipo: "int", valor: "0" }, { nome: "ci", rotulo: "coluna origem", tipo: "int", valor: "0" }, { nome: "lf", rotulo: "linha destino", tipo: "int", valor: "2" }, { nome: "cf", rotulo: "coluna destino", tipo: "int", valor: "3" }],
        exemplos: [{ rotulo: "sem saída", valores: { lab: "S.#.\n.##.\n..#D" } }, { rotulo: "sala aberta 4×5", valores: { lab: "S....\n.....\n.....\n....D", lf: "3", cf: "4" } }, { rotulo: "dois caminhos (um curto)", valores: { lab: "S....\n.###.\n.#D..\n.....", lf: "2", cf: "2" } }],
        viz: VIZ, dicas: DICAS,
        tabela: { quando: "int[] atual = fila.removeFirst()", colunas: [["removeu", function (st) { var a = st.arr("atual"); return "(" + a[0] + ", " + a[1] + ")"; }], ["dist", function (st) { var a = st.arr("atual"); return st.deref(st.arr("dist")[a[0]]).a[a[1]]; }], ["fila depois", function (st) { var f = st.arr("fila"); return f.map(function (x) { var q = st.deref(x); return "(" + q.a[0] + "," + q.a[1] + ")"; }).join(" "); }]] } }
    ],
    problemas: {
      resolve: String.raw`Toda pergunta de **menor número de passos** quando cada passo custa o mesmo:
- menor caminho num labirinto ou grade;
- menor número de jogadas / transformações (palavras, estados de um quebra-cabeça, cadeados);
- distâncias em **camadas**: tudo que está a k passos, espalhamento (fogo, infecção, laranjas podres);
- BFS com várias origens ao mesmo tempo.

Se os movimentos têm **custos diferentes**, a BFS simples não basta (aí entram algoritmos como Dijkstra).`,
      classicos: [
        { nome: "Shortest Path in Binary Matrix", onde: "LeetCode 1091", ideia: "Menor caminho de 0s do canto ao canto, em 8 direções.", muda: "arrays de deslocamento com **8** direções; o resto é a BFS da aula." },
        { nome: "Rotting Oranges", onde: "LeetCode 994", ideia: "Em quantos minutos todas as laranjas apodrecem?", muda: "**várias origens**: todas as laranjas podres entram na fila no começo com distância 0. A resposta é a maior distância." },
        { nome: "01 Matrix", onde: "LeetCode 542", ideia: "Distância de cada célula até o 0 mais próximo.", muda: "também multi-origem: todos os 0s entram na fila de uma vez." },
        { nome: "Word Ladder", onde: "LeetCode 127", ideia: "Menor sequência de palavras trocando uma letra por vez.", muda: "o \"vértice\" é uma palavra, e os vizinhos são as palavras a uma letra de distância. Mesma fila, mesma dist." },
        { nome: "Open the Lock", onde: "LeetCode 752", ideia: "Menor número de giros para abrir um cadeado de 4 dígitos.", muda: "os estados são Strings \"0000\"…\"9999\" e cada giro é um vizinho. Use um HashSet como visitado." },
        { nome: "Nearest Exit from Entrance in Maze", onde: "LeetCode 1926", ideia: "A saída mais próxima de um labirinto.", muda: "o destino é qualquer célula livre **na borda** (diferente da entrada)." }
      ]
    },
    variacoes: [
      { nome: "Reconstruir o caminho", curto: "reconstruir caminho", quando: "além de QUANTOS passos, você precisa dizer QUAIS são.",
        muda: String.raw`Duas matrizes a mais, «predL» e «predC», guardam **de onde** cada posição foi descoberta. Ao chegar ao destino, anda para trás seguindo os predecessores até a origem, e depois inverte a ordem.`,
        base: cheio(LAB, 0, 0, 2, 3),
        codigo: String.raw`import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class LabirintoBFS {
    public static String caminho(char[][] lab, int li, int ci, int lf, int cf) {
        int[][] dist = new int[lab.length][lab[0].length];
        int[][] predL = new int[lab.length][lab[0].length];
        int[][] predC = new int[lab.length][lab[0].length];
        for (int[] linha : dist) {
            Arrays.fill(linha, -1);
        }
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        dist[li][ci] = 0;
        fila.addLast(new int[] {li, ci});
        while (!fila.isEmpty()) {
            int[] atual = fila.removeFirst();
            int l = atual[0];
            int c = atual[1];
            for (int k = 0; k < 4; k++) {
                int nl = l + dl[k];
                int nc = c + dc[k];
                if (livre(lab, nl, nc) && dist[nl][nc] == -1) {
                    dist[nl][nc] = dist[l][c] + 1;
                    predL[nl][nc] = l;
                    predC[nl][nc] = c;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
        if (dist[lf][cf] == -1) {
            return "sem caminho";
        }
        String resposta = "(" + lf + "," + cf + ")";
        int l = lf, c = cf;
        while (l != li || c != ci) {
            int pl = predL[l][c];
            int pc = predC[l][c];
            l = pl;
            c = pc;
            resposta = "(" + l + "," + c + ") " + resposta;
        }
        return resposta;
    }

    private static boolean livre(char[][] lab, int l, int c) {
        return l >= 0 && l < lab.length && c >= 0 && c < lab[0].length
            && lab[l][c] != '#';
    }

    public static void main(String[] args) {
        char[][] lab = {
            "S..#".toCharArray(),
            "##.#".toCharArray(),
            "...D".toCharArray()
        };
        System.out.println(caminho(lab, 0, 0, 2, 3));
    }
}`, programa: { viz: [{ tipo: "grade", nome: "lab", dist: "dist", pos: ["l", "c"], cand: ["nl", "nc"], fila: "fila" }] } },
      { nome: "Várias origens (laranjas podres)", curto: "várias origens", quando: "o espalhamento começa de vários pontos ao mesmo tempo (LeetCode 994).",
        muda: String.raw`**Todas** as origens entram na fila no começo, com distância 0. A BFS continua igual e cada célula recebe a distância até a origem **mais próxima**. A resposta é o maior «dist».`,
        base: cheio(LAB, 0, 0, 2, 3),
        codigo: String.raw`import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class LabirintoBFS {
    public static int minutos(char[][] grade) {
        int[][] dist = new int[grade.length][grade[0].length];
        for (int[] linha : dist) {
            Arrays.fill(linha, -1);
        }
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        for (int l = 0; l < grade.length; l++) {
            for (int c = 0; c < grade[0].length; c++) {
                if (grade[l][c] == 'P') {
                    dist[l][c] = 0;
                    fila.addLast(new int[] {l, c});
                }
            }
        }
        int maior = 0;
        while (!fila.isEmpty()) {
            int[] atual = fila.removeFirst();
            int l = atual[0];
            int c = atual[1];
            maior = Math.max(maior, dist[l][c]);
            for (int k = 0; k < 4; k++) {
                int nl = l + dl[k];
                int nc = c + dc[k];
                if (nl >= 0 && nl < grade.length && nc >= 0 && nc < grade[0].length
                        && grade[nl][nc] == 'b' && dist[nl][nc] == -1) {
                    dist[nl][nc] = dist[l][c] + 1;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
        return maior;
    }

    public static void main(String[] args) {
        char[][] grade = {
            "Pbb.".toCharArray(),
            "bb.b".toCharArray(),
            ".bbP".toCharArray()
        };
        System.out.println(minutos(grade));
    }
}`, programa: { viz: [{ tipo: "grade", nome: "grade", rotulo: "P = podre, b = boa", dist: "dist", pos: ["l", "c"], cand: ["nl", "nc"], fila: "fila" }, { tipo: "colecoes", nomes: ["fila"] }] } },
      { nome: "Trocar a fila por uma pilha", curto: "com pilha", quando: "…nunca, se você quer a menor distância! Serve para ver POR QUE a fila importa.",
        muda: String.raw`Só muda de onde se tira: «removeLast» (pilha) em vez de «removeFirst» (fila). O algoritmo vira uma DFS: ainda acha o destino, mas a "distância" anotada pode ser **maior** que a mínima. Numa sala aberta 3×3, de (0,0) até (2,0), a resposta certa é 2, e com pilha sai 6.`,
        base: cheio("...\n...\n...", 0, 0, 2, 0),
        codigo: cheio("...\n...\n...", 0, 0, 2, 0).replace("int[] atual = fila.removeFirst();", "int[] atual = fila.removeLast();"), programa: { viz: VIZ } }
    ],
    erros: [
      { erro: "Usar pilha no lugar de fila", curto: "pilha", porque: "Tirando sempre o último que entrou, a exploração vai fundo numa direção antes das outras: é DFS. Acha **um** caminho, mas a distância pode não ser a menor (6 em vez de 2).",
        codigo: cheio("...\n...\n...", 0, 0, 2, 0).replace("int[] atual = fila.removeFirst();", "int[] atual = fila.removeLast();") },
      { erro: "Testar dist antes de testar os limites", curto: "dist antes de livre", porque: "Em «dist[nl][nc] == -1 && livre(...)», a leitura de «dist[-1][c]» acontece antes da checagem de limites: ArrayIndexOutOfBoundsException. O «&&» avalia da esquerda para a direita.",
        codigo: cheio(LAB, 0, 0, 2, 3).replace("if (livre(lab, nl, nc) && dist[nl][nc] == -1)", "if (dist[nl][nc] == -1 && livre(lab, nl, nc))") },
      { erro: "Marcar só quando remove da fila", porque: "Se a marca (dist) só for feita ao **remover**, a mesma posição pode entrar várias vezes na fila, uma por vizinho que a descobriu. O resultado pode continuar certo, mas a fila incha e o custo deixa de ser O(linhas × colunas). A aula marca ao **enfileirar**." },
      { erro: "Não validar origem e destino", porque: "Se a origem ou o destino for parede (ou estiver fora da matriz), não existe caminho. A função da aula confere «livre» nos dois antes de começar e devolve -1." }
    ],
    perguntas: [
      { g: "conceito", p: "Por que a BFS encontra o menor número de movimentos e a DFS não garante?", r: "A fila processa as posições **em ordem de distância**: todas a 1 passo, depois todas a 2… A primeira vez que o destino é descoberto, é pela menor distância. A DFS segue uma direção até o fim e pode chegar primeiro por um caminho longo." },
      { g: "conceito", p: "Qual estrutura transforma o algoritmo em BFS, e qual em DFS?", r: "**Fila** (tira o mais antigo, FIFO) → BFS. **Pilha** (tira o mais recente, LIFO) → DFS. O resto do código pode ser idêntico." },
      { g: "conceito", p: "Qual o custo da BFS numa matriz?", r: "O(linhas × colunas): cada célula livre entra na fila no máximo uma vez e examina no máximo 4 vizinhos. A memória (dist e fila) também é O(linhas × colunas)." },
      { g: "conceito", p: "Movimentos com custos diferentes (andar na lama custa 3). A BFS resolve?", r: "Não: ela conta **passos**, não custos. Com pesos diferentes é preciso outro algoritmo (Dijkstra)." },
      { g: "codigo", p: "Por que marcar «dist» ANTES de enfileirar, e não ao remover?", r: "Para que a mesma posição não seja enfileirada várias vezes por vizinhos diferentes da mesma camada. A primeira descoberta já é a menor distância." },
      { g: "codigo", p: "O que cada elemento da fila guarda, e por que «int[]»?", r: "Uma coordenada {linha, coluna}. Como Java não tem par pronto, a aula usa um array de 2 posições: «new int[] {nl, nc}»." },
      { g: "codigo", p: "Para que servem «dl» e «dc»?", r: "São os deslocamentos das quatro direções: (−1,0) cima, (1,0) baixo, (0,−1) esquerda, (0,1) direita. Um laço de 0 a 3 gera os vizinhos sem repetir código." },
      { g: "variacao", p: "Como obter o caminho (a sequência de posições), não só a distância?", r: "Guarde o predecessor de cada posição ao descobri-la («predL», «predC»). No fim, siga os predecessores do destino até a origem e inverta a ordem." },
      { g: "variacao", p: "O fogo começa em três pontos ao mesmo tempo. Como adaptar?", r: "BFS **multi-origem**: coloque as três posições na fila no começo, todas com distância 0." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Ordem de saída da fila", enunciado: "O programa imprime cada posição quando ela **sai** da fila (BFS numa sala 2×3 a partir de (0,0), vizinhos na ordem cima, baixo, esquerda, direita). O que ele imprime?",
        codigo: String.raw`import java.util.ArrayDeque;
import java.util.Deque;
public class OrdemBFS {
    public static void main(String[] args) {
        int linhas = 2, colunas = 3;
        boolean[][] vis = new boolean[linhas][colunas];
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        vis[0][0] = true;
        fila.addLast(new int[] {0, 0});
        while (!fila.isEmpty()) {
            int[] a = fila.removeFirst();
            System.out.println(a[0] + "," + a[1]);
            for (int k = 0; k < 4; k++) {
                int nl = a[0] + dl[k], nc = a[1] + dc[k];
                if (nl >= 0 && nl < linhas && nc >= 0 && nc < colunas && !vis[nl][nc]) {
                    vis[nl][nc] = true;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
    }
}`, formato: "l,c l,c …", explicacao: "Distância 0: (0,0). Distância 1: (1,0) e (0,1), nessa ordem (baixo vem antes de direita). Distância 2: (1,1) e (0,2). Distância 3: (1,2).",
        viz: [{ tipo: "grade", nome: "vis", rotulo: "visitado", pos: ["nl", "nc"], fila: "fila" }, { tipo: "colecoes", nomes: ["fila"] }] },
      { tipo: "rastreio", titulo: "Qual a distância?", enunciado: "Qual a saída?",
        codigo: cheio("S....\n.###.\n.#D..\n.....", 0, 0, 2, 2), formato: "número", explicacao: "O caminho pela direita: 4 passos até (0,4), 2 descendo e 2 para a esquerda = 8. Pela esquerda: 3 descendo, 2 para a direita e 1 subindo = 6. A BFS acha o 6.", viz: VIZ },
      { tipo: "completar", titulo: "Complete o coração da BFS", enunciado: "Complete o laço principal.",
        modelo: String.raw`    public static int menorDistancia(char[][] lab, int li, int ci, int lf, int cf) {
        int[][] dist = new int[lab.length][lab[0].length];
        for (int[] linha : dist) {
            Arrays.fill(linha, -1);
        }
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        dist[li][ci] = 0;
        fila.addLast(new int[] {li, ci});
        while (⟦⟧) {
            int[] atual = ⟦⟧;
            int l = atual[0];
            int c = atual[1];
            if (l == lf && c == cf) {
                return dist[l][c];
            }
            for (int k = 0; k < 4; k++) {
                int nl = l + dl[k];
                int nc = c + dc[k];
                if (nl >= 0 && nl < lab.length && nc >= 0 && nc < lab[0].length
                        && lab[nl][nc] != '#' && ⟦⟧) {
                    dist[nl][nc] = ⟦⟧;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
        return -1;
    }`, gabarito: ["!fila.isEmpty()", "fila.removeFirst()", "dist[nl][nc] == -1", "dist[l][c] + 1"],
        solucao: String.raw`    public static int menorDistancia(char[][] lab, int li, int ci, int lf, int cf) {
        int[][] dist = new int[lab.length][lab[0].length];
        for (int[] linha : dist) {
            Arrays.fill(linha, -1);
        }
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        dist[li][ci] = 0;
        fila.addLast(new int[] {li, ci});
        while (!fila.isEmpty()) {
            int[] atual = fila.removeFirst();
            int l = atual[0];
            int c = atual[1];
            if (l == lf && c == cf) {
                return dist[l][c];
            }
            for (int k = 0; k < 4; k++) {
                int nl = l + dl[k];
                int nc = c + dc[k];
                if (nl >= 0 && nl < lab.length && nc >= 0 && nc < lab[0].length
                        && lab[nl][nc] != '#' && dist[nl][nc] == -1) {
                    dist[nl][nc] = dist[l][c] + 1;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
        return -1;
    }`,
        testes: [{ expr: "menorDistancia(new char[][] {\"S..#\".toCharArray(), \"##.#\".toCharArray(), \"...D\".toCharArray()}, 0, 0, 2, 3)" }, { expr: "menorDistancia(new char[][] {\"S.#.\".toCharArray(), \".##.\".toCharArray(), \"..#D\".toCharArray()}, 0, 0, 2, 3)" }, { expr: "menorDistancia(new char[][] {\"...\".toCharArray(), \"...\".toCharArray(), \"...\".toCharArray()}, 0, 0, 2, 2)" }, { expr: "menorDistancia(new char[][] {\"S\".toCharArray()}, 0, 0, 0, 0)" }] },
      { tipo: "escrever", titulo: "Quantas posições a até k passos?", enunciado: "Escreva «alcance(char[][] lab, int li, int ci, int k)»: quantas posições livres (incluindo a origem) podem ser alcançadas com **no máximo k movimentos**. Use BFS com a matriz «dist».",
        inicial: "    public static int alcance(char[][] lab, int li, int ci, int k) {\n        return 0;\n    }",
        solucao: String.raw`    public static int alcance(char[][] lab, int li, int ci, int k) {
        int[][] dist = new int[lab.length][lab[0].length];
        for (int[] linha : dist) {
            Arrays.fill(linha, -1);
        }
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        dist[li][ci] = 0;
        fila.addLast(new int[] {li, ci});
        int total = 0;
        while (!fila.isEmpty()) {
            int[] a = fila.removeFirst();
            if (dist[a[0]][a[1]] > k) {
                continue;
            }
            total++;
            for (int d = 0; d < 4; d++) {
                int nl = a[0] + dl[d], nc = a[1] + dc[d];
                if (nl >= 0 && nl < lab.length && nc >= 0 && nc < lab[0].length
                        && lab[nl][nc] != '#' && dist[nl][nc] == -1) {
                    dist[nl][nc] = dist[a[0]][a[1]] + 1;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
        return total;
    }`,
        testes: [{ expr: "alcance(new char[][] {\"...\".toCharArray(), \"...\".toCharArray(), \"...\".toCharArray()}, 1, 1, 1)" }, { expr: "alcance(new char[][] {\"...\".toCharArray(), \"...\".toCharArray(), \"...\".toCharArray()}, 0, 0, 2)" }, { expr: "alcance(new char[][] {\".#.\".toCharArray(), \".#.\".toCharArray()}, 0, 0, 5)" }, { expr: "alcance(new char[][] {\".\".toCharArray()}, 0, 0, 0)" }],
        dica: "Faça a BFS normal, mas só conte (e só expanda) as posições com dist ≤ k." },
      { tipo: "escolha", titulo: "Onde marcar?", enunciado: "Na BFS da aula, em que momento a posição é marcada (dist deixa de ser -1)?", alternativas: ["quando ela ENTRA na fila", "quando ela SAI da fila", "quando o laço termina", "só se for o destino"], correta: 0, explicacao: "Marcar ao enfileirar evita que a mesma posição entre várias vezes. A primeira descoberta já é a menor distância." },
      { tipo: "escolha", titulo: "Estrutura", enunciado: "Qual troca transforma a BFS em DFS iterativa?", alternativas: ["tirar da pilha (removeLast/pop) em vez da frente da fila", "usar dist em vez de visitado", "usar 8 direções", "começar pelo destino"], correta: 0, explicacao: "LIFO (pilha) aprofunda; FIFO (fila) explora por camadas." }
    ]
  });
})();
