import java.util.ArrayList;
import java.util.List;

public class Backtracking {
    private static int melhor;
    private static int chamadas;
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
    static void permutar(List<Integer> atual, boolean[] usado, int[] v, List<List<Integer>> resp) {
        if (atual.size() == v.length) { resp.add(new ArrayList<>(atual)); return; }
        for (int i = 0; i < v.length; i++) {
            if (usado[i]) continue;
            usado[i] = true;
            atual.add(v[i]);
            permutar(atual, usado, v, resp);
            atual.remove(atual.size() - 1);
            usado[i] = false;
        }
    }
    public static void main(String[] args) {
        System.out.println(gerar(new int[] {1, 2, 3}));
        System.out.println(existeSoma(new int[] {4, 7, 9}, 0, 0, 10) + " " + existeSoma(new int[] {4, 7, 9}, 0, 0, 13) + " chamadas=" + chamadas);
        System.out.println(resolver(new int[] {2, 3, 4, 5}, new int[] {3, 4, 5, 6}, 5));
        List<List<Integer>> p = new ArrayList<>();
        permutar(new ArrayList<>(), new boolean[3], new int[] {1, 2, 3}, p);
        System.out.println(p.size() + " " + p);
    }
}
