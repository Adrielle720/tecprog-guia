import java.util.Arrays;

public class Ordenacao {
    public static void insertionSort(int[] v) {
        for (int i = 1; i < v.length; i++) {
            int chave = v[i];
            int j = i - 1;
            while (j >= 0 && v[j] > chave) {
                v[j + 1] = v[j];
                j = j - 1;
            }
            v[j + 1] = chave;
        }
    }
    public static void mergesort(int[] v) {
        int[] aux = new int[v.length];
        mergesort(v, aux, 0, v.length);
    }
    private static void mergesort(int[] v, int[] aux, int inicio, int fim) {
        if (fim - inicio <= 1) {
            return;
        }
        int meio = inicio + (fim - inicio) / 2;
        mergesort(v, aux, inicio, meio);
        mergesort(v, aux, meio, fim);
        merge(v, aux, inicio, meio, fim);
    }
    private static void merge(int[] v, int[] aux, int inicio, int meio, int fim) {
        int i = inicio, j = meio, k = inicio;
        while (i < meio && j < fim) {
            if (v[i] <= v[j]) {
                aux[k++] = v[i++];
            } else {
                aux[k++] = v[j++];
            }
        }
        while (i < meio) {
            aux[k++] = v[i++];
        }
        while (j < fim) {
            aux[k++] = v[j++];
        }
        for (int p = inicio; p < fim; p++) {
            v[p] = aux[p];
        }
    }
    public static void quicksort(int[] v, int inicio, int fim) {
        if (inicio >= fim) {
            return;
        }
        int p = particionar(v, inicio, fim);
        quicksort(v, inicio, p - 1);
        quicksort(v, p + 1, fim);
    }
    private static int particionar(int[] v, int inicio, int fim) {
        int pivo = v[fim];
        int menores = inicio;
        for (int atual = inicio; atual < fim; atual++) {
            if (v[atual] <= pivo) {
                trocar(v, menores, atual);
                menores++;
            }
        }
        trocar(v, menores, fim);
        return menores;
    }
    private static void trocar(int[] v, int a, int b) {
        int t = v[a];
        v[a] = v[b];
        v[b] = t;
    }
    public static void main(String[] args) {
        int[] a = {8, 3, 5, 2};
        insertionSort(a);
        System.out.println(Arrays.toString(a));
        int[] b = {38, 27, 43, 3, 9, 82, 10};
        mergesort(b);
        System.out.println(Arrays.toString(b));
        int[] c = {8, 3, 7, 2, 5};
        System.out.println(particionar(c, 0, c.length - 1) + " " + Arrays.toString(c));
        int[] d = {5, 1, 4, 1, 5, 9, 2, 6, 5, 3};
        quicksort(d, 0, d.length - 1);
        System.out.println(Arrays.toString(d));
        char[] letras = {'d', 'a', 'c', 'b'};
        Arrays.sort(letras);
        System.out.println(Arrays.toString(letras) + " " + new String(letras));
    }
}
