/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package it.digitalviews.cveducation;

import java.io.PrintStream;

/**
 *
 * @author andrea
 */
public class DynamicExecutable {

    private Class dynamicClass;
    private PrintStream stdout, stderr;

    public DynamicExecutable(Class dynamicClass, PrintStream stdout, PrintStream stderr) {
        this.dynamicClass = dynamicClass;
        this.stdout = stdout;
        this.stderr = stderr;
    }

    public Class getDynamicClass() {
        return dynamicClass;
    }

    public PrintStream getStderr() {
        return stderr;
    }

    public PrintStream getStdout() {
        return stdout;
    }

}
