(function () {
  var G = window.Guia;
  function arg(c, nome) { var a = c.args.find(function (x) { return x.indexOf(nome + "=") === 0; }); return a ? a.slice(nome.length + 1) : "?"; }
  G.arg = arg;

  // faixa de candidatos [inicio, fim] (intervalo fechado)
  function faixas(st, n) {
    var i = st.noTopo("inicio"), f = st.noTopo("fim");
    if (i === undefined || f === undefined) return [];
    return [{ de: 0, ate: i, cls: " z-desc" }, { de: i, ate: f + 1, cls: " z-cand" }, { de: f + 1, ate: n, cls: " z-desc" }];
  }
  var PONT = [["inicio", "#14674c", "topo"], ["meio", "#e0392b", "topo"], ["fim", "#215c7a", "topo"]];
  var LEG = [["", "candidatos: de inicio até fim", "#e3f1ea"], ["", "descartados", "#dfe6e8"]];
  function nota(st) { var a = st.num("alvo"); return a !== undefined ? "alvo = " + a : ""; }
  function decisao(desc) {
    return function (st) {
      var v = st.arr("v"), m = st.num("meio"), a = st.num("alvo");
      if (!v || m === undefined) return "";
      var x = v[m];
      if (x === a) return "encontrou";
      return (desc ? x > a : x < a) ? "alvo à direita" : "alvo à esquerda";
    };
  }
  var DICAS = [
    { linha: /while \(inicio <= fim\)/, texto: function (st) { var i = st.num("inicio"), f = st.num("fim"); return i > f ? "**inicio passou de fim**: não sobrou nenhum candidato, então o alvo não está no array." : "Ainda há **" + (f - i + 1) + " candidato(s)** entre inicio e fim."; } },
    { linha: /int meio/, texto: function (st) { return "O meio do intervalo [" + st.num("inicio") + ", " + st.num("fim") + "] é " + st.num("meio") + ", e v[meio] = " + st.arr("v")[st.num("meio")] + "."; } },
    { linha: /inicio = meio \+ 1/, texto: function () { return "Como o array é **crescente**, tudo de inicio até meio é menor que o alvo: a metade esquerda é descartada."; } },
    { linha: /fim = meio - 1/, texto: function () { return "Tudo de meio até fim é maior que o alvo: a metade direita é descartada."; } },
    { linha: /return -1/, texto: function () { return "Intervalo vazio: o alvo não está no array."; } }
  ];

  var ITERATIVA = String.raw`public class BuscaBinaria {
    public static int buscar(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                return meio;
            } else if (v[meio] < alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        int alvo = {{alvo}};
        System.out.println(buscar(v, alvo));
    }
}`;
  var RECURSIVA = String.raw`public class BuscaBinariaRecursiva {
    public static int buscar(int[] v, int alvo) {
        return buscar(v, alvo, 0, v.length - 1);
    }

    private static int buscar(int[] v, int alvo, int inicio, int fim) {
        if (inicio > fim) {
            return -1;
        }
        int meio = inicio + (fim - inicio) / 2;
        if (v[meio] == alvo) {
            return meio;
        }
        if (v[meio] < alvo) {
            return buscar(v, alvo, meio + 1, fim);
        }
        return buscar(v, alvo, inicio, meio - 1);
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        int alvo = {{alvo}};
        System.out.println(buscar(v, alvo));
    }
}`;
  var ENT = [{ nome: "v", rotulo: "array ordenado v", tipo: "int[]", valor: "3, 8, 12, 19, 25, 31, 42, 57, 68" }, { nome: "alvo", rotulo: "alvo", tipo: "int", valor: "42" }];
  var EXS = [{ rotulo: "alvo presente (42)", valores: { alvo: "42" } }, { rotulo: "alvo ausente (4)", valores: { alvo: "4" } }, { rotulo: "primeiro (3)", valores: { alvo: "3" } }, { rotulo: "último (68)", valores: { alvo: "68" } }, { rotulo: "array de 1 elemento", valores: { v: "7", alvo: "7" } }];
  var TAB = { quando: "int meio", colunas: [["inicio", "inicio"], ["fim", "fim"], ["meio", "meio"], ["v[meio]", "v[meio]"], ["decisão", decisao(false)]] };

  function prog(nomeClasse, corpoMetodo, main) {
    return "public class BuscaBinaria {\n" + corpoMetodo + "\n\n    public static void main(String[] args) {\n" + main + "\n    }\n}";
  }

  G.algoritmo({
    slug: "busca-binaria", titulo: "Busca binária", aula: "Aulas 06 e 08", grupo: "Buscas",
    resumo: "Num array **ordenado**, olhe o elemento do meio: se for menor que o alvo, descarte a metade esquerda; se for maior, a direita. A cada passo metade dos candidatos vai embora.",
    custos: [["melhor caso", "O(1)"], ["pior caso", "O(log n)"], ["memória", "O(1)"], ["recursiva", "O(log n) de pilha"]],
    ideia: String.raw`Com {3, 8, 12, 19, 25, 31, 42, 57, 68} e alvo 42, a busca linear olharia sete elementos. A binária olha **dois**: o meio (25) é menor que 42, então tudo à esquerda dele também é, e essa metade inteira é descartada. No que sobrou, o meio já é o 42.

Isso só funciona porque o array está **ordenado**. Esta é a **pré-condição**: comparar com o meio só permite descartar uma metade se a ordem garante onde o alvo pode estar. Em array desordenado a busca binária dá resposta errada, não só lenta.

A aula usa **intervalo fechado**: os candidatos estão entre «inicio» e «fim», inclusive. Enquanto «inicio <= fim», ainda existe pelo menos um candidato. Quando «inicio» passa de «fim», o intervalo ficou vazio e a resposta é «-1».

A conta «inicio + (fim - inicio) / 2» dá o mesmo que «(inicio + fim) / 2», mas nunca estoura o «int» em arrays enormes. Por que a busca é O(log n)? Porque log₂ n é **quantas vezes dá para dividir n por 2 até chegar em 1**: com 1 milhão de elementos, cerca de 20 comparações.`,
    pseudo: String.raw`BUSCA-BINARIA(v, alvo)
    inicio <- 0
    fim <- TAMANHO(v) - 1
    WHILE inicio <= fim DO
        meio <- inicio + (fim - inicio) / 2
        IF v[meio] = alvo THEN
            RETURN meio
        ELSE IF v[meio] < alvo THEN
            inicio <- meio + 1
        ELSE
            fim <- meio - 1
    RETURN -1`,
    invariante: String.raw`**Se o alvo está no array, ele está entre «inicio» e «fim».** Cada atualização precisa manter essa frase verdadeira. É por isso que é «meio + 1» e «meio - 1», e não «meio»: o próprio «meio» já foi conferido e pode sair do intervalo.`,
    programas: [
      { id: "it", nome: "Iterativa (aula 06)", codigo: ITERATIVA, entradas: ENT, exemplos: EXS, tabela: TAB, dicas: DICAS,
        viz: [{ tipo: "array", nome: "v", rotulo: "v", ponteiros: PONT, faixas: faixas, nota: nota, legenda: LEG }] },
      { id: "rec", nome: "Recursiva (aula 08)", codigo: RECURSIVA, entradas: ENT, exemplos: EXS, tabela: { quando: "int meio", colunas: TAB.colunas }, dicas: DICAS.concat([{ linha: /if \(inicio > fim\)/, texto: function (st) { return st.num("inicio") > st.num("fim") ? "Caso base: intervalo vazio, devolve -1." : "Intervalo não vazio: continua."; } }]),
        viz: [{ tipo: "array", nome: "v", rotulo: "v", ponteiros: PONT, faixas: faixas, nota: nota, legenda: LEG },
          { tipo: "arvore", metodos: ["buscar"], titulo: "chamadas recursivas", rotulo: function (c) { return c.args.length > 2 ? "buscar(" + arg(c, "inicio") + ", " + arg(c, "fim") + ")" : "buscar(v, " + arg(c, "alvo") + ")"; } }] }
    ],
    problemas: {
      resolve: String.raw`Qualquer problema em que dê para **descartar metade das possibilidades com uma única pergunta**:
- procurar um valor num array ordenado (existe? em que posição?);
- achar a **primeira** ou a **última** ocorrência, ou onde um valor **seria inserido**;
- "busca na resposta": quando a resposta é um número e dá para testar se um palpite é grande ou pequeno demais (raiz quadrada, menor capacidade, menor velocidade…);
- achar o ponto onde uma condição "vira" de falsa para verdadeira (primeira versão com bug, primeiro dia em que…).`,
      classicos: [
        { nome: "Binary Search", onde: "LeetCode 704", ideia: "Exatamente o algoritmo da aula: devolver o índice do alvo ou -1.", muda: "nada; é a versão base." },
        { nome: "Search Insert Position", onde: "LeetCode 35", ideia: "Se o alvo não existe, dizer em que posição ele entraria para manter a ordem.", muda: "no fim, em vez de «return -1», **«return inicio»**: é onde o intervalo fechou." },
        { nome: "First and Last Position", onde: "LeetCode 34", ideia: "Com valores repetidos, achar o primeiro e o último índice do alvo.", muda: "ao encontrar, **guarda a resposta e continua procurando**: «fim = meio - 1» para a primeira, «inicio = meio + 1» para a última." },
        { nome: "Sqrt(x)", onde: "LeetCode 69", ideia: "A maior raiz inteira r com r·r ≤ x.", muda: "não há array: busca-se no **intervalo de respostas** [0, x], testando «meio * meio <= x»." },
        { nome: "First Bad Version", onde: "LeetCode 278", ideia: "Versões boas e depois só ruins: achar a primeira ruim.", muda: "a comparação vira «ehRuim(meio)», e ao encontrar uma ruim continua à esquerda." },
        { nome: "Search in Rotated Sorted Array", onde: "LeetCode 33", ideia: "Array ordenado mas \"girado\": {31, 42, 57, 68, 3, 8, 12}.", muda: "a cada passo, descobre **qual metade está ordenada** (compara «v[inicio]» com «v[meio]») e vê se o alvo cabe nela." },
        { nome: "Search a 2D Matrix", onde: "LeetCode 74", ideia: "Matriz em que cada linha continua a anterior.", muda: "trata a matriz como um array de «linhas*colunas» posições: «v[meio / colunas][meio % colunas]»." },
        { nome: "Koko Eating Bananas", onde: "LeetCode 875", ideia: "Menor velocidade que termina a tempo.", muda: "busca na resposta: o \"array\" são as velocidades possíveis e o teste é \"dá tempo com essa velocidade?\"." }
      ]
    },
    variacoes: [
      { nome: "Array em ordem DECRESCENTE", curto: "decrescente", quando: "o array está ordenado do maior para o menor, por exemplo {68, 57, 42, …, 3}.",
        muda: String.raw`A ideia é a mesma: conferir o meio e descartar metade. Só **inverte a direção**. Se «v[meio]» é **maior** que o alvo, num array decrescente os menores estão à **direita**, então é «inicio» que anda. Troca uma única comparação: «<» vira «>».`,
        codigo: prog("", String.raw`    public static int buscar(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                return meio;
            } else if (v[meio] > alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return -1;
    }`, "        int[] v = {68, 57, 42, 31, 25, 19, 12, 8, 3};\n        int alvo = 12;\n        System.out.println(buscar(v, alvo));"),
        programa: { tabela: { quando: "int meio", colunas: [["inicio", "inicio"], ["fim", "fim"], ["meio", "meio"], ["v[meio]", "v[meio]"], ["decisão", decisao(true)]] } } },
      { nome: "Primeira ocorrência (com valores repetidos)", curto: "primeira ocorrência", quando: "o alvo pode aparecer várias vezes e você quer o MENOR índice ({1, 2, 2, 2, 2, 5, 9}, alvo 2 → 1).",
        muda: String.raw`A versão da aula devolve **qualquer** índice onde achou. Para a primeira ocorrência, ao encontrar **não para**: guarda «resposta = meio» e continua procurando à **esquerda** («fim = meio - 1»), porque pode haver outro igual antes. Para a última, é o contrário: continua à direita.`,
        codigo: prog("", String.raw`    public static int buscar(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        int resposta = -1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                resposta = meio;
                fim = meio - 1;
            } else if (v[meio] < alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return resposta;
    }`, "        int[] v = {1, 2, 2, 2, 2, 5, 9};\n        int alvo = 2;\n        System.out.println(buscar(v, alvo));") },
      { nome: "Posição de inserção", curto: "posição de inserção", quando: "o alvo pode não existir e você quer saber onde ele entraria mantendo a ordem (LeetCode 35).",
        muda: String.raw`Muda **uma linha**: no fim, em vez de «return -1», «return inicio». Quando o laço termina, «inicio» parou exatamente na primeira posição com valor maior que o alvo, que é onde ele deve entrar.`,
        codigo: prog("", String.raw`    public static int buscar(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                return meio;
            } else if (v[meio] < alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return inicio;
    }`, "        int[] v = {3, 8, 12, 19, 25, 31, 42, 57, 68};\n        int alvo = 20;\n        System.out.println(buscar(v, alvo));") },
      { nome: "Busca na resposta: raiz quadrada inteira", curto: "raiz inteira", quando: "não existe array, mas a resposta é um número num intervalo e dá para testar se um palpite é pequeno ou grande demais.",
        muda: String.raw`O "array" vira o **intervalo de respostas possíveis**, de 0 até x. A pergunta «v[meio] < alvo» vira «meio * meio <= x». Como queremos a **maior** raiz que ainda serve, ao acertar guardamos a resposta e tentamos um número maior. O «(long)» evita estourar o «int» na multiplicação.`,
        codigo: prog("", String.raw`    public static int raiz(int x) {
        int inicio = 0;
        int fim = x;
        int resposta = 0;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if ((long) meio * meio <= x) {
                resposta = meio;
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return resposta;
    }`, "        System.out.println(raiz(50));"),
        programa: { viz: [{ tipo: "html", fn: function (st) { var i = st.num("inicio"), f = st.num("fim"), m = st.num("meio"), x = st.num("x"); if (i === undefined) return ""; return '<div class="vz-rot">intervalo de respostas possíveis</div><div style="font:15px var(--m)">[' + i + ", " + f + "]" + (m !== undefined ? "  ·  meio = " + m + "  ·  meio² = " + (m * m) + (m * m <= x ? " ≤ " : " > ") + x : "") + "</div>"; } }],
          tabela: { quando: "int meio", colunas: [["inicio", "inicio"], ["fim", "fim"], ["meio", "meio"], ["meio²", function (st) { return st.num("meio") * st.num("meio"); }], ["resposta", "resposta"]] } } },
      { nome: "Array rotacionado", curto: "rotacionado", quando: "o array ordenado foi \"girado\": {31, 42, 57, 68, 3, 8, 12, 19, 25} (LeetCode 33).",
        muda: String.raw`Uma das metades sempre continua ordenada. Se «v[inicio] <= v[meio]», a **esquerda** está em ordem: se o alvo cabe entre «v[inicio]» e «v[meio]», vai para a esquerda; senão, para a direita. Caso contrário, a **direita** está em ordem e a pergunta é a mesma do outro lado.`,
        codigo: prog("", String.raw`    public static int buscar(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                return meio;
            }
            if (v[inicio] <= v[meio]) {
                if (v[inicio] <= alvo && alvo < v[meio]) {
                    fim = meio - 1;
                } else {
                    inicio = meio + 1;
                }
            } else {
                if (v[meio] < alvo && alvo <= v[fim]) {
                    inicio = meio + 1;
                } else {
                    fim = meio - 1;
                }
            }
        }
        return -1;
    }`, "        int[] v = {31, 42, 57, 68, 3, 8, 12, 19, 25};\n        int alvo = 8;\n        System.out.println(buscar(v, alvo));") }
    ],
    erros: [
      { erro: "while (inicio < fim)", curto: "inicio < fim", porque: "Com «<», o laço para quando sobra **um** candidato sem conferi-lo. O último elemento nunca é testado: buscar o 68 devolve -1.",
        codigo: ITERATIVA.replace("while (inicio <= fim)", "while (inicio < fim)").replace("{{v}}", "{3, 8, 12, 19, 25, 31, 42, 57, 68}").replace("{{alvo}}", "68") },
      { erro: "inicio = meio (sem o + 1)", curto: "inicio = meio", porque: "Quando sobram dois candidatos, «meio» é igual a «inicio» e o intervalo **não diminui**: laço infinito. O depurador para depois de milhares de passos.",
        codigo: ITERATIVA.replace("inicio = meio + 1", "inicio = meio").replace("{{v}}", "{3, 8, 12, 19, 25, 31, 42, 57, 68}").replace("{{alvo}}", "68") },
      { erro: "Usar em array desordenado", curto: "array desordenado", porque: "Com {42, 3, 68, 8, 25} e alvo 3: o meio é 68 > 3, então a busca vai para a esquerda, vê 42 > 3 e desiste. O 3 estava lá. Pré-condição quebrada = resposta errada.",
        codigo: ITERATIVA.replace("{{v}}", "{42, 3, 68, 8, 25}").replace("{{alvo}}", "3") },
      { erro: "fim = v.length (misturar intervalo aberto e fechado)", curto: "fim = v.length", porque: "Com «<=» o intervalo é fechado, e «fim» precisa ser um índice válido. Com «fim = v.length», procurar um valor maior que todos acessa «v[9]»: ArrayIndexOutOfBoundsException.",
        codigo: ITERATIVA.replace("int fim = v.length - 1;", "int fim = v.length;").replace("{{v}}", "{3, 8, 12, 19, 25, 31, 42, 57, 68}").replace("{{alvo}}", "99") }
    ],
    perguntas: [
      { g: "conceito", p: "Qual é a pré-condição da busca binária, e o que acontece se ela for quebrada?", r: "O array precisa estar **ordenado** segundo o mesmo critério da comparação. Sem isso, descartar uma metade não é justificado e a busca pode devolver -1 para um valor que está no array: é erro de **corretude**, não só de desempenho." },
      { g: "conceito", p: "Por que a busca binária é O(log n)? Quantas comparações, no máximo, para 1 milhão de elementos?", r: "Cada passo descarta metade dos candidatos, então o número de passos é quantas vezes dá para dividir n por 2 até sobrar 1: log₂ n. Para 1.000.000, cerca de **20** (2²⁰ ≈ 1.048.576)." },
      { g: "conceito", p: "Qual a frase (invariante) que justifica cada atualização de «inicio» e «fim»?", r: "\"Se o alvo está no array, ele está entre «inicio» e «fim».\" Quando «v[meio] < alvo», tudo até «meio» é menor (o array é crescente), então «inicio = meio + 1» mantém a frase." },
      { g: "conceito", p: "Busca linear ou binária: em que situação a linear é a melhor escolha?", r: "Quando o array **não está ordenado** e você vai fazer poucas buscas: ordenar custa O(n log n), mais que uma busca linear O(n). Se forem muitas buscas no mesmo array, ordenar uma vez (ou usar um HashSet) compensa." },
      { g: "codigo", p: "Por que «meio = inicio + (fim - inicio) / 2» e não «(inicio + fim) / 2»?", r: "Dão o mesmo resultado, mas «inicio + fim» pode passar de 2.147.483.647 (o máximo do «int») em arrays enormes e virar negativo. «fim - inicio» nunca estoura." },
      { g: "codigo", p: "Por que é «inicio = meio + 1», e não «inicio = meio»?", r: "O «meio» já foi comparado e não é o alvo, então pode sair do intervalo. Com «inicio = meio», quando sobram dois candidatos «meio» fica igual a «inicio» e o intervalo nunca diminui: laço infinito. Rode esse erro na seção Erros comuns." },
      { g: "codigo", p: "Na versão recursiva, quem faz o papel do «while (inicio <= fim)»?", r: "O **caso base** «if (inicio > fim) return -1». Os limites viram parâmetros, e cada chamada recursiva passa um intervalo menor. A pilha de chamadas tem profundidade O(log n)." },
      { g: "codigo", p: "Quando o laço termina sem achar o alvo, quanto valem «inicio» e «fim» em relação um ao outro?", r: "«inicio = fim + 1». O intervalo ficou vazio. E «inicio» é justamente a posição onde o alvo seria inserido (é a variação \"posição de inserção\")." },
      { g: "variacao", p: "O array está em ordem **decrescente**. O que muda no código?", d: "Pense para que lado estão os menores.", r: "Só a direção: se «v[meio] > alvo», num array decrescente os valores menores estão à **direita**, então «inicio = meio + 1». Troca «<» por «>» na comparação do else if." },
      { g: "variacao", p: "Com valores repetidos, como achar a **primeira** ocorrência?", r: "Ao encontrar, guarda «resposta = meio» e **continua** procurando à esquerda com «fim = meio - 1». No fim, devolve a resposta guardada (ou -1)." },
      { g: "variacao", p: "Como usar busca binária para calcular a raiz quadrada inteira de x sem nenhum array?", r: "Busca no **intervalo de respostas** [0, x]: para cada «meio», testa «meio * meio <= x». Se sim, guarda e tenta maior («inicio = meio + 1»); se não, tenta menor («fim = meio - 1»)." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Quais meios são visitados?", enunciado: "O programa abaixo imprime o valor de «meio» a cada volta do laço e, no fim, o retorno. O que ele imprime? (digite os números na ordem, separados por espaço)",
        codigo: String.raw`public class Rastreio {
    public static int buscar(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            System.out.println(meio);
            if (v[meio] == alvo) {
                return meio;
            } else if (v[meio] < alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] v = {2, 5, 8, 12, 16, 21, 33, 40};
        System.out.println(buscar(v, 21));
    }
}`, formato: "ex.: 3 5 6 5", explicacao: "Intervalos: [0,7] → meio 3 (12 < 21) → [4,7] → meio 5 (21 = alvo). Imprime 3, 5 e o retorno 5.",
        viz: [{ tipo: "array", nome: "v", ponteiros: PONT, faixas: faixas, legenda: LEG }] },
      { tipo: "rastreio", titulo: "Onde param inicio e fim?", enunciado: "Qual é a saída? (o programa imprime «inicio» e «fim» depois do laço, para um alvo que **não** está no array)",
        codigo: String.raw`public class Rastreio2 {
    public static void main(String[] args) {
        int[] v = {3, 8, 12, 19, 25, 31, 42, 57, 68};
        int alvo = 20;
        int inicio = 0;
        int fim = v.length - 1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                break;
            } else if (v[meio] < alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        System.out.println(inicio + " " + fim);
    }
}`, formato: "inicio fim", explicacao: "O laço termina com «inicio = fim + 1»: inicio = 4 e fim = 3. O 4 é onde o 20 seria inserido, entre o 19 e o 25.",
        viz: [{ tipo: "array", nome: "v", ponteiros: PONT, faixas: faixas, legenda: LEG }] },
      { tipo: "completar", titulo: "Complete a busca binária da aula", enunciado: "Preencha as lacunas para que «buscar» devolva o índice do alvo, ou -1.",
        modelo: String.raw`    public static int buscar(int[] v, int alvo) {
        int inicio = 0;
        int fim = ⟦⟧;
        while (⟦⟧) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                return meio;
            } else if (v[meio] < alvo) {
                inicio = ⟦⟧;
            } else {
                fim = ⟦⟧;
            }
        }
        return -1;
    }`, gabarito: ["v.length - 1", "inicio <= fim", "meio + 1", "meio - 1"],
        solucao: ITERATIVA.split("\n").slice(1, 16).join("\n"),
        testes: [{ expr: "buscar(new int[] {3, 8, 12, 19, 25, 31, 42, 57, 68}, 42)" }, { expr: "buscar(new int[] {3, 8, 12, 19, 25, 31, 42, 57, 68}, 4)" }, { expr: "buscar(new int[] {3, 8, 12, 19, 25, 31, 42, 57, 68}, 68)" }, { expr: "buscar(new int[] {3, 8, 12, 19, 25, 31, 42, 57, 68}, 3)" }, { expr: "buscar(new int[] {7}, 7)" }, { expr: "buscar(new int[] {}, 1)" }],
        explicacao: "Intervalo fechado: começa em [0, v.length - 1], continua enquanto houver candidato (inicio <= fim) e tira o meio do intervalo a cada passo." },
      { tipo: "escrever", titulo: "Última ocorrência", enunciado: "Escreva «ultima(int[] v, int alvo)»: devolve o **maior** índice onde «alvo» aparece em «v» (ordenado, com repetidos), ou -1. Precisa ser O(log n).",
        inicial: String.raw`    public static int ultima(int[] v, int alvo) {
        // seu código aqui
        return -1;
    }`,
        solucao: String.raw`    public static int ultima(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        int resposta = -1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                resposta = meio;
                inicio = meio + 1;
            } else if (v[meio] < alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return resposta;
    }`,
        testes: [{ expr: "ultima(new int[] {1, 2, 2, 2, 2, 5, 9}, 2)" }, { expr: "ultima(new int[] {1, 2, 2, 2, 2, 5, 9}, 9)" }, { expr: "ultima(new int[] {1, 2, 2, 2, 2, 5, 9}, 3)" }, { expr: "ultima(new int[] {4, 4, 4}, 4)" }, { expr: "ultima(new int[] {}, 4)" }],
        dica: "Igual à primeira ocorrência, mas ao encontrar continue procurando à DIREITA.",
        viz: [{ tipo: "array", nome: "v", ponteiros: PONT, faixas: faixas, legenda: LEG }] },
      { tipo: "escrever", titulo: "Busca em array decrescente", enunciado: "Escreva «buscarDesc(int[] v, int alvo)» para um array ordenado em ordem **decrescente**. Devolve o índice do alvo ou -1.",
        inicial: String.raw`    public static int buscarDesc(int[] v, int alvo) {
        // v está em ordem decrescente: {68, 57, 42, ...}
        return -1;
    }`,
        solucao: String.raw`    public static int buscarDesc(int[] v, int alvo) {
        int inicio = 0;
        int fim = v.length - 1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] == alvo) {
                return meio;
            } else if (v[meio] > alvo) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }
        return -1;
    }`,
        testes: [{ expr: "buscarDesc(new int[] {68, 57, 42, 31, 25, 19, 12, 8, 3}, 12)" }, { expr: "buscarDesc(new int[] {68, 57, 42, 31, 25, 19, 12, 8, 3}, 68)" }, { expr: "buscarDesc(new int[] {68, 57, 42, 31, 25, 19, 12, 8, 3}, 3)" }, { expr: "buscarDesc(new int[] {68, 57, 42, 31, 25, 19, 12, 8, 3}, 20)" }],
        dica: "A estrutura é a mesma. Pense para que lado estão os valores menores." },
      { tipo: "escolha", titulo: "Quantas comparações?", enunciado: "Um array ordenado tem 1.000 elementos. No **pior caso**, quantas vezes a busca binária compara com «v[meio]»?", alternativas: ["cerca de 10", "cerca de 100", "500", "1000"], correta: 0, explicacao: "log₂ 1000 ≈ 10 (2¹⁰ = 1024). A cada comparação o intervalo cai pela metade: 1000 → 500 → 250 → … → 1." },
      { tipo: "escolha", titulo: "Qual variação?", enunciado: "Você quer saber em que posição inserir o 20 em {3, 8, 12, 19, 25} mantendo a ordem. O que muda na busca da aula?", alternativas: ["«return inicio» no lugar de «return -1»", "trocar «<» por «>»", "usar «while (inicio < fim)»", "começar com «fim = v.length»"], correta: 0, explicacao: "Quando o laço termina, «inicio» aponta para o primeiro elemento maior que o alvo: é a posição de inserção (LeetCode 35)." }
    ]
  });
})();
