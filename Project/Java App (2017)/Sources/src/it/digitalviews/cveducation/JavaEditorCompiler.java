/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package it.digitalviews.cveducation;

import japa.parser.JavaParser;
import japa.parser.ParseException;
import japa.parser.ast.CompilationUnit;
import japa.parser.ast.stmt.DoStmt;
import japa.parser.ast.stmt.ForStmt;
import japa.parser.ast.stmt.IfStmt;
import japa.parser.ast.stmt.WhileStmt;
import japa.parser.ast.visitor.VoidVisitorAdapter;
import java.awt.Color;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Arrays;
import java.util.Map;
import java.util.List;
import java.util.Locale;
import java.util.PriorityQueue;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JEditorPane;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.JTabbedPane;
import javax.swing.JTextArea;
import javax.swing.JTextPane;
import javax.swing.text.BadLocationException;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaCompiler.CompilationTask;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

/**
 *
 * @author andrea
 */
public class JavaEditorCompiler extends Box implements ActionListener {

    JFileChooser fileChooser;
    String className;
    String password;
    String[] defaultSource, referenceSource;
    boolean unlocked;
    JButton compile, reload, reference, load, save, clear;
    JEditorPane edit;
    JTextPane compileOutput;
    JTextArea standardOutput, standardError;
    PrintStream stdoutStream, stderrStream;
    Map<String, DynamicExecutable> compiledClasses;

    public JavaEditorCompiler(JFileChooser fileChooser, String className, String[] defaultSource, String[] referenceSource, String password, Map<String, DynamicExecutable> compiledClasses) {
        super(BoxLayout.Y_AXIS);
        this.fileChooser = fileChooser;
        this.className = className;
        this.defaultSource = defaultSource;
        this.referenceSource = referenceSource;
        this.password = password;
        this.compiledClasses = compiledClasses;
        unlocked = false;
        JSplitPane split = new javax.swing.JSplitPane(JSplitPane.VERTICAL_SPLIT);
        edit = new JEditorPane();
        JScrollPane editScroll = new JScrollPane(edit);
        edit.setContentType("text/java");
        loadText(defaultSource);
        split.setTopComponent(editScroll);

        compileOutput = new JTextPane();
        standardOutput = new JTextArea();
        standardOutput.setEditable(false);
        standardError = new JTextArea();
        standardError.setEditable(false);
        stdoutStream = new PrintStream(new JTextAreaOutputStream(standardOutput));
        stderrStream = new PrintStream(new JTextAreaOutputStream(standardError));
        JTabbedPane tabs = new javax.swing.JTabbedPane();
        tabs.addTab("Messaggi del compilatore", new JScrollPane(compileOutput));
        tabs.addTab("Standard Output", new JScrollPane(standardOutput));
        tabs.addTab("Standard Error", new JScrollPane(standardError));
        split.setBottomComponent(tabs);

        Box buttons = new Box(BoxLayout.X_AXIS);
        compile = new JButton("Compila");
        compile.addActionListener(this);
        reload = new JButton("Ricarica default");
        reload.addActionListener(this);
        reference = new JButton("Mostra soluzione");
        reference.addActionListener(this);
        load = new JButton("Carica");
        load.addActionListener(this);
        save = new JButton("Salva");
        save.addActionListener(this);
        clear = new JButton("Ripulisci output");
        clear.addActionListener(this);

        buttons.add(load);
        buttons.add(save);
        buttons.add(compile);
        buttons.add(reload);
        buttons.add(reference);
        buttons.add(clear);
        buttons.add(Box.createHorizontalGlue());
        buttons.setBackground(Color.red);
        add(buttons);
        Box editors = new Box(BoxLayout.X_AXIS);
        editors.add(split);
        add(editors);
        split.setDividerLocation(400);
    }

    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == clear) {
            standardOutput.setText("");
            standardError.setText("");
            compileOutput.setText("");
        }

        if (e.getSource() == load) {
            if (fileChooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
                BufferedReader reader = null;
                try {
                    File file = fileChooser.getSelectedFile();
                    reader = new BufferedReader(new FileReader(file));
                    String text = null;
                    StringBuffer data = new StringBuffer();
                    while ((text = reader.readLine()) != null) {
                        data.append(text).append("\n");
                    }
                    edit.setText(data.toString());
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Impossibile aprire il file", "Errore", JOptionPane.ERROR_MESSAGE);
                } finally {
                    try {
                        reader.close();
                    } catch (IOException ex) {
                    }
                }
            }
        }

        if (e.getSource() == save) {
            if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
                File file = fileChooser.getSelectedFile();
                try {
                    PrintWriter writer = new PrintWriter(file);
                    writer.print(edit.getText());
                    writer.close();
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Impossibile salvare il file", "Errore", JOptionPane.ERROR_MESSAGE);
                }
            }
        }

        if (e.getSource() == reload) {
            if (JOptionPane.showConfirmDialog(this, "Vuoi ricaricare il codice di default ?") == JOptionPane.YES_OPTION) {
                loadText(defaultSource);
            }
        }
        if (e.getSource() == reference) {
            if ((unlocked) || (JOptionPane.showInputDialog(this, "Inserire la password per caricare il codice di riferimento", "Richiesta password", JOptionPane.QUESTION_MESSAGE).equals(password))) {
                loadText(referenceSource);
                unlocked = true;
            } else {
                JOptionPane.showMessageDialog(this, "La password inserita non è corretta", "Errore", JOptionPane.ERROR_MESSAGE);
            }
        }
        if (e.getSource() == compile) {
            File basedir = new File( "compiledCode");
            if( !basedir.isDirectory() ) {
                basedir.mkdir();
            }            
            String filename = basedir + "/" + className + ".java";
            try {
                OutputStreamWriter out = new OutputStreamWriter(new FileOutputStream(filename));
                out.write( completeSource( edit.getText() ) );
                out.close();
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            
            JavaCompiler jc = ToolProvider.getSystemJavaCompiler();
            DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();
            StandardJavaFileManager sjfm = jc.getStandardFileManager(diagnostics, null, null);
            Iterable fileObjects = sjfm.getJavaFileObjects(new File(filename));
            String[] options = new String[]{"-d", basedir.getName() };
            jc.getTask(null, null, null, Arrays.asList(options), null, fileObjects).call();
            CompilationTask task = jc.getTask(null, sjfm, diagnostics, Arrays.asList(options), null, fileObjects);
            task.call();
            List<Diagnostic<? extends JavaFileObject>> diagnosticList = diagnostics.getDiagnostics();
            if (diagnosticList.size() == 0) {

                //Here the compilation was ok, so we add safety flags to our source file and restart compilation);
                try {
                    String newsource = addSafetyFlagsToSource( new File(filename) );
                    OutputStreamWriter out = new OutputStreamWriter(new FileOutputStream(filename));
                    out.write( newsource );
                    out.close();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
                task = jc.getTask(null, sjfm, diagnostics, Arrays.asList(options), null, fileObjects);
                task.call();
                diagnosticList = diagnostics.getDiagnostics();
                if( diagnosticList.size() != 0 ) {
                    compileOutput.setText("Errore nella compilazione. Impossible inserire safety flags.");
                    return;
                }

                compileOutput.setText("Compilazione effettuata correttamente");
                try {
                    synchronized (compiledClasses) {
                        URLClassLoader ucl = new URLClassLoader(new URL[]{new URL("file:./" + basedir + "/")});
                        Class compiledClass = ucl.loadClass(className);
                        compiledClasses.put(className, new DynamicExecutable(compiledClass, stdoutStream, stderrStream));
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            } else {
                StringBuffer message = new StringBuffer();
                for (Diagnostic<? extends JavaFileObject> diagnostic : diagnosticList) {
                    message.append("Error at line: " + diagnostic.getLineNumber() + " column: " + diagnostic.getColumnNumber() + "\n");
                    message.append(diagnostic.getMessage(Locale.getDefault()) + "\n");
                    String context;
                    try {
                        context = edit.getText((int) diagnostic.getStartPosition(), (int) diagnostic.getEndPosition() - (int) diagnostic.getStartPosition());
                        message.append(context + "\n");
                    } catch (BadLocationException ex) {
                    }
                    message.append("\n");
                }
                compileOutput.setText(message.toString());
            }
        }
    }

    public void loadText(String[] text) {
        StringBuilder buffer = new StringBuilder();
        for (String line : text) {
            buffer.append(line);
            buffer.append("\n");
            edit.setText(buffer.toString());
        }
    }


    public String completeSource( String sourceStr ) {
        StringBuffer source = new StringBuffer();
        source.append("public class ");
        source.append( className );
        source.append( "  {" );
        source.append(" private boolean cancontinue = true; ");
        source.append(" private synchronized boolean canContinue() { ");
        source.append("    return cancontinue; ");
        source.append(" } ");
        source.append(" public synchronized void forceQuit() { ");
        source.append("    cancontinue=false; ");
        source.append(" } ");
        source.append(sourceStr);
        source.append( "}\n" );
        return source.toString();
    }



    private static class LoopsVisitor extends VoidVisitorAdapter {

        public static class SourceLocation implements Comparable {
            int row;
            int col;
            public SourceLocation(int row, int col) {
                this.row = row;
                this.col = col;
            }

            public int compareTo(Object o) {
                SourceLocation other = (SourceLocation)o;
                if( other.row == row ) {
                    return new Integer(col).compareTo( new Integer(other.col) );
                }
                return new Integer(row).compareTo( new Integer(other.row) );
            }
        };

        public PriorityQueue<SourceLocation> loopsConditionLocations = new PriorityQueue<SourceLocation>();
        
        @Override
        public void visit(ForStmt n, Object arg) {
            //System.out.println("For comparison: " + n.getCompare().toString());
            //System.out.println("AT: " + n.getCompare().getBeginLine() + " " + n.getCompare().getBeginColumn());

            loopsConditionLocations.add( new SourceLocation(n.getCompare().getBeginLine(), n.getCompare().getBeginColumn() ) );
            n.getBody().accept(this, arg);
        }

        @Override
        public void visit(WhileStmt n, Object arg) {
            //System.out.println("While comparison: " + n.getCondition().toString());
            //System.out.println("AT: " + n.getCondition().getBeginLine() + " " + n.getCondition().getBeginColumn());

            loopsConditionLocations.add( new SourceLocation(n.getCondition().getBeginLine(), n.getCondition().getBeginColumn() ) );
            n.getBody().accept(this, arg);
        }

        @Override
        public void visit(DoStmt n, Object arg) {
            //System.out.println("DoWhile comparison: " + n.getCondition().toString());
            //System.out.println("AT: " + n.getCondition().getBeginLine() + " " + n.getCondition().getBeginColumn());

            loopsConditionLocations.add( new SourceLocation(n.getCondition().getBeginLine(), n.getCondition().getBeginColumn() ) );
            n.getBody().accept(this, arg);
        }
    }
    
    public String addSafetyFlagsToSource( File sourcefile ) {
        StringBuffer newsource = new StringBuffer();
        
        CompilationUnit cu;
        try {
            // parse the file
            cu = JavaParser.parse(sourcefile);
            LoopsVisitor lv = new LoopsVisitor();
            lv.visit(cu, null);

            // Add condition flags to source
            int num_line=0;

            BufferedReader reader = new BufferedReader( new FileReader( sourcefile ) );
            String currLine = null;
            do {
                currLine = reader.readLine();
                num_line++;

                if( currLine != null ) {
                    for( int col=0; col<currLine.length(); col++ ) {
                        if( !lv.loopsConditionLocations.isEmpty() && num_line == lv.loopsConditionLocations.peek().row && col+1 == lv.loopsConditionLocations.peek().col ) {
                            newsource.append( " canContinue() && " );
                            lv.loopsConditionLocations.poll();
                        }
                        newsource.append( currLine.charAt(col) );
                    }
                    newsource.append("\n");
                }
                
            } while( currLine != null );
            reader.close();

            //System.out.println(cu.toString());
        } catch (ParseException ex) {
            Logger.getLogger(JavaEditorCompiler.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(JavaEditorCompiler.class.getName()).log(Level.SEVERE, null, ex);
        }

        //System.out.println("new source: ");
        //System.out.println( newsource );
        return newsource.toString();
    }
}
