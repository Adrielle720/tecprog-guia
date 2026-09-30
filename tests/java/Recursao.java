public class Recursao {
    public static void contagem(int n) {
        if (n == 0) {
            System.out.println("fim");
            return;
        }
        System.out.println(n);
        contagem(n - 1);
    }
    public static int somaAte(int n) {
        if (n == 0) {
            return 0;
        }
        return n + somaAte(n - 1);
    }
    public static int fatorial(int n) {
        if (n == 0) {
            return 1;
        }
        return n * fatorial(n - 1);
    }
    public static void imprimirCrescente(int n) {
        if (n == 0) {
            return;
        }
        imprimirCrescente(n - 1);
        System.out.println(n);
    }
    public static int somaAteComAcumulador(int n) {
        return somaAteComAcumulador(n, 0);
    }
    private static int somaAteComAcumulador(int n, int acumulado) {
        if (n == 0) {
            return acumulado;
        }
        return somaAteComAcumulador(n - 1, acumulado + n);
    }
    private static int somaAPartir(int[] v, int i) {
        if (i == v.length) {
            return 0;
        }
        return v[i] + somaAPartir(v, i + 1);
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
    public static int fib(int n) {
        if (n < 2) return n;
        return fib(n - 1) + fib(n - 2);
    }
    public static int maximo(int[] v) {
        if (v.length == 0) {
            throw new IllegalArgumentException("array vazio");
        }
        return maximoIntervalo(v, 0, v.length);
    }
    private static int maximoIntervalo(int[] v, int inicio, int fim) {
        if (fim - inicio == 1) {
            return v[inicio];
        }
        int meio = inicio + (fim - inicio) / 2;
        int maxEsq = maximoIntervalo(v, inicio, meio);
        int maxDir = maximoIntervalo(v, meio, fim);
        if (maxEsq > maxDir) {
            return maxEsq;
        }
        return maxDir;
    }
    public static void main(String[] args) {
        contagem(3);
        System.out.println(somaAte(4) + " " + fatorial(5) + " " + fatorial(12) + " " + fatorial(13));
        imprimirCrescente(3);
        System.out.println(somaAteComAcumulador(4));
        System.out.println(somaAPartir(new int[] {4, 7, 2}, 0));
        System.out.println(contarAPartir(new int[] {1, 3, 1, 1}, 1, 0));
        System.out.println(fib(15));
        System.out.println(maximo(new int[] {8, 3, 12, 5, 9}));
        try {
            maximo(new int[0]);
        } catch (IllegalArgumentException e) {
            System.out.println("erro: " + e.getMessage());
        }
    }
}
