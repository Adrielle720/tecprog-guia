public class Buscas {
    public static int buscarIndice(int[] v, int alvo) {
        for (int i = 0; i < v.length; i++) {
            if (v[i] == alvo) {
                return i;
            }
        }
        return -1;
    }
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
    public static int buscarRec(int[] v, int alvo) {
        return buscarRec(v, alvo, 0, v.length - 1);
    }
    private static int buscarRec(int[] v, int alvo, int inicio, int fim) {
        if (inicio > fim) {
            return -1;
        }
        int meio = inicio + (fim - inicio) / 2;
        if (v[meio] == alvo) {
            return meio;
        }
        if (v[meio] < alvo) {
            return buscarRec(v, alvo, meio + 1, fim);
        }
        return buscarRec(v, alvo, inicio, meio - 1);
    }
    public static int primeiraOcorrencia(int[] v, int alvo) {
        int inicio = 0, fim = v.length - 1, resposta = -1;
        while (inicio <= fim) {
            int meio = inicio + (fim - inicio) / 2;
            if (v[meio] >= alvo) {
                if (v[meio] == alvo) resposta = meio;
                fim = meio - 1;
            } else {
                inicio = meio + 1;
            }
        }
        return resposta;
    }
    public static void main(String[] args) {
        int[] v = {3, 8, 12, 19, 25, 31, 42, 57, 68};
        System.out.println(buscar(v, 42));
        System.out.println(buscar(v, 4));
        System.out.println(buscar(v, 3));
        System.out.println(buscar(v, 68));
        System.out.println(buscarRec(v, 57) + " " + buscarRec(v, 58));
        System.out.println(buscarIndice(new int[] {42, 17, 93, 58, 17}, 17));
        int[] r = {1, 2, 2, 2, 5, 9};
        System.out.println("primeira 2 = " + primeiraOcorrencia(r, 2) + ", primeira 7 = " + primeiraOcorrencia(r, 7));
    }
}
