(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };

  var MAXIMO = String.raw`public class MaximoDivisao {
    public static int maximo(int[] v) {
        if (v.length == 0) {
            throw new IllegalArgumentException("array vazio");
        }
        return maximoIntervalo(v, 0, v.length);
    }

    private static int maximoIntervalo(int[] v, int inicio, int fim) {
        if (fim - inicio == 1) {
            return v[inicio];
        }
        int meio = inicio + (fim - inicio) / 2;
        int maxEsq = maximoIntervalo(v, inicio, meio);
        int maxDir = maximoIntervalo(v, meio, fim);
        if (maxEsq > maxDir) {
            return maxEsq;
        }
        return maxDir;
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        System.out.println(maximo(v));
    }
}`;
  // intervalo [inicio, fim) da chamada atual; as metades quando o meio já existe
  function faixas(st, n) {
    var i = st.noTopo("inicio"), f = st.noTopo("fim"), m = st.noTopo("meio");
    if (i === undefined) return [];
    var fx = [{ de: 0, ate: i, cls: " z-desc" }, { de: f, ate: n, cls: " z-desc" }];
    if (m === undefined) fx.push({ de: i, ate: f, cls: " z-cand" });
    else { fx.push({ de: i, ate: m, cls: " z-esq" }); fx.push({ de: m, ate: f, cls: " z-dir" }); }
    return fx;
  }
  var VIZ = [{ tipo: "array", nome: "v", ponteiros: [["inicio", "#14674c", "topo"], ["meio", "#e0392b", "topo"]], faixas: faixas, nota: function (st) { var i = st.noTopo("inicio"), f = st.noTopo("fim"); return i === undefined ? "" : "intervalo atual [" + i + ", " + f + ")"; },
    legenda: [["", "intervalo desta chamada", "#e3f1ea"], ["", "metade esquerda", "#e2edf3"], ["", "metade direita", "#fdf1e0"]] },
    { tipo: "arvore", metodos: ["maximoIntervalo"], titulo: "árvore de chamadas", rotulo: function (c) { return "max[" + arg(c, "inicio") + "," + arg(c, "fim") + ")"; } }];
  var DICAS = [
    { linha: /if \(fim - inicio == 1\)/, texto: function (st) { return st.num("fim") - st.num("inicio") === 1 ? "**Caso base**: um único elemento, ele mesmo é o máximo." : "O intervalo tem " + (st.num("fim") - st.num("inicio")) + " elementos: **divide**."; } },
    { linha: /int maxEsq/, texto: function (st) { return st.passo.voltou !== undefined ? "A metade esquerda devolveu " + st.num("maxEsq") + "." : ""; } },
    { linha: /int maxDir/, texto: function (st) { return st.passo.voltou !== undefined ? "A metade direita devolveu " + st.num("maxDir") + ". Agora **combina**." : ""; } },
    { linha: /if \(maxEsq > maxDir\)/, texto: function (st) { return "**Combinar**: o maior entre " + st.num("maxEsq") + " e " + st.num("maxDir") + "."; } }
  ];

  function prog(corpo, main) { return "public class MaximoDivisao {\n" + corpo + "\n\n    public static void main(String[] args) {\n" + main + "\n    }\n}"; }

  G.algoritmo({
    slug: "divisao-e-conquista", titulo: "Divisão e conquista", aula: "Aula 09", grupo: "Recursão",
    resumo: "**Dividir** o problema em partes, **resolver** cada parte (recursivamente) e **combinar** as respostas. O padrão por trás do mergesort, do quicksort e da busca binária.",
    custos: [["máximo por metades", "O(n)"], ["altura da árvore", "O(log n)"], ["chamadas", "2n − 1"]],
    ideia: String.raw`Para achar o maior valor de um array, um laço resolve. Mas dá para pensar diferente: **o máximo do array é o maior entre o máximo da metade esquerda e o máximo da metade direita**. Cada metade se resolve do mesmo jeito, até sobrar um único elemento, que é o máximo de si mesmo.

Três perguntas guiam todo algoritmo de divisão e conquista:
1. **Como dividir?** Em duas metades pelo meio.
2. **Como resolver os subproblemas?** Recursivamente, confiando que a chamada devolve o máximo da sua metade.
3. **Como combinar?** Escolhendo o maior dos dois.

E, claro, um **caso base**: intervalo com um elemento.

A aula usa **intervalo aberto no fim**, «[inicio, fim)»: «inicio» entra e «fim» não. O array inteiro é «[0, v.length)», o tamanho é «fim - inicio», e as metades «[inicio, meio)» e «[meio, fim)» não se sobrepõem. É a mesma convenção do mergesort.

Para o máximo, isso **não** fica mais rápido que o laço (continua O(n)). Mas o padrão é o que importa: no mergesort, a combinação é esperta, e o resultado vira O(n log n).`,
    pseudo: String.raw`MAXIMO(v)
    IF TAMANHO(v) = 0 THEN
        ERRO "array vazio"
    RETURN MAXIMO-INTERVALO(v, 0, TAMANHO(v))

MAXIMO-INTERVALO(v, inicio, fim)
    IF fim - inicio = 1 THEN
        RETURN v[inicio]
    meio <- inicio + (fim - inicio) / 2
    maxEsq <- MAXIMO-INTERVALO(v, inicio, meio)
    maxDir <- MAXIMO-INTERVALO(v, meio, fim)
    IF maxEsq > maxDir THEN
        RETURN maxEsq
    RETURN maxDir`,
    invariante: String.raw`**Cada chamada «maximoIntervalo(v, inicio, fim)» devolve o maior valor de v[inicio..fim).** O caso base garante isso para um elemento; a combinação garante para o resto, se as duas chamadas menores garantirem.`,
    programas: [
      { id: "max", nome: "Máximo por metades", codigo: MAXIMO, entradas: [{ nome: "v", tipo: "int[]", valor: "8, 3, 12, 5" }],
        exemplos: [{ rotulo: "5 elementos (divisão desigual)", valores: { v: "8, 3, 12, 5, 9" } }, { rotulo: "8 elementos", valores: { v: "4, 17, 2, 9, 30, 11, 6, 21" } }, { rotulo: "1 elemento", valores: { v: "7" } }, { rotulo: "vazio (exceção)", valores: { v: "" }, erro: true }],
        viz: VIZ, dicas: DICAS,
        tabela: { quando: "if (maxEsq > maxDir)", colunas: [["intervalo", function (st) { return "[" + st.num("inicio") + ", " + st.num("fim") + ")"; }], ["maxEsq", "maxEsq"], ["maxDir", "maxDir"], ["devolve", function (st) { return Math.max(st.num("maxEsq"), st.num("maxDir")); }]] } }
    ],
    problemas: {
      resolve: String.raw`Problemas em que a resposta do todo **se monta a partir das respostas das partes**:
- agregar um array: máximo, mínimo, soma, contagem (didático: fica O(n) como um laço);
- **ordenar**: mergesort (combinar = intercalar) e quicksort (dividir = particionar);
- **buscar**: a busca binária é divisão e conquista em que um dos lados é descartado;
- potência rápida, contar inversões, subarray de soma máxima, pares mais próximos.`,
      classicos: [
        { nome: "Maximum Subarray", onde: "LeetCode 53", ideia: "O trecho contíguo de maior soma.", muda: "a combinação é o truque: a melhor resposta está à esquerda, à direita **ou cruzando o meio** (calcula a melhor soma que atravessa)." },
        { nome: "Majority Element", onde: "LeetCode 169", ideia: "O valor que aparece mais de n/2 vezes.", muda: "combina assim: se as duas metades concordam, é esse; senão, conta os dois candidatos no intervalo." },
        { nome: "Sort an Array", onde: "LeetCode 912", ideia: "Ordenar em O(n log n).", muda: "mergesort: o \"combinar\" vira **intercalar** duas metades ordenadas." },
        { nome: "Contar inversões", onde: "clássico", ideia: "Quantos pares i < j com v[i] > v[j]?", muda: "dentro do merge, quando um elemento da direita passa na frente, ele \"inverte\" com todos os que sobram na esquerda: soma «meio - i»." },
        { nome: "Pow(x, n)", onde: "LeetCode 50", ideia: "xⁿ rápido.", muda: "divide o expoente por 2 e combina elevando ao quadrado. Só um subproblema: O(log n)." },
        { nome: "Kth Largest Element", onde: "LeetCode 215", ideia: "O k-ésimo maior sem ordenar tudo.", muda: "quickselect: particiona e continua **só no lado** onde está a posição k." }
      ]
    },
    variacoes: [
      { nome: "Soma por metades", curto: "soma", quando: "o problema é agregar com outra operação.",
        muda: String.raw`Mesma divisão, outra **combinação**: soma os resultados em vez de escolher o maior. Aparece também o caso do intervalo **vazio** («inicio == fim» devolve 0), que aqui faz sentido, ao contrário do máximo.`,
        codigo: prog(String.raw`    public static int soma(int[] v) {
        return somaIntervalo(v, 0, v.length);
    }

    private static int somaIntervalo(int[] v, int inicio, int fim) {
        if (inicio == fim) {
            return 0;
        }
        if (fim - inicio == 1) {
            return v[inicio];
        }
        int meio = inicio + (fim - inicio) / 2;
        return somaIntervalo(v, inicio, meio)
            + somaIntervalo(v, meio, fim);
    }`, "        int[] v = {8, 3, 12, 5};\n        System.out.println(soma(v));"),
        programa: { viz: [VIZ[0], { tipo: "arvore", metodos: ["somaIntervalo"], rotulo: function (c) { return "soma[" + arg(c, "inicio") + "," + arg(c, "fim") + ")"; } }] } },
      { nome: "Contar ocorrências por metades", curto: "contar", quando: "quer contar quantas vezes um valor aparece.",
        muda: String.raw`O caso base responde 1 ou 0 (o único elemento é o alvo?) e a combinação **soma** as contagens das metades. Repare no padrão: só o caso base e a combinação mudam, e a divisão é sempre a mesma.`,
        codigo: prog(String.raw`    public static int contar(int[] v, int alvo, int inicio, int fim) {
        if (fim - inicio == 1) {
            if (v[inicio] == alvo) {
                return 1;
            }
            return 0;
        }
        int meio = inicio + (fim - inicio) / 2;
        return contar(v, alvo, inicio, meio) + contar(v, alvo, meio, fim);
    }`, "        int[] v = {8, 3, 8, 5, 8};\n        System.out.println(contar(v, 8, 0, v.length));"),
        programa: { viz: [VIZ[0], { tipo: "arvore", metodos: ["contar"], rotulo: function (c) { return "cont[" + arg(c, "inicio") + "," + arg(c, "fim") + ")"; } }] } },
      { nome: "Divisão desequilibrada", curto: "desequilibrada", quando: "você divide em \"primeiro elemento + resto\" em vez de metades.",
        muda: String.raw`Tirar só um elemento («meio = inicio + 1») ainda funciona, mas a árvore vira uma **fila comprida**: altura n em vez de log n. O total de trabalho continua O(n), mas a pilha de chamadas fica O(n). No quicksort com pivô ruim é isso que causa o O(n²).`,
        codigo: MAXIMO.replace("int meio = inicio + (fim - inicio) / 2;", "int meio = inicio + 1;").replace("{{v}}", "{8, 3, 12, 5, 9, 1}"),
        programa: { viz: VIZ } }
    ],
    erros: [
      { erro: "Misturar intervalo fechado e aberto", curto: "v.length - 1", porque: "Chamar «maximoIntervalo(v, 0, v.length - 1)» com a convenção [inicio, fim) **exclui o último elemento**. Se o maior está no fim, a resposta sai errada.",
        codigo: MAXIMO.replace("return maximoIntervalo(v, 0, v.length);", "return maximoIntervalo(v, 0, v.length - 1);").replace("{{v}}", "{8, 3, 5, 12}") },
      { erro: "Caso base que não cobre 1 elemento", curto: "caso base errado", porque: "Com «if (fim - inicio == 0)», um intervalo de 1 elemento divide em [i, i) e [i, i+1), e o segundo é **igual** ao original: sem progresso, StackOverflowError.",
        codigo: MAXIMO.replace("if (fim - inicio == 1) {\n            return v[inicio];", "if (fim - inicio == 0) {\n            return v[inicio];").replace("{{v}}", "{8, 3}") },
      { erro: "Chamar duas vezes o mesmo intervalo", curto: "mesmo intervalo", porque: "«maxDir = maximoIntervalo(v, inicio, meio)» (copiou e esqueceu de trocar) ignora a metade direita inteira.",
        codigo: MAXIMO.replace("int maxDir = maximoIntervalo(v, meio, fim);", "int maxDir = maximoIntervalo(v, inicio, meio);").replace("{{v}}", "{8, 3, 12, 5}") },
      { erro: "Esquecer o array vazio", porque: "Com «v.length == 0», o intervalo [0, 0) tem tamanho 0 e nunca chega ao caso base «fim - inicio == 1». Por isso o método público valida antes e lança IllegalArgumentException." }
    ],
    perguntas: [
      { g: "conceito", p: "Quais são as três perguntas de divisão e conquista? Responda para o máximo.", r: "**Dividir**: em duas metades pelo meio. **Resolver**: achar o máximo de cada metade recursivamente. **Combinar**: devolver o maior dos dois. E o caso base: intervalo com 1 elemento." },
      { g: "conceito", p: "Máximo por divisão e conquista é mais rápido que um laço? Qual o custo?", r: "Não: continua O(n). Cada elemento vira caso base uma vez e cada combinação é O(1) (são 2n − 1 chamadas). O ganho aparece quando a combinação é esperta, como no mergesort." },
      { g: "conceito", p: "Qual a altura da árvore de chamadas para n = 8? E se a divisão fosse \"1 elemento + resto\"?", r: "Metades: log₂ 8 = 3 níveis abaixo da raiz. \"1 + resto\": n níveis, ou seja, uma fila comprida com pilha O(n)." },
      { g: "codigo", p: "O que significa o intervalo [inicio, fim)? Qual o tamanho dele?", r: "«inicio» entra e «fim» **não** entra. Tamanho = «fim - inicio». O array inteiro é [0, v.length)." },
      { g: "codigo", p: "Por que a chamada da direita começa em «meio», e não em «meio + 1»?", r: "Porque «meio» **não** entrou na esquerda: [inicio, meio) para em meio - 1. As metades [inicio, meio) e [meio, fim) cobrem tudo, sem sobreposição e sem buraco." },
      { g: "codigo", p: "Para {8, 3, 12, 5}, qual é a ordem em que os casos base devolvem valores?", r: "max[0,1) → 8, max[1,2) → 3, combina 8; max[2,3) → 12, max[3,4) → 5, combina 12; combina 12. A esquerda inteira termina antes de a direita começar." },
      { g: "variacao", p: "O que muda para somar em vez de achar o máximo?", r: "Só a **combinação** (somar os resultados) e o caso base do intervalo vazio passa a valer 0. A divisão é idêntica." },
      { g: "variacao", p: "Como a busca binária se encaixa em divisão e conquista?", r: "Divide pelo meio, mas **resolve só uma metade** (a outra é descartada pela ordenação) e não há combinação. Por isso é O(log n)." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Quantas chamadas?", enunciado: "O programa conta quantas vezes «maximoIntervalo» é chamado para um array de 6 elementos. O que ele imprime?",
        codigo: String.raw`public class ContaDC {
    static int chamadas = 0;
    static int maximoIntervalo(int[] v, int inicio, int fim) {
        chamadas++;
        if (fim - inicio == 1) {
            return v[inicio];
        }
        int meio = inicio + (fim - inicio) / 2;
        int maxEsq = maximoIntervalo(v, inicio, meio);
        int maxDir = maximoIntervalo(v, meio, fim);
        return Math.max(maxEsq, maxDir);
    }
    public static void main(String[] args) {
        int[] v = {4, 17, 2, 9, 30, 11};
        System.out.println(maximoIntervalo(v, 0, v.length) + " " + chamadas);
    }
}`, formato: "máximo chamadas", explicacao: "30 e 11 chamadas: com divisão em metades, sempre 2n − 1 (6 folhas + 5 combinações).", viz: VIZ },
      { tipo: "completar", titulo: "Complete o mínimo por metades", enunciado: "Complete «minimo(v, inicio, fim)» com o intervalo [inicio, fim).",
        modelo: String.raw`    public static int minimo(int[] v, int inicio, int fim) {
        if (⟦⟧) {
            return v[inicio];
        }
        int meio = inicio + (fim - inicio) / 2;
        int a = minimo(v, inicio, ⟦⟧);
        int b = minimo(v, ⟦⟧, fim);
        return ⟦⟧;
    }`, gabarito: ["fim - inicio == 1", "meio", "meio", "Math.min(a, b)"],
        solucao: String.raw`    public static int minimo(int[] v, int inicio, int fim) {
        if (fim - inicio == 1) {
            return v[inicio];
        }
        int meio = inicio + (fim - inicio) / 2;
        int a = minimo(v, inicio, meio);
        int b = minimo(v, meio, fim);
        return Math.min(a, b);
    }`,
        testes: [{ expr: "minimo(new int[] {8, 3, 12, 5}, 0, 4)" }, { expr: "minimo(new int[] {8, 3, 12, 1}, 0, 4)" }, { expr: "minimo(new int[] {7}, 0, 1)" }, { expr: "minimo(new int[] {5, 9, -2, 4, 6}, 1, 5)" }] },
      { tipo: "escrever", titulo: "Contar pares por metades", enunciado: "Escreva «contaPares(int[] v, int inicio, int fim)»: quantos números **pares** há em v[inicio..fim), usando divisão e conquista (sem laços). Se o intervalo for vazio, devolva 0.",
        inicial: "    public static int contaPares(int[] v, int inicio, int fim) {\n        return 0;\n    }",
        solucao: String.raw`    public static int contaPares(int[] v, int inicio, int fim) {
        if (inicio == fim) {
            return 0;
        }
        if (fim - inicio == 1) {
            return v[inicio] % 2 == 0 ? 1 : 0;
        }
        int meio = inicio + (fim - inicio) / 2;
        return contaPares(v, inicio, meio) + contaPares(v, meio, fim);
    }`,
        testes: [{ expr: "contaPares(new int[] {1, 2, 3, 4, 6}, 0, 5)" }, { expr: "contaPares(new int[] {1, 3}, 0, 2)" }, { expr: "contaPares(new int[] {}, 0, 0)" }, { expr: "contaPares(new int[] {-2, 0, 7}, 0, 3)" }],
        dica: "Dois casos base: intervalo vazio e intervalo de 1 elemento. A combinação é a soma.", viz: VIZ },
      { tipo: "escolha", titulo: "Qual intervalo?", enunciado: "Com intervalo aberto [inicio, fim) e «meio = inicio + (fim - inicio) / 2», quais são as duas metades?", alternativas: ["[inicio, meio) e [meio, fim)", "[inicio, meio] e [meio, fim)", "[inicio, meio) e [meio + 1, fim)", "[inicio, meio - 1) e [meio, fim)"], correta: 0, explicacao: "Com fim aberto, [inicio, meio) para em meio − 1 e [meio, fim) começa em meio: cobre tudo, sem sobreposição." },
      { tipo: "escolha", titulo: "Custo do máximo por metades", enunciado: "Qual o custo de tempo do máximo por divisão e conquista?", alternativas: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"], correta: 0, explicacao: "São 2n − 1 chamadas, cada uma com trabalho O(1). A árvore tem log n níveis, mas o total de nós é linear." }
    ]
  });
})();
