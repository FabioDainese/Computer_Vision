$(document).on("DOMContentLoaded", function () {

    var chromakey_editor = ace.edit("chromakey_editor");
    chromakey_editor.setTheme("ace/theme/monokai");
    chromakey_editor.session.setMode("ace/mode/javascript");

    var buttons_detection_editor = ace.edit("buttons_detection_editor");
    buttons_detection_editor.setTheme("ace/theme/monokai");
    buttons_detection_editor.session.setMode("ace/mode/javascript");

    chromakey_editor.setOptions({
        behavioursEnabled: true,
        highlightActiveLine: true,
        showPrintMargin: false,
        highlightSelectedWord: true,
        enableLiveAutocompletion: true,
    });

    buttons_detection_editor.setOptions({
        behavioursEnabled: true,
        highlightActiveLine: true,
        showPrintMargin: false,
        highlightSelectedWord: true,
        enableLiveAutocompletion: true,
    });

    /*--- Menu options ----*/
    function get_active_tab() {
        return $($("ul#main-tab-menu li a.active")[0]).attr("href");
    }

    function get_active_compiler() {
        return $($("ul.cmp li a.active")[get_active_tab() === "#ChromaKey" ? 0 : 1]).attr("href");
    }

    function get_active_editor() {
        active_tab = get_active_tab();
        return active_tab === "#ChromaKey" ? chromakey_editor : active_tab === "#ButtonsDetection" ?
            buttons_detection_editor : "#";
    }

    $(".save").click(function () {
        active_tab = get_active_tab();
        active_editor = get_active_editor();

        var blob = new Blob([active_editor.getValue()], {
            type: "text/javascript;charset=utf-8"
        });
        saveAs(blob, active_tab.substr(1) + ".js");
    });

    $(".compile").click(function () {
        active_tab = get_active_tab();
        $($("#script" + active_tab.substr(1))[0]).remove();

        active_cmp = get_active_compiler();
        $(active_cmp + " p").remove();
        $(active_cmp).append("<p>Building...</p>");

        (active_cmp === "#chroma-compiler") ? (error_chroma = false) : (error_buttons = false);

        let my_script = document.createElement("script");
        my_script.type = "text/javascript";
        my_script.id = "script" + active_tab.substr(1);

        let code = get_active_editor().getValue();
        try {
            my_script.appendChild(document.createTextNode(code));
            document.body.appendChild(my_script);

            $(active_cmp).append("<p class=\"text-success\">Build successful</p>");

            $.each(get_active_editor().getSession().getAnnotations(), function (index, value) {
                $(active_cmp).append("<p class=\"" + ((value.type === "error") ? "text-danger" : (value.type === "warning") ? "text-warning" : "") + "\"><span class=\"text-uppercase\">" + value.type + "</span>: " + value.text + " (Row " + value.row + ")</p>");
            });
        } catch (e) {
            my_script.text = code;
            document.body.appendChild(my_script);

            $(active_cmp).append("<p class=\"text-danger\">Error occurred during building process</p>");
        }
    });

    /*
    \nlet green_lower_bound = [36, 10, 25, 0];\nlet green_higher_bound = [75, 255, 255, 0];\n
    let green_px_erosion = 11;\nlet green_px_dilation = 11;\n\nlet magenta_lower_bound = [120, 50, 70, 0];\nlet magenta_higher_bound = [130, 255, 255, 0];\n
    let magenta_px_erosion = 13;\nlet magenta_px_dilation = 13;
    */

    $("#chroma-default").click(function () {

        chromakey_editor.session.setValue(
            "/**\n * La procedura 'find_centroids' deve restituire un array (di array) nel quale ogni elemento rappresenta le coordinate\n * X e Y del baricentro di ogni forma/figura identificata tramite l'applicazione dei filtri 'Lower Bound' e\n * 'Upper Bound' presenti nella scheda 'Webcam monitor'.\n * Per ulteriori chiarimenti e/o informazioni consultare la scheda 'Info'\n * \n * parametro moments : array contenente i valori del 'Central Moments' di ogni forma/figura\n */ \n\nfunction find_centroids(moments){\n\t//Inserire il codice qui!\n}\n"
        );
    }).trigger("click");

    $("#buttons-default").click(function () {
        buttons_detection_editor.session.setValue(
            "/**\n * La procedura 'buttons_detection' deve restituire una array contenente: (A) Nella prima posizione l'immagine da caricare del joypad\n * scelta tra quelle presenti in 'joypad_imgs', (B) Nella seconda posizione l'angolo/inclinazione del relativo joypad.\n * \n * parametro joypad_imgs : array contenente tante immagini quanti i possibili stati dei vari bottoni ([0]: tutti e due rossi;\n * \t\t\t\t\t\t\t[1]: SX verde - DX rosso; [2]: SX rosso - DX verde; [3]: tutti e due verdi)\n * parametro green_points : array di array contenente le varie coordinare X e Y del baricentro ([0]: fa riferimento alla X;\n * \t\t\t\t\t\t\t[1]: fa riferimento alla Y) di ogni forma/figura identificata dai filtri specificati nella scheda \n * \t\t\t\t\t\t\t'Webcam monitor' / 'Green Chroma Key'\n * parametro magenta_points : array di array contenente le varie coordinare X e Y del baricentro ([0]: fa riferimento alla X;\n * \t\t\t\t\t\t\t[1]: fa riferimento alla Y) di ogni forma/figura identificata dai filtri specificati nella scheda \n * \t\t\t\t\t\t\t'Webcam monitor' / 'Magenta Chroma Key'\n */\n\nfunction buttons_detection(joypad_imgs, green_points, magenta_points){\n\t//Inserire il codice qui!\n}\n"
        );
    }).trigger("click");

    $("#chroma-solution").click(function () {
        // Magenta inputs
        $("#m-e").attr("value", 13);
        $("#m-d").attr("value", 13);
        $("#m-l-h").attr("value", 120);
        $("#m-l-s").attr("value", 50);
        $("#m-l-v").attr("value", 70);
        $("#m-l-a").attr("value", 0);
        $("#m-u-h").attr("value", 135);
        $("#m-u-s").attr("value", 255);
        $("#m-u-v").attr("value", 255);
        $("#m-u-a").attr("value", 0);

        // Green inputs
        $("#g-e").attr("value", 11);
        $("#g-d").attr("value", 11);
        $("#g-l-h").attr("value", 36);
        $("#g-l-s").attr("value", 10);
        $("#g-l-v").attr("value", 25);
        $("#g-l-a").attr("value", 0);
        $("#g-u-h").attr("value", 75);
        $("#g-u-s").attr("value", 255);
        $("#g-u-v").attr("value", 255);
        $("#g-u-a").attr("value", 0);

        chromakey_editor.session.clearAnnotations();

        chromakey_editor.session.setValue(
            "/**\n * La procedura 'find_centroids' deve restituire un array (di array) nel quale ogni elemento rappresenta le coordinate\n * X e Y del baricentro di ogni forma/figura identificata tramite l'applicazione dei filtri 'Lower Bound' e\n * 'Upper Bound' presenti nella scheda 'Webcam monitor'.\n * Per ulteriori chiarimenti e/o informazioni consultare la scheda 'Info'\n * \n * parametro moments : array contenente i valori del 'Central Moments' di ogni forma/figura\n */\n\nfunction find_centroids(moments){\n\tvar centroids = [];\n\tlet i;\n\tfor(i=0;i<moments.length;i++){\n\t\tlet cX = moments[i].m10 / moments[i].m00;\n\t\tlet cY = moments[i].m01 / moments[i].m00;\n\t\tcentroids.push([cX,cY]);\n\t}\n\treturn centroids;\n}\n"
        );
        $(".compile").trigger("click");
        $(".chroma input").trigger("input");
    });

    $("#buttons-solution").click(function () {
        buttons_detection_editor.session.clearAnnotations();
        buttons_detection_editor.session.setValue(
            "/**\n * La procedura 'buttons_detection' deve restituire una array contenente: (A) Nella prima posizione l'immagine da caricare del joypad\n * scelta tra quelle presenti in 'joypad_imgs', (B) Nella seconda posizione l'angolo/inclinazione del relativo joypad.\n * \n * parametro joypad_imgs : array contenente tante immagini quanti i possibili stati dei vari bottoni ([0]: tutti e due rossi;\n * \t\t\t\t\t\t\t[1]: SX verde - DX rosso; [2]: SX rosso - DX verde; [3]: tutti e due verdi)\n * parametro green_points : array di array contenente le varie coordinare X e Y del baricentro ([0]: fa riferimento alla X;\n * \t\t\t\t\t\t\t[1]: fa riferimento alla Y) di ogni forma/figura identificata dai filtri specificati nella scheda \n * \t\t\t\t\t\t\t'Webcam monitor' / 'Green Chroma Key'\n * parametro magenta_points : array di array contenente le varie coordinare X e Y del baricentro ([0]: fa riferimento alla X;\n * \t\t\t\t\t\t\t[1]: fa riferimento alla Y) di ogni forma/figura identificata dai filtri specificati nella scheda \n * \t\t\t\t\t\t\t'Webcam monitor' / 'Magenta Chroma Key'\n */\n\nfunction buttons_detection(joypad_imgs, green_points, magenta_points){\n\tlet img_src; \n\tswitch (true) {\n\t\tcase green_points.length === 2:\n\t\t\timg_src = joypad_imgs[3];\n\t\t\tbreak;\n\t\tcase green_points.length === 1 && magenta_points.length === 1:\n\t\t\timg_src = (green_points[0][0] <= magenta_points[0][0]) ? joypad_imgs[1] : joypad_imgs[2];\n\t\t\tbreak;\n\t\tdefault:\n\t\t\timg_src = joypad_imgs[0];\n\t}\n\n\t// Orientation Stuff\n\tlet deg = 0;\n\tlet all_points = green_points.concat(magenta_points);\n\tif (all_points.length >= 2) {\n\t\tif (all_points[0][0] === all_points[1][0]) {\n\t\t\tdeg = 90;\n\t\t} else {\n\t\t\tlet m = (1 / (all_points[1][0] - all_points[0][0])) * (all_points[1][1] - all_points[0][1]);\n\t\t\tdeg = Math.atan(m) * (180 / Math.PI);\n\t\t} \n\t}\n\n\treturn [img_src,deg];\n}\n"
        );
        $(".compile").trigger("click");
    });

    $("#chroma-clear").click(function () {
        $("#chroma-compiler p").remove();
    });

    $("#buttons-clear").click(function () {
        $("#buttons-compiler p").remove();
    });
});