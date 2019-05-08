/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package it.digitalviews.cveducation;

import java.awt.BasicStroke;
import java.awt.Canvas;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.Shape;
import java.awt.geom.AffineTransform;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Line2D;
import java.awt.geom.Rectangle2D;
import java.text.DecimalFormat;
import javax.swing.JComponent;

/**
 *
 * @author andrea
 */
public class ResultCanvas extends JComponent {

    int width, height;
    double r, alpha;
    boolean b1, b2;

    public ResultCanvas(int width, int height) {
        this.width = width;
        this.height = height;
        setMaximumSize(new Dimension(width, height));
        setMinimumSize(new Dimension(width, height));
        setPreferredSize(new Dimension(width, height));
    }

    public void setParameters(double alpha, double r) {
        this.r = r;
        this.alpha = alpha;
    }

    public void setButtons(boolean b1, boolean b2) {
        this.b1 = b1;
        this.b2 = b2;
    }

    @Override
    public void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        g2.setColor(Color.black);
        g2.fillRect(0, 0, width, height);
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        if (Math.abs(alpha) < 0.00001) {
            
            g2.setColor(Color.red);
            g2.setFont(new Font("monospaced",Font.BOLD,24));
            Font font = g2.getFont();
            String text = "NO SIGNAL";
            Rectangle2D bounds = font.getStringBounds(text, g2.getFontRenderContext());
            g2.drawString(text, (int) ((width - bounds.getWidth()) / 2), (int) ((height) / 2));

        } else {

            g.setColor(Color.white);
            DecimalFormat df = new DecimalFormat("#.###");
            g.drawString("α=" + df.format(alpha) + " r=" + df.format(r) + " b1=" + (b1 ? "on" : "off") + " b2=" + (b2 ? "on" : "off"), 10, height - 10);
            g2.setStroke(new BasicStroke(3.0f));
            AffineTransform rotationTransform = AffineTransform.getRotateInstance(-alpha);
            AffineTransform translationTransform = AffineTransform.getTranslateInstance(width / 2, height / 2);
            Shape ellipse = translationTransform.createTransformedShape(rotationTransform.createTransformedShape(new Ellipse2D.Double(-50, -100, 100, 200)));
            Shape majorAxis = translationTransform.createTransformedShape(rotationTransform.createTransformedShape(new Line2D.Double(0, -100, 0, 100)));
            Shape minorAxis = translationTransform.createTransformedShape(rotationTransform.createTransformedShape(new Line2D.Double(-50, 0, 50, 0)));
            Shape button1 = translationTransform.createTransformedShape(rotationTransform.createTransformedShape(new Ellipse2D.Double(-10, -80, 20, 20)));
            Shape button2 = translationTransform.createTransformedShape(rotationTransform.createTransformedShape(new Ellipse2D.Double(-10, 60, 20, 20)));
            g2.setColor(Color.white);
            g2.draw(majorAxis);
            g2.draw(minorAxis);
            g2.setColor(b1 ? Color.green : Color.red);
            g2.fill(button1);
            g2.setColor(b2 ? Color.green : Color.red);
            g2.fill(button2);
            g2.setColor(Color.yellow);
            g2.draw(ellipse);
            g2.draw(button1);
            g2.draw(button2);
        }
    }
}
