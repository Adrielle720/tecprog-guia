(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };
  var QUICK = String.raw`import java.util.Arrays;

public class Quicksort {
    public static void quicksort(int[] v, int inicio, int fim) {
        if (inicio >= fim) {
            return;
        }
        int p = particionar(v, inicio, fim);
        quicksort(v, inicio, p - 1);
        quicksort(v, p + 1, fim);
    }

    private static int particionar(int[] v, int inicio, int fim) {
        int pivo = v[fim];
        int menores = inicio;
        for (int atual = inicio; atual < fim; atual++) {
            if (v[atual] <= pivo) {
                trocar(v, menores, atual);
                menores++;
            }
        }
        trocar(v, menores, fim);
        return menores;
    }

    private static void trocar(int[] v, int a, int b) {
        int t = v[a];
        v[a] = v[b];
        v[b] = t;
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        quicksort(v, 0, v.length - 1);
        System.out.println(Arrays.toString(v));
    }
}`;
  function emPart(st) { return st.frames.some(function (f) { return f.metodo === "particionar"; }); }
  function faixas(st, n) {
    var i0 = st.num("inicio"), f = st.num("fim");
    if (i0 === undefined || f === undefined) return [];
    var fx = [{ de: 0, ate: i0, cls: " z-desc" }, { de: f + 1, ate: n, cls: " z-desc" }];
    if (emPart(st)) {
      var m = st.num("menores"), a = st.num("atual");
      if (m !== undefined) fx.push({ de: i0, ate: m, cls: " z-men" });
      if (m !== undefined && a !== undefined) fx.push({ de: m, ate: a, cls: " z-mai" });
      if (st.num("pivo") !== undefined && st.topo.metodo !== "quicksort") fx.push({ de: f, ate: f + 1, cls: " z-piv" });
    } else fx.push({ de: i0, ate: f + 1, cls: " z-cand" });
    return fx;
  }
  var VIZ = [
    { tipo: "array", nome: "v", barras: true, ponteiros: [["menores", "#215c7a"], ["atual", "#e0392b"], ["p", "#6b4fa0", "topo"]], faixas: faixas,
      nota: function (st) { var pv = st.num("pivo"); return emPart(st) && pv !== undefined ? "pivô = " + pv + "  ·  intervalo [" + st.num("inicio") + ", " + st.num("fim") + "]" : st.num("inicio") !== undefined ? "quicksort em [" + st.num("inicio") + ", " + st.num("fim") + "]" : ""; },
      legenda: [["", "≤ pivô: v[inicio..menores)", "#e2edf3"], ["", "> pivô: v[menores..atual)", "#fdf1e0"], ["", "pivô", "#efe9f8"], ["", "fora do intervalo", "#dfe6e8"]] },
    { tipo: "arvore", metodos: ["quicksort"], titulo: "chamadas de quicksort", rotulo: function (c) { var a = arg(c, "inicio"), b = arg(c, "fim"); return +a >= +b ? "[" + a + ".." + b + "] base" : "[" + a + ".." + b + "]"; }, largura: 76 }
  ];
  var DICAS = [
    { linha: /int pivo = v\[fim\]/, texto: function (st) { return "O pivô é o **último** elemento do intervalo: " + st.num("pivo") + ". A partição vai deixar os ≤ " + st.num("pivo") + " à esquerda e os maiores à direita."; } },
    { linha: /if \(v\[atual\] <= pivo\)/, texto: function (st) { var v = st.arr("v"), a = st.num("atual"); return v[a] <= st.num("pivo") ? v[a] + " ≤ pivô: vai para a região dos menores (troca com a posição menores = " + st.num("menores") + ")." : v[a] + " > pivô: fica onde está, na região dos maiores."; } },
    { linha: /trocar\(v, menores, fim\)/, texto: function (st) { return "Fim da varredura: o pivô troca com a posição menores = " + st.num("menores") + ", entrando **entre** as duas regiões. É a posição final dele."; } },
    { linha: /int p = particionar/, texto: function (st) { return st.passo.voltou !== undefined ? "O pivô ficou na posição " + st.num("p") + " e **nunca mais se mexe**. Agora ordena cada lado." : ""; } },
    { linha: /if \(inicio >= fim\)/, texto: function (st) { return st.num("inicio") >= st.num("fim") ? "**Caso base**: intervalo com 0 ou 1 elemento." : ""; } }
  ];
  function prog(metodos, main) { return "import java.util.Arrays;\n\npublic class Quicksort {\n" + metodos + "\n\n    public static void main(String[] args) {\n" + main + "\n    }\n}"; }
  var METODOS = QUICK.split("\n").slice(3, 30).join("\n");
  var MAIN = "        int[] v = {5, 1, 4, 1, 5, 9, 2, 6};\n        quicksort(v, 0, v.length - 1);\n        System.out.println(Arrays.toString(v));";

  G.algoritmo({
    slug: "quicksort", titulo: "Quicksort", aula: "Aula 12", grupo: "Ordenação",
    resumo: "Escolhe um **pivô** e **particiona**: os menores ou iguais vão para a esquerda, os maiores para a direita, e o pivô cai na posição final. Depois ordena cada lado. Sem merge.",
    custos: [["caso médio", "O(n log n)"], ["pior caso", "O(n²)"], ["memória extra", "O(log n) de pilha"], ["estável?", "não"]],
    ideia: String.raw`Queremos ordenar **sem** o vetor auxiliar do mergesort. A ideia: escolher um elemento, o **pivô**, e reorganizar o intervalo para que:
- todos os **≤ pivô** fiquem antes dele;
- todos os **> pivô** fiquem depois;
- o pivô fique na sua **posição final**.

Depois disso o pivô nunca mais se mexe, e basta ordenar recursivamente os dois lados. **Não há merge final**: quando os lados ficam ordenados, o array inteiro está ordenado. Essa é a grande diferença para o mergesort.

A aula usa o **último** elemento como pivô e intervalo **fechado** [inicio, fim]. A partição anda com «atual» da esquerda para a direita. Quem é ≤ pivô é trocado para a posição «menores», que avança. No fim, o pivô troca com «menores» e entra entre as duas regiões.

**Custo:** se o pivô divide em partes parecidas, são ~log n níveis com O(n) de trabalho cada: O(n log n). Se o pivô é sempre o menor ou o maior (array **já ordenado**, nesta versão!), uma das partes fica vazia e a outra com n − 1: n + (n−1) + … = O(n²).`,
    pseudo: String.raw`QUICKSORT(v, inicio, fim)
    IF inicio >= fim THEN
        RETURN
    p <- PARTICIONAR(v, inicio, fim)
    QUICKSORT(v, inicio, p - 1)
    QUICKSORT(v, p + 1, fim)

PARTICIONAR(v, inicio, fim)
    pivo <- v[fim]
    menores <- inicio
    FOR atual <- inicio TO fim - 1
        IF v[atual] <= pivo THEN
            TROCAR(v, menores, atual)
            menores <- menores + 1
    TROCAR(v, menores, fim)
    RETURN menores`,
    invariante: String.raw`**Antes de cada iteração, v[inicio..menores) tem valores ≤ pivô e v[menores..atual) tem valores > pivô.** Quando o laço termina, trocar o pivô com a posição «menores» o coloca exatamente entre as duas regiões: nada à esquerda é maior, nada à direita é menor ou igual.`,
    programas: [
      { id: "qs", nome: "Quicksort (aula 12)", codigo: QUICK, entradas: [{ nome: "v", tipo: "int[]", valor: "8, 3, 7, 2, 5" }],
        exemplos: [{ rotulo: "8 elementos", valores: { v: "5, 1, 4, 1, 5, 9, 2, 6" } }, { rotulo: "já ordenado (pior caso!)", valores: { v: "1, 2, 3, 4, 5, 6" } }, { rotulo: "todos iguais", valores: { v: "4, 4, 4, 4, 4" } }, { rotulo: "invertido", valores: { v: "6, 5, 4, 3, 2, 1" } }],
        viz: VIZ, dicas: DICAS,
        tabela: { quando: "if (v[atual] <= pivo)", colunas: [["intervalo", function (st) { return "[" + st.num("inicio") + ", " + st.num("fim") + "]"; }], ["pivô", "pivo"], ["atual", "atual"], ["v[atual]", "v[atual]"], ["ação", function (st) { return st.arr("v")[st.num("atual")] <= st.num("pivo") ? "troca com posição " + st.num("menores") : "não troca"; }], ["array antes", "v"]] } }
    ],
    problemas: {
      resolve: String.raw`- **ordenar no próprio array**, rápido na prática (é a base do «Arrays.sort» para tipos primitivos em Java, numa versão com dois pivôs);
- a **partição** sozinha resolve muitos problemas: separar pares de ímpares, negativos de positivos, "menores que x" de "maiores";
- **quickselect**: achar o k-ésimo menor (ou a mediana) em O(n) médio, sem ordenar tudo;
- partição em 3 vias para arrays com **muitos repetidos** (a bandeira holandesa).`,
      classicos: [
        { nome: "Kth Largest Element in an Array", onde: "LeetCode 215", ideia: "O k-ésimo maior sem ordenar tudo.", muda: "**quickselect**: particiona e recursa **só no lado** que contém a posição procurada. O(n) no caso médio." },
        { nome: "Sort Colors", onde: "LeetCode 75", ideia: "Ordenar um array de 0s, 1s e 2s em uma passada.", muda: "partição em **3 regiões** (menores, iguais, maiores) com três índices: a bandeira holandesa." },
        { nome: "Sort Array By Parity", onde: "LeetCode 905", ideia: "Pares antes dos ímpares.", muda: "é a partição com a condição «v[atual] % 2 == 0» no lugar de «v[atual] <= pivo»." },
        { nome: "Move Zeroes", onde: "LeetCode 283", ideia: "Levar os zeros para o fim mantendo a ordem dos outros.", muda: "a mesma varredura com «menores»: quem é diferente de zero é trocado para a frente." },
        { nome: "Sort an Array", onde: "LeetCode 912", ideia: "Ordenar sem biblioteca.", muda: "com entradas adversárias (já ordenadas), escolha o pivô **no meio ou aleatório** para evitar O(n²)." },
        { nome: "Wiggle Sort II / mediana", onde: "LeetCode 324", ideia: "Precisa da mediana primeiro.", muda: "a mediana sai de um quickselect com k = n/2." }
      ]
    },
    variacoes: [
      { nome: "Pivô no meio (contra o pior caso)", curto: "pivô no meio", quando: "o array pode vir já ordenado ou quase ordenado, e o último elemento seria sempre um pivô ruim.",
        muda: String.raw`A partição continua a mesma. Só **antes** de começar, troca o elemento do meio com o último. Assim o pivô é o do meio, e num array ordenado ele divide certinho ao meio. Compare a altura da árvore com a do exemplo "já ordenado" da versão da aula.`,
        codigo: prog(METODOS.replace("        int pivo = v[fim];", "        int m = inicio + (fim - inicio) / 2;\n        trocar(v, m, fim);\n        int pivo = v[fim];"), "        int[] v = {1, 2, 3, 4, 5, 6, 7, 8};\n        quicksort(v, 0, v.length - 1);\n        System.out.println(Arrays.toString(v));") },
      { nome: "Ordem decrescente", curto: "decrescente", quando: "você quer do maior para o menor.",
        muda: String.raw`Só a condição da partição: vai para a esquerda quem é **≥ pivô**. O resto é idêntico.`,
        codigo: prog(METODOS.replace("if (v[atual] <= pivo)", "if (v[atual] >= pivo)"), MAIN) },
      { nome: "Quickselect: o k-ésimo menor", curto: "quickselect", quando: "você só quer UM elemento na posição ordenada (o menor, a mediana, o k-ésimo), não o array todo ordenado.",
        muda: String.raw`Mesma partição, mas recursa em **um lado só**: se o pivô caiu exatamente na posição k, achou; se k está à esquerda, continua à esquerda; senão, à direita. Como descarta um lado a cada passo, o custo médio cai para O(n).`,
        codigo: prog(String.raw`    public static int kesimo(int[] v, int inicio, int fim, int k) {
        if (inicio == fim) {
            return v[inicio];
        }
        int p = particionar(v, inicio, fim);
        if (k == p) {
            return v[p];
        } else if (k < p) {
            return kesimo(v, inicio, p - 1, k);
        }
        return kesimo(v, p + 1, fim, k);
    }
` + METODOS.split("\n").slice(9).join("\n"), "        int[] v = {5, 1, 4, 1, 5, 9, 2, 6};\n        int k = 3;\n        System.out.println(kesimo(v, 0, v.length - 1, k));"),
        programa: { viz: [VIZ[0], { tipo: "arvore", metodos: ["kesimo"], rotulo: function (c) { return "[" + arg(c, "inicio") + ".." + arg(c, "fim") + "]"; } }] } },
      { nome: "Partição em 3 vias (Sort Colors)", curto: "3 vias", quando: "há MUITOS valores repetidos, ou os valores são só algumas categorias (LeetCode 75).",
        muda: String.raw`Três regiões em vez de duas: **< pivô**, **= pivô** e **> pivô**, com três índices («lt», «i», «gt»). Os iguais ficam juntos no meio e não entram nas chamadas recursivas. Com o pivô 1 num array de 0s, 1s e 2s, uma única passada ordena tudo.`,
        codigo: String.raw`import java.util.Arrays;

public class Quicksort {
    public static void tresVias(int[] v, int pivo) {
        int lt = 0;
        int i = 0;
        int gt = v.length - 1;
        while (i <= gt) {
            if (v[i] < pivo) {
                trocar(v, lt, i);
                lt++;
                i++;
            } else if (v[i] > pivo) {
                trocar(v, i, gt);
                gt--;
            } else {
                i++;
            }
        }
    }

    private static void trocar(int[] v, int a, int b) {
        int t = v[a];
        v[a] = v[b];
        v[b] = t;
    }

    public static void main(String[] args) {
        int[] v = {2, 0, 2, 1, 1, 0, 1, 2, 0};
        tresVias(v, 1);
        System.out.println(Arrays.toString(v));
    }
}`, programa: { viz: [{ tipo: "array", nome: "v", barras: true, ponteiros: [["lt", "#215c7a"], ["i", "#e0392b"], ["gt", "#bd711d"]], faixas: function (st, n) { var lt = st.num("lt"), i = st.num("i"), gt = st.num("gt"); if (lt === undefined) return []; return [{ de: 0, ate: lt, cls: " z-men" }, { de: lt, ate: i, cls: " z-piv" }, { de: gt + 1, ate: n, cls: " z-mai" }]; }, legenda: [["", "< pivô", "#e2edf3"], ["", "= pivô", "#efe9f8"], ["", "> pivô", "#fdf1e0"]] }] } }
    ],
    erros: [
      { erro: "Chamar a recursão incluindo o pivô", curto: "quicksort(v, inicio, p)", porque: "Com «quicksort(v, inicio, p)», quando o pivô é o maior (p = fim), a chamada recebe **o mesmo intervalo** de novo: recursão infinita, StackOverflowError. O pivô já está no lugar e precisa ficar de fora: «p - 1» e «p + 1».",
        codigo: QUICK.replace("quicksort(v, inicio, p - 1);", "quicksort(v, inicio, p);").replace("{{v}}", "{3, 1, 2, 5}") },
      { erro: "Incluir o pivô no laço de varredura", curto: "atual <= fim", porque: "Com «atual <= fim», o pivô é comparado consigo mesmo e conta como menor, então «menores» termina uma posição além de onde o pivô deveria ficar. A partição devolve a posição errada, uma das chamadas recebe de novo o mesmo intervalo e a recursão nunca termina: StackOverflowError.",
        codigo: QUICK.replace("atual < fim;", "atual <= fim;").replace("{{v}}", "{8, 3, 7, 2, 5}") },
      { erro: "Devolver a posição errada", curto: "return fim", porque: "A posição final do pivô é «menores», não «fim». Devolvendo «fim», as chamadas recursivas usam a divisão errada e partes do array ficam fora de ordem.",
        codigo: QUICK.replace("return menores;", "return fim;").replace("{{v}}", "{8, 3, 7, 2, 5}") },
      { erro: "Achar que é sempre O(n log n)", curto: "array ordenado", porque: "Com o último como pivô, um array **já ordenado** faz cada partição separar 0 de um lado e n − 1 do outro. A árvore vira uma fila de altura n: O(n²). Rode e veja a árvore.",
        codigo: QUICK.replace("{{v}}", "{1, 2, 3, 4, 5, 6, 7, 8}") }
    ],
    perguntas: [
      { g: "conceito", p: "Qual é o papel da partição, e por que o pivô fica na posição correta?", r: "Separar o intervalo em ≤ pivô | pivô | > pivô. Pelo invariante, ao fim da varredura tudo antes de «menores» é ≤ pivô e tudo de «menores» a fim − 1 é maior; trocar o pivô com «menores» o coloca entre as duas regiões, que é exatamente a posição dele no array ordenado." },
      { g: "conceito", p: "Por que o quicksort não precisa de merge final, ao contrário do mergesort?", r: "Porque a partição já garante que **tudo** à esquerda é ≤ tudo à direita. Ordenando cada lado, o todo fica ordenado. O trabalho de \"combinar\" foi feito antes, ao dividir." },
      { g: "conceito", p: "Quando o quicksort da aula cai no pior caso O(n²)? Por quê?", r: "Quando o pivô é sempre o menor ou o maior, como num array **já ordenado** (ou invertido) com o último como pivô. Cada partição tira só um elemento: n + (n−1) + … ≈ n²/2." },
      { g: "conceito", p: "Compare quicksort e mergesort em tempo, memória e estabilidade.", r: "Tempo: merge sempre O(n log n); quick O(n log n) médio e O(n²) no pior. Memória: merge O(n) extra; quick no próprio array (só a pilha). Estabilidade: merge é estável; quick não (as trocas de longa distância mudam a ordem de iguais)." },
      { g: "codigo", p: "Simule a partição de {8, 3, 7, 2, 5}. Onde o pivô termina?", r: "Pivô 5. 8 fica; 3 ≤ 5 troca com a posição 0 → {3, 8, 7, 2, 5}; 7 fica; 2 troca com a posição 1 → {3, 2, 7, 8, 5}; no fim o pivô troca com a posição 2 → {3, 2, 5, 8, 7}. O 5 termina na posição 2." },
      { g: "codigo", p: "Por que o for vai só até «atual < fim»?", r: "A posição fim é o **pivô**, e ele não deve ser comparado consigo mesmo. Ele é tratado à parte, na troca final." },
      { g: "codigo", p: "Por que as chamadas recursivas usam «p - 1» e «p + 1»?", r: "O pivô já está na posição definitiva. Incluí-lo pode gerar uma chamada com o mesmo intervalo de antes, e aí vem a recursão infinita." },
      { g: "variacao", p: "Como evitar o pior caso quando o array pode vir ordenado?", r: "Escolher melhor o pivô: o do **meio**, um aleatório ou a mediana de três. Troque-o com o último e use a mesma partição." },
      { g: "variacao", p: "Como achar a mediana (ou o k-ésimo menor) sem ordenar tudo?", r: "**Quickselect**: particiona e continua só no lado que contém a posição k. Custo médio O(n)." },
      { g: "variacao", p: "Por que valores repetidos podem atrapalhar, e o que ajuda?", r: "Com muitos iguais ao pivô, a partição de 2 regiões manda todos para um lado e as divisões ficam desequilibradas. A partição em **3 vias** (<, =, >) deixa os iguais no meio e fora das recursões." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Posição do pivô", enunciado: "O programa particiona {6, 2, 9, 1, 5, 4} com o último como pivô e imprime a posição devolvida e o array. O que ele imprime?",
        codigo: String.raw`import java.util.Arrays;
public class Part {
    static int particionar(int[] v, int inicio, int fim) {
        int pivo = v[fim];
        int menores = inicio;
        for (int atual = inicio; atual < fim; atual++) {
            if (v[atual] <= pivo) {
                int t = v[menores]; v[menores] = v[atual]; v[atual] = t;
                menores++;
            }
        }
        int t = v[menores]; v[menores] = v[fim]; v[fim] = t;
        return menores;
    }
    public static void main(String[] args) {
        int[] v = {6, 2, 9, 1, 5, 4};
        int p = particionar(v, 0, v.length - 1);
        System.out.println(p + " " + Arrays.toString(v));
    }
}`, formato: "p [array]", explicacao: "Pivô 4. 2 e 1 são ≤ 4 e vão para as posições 0 e 1. O pivô entra na posição 2: [2, 1, 4, 6, 5, 9].",
        viz: [{ tipo: "array", nome: "v", barras: true, ponteiros: [["menores", "#215c7a"], ["atual", "#e0392b"]], faixas: function (st, n) { var m = st.num("menores"), a = st.num("atual"); if (m === undefined) return []; return [{ de: 0, ate: m, cls: " z-men" }, { de: m, ate: a === undefined ? m : a, cls: " z-mai" }, { de: n - 1, ate: n, cls: " z-piv" }]; } }] },
      { tipo: "rastreio", titulo: "Quantas chamadas?", enunciado: "Quantas vezes «quicksort» é chamado para ordenar o array **já ordenado** {1, 2, 3, 4, 5}? (o programa conta)",
        codigo: QUICK.replace("public static void quicksort(int[] v, int inicio, int fim) {", "static int chamadas = 0;\n\n    public static void quicksort(int[] v, int inicio, int fim) {\n        chamadas++;").replace("{{v}}", "{1, 2, 3, 4, 5}").replace("System.out.println(Arrays.toString(v));", "System.out.println(chamadas);"),
        formato: "número", explicacao: "9 chamadas: cada partição deixa o lado direito vazio (p = fim), e a recursão desce um elemento por vez. É o comportamento do pior caso.", viz: VIZ },
      { tipo: "completar", titulo: "Complete a partição", enunciado: "Complete «particionar» (pivô = último elemento).",
        modelo: String.raw`    static int particionar(int[] v, int inicio, int fim) {
        int pivo = ⟦⟧;
        int menores = ⟦⟧;
        for (int atual = inicio; atual < ⟦⟧; atual++) {
            if (⟦⟧) {
                trocar(v, menores, atual);
                menores++;
            }
        }
        trocar(v, ⟦⟧, fim);
        return menores;
    }

    static void trocar(int[] v, int a, int b) {
        int t = v[a];
        v[a] = v[b];
        v[b] = t;
    }`, gabarito: ["v[fim]", "inicio", "fim", "v[atual] <= pivo", "menores"],
        solucao: METODOS.split("\n").slice(9).join("\n").replace(/private static/g, "static"),
        testes: [{ codigo: "int[] v = {8, 3, 7, 2, 5}; int p = particionar(v, 0, 4); System.out.println(p + \" \" + Arrays.toString(v));" }, { codigo: "int[] v = {1, 2, 3}; int p = particionar(v, 0, 2); System.out.println(p + \" \" + Arrays.toString(v));" }, { codigo: "int[] v = {9, 8, 1}; int p = particionar(v, 0, 2); System.out.println(p + \" \" + Arrays.toString(v));" }, { codigo: "int[] v = {5, 9, 2, 7, 3}; int p = particionar(v, 1, 3); System.out.println(p + \" \" + Arrays.toString(v));" }] },
      { tipo: "escrever", titulo: "Pares antes dos ímpares", enunciado: "Escreva «separarPares(int[] v)», que reorganiza «v» (no próprio array) com todos os **pares antes** dos ímpares. Use a ideia da partição: um índice «menores» onde entra o próximo par. A ordem interna pode mudar, mas para os testes use exatamente essa varredura da esquerda para a direita.",
        inicial: "    public static void separarPares(int[] v) {\n        \n    }",
        solucao: String.raw`    public static void separarPares(int[] v) {
        int menores = 0;
        for (int atual = 0; atual < v.length; atual++) {
            if (v[atual] % 2 == 0) {
                int t = v[menores];
                v[menores] = v[atual];
                v[atual] = t;
                menores++;
            }
        }
    }`,
        testes: [{ codigo: "int[] v = {3, 8, 5, 2, 7, 4}; separarPares(v); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {1, 3, 5}; separarPares(v); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {2, 4}; separarPares(v); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {}; separarPares(v); System.out.println(Arrays.toString(v));" }],
        dica: "É a partição da aula com «v[atual] % 2 == 0» no lugar de «v[atual] <= pivo», percorrendo o array inteiro.", viz: [{ tipo: "array", nome: "v", ponteiros: [["menores", "#215c7a"], ["atual", "#e0392b"]] }] },
      { tipo: "escolha", titulo: "Pior caso", enunciado: "Com o **último** elemento como pivô, qual entrada leva o quicksort ao pior caso?", alternativas: ["{1, 2, 3, 4, 5, 6}", "{4, 1, 6, 2, 5, 3}", "{3, 6, 1, 5, 2, 4}", "nenhuma, é sempre O(n log n)"], correta: 0, explicacao: "Ordenado: o pivô é sempre o maior, uma parte fica vazia e a outra com n − 1. O(n²)." },
      { tipo: "escolha", titulo: "Estável?", enunciado: "O quicksort da aula é estável?", alternativas: ["não: as trocas de longa distância podem inverter iguais", "sim, porque usa <=", "sim, porque o pivô é o último", "só se não houver repetidos"], correta: 0, explicacao: "Uma troca pode passar um elemento por cima de outro igual. O mergesort (com <=) e o insertion sort são estáveis; o quicksort não." }
    ]
  });
})();
