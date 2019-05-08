public class ButtonsDetection  { private boolean cancontinue = true;  private synchronized boolean canContinue() {     return cancontinue;  }  public synchronized void forceQuit() {     cancontinue=false;  } /**
 * La procedura buttonDetection in base alle maschere di presenza di barra e bottoni deve restituire lo stato
 * di entrambi i pulsanti.
 *
 * parametro barMask : maschera della barra
 * parametro buttonsMask : maschera dei bottoni
 * parametro button : array dove inserire lo stato booleano dei due bottoni
 */
public void buttonsDetection( boolean[] barMask, boolean[] buttonsMask,
                              boolean[] buttons ){

  // Prima di tutto calcolo il baricentro dell'area viola
  double barBarycenter = 0;
  int factors = 0;
  for(int x=0;  canContinue() && x<320; x++){
    if(barMask[x]){
      barBarycenter += x;
      factors++;
    }
  }
  barBarycenter /= factors;

  // Ora controllo se ho elementi verdi a destra o sinistra del baricentro
  buttons[0] = false;
  buttons[1] = false;
  if(barBarycenter != 0){
    for(int x=0;  canContinue() && x<320; x++){
      if(buttonsMask[x]){
        if(x<barBarycenter)
          buttons[0] = true;
        else
          buttons[1] = true;
      }
    }
  }
}

}
