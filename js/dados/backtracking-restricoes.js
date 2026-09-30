(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };
  var SOMA = String.raw`public class SomaAlvo {
    static int chamadas = 0;

    public static boolean existeSoma(int[] v, int i, int soma, int alvo) {
        chamadas++;
        if (soma == alvo) {
            return true;
        }
        if (soma > alvo) {
            return false;
        }
        if (i == v.length) {
            return false;
        }
        if (existeSoma(v, i + 1, soma + v[i], alvo)) {
            return true;
        }
        return existeSoma(v, i + 1, soma, alvo);
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        int alvo = {{alvo}};
        System.out.println(existeSoma(v, 0, 0, alvo) + " (chamadas: " + chamadas + ")");
    }
}`;
  var MOCHILA = String.raw`public class MochilaBacktracking {
    private static int melhor;

    public static int resolver(int[] pesos, int[] valores, int capacidade) {
        melhor = 0;
        buscar(pesos, valores, capacidade, 0, 0, 0);
        return melhor;
    }

    private static void buscar(int[] pesos, int[] valores, int capacidade,
            int i, int pesoAtual, int valorAtual) {
        if (pesoAtual > capacidade) {
            return;
        }
        if (i == pesos.length) {
            if (valorAtual > melhor) {
                melhor = valorAtual;
            }
            return;
        }
        buscar(pesos, valores, capacidade, i + 1,
                pesoAtual + pesos[i], valorAtual + valores[i]);
        buscar(pesos, valores, capacidade, i + 1,
                pesoAtual, valorAtual);
    }

    public static void main(String[] args) {
        int[] pesos = {{pesos}};
        int[] valores = {{valores}};
        System.out.println(resolver(pesos, valores, {{capacidade}}));
    }
}`;
  var VIZ_SOMA = [{ tipo: "arvore", metodos: ["existeSoma"], titulo: "árvore de decisões (rótulo = soma parcial)", rotulo: function (c) { return "i=" + arg(c, "i") + " s=" + arg(c, "soma"); }, retorno: function (c) { return c.ret === "true" ? "✓" : "✗"; }, largura: 68 },
    { tipo: "array", nome: "v", ponteiros: [["i", "#e0392b", "topo"]], nota: function (st) { var s = st.noTopo("soma"), a = st.num("alvo"); return s === undefined ? "" : "soma parcial = " + s + "  ·  alvo = " + a + (s > a ? "  ·  passou do alvo!" : ""); } }];
  var VIZ_MOCH = [{ tipo: "arvore", metodos: ["buscar"], titulo: "árvore de decisões (peso / valor acumulados)", rotulo: function (c) { return arg(c, "pesoAtual") + "kg $" + arg(c, "valorAtual"); }, retorno: function () { return ""; }, largura: 74 },
    { tipo: "array", nome: "pesos", ponteiros: [["i", "#e0392b", "topo"]] }, { tipo: "array", nome: "valores", ponteiros: [["i", "#e0392b", "topo"]] }];

  G.algoritmo({
    slug: "backtracking-restricoes", titulo: "Backtracking com poda", aula: "Aula 17", grupo: "Backtracking",
    resumo: "Quando uma escolha parcial **já não pode dar certo**, corta o ramo inteiro. Soma-alvo e mochila 0/1: mesma árvore de decisões, muito menos nós visitados.",
    custos: [["pior caso", "O(2ⁿ)"], ["na prática", "poda corta muito"], ["profundidade", "n"]],
    ideia: String.raw`Existe um subconjunto de {4, 7, 9} que soma 10? Sem restrições, geraríamos os 8 subconjuntos. Mas se escolhemos 4 e 7, a soma parcial já é 11 > 10. Como todos os valores são **positivos**, adicionar mais só aumenta: esse ramo inteiro **não pode** dar certo. Podemos parar ali.

- **Restrição**: a regra do que é permitido (soma igual ao alvo, peso até a capacidade).
- **Poda**: deixar de explorar um ramo porque **sabemos** que ele não gera resposta válida (ou melhor).

Na **soma-alvo**, o estado parcial é a soma já escolhida. A poda «soma > alvo» vem **antes** de novas escolhas. Ela só é correta porque os valores são positivos: com negativos, passar do alvo não impede de voltar a ele.

Na **mochila 0/1**, cada item tem peso e valor, e queremos o maior valor sem passar da capacidade. Cada item: incluir ou não. A poda «pesoAtual > capacidade» corta ramos inválidos, e um campo «melhor» guarda a melhor solução completa vista.

**Custo:** a árvore completa continua tendo 2ⁿ folhas. A poda reduz muito os ramos na prática, mas **não muda o pior caso**. Medir com um contador de chamadas mostra o efeito.`,
    pseudo: String.raw`EXISTE-SOMA(v, i, soma, alvo)
    IF soma = alvo THEN
        RETURN TRUE
    IF soma > alvo THEN
        RETURN FALSE
    IF i = TAMANHO(v) THEN
        RETURN FALSE
    IF EXISTE-SOMA(v, i + 1, soma + v[i], alvo) THEN
        RETURN TRUE
    RETURN EXISTE-SOMA(v, i + 1, soma, alvo)

MOCHILA(pesos, valores, capacidade, i, pesoAtual, valorAtual)
    IF pesoAtual > capacidade THEN
        RETURN
    IF i = TAMANHO(pesos) THEN
        melhor <- MAXIMO(melhor, valorAtual)
        RETURN
    MOCHILA incluindo item i
    MOCHILA sem incluir item i`,
    invariante: String.raw`**Uma poda só é válida se vier com uma justificativa lógica**: "posso cortar quando soma > alvo **porque todos os valores restantes são positivos**". Sem a hipótese, a poda pode descartar exatamente a resposta certa, e isso é pior do que ser lento.`,
    programas: [
      { id: "soma", nome: "Soma-alvo com poda", codigo: SOMA, entradas: [{ nome: "v", tipo: "int[]", valor: "4, 7, 9" }, { nome: "alvo", tipo: "int", valor: "10" }],
        exemplos: [{ rotulo: "alvo 13 (existe)", valores: { alvo: "13" } }, { rotulo: "alvo 16", valores: { alvo: "16" } }, { rotulo: "6 valores", valores: { v: "8, 6, 7, 5, 3, 10", alvo: "15" } }],
        viz: VIZ_SOMA, dicas: [
          { linha: /if \(soma > alvo\)/, texto: function (st) { return st.num("soma") > st.num("alvo") ? "**PODA**: soma " + st.num("soma") + " > alvo " + st.num("alvo") + ". Com valores positivos, nenhum ramo abaixo daqui chega ao alvo." : ""; } },
          { linha: /if \(soma == alvo\)/, texto: function (st) { return st.num("soma") === st.num("alvo") ? "**Achou!** A soma parcial é exatamente o alvo, e o true sobe pela pilha." : ""; } },
          { linha: /if \(existeSoma\(v, i \+ 1, soma \+ v\[i\], alvo\)\)/, texto: function (st) { return st.passo.voltou === undefined ? "Primeiro tenta **incluir** v[" + st.num("i") + "] = " + st.arr("v")[st.num("i")] + "." : ""; } }
        ] },
      { id: "moch", nome: "Mochila 0/1", codigo: MOCHILA, entradas: [{ nome: "pesos", tipo: "int[]", valor: "2, 3, 4" }, { nome: "valores", tipo: "int[]", valor: "3, 4, 5" }, { nome: "capacidade", tipo: "int", valor: "5" }],
        exemplos: [{ rotulo: "4 itens", valores: { pesos: "2, 3, 4, 5", valores: "3, 4, 5, 6", capacidade: "5" } }, { rotulo: "cabe tudo", valores: { capacidade: "20" } }],
        viz: VIZ_MOCH, dicas: [
          { linha: /if \(pesoAtual > capacidade\)/, texto: function (st) { return st.num("pesoAtual") > st.num("capacidade") ? "**PODA**: peso " + st.num("pesoAtual") + " > capacidade " + st.num("capacidade") + ". Colocar mais itens nunca reduz o peso." : ""; } },
          { linha: /melhor = valorAtual/, texto: function (st) { return "Solução completa melhor que todas as anteriores: melhor = " + st.num("melhor") + "."; } }
        ] }
    ],
    problemas: {
      resolve: String.raw`Problemas de **escolher um subconjunto** (ou arranjo) que obedeça a regras, ou que seja o melhor:
- existe combinação que soma X? quantas existem? qual usa menos elementos?
- mochila: maior valor sem passar do peso; escalas, orçamento, alocação;
- tabuleiros com regras: N-rainhas, sudoku, palavras cruzadas;
- sempre que uma solução **parcial** já permite dizer que "não vai dar", há espaço para poda.`,
      classicos: [
        { nome: "Combination Sum", onde: "LeetCode 39", ideia: "Todas as combinações que somam o alvo, podendo repetir números.", muda: "ao incluir, a chamada **não avança** o índice (pode usar o mesmo de novo); poda quando a soma passa do alvo." },
        { nome: "Partition Equal Subset Sum", onde: "LeetCode 416", ideia: "Dá para dividir em duas metades de soma igual?", muda: "é a soma-alvo com alvo = total / 2 (se o total for ímpar, não dá). Para n grande, programação dinâmica é melhor." },
        { nome: "Target Sum", onde: "LeetCode 494", ideia: "Pôr + ou − em cada número para atingir o alvo.", muda: "cada elemento tem duas escolhas (+ ou −); não há poda por \"passou do alvo\", porque dá para voltar subtraindo." },
        { nome: "N-Queens", onde: "LeetCode 51", ideia: "N rainhas sem se atacarem.", muda: "decisão = coluna da rainha da linha atual; poda imediata se a coluna ou uma diagonal já estão ocupadas." },
        { nome: "Sudoku Solver", onde: "LeetCode 37", ideia: "Completar o sudoku.", muda: "candidatos = dígitos que não aparecem na linha, coluna e bloco; para na primeira solução." },
        { nome: "0/1 Knapsack", onde: "clássico", ideia: "Maior valor com capacidade limitada.", muda: "a mochila da aula; com **limite superior** («valorAtual + restantes <= melhor») corta ainda mais." }
      ]
    },
    variacoes: [
      { nome: "Sem poda (para comparar)", curto: "sem poda", quando: "você quer medir quanto a poda economiza.",
        muda: String.raw`Tirando «if (soma > alvo) return false», a busca continua funcionando, porque só aceita a soma exata, mas visita ramos inúteis. Compare o número de **chamadas** com a versão com poda, para os mesmos valores.`,
        codigo: SOMA.replace("        if (soma > alvo) {\n            return false;\n        }\n", "").replace("{{v}}", "{8, 6, 7, 5, 3, 10}").replace("{{alvo}}", "15"), programa: { viz: VIZ_SOMA },
        base: SOMA.replace("{{v}}", "{8, 6, 7, 5, 3, 10}").replace("{{alvo}}", "15") },
      { nome: "Mochila com limite superior", curto: "limite superior", quando: "o problema é de otimização, e dá para estimar o MÁXIMO que um ramo ainda pode render.",
        muda: String.raw`Se nem **pegando todos os itens restantes** o ramo supera o melhor já encontrado, corta: «valorAtual + restantes[i] <= melhor». O limite precisa ser **otimista** (nunca menor que o possível), senão poderia cortar a solução ótima.`,
        base: MOCHILA.replace("{{pesos}}", "{2, 3, 4, 5}").replace("{{valores}}", "{3, 4, 5, 6}").replace("{{capacidade}}", "5"),
        codigo: String.raw`public class MochilaBacktracking {
    private static int melhor;
    private static int[] restantes;

    public static int resolver(int[] pesos, int[] valores, int capacidade) {
        melhor = 0;
        restantes = new int[valores.length + 1];
        for (int k = valores.length - 1; k >= 0; k--) {
            restantes[k] = restantes[k + 1] + valores[k];
        }
        buscar(pesos, valores, capacidade, 0, 0, 0);
        return melhor;
    }

    private static void buscar(int[] pesos, int[] valores, int capacidade,
            int i, int pesoAtual, int valorAtual) {
        if (pesoAtual > capacidade) {
            return;
        }
        if (valorAtual + restantes[i] <= melhor) {
            return;
        }
        if (i == pesos.length) {
            if (valorAtual > melhor) {
                melhor = valorAtual;
            }
            return;
        }
        buscar(pesos, valores, capacidade, i + 1,
                pesoAtual + pesos[i], valorAtual + valores[i]);
        buscar(pesos, valores, capacidade, i + 1,
                pesoAtual, valorAtual);
    }

    public static void main(String[] args) {
        int[] pesos = {2, 3, 4, 5};
        int[] valores = {3, 4, 5, 6};
        System.out.println(resolver(pesos, valores, 5));
    }
}`, programa: { viz: VIZ_MOCH } },
      { nome: "Contar quantos subconjuntos somam o alvo", curto: "contar soluções", quando: "a pergunta não é \"existe?\", e sim \"quantos?\".",
        muda: String.raw`Não dá mais para parar no primeiro sucesso: o método devolve um **int** e soma as respostas dos dois ramos. Ao atingir o alvo, conta 1 e para naquele ramo (os valores são positivos, e continuar só aumentaria a soma). A poda «soma > alvo» continua valendo.`,
        base: SOMA.replace("{{v}}", "{4, 7, 9}").replace("{{alvo}}", "10"),
        codigo: String.raw`public class SomaAlvo {
    static int chamadas = 0;

    public static int contar(int[] v, int i, int soma, int alvo) {
        chamadas++;
        if (soma == alvo) {
            return 1;
        }
        if (soma > alvo) {
            return 0;
        }
        if (i == v.length) {
            return 0;
        }
        return contar(v, i + 1, soma + v[i], alvo)
             + contar(v, i + 1, soma, alvo);
    }

    public static void main(String[] args) {
        int[] v = {2, 3, 5, 6, 8, 10};
        int alvo = 10;
        System.out.println(contar(v, 0, 0, alvo) + " (chamadas: " + chamadas + ")");
    }
}`, programa: { viz: [{ tipo: "arvore", metodos: ["contar"], rotulo: function (c) { return "s=" + arg(c, "soma"); }, largura: 54 }] } }
    ],
    erros: [
      { erro: "Podar soma > alvo com números negativos", curto: "poda com negativos", porque: "Com v = {5, 8, -3} e alvo 10: 5 + 8 = 13 passa do alvo e é podado, mas 5 + 8 − 3 = 10! A poda descartou a resposta certa. A hipótese \"valores positivos\" era necessária.",
        codigo: SOMA.replace("{{v}}", "{5, 8, -3}").replace("{{alvo}}", "10") },
      { erro: "Esquecer o ramo \"não incluir\"", curto: "sem não incluir", porque: "Só tentando incluir, a busca testa apenas os prefixos {4}, {4, 7}, {4, 7, 9}. Para {4, 7, 9} e alvo 9, a resposta ({9} sozinho) nunca é testada.",
        codigo: SOMA.replace("        if (existeSoma(v, i + 1, soma + v[i], alvo)) {\n            return true;\n        }\n        return existeSoma(v, i + 1, soma, alvo);", "        return existeSoma(v, i + 1, soma + v[i], alvo);").replace("{{v}}", "{4, 7, 9}").replace("{{alvo}}", "9") },
      { erro: "Variável global sem reiniciar", curto: "melhor sem reiniciar", porque: "«melhor» é static. Sem o «melhor = 0» no começo de «resolver», uma segunda chamada começa com o melhor da primeira e devolve um valor impossível para a mochila nova.",
        codigo: MOCHILA.replace("        melhor = 0;\n", "").replace("{{pesos}}", "{5, 4}").replace("{{valores}}", "{10, 40}").replace("{{capacidade}}", "9").replace("        System.out.println(resolver(pesos, valores, 9));", "        System.out.println(resolver(pesos, valores, 9));\n        System.out.println(resolver(new int[] {1}, new int[] {2}, 1));") },
      { erro: "Tratar heurística como garantia", porque: "\"Pegar primeiro o item de maior valor\" (guloso) é rápido, mas pode perder o ótimo: com capacidade 5 e itens (peso 4, $5), (2, $3), (3, $4), o guloso pega o de $5 e fica com 5, enquanto o ótimo é $7. Poda preserva a corretude; heurística não." }
    ],
    perguntas: [
      { g: "conceito", p: "Qual a diferença entre restrição e poda?", r: "**Restrição** é a regra do problema (somar o alvo, não passar do peso). **Poda** é deixar de explorar um ramo porque sabemos que ele não pode gerar uma resposta válida (ou melhor)." },
      { g: "conceito", p: "Por que a poda «soma > alvo» só vale com números positivos?", r: "Porque com positivos a soma só cresce, e quem passou do alvo nunca volta. Com negativos, um valor adiante poderia trazer a soma de volta ao alvo, e a poda cortaria uma resposta válida." },
      { g: "conceito", p: "A poda muda o custo de pior caso do backtracking?", r: "Não: a árvore completa continua com 2ⁿ folhas, e existem entradas em que quase nada é podado. Na prática, ela costuma reduzir muito os nós visitados." },
      { g: "conceito", p: "Qual a diferença entre poda e heurística?", r: "Poda descarta ramos **comprovadamente** inúteis e mantém a corretude. Heurística escolhe algo que **parece** bom (como pegar o mais valioso primeiro), é rápida, mas não garante o ótimo." },
      { g: "codigo", p: "Por que a poda «if (soma > alvo)» vem ANTES das chamadas recursivas?", r: "Para cortar o ramo imediatamente, sem criar nenhuma chamada filha. Se viesse depois, os filhos já teriam sido explorados." },
      { g: "codigo", p: "Na mochila, por que «melhor» é um campo static, e qual o cuidado?", r: "Porque ele é atualizado por muitas chamadas e precisa sobreviver entre elas. O cuidado é **reinicializar** («melhor = 0») a cada «resolver», senão sobra o valor de uma execução anterior." },
      { g: "codigo", p: "Na mochila, por que a verificação de peso vem antes do caso base «i == pesos.length»?", r: "Para não aceitar como solução completa uma combinação que já estourou a capacidade no último item." },
      { g: "variacao", p: "O que muda para CONTAR quantos subconjuntos somam o alvo?", r: "O método devolve int, soma os resultados dos dois ramos e devolve 1 ao atingir o alvo. Não para mais no primeiro sucesso." },
      { g: "variacao", p: "Que poda extra dá para fazer na mochila?", r: "Limite superior: se «valorAtual + soma dos valores restantes <= melhor», nem pegando tudo esse ramo supera o melhor. O limite precisa ser otimista." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Efeito da poda", enunciado: "O programa conta as chamadas de «existeSoma» para v = {8, 6, 7, 5, 3, 10} e alvo 15. Qual a saída?",
        codigo: SOMA.replace("{{v}}", "{8, 6, 7, 5, 3, 10}").replace("{{alvo}}", "15"), formato: "true/false (chamadas: n)", explicacao: "8 + 7 = 15 é encontrado cedo, e as podas cortam os ramos que passam de 15. Compare com a variação \"sem poda\".", viz: VIZ_SOMA },
      { tipo: "rastreio", titulo: "Mochila", enunciado: "Qual a saída?",
        codigo: MOCHILA.replace("{{pesos}}", "{1, 3, 4, 5}").replace("{{valores}}", "{1, 4, 5, 7}").replace("{{capacidade}}", "7"), formato: "número", explicacao: "Capacidade 7: 3 + 4 (valor 9) ou 1 + 5 (valor 8)... o melhor é 9.", viz: VIZ_MOCH },
      { tipo: "completar", titulo: "Complete a soma-alvo", enunciado: "Complete a busca com poda (valores positivos).",
        modelo: String.raw`    public static boolean existeSoma(int[] v, int i, int soma, int alvo) {
        if (soma == alvo) {
            return true;
        }
        if (⟦⟧) {
            return false;
        }
        if (⟦⟧) {
            return false;
        }
        if (existeSoma(v, i + 1, ⟦⟧, alvo)) {
            return true;
        }
        return existeSoma(v, ⟦⟧, soma, alvo);
    }`, gabarito: ["soma > alvo", "i == v.length", "soma + v[i]", "i + 1"],
        solucao: SOMA.split("\n").slice(3, 19).join("\n").replace("        chamadas++;\n", ""),
        testes: [{ expr: "existeSoma(new int[] {4, 7, 9}, 0, 0, 10)" }, { expr: "existeSoma(new int[] {4, 7, 9}, 0, 0, 13)" }, { expr: "existeSoma(new int[] {4, 7, 9}, 0, 0, 20)" }, { expr: "existeSoma(new int[] {3}, 0, 0, 0)" }] },
      { tipo: "escrever", titulo: "Menor número de moedas (com poda)", enunciado: "Escreva «menosMoedas(int[] moedas, int alvo)»: o menor número de moedas (cada moeda usada **no máximo uma vez**) que soma exatamente o alvo, ou -1 se não der. Use backtracking com a poda «soma > alvo» e um campo «melhor».",
        inicial: "    public static int menosMoedas(int[] moedas, int alvo) {\n        return -1;\n    }",
        solucao: String.raw`    static int melhor;

    public static int menosMoedas(int[] moedas, int alvo) {
        melhor = Integer.MAX_VALUE;
        buscar(moedas, 0, 0, 0, alvo);
        return melhor == Integer.MAX_VALUE ? -1 : melhor;
    }

    static void buscar(int[] m, int i, int soma, int usadas, int alvo) {
        if (soma > alvo || usadas >= melhor) {
            return;
        }
        if (soma == alvo) {
            melhor = usadas;
            return;
        }
        if (i == m.length) {
            return;
        }
        buscar(m, i + 1, soma + m[i], usadas + 1, alvo);
        buscar(m, i + 1, soma, usadas, alvo);
    }`,
        testes: [{ expr: "menosMoedas(new int[] {1, 5, 2, 5, 3}, 10)" }, { expr: "menosMoedas(new int[] {2, 4}, 5)" }, { expr: "menosMoedas(new int[] {7}, 7)" }, { expr: "menosMoedas(new int[] {1, 1, 1, 1}, 3)" }],
        dica: "Reinicie melhor a cada chamada pública. Dá para podar também quando usadas já é ≥ melhor." },
      { tipo: "escolha", titulo: "Poda válida?", enunciado: "Os valores podem ser negativos. Qual poda continua **correta** na soma-alvo?", alternativas: ["nenhuma dessas: sem a hipótese de positivos, «soma > alvo» pode cortar a resposta", "cortar quando soma > alvo", "cortar quando soma < 0", "cortar quando i > n / 2"], correta: 0, explicacao: "Com negativos, uma soma acima do alvo pode voltar a ele. A poda precisa de uma justificativa que valha para a entrada." },
      { tipo: "escolha", titulo: "Heurística", enunciado: "Capacidade 5; itens (peso, valor): (4, 5), (2, 3), (3, 4). Pegar sempre o de maior valor que ainda cabe dá:", alternativas: ["5, mas o ótimo é 7", "7, que é o ótimo", "9", "0"], correta: 0, explicacao: "O guloso pega (4, $5) e não cabe mais nada. O ótimo é (2, $3) + (3, $4) = $7. Heurística não é garantia." }
    ]
  });
})();
