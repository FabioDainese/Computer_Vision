/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package it.digitalviews.cveducation;

import java.util.HashMap;
import java.util.Vector;

/**
 *
 * @author fbergama
 */
public class ChangeNotifierHashTable<M1,M2> extends HashMap<M1,M2> {

    public interface HashtableChangeListener {
        public void keyChanged();
    }

    public Vector<HashtableChangeListener> listeners = new Vector<HashtableChangeListener>();
    
    @Override
    public M2 put( M1 key, M2 value ) {
        M2 val = super.put(key, value);
        for( HashtableChangeListener l : listeners ) {
            l.keyChanged();
        }
        return val;
    }

    public void addListener( HashtableChangeListener l ) {
        listeners.add( l );
    }
}
