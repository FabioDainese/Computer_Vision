/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package it.digitalviews.cveducation;

import java.awt.Font;
import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JLabel;

/**
 *
 * @author andrea
 */
public class BigLabel extends Box{

    public BigLabel(String text){
        super(BoxLayout.X_AXIS);
        setBorder(BorderFactory.createEmptyBorder(5,5,5,5));
        JLabel label = new JLabel(text);
        Font f = label.getFont();
        label.setFont(f.deriveFont(f.getStyle() ^ Font.BOLD));
        add(label);
        add(Box.createHorizontalGlue());
    }

}
