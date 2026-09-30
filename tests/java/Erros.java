public class Erros {
    public static int fatorial(int n) {
        if (n == 0) return 1;
        return n * fatorial(n - 1);
    }
    static int media(int[] v) {
        int s = 0;
        for (int x : v) s += x;
        return s / v.length;
    }
    public static void main(String[] args) {
        int modo = Integer.parseInt(args.length > 0 ? args[0] : "0");
        System.out.println("antes");
        if (modo == 0) {
            int[] v = {1, 2, 3};
            int soma = 0;
            for (int i = 0; i <= v.length; i++) {
                soma += v[i];
            }
            System.out.println(soma);
        } else if (modo == 1) {
            System.out.println(media(new int[] {4, 6}));
            System.out.println(media(new int[0]));
        } else if (modo == 2) {
            System.out.println(fatorial(-1));
        } else {
            String s = "abc";
            System.out.println(s.charAt(5));
        }
    }
}
