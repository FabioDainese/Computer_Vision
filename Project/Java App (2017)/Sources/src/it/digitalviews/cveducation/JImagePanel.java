package it.digitalviews.cveducation;


import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Image;
import java.awt.image.BufferedImage;
import javax.swing.JComponent;

public class JImagePanel extends JComponent {

    private BufferedImage image;

    public JImagePanel(BufferedImage image) {
        super();
        this.image = image;
        setPreferredSize(new Dimension(image.getWidth(),image.getHeight()));
        setMinimumSize(getPreferredSize());
        setMaximumSize(getPreferredSize());
    }

    public void paint(Graphics g) {
        g.drawImage(image, 0, 0, null);
        g.setColor(Color.black);
        g.drawRect(0, 0, image.getWidth()-1, image.getHeight()-1);
    }
}
