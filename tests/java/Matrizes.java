import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Matrizes {
    public static boolean existeCaminho(char[][] lab, int l, int c,
            int destinoL, int destinoC, boolean[][] visitado) {
        if (l < 0 || l >= lab.length || c < 0 || c >= lab[0].length) {
            return false;
        }
        if (lab[l][c] == '#' || visitado[l][c]) {
            return false;
        }
        if (l == destinoL && c == destinoC) {
            return true;
        }
        visitado[l][c] = true;
        return existeCaminho(lab, l - 1, c, destinoL, destinoC, visitado)
            || existeCaminho(lab, l + 1, c, destinoL, destinoC, visitado)
            || existeCaminho(lab, l, c - 1, destinoL, destinoC, visitado)
            || existeCaminho(lab, l, c + 1, destinoL, destinoC, visitado);
    }
    public static void preencher(char[][] tela, int l, int c, char original, char nova) {
        if (original == nova || l < 0 || l >= tela.length
                || c < 0 || c >= tela[0].length || tela[l][c] != original) {
            return;
        }
        tela[l][c] = nova;
        preencher(tela, l - 1, c, original, nova);
        preencher(tela, l + 1, c, original, nova);
        preencher(tela, l, c - 1, original, nova);
        preencher(tela, l, c + 1, original, nova);
    }
    public static int contarRegioes(char[][] mapa) {
        boolean[][] visitado = new boolean[mapa.length][mapa[0].length];
        int total = 0;
        for (int l = 0; l < mapa.length; l++) {
            for (int c = 0; c < mapa[0].length; c++) {
                if (mapa[l][c] == '.' && !visitado[l][c]) {
                    marcar(mapa, l, c, visitado);
                    total++;
                }
            }
        }
        return total;
    }
    private static void marcar(char[][] m, int l, int c, boolean[][] vis) {
        if (l < 0 || l >= m.length || c < 0 || c >= m[0].length) return;
        if (m[l][c] != '.' || vis[l][c]) return;
        vis[l][c] = true;
        marcar(m, l - 1, c, vis);
        marcar(m, l + 1, c, vis);
        marcar(m, l, c - 1, vis);
        marcar(m, l, c + 1, vis);
    }
    public static int menorDistancia(char[][] lab, int li, int ci, int lf, int cf) {
        if (lab == null || lab.length == 0 || lab[0].length == 0) {
            return -1;
        }
        int linhas = lab.length;
        int colunas = lab[0].length;
        if (!livre(lab, li, ci) || !livre(lab, lf, cf)) {
            return -1;
        }
        int[][] dist = new int[linhas][colunas];
        for (int[] linha : dist) {
            Arrays.fill(linha, -1);
        }
        int[] dl = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};
        Deque<int[]> fila = new ArrayDeque<>();
        dist[li][ci] = 0;
        fila.addLast(new int[] {li, ci});
        while (!fila.isEmpty()) {
            int[] atual = fila.removeFirst();
            int l = atual[0];
            int c = atual[1];
            if (l == lf && c == cf) {
                return dist[l][c];
            }
            for (int k = 0; k < 4; k++) {
                int nl = l + dl[k];
                int nc = c + dc[k];
                if (livre(lab, nl, nc) && dist[nl][nc] == -1) {
                    dist[nl][nc] = dist[l][c] + 1;
                    fila.addLast(new int[] {nl, nc});
                }
            }
        }
        return -1;
    }
    private static boolean livre(char[][] lab, int l, int c) {
        return l >= 0 && l < lab.length && c >= 0 && c < lab[0].length
            && lab[l][c] != '#';
    }
    public static void main(String[] args) {
        char[][] lab = {
            "S.#.".toCharArray(),
            "#.#.".toCharArray(),
            "#..D".toCharArray()
        };
        System.out.println(existeCaminho(lab, 0, 0, 2, 3, new boolean[3][4]));
        char[][] lab2 = { {'S', '.', '.', '#'}, {'#', '#', '.', '#'}, {'.', '.', '.', 'D'} };
        System.out.println(menorDistancia(lab2, 0, 0, 2, 3));
        System.out.println(menorDistancia(lab2, 0, 0, 2, 0));
        char[][] tela = { "aab".toCharArray(), "abb".toCharArray(), "bba".toCharArray() };
        preencher(tela, 0, 0, 'a', 'x');
        for (char[] linha : tela) System.out.println(new String(linha));
        char[][] mapa = { "..#..".toCharArray(), "#.#.#".toCharArray(), "..###".toCharArray(), "##..#".toCharArray() };
        System.out.println("regioes = " + contarRegioes(mapa));
        System.out.println(Arrays.deepToString(new int[][] {{1, 2}, {3}}));
    }
}
