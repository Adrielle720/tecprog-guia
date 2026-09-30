(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };
  var SUB = String.raw`import java.util.ArrayList;
import java.util.List;

public class Subconjuntos {
    public static List<List<Integer>> gerar(int[] v) {
        List<List<Integer>> respostas = new ArrayList<>();
        gerar(v, 0, new ArrayList<>(), respostas);
        return respostas;
    }

    private static void gerar(int[] v, int i, List<Integer> atual,
            List<List<Integer>> respostas) {
        if (i == v.length) {
            respostas.add(new ArrayList<>(atual));
            return;
        }
        gerar(v, i + 1, atual, respostas);
        atual.add(v[i]);
        gerar(v, i + 1, atual, respostas);
        atual.remove(atual.size() - 1);
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        System.out.println(gerar(v));
    }
}`;
  var PERM = String.raw`import java.util.ArrayList;
import java.util.List;

public class Permutacoes {
    public static List<List<Integer>> gerar(int[] v) {
        List<List<Integer>> respostas = new ArrayList<>();
        gerar(v, new boolean[v.length], new ArrayList<>(), respostas);
        return respostas;
    }

    private static void gerar(int[] v, boolean[] usado, List<Integer> atual,
            List<List<Integer>> respostas) {
        if (atual.size() == v.length) {
            respostas.add(new ArrayList<>(atual));
            return;
        }
        for (int i = 0; i < v.length; i++) {
            if (usado[i]) {
                continue;
            }
            usado[i] = true;
            atual.add(v[i]);
            gerar(v, usado, atual, respostas);
            atual.remove(atual.size() - 1);
            usado[i] = false;
        }
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        System.out.println(gerar(v));
    }
}`;
  var VIZ_SUB = [{ tipo: "arvore", metodos: ["gerar"], titulo: "árvore de decisões (cada nível decide um elemento)", rotulo: function (c) { return c.args.length > 1 ? arg(c, "atual") : "gerar"; }, retorno: function () { return ""; }, largura: 74 },
    { tipo: "colecoes", nomes: ["atual", "respostas"], titulo: "estado parcial e respostas" }, { tipo: "array", nome: "v", ponteiros: [["i", "#e0392b", "topo"]] }];
  var VIZ_PERM = [{ tipo: "arvore", metodos: ["gerar"], titulo: "árvore de decisões (cada nível escolhe a próxima posição)", rotulo: function (c) { return c.args.length > 1 ? arg(c, "atual") : "gerar"; }, retorno: function () { return ""; }, largura: 70 },
    { tipo: "colecoes", nomes: ["atual", "respostas"] }, { tipo: "array", nome: "usado", ponteiros: [["i", "#e0392b", "topo"]] }];
  var DICAS = [
    { linha: /if \(i == v.length\)/, texto: function (st) { return st.num("i") === st.arr("v").length ? "**Caso base**: todos os elementos foram decididos. Registra uma **cópia** de atual." : "Decidindo o elemento v[" + st.num("i") + "] = " + st.arr("v")[st.num("i")] + ": primeiro o ramo \"não inclui\", depois o \"inclui\"."; } },
    { linha: /respostas.add\(new ArrayList<>\(atual\)\)/, texto: function (st) { return "Resposta nº " + st.arr("respostas").length + " guardada (uma cópia, porque atual vai continuar mudando)."; } },
    { linha: /atual.add\(v\[i\]\)/, texto: function (st) { return "**Escolhe**: inclui " + st.arr("v")[st.num("i")] + " no estado parcial."; } },
    { linha: /atual.remove\(atual.size\(\) - 1\)/, texto: function () { return "**Desfaz**: tira o último elemento para o próximo ramo começar limpo."; } }
  ];

  G.algoritmo({
    slug: "backtracking", titulo: "Backtracking", aula: "Aula 16", grupo: "Backtracking",
    resumo: "Explora uma **árvore de decisões**: faz uma escolha, avança, e depois **desfaz** para tentar a próxima. Gera todos os subconjuntos, permutações, combinações.",
    custos: [["subconjuntos", "2ⁿ respostas"], ["permutações", "n! respostas"], ["profundidade", "n"], ["tempo", "≥ nº de respostas"]],
    ideia: String.raw`Para gerar todos os subconjuntos de {1, 2, 3}, cada elemento tem duas decisões: **incluir ou não incluir**. As decisões formam uma árvore: 2 × 2 × 2 = 8 folhas, e cada folha é um subconjunto.

Um backtracking tem sempre as mesmas peças:
- **estado parcial**: as escolhas feitas até agora («atual»);
- **etapa**: qual decisão está sendo tomada («i»);
- **candidatos**: as escolhas possíveis neste ponto;
- **caso base**: a solução está completa → registra uma **cópia**;
- **desfazer**: remove a escolha antes de tentar a próxima.

O padrão central é **escolher, avançar, desfazer**:
~~~
atual.add(v[i]);                      // escolhe
gerar(v, i + 1, atual, respostas);    // avança
atual.remove(atual.size() - 1);       // desfaz
~~~
O estado «atual» é **compartilhado** por todas as chamadas de um caminho. Por isso a resposta guardada precisa ser uma **cópia** («new ArrayList<>(atual)»): sem ela, todas as respostas apontariam para a mesma lista, que no fim está vazia.

**Custo:** exponencial. Há 2ⁿ subconjuntos e n! permutações, e só imprimir todas as respostas já custa isso.`,
    pseudo: String.raw`BUSCAR(estado)
    IF estado é uma solução completa THEN
        REGISTRAR uma cópia da solução
        RETURN
    FOR CADA candidato válido DO
        FAZER a escolha no estado
        BUSCAR(estado)
        DESFAZER a escolha no estado

GERAR-SUBCONJUNTOS(v, i, atual, respostas)
    IF i = TAMANHO(v) THEN
        ADICIONAR-COPIA(respostas, atual)
        RETURN
    GERAR-SUBCONJUNTOS(v, i + 1, atual, respostas)
    ADICIONAR(atual, v[i])
    GERAR-SUBCONJUNTOS(v, i + 1, atual, respostas)
    REMOVER-ULTIMO(atual)`,
    invariante: String.raw`**Toda chamada devolve o estado exatamente como recebeu.** Se «gerar» começa com atual = [1], ele termina com atual = [1]: o que foi adicionado dentro foi desfeito. É isso que deixa cada ramo começar limpo.`,
    programas: [
      { id: "sub", nome: "Subconjuntos (aula 16)", codigo: SUB, entradas: [{ nome: "v", tipo: "int[]", valor: "1, 2, 3" }], exemplos: [{ rotulo: "dois elementos", valores: { v: "1, 2" } }, { rotulo: "quatro elementos (16)", valores: { v: "1, 2, 3, 4" } }],
        viz: VIZ_SUB, dicas: DICAS, tabela: { quando: "respostas.add(new ArrayList<>(atual))", colunas: [["resposta", "atual"]] } },
      { id: "perm", nome: "Permutações", codigo: PERM, entradas: [{ nome: "v", tipo: "int[]", valor: "1, 2, 3" }],
        viz: VIZ_PERM, dicas: [{ linha: /if \(usado\[i\]\)/, texto: function (st) { return st.arr("usado")[st.num("i")] ? "v[" + st.num("i") + "] já está na permutação: pula." : "v[" + st.num("i") + "] = " + st.arr("v")[st.num("i")] + " ainda está livre: candidato."; } }, { linha: /usado\[i\] = false/, texto: function (st) { return "Desfaz as duas escolhas (lista e usado). v[" + st.num("i") + "] fica livre para os próximos ramos."; } }],
        tabela: { quando: "respostas.add(new ArrayList<>(atual))", colunas: [["permutação", "atual"]] } }
    ],
    problemas: {
      resolve: String.raw`Problemas **combinatórios** em que é preciso gerar ou examinar muitas configurações:
- todos os **subconjuntos**, **permutações** e **combinações** de k elementos;
- montar palavras, senhas ou expressões válidas;
- tabuleiros (N-rainhas, sudoku), caminhos simples, escalas;
- decidir se **existe** alguma configuração que satisfaça regras (e parar na primeira).

Diferente da DFS em grafos, os estados **não existem de antemão**: são gerados pelas decisões.`,
      classicos: [
        { nome: "Subsets", onde: "LeetCode 78", ideia: "Todos os subconjuntos.", muda: "nada: é o código da aula." },
        { nome: "Permutations", onde: "LeetCode 46", ideia: "Todas as ordens possíveis.", muda: "a decisão vira \"qual elemento vai na **próxima posição**\": laço sobre os candidatos e um vetor «usado» para não repetir." },
        { nome: "Combinations", onde: "LeetCode 77", ideia: "Todos os grupos de k elementos.", muda: "caso base quando «atual.size() == k», e o laço começa do elemento seguinte ao último escolhido (não volta atrás)." },
        { nome: "Letter Combinations of a Phone Number", onde: "LeetCode 17", ideia: "Palavras possíveis de uma sequência de teclas.", muda: "em cada posição os candidatos são as letras daquela tecla; o estado é um StringBuilder (append e deleteCharAt)." },
        { nome: "Generate Parentheses", onde: "LeetCode 22", ideia: "Todas as sequências válidas de n pares de parênteses.", muda: "só adiciona '(' se ainda há abertos disponíveis e ')' se há um aberto para fechar: restrição que poda os ramos inválidos." },
        { nome: "Subsets II", onde: "LeetCode 90", ideia: "Subconjuntos com elementos repetidos, sem respostas repetidas.", muda: "ordena primeiro e, no laço, pula um candidato igual ao anterior no mesmo nível." }
      ]
    },
    variacoes: [
      { nome: "Combinações de tamanho k", curto: "combinações k", quando: "você quer só os grupos de exatamente k elementos, sem importar a ordem (LeetCode 77).",
        muda: String.raw`Caso base novo: «atual.size() == k». E o laço de candidatos começa em «inicio», o elemento seguinte ao último escolhido. Assim {1, 2} aparece, mas {2, 1} não.`,
        base: SUB.replace("{{v}}", "{1, 2, 3}"),
        codigo: String.raw`import java.util.ArrayList;
import java.util.List;

public class Subconjuntos {
    private static void gerar(int[] v, int k, int inicio, List<Integer> atual,
            List<List<Integer>> respostas) {
        if (atual.size() == k) {
            respostas.add(new ArrayList<>(atual));
            return;
        }
        for (int i = inicio; i < v.length; i++) {
            atual.add(v[i]);
            gerar(v, k, i + 1, atual, respostas);
            atual.remove(atual.size() - 1);
        }
    }

    public static void main(String[] args) {
        int[] v = {1, 2, 3, 4};
        List<List<Integer>> respostas = new ArrayList<>();
        gerar(v, 2, 0, new ArrayList<>(), respostas);
        System.out.println(respostas);
    }
}`, programa: { viz: [{ tipo: "arvore", metodos: ["gerar"], rotulo: function (c) { return arg(c, "atual"); }, retorno: function () { return ""; }, largura: 64 }, { tipo: "colecoes", nomes: ["atual", "respostas"] }] } },
      { nome: "Permutações (a próxima posição)", curto: "permutações", quando: "a ordem importa: [1, 2] e [2, 1] são respostas diferentes.",
        muda: String.raw`A unidade de decisão muda: não é mais "incluo o elemento i?", e sim **"quem vai na próxima posição?"**. Um laço passa por todos os candidatos, e um vetor «usado» impede repetir. São **duas** coisas a desfazer: a lista e o «usado».`,
        base: SUB.replace("{{v}}", "{1, 2, 3}"),
        codigo: PERM.replace("{{v}}", "{1, 2, 3}"), programa: { viz: VIZ_PERM } },
      { nome: "Strings binárias de tamanho n", curto: "strings binárias", quando: "cada posição tem um conjunto fixo de opções (0/1, letras, dígitos).",
        muda: String.raw`O estado vira um «StringBuilder»: escolher é «append», desfazer é «deleteCharAt(length - 1)». Com 2 opções por posição são 2ⁿ strings, exatamente a mesma árvore dos subconjuntos.`,
        base: SUB.replace("{{v}}", "{1, 2, 3}"),
        codigo: String.raw`import java.util.ArrayList;
import java.util.List;

public class Subconjuntos {
    private static void gerar(int n, StringBuilder atual, List<String> respostas) {
        if (atual.length() == n) {
            respostas.add(atual.toString());
            return;
        }
        atual.append('0');
        gerar(n, atual, respostas);
        atual.deleteCharAt(atual.length() - 1);
        atual.append('1');
        gerar(n, atual, respostas);
        atual.deleteCharAt(atual.length() - 1);
    }

    public static void main(String[] args) {
        List<String> respostas = new ArrayList<>();
        gerar(3, new StringBuilder(), respostas);
        System.out.println(respostas);
    }
}`, programa: { viz: [{ tipo: "arvore", metodos: ["gerar"], rotulo: function (c) { return arg(c, "atual"); }, retorno: function () { return ""; }, largura: 56 }, { tipo: "colecoes", nomes: ["respostas"] }] } }
    ],
    erros: [
      { erro: "Esquecer de desfazer a escolha", curto: "sem desfazer", porque: "Sem «atual.remove(...)», o que foi escolhido num ramo **vaza** para o próximo. Aparecem respostas com elementos repetidos e em excesso.",
        codigo: SUB.replace("        atual.remove(atual.size() - 1);\n", "").replace("{{v}}", "{1, 2, 3}") },
      { erro: "Guardar a lista sem copiar", curto: "sem cópia", porque: "«respostas.add(atual)» guarda a **mesma** lista 8 vezes. Ela continua mudando depois e, no fim, está vazia: todas as respostas aparecem como [].",
        codigo: SUB.replace("respostas.add(new ArrayList<>(atual));", "respostas.add(atual);").replace("{{v}}", "{1, 2, 3}") },
      { erro: "Registrar a solução cedo demais", curto: "caso base cedo", porque: "Com «if (i == v.length - 1)», a última decisão nunca é tomada: o 3 nunca entra em nenhuma resposta, e só saem 4 subconjuntos.",
        codigo: SUB.replace("if (i == v.length)", "if (i == v.length - 1)").replace("{{v}}", "{1, 2, 3}") },
      { erro: "Não perceber o crescimento exponencial", porque: "Com 20 elementos são ~1 milhão de subconjuntos; com 30, mais de 1 bilhão. Backtracking é para entradas pequenas, ou para quando dá para **podar** muito (próxima aula)." }
    ],
    perguntas: [
      { g: "conceito", p: "Quais são as peças de todo backtracking?", r: "Estado parcial, etapa (qual decisão), candidatos, caso base (solução completa → registrar cópia) e **desfazer** a escolha antes da próxima." },
      { g: "conceito", p: "Quantos subconjuntos tem um conjunto de n elementos, e por quê?", r: "**2ⁿ**: cada elemento tem 2 decisões independentes (entra ou não), então 2 × 2 × … × 2. A árvore de decisões tem 2ⁿ folhas." },
      { g: "conceito", p: "Qual a diferença entre backtracking e a DFS em grafos?", r: "Os dois exploram em profundidade. Mas na DFS os estados (vértices, células) **já existem**; no backtracking eles são **gerados** pelas decisões, e o estado é desfeito ao voltar." },
      { g: "conceito", p: "Quando vale a pena parar na primeira solução, em vez de gerar todas?", r: "Quando a pergunta é \"**existe**?\". O método pode devolver boolean e parar ao achar a primeira. Isso economiza muito em várias entradas, embora o pior caso continue exponencial." },
      { g: "codigo", p: "Por que «new ArrayList<>(atual)» no caso base, e não «atual»?", r: "«atual» é **uma única lista** compartilhada e mutável. Guardando a referência, todas as respostas seriam a mesma lista, que termina vazia. A cópia congela a solução daquele momento." },
      { g: "codigo", p: "Nos subconjuntos, por que só o segundo ramo tem «remove»?", r: "O primeiro ramo (não incluir) não mexeu em «atual». Só o segundo adicionou v[i], então só ele precisa desfazer." },
      { g: "codigo", p: "Nas permutações, por que são desfeitas duas coisas?", r: "A escolha tem dois efeitos: o elemento entrou em «atual» **e** foi marcado em «usado». Os dois precisam voltar, senão o próximo ramo vê o elemento como usado." },
      { g: "variacao", p: "Como gerar só os subconjuntos de tamanho k?", r: "Caso base «atual.size() == k» e laço de candidatos começando depois do último escolhido («inicio»), para não gerar a mesma combinação em outra ordem." },
      { g: "variacao", p: "E se o estado for uma String?", r: "Use StringBuilder: escolher é «append», desfazer é «deleteCharAt(length() - 1)», e o caso base guarda «toString()», que já é uma cópia." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Ordem das respostas", enunciado: "Qual a saída do código da aula para {1, 2}?",
        codigo: SUB.replace("{{v}}", "{1, 2}"), formato: "[[...], ...]", explicacao: "O ramo \"não inclui\" vem primeiro: [], [2], [1], [1, 2].", viz: VIZ_SUB },
      { tipo: "rastreio", titulo: "Quantas chamadas?", enunciado: "Quantas vezes «gerar» (o privado) é chamado para {1, 2, 3}? O programa conta.",
        codigo: SUB.replace("private static void gerar(int[] v, int i, List<Integer> atual,\n            List<List<Integer>> respostas) {", "static int chamadas = 0;\n\n    private static void gerar(int[] v, int i, List<Integer> atual,\n            List<List<Integer>> respostas) {\n        chamadas++;").replace("{{v}}", "{1, 2, 3}").replace("System.out.println(gerar(v));", "gerar(v);\n        System.out.println(chamadas);"),
        formato: "número", explicacao: "A árvore completa com 3 níveis de decisão: 1 + 2 + 4 + 8 = 15 chamadas (2ⁿ⁺¹ − 1).", viz: VIZ_SUB },
      { tipo: "completar", titulo: "Complete escolher / avançar / desfazer", enunciado: "Complete o gerador de subconjuntos.",
        modelo: String.raw`    static void gerar(int[] v, int i, List<Integer> atual, List<List<Integer>> respostas) {
        if (i == ⟦⟧) {
            respostas.add(⟦⟧);
            return;
        }
        gerar(v, i + 1, atual, respostas);
        ⟦⟧;
        gerar(v, i + 1, atual, respostas);
        ⟦⟧;
    }`, gabarito: ["v.length", "new ArrayList<>(atual)", "atual.add(v[i])", "atual.remove(atual.size() - 1)"],
        solucao: SUB.split("\n").slice(10, 22).join("\n").replace("private static void gerar(int[] v, int i, List<Integer> atual,\n            List<List<Integer>> respostas) {", "static void gerar(int[] v, int i, List<Integer> atual, List<List<Integer>> respostas) {"),
        testes: [{ codigo: "List<List<Integer>> r = new ArrayList<>(); gerar(new int[] {1, 2, 3}, 0, new ArrayList<>(), r); System.out.println(r);" }, { codigo: "List<List<Integer>> r = new ArrayList<>(); gerar(new int[] {5}, 0, new ArrayList<>(), r); System.out.println(r);" }, { codigo: "List<List<Integer>> r = new ArrayList<>(); gerar(new int[] {}, 0, new ArrayList<>(), r); System.out.println(r);" }] },
      { tipo: "escrever", titulo: "Combinações de k", enunciado: "Escreva «combinacoes(int[] v, int k)», que devolve todas as combinações de k elementos de v, na ordem gerada pelo backtracking \"a partir do índice inicio\".",
        inicial: "    public static List<List<Integer>> combinacoes(int[] v, int k) {\n        List<List<Integer>> respostas = new ArrayList<>();\n        return respostas;\n    }",
        solucao: String.raw`    public static List<List<Integer>> combinacoes(int[] v, int k) {
        List<List<Integer>> respostas = new ArrayList<>();
        gerar(v, k, 0, new ArrayList<>(), respostas);
        return respostas;
    }

    static void gerar(int[] v, int k, int inicio, List<Integer> atual, List<List<Integer>> respostas) {
        if (atual.size() == k) {
            respostas.add(new ArrayList<>(atual));
            return;
        }
        for (int i = inicio; i < v.length; i++) {
            atual.add(v[i]);
            gerar(v, k, i + 1, atual, respostas);
            atual.remove(atual.size() - 1);
        }
    }`,
        testes: [{ expr: "combinacoes(new int[] {1, 2, 3, 4}, 2)" }, { expr: "combinacoes(new int[] {1, 2, 3}, 3)" }, { expr: "combinacoes(new int[] {1, 2, 3}, 0)" }, { expr: "combinacoes(new int[] {7, 8, 9}, 1)" }],
        dica: "Caso base: atual tem k elementos. O laço começa em inicio e a chamada passa i + 1." },
      { tipo: "escrever", titulo: "Parênteses válidos", enunciado: "Escreva «parenteses(int n)»: todas as sequências **válidas** com n pares de parênteses (LeetCode 22), gerando primeiro '(' e depois ')'.",
        inicial: "    public static List<String> parenteses(int n) {\n        List<String> r = new ArrayList<>();\n        return r;\n    }",
        solucao: String.raw`    public static List<String> parenteses(int n) {
        List<String> r = new ArrayList<>();
        gerar(n, 0, 0, new StringBuilder(), r);
        return r;
    }

    static void gerar(int n, int abertos, int fechados, StringBuilder atual, List<String> r) {
        if (atual.length() == 2 * n) {
            r.add(atual.toString());
            return;
        }
        if (abertos < n) {
            atual.append('(');
            gerar(n, abertos + 1, fechados, atual, r);
            atual.deleteCharAt(atual.length() - 1);
        }
        if (fechados < abertos) {
            atual.append(')');
            gerar(n, abertos, fechados + 1, atual, r);
            atual.deleteCharAt(atual.length() - 1);
        }
    }`,
        testes: [{ expr: "parenteses(1)" }, { expr: "parenteses(2)" }, { expr: "parenteses(3)" }],
        dica: "Só abra se ainda há '(' disponíveis; só feche se há mais abertos que fechados." },
      { tipo: "escolha", titulo: "Crescimento", enunciado: "Quantas permutações tem um conjunto de 6 elementos?", alternativas: ["720", "64", "36", "6"], correta: 0, explicacao: "6! = 6·5·4·3·2·1 = 720. (64 = 2⁶ seriam os subconjuntos.)" }
    ]
  });
})();
