import java.util.*;

public class Semantica {
    static int contador = 10;
    static String rotulo(int x) { return x > 0 ? "pos" : x < 0 ? "neg" : "zero"; }
    public static void main(String[] args) {
        int big = Integer.MAX_VALUE;
        big++;
        System.out.println(big + " " + (Integer.MAX_VALUE + 1) + " " + Integer.MIN_VALUE);
        System.out.println(7 / 2 + " " + (-7 / 2) + " " + (-7 % 3) + " " + 7.0 / 2 + " " + (double) 7 / 2 + " " + (int) 3.99 + " " + (int) -3.99);
        char c = 'a';
        c++;
        c += 2;
        System.out.println(c + " " + (c + 1) + " " + (char) (c + 1) + " " + ('z' - 'a') + " " + Character.isDigit('7'));
        String s = "ab" + 1 + 2 + 'c' + 1.5 + true + null;
        System.out.println(s + " " + (1 + 2 + "x") + " " + s.length() + " " + s.charAt(2) + " " + s.indexOf("c"));
        double d = 10;
        System.out.println(d + " " + d / 4 + " " + 1e7 + " " + 0.1 + 0.2 + " " + (0.1 + 0.2) + " " + Math.sqrt(16) + " " + Math.pow(2, 10) + " " + Math.max(3, 7) + " " + Math.abs(-5));
        long l = 1L << 40;
        System.out.println(l + " " + (5 << 2) + " " + (-16 >> 2) + " " + (-16 >>> 28) + " " + (6 & 3) + " " + (6 | 3) + " " + (6 ^ 3));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            if (i == 3) continue;
            sb.append(i).append(',');
        }
        sb.deleteCharAt(sb.length() - 1);
        System.out.println(sb + " " + sb.reverse() + " " + rotulo(-3) + rotulo(0) + rotulo(9));
        int k = 0;
        do { k += 3; } while (k < 10);
        System.out.println("k=" + k + " contador=" + contador++ + " " + contador);
        switch (k % 4) {
            case 0: System.out.println("zero"); break;
            case 1: System.out.println("um");
            case 2: System.out.println("dois (caiu)"); break;
            default: System.out.println("outro");
        }
        Map<String, Integer> freq = new HashMap<>();
        String[] palavras = "banana maca banana uva maca banana kiwi".split(" ");
        for (String p : palavras) freq.put(p, freq.getOrDefault(p, 0) + 1);
        System.out.println(freq + " " + freq.get("banana") + " " + freq.containsKey("pera") + " " + freq.keySet());
        Set<Integer> conj = new HashSet<>();
        for (int x : new int[] {42, 7, 99, 7, 16, 3, 128}) conj.add(x);
        System.out.println(conj + " " + conj.size() + " " + conj.contains(99));
        Deque<Integer> pilha = new ArrayDeque<>();
        pilha.push(1); pilha.push(2); pilha.push(3);
        System.out.println(pilha + " " + pilha.pop() + " " + pilha.peek() + " " + pilha);
        Queue<String> fila = new ArrayDeque<>();
        fila.offer("a"); fila.offer("b"); fila.add("c");
        System.out.println(fila.poll() + fila.peek() + fila.size());
        List<Integer> lista = new ArrayList<>(Arrays.asList(5, 3, 8));
        lista.add(0, 9);
        lista.remove(Integer.valueOf(3));
        lista.remove(0);
        Collections.sort(lista);
        System.out.println(lista + " " + lista.contains(8) + " " + lista.indexOf(8));
        List<Character> letras = new ArrayList<>();
        for (char ch : "java".toCharArray()) letras.add(ch);
        System.out.println(letras + " " + String.valueOf(new char[] {'o', 'k'}) + " " + "Java".toUpperCase() + " " + "a,b,,c".split(",").length);
        System.out.printf("%d itens, media %.2f %s%n", 3, 2.5, "fim");
        int[][] m = new int[3][4];
        m[1][2] = 7;
        System.out.println(m.length + " " + m[0].length + " " + m[1][2] + " " + Arrays.toString(m[1]));
        try {
            int[] v = new int[3];
            v[3] = 1;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("capturou: " + e.getMessage());
        }
        try {
            System.out.println(10 / (k - 12));
        } catch (ArithmeticException e) {
            System.out.println("capturou: " + e.getMessage());
        }
        String a1 = "abc", a2 = "abd";
        System.out.println(a1.compareTo(a2) + " " + a1.equals("abc") + " " + "abc".substring(1) + " " + "abcdef".substring(2, 4));
        Integer boxed = 127;
        System.out.println(boxed + 1);
        int[] vetor = {3, 1, 2};
        int[] copia = Arrays.copyOf(vetor, 5);
        Arrays.sort(vetor);
        System.out.println(Arrays.toString(vetor) + Arrays.toString(copia) + Arrays.toString(Arrays.copyOfRange(copia, 1, 3)));
    }
}
