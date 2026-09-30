(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };
  var MERGESORT = String.raw`import java.util.Arrays;

public class Mergesort {
    public static void ordenar(int[] v) {
        int[] aux = new int[v.length];
        mergesort(v, aux, 0, v.length);
    }

    private static void mergesort(int[] v, int[] aux, int inicio, int fim) {
        if (fim - inicio <= 1) {
            return;
        }
        int meio = inicio + (fim - inicio) / 2;
        mergesort(v, aux, inicio, meio);
        mergesort(v, aux, meio, fim);
        merge(v, aux, inicio, meio, fim);
    }

    private static void merge(int[] v, int[] aux, int inicio, int meio, int fim) {
        int i = inicio, j = meio, k = inicio;
        while (i < meio && j < fim) {
            if (v[i] <= v[j]) {
                aux[k] = v[i];
                i++;
            } else {
                aux[k] = v[j];
                j++;
            }
            k++;
        }
        while (i < meio) {
            aux[k] = v[i];
            i++;
            k++;
        }
        while (j < fim) {
            aux[k] = v[j];
            j++;
            k++;
        }
        for (int p = inicio; p < fim; p++) {
            v[p] = aux[p];
        }
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        ordenar(v);
        System.out.println(Arrays.toString(v));
    }
}`;
  function emMerge(st) { return st.topo && st.topo.metodo === "merge"; }
  function faixasV(st, n) {
    var i0 = st.noTopo("inicio"), f = st.noTopo("fim"), m = st.noTopo("meio");
    if (i0 === undefined) return [];
    var fx = [{ de: 0, ate: i0, cls: " z-desc" }, { de: f, ate: n, cls: " z-desc" }];
    if (m === undefined) fx.push({ de: i0, ate: f, cls: " z-cand" });
    else { fx.push({ de: i0, ate: m, cls: " z-esq" }); fx.push({ de: m, ate: f, cls: " z-dir" }); }
    if (emMerge(st)) { var i = st.noTopo("i"), j = st.noTopo("j"); if (i !== undefined) fx.push({ de: i0, ate: i, cls: " z-desc" }); if (j !== undefined) fx.push({ de: m, ate: j, cls: " z-desc" }); }
    return fx;
  }
  function faixasAux(st, n) {
    if (!emMerge(st)) return [{ de: 0, ate: n, cls: " z-desc" }];
    var i0 = st.noTopo("inicio"), k = st.noTopo("k"), f = st.noTopo("fim");
    if (k === undefined) return [{ de: 0, ate: n, cls: " z-desc" }];
    return [{ de: 0, ate: i0, cls: " z-desc" }, { de: i0, ate: k, cls: " z-ord" }, { de: f, ate: n, cls: " z-desc" }];
  }
  var VIZ = [
    { tipo: "array", nome: "v", barras: true, rotulo: "v", ponteiros: [["i", "#215c7a", "topo"], ["j", "#bd711d", "topo"], ["p", "#6b4fa0", "topo"]], faixas: faixasV,
      nota: function (st) { var i0 = st.noTopo("inicio"), f = st.noTopo("fim"); return i0 === undefined ? "" : (emMerge(st) ? "intercalando [" + i0 + ", " + st.noTopo("meio") + ") com [" + st.noTopo("meio") + ", " + f + ")" : "chamada sobre [" + i0 + ", " + f + ")"); },
      legenda: [["", "metade esquerda (lida por i)", "#e2edf3"], ["", "metade direita (lida por j)", "#fdf1e0"], ["", "já copiado / fora da chamada", "#dfe6e8"]] },
    { tipo: "array", nome: "aux", rotulo: "aux (vetor auxiliar)", ponteiros: [["k", "#14674c", "topo"]], faixas: faixasAux, legenda: [["", "já escrito nesta intercalação", "#d7f4e5"]] },
    { tipo: "arvore", metodos: ["mergesort"], titulo: "divisões (chamadas de mergesort)", rotulo: function (c) { return "[" + arg(c, "inicio") + "," + arg(c, "fim") + ")"; }, largura: 70 }
  ];
  var DICAS = [
    { linha: /if \(fim - inicio <= 1\)/, texto: function (st) { var t = st.num("fim") - st.num("inicio"); return t <= 1 ? "**Caso base**: " + t + " elemento(s), já está ordenado." : "Intervalo com " + t + " elementos: divide ao meio."; } },
    { linha: /merge\(v, aux, inicio, meio, fim\);/, texto: function () { return "As duas metades voltaram **ordenadas**. Agora intercala."; } },
    { linha: /if \(v\[i\] <= v\[j\]\)/, texto: function (st) { var v = st.arr("v"), i = st.num("i"), j = st.num("j"); return "Compara os primeiros de cada metade: " + v[i] + " (esquerda) e " + v[j] + " (direita). O menor vai para aux[" + st.num("k") + "]." + (v[i] === v[j] ? " Empate: com <=, sai o da **esquerda** primeiro, e é isso que mantém a ordenação estável." : ""); } },
    { linha: /while \(i < meio\)/, texto: function (st) { return st.num("i") < st.num("meio") ? "A direita acabou: copia o que sobrou da esquerda." : ""; } },
    { linha: /while \(j < fim\)/, texto: function (st) { return st.num("j") < st.num("fim") ? "A esquerda acabou: copia o que sobrou da direita." : ""; } },
    { linha: /v\[p\] = aux\[p\]/, texto: function () { return "Copia o trecho intercalado de volta de aux para v."; } }
  ];
  function prog(metodos, main) { return "import java.util.Arrays;\n\npublic class Mergesort {\n" + metodos + "\n\n    public static void main(String[] args) {\n" + main + "\n    }\n}"; }
  var METODOS_BASE = MERGESORT.split("\n").slice(3, 44).join("\n");

  G.algoritmo({
    slug: "mergesort", titulo: "Mergesort", aula: "Aula 11", grupo: "Ordenação",
    resumo: "Divide o array ao meio até sobrar um elemento e **intercala** as metades já ordenadas. Sempre O(n log n), estável, mas precisa de um vetor auxiliar.",
    custos: [["todos os casos", "O(n log n)"], ["memória extra", "O(n)"], ["estável?", "sim"], ["níveis de recursão", "log n"]],
    ideia: String.raw`Duas pilhas de provas **já ordenadas** por nota viram uma só olhando apenas o topo de cada uma: tira o menor e repete. Isso é a **intercalação** (merge), e custa O(n).

O mergesort usa isso com divisão e conquista:
1. **Dividir** o intervalo [inicio, fim) em [inicio, meio) e [meio, fim);
2. **Resolver**: ordenar cada metade recursivamente (caso base: 0 ou 1 elemento);
3. **Combinar**: intercalar as duas metades ordenadas.

Na intercalação, três índices têm papéis fixos: «i» lê a esquerda, «j» lê a direita e «k» escreve no auxiliar. Nenhum deles volta. Quando uma metade acaba, o resto da outra é copiado. No fim, o trecho volta de «aux» para «v». O «aux» é criado **uma vez** e reaproveitado em todas as chamadas.

**Por que O(n log n)?** São log n níveis de divisão, e em cada nível todas as intercalações juntas mexem nos n elementos. Diferente do insertion sort, **não piora** com a entrada: é sempre n log n.`,
    pseudo: String.raw`MERGESORT(v, aux, inicio, fim)
    IF fim - inicio <= 1 THEN
        RETURN
    meio <- inicio + (fim - inicio) / 2
    MERGESORT(v, aux, inicio, meio)
    MERGESORT(v, aux, meio, fim)
    MERGE(v, aux, inicio, meio, fim)

MERGE(v, aux, inicio, meio, fim)
    i <- inicio; j <- meio; k <- inicio
    WHILE i < meio AND j < fim DO
        IF v[i] <= v[j] THEN
            aux[k] <- v[i]; i <- i + 1
        ELSE
            aux[k] <- v[j]; j <- j + 1
        k <- k + 1
    copia o resto da metade que sobrou
    FOR p <- inicio TO fim - 1 DO
        v[p] <- aux[p]`,
    invariante: String.raw`**Durante o merge, aux[inicio..k) contém, ordenados, os menores elementos das duas metades**, e são exatamente os que i e j já passaram. Como cada metade está ordenada, o próximo menor está sempre em v[i] ou em v[j].`,
    programas: [
      { id: "ms", nome: "Mergesort (aula 11)", codigo: MERGESORT, entradas: [{ nome: "v", tipo: "int[]", valor: "38, 27, 43, 3, 9, 82, 10" }],
        exemplos: [{ rotulo: "4 elementos", valores: { v: "8, 3, 5, 2" } }, { rotulo: "já ordenado", valores: { v: "1, 2, 3, 4, 5, 6" } }, { rotulo: "com repetidos", valores: { v: "5, 1, 5, 2, 1" } }, { rotulo: "o merge da aula", valores: { v: "2, 7, 9, 1, 5, 8" } }],
        viz: VIZ, dicas: DICAS,
        tabela: { quando: function (st, txt) { return /for \(int p = inicio/.test(txt) && st.passo.cond === false; }, colunas: [["intercalou", function (st) { return "[" + st.num("inicio") + ", " + st.num("meio") + ") + [" + st.num("meio") + ", " + st.num("fim") + ")"; }], ["v depois", "v"]] } }
    ],
    problemas: {
      resolve: String.raw`- ordenar com **garantia** de O(n log n), sem pior caso ruim (ao contrário do quicksort);
- ordenar **listas encadeadas** (o merge não precisa de acesso por índice);
- quando a ordenação precisa ser **estável** (ordenar alunos por nota mantendo a ordem alfabética dos empates);
- ordenação externa: dados maiores que a memória, ordenados em pedaços e intercalados;
- o **merge** sozinho resolve vários problemas: juntar listas ordenadas, contar inversões, união e interseção de conjuntos ordenados.`,
      classicos: [
        { nome: "Merge Sorted Array", onde: "LeetCode 88", ideia: "Intercalar dois arrays ordenados.", muda: "é **só o merge**, sem a recursão. Intercalando do fim para o começo, dá para fazer no próprio array." },
        { nome: "Merge Two Sorted Lists", onde: "LeetCode 21", ideia: "Intercalar duas listas encadeadas.", muda: "mesmo merge, trocando índices por ponteiros de nós." },
        { nome: "Sort List", onde: "LeetCode 148", ideia: "Ordenar uma lista encadeada em O(n log n).", muda: "acha o meio com dois ponteiros (lento e rápido), divide e intercala." },
        { nome: "Contar inversões", onde: "clássico / LeetCode 315", ideia: "Quantos pares i < j com v[i] > v[j].", muda: "no merge, quando sai um elemento da **direita**, ele é menor que todos os que sobram na esquerda: soma «meio - i» ao contador." },
        { nome: "Sort an Array", onde: "LeetCode 912", ideia: "Ordenar sem usar a biblioteca.", muda: "nada: é o mergesort da aula." },
        { nome: "Merge k Sorted Lists", onde: "LeetCode 23", ideia: "Intercalar k listas.", muda: "intercala as listas **de duas em duas**, como os níveis do mergesort: O(n log k)." }
      ]
    },
    variacoes: [
      { nome: "Ordem decrescente", curto: "decrescente", quando: "você quer do maior para o menor.",
        muda: String.raw`Só o merge muda: sai primeiro o **maior** dos dois. A comparação vira «v[i] >= v[j]» (o «=» continua preferindo a esquerda, para manter a estabilidade).`,
        codigo: prog(METODOS_BASE.replace("if (v[i] <= v[j])", "if (v[i] >= v[j])"), "        int[] v = {38, 27, 43, 3, 9, 82, 10};\n        ordenar(v);\n        System.out.println(Arrays.toString(v));") },
      { nome: "Contar inversões", curto: "inversões", quando: "a pergunta é quantos pares estão fora de ordem (similaridade entre rankings, por exemplo).",
        muda: String.raw`Um contador no merge: quando um elemento da **direita** sai antes, ele forma inversão com todos os que ainda restam na esquerda, que são «meio - i». O total sai em O(n log n), bem melhor que testar todos os pares em O(n²).`,
        codigo: prog(METODOS_BASE.replace("private static void merge(", "static long inversoes = 0;\n\n    private static void merge(").replace("                aux[k] = v[j];\n                j++;", "                aux[k] = v[j];\n                j++;\n                inversoes += meio - i;"), "        int[] v = {8, 3, 5, 2};\n        ordenar(v);\n        System.out.println(Arrays.toString(v) + \" inversoes=\" + inversoes);") },
      { nome: "Só o merge: juntar dois arrays ordenados", curto: "só o merge", quando: "os dados JÁ vêm em duas partes ordenadas (LeetCode 88).",
        muda: String.raw`Não precisa de recursão: a parte difícil já está feita. Os mesmos três índices e as mesmas cópias do resto, agora com arrays separados.`,
        codigo: String.raw`import java.util.Arrays;

public class Mergesort {
    public static int[] intercalar(int[] a, int[] b) {
        int[] r = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) {
            if (a[i] <= b[j]) {
                r[k] = a[i];
                i++;
            } else {
                r[k] = b[j];
                j++;
            }
            k++;
        }
        while (i < a.length) {
            r[k] = a[i];
            i++;
            k++;
        }
        while (j < b.length) {
            r[k] = b[j];
            j++;
            k++;
        }
        return r;
    }

    public static void main(String[] args) {
        int[] a = {2, 7, 9};
        int[] b = {1, 5, 8};
        System.out.println(Arrays.toString(intercalar(a, b)));
    }
}`, programa: { viz: [{ tipo: "array", nome: "a", ponteiros: [["i", "#215c7a", "topo"]] }, { tipo: "array", nome: "b", ponteiros: [["j", "#bd711d", "topo"]] }, { tipo: "array", nome: "r", rotulo: "r (resultado)", ponteiros: [["k", "#14674c", "topo"]] }] } }
    ],
    erros: [
      { erro: "Esquecer um dos laços do \"resto\"", curto: "sem copiar o resto", porque: "Quando a direita acaba primeiro, o que sobrou da esquerda nunca vai para o «aux». A cópia final traz lixo (zeros ou valores antigos) de volta para «v».",
        codigo: MERGESORT.replace("        while (i < meio) {\n            aux[k] = v[i];\n            i++;\n            k++;\n        }\n", "").replace("{{v}}", "{38, 27, 43, 3, 9, 82, 10}") },
      { erro: "Não copiar aux de volta para v", curto: "sem copiar de volta", porque: "O merge ordena dentro do «aux», mas as chamadas de cima olham «v». Sem o «for» final, cada nível trabalha com metades que **não** foram ordenadas.",
        codigo: MERGESORT.replace("        for (int p = inicio; p < fim; p++) {\n            v[p] = aux[p];\n        }\n", "").replace("{{v}}", "{8, 3, 5, 2}") },
      { erro: "Caso base com == 0", curto: "fim - inicio == 0", porque: "Um intervalo de 1 elemento divide em [i, i) e [i, i+1), e o segundo é igual ao original: recursão infinita, StackOverflowError. Precisa ser «<= 1».",
        codigo: MERGESORT.replace("if (fim - inicio <= 1)", "if (fim - inicio == 0)").replace("{{v}}", "{8, 3, 5, 2}") },
      { erro: "Criar aux dentro de cada chamada", porque: "Funciona, mas cria um array novo em cada merge: muito mais memória alocada e mais lento. A aula cria «aux» uma vez em «ordenar» e reaproveita." }
    ],
    perguntas: [
      { g: "conceito", p: "Quais as três etapas de divisão e conquista no mergesort?", r: "**Dividir** o intervalo ao meio; **resolver** (ordenar) cada metade recursivamente; **combinar**, intercalando as duas metades ordenadas." },
      { g: "conceito", p: "Por que o mergesort é O(n log n) em todos os casos?", r: "Há log n níveis de divisão, e em cada nível as intercalações juntas passam pelos n elementos. A divisão é sempre pelo meio, independente dos valores, por isso não há pior caso diferente." },
      { g: "conceito", p: "Qual a desvantagem do mergesort em relação ao quicksort e ao insertion sort?", r: "Precisa de **memória extra O(n)** (o vetor auxiliar). Os outros dois ordenam no próprio array." },
      { g: "conceito", p: "O mergesort é estável? O que garante isso?", r: "Sim, graças ao «<=» no merge: em empate, sai primeiro o elemento da **esquerda**, que vinha antes no array original." },
      { g: "codigo", p: "Quais os papéis de i, j e k no merge?", r: "«i» lê a metade esquerda [inicio, meio), «j» lê a direita [meio, fim) e «k» escreve no «aux». Todos só andam para frente." },
      { g: "codigo", p: "Por que existem dois laços depois do laço principal do merge?", r: "O laço principal para quando **uma** das metades acaba. O que sobrou da outra (já ordenado e maior que tudo que saiu) precisa ser copiado. Só um dos dois laços executa de fato." },
      { g: "codigo", p: "Por que o caso base é «fim - inicio <= 1»?", r: "Intervalos com 0 ou 1 elemento já estão ordenados. Com «== 0», um intervalo de 1 elemento seria dividido em [i,i) e [i,i+1), igual ao original: recursão infinita." },
      { g: "variacao", p: "Como contar inversões aproveitando o merge?", r: "Quando sai um elemento da direita (v[j] < v[i]), ele é menor que todos os «meio - i» que ainda restam na esquerda: some «meio - i»." },
      { g: "variacao", p: "Os dados chegam em dois arrays já ordenados. Precisa do mergesort inteiro?", r: "Não, só do **merge**: três índices e as cópias do resto, O(n + m)." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Ordem das intercalações", enunciado: "O programa imprime o intervalo [inicio, fim) de cada **merge**, na ordem em que acontecem. O que ele imprime?",
        codigo: String.raw`public class OrdemMerge {
    static void ms(int inicio, int fim) {
        if (fim - inicio <= 1) {
            return;
        }
        int meio = inicio + (fim - inicio) / 2;
        ms(inicio, meio);
        ms(meio, fim);
        System.out.println(inicio + "-" + fim);
    }
    public static void main(String[] args) {
        ms(0, 5);
    }
}`, formato: "ex.: 0-2 2-4 …", explicacao: "A esquerda termina inteira antes da direita começar: [0,2), depois [3,5) dentro de [2,5), depois [2,5) e por fim [0,5).",
        viz: [{ tipo: "arvore", metodos: ["ms"], rotulo: function (c) { return "[" + arg(c, "inicio") + "," + arg(c, "fim") + ")"; } }] },
      { tipo: "rastreio", titulo: "Intercalação", enunciado: "Qual o conteúdo de «r» depois de intercalar a = {1, 4, 9} e b = {2, 3, 10, 12}? E quantas comparações o laço principal fez? (o programa imprime os dois)",
        codigo: String.raw`import java.util.Arrays;
public class Inter {
    public static void main(String[] args) {
        int[] a = {1, 4, 9}, b = {2, 3, 10, 12};
        int[] r = new int[7];
        int i = 0, j = 0, k = 0, comp = 0;
        while (i < a.length && j < b.length) {
            comp++;
            if (a[i] <= b[j]) {
                r[k++] = a[i++];
            } else {
                r[k++] = b[j++];
            }
        }
        while (i < a.length) r[k++] = a[i++];
        while (j < b.length) r[k++] = b[j++];
        System.out.println(Arrays.toString(r) + " " + comp);
    }
}`, formato: "[...] comparações", explicacao: "5 comparações: 1<2, 4>2, 4>3, 4<10, 9<10. Aí a acabou e o resto de b (10, 12) é copiado sem comparar.",
        viz: [{ tipo: "array", nome: "a", ponteiros: [["i", "#215c7a"]] }, { tipo: "array", nome: "b", ponteiros: [["j", "#bd711d"]] }, { tipo: "array", nome: "r", ponteiros: [["k", "#14674c"]] }] },
      { tipo: "completar", titulo: "Complete o merge", enunciado: "Complete o laço principal da intercalação.",
        modelo: String.raw`    public static int[] intercalar(int[] a, int[] b) {
        int[] r = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (⟦⟧ && ⟦⟧) {
            if (a[i] <= b[j]) {
                r[k] = a[i];
                ⟦⟧;
            } else {
                r[k] = b[j];
                j++;
            }
            ⟦⟧;
        }
        while (i < a.length) { r[k] = a[i]; i++; k++; }
        while (j < b.length) { r[k] = b[j]; j++; k++; }
        return r;
    }`, gabarito: ["i < a.length", "j < b.length", "i++", "k++"],
        solucao: String.raw`    public static int[] intercalar(int[] a, int[] b) {
        int[] r = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) {
            if (a[i] <= b[j]) {
                r[k] = a[i];
                i++;
            } else {
                r[k] = b[j];
                j++;
            }
            k++;
        }
        while (i < a.length) { r[k] = a[i]; i++; k++; }
        while (j < b.length) { r[k] = b[j]; j++; k++; }
        return r;
    }`,
        testes: [{ expr: "Arrays.toString(intercalar(new int[] {2, 7, 9}, new int[] {1, 5, 8}))" }, { expr: "Arrays.toString(intercalar(new int[] {}, new int[] {1, 2}))" }, { expr: "Arrays.toString(intercalar(new int[] {1, 1}, new int[] {1}))" }, { expr: "Arrays.toString(intercalar(new int[] {5, 6}, new int[] {1, 2, 3}))" }] },
      { tipo: "escrever", titulo: "Mergesort completo", enunciado: "Escreva «mergesort(int[] v, int[] aux, int inicio, int fim)» e «merge(...)» para ordenar «v[inicio..fim)». O teste chama «mergesort(v, new int[v.length], 0, v.length)».",
        inicial: "    static void mergesort(int[] v, int[] aux, int inicio, int fim) {\n        \n    }\n\n    static void merge(int[] v, int[] aux, int inicio, int meio, int fim) {\n        \n    }",
        solucao: METODOS_BASE.replace("private static void mergesort", "static void mergesort").replace("private static void merge", "static void merge").split("\n").slice(5).join("\n"),
        testes: [{ codigo: "int[] v = {38, 27, 43, 3, 9, 82, 10}; mergesort(v, new int[v.length], 0, v.length); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {1}; mergesort(v, new int[1], 0, 1); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {5, 5, 1, 1, 3}; mergesort(v, new int[5], 0, 5); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {9, 8, 7, 6, 5, 4, 3, 2}; mergesort(v, new int[8], 0, 8); System.out.println(Arrays.toString(v));" }],
        dica: "Siga o pseudocódigo: caso base fim - inicio <= 1; no merge, i, j, k; dois laços para o resto; copie aux de volta.", viz: VIZ },
      { tipo: "escolha", titulo: "Memória", enunciado: "Qual algoritmo precisa de O(n) de memória extra para ordenar?", alternativas: ["mergesort", "insertion sort", "quicksort (versão da aula)", "busca binária"], correta: 0, explicacao: "O mergesort intercala num vetor auxiliar do tamanho do array. Insertion e quicksort ordenam no próprio array." },
      { tipo: "escolha", titulo: "Pior caso", enunciado: "Qual o custo do mergesort para um array que já está **em ordem inversa**?", alternativas: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correta: 0, explicacao: "A divisão não depende dos valores: sempre log n níveis com O(n) de trabalho cada." }
    ]
  });
})();
