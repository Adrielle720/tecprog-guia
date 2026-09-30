(function () {
  var G = window.Guia, arg = function (c, n) { var a = c.args.find(function (x) { return x.indexOf(n + "=") === 0; }); return a ? a.slice(n.length + 1) : "?"; };

  var FATORIAL = String.raw`public class Fatorial {
    public static int fatorial(int n) {
        if (n == 0) {
            return 1;
        }
        return n * fatorial(n - 1);
    }

    public static void main(String[] args) {
        int n = {{n}};
        System.out.println(fatorial(n));
    }
}`;
  var SOMA = String.raw`public class RecursaoArrays {
    public static int soma(int[] v) {
        return somaAPartir(v, 0);
    }

    private static int somaAPartir(int[] v, int i) {
        if (i == v.length) {
            return 0;
        }
        return v[i] + somaAPartir(v, i + 1);
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        System.out.println(soma(v));
    }
}`;
  var CONTAR = String.raw`public class ContarRecursivo {
    public static int contar(int[] v, int alvo) {
        return contarAPartir(v, alvo, 0);
    }

    private static int contarAPartir(int[] v, int alvo, int i) {
        if (i == v.length) {
            return 0;
        }
        int resto = contarAPartir(v, alvo, i + 1);
        if (v[i] == alvo) {
            return 1 + resto;
        }
        return resto;
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        int alvo = {{alvo}};
        System.out.println(contar(v, alvo));
    }
}`;
  var CONTAGEM = String.raw`public class RecursaoBasica {
    public static void contagem(int n) {
        if (n == 0) {
            System.out.println("fim");
            return;
        }
        System.out.println(n);
        contagem(n - 1);
    }

    public static void main(String[] args) {
        contagem({{n}});
    }
}`;
  function arvore(metodos, rot) { return { tipo: "arvore", metodos: metodos, titulo: "pilha de chamadas vista como árvore", rotulo: rot }; }
  var VIZ_FAT = [arvore(["fatorial"], function (c) { return "fatorial(" + arg(c, "n") + ")"; }),
    { tipo: "html", fn: function (st) { var fs = st.frames.filter(function (f) { return f.metodo === "fatorial"; }); if (!fs.length) return ""; return '<div class="vz-rot">o que falta calcular</div><div style="font:15px var(--m)">' + fs.map(function (f) { var n = f.vars[0][1].v; return n === 0 ? "1" : n + " × "; }).join("") + (fs[fs.length - 1].vars[0][1].v === 0 ? "" : "fatorial(" + (fs[fs.length - 1].vars[0][1].v - 1) + ")") + "</div>"; } }];
  var VIZ_SOMA = [{ tipo: "array", nome: "v", ponteiros: [["i", "#e0392b", "topo"]], faixas: function (st, n) { var i = st.noTopo("i"); return i === undefined ? [] : [{ de: 0, ate: i, cls: " z-desc" }, { de: i, ate: n, cls: " z-cand" }]; }, legenda: [["", "o que esta chamada ainda precisa somar", "#e3f1ea"]] },
    arvore(["somaAPartir"], function (c) { return "soma(i=" + arg(c, "i") + ")"; })];

  G.algoritmo({
    slug: "recursao", titulo: "Recursão", aula: "Aulas 07 e 08", grupo: "Recursão",
    resumo: "Um método que **chama a si mesmo** com um problema menor. Precisa de caso base, passo recursivo e progresso. A pilha de chamadas guarda quem está esperando.",
    custos: [["fatorial(n)", "n + 1 chamadas"], ["tempo", "O(n)"], ["pilha", "O(n)"], ["fibonacci ingênuo", "O(2ⁿ)"]],
    ideia: String.raw`Para imprimir uma contagem regressiva a partir de n: imprima n e resolva **a contagem a partir de n - 1**. O problema fica menor a cada chamada, até chegar num caso que se resolve direto.

Todo método recursivo precisa de três coisas:
- **Caso base**: situação resolvida sem nova chamada («n == 0»).
- **Passo recursivo**: chamada para uma versão menor do problema («fatorial(n - 1)»).
- **Progresso**: garantia de que as chamadas se aproximam do caso base (n diminui).

Enquanto uma chamada espera a outra terminar, o Java guarda o estado dela na **pilha de chamadas**. No depurador, veja a pilha crescer até o caso base e depois **voltar**, com cada chamada recebendo o valor da de cima e terminando a conta.

Em arrays, o estado da recursão costuma ser um **índice**: «somaAPartir(v, i)» soma de i até o fim. O método público esconde esse detalhe: «soma(v)» chama «somaAPartir(v, 0)».`,
    pseudo: String.raw`FATORIAL(n)
    IF n = 0 THEN
        RETURN 1
    RETURN n * FATORIAL(n - 1)

SOMA-A-PARTIR(v, i)
    IF i = v.LENGTH THEN
        RETORNA 0
    RETORNA v[i] + SOMA-A-PARTIR(v, i + 1)`,
    invariante: String.raw`**Confie na chamada menor.** Ao escrever «n * fatorial(n - 1)», suponha que «fatorial(n - 1)» já devolve a resposta certa para n - 1. Se o caso base está certo e cada passo usa corretamente a resposta menor, o todo está certo (é indução).`,
    programas: [
      { id: "fat", nome: "Fatorial", codigo: FATORIAL, entradas: [{ nome: "n", tipo: "int", valor: "4" }], exemplos: [{ rotulo: "n = 0 (caso base direto)", valores: { n: "0" } }, { rotulo: "n = 6", valores: { n: "6" } }, { rotulo: "n = 13 (estoura o int!)", valores: { n: "13" } }, { rotulo: "n = -1 (nunca chega no caso base)", valores: { n: "-1" }, erro: true }],
        viz: VIZ_FAT, tabela: { quando: function (st, txt) { return st.passo.ret && /return/.test(txt); }, colunas: [["n", "n"], ["devolve", function (st) { var v = st.passo.valor; return v ? v.v : "—"; }]] },
        dicas: [
          { linha: /if \(n == 0\)/, texto: function (st) { return st.num("n") === 0 ? "**Caso base**: n chegou a 0. Agora as chamadas começam a voltar." : "Ainda não é o caso base: precisa de fatorial(" + (st.num("n") - 1) + "), e esta chamada fica **esperando** na pilha."; } },
          { linha: /public static int fatorial/, tipo: "chamada", texto: function (st) { return "Nova chamada empilhada. A pilha tem agora " + st.frames.length + " chamada(s)."; } },
          { linha: /return n \* fatorial/, texto: function (st) { var v = st.passo.valor; return v && st.passo.ret ? "A chamada de cima devolveu " + (v.v / st.num("n")) + "; esta multiplica por n = " + st.num("n") + " e devolve " + v.v + "." : ""; } }
        ] },
      { id: "soma", nome: "Soma de array (índice como estado)", codigo: SOMA, entradas: [{ nome: "v", tipo: "int[]", valor: "4, 7, 2, 9" }], exemplos: [{ rotulo: "array vazio", valores: { v: "" } }, { rotulo: "um elemento", valores: { v: "5" } }],
        viz: VIZ_SOMA, dicas: [{ linha: /if \(i == v.length\)/, texto: function (st) { return st.num("i") === st.arr("v").length ? "**Caso base**: i chegou ao fim, não há mais nada para somar." : "Soma v[" + st.num("i") + "] = " + st.arr("v")[st.num("i")] + " com a soma do resto, que outra chamada vai calcular."; } }] },
      { id: "contar", nome: "Contar (trabalho depois da chamada)", codigo: CONTAR, entradas: [{ nome: "v", tipo: "int[]", valor: "1, 3, 1, 1" }, { nome: "alvo", tipo: "int", valor: "1" }],
        viz: [{ tipo: "array", nome: "v", ponteiros: [["i", "#e0392b", "topo"]] }, arvore(["contarAPartir"], function (c) { return "contar(i=" + arg(c, "i") + ")"; })],
        dicas: [{ linha: /int resto =/, texto: function (st) { return st.passo.voltou !== undefined ? "" : "Primeiro conta no **resto** (i + 1 em diante); a contribuição da posição " + st.num("i") + " só entra na volta."; } }] },
      { id: "cont", nome: "Contagem regressiva", codigo: CONTAGEM, entradas: [{ nome: "n", tipo: "int", valor: "3" }],
        viz: [arvore(["contagem"], function (c) { return "contagem(" + arg(c, "n") + ")"; })] }
    ],
    problemas: {
      resolve: String.raw`Problemas que se definem **em termos de uma versão menor de si mesmos**:
- fórmulas recursivas (fatorial, potência, Fibonacci, soma de 1 até n);
- processar arrays, Strings e listas "pelo primeiro elemento + o resto";
- estruturas recursivas: árvores, pastas dentro de pastas, expressões com parênteses;
- a base de **divisão e conquista** (mergesort, quicksort, busca binária recursiva), de **DFS** e de **backtracking**.`,
      classicos: [
        { nome: "Fibonacci Number", onde: "LeetCode 509", ideia: "fib(n) = fib(n-1) + fib(n-2), com fib(0) = 0 e fib(1) = 1.", muda: "**duas** chamadas por nível: a árvore cresce exponencialmente (O(2ⁿ)). Guardar resultados já calculados (memoização) derruba para O(n)." },
        { nome: "Pow(x, n)", onde: "LeetCode 50", ideia: "Calcular xⁿ.", muda: "em vez de n - 1, divide o expoente por 2: xⁿ = (x^(n/2))². Vira O(log n)." },
        { nome: "Reverse String / palíndromo", onde: "LeetCode 344", ideia: "Inverter ou checar um texto.", muda: "o estado são **dois índices** (início e fim) que se aproximam; caso base quando se cruzam." },
        { nome: "Power of Two", onde: "LeetCode 231", ideia: "n é potência de 2?", muda: "caso base n == 1; se n é par, pergunta sobre n / 2; senão, false." },
        { nome: "Climbing Stairs", onde: "LeetCode 70", ideia: "De quantas formas subir n degraus, de 1 em 1 ou 2 em 2?", muda: "é Fibonacci disfarçado: formas(n) = formas(n-1) + formas(n-2)." },
        { nome: "Merge Two Sorted Lists", onde: "LeetCode 21", ideia: "Intercalar duas listas encadeadas ordenadas.", muda: "\"o menor dos dois primeiros + o merge do resto\": o mesmo padrão primeiro + resto." }
      ]
    },
    variacoes: [
      { nome: "Com acumulador", curto: "acumulador", quando: "você quer deixar visível o que já foi calculado (e deixar a recursão \"de cauda\").",
        muda: String.raw`O resultado parcial vai **como parâmetro**: «soma(n - 1, acumulado + n)». No caso base, o acumulador **já é a resposta**, e na volta ninguém faz mais conta. Compare a árvore: os valores devolvidos sobem iguais.`,
        base: FATORIAL.replace("{{n}}", "4"),
        codigo: String.raw`public class Fatorial {
    public static int fatorial(int n) {
        return fatorial(n, 1);
    }

    private static int fatorial(int n, int acumulado) {
        if (n == 0) {
            return acumulado;
        }
        return fatorial(n - 1, acumulado * n);
    }

    public static void main(String[] args) {
        int n = 4;
        System.out.println(fatorial(n));
    }
}`, programa: { viz: [arvore(["fatorial"], function (c) { return c.args.length > 1 ? "f(" + arg(c, "n") + ", acc=" + arg(c, "acumulado") + ")" : "fatorial(" + arg(c, "n") + ")"; })] } },
      { nome: "Imprimir DEPOIS da chamada (ordem crescente)", curto: "imprimir depois", quando: "a ordem da saída importa: antes da chamada imprime na ida, depois da chamada imprime na volta.",
        muda: String.raw`Basta trocar a ordem de duas linhas. Com a impressão **depois** da chamada recursiva, nada é impresso na ida; na volta, as chamadas terminam de 1 até n, então sai **1, 2, 3**.`,
        base: CONTAGEM.replace("{{n}}", "3"),
        codigo: String.raw`public class RecursaoBasica {
    public static void contagem(int n) {
        if (n == 0) {
            System.out.println("fim");
            return;
        }
        contagem(n - 1);
        System.out.println(n);
    }

    public static void main(String[] args) {
        contagem(3);
    }
}`, programa: { viz: [arvore(["contagem"], function (c) { return "contagem(" + arg(c, "n") + ")"; })] } },
      { nome: "Duas chamadas: Fibonacci", curto: "Fibonacci", quando: "a definição usa os DOIS anteriores: fib(n) = fib(n-1) + fib(n-2).",
        muda: String.raw`Dois casos base (n = 0 e n = 1) e **duas chamadas**. A árvore deixa de ser uma linha e vira uma árvore de verdade, com muito trabalho repetido (fib(2) aparece várias vezes). Com n = 30, são mais de 1,6 milhão de chamadas.`,
        base: FATORIAL.replace("{{n}}", "4"),
        codigo: String.raw`public class Fibonacci {
    public static int fib(int n) {
        if (n < 2) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        int n = 5;
        System.out.println(fib(n));
    }
}`, programa: { viz: [arvore(["fib"], function (c) { return "fib(" + arg(c, "n") + ")"; })] } },
      { nome: "Potência rápida (divide o expoente)", curto: "potência rápida", quando: "o \"problema menor\" pode ser MUITO menor: metade, em vez de n - 1.",
        muda: String.raw`Em vez de «x * potencia(x, n - 1)» (n chamadas), usa «metade = potencia(x, n / 2)» e devolve «metade * metade» (vezes x se n for ímpar). São só log n chamadas. É o mesmo truque da busca binária: dividir por 2.`,
        base: FATORIAL.replace("{{n}}", "4"),
        codigo: String.raw`public class Potencia {
    public static long potencia(long x, int n) {
        if (n == 0) {
            return 1;
        }
        long metade = potencia(x, n / 2);
        if (n % 2 == 0) {
            return metade * metade;
        }
        return metade * metade * x;
    }

    public static void main(String[] args) {
        System.out.println(potencia(2, 10));
    }
}`, programa: { viz: [arvore(["potencia"], function (c) { return "pot(" + arg(c, "x") + ", " + arg(c, "n") + ")"; })] } }
    ],
    erros: [
      { erro: "Nunca chegar no caso base: fatorial(-1)", curto: "fatorial(-1)", porque: "Começando em -1 e subtraindo 1, n nunca vale 0. As chamadas se empilham até acabar a memória da pilha: **StackOverflowError**. Valide a entrada no método público.",
        codigo: FATORIAL.replace("{{n}}", "-1") },
      { erro: "Sem progresso: chamar com o mesmo n", curto: "sem progresso", porque: "«fatorial(n)» dentro de «fatorial(n)» nunca muda o problema. Mesmo efeito: StackOverflowError.",
        codigo: FATORIAL.replace("n * fatorial(n - 1)", "n * fatorial(n)").replace("{{n}}", "3") },
      { erro: "Caso base errado", curto: "caso base n == 1", porque: "Com «if (n == 1) return 1», «fatorial(0)» passa direto, vai para -1 e nunca para. O caso base precisa cobrir **a menor entrada válida**.",
        codigo: FATORIAL.replace("if (n == 0)", "if (n == 1)").replace("{{n}}", "0") },
      { erro: "Esquecer o return do resultado", porque: "Escrever só «fatorial(n - 1);» e não usar o valor devolvido: o resultado da chamada se perde. Em método que devolve int o Java nem compila (\"missing return statement\")." }
    ],
    perguntas: [
      { g: "conceito", p: "Quais são os três elementos de todo método recursivo que termina?", r: "**Caso base** (resolve sem nova chamada), **passo recursivo** (chama para um problema menor) e **progresso** (cada chamada fica mais perto do caso base)." },
      { g: "conceito", p: "O que é a pilha de chamadas, e o que acontece com ela em fatorial(4)?", r: "É onde o Java guarda cada chamada que ainda está esperando. fatorial(4) chama fatorial(3), que chama fatorial(2)… até fatorial(0): 5 chamadas empilhadas. Depois elas saem em ordem inversa, cada uma terminando sua multiplicação." },
      { g: "conceito", p: "O que é StackOverflowError e quando aparece?", r: "É o erro de quando a pilha de chamadas enche. Aparece em recursão que nunca chega ao caso base (sem progresso ou com o caso base errado) ou em recursão profunda demais." },
      { g: "conceito", p: "Qual o custo de «somaAPartir(v, 0)» em tempo e em memória?", r: "Tempo O(n): uma chamada por elemento. Memória O(n) de **pilha**: todas as chamadas ficam empilhadas até o caso base. A versão com laço usaria O(1) de memória." },
      { g: "codigo", p: "O que muda entre imprimir **antes** e **depois** da chamada recursiva em «contagem»?", r: "Antes: imprime na ida (3, 2, 1). Depois: nada sai na ida; imprime na volta (1, 2, 3). A recursão permite trabalhar antes, depois ou nos dois momentos." },
      { g: "codigo", p: "Por que existe um método público «soma(v)» e um privado «somaAPartir(v, i)»?", r: "O público oferece um contrato simples (quem usa não precisa saber do índice). O privado carrega o **estado** da recursão (a posição atual). É o padrão das aulas 08 e 09." },
      { g: "codigo", p: "Em «contarAPartir», o trabalho acontece antes ou depois da chamada recursiva?", r: "**Depois**: primeiro «int resto = contarAPartir(v, alvo, i + 1)», e só na volta soma 1 se «v[i] == alvo»." },
      { g: "variacao", p: "Por que Fibonacci recursivo \"ingênuo\" é tão lento?", r: "Cada chamada gera duas, e os mesmos valores são recalculados muitas vezes (fib(2) aparece dezenas de vezes em fib(10)). Cresce como O(2ⁿ). Memoização (guardar resultados) resolve." },
      { g: "variacao", p: "Como calcular xⁿ com só O(log n) chamadas?", r: "Divida o expoente: «metade = potencia(x, n / 2)»; se n é par, devolve metade·metade; se ímpar, metade·metade·x." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Qual a saída?", enunciado: "O que o programa imprime? (uma linha por número)",
        codigo: String.raw`public class Misterio {
    public static void f(int n) {
        if (n == 0) {
            return;
        }
        System.out.println(n);
        f(n - 1);
        System.out.println(n * 10);
    }
    public static void main(String[] args) {
        f(3);
    }
}`, formato: "ex.: 1 2 3 …", explicacao: "Na ida imprime 3, 2, 1. Na volta, cada chamada termina e imprime n·10: primeiro a de n = 1 (10), depois 20 e 30.",
        viz: [arvore(["f"], function (c) { return "f(" + arg(c, "n") + ")"; })] },
      { tipo: "rastreio", titulo: "Quantas chamadas?", enunciado: "Quantas vezes o método «fib» é chamado para calcular fib(5)? O programa conta e imprime.",
        codigo: String.raw`public class ContaChamadas {
    static int chamadas = 0;
    public static int fib(int n) {
        chamadas++;
        if (n < 2) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }
    public static void main(String[] args) {
        System.out.println(fib(5) + " " + chamadas);
    }
}`, formato: "fib(5) chamadas", explicacao: "fib(5) = 5, com 15 chamadas. Veja a árvore no passo a passo: fib(2) é calculado 3 vezes e fib(1), 5 vezes.",
        viz: [arvore(["fib"], function (c) { return "fib(" + arg(c, "n") + ")"; })] },
      { tipo: "completar", titulo: "Complete a soma de 1 até n", enunciado: "Complete «somaAte(n)» (n ≥ 0), recursivo.",
        modelo: "    public static int somaAte(int n) {\n        if (⟦⟧) {\n            return ⟦⟧;\n        }\n        return ⟦⟧;\n    }", gabarito: ["n == 0", "0", "n + somaAte(n - 1)"],
        solucao: "    public static int somaAte(int n) {\n        if (n == 0) {\n            return 0;\n        }\n        return n + somaAte(n - 1);\n    }",
        testes: [{ expr: "somaAte(4)" }, { expr: "somaAte(0)" }, { expr: "somaAte(1)" }, { expr: "somaAte(100)" }] },
      { tipo: "escrever", titulo: "Maior elemento, recursivo", enunciado: "Escreva «maiorAPartir(int[] v, int i)» que devolve o maior valor de «v[i..fim]» (v tem pelo menos um elemento e i é válido). **Sem laços.**",
        inicial: "    public static int maiorAPartir(int[] v, int i) {\n        // caso base: i é o último índice\n        return 0;\n    }",
        solucao: String.raw`    public static int maiorAPartir(int[] v, int i) {
        if (i == v.length - 1) {
            return v[i];
        }
        int maiorResto = maiorAPartir(v, i + 1);
        if (v[i] > maiorResto) {
            return v[i];
        }
        return maiorResto;
    }`,
        testes: [{ expr: "maiorAPartir(new int[] {8, 3, 12, 5, 9}, 0)" }, { expr: "maiorAPartir(new int[] {7}, 0)" }, { expr: "maiorAPartir(new int[] {-3, -1, -7}, 0)" }, { expr: "maiorAPartir(new int[] {1, 9, 2}, 2)" }],
        dica: "Primeiro calcule o maior do resto (i + 1 em diante), depois compare com v[i].",
        viz: [{ tipo: "array", nome: "v", ponteiros: [["i", "#e0392b", "topo"]] }, arvore(["maiorAPartir"], function (c) { return "maior(i=" + arg(c, "i") + ")"; })] },
      { tipo: "escrever", titulo: "Palíndromo recursivo", enunciado: "Escreva «ehPalindromo(String s, int ini, int fim)»: true se «s» lido de «ini» até «fim» é igual de trás para frente.",
        inicial: "    public static boolean ehPalindromo(String s, int ini, int fim) {\n        return false;\n    }",
        solucao: String.raw`    public static boolean ehPalindromo(String s, int ini, int fim) {
        if (ini >= fim) {
            return true;
        }
        if (s.charAt(ini) != s.charAt(fim)) {
            return false;
        }
        return ehPalindromo(s, ini + 1, fim - 1);
    }`,
        testes: [{ expr: "ehPalindromo(\"arara\", 0, 4)" }, { expr: "ehPalindromo(\"java\", 0, 3)" }, { expr: "ehPalindromo(\"a\", 0, 0)" }, { expr: "ehPalindromo(\"abba\", 0, 3)" }, { expr: "ehPalindromo(\"ab\", 0, 1)" }],
        dica: "Dois índices que se aproximam. O caso base é quando eles se encontram ou se cruzam." },
      { tipo: "escolha", titulo: "Qual quebra a recursão?", enunciado: "Qual destas versões de «fatorial» dá StackOverflowError para n = 3?", alternativas: ["«return n * fatorial(n + 1);»", "«if (n <= 1) return 1;» como caso base", "«return fatorial(n - 1) * n;»", "validar «n < 0» e lançar exceção"], correta: 0, explicacao: "Com n + 1 não há progresso rumo ao caso base: n só cresce." }
    ]
  });
})();
