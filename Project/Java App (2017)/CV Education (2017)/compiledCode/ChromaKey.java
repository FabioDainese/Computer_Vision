public class ChromaKey  { private boolean cancontinue = true;  private synchronized boolean canContinue() {     return cancontinue;  }  public synchronized void forceQuit() {     cancontinue=false;  } /**
 * La procedura chromaKey deve popolare una maschera di valori booleani in accordo con la compatibilità
 * dei pixel dell'immagine con un dato punto del piano u-v
 *
 * parametro u : la coordinata u del punto di riferimento
 * parametro v : la coordinata v del punto di riferimento
 * parametro radius : la massima distanza di un punto immagine dal riferimento per essere considerato valido
 * parametro uData : matrice con i valori u dei pixel dell'immagine
 * parametro vData : matrice con i valori v dei pixel dell'immagine
 * parametro mask : matrice di booleani da riempire ad opera della procedura
 */
public void chromaKey( double u, double v, double radius, double[][] uData, double[][] vData,
                       boolean[][] mask ){

  // Itero su tutti i pixel dell'immagine
  for(int x=0;  canContinue() && x<320; x++){
    for(int y=0;  canContinue() && y<240; y++){

      // Calcolo la distanza fra il pixel e i valori di u e v desiderati
      double du = uData[x][y]-u;
      double dv = vData[x][y]-v;

      // Ne faccio la somma dei quadrati
      double d2 = du*du+dv*dv;

      // E calcolo il quadrato del raggio
      double r2 = radius*radius;

      // Se la somma dei quadrati è inferiore al quadrato del raggio il pixel è valido
      mask[x][y] = d2<r2;
    }
  }
}

}
