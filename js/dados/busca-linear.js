(function () {
  var G = window.Guia;
  function faixas(st, n) { var i = st.noTopo("i"); if (i === undefined) return []; return [{ de: 0, ate: i, cls: " z-desc" }]; }
  var PONT = [["i", "#e0392b", "topo"]];
  function nota(st) { var a = st.num("alvo"); return a !== undefined ? "alvo = " + a : ""; }
  var LEG = [["", "já comparados", "#dfe6e8"]];

  var INDICE = String.raw`public class BuscaLinear {
    public static int buscarIndice(int[] v, int alvo) {
        for (int i = 0; i < v.length; i++) {
            if (v[i] == alvo) {
                return i;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        int alvo = {{alvo}};
        System.out.println(buscarIndice(v, alvo));
    }
}`;
  var CONTAR = String.raw`public class BuscaLinear {
    public static int contar(int[] v, int alvo) {
        int total = 0;
        for (int i = 0; i < v.length; i++) {
            if (v[i] == alvo) {
                total++;
            }
        }
        return total;
    }

    public static void main(String[] args) {
        int[] v = {{v}};
        int alvo = {{alvo}};
        System.out.println(contar(v, alvo));
    }
}`;
  var ENT = [{ nome: "v", rotulo: "array v", tipo: "int[]", valor: "42, 17, 93, 58, 17" }, { nome: "alvo", tipo: "int", valor: "17" }];
  var EXS = [{ rotulo: "melhor caso (42)", valores: { alvo: "42" } }, { rotulo: "pior caso: último (2)", valores: { v: "8, 3, 5, 9, 2", alvo: "2" } }, { rotulo: "ausente (7)", valores: { v: "8, 3, 5, 9, 2", alvo: "7" } }, { rotulo: "array vazio", valores: { v: "", alvo: "7" } }];
  var DICAS = [
    { linha: /if \(v\[i\] == alvo\)/, texto: function (st) { var v = st.arr("v"), i = st.num("i"); return v[i] === st.num("alvo") ? "Achou na posição " + i + "." : "v[" + i + "] = " + v[i] + " não é o alvo: segue para o próximo."; } },
    { linha: /return -1/, texto: function (st) { return "Olhou os " + st.arr("v").length + " elementos e não achou: devolve -1. Esse return **depois** do laço é o que trata o caso ausente."; } },
    { linha: /total\+\+/, texto: function (st) { return "Mais uma ocorrência: total = " + st.num("total") + ". Não dá para parar aqui: pode haver outras."; } }
  ];
  var VIZ = [{ tipo: "array", nome: "v", rotulo: "v", ponteiros: PONT, faixas: faixas, nota: nota, legenda: LEG }];
  var TAB = { quando: "if (v[i] == alvo)", colunas: [["i", "i"], ["v[i]", "v[i]"], ["igual ao alvo?", function (st) { return st.arr("v")[st.num("i")] === st.num("alvo") ? "sim" : "não"; }]] };

  function prog(metodo, main) { return "public class BuscaLinear {\n" + metodo + "\n\n    public static void main(String[] args) {\n" + main + "\n    }\n}"; }

  G.algoritmo({
    slug: "busca-linear", titulo: "Busca linear", aula: "Aula 05 (guia extra)", grupo: "Buscas",
    resumo: "Olha **um por um**, do começo ao fim, até achar o alvo. Não exige nada do array, mas no pior caso olha todos: O(n).",
    custos: [["melhor caso", "O(1)"], ["pior caso", "O(n)"], ["ausente", "O(n)"], ["memória", "O(1)"]],
    ideia: String.raw`Se os dados não estão ordenados e não há estrutura auxiliar (como um HashSet), a única saída é conferir cada posição. É a **busca linear** (ou sequencial).

Antes de programar, defina o **contrato**, porque ele muda o código:
- devolver «true/false» → pode parar no primeiro encontro;
- devolver o **índice** da primeira ocorrência → para no primeiro encontro e devolve «-1» se não achar;
- devolver a **última** ocorrência, ou **contar** ocorrências → precisa ir até o fim.

**Big-O** descreve como o custo cresce: no pior caso (alvo no fim ou ausente) são n comparações, então O(n). Dobrar o array tende a dobrar o trabalho.`,
    pseudo: String.raw`BUSCAR-INDICE(v, alvo)
  Input: array v, number alvo
  Output: number
  FOR i <- 0 TO v.length - 1 DO
    IF v[i] = alvo THEN
      RETURN i
  RETURN -1`,
    invariante: String.raw`Antes de cada volta, **nenhum elemento de v[0..i) é o alvo**. Por isso, quando o laço termina sem retornar, dá para afirmar com certeza que o alvo não está no array.`,
    programas: [
      { id: "idx", nome: "Índice da 1ª ocorrência", codigo: INDICE, entradas: ENT, exemplos: EXS, viz: VIZ, tabela: TAB, dicas: DICAS },
      { id: "cont", nome: "Contar ocorrências", codigo: CONTAR, entradas: ENT, exemplos: EXS, viz: VIZ, tabela: { quando: "if (v[i] == alvo)", colunas: [["i", "i"], ["v[i]", "v[i]"], ["total", "total"]] }, dicas: DICAS }
    ],
    problemas: {
      resolve: String.raw`Todo problema em que você **não tem como pular elementos**: dados desordenados, uma única consulta, ou quando precisa olhar tudo mesmo (contar, somar, achar o maior).
- procurar algo num array/lista desordenado;
- achar mínimo, máximo, primeira ou última ocorrência;
- contar ou filtrar elementos que satisfazem uma condição;
- é o ponto de partida: muitos problemas começam "por força bruta" com busca linear e depois melhoram com hash, ordenação ou busca binária.`,
      classicos: [
        { nome: "Two Sum", onde: "LeetCode 1", ideia: "Achar dois números que somam um alvo.", muda: "força bruta: dois laços lineares, O(n²). Com um **HashMap** guardando os já vistos, uma passada só: O(n)." },
        { nome: "Contains Duplicate", onde: "LeetCode 217", ideia: "Existe algum valor repetido?", muda: "para cada elemento, uma busca linear no resto dá O(n²). Um **HashSet** resolve em O(n)." },
        { nome: "Find the Index of the First Occurrence", onde: "LeetCode 28", ideia: "Primeira posição de uma palavra dentro de um texto.", muda: "a busca linear testa cada posição de início e compara caractere por caractere." },
        { nome: "Max Consecutive Ones", onde: "LeetCode 485", ideia: "Maior sequência de 1s seguidos.", muda: "percorre tudo mantendo um contador atual e o melhor visto até agora." },
        { nome: "Remove Element", onde: "LeetCode 27", ideia: "Remover todas as ocorrências de um valor no próprio array.", muda: "percorre com um índice de leitura e outro de escrita." },
        { nome: "Check If N and Its Double Exist", onde: "LeetCode 1346", ideia: "Existe i ≠ j com v[i] = 2·v[j]?", muda: "busca linear dupla, ou um HashSet dos valores vistos." }
      ]
    },
    variacoes: [
      { nome: "Última ocorrência", curto: "última ocorrência", quando: "o valor se repete e você quer a posição mais à direita.",
        muda: String.raw`Duas opções: percorrer **de trás para frente** e devolver o primeiro que achar, ou ir até o fim guardando a última posição vista. A versão abaixo anda de trás para frente: muda o início, a condição e o passo do «for».`,
        codigo: prog(String.raw`    public static int buscarIndice(int[] v, int alvo) {
        for (int i = v.length - 1; i >= 0; i--) {
            if (v[i] == alvo) {
                return i;
            }
        }
        return -1;
    }`, "        int[] v = {42, 17, 93, 58, 17};\n        int alvo = 17;\n        System.out.println(buscarIndice(v, alvo));") },
      { nome: "Contém? (boolean)", curto: "contém", quando: "só importa saber SE está, não onde.",
        muda: String.raw`O contrato mais simples reaproveita a busca por índice: «return buscarIndice(v, alvo) != -1». Mesmo custo, O(n), e o código fica curto.`,
        codigo: prog(String.raw`    public static int buscarIndice(int[] v, int alvo) {
        for (int i = 0; i < v.length; i++) {
            if (v[i] == alvo) {
                return i;
            }
        }
        return -1;
    }

    public static boolean contem(int[] v, int alvo) {
        return buscarIndice(v, alvo) != -1;
    }`, "        int[] v = {42, 17, 93, 58, 17};\n        int alvo = 17;\n        System.out.println(contem(v, alvo));") },
      { nome: "Índice do maior elemento", curto: "índice do maior", quando: "você quer o máximo (ou mínimo) e onde ele está.",
        muda: String.raw`Não há alvo: a comparação passa a ser com o **melhor visto até agora**. Começa supondo que o maior é o «v[0]» e atualiza quando aparece alguém maior. Precisa olhar todos: sempre O(n).`,
        codigo: prog(String.raw`    public static int indiceDoMaior(int[] v) {
        int melhor = 0;
        for (int i = 1; i < v.length; i++) {
            if (v[i] > v[melhor]) {
                melhor = i;
            }
        }
        return melhor;
    }`, "        int[] v = {42, 17, 93, 58, 17};\n        System.out.println(indiceDoMaior(v));"),
        programa: { viz: [{ tipo: "array", nome: "v", ponteiros: [["i", "#e0392b", "topo"], ["melhor", "#14674c", "topo"]], faixas: faixas }], tabela: { quando: "if (v[i] > v[melhor])", colunas: [["i", "i"], ["v[i]", "v[i]"], ["melhor", "melhor"], ["v[melhor]", "v[melhor]"]] } } },
      { nome: "Buscar uma String (use equals)", curto: "String com equals", quando: "os dados são textos (nomes, códigos com letras).",
        muda: String.raw`A estrutura é idêntica, mas Strings se comparam com «equals», **não com ==**. O «==» compara se são o mesmo objeto na memória, e pode falhar para textos iguais criados em momentos diferentes.`,
        codigo: prog(String.raw`    public static int buscarIndice(String[] v, String alvo) {
        for (int i = 0; i < v.length; i++) {
            if (v[i].equals(alvo)) {
                return i;
            }
        }
        return -1;
    }`, "        String[] v = {\"ana\", \"bia\", \"caio\", \"duda\"};\n        String alvo = \"caio\";\n        System.out.println(buscarIndice(v, alvo));") }
    ],
    erros: [
      { erro: "Retornar -1 dentro do laço", curto: "return -1 no laço", porque: "Com «else return -1», a busca desiste no **primeiro** elemento diferente. Buscar o 17 em {42, 17, …} devolve -1 porque parou no 42.",
        codigo: INDICE.replace("            if (v[i] == alvo) {\n                return i;\n            }", "            if (v[i] == alvo) {\n                return i;\n            } else {\n                return -1;\n            }").replace("{{v}}", "{42, 17, 93, 58, 17}").replace("{{alvo}}", "17") },
      { erro: "i <= v.length", curto: "i <= v.length", porque: "O último índice válido é «v.length - 1». Com «<=», quando o alvo não está o laço tenta ler «v[v.length]»: ArrayIndexOutOfBoundsException.",
        codigo: INDICE.replace("i < v.length", "i <= v.length").replace("{{v}}", "{8, 3, 5, 9, 2}").replace("{{alvo}}", "7") },
      { erro: "Esquecer o return depois do laço", porque: "Se o alvo não aparece, o método chega ao fim sem devolver nada. O Java nem compila: \"missing return statement\". É o compilador avisando do caso ausente." },
      { erro: "Comparar Strings com ==", porque: "«==» compara referências (se é o mesmo objeto), não o conteúdo. Pode funcionar por acaso com literais e falhar com textos lidos do teclado ou montados em tempo de execução. Use «equals»." }
    ],
    perguntas: [
      { g: "conceito", p: "Qual o custo da busca linear no melhor, no pior caso e quando o alvo está ausente?", r: "Melhor caso: O(1), porque o alvo está na primeira posição. Pior caso: O(n), com o alvo na última posição. Ausente: O(n) também, porque precisa olhar todos para ter certeza." },
      { g: "conceito", p: "O que significa dizer que a busca linear é O(n)?", r: "Que o custo cresce **proporcionalmente** ao tamanho: dobrar o array tende a dobrar o trabalho no pior caso. Não quer dizer exatamente n operações sempre." },
      { g: "conceito", p: "Tenho milhares de matrículas e vou checar presença muitas vezes. Busca linear é boa ideia?", r: "Não. Cada consulta custaria O(n). Construa um **HashSet** uma vez (O(n)) e cada consulta passa a ser O(1) em média. Se fossem poucas consultas numa lista pequena, a busca linear bastaria." },
      { g: "conceito", p: "Por que contar ocorrências é sempre O(n), mesmo se o alvo estiver na primeira posição?", r: "Porque o contrato exige saber se ele aparece **de novo** depois, então não dá para parar no primeiro encontro." },
      { g: "codigo", p: "Para {42, 17, 93, 58, 17} e alvo 17, «buscarIndice» devolve 1 ou 4? Por quê?", r: "**1**: o laço para no primeiro encontro. Para devolver 4 (a última), mude o contrato: percorra de trás para frente." },
      { g: "codigo", p: "Onde fica o «return -1», e por que não pode estar dentro do laço?", r: "**Depois** do laço. Dentro (num else), a busca desistiria na primeira comparação que falha, sem olhar os outros." },
      { g: "variacao", p: "Como adaptar para achar o índice do **menor** elemento?", r: "Troque o alvo pelo \"melhor até agora\": «int melhor = 0;» e, para cada i, «if (v[i] < v[melhor]) melhor = i;». Sempre O(n)." },
      { g: "variacao", p: "E se os dados fossem Strings?", r: "Mesma estrutura, mas compare com «v[i].equals(alvo)». O «==» compara referências." }
    ],
    exercicios: [
      { tipo: "rastreio", titulo: "Quantas comparações?", enunciado: "O programa conta quantas vezes «v[i] == alvo» é testado. O que ele imprime?",
        codigo: String.raw`public class Comparacoes {
    public static void main(String[] args) {
        int[] v = {8, 3, 5, 9, 2};
        int alvo = 5;
        int comparacoes = 0;
        int resposta = -1;
        for (int i = 0; i < v.length; i++) {
            comparacoes++;
            if (v[i] == alvo) {
                resposta = i;
                break;
            }
        }
        System.out.println(resposta + " " + comparacoes);
    }
}`, formato: "resposta comparacoes", explicacao: "Compara 8, 3 e 5: três comparações. O 5 está no índice 2.", viz: VIZ },
      { tipo: "completar", titulo: "Complete a contagem", enunciado: "Complete «contar» para devolver quantas vezes «alvo» aparece em «v».",
        modelo: String.raw`    public static int contar(int[] v, int alvo) {
        int total = ⟦⟧;
        for (int i = 0; ⟦⟧; i++) {
            if (⟦⟧) {
                total++;
            }
        }
        return ⟦⟧;
    }`, gabarito: ["0", "i < v.length", "v[i] == alvo", "total"],
        solucao: CONTAR.split("\n").slice(1, 10).join("\n"),
        testes: [{ expr: "contar(new int[] {42, 17, 93, 58, 17}, 17)" }, { expr: "contar(new int[] {1, 1, 1}, 1)" }, { expr: "contar(new int[] {1, 2, 3}, 9)" }, { expr: "contar(new int[] {}, 9)" }] },
      { tipo: "escrever", titulo: "Última ocorrência", enunciado: "Escreva «ultima(int[] v, int alvo)», que devolve o **último** índice onde «alvo» aparece, ou -1.",
        inicial: "    public static int ultima(int[] v, int alvo) {\n        return -1;\n    }",
        solucao: String.raw`    public static int ultima(int[] v, int alvo) {
        for (int i = v.length - 1; i >= 0; i--) {
            if (v[i] == alvo) {
                return i;
            }
        }
        return -1;
    }`,
        testes: [{ expr: "ultima(new int[] {42, 17, 93, 58, 17}, 17)" }, { expr: "ultima(new int[] {42, 17, 93}, 42)" }, { expr: "ultima(new int[] {42, 17, 93}, 5)" }, { expr: "ultima(new int[] {}, 5)" }],
        dica: "Percorra de trás para frente: comece em v.length - 1.", viz: VIZ },
      { tipo: "escrever", titulo: "Índice do menor", enunciado: "Escreva «indiceDoMenor(int[] v)» (v tem pelo menos 1 elemento). Em caso de empate, devolva o **primeiro**.",
        inicial: "    public static int indiceDoMenor(int[] v) {\n        return 0;\n    }",
        solucao: String.raw`    public static int indiceDoMenor(int[] v) {
        int melhor = 0;
        for (int i = 1; i < v.length; i++) {
            if (v[i] < v[melhor]) {
                melhor = i;
            }
        }
        return melhor;
    }`,
        testes: [{ expr: "indiceDoMenor(new int[] {8, 3, 5, 9, 2})" }, { expr: "indiceDoMenor(new int[] {2, 3, 2})" }, { expr: "indiceDoMenor(new int[] {7})" }, { expr: "indiceDoMenor(new int[] {-1, -5, -5, 0})" }],
        dica: "Use < (e não <=) para manter o primeiro em caso de empate." },
      { tipo: "escolha", titulo: "Qual contrato permite parar cedo?", enunciado: "Em qual contrato a busca linear **pode** parar antes do fim do array?", alternativas: ["devolver se o alvo aparece (boolean)", "contar quantas vezes o alvo aparece", "devolver a última ocorrência (percorrendo do início)", "devolver a soma dos elementos iguais ao alvo"], correta: 0, explicacao: "Para responder \"existe?\", o primeiro encontro basta. Contar, somar ou achar a última (andando do início) exigem olhar tudo." },
      { tipo: "escolha", titulo: "Linear ou hash?", enunciado: "Você vai checar 10.000 vezes se uma matrícula está numa lista de 50.000 matrículas. Qual a melhor estratégia?", alternativas: ["montar um HashSet uma vez e consultar nele", "busca linear em cada consulta", "ordenar a cada consulta e usar busca binária", "tanto faz"], correta: 0, explicacao: "Busca linear: 10.000 × 50.000 comparações no pior caso. HashSet: 50.000 para montar + 10.000 consultas O(1) em média." }
    ]
  });
})();
