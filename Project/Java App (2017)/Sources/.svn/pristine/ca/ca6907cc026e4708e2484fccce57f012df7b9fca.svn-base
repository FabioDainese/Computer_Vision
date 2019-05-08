package it.digitalviews.cveducation;

import java.io.OutputStream;
import javax.swing.JTextArea;
import javax.swing.text.BadLocationException;

public class JTextAreaOutputStream extends OutputStream {

    JTextArea ta;

    public JTextAreaOutputStream(JTextArea t) {
        super();
        ta = t;
    }

    private void trim(){
        if(ta.getLineCount()>10000)
            try {
            ta.replaceRange(null, 0, ta.getLineStartOffset(1000));
        } catch (BadLocationException ex) {
            ex.printStackTrace();
        }
    }

    public void write(int i) {
        ta.append(Character.toString((char) i));
        trim();
    }

    public void write(char[] buf, int off, int len) {
        String s = new String(buf, off, len);
        ta.append(s);
        trim();
    }
}
