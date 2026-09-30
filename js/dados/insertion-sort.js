(function () {
  var G = window.Guia;
  var INSERTION = String.raw`import java.util.Arrays;

public class InsertionSort {
    public static void ordenar(int[] v) {
        for (int i = 1; i < v.length; i++) {
            int chave = v[i];
            int j = i - 1;
            while (j >= 0 && v[j] > chave) {
                v[j + 1] = v[j];
                j = j - 1;
            }
            v[j + 1] = chave;
        }
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        ordenar(v);
        System.out.println(Arrays.toString(v));
    }
}`;
  function faixas(st, n) { var i = st.noTopo("i"); if (i === undefined) return []; return [{ de: 0, ate: i, cls: " z-ord" }]; }
  function extra(st) { var c = st.noTopo("chave"); return c === undefined ? "" : '<span class="chave-flut">chave (fora do array): <b>' + c + "</b></span>"; }
  var VIZ = [{ tipo: "array", nome: "v", barras: true, ponteiros: [["i", "#6b4fa0", "topo"], ["j", "#e0392b", "topo"]], faixas: faixas, extra: extra, legenda: [["", "prefixo já ordenado v[0..i)", "#d7f4e5"]] }];
  var DICAS = [
    { linha: /int chave = v\[i\]/, texto: function (st) { return "Tira o " + st.num("chave") + " do array e segura na mão. Agora é abrir espaço para ele no prefixo ordenado."; } },
    { linha: /while \(j >= 0 && v\[j\] > chave\)/, texto: function (st) { var j = st.num("j"); if (j < 0) return "j = -1: passou do começo do array. A chave vai para a posição 0."; var v = st.arr("v"); return v[j] > st.num("chave") ? v[j] + " > chave: " + v[j] + " precisa deslizar para a direita." : v[j] + " ≤ chave: achou o lugar, logo depois do " + v[j] + "."; } },
    { linha: /v\[j \+ 1\] = v\[j\]/, texto: function () { return "Desloca: a posição j + 1 recebe uma cópia de v[j]. Por um instante o valor aparece duplicado, e a chave vai ocupar o buraco depois."; } },
    { linha: /v\[j \+ 1\] = chave/, texto: function (st) { return "Coloca a chave na posição livre, j + 1 = " + (st.num("j") + 1) + ". O prefixo ordenado cresceu uma posição."; } }
  ];
  function prog(metodo, main) { return "import java.util.Arrays;\n\npublic class InsertionSort {\n" + metodo + "\n\n    public static void main(String[] args) {\n" + main + "\n    }\n}"; }

  G.algoritmo({
    slug: "insertion-sort", titulo: "Insertion sort", aula: "Aula 11", grupo: "Ordenação",
    resumo: "Como arrumar cartas na mão: mantém um **prefixo ordenado** e insere cada novo elemento no lugar certo, deslocando os maiores para a direita.",
    custos: [["melhor caso (ordenado)", "O(n)"], ["pior caso (invertido)", "O(n²)"], ["memória", "O(1)"], ["estável?", "sim"]],
    ideia: String.raw`Você pega uma carta nova e a encaixa entre as que já estavam ordenadas, empurrando as maiores para a direita. O insertion sort faz isso da esquerda para a direita:

{8 | 3, 5, 2} → insere 3 → {3, 8 | 5, 2} → insere 5 → {3, 5, 8 | 2} → insere 2 → {2, 3, 5, 8}

A cada volta, o elemento «v[i]» sai do array e vira a **chave**. O índice «j» anda para a esquerda, e cada elemento maior que a chave **desliza uma posição para a direita**. Quando aparece alguém menor ou igual (ou o array acaba), a chave entra na posição livre, «j + 1».

**Custo**: se o array já está ordenado, cada chave fica onde está e só há uma comparação por volta: O(n). Se está invertido, cada chave atravessa o prefixo inteiro: 1 + 2 + … + (n − 1) deslocamentos, O(n²). Ordena **no próprio array** (O(1) de memória extra) e é **estável**: com «v[j] > chave» (e não «>=»), iguais nunca trocam de ordem.`,
    pseudo: String.raw`INSERTION-SORT(v)
    FOR i <- 1 TO v.length - 1
        chave <- v[i]
        j <- i - 1
        WHILE j >= 0 AND v[j] > chave DO
            v[j + 1] <- v[j]
            j <- j - 1
        v[j + 1] <- chave`,
    invariante: String.raw`**No início de cada volta com índice i, v[0..i-1] está ordenado.** A volta insere v[i] nesse prefixo mantendo a ordem. Quando i passa do fim, o prefixo ordenado é o array inteiro.`,
    programas: [
      { id: "ins", nome: "Insertion sort (aula 11)", codigo: INSERTION, entradas: [{ nome: "v", tipo: "int[]", valor: "8, 3, 5, 2" }],
        exemplos: [{ rotulo: "já ordenado (melhor caso)", valores: { v: "2, 3, 5, 8" } }, { rotulo: "invertido (pior caso)", valores: { v: "8, 5, 3, 2" } }, { rotulo: "com repetidos", valores: { v: "5, 2, 5, 1, 2" } }, { rotulo: "7 elementos", valores: { v: "38, 27, 43, 3, 9, 82, 10" } }],
        viz: VIZ, dicas: DICAS,
        tabela: { quando: "v[j + 1] = chave", colunas: [["i", "i"], ["chave", "chave"], ["entrou na posição", function (st) { return st.num("j") + 1; }], ["array depois", "v"]] } }
    ],
    problemas: {
      resolve: String.raw`- ordenar **arrays pequenos** (muitas bibliotecas usam insertion sort abaixo de ~16 elementos, dentro de algoritmos híbridos);
- ordenar dados **quase ordenados**: poucos deslocamentos, perto de O(n);
- manter uma coleção ordenada enquanto os dados **chegam um a um** (inserir cada novo na posição certa);
- contar quantos deslocamentos são necessários (mede o quão "desordenado" um array está: o número de inversões).`,
      classicos: [
        { nome: "Insertion Sort List", onde: "LeetCode 147", ideia: "Ordenar uma lista encadeada com insertion sort.", muda: "em vez de deslocar, **reaponta** o nó para a posição certa numa lista resultado." },
        { nome: "Merge Sorted Array", onde: "LeetCode 88", ideia: "Juntar dois arrays ordenados dentro do primeiro.", muda: "desloca **de trás para frente**, escolhendo o maior dos dois finais, igual ao deslocamento do insertion sort." },
        { nome: "Sort Colors", onde: "LeetCode 75", ideia: "Ordenar 0s, 1s e 2s.", muda: "insertion sort resolve, mas a partição de 3 vias (do quicksort) faz em uma passada." },
        { nome: "Contar inversões", onde: "clássico", ideia: "Quantos pares estão fora de ordem.", muda: "é exatamente o **número de deslocamentos** do insertion sort: basta contar cada «v[j + 1] = v[j]»." },
        { nome: "Relative Sort / top-k em fluxo", onde: "variações", ideia: "Manter os k maiores enquanto os dados chegam.", muda: "insere cada novo valor num array pequeno ordenado e descarta o excedente." }
      ]
    },
    variacoes: [
      { nome: "Ordem decrescente", curto: "decrescente", quando: "você quer do maior para o menor.",
        muda: String.raw`Só a comparação do «while» muda: desliza enquanto «v[j] < chave». Os **menores** vão para a direita, e a chave para quando encontra alguém maior ou igual.`,
        codigo: prog(String.raw`    public static void ordenar(int[] v) {
        for (int i = 1; i < v.length; i++) {
            int chave = v[i];
            int j = i - 1;
            while (j >= 0 && v[j] < chave) {
                v[j + 1] = v[j];
                j = j - 1;
            }
            v[j + 1] = chave;
        }
    }`, "        int[] v = {8, 3, 5, 2};\n        ordenar(v);\n        System.out.println(Arrays.toString(v));") },
      { nome: "Contar deslocamentos (inversões)", curto: "contar deslocamentos", quando: "a pergunta é \"quão desordenado está?\" ou \"quantas trocas de vizinhos seriam necessárias?\".",
        muda: String.raw`Um contador a mais, incrementado a cada deslocamento. O total é o número de **inversões**: pares (i, j) com i < j e v[i] > v[j].`,
        codigo: prog(String.raw`    public static int ordenar(int[] v) {
        int deslocamentos = 0;
        for (int i = 1; i < v.length; i++) {
            int chave = v[i];
            int j = i - 1;
            while (j >= 0 && v[j] > chave) {
                v[j + 1] = v[j];
                j = j - 1;
                deslocamentos++;
            }
            v[j + 1] = chave;
        }
        return deslocamentos;
    }`, "        int[] v = {8, 3, 5, 2};\n        System.out.println(ordenar(v));\n        System.out.println(Arrays.toString(v));") },
      { nome: "Ordenar Strings", curto: "Strings", quando: "os dados são nomes ou palavras.",
        muda: String.raw`O tipo vira «String[]» e a comparação «v[j] > chave» vira «v[j].compareTo(chave) > 0». O «compareTo» devolve negativo, zero ou positivo, comparando pela ordem dos caracteres.`,
        codigo: prog(String.raw`    public static void ordenar(String[] v) {
        for (int i = 1; i < v.length; i++) {
            String chave = v[i];
            int j = i - 1;
            while (j >= 0 && v[j].compareTo(chave) > 0) {
                v[j + 1] = v[j];
                j = j - 1;
            }
            v[j + 1] = chave;
        }
    }`, "        String[] v = {\"caio\", \"ana\", \"duda\", \"bia\"};\n        ordenar(v);\n        System.out.println(Arrays.toString(v));"),
        programa: { viz: [{ tipo: "array", nome: "v", ponteiros: [["i", "#6b4fa0", "topo"], ["j", "#e0392b", "topo"]], faixas: faixas }] } }
    ],
    erros: [
      { erro: "Condições do while na ordem errada", curto: "v[j] > chave && j >= 0", porque: "«v[j] > chave && j >= 0» avalia «v[j]» **antes** de conferir se j ainda é válido. Quando j chega a -1: ArrayIndexOutOfBoundsException. No «&&», a ordem importa: o teste de limite vem primeiro.",
        codigo: INSERTION.replace("while (j >= 0 && v[j] > chave)", "while (v[j] > chave && j >= 0)").replace("{{v}}", "{8, 3, 5, 2}") },
      { erro: "Colocar a chave em j, e não em j + 1", curto: "v[j] = chave", porque: "Quando o while para, j aponta para o elemento **menor** que a chave (ou -1). O lugar livre é j + 1. Com «v[j] = chave» sobrescreve um elemento bom e, se j = -1, dá exceção.",
        codigo: INSERTION.replace("            v[j + 1] = chave;", "            v[j] = chave;").replace("{{v}}", "{8, 3, 5, 2}") },
      { erro: "Esquecer de guardar a chave", curto: "sem chave", porque: "Sem copiar «v[i]» para «chave» antes, o primeiro deslocamento sobrescreve «v[i]» e o valor original se perde. O array termina com valores duplicados.",
        codigo: INSERTION.replace("            int chave = v[i];\n", "").replace("v[j] > chave", "v[j] > v[i]").replace("            v[j + 1] = chave;", "            v[j + 1] = v[i];").replace("{{v}}", "{8, 3, 5, 2}") },
      { erro: "Usar >= e perder a estabilidade", porque: "Com «v[j] >= chave», elementos iguais também deslizam, e dois 5 trocam de ordem. Para números não se vê a diferença, mas ao ordenar alunos por nota, dois com a mesma nota invertem a ordem original." }
    ],
    perguntas: [
      { g: "conceito", p: "Qual é o invariante do insertion sort?", r: "No início da volta com índice i, **v[0..i-1] está ordenado**. A volta insere v[i] nesse prefixo. No fim, o prefixo é o array todo." },
      { g: "conceito", p: "Por que o melhor caso é O(n) e o pior é O(n²)? Dê um exemplo de cada.", r: "Ordenado {2, 3, 5, 8}: cada chave compara uma vez e fica, n − 1 comparações. Invertido {8, 5, 3, 2}: a chave i atravessa i posições, 1 + 2 + … + (n−1) ≈ n²/2 deslocamentos." },
      { g: "conceito", p: "O que é uma ordenação estável, e por que o insertion sort é estável?", r: "Estável: elementos **iguais** mantêm a ordem relativa original. O insertion sort só desloca quando «v[j] > chave» (estritamente maior), então nunca passa um igual para trás." },
      { g: "conceito", p: "Quando o insertion sort é uma boa escolha, mesmo sendo O(n²)?", r: "Em arrays **pequenos** e **quase ordenados**, e como parte de algoritmos híbridos (o Timsort do Java e do Python usa insertion sort em pedaços pequenos)." },
      { g: "codigo", p: "Por que a chave vai para «j + 1», e não para «j»?", r: "O while para quando «v[j] <= chave» (ou j = -1). A chave precisa ficar **depois** desse elemento, e o espaço livre, aberto pelos deslocamentos, é j + 1." },
      { g: "codigo", p: "Por que «j >= 0» precisa vir antes de «v[j] > chave» no while?", r: "O «&&» avalia da esquerda para a direita e para no primeiro falso. Com j = -1, «j >= 0» já é falso e «v[-1]» nunca é lido. Na ordem inversa, dá ArrayIndexOutOfBoundsException." },
      { g: "codigo", p: "Durante um deslocamento, o array fica momentaneamente com um valor duplicado. Isso é um problema?", r: "Não: a chave está guardada numa variável. A posição duplicada é o \"buraco\" que vai receber o próximo deslocado, ou a própria chave no fim." },
      { g: "variacao", p: "O que muda para ordenar em ordem decrescente?", r: "Só a comparação do while: «v[j] < chave». Os menores deslizam para a direita." },
      { g: "variacao", p: "Como contar o número de inversões de um array usando o insertion sort?", r: "Conte os deslocamentos («v[j + 1] = v[j]»): cada um desfaz exatamente uma inversão." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "O array depois de cada volta", enunciado: "O programa imprime o array ao **fim de cada volta** do for externo. O que aparece? (as linhas na ordem)",
        codigo: String.raw`import java.util.Arrays;
public class Voltas {
    public static void main(String[] args) {
        int[] v = {5, 2, 4, 1};
        for (int i = 1; i < v.length; i++) {
            int chave = v[i];
            int j = i - 1;
            while (j >= 0 && v[j] > chave) {
                v[j + 1] = v[j];
                j--;
            }
            v[j + 1] = chave;
            System.out.println(Arrays.toString(v));
        }
    }
}`, formato: "[..] [..] [..]", explicacao: "Volta 1 insere o 2: [2, 5, 4, 1]. Volta 2 insere o 4: [2, 4, 5, 1]. Volta 3 insere o 1, que atravessa tudo: [1, 2, 4, 5].", viz: VIZ },
      { tipo: "rastreio", titulo: "Quantos deslocamentos?", enunciado: "Quantas vezes a linha «v[j + 1] = v[j]» executa para ordenar {3, 1, 2}? (o programa conta)",
        codigo: String.raw`public class Desloc {
    public static void main(String[] args) {
        int[] v = {3, 1, 2};
        int d = 0;
        for (int i = 1; i < v.length; i++) {
            int chave = v[i];
            int j = i - 1;
            while (j >= 0 && v[j] > chave) {
                v[j + 1] = v[j];
                j--;
                d++;
            }
            v[j + 1] = chave;
        }
        System.out.println(d);
    }
}`, formato: "número", explicacao: "Inserir o 1 desloca o 3 (1). Inserir o 2 desloca o 3 de novo (2). Total 2: {3, 1, 2} tem duas inversões, (3,1) e (3,2).", viz: VIZ },
      { tipo: "completar", titulo: "Complete o insertion sort", enunciado: "Complete as lacunas.",
        modelo: String.raw`    public static void ordenar(int[] v) {
        for (int i = ⟦⟧; i < v.length; i++) {
            int chave = v[i];
            int j = ⟦⟧;
            while (⟦⟧ && v[j] > chave) {
                v[j + 1] = ⟦⟧;
                j = j - 1;
            }
            ⟦⟧ = chave;
        }
    }`, gabarito: ["1", "i - 1", "j >= 0", "v[j]", "v[j + 1]"],
        solucao: INSERTION.split("\n").slice(3, 14).join("\n"),
        testes: [{ codigo: "int[] v = {8, 3, 5, 2}; ordenar(v); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {1}; ordenar(v); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {5, 4, 3, 2, 1}; ordenar(v); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {2, 2, 1, 1}; ordenar(v); System.out.println(Arrays.toString(v));" }] },
      { tipo: "escrever", titulo: "Inserir num array ordenado", enunciado: "«v» tem «n» elementos ordenados nas primeiras posições e espaço livre depois. Escreva «inserir(int[] v, int n, int x)», que coloca «x» mantendo a ordem (é uma volta do insertion sort).",
        inicial: "    public static void inserir(int[] v, int n, int x) {\n        // v[0..n) está ordenado e v.length > n\n    }",
        solucao: String.raw`    public static void inserir(int[] v, int n, int x) {
        int j = n - 1;
        while (j >= 0 && v[j] > x) {
            v[j + 1] = v[j];
            j--;
        }
        v[j + 1] = x;
    }`,
        testes: [{ codigo: "int[] v = {2, 5, 8, 0}; inserir(v, 3, 6); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {2, 5, 8, 0}; inserir(v, 3, 1); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {2, 5, 8, 0}; inserir(v, 3, 9); System.out.println(Arrays.toString(v));" }, { codigo: "int[] v = {0}; inserir(v, 0, 4); System.out.println(Arrays.toString(v));" }],
        dica: "Comece com j = n - 1 e desloque para a direita enquanto v[j] > x.", viz: [{ tipo: "array", nome: "v", ponteiros: [["j", "#e0392b", "topo"]] }] },
      { tipo: "escolha", titulo: "Melhor caso", enunciado: "Para qual entrada o insertion sort faz **menos** trabalho?", alternativas: ["{1, 2, 3, 4, 5}", "{5, 4, 3, 2, 1}", "{3, 1, 4, 5, 2}", "tanto faz, é sempre O(n²)"], correta: 0, explicacao: "Já ordenado: cada chave compara uma vez e fica, O(n)." },
      { tipo: "escolha", titulo: "Estabilidade", enunciado: "O que acontece se trocarmos «v[j] > chave» por «v[j] >= chave»?", alternativas: ["continua ordenando, mas deixa de ser estável", "para de ordenar", "fica O(n) sempre", "dá exceção para repetidos"], correta: 0, explicacao: "Iguais também deslizam, então a ordem original entre eles se inverte. A ordenação continua correta." }
    ]
  });
})();
