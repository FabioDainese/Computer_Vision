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
 * parametro params : array dove inserire rispettivamente a ed r
 */
public void houghTransform( double a_step, double r_step, double max_r, double[][] yData, boolean[][] mask,
                            double[][] accumulator, double[] params ){

   // Variabili per immagazzinare i massimi trovati
   double current_a   = 0;
   double current_r   = 0;
   double current_max = 0;

   // Esamino tutti i pixel dell'immagine
   for(int x=0;  canContinue() && x<320; x++){
      for(int y=0;  canContinue() && y<240; y++){

         //Se un pixel è stato selezionato dalla maschera può far parte della barra
         if(mask[x][y]){

            // Creo la sua curva trasformata iterando per ogni angolo
            for(double a=0.0;  canContinue() && a<Math.PI; a+=a_step){

               // Calcolo il parametro r per tale angolo
               double r = x * Math.cos(a) + y * Math.sin(a);

               // Se tale parametro è compreso nei bound attesi...
               if((r>-max_r)&&(r<max_r)){

                  // Calcolo la cella nell'accumulatore
                  int r_pos = (int)Math.round((r+max_r)/r_step);
                  int a_pos = (int)Math.round(a/a_step);

                  // E vi aggiungo il valore della luminanza
                  accumulator[a_pos][r_pos] += yData[x][y];

                  // Controllo se il valore ottenuto è superiore al massimo attuale
                  if(accumulator[a_pos][r_pos] > current_max){
                     current_max = accumulator[a_pos][r_pos];
                     current_a = a;
                     current_r = r;
                  }

               }
            }
         }
      }
   }

   // Restituisco i parametri trovati attraverso l'array params
   params[0] = current_a;
   params[1] = current_r;

}

}
