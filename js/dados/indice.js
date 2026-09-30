/* Índice do site: grupos e algoritmos (na ordem das aulas).
   Cada algoritmo tem o seu arquivo em js/dados/<slug>.js, que chama Guia.algoritmo({...}). */
(function () {
  var G = window.Guia = window.Guia || {};
  G.ALG = G.ALG || {};
  G.algoritmo = function (a) { G.ALG[a.slug] = a; (a.exercicios || []).forEach(function (ex, k) { ex.id = ex.id || a.slug + "-" + k; }); (a.simulado || []).forEach(function (ex, k) { ex.id = ex.id || a.slug + "-s" + k; }); };
  G.INDICE = [
    { grupo: "Buscas", itens: [
      { slug: "busca-linear", titulo: "Busca linear", aula: "A05", custo: "O(n)", resumo: "Olha um por um até achar. Funciona em qualquer array, ordenado ou não." },
      { slug: "busca-binaria", titulo: "Busca binária", aula: "A06·08", custo: "O(log n)", resumo: "Num array **ordenado**, confere o meio e descarta metade a cada passo." }
    ]},
    { grupo: "Recursão", itens: [
      { slug: "recursao", titulo: "Recursão", aula: "A07·08", custo: "pilha de chamadas", resumo: "Caso base, passo recursivo e progresso: a pilha de chamadas crescendo e voltando." },
      { slug: "divisao-e-conquista", titulo: "Divisão e conquista", aula: "A09", custo: "O(n)", resumo: "Dividir, resolver cada metade e combinar: o máximo por metades." }
    ]},
    { grupo: "Ordenação", itens: [
      { slug: "insertion-sort", titulo: "Insertion sort", aula: "A11", custo: "O(n²) · O(n)", resumo: "Insere cada elemento no lugar certo de um prefixo já ordenado, como cartas na mão." },
      { slug: "mergesort", titulo: "Mergesort", aula: "A11", custo: "O(n log n)", resumo: "Divide até sobrar um elemento e intercala as metades ordenadas." },
      { slug: "quicksort", titulo: "Quicksort", aula: "A12", custo: "O(n log n) · O(n²)", resumo: "Particiona em torno de um pivô e ordena os dois lados. Sem merge final." }
    ]},
    { grupo: "Matrizes e grafos", itens: [
      { slug: "dfs", titulo: "DFS em matrizes", aula: "A13", custo: "O(linhas·colunas)", resumo: "Aprofunda por um caminho e volta: labirinto, flood fill, contar regiões." },
      { slug: "bfs", titulo: "BFS e filas", aula: "A14", custo: "O(linhas·colunas)", resumo: "Explora por camadas com uma fila: o menor número de movimentos." },
      { slug: "grafos", titulo: "Grafos: DFS e BFS", aula: "A15", custo: "O(V + E)", resumo: "Os mesmos DFS e BFS, com vizinhos vindo de uma lista de adjacência." }
    ]},
    { grupo: "Backtracking", itens: [
      { slug: "backtracking", titulo: "Backtracking", aula: "A16", custo: "O(2ⁿ)", resumo: "Escolher, avançar e desfazer: gerar todos os subconjuntos e permutações." },
      { slug: "backtracking-restricoes", titulo: "Backtracking com poda", aula: "A17", custo: "O(2ⁿ) no pior caso", resumo: "Soma-alvo e mochila 0/1: cortar os ramos que não podem dar certo." }
    ]}
  ];
})();
