import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;

public class Grafos {
    static class Grafo {
        private final ArrayList<ArrayList<Integer>> adj;
        public Grafo(int n) {
            adj = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                adj.add(new ArrayList<>());
            }
        }
        public void adicionarAresta(int a, int b) {
            adj.get(a).add(b);
            adj.get(b).add(a);
        }
        public ArrayList<ArrayList<Integer>> lista() {
            return adj;
        }
    }
    public static boolean existeCaminho(ArrayList<ArrayList<Integer>> adj,
            int atual, int destino, boolean[] visitado) {
        if (atual == destino) {
            return true;
        }
        visitado[atual] = true;
        for (int vizinho : adj.get(atual)) {
            if (!visitado[vizinho]
                    && existeCaminho(adj, vizinho, destino, visitado)) {
                return true;
            }
        }
        return false;
    }
    public static int[] distanciasBfs(ArrayList<ArrayList<Integer>> adj, int origem) {
        int[] dist = new int[adj.size()];
        Arrays.fill(dist, -1);
        Deque<Integer> fila = new ArrayDeque<>();
        dist[origem] = 0;
        fila.addLast(origem);
        while (!fila.isEmpty()) {
            int atual = fila.removeFirst();
            for (int vizinho : adj.get(atual)) {
                if (dist[vizinho] == -1) {
                    dist[vizinho] = dist[atual] + 1;
                    fila.addLast(vizinho);
                }
            }
        }
        return dist;
    }
    public static void main(String[] args) {
        Grafo g = new Grafo(6);
        g.adicionarAresta(0, 1);
        g.adicionarAresta(0, 2);
        g.adicionarAresta(1, 3);
        g.adicionarAresta(2, 3);
        g.adicionarAresta(3, 4);
        System.out.println(g.lista());
        System.out.println(existeCaminho(g.lista(), 0, 4, new boolean[6]));
        System.out.println(existeCaminho(g.lista(), 0, 5, new boolean[6]));
        System.out.println(Arrays.toString(distanciasBfs(g.lista(), 0)));
    }
}
