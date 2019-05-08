public class HoughTransform  { private boolean cancontinue = true;  private synchronized boolean canContinue() {     return cancontinue;  }  public synchronized void forceQuit() {     cancontinue=false;  } /**
 * La procedura houghTransform deve riempire una accumulatore che viene passato già dimensionato sommando in esso
 * i contributi di ciascun pixel dell'immagine attivo secondo una maschera.
 * Inoltre devono essere calcolati i parametri alpha ed r e resituiti rispettivanete nell'array params
 *
 * parametro a_step : lo step da dare agli angoli
 * parametro r_step : lo step da dare ad r
 * parametro max_r : la massima distanza prevista fra retta ed origine
 * parametro yData : matrice con i valori di luminosità dei pixel dell'immagine
 * parametro mask : matrice con i valori di maschera per la barra da rilevare
 * parametro accumulator : accumulatore dove sommare i valori dell'Hough Transform
 * parametro params : array dove inserire rispettivamente alpha ed r
 */
public void houghTransform( double a_step, double r_step, double max_r, double[][] yData, boolean[][] mask,
                            double[][] accumulator, double[] params ){
       // Inserire testo qui
}

}
