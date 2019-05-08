/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package it.digitalviews.cveducation;

import de.humatic.dsj.*;
import de.humatic.dsj.DSCapture.CaptureDevice;
import de.humatic.dsj.DSFilterInfo.DSPinInfo;
import frozenbubble.FrozenBubble;
import frozenbubble.net.library.jiga.AppletPanel;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.AffineTransform;
import java.awt.image.*;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.Hashtable;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.*;
import javax.swing.border.BevelBorder;
import javax.swing.border.Border;
import javax.swing.border.TitledBorder;
import jsyntaxpane.DefaultSyntaxKit;

/**
 *
 * @author andrea
 */
public final class ToolboxWindow extends JFrame implements WindowListener, Runnable, PropertyChangeListener, ChangeNotifierHashTable.HashtableChangeListener {

    public BufferedImage originalImage, magentaChromaImage, greenChromaImage, houghImage, buttonsImage, houghBuilding;
    public int[] originalImageData, magentaChromaImageData, greenChromaImageData, houghImageData, buttonsImageData, houghBuildingData;
    public JImagePanel originalImagePanel, magentaChromaImagePanel, greenChromaImagePanel, houghImagePanel, buttonsImagePanel;
    public double[][] yData, uData, vData;
    public boolean[][] barMask, buttonsMask;
    public boolean[] lineBarMask, lineButtonsMask;
    public boolean[] buttonStatus;
    private DSCapture webcam;
    Map<String, DynamicExecutable> compiledClasses;
    JavaEditorCompiler chromaKey, houghTransform, buttonsDetection;
    FrozenBubble game;
    JFileChooser fileChooser;
    JTextField magenta_u, magenta_v, magenta_radius, green_u, green_v, green_radius, alpha_step, r_step, r_max;
    ResultCanvas results;
    int[] rainbowPalette;
    Thread myThread;
    Object chromaObject;
    DynamicExecutable chromaKeyClass;
    Object houghObject;
    DynamicExecutable houghTransformClass;
    Object buttonsDetectionObject;
    DynamicExecutable buttonsDetectionClass;

    public ToolboxWindow(boolean debug) {

        String[] chromaKeyStub = ProgrammingTemplates.ChromaKeyStub;
        String[] houghTransformStub = ProgrammingTemplates.houghTransformStub;
        String[] buttonsDetectionStub = ProgrammingTemplates.buttonsDetectionStub;
        String default_bar_u = "0.0";
        String default_bar_v = "0.0";
        String default_bar_radius = "0.5";
        String default_buttons_u = "0.0";
        String default_buttons_v = "0.0";
        String default_buttons_radius = "0.2";
        String default_alpha_step = "0.5";
        String default_r_step = "4.0";
        String default_r_max = "400.0";

        if (debug) {
            chromaKeyStub = ProgrammingTemplates.ChromaKeyReference;
            houghTransformStub = ProgrammingTemplates.houghTransformReference;
            buttonsDetectionStub = ProgrammingTemplates.buttonsDetectionReference;
            default_bar_u = "0.5";
            default_bar_v = "0.5";
            default_bar_radius = "0.5";
            default_buttons_u = "-0.5";
            default_buttons_v = "-0.5";
            default_buttons_radius = "0.6";
            default_alpha_step = "0.1";
            default_r_step = "4.0";
            default_r_max = "400.0";
        }

        rainbowPalette = new int[1024];
        int color = 0;
        for (int i = 0; i <= 255; i++) {
            rainbowPalette[color++] = (i << 8) | 0x0000ff;
        }
        for (int i = 255; i >= 0; i--) {
            rainbowPalette[color++] = (i) | 0x00ff00;
        }
        for (int i = 0; i <= 255; i++) {
            rainbowPalette[color++] = (i << 16) | 0x00ff00;
        }
        for (int i = 255; i >= 0; i--) {
            rainbowPalette[color++] = (i << 8) | 0xff0000;
        }

        setSize(1000, 700);
        setTitle("Università Ca' Foscari di Venezia - Esercitazione di Computer Vision");

        originalImage = new BufferedImage(320, 240, BufferedImage.TYPE_INT_RGB);
        originalImageData = new int[320 * 240];
        magentaChromaImage = new BufferedImage(320, 240, BufferedImage.TYPE_INT_RGB);
        magentaChromaImageData = new int[320 * 240];
        greenChromaImage = new BufferedImage(320, 240, BufferedImage.TYPE_INT_RGB);
        greenChromaImageData = new int[320 * 240];
        houghImage = new BufferedImage(320, 240, BufferedImage.TYPE_INT_RGB);
        houghImageData = new int[320 * 240];
        houghBuilding = new BufferedImage(320, 240, BufferedImage.TYPE_INT_RGB);
        houghBuildingData = new int[320 * 240];
        buttonsImage = new BufferedImage(320, 30, BufferedImage.TYPE_INT_RGB);
        buttonsImageData = new int[320 * 30];
        yData = new double[320][240];
        uData = new double[320][240];
        vData = new double[320][240];
        barMask = new boolean[320][240];
        buttonsMask = new boolean[320][240];
        lineBarMask = new boolean[320];
        lineButtonsMask = new boolean[320];
        buttonStatus = new boolean[2];

        Box monitorBox = new Box(BoxLayout.X_AXIS);
        monitorBox.add(Box.createHorizontalGlue());

        Box originalBox = new Box(BoxLayout.Y_AXIS);
        originalBox.setMaximumSize(new Dimension(320, 700));
        originalBox.add(new BigLabel(("Webcam Preview")));
        originalImagePanel = new JImagePanel(originalImage);

        originalBox.add(originalImagePanel);
        originalBox.add(Box.createVerticalGlue());

        Box cameraControls = new Box(BoxLayout.Y_AXIS);
        cameraControls.setMaximumSize(new Dimension(320, 700));
        cameraControls.setBorder(BorderFactory.createTitledBorder(BorderFactory.createLineBorder(Color.black, 1), "Controlli della webcam", TitledBorder.LEFT, TitledBorder.TOP));

        if (!initCamera(cameraControls)) {
            JOptionPane.showMessageDialog(this, "Impossibile inizializzare la webcam. Assicurarsi di aver connesso una Logitech C120 USB !", "Errore inizializzazione webcam", JOptionPane.ERROR_MESSAGE);
            System.exit(0);
        }

        originalBox.add(cameraControls);
        monitorBox.add(originalBox);

        monitorBox.add(Box.createRigidArea(new Dimension(4, 4)));

        Box chromaBox = new Box(BoxLayout.Y_AXIS);
        chromaBox.setMaximumSize(new Dimension(320, 700));
        chromaBox.add(new BigLabel(("Magenta Chroma Key")));
        magentaChromaImagePanel = new JImagePanel(magentaChromaImage);
        chromaBox.add(magentaChromaImagePanel);

        chromaBox.add(Box.createRigidArea(new Dimension(10, 4)));
        Box magentaParameters = new Box(BoxLayout.X_AXIS);
        magentaParameters.setMaximumSize(new Dimension(320, 46));
        magentaParameters.setBorder(BorderFactory.createTitledBorder(BorderFactory.createLineBorder(Color.black, 1), "Parametri", TitledBorder.LEFT, TitledBorder.TOP));
        magentaParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        magentaParameters.add(new JLabel("u : "));
        magenta_u = new JTextField(default_bar_u);
        magentaParameters.add(magenta_u);
        magentaParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        magentaParameters.add(new JLabel("v : "));
        magenta_v = new JTextField(default_bar_v);
        magentaParameters.add(magenta_v);
        magentaParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        magentaParameters.add(new JLabel("radius : "));
        magenta_radius = new JTextField(default_bar_radius);
        magentaParameters.add(magenta_radius);
        chromaBox.add(magentaParameters);

        chromaBox.add(Box.createVerticalGlue());

        chromaBox.add(new BigLabel(("Green Chroma Key")));
        greenChromaImagePanel = new JImagePanel(greenChromaImage);
        chromaBox.add(greenChromaImagePanel);

        chromaBox.add(Box.createRigidArea(new Dimension(10, 4)));

        Box greenParameters = new Box(BoxLayout.X_AXIS);
        greenParameters.setMaximumSize(new Dimension(320, 46));
        greenParameters.setBorder(BorderFactory.createTitledBorder(BorderFactory.createLineBorder(Color.black, 1), "Parametri", TitledBorder.LEFT, TitledBorder.TOP));
        greenParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        greenParameters.add(new JLabel("u : "));
        green_u = new JTextField(default_buttons_u);
        greenParameters.add(green_u);
        greenParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        greenParameters.add(new JLabel("v : "));
        green_v = new JTextField(default_buttons_v);
        greenParameters.add(green_v);
        greenParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        greenParameters.add(new JLabel("radius : "));
        green_radius = new JTextField(default_buttons_radius);
        greenParameters.add(green_radius);
        chromaBox.add(greenParameters);

        monitorBox.add(chromaBox);
        monitorBox.add(Box.createRigidArea(new Dimension(4, 4)));

        Box houghBox = new Box(BoxLayout.Y_AXIS);
        chromaBox.setMaximumSize(new Dimension(320, 700));
        houghBox.add(new BigLabel(("Hough Transform")));
        houghImagePanel = new JImagePanel(houghImage);
        houghBox.add(houghImagePanel);

        houghBox.add(Box.createRigidArea(new Dimension(10, 4)));
        Box houghParameters = new Box(BoxLayout.X_AXIS);
        houghParameters.setMaximumSize(new Dimension(320, 46));
        houghParameters.setBorder(BorderFactory.createTitledBorder(BorderFactory.createLineBorder(Color.black, 1), "Parametri", TitledBorder.LEFT, TitledBorder.TOP));
        houghParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        houghParameters.add(new JLabel("α-step : "));
        alpha_step = new JTextField(default_alpha_step);
        houghParameters.add(alpha_step);
        houghParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        houghParameters.add(new JLabel("r-step : "));
        r_step = new JTextField(default_r_step);
        houghParameters.add(r_step);
        houghParameters.add(Box.createRigidArea(new Dimension(10, 4)));
        houghParameters.add(new JLabel("r-max : "));
        r_max = new JTextField(default_r_max);
        houghParameters.add(r_max);
        houghBox.add(houghParameters);

        houghBox.add(Box.createVerticalGlue());

        houghBox.add(new BigLabel(("Buttons Detection")));
        buttonsImagePanel = new JImagePanel(buttonsImage);
        houghBox.add(buttonsImagePanel);

        houghBox.add(Box.createVerticalGlue());

        houghBox.add(new BigLabel(("Risultati")));
        results = new ResultCanvas(320, 240);
        houghBox.add(results);

        monitorBox.add(houghBox);
        monitorBox.add(Box.createHorizontalGlue());

        fileChooser = new JFileChooser();

        ChangeNotifierHashTable<String, DynamicExecutable> ht = new ChangeNotifierHashTable<String, DynamicExecutable>();
        ht.addListener(this);
        compiledClasses = Collections.synchronizedMap(ht);

        chromaKey = new JavaEditorCompiler(fileChooser, "ChromaKey", chromaKeyStub, ProgrammingTemplates.ChromaKeyReference, "chromaok", compiledClasses);
        houghTransform = new JavaEditorCompiler(fileChooser, "HoughTransform", houghTransformStub, ProgrammingTemplates.houghTransformReference, "houghenough", compiledClasses);
        buttonsDetection = new JavaEditorCompiler(fileChooser, "ButtonsDetection", buttonsDetectionStub, ProgrammingTemplates.buttonsDetectionReference, "bottombutton", compiledClasses);

        game = new FrozenBubble();
        AppletPanel gameFrame = new AppletPanel("Frozen Bubble v1.0.0",game, 640, 480);
        Box gameBox = new Box(BoxLayout.X_AXIS);
        gameBox.add(gameFrame);

        JTabbedPane tabs = new javax.swing.JTabbedPane();
        tabs.addTab("Webcam Monitor", monitorBox);
        tabs.addTab("Procedura ChromaKey", chromaKey);
        tabs.addTab("Procedura HoughTransforms", houghTransform);
        tabs.addTab("Procedura ButtonsDetection", buttonsDetection);
        tabs.addTab("Frozen Bubble", gameBox);

        setContentPane(tabs);
        addWindowListener(this);
        setResizable(false);
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        setVisible(true);

        myThread = new Thread(this);
        myThread.start();

    }

    public void addCameraControls() {
    }

    public boolean initCamera(Box originalBox) {
        DSFilterInfo camera = null;
        for (DSFilterInfo videoDevice : (DSCapture.queryDevices())[0]) {
            if (!videoDevice.getName().equals("none")) {
//            if (videoDevice.getName().equals("Logitech Webcam 120")) {
                for (DSPinInfo pinInfo : videoDevice.getDownstreamPins()) {
                    if (pinInfo.getID().equals("0")) {
                        int index = 0;
                        for (DSMediaType mediaType : pinInfo.getFormats()) {
                            if (mediaType.getSubType() == DSConstants.RGB24
                                    && mediaType.getBitDepth() == 24
                                    && mediaType.getWidth() == 320
                                    && mediaType.getHeight() == 240) {
                                pinInfo.setPreferredFormat(index);
                            }
                            index++;
                        }
                    }
                }
                camera = videoDevice;
            }
        }
        if (camera == null) {
            return false;
        } else {
            webcam = new DSCapture(DSFiltergraph.JAVA_POLL, camera, false, DSFilterInfo.doNotRender(), this);
//            webcam = new DSCapture(DSFiltergraph.JAVA_POLL | DSFiltergraph.YUV, camera, false, DSFilterInfo.doNotRender(), this);
            CaptureDevice capture = webcam.getActiveVideoDevice();
            try{
              capture.getControls().setKSProperty(CaptureDeviceControls.KS_CAMCTRL, CaptureDeviceControls.KS_CAMCTRL_EXPOSURE, new int[]{0});
            }catch(Exception e){
                e.printStackTrace();
            }
            try{
              originalBox.add(capture.getControls().getController(CaptureDeviceControls.EXPOSURE, 0, true));
            }catch(Exception e){
                e.printStackTrace();
            }
            originalBox.add(capture.getControls().getController(CaptureDeviceControls.SHARPNESS, 0, true));
            originalBox.add(capture.getControls().getController(CaptureDeviceControls.BRIGHTNESS, 0, true));
            originalBox.add(capture.getControls().getController(CaptureDeviceControls.CONTRAST, 0, true));
            originalBox.add(capture.getControls().getController(CaptureDeviceControls.SATURATION, 0, true));
            originalBox.add(capture.getControls().getController(CaptureDeviceControls.GAIN, 0, true));
            try{
               originalBox.add(capture.getControls().getController(CaptureDeviceControls.LT_EXPOSURE_TIME, 0, true));
            }catch(Exception e){
                e.printStackTrace();
            }
//            originalBox.add(capture.getControls().getController(CaptureDeviceControls.LT_LED, 0, true));

            return true;
        }
    }

    public void windowOpened(WindowEvent e) {
    }

    public void windowClosing(WindowEvent e) {
        if (JOptionPane.showConfirmDialog(this, "Vuoi veramente uscire ?") == JOptionPane.YES_OPTION) {
            System.exit(0);
        }
    }

    public void windowClosed(WindowEvent e) {
    }

    public void windowIconified(WindowEvent e) {
    }

    public void windowDeiconified(WindowEvent e) {
    }

    public void windowActivated(WindowEvent e) {
    }

    public void windowDeactivated(WindowEvent e) {
    }

    private void fillYuvData() {
        int pixel = 0;
        for (int y = 0; y < 240; y++) {
            for (int x = 0; x < 320; x++) {
                int r = (originalImageData[pixel] & 0x00ff0000) >> 16;
                int g = (originalImageData[pixel] & 0x0000ff00) >> 8;
                int b = (originalImageData[pixel] & 0x000000ff);
                yData[x][y] = 0.299 * r + 0.587 * g + 0.114 * b;
                uData[x][y] = (-(0.148 * r) - (0.291 * g) + (0.439 * b) + 128.0) / 256.0 - 0.5;
                vData[x][y] = ((0.439 * r) - (0.368 * g) - (0.071 * b) + 128.0) / 256.0 - 0.5;
                pixel++;
            }
        }
    }

    private void runCustomMethods() {
        chromaKeyClass = compiledClasses.get("ChromaKey");
        if (chromaKeyClass != null) {
            try {

                // Invoco il filtro chroma per la barra e per i bottoni

                chromaObject = chromaKeyClass.getDynamicClass().newInstance();
                Class[] paramTypes = {Double.TYPE, Double.TYPE, Double.TYPE, double[][].class, double[][].class, boolean[][].class};
                Object[] magenta_arguments = {new Double(magenta_u.getText()), new Double(magenta_v.getText()), new Double(magenta_radius.getText()), uData, vData, barMask};
                Object[] green_arguments = {new Double(green_u.getText()), new Double(green_v.getText()), new Double(green_radius.getText()), uData, vData, buttonsMask};

                PrintStream oldStdOut = System.out;
                PrintStream oldStdErr = System.err;
                System.setOut(chromaKeyClass.getStdout());
                System.setErr(chromaKeyClass.getStderr());
                try {
                    Method method = chromaKeyClass.getDynamicClass().getDeclaredMethod("chromaKey", paramTypes);
                    method.invoke(chromaObject, magenta_arguments);
                    method.invoke(chromaObject, green_arguments);
                } catch (NoSuchMethodException ex2) {
                    JOptionPane.showMessageDialog(this, "L'intestazione della procedura è stata modificata.", "Impossibile applicare la procedura chromaKey", JOptionPane.ERROR_MESSAGE);
                    compiledClasses.remove("ChromaKey");
                    return;
                } catch (Throwable t) {
                    t.printStackTrace();
                }
                System.setOut(oldStdOut);
                System.setErr(oldStdErr);

                // Aggiorno tutte le immagini relative

                int p = 0;
                for (int y = 0; y < 240; y++) {
                    for (int x = 0; x < 320; x++) {
                        magentaChromaImageData[p] = barMask[x][y] ? 0xff00ff : 0x000000;
                        greenChromaImageData[p] = buttonsMask[x][y] ? 0x00ff00 : 0x000000;
                        p++;
                    }
                }
                magentaChromaImage.setRGB(0, 0, 320, 240, magentaChromaImageData, 0, 320);
                greenChromaImage.setRGB(0, 0, 320, 240, greenChromaImageData, 0, 320);

                // Invoco la trasformata di Hough

                houghTransformClass = compiledClasses.get("HoughTransform");
                if (houghTransformClass != null) {

                    double[] params = new double[2];
                    double alpha_step_d = Double.valueOf(alpha_step.getText());
                    double r_step_d = Double.valueOf(r_step.getText());
                    double r_max_d = Double.valueOf(r_max.getText());

                    if ((alpha_step_d > 0.0) && (r_step_d > 0.0)) {

                        int alpha_steps = (int) (Math.PI / alpha_step_d) + 1;
                        int r_steps = (int) ((r_max_d * 2.0) / r_step_d) + 1;
                        double[][] accumulator = new double[alpha_steps][r_steps];

                        houghObject = houghTransformClass.getDynamicClass().newInstance();
                        Class[] hough_paramTypes = {Double.TYPE, Double.TYPE, Double.TYPE, double[][].class, boolean[][].class,
                            double[][].class, double[].class};
                        Object[] hough_arguments = {new Double(alpha_step.getText()), new Double(r_step.getText()), new Double(r_max.getText()), yData, barMask,
                            accumulator, params};
                        oldStdOut = System.out;
                        oldStdErr = System.err;
                        System.setOut(houghTransformClass.getStdout());
                        System.setErr(houghTransformClass.getStderr());
                        try {
                            Method hough_method = houghTransformClass.getDynamicClass().getDeclaredMethod("houghTransform", hough_paramTypes);
                            hough_method.invoke(houghObject, hough_arguments);
                        } catch (NoSuchMethodException ex2) {
                            JOptionPane.showMessageDialog(this, "L'intestazione della procedura è stata modificata.", "Impossibile applicare la procedura houghTransform", JOptionPane.ERROR_MESSAGE);
                            compiledClasses.remove("HoughTransform");
                            return;
                        } catch (Throwable t) {
                            t.printStackTrace();
                        }
                        System.setOut(oldStdOut);
                        System.setErr(oldStdErr);

                        // Ora aggiorno l'immagine della trasformata ed i parametri
                        if ((alpha_steps != houghBuilding.getWidth()) || (r_steps != houghBuilding.getHeight())) {
                            houghBuilding = new BufferedImage(alpha_steps, r_steps, BufferedImage.TYPE_INT_RGB);
                            houghBuildingData = new int[alpha_steps * r_steps];
                        }
                        double max = 0;
                        for (int y = 0; y < r_steps; y++) {
                            for (int x = 0; x < alpha_steps; x++) {
                                if (accumulator[x][y] > max) {
                                    max = accumulator[x][y];
                                }
                            }
                        }
                        double ratio = 1023.0 / max;
                        p = 0;
                        for (int y = 0; y < r_steps; y++) {
                            for (int x = 0; x < alpha_steps; x++) {
                                int baseGrey = (int) (accumulator[x][y] * ratio);
                                houghBuildingData[p++] = rainbowPalette[baseGrey];
                            }
                        }
                        houghBuilding.setRGB(0, 0, alpha_steps, r_steps, houghBuildingData, 0, alpha_steps);

                        Graphics2D destination = houghImage.createGraphics();

                        AffineTransform scale = AffineTransform.getScaleInstance(320.0 / alpha_steps, 240.0 / r_steps);
                        destination.drawImage(houghBuilding, scale, this);
                        houghImagePanel.repaint();

                        // Sanity check on the max
                        if(max<5000){
                            params[0] = 0;
                            params[1] = 0;
                        }

                        results.setParameters(params[0], params[1]);

                        double obtained_alpha = params[0];
                        double obtained_r = params[1];

                        if (Math.abs(obtained_alpha) > 0.001) {

                            double a = -Math.cos(obtained_alpha) / Math.sin(obtained_alpha);
                            double b = obtained_r / Math.sin(obtained_alpha);
                            int startY = (int) b;
                            int endY = (int) ((a * 319.0) + b);
                            Graphics2D g_magenta = magentaChromaImage.createGraphics();
                            g_magenta.setColor(Color.yellow);
                            g_magenta.drawLine(0, startY, 319, endY);
                            Graphics2D g_green = greenChromaImage.createGraphics();
                            g_green.setColor(Color.red);
                            g_green.drawLine(0, startY, 319, endY);

                            // Ora popolo le maschere per il riconoscimento dei bottoni
                            int border = 10;
                            for (int x = 0; x < 320; x++) {
                                int ycenter = (int) ((a * x) + b);
                                int yup = ycenter - border;
                                int ydown = ycenter + border;
                                if (yup < 0) {
                                    yup = 0;
                                }
                                if (ydown > 240) {
                                    ydown = 240;
                                }
                                boolean barMatch = false;
                                boolean buttonMatch = false;
                                for (int y = yup; y < ydown; y++) {
                                    if (barMask[x][y]) {
                                        barMatch = true;
                                    }
                                    if (buttonsMask[x][y]) {
                                        buttonMatch = true;
                                    }
                                }
                                lineBarMask[x] = barMatch;
                                lineButtonsMask[x] = buttonMatch;
                            }

                            //TODO !!!!!!!!!!!!!
                            int bu = 0;
                            for (int y = 0; y < 30; y++) {
                                for (int x = 0; x < 320; x++) {
                                    buttonsImageData[bu] = 0;
                                    if (lineBarMask[x]) {
                                        buttonsImageData[bu] = 0xff00ff;
                                    }
                                    if (lineButtonsMask[x]) {
                                        buttonsImageData[bu] = 0x00ff00;
                                    }
                                    bu++;
                                }
                            }

                            buttonsImage.setRGB(0, 0, 320, 30, buttonsImageData, 0, 320);
                            buttonsImagePanel.repaint();

                            buttonsDetectionClass = compiledClasses.get("ButtonsDetection");
                            boolean[] buttons = new boolean[2];
                            if (buttonsDetectionClass != null) {
                                buttonsDetectionObject = buttonsDetectionClass.getDynamicClass().newInstance();
                                Class[] buttons_paramTypes = {boolean[].class, boolean[].class, boolean[].class};
                                Object[] buttons_arguments = {lineBarMask, lineButtonsMask, buttons};

                                oldStdOut = System.out;
                                oldStdErr = System.err;
                                System.setOut(buttonsDetectionClass.getStdout());
                                System.setErr(buttonsDetectionClass.getStderr());
                                try {
                                    Method buttons_method = buttonsDetectionClass.getDynamicClass().getDeclaredMethod("buttonsDetection", buttons_paramTypes);
                                    buttons_method.invoke(buttonsDetectionObject, buttons_arguments);
                                } catch (NoSuchMethodException ex3) {
                                    JOptionPane.showMessageDialog(this, "L'intestazione della procedura è stata modificata.", "Impossibile applicare la procedura ButtonsDetection", JOptionPane.ERROR_MESSAGE);
                                    compiledClasses.remove("ButtonsDetection");
                                    return;
                                } catch (Throwable t) {
                                    t.printStackTrace();
                                }
                                System.setOut(oldStdOut);
                                System.setErr(oldStdErr);

                                results.setButtons(buttons[0], buttons[1]);

                            }

                            try{
                                if(FrozenBubble.game!=null){
                                    int position = 40 - (int)((obtained_alpha-(Math.PI/2.0))*40.0);
                                    FrozenBubble.game.setPosition(position);
                                    if( ( buttons[0] || buttons [1] ) && ((!buttonStatus[0]) && (!buttonStatus[1]))){
                                        FrozenBubble.game.setFire();
                                    }
                                }
                            }catch(Throwable t){
                                t.printStackTrace();
                            }

                            buttonStatus[0] = buttons[0];
                            buttonStatus[1] = buttons[1];
                        }

                        results.repaint();

                    }
                }

                magentaChromaImagePanel.repaint();
                greenChromaImagePanel.repaint();

            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    public void run() {

        while (true) {
            try {
                BufferedImage frame = webcam.getImage();
                if (frame == null) {
                    continue;
                }
                
                Graphics2D destination = originalImage.createGraphics();
                AffineTransform scale = AffineTransform.getScaleInstance(320.0 / frame.getWidth(), 240.0 / frame.getHeight());
                destination.drawImage(frame, scale, this);
                originalImage.getRGB(0, 0, 320, 240, originalImageData, 0, 320);
                originalImagePanel.repaint();
                fillYuvData();

                runCustomMethods();

            } catch (Exception e) {
                e.printStackTrace();
            }

        }
    }

    public void propertyChange(PropertyChangeEvent evt) {
    }

    private void invokeForceQuit(DynamicExecutable ex, Object obj) {
        if (ex != null && obj != null) {
            Class[] paramTypes = {};
            Object[] arguments = {};
            Method forcequit;
            try {
                forcequit = ex.getDynamicClass().getDeclaredMethod("forceQuit", paramTypes);
                forcequit.invoke(obj, arguments);
            } catch (Exception exc) {
                System.out.println("Unable to call forcequit: " + exc.getMessage());
            }
        }
    }

    public void keyChanged() {
        invokeForceQuit(chromaKeyClass, chromaObject);
        invokeForceQuit(houghTransformClass, houghObject);
        invokeForceQuit(buttonsDetectionClass, buttonsDetectionObject);
    }

    public static void main(String[] args) {

        // Date time bomb
        DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
        Date date = new Date();
        String dateStr = dateFormat.format(date);
        if (!dateStr.equals("2011/01/31")
                && !dateStr.equals("2011/02/01")) {
            //System.exit(0);
        }

        DefaultSyntaxKit.initKit();
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            //UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
        } catch (Exception e) {
            System.out.println("Error setting native LAF: " + e);
        }
        new ToolboxWindow(false);
    }

}
