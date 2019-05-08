/*
 *                               [ JIGA ]
 *
 * Copyright (c) 2004 Shiraz Kanga <skanga at findant.com>
 *
 * This code is distributed under the GNU Library General Public License 
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Library General Public License
 * as published by the Free Software Foundation; either version 2 of the 
 * License, or (at your option) any later version. 
 * 
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Library General Public License for more details.
 * 
 * You should have received a copy of the GNU Library General Public License
 * along with this program; if not, write to the Free Software Foundation, Inc., 
 * 675 Mass Ave, Cambridge, MA 02139, USA.
 *
 *               
 *                 [http://glenn.sanson.free.fr/jiga/]
 */

package frozenbubble.net.library.jiga;

import java.applet.Applet;
import java.applet.AppletContext;
import java.applet.AppletStub;
import java.applet.AudioClip;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;

import java.awt.Frame;
import java.awt.Image;
import java.awt.Panel;
import java.awt.Toolkit;

import java.awt.event.WindowListener;
import java.awt.event.WindowEvent;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import java.net.MalformedURLException;
import java.net.URL;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Iterator;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JLabel;
import javax.swing.JPanel;

/**
 * A Frame for running an Applet so the applet can run as an application.
 * @author Shiraz Kanga
 */
public class AppletPanel extends JPanel implements AppletStub, AppletContext {

	private static final long serialVersionUID = 8078920176677615745L;

	private GameApplet applet;

    private Hashtable props = new Hashtable();

    /**
     * Construct a Frame of the given size to run the given Applet
     * 
     * @param name
     *            the Frames title
     * @param applet
     *            the applet to run
     * @param width
     *            width of the game frame
     * @param height
     *            height of the game frame
     */
    public AppletPanel(String name, GameApplet applet, int width, int height) {

        super();
        this.applet = applet;
        applet.setStub(this);
        applet.setAsApplication();
        applet.setSize(width, height);
        //applet.setMinimumSize(new Dimension(width, height));

        setSize(width, height);
        setLayout(new BorderLayout());

//        add(applet, BorderLayout.CENTER);

          //setBackground(Color.red);



        Box appletBoxX = new Box(BoxLayout.X_AXIS);
        appletBoxX.add(Box.createRigidArea(new Dimension(180, 480)));
        appletBoxX.add(applet);
        appletBoxX.add(Box.createRigidArea(new Dimension(180, 480)));

        Box appletBoxY = new Box(BoxLayout.Y_AXIS);
        appletBoxY.add(Box.createRigidArea(new Dimension(1000, 80)));
        appletBoxY.add(appletBoxX);
        add(appletBoxY, BorderLayout.CENTER);


        /*
        setLayout(new BorderLayout());
        JLabel l1 = new JLabel("");
        JLabel l2 = new JLabel("");
        l1.setMinimumSize(new Dimension(100, 100));
        l2.setMaximumSize(new Dimension(100, 100));
        this.add(l1,BorderLayout.LINE_START);
        this.add(l2,BorderLayout.PAGE_START);
        this.add(applet, BorderLayout.CENTER);
         */

        applet.init();
        applet.start();
    }

    // AppletStub API

    public void appletResize(int width, int height) {
        setSize(width, height);
    }

    public AppletContext getAppletContext() {
        return this;
    }

    public URL getCodeBase() {
        URL u = null;
        try {
            u = new File(System.getProperty("user.dir")).toURL();
        } catch (MalformedURLException me) {
        }

        return u;
    }

    public URL getDocumentBase() {
        URL u = null;
        try {
            u = new File(System.getProperty("user.dir")).toURL();
        } catch (MalformedURLException me) {
        }

        return u;
    }

    public String getParameter(String name) {
        return (String) props.get(name);
    }

    public void setParameter(String name, String value) {
        props.put(name, value);
    }

    public boolean isActive() {
        return true;
    }

    // AppletContext API
    public Applet getApplet(String name) {
        return applet;
    }

    public Enumeration getApplets() {
        return null;
    }

    public AudioClip getAudioClip(URL url) {
        return Applet.newAudioClip(url);
    }

    public Image getImage(URL url) {
        return Toolkit.getDefaultToolkit().getImage(url);
    }

    public void showDocument(URL url) {
    }

    public void showDocument(URL url, String target) {
    }

    public void showStatus(String status) {
        System.out.println(status);
    }

    public void setStream(String key, InputStream stream) throws IOException {
    }

    public InputStream getStream(String key) {
        return null;
    }

    public Iterator getStreamKeys() {
        return null;
    }

}