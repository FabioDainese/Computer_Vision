error_chroma = false;
error_buttons = false;

require(['opencv.js'], function (cv) {
    cv['onRuntimeInitialized'] = () => {
        $(".compiler").append("<p>Compiler ready!</p>");

        let video = document.getElementById('webcam');
        let joypad_imgs = ["img/Joypad_Red_Red.png", "img/Joypad_Red_Green.png",
            "img/Joypad_Green_Red.png", "img/Joypad_Green_Green.png"
        ];
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);

        let cap = new cv.VideoCapture(video);

        const FPS = 30;
        // [min - max] : [[magenta][green]]
        let noise_range = [0, 500];
        let colors_range = [
            [0, 0, 0, 0],
            [180, 255, 255, 255]
        ];

        let magenta_px_erosion, magenta_px_dilation, green_px_erosion, green_px_dilation;
        let magenta_lower_bound = [],
            magenta_upper_bound = [],
            green_lower_bound = [],
            green_upper_bound = [];

        $(".chroma input").on("input focusout", function (event) {
            let real_index_element = $(this).index(".chroma input");
            let index_element = real_index_element % 10;
            let sup = sanitize_integer_element($(this).val(), (index_element < 2) ?
                noise_range[0] : colors_range[0][(index_element - 2) % 4], (
                    index_element < 2) ? noise_range[1] : colors_range[1][(
                    index_element - 2) % 4]);

            if (event.type !== "focusout") {
                if (real_index_element < 10) {
                    if (index_element === 0) {
                        magenta_px_erosion = sup;
                    } else if (index_element === 1) {
                        magenta_px_dilation = sup;
                    } else if (index_element <= 5) {
                        magenta_lower_bound[(index_element - 2) % 4] = sup;
                    } else {
                        magenta_upper_bound[(index_element - 2) % 4] = sup;
                    }
                } else {
                    if (index_element === 0) {
                        green_px_erosion = sup;
                    } else if (index_element === 1) {
                        green_px_dilation = sup;
                    } else if (index_element <= 5) {
                        green_lower_bound[(index_element - 2) % 4] = sup;
                    } else {
                        green_upper_bound[(index_element - 2) % 4] = sup;
                    }
                }
            } else {
                if (parseInt($(this).val()) !== sup) {
                    $(this).val(sup);
                }
            }
        }).trigger('input');

        function processVideo() {
            try {
                let begin = Date.now();
                // start processing.
                cap.read(src)

                let magenta_points = run_user_hsv_mask(src, [magenta_lower_bound,
                    magenta_upper_bound, magenta_px_erosion, magenta_px_dilation
                ], "magenta", false);
                let green_points = run_user_hsv_mask(src, [green_lower_bound, green_upper_bound,
                    green_px_erosion, green_px_dilation
                ], "green", true);

                // ---- Hough Transform ----
                draw_hough_transform(src,"hough-transform")

                if (typeof buttons_detection == 'function' && Array.isArray(green_points) && Array.isArray(
                        magenta_points)) {
                    run_user_buttons_detection(joypad_imgs, green_points, magenta_points);
                }

                let delay = 1000 / FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);
            } catch (err) {
                console.error(err);
            }
        };
        // schedule the first one.
        setTimeout(processVideo, 0);
    }
});

function sanitize_integer_element(value, min, max) {
    return (!$.isNumeric(value)) ? min : (parseInt(value) < min) ? min : (parseInt(value) > max) ? max :
        parseInt(value);
}

function draw_hough_transform(src,canvas_id){
    // ---- Hough Transform ----
    let dst_hough = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
    let lines = new cv.Mat();
    let color = new cv.Scalar(255, 0, 0);
    cv.cvtColor(src, dst_hough, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(dst_hough, dst_hough, 50, 200, 3);
    cv.HoughLinesP(dst_hough, lines, 1, Math.PI / 180, 2, 0, 0);
    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        cv.line(dst_hough, startPoint, endPoint, color);
    }
    cv.imshow(canvas_id, dst_hough);
    dst_hough.delete();
}

function run_user_hsv_mask(src, chroma_settings, canvas_id, draw_line) {
    let dst = new cv.Mat();
    var mask = user_hsv_mask(src, chroma_settings[0], chroma_settings[1]);

    mask = user_remove_noise(mask, chroma_settings[2], chroma_settings[3]);

    //Source1 - Source2 - Destination - Mask | (date 2 immagini le unisce e prende in considerazione solo le zone identificate dalla 'maschera')
    cv.bitwise_and(src, src, dst, mask);
    cv.imshow(canvas_id, dst);

    let user_centroids;
    if (typeof find_centroids == 'function') {
        // ---- Find contours ----
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        // Source - Destination - Hierarchy (containing information about the image topology) - Mode - Method
        cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        var moments = [];
        // Process & draw the centroids 4 each shape
        for (let i = 0; i < contours.size(); ++i) {
            // Compute the center of the contour (centroid)
            let cnt = contours.get(i);
            moments.push(cv.moments(cnt, false));
        }

        user_centroids = find_centroids(moments);
        user_find_centroids(user_centroids, dst, canvas_id, draw_line);

        contours.delete();
        hierarchy.delete();
    }
    mask.delete();
    dst.delete();

    return user_centroids;
}

function user_hsv_mask(src, lower_bound, higher_bound) {
    try {
        let mask = new cv.Mat();

        // Blur Intenisty (standard deviation in X and Y direction)
        let ksize = new cv.Size(7, 7);
        // Source - Destination - Blur Intensity - sigmaX and sigmaY - Other Paramenters
        cv.GaussianBlur(src, mask, ksize, 2, 2, cv.BORDER_DEFAULT);
        //Source - Destination - Color range
        cv.cvtColor(mask, mask, cv.COLOR_BGR2HSV);
        //Rows - Cols - Type - Color
        let low = new cv.Mat(mask.rows, mask.cols, mask.type(), lower_bound);
        let high = new cv.Mat(mask.rows, mask.cols, mask.type(), higher_bound);
        //Source - Low - High - Destination
        cv.inRange(mask, low, high, mask);

        low.delete();
        high.delete();
        return mask;
    } catch (err) {
        console.error(err);
    }
}

function user_remove_noise(mask, erosion, dilation) {
    try {
        // Remove image noise
        let kernel_opening = cv.Mat.ones(erosion, dilation, cv.CV_8U);
        let anchor = new cv.Point(-1, -1);
        // Source - Destination - ...
        cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel_opening, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        kernel_opening.delete();
        return mask;
    } catch (err) {
        console.error(err);
    }
}

function user_find_centroids(centroids, matrix_destination, canvas_dst_id, draw_line) {
    try {
        let points_storage = [];

        // Process & draw the centroids 4 each shape
        for (let i = 0; i < centroids.length; ++i) {
            // Destination - Center - Radius - Color
            cv.circle(matrix_destination, new cv.Point(centroids[i][0], centroids[i][1]), 7, new cv.Scalar(0, 0,
                0));

            points_storage.push(new cv.Point(centroids[i][0], centroids[i][1]));
        }

        // Destination - Start Point - End Point - Color - [Thikness - LineType - shift]
        if (draw_line && points_storage.length === 2) {
            cv.line(matrix_destination, points_storage[0], points_storage[1], new cv.Scalar(0, 255, 0, 255), 2,
                cv.LINE_8, 0);
        }
        cv.imshow(canvas_dst_id, matrix_destination);
        error_chroma = false;
    } catch (err) {
        //Se è la prima volta
        if (!error_chroma) {
            console.error(err);
            $("#chroma-compiler").append("<p class=\"text-danger\">" + err + "</p>");
            error_chroma = true;
        }
    }
}

function hsv_mask(src, canvas_dst_id, lower_bound, higher_bound, video_input, erosion, dilation, draw_line) {
    let mask = new cv.Mat(video_input.height, video_input.width, cv.CV_8UC1);
    let border_mask = new cv.Mat(video_input.height, video_input.width, cv.CV_8UC1);
    let dst = new cv.Mat(video_input.height, video_input.width, cv.CV_8UC1);

    // Blur Intenisty (standard deviation in X and Y direction)
    let ksize = new cv.Size(7, 7);
    // Source - Destination - Blur Intensity - sigmaX and sigmaY - Other Paramenters
    cv.GaussianBlur(src, mask, ksize, 2, 2, cv.BORDER_DEFAULT);
    //Source - Destination - Color range
    cv.cvtColor(mask, mask, cv.COLOR_BGR2HSV);
    //Rows - Cols - Type - Color
    let low = new cv.Mat(mask.rows, mask.cols, mask.type(), lower_bound);
    let high = new cv.Mat(mask.rows, mask.cols, mask.type(), higher_bound);
    //Source - Low - High - Destination
    cv.inRange(mask, low, high, mask);

    // Remove image noise
    let kernel_opening = cv.Mat.ones(erosion, dilation, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    // Source - Destination - ...
    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel_opening, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());


    //Source1 - Source2 - Destination - Mask | (date 2 immagini le unisce e prende in considerazione solo le zone identificate dalla 'maschera')
    cv.bitwise_and(src, src, dst, mask);

    // ---- Find contours ----
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // Source - Destination - Hierarchy (containing information about the image topology) - Mode - Method
    cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let points_storage = [];

    // Process & draw the centroids 4 each shape
    for (let i = 0; i < contours.size(); ++i) {
        // Compute the center of the contour (centroid)
        let cnt = contours.get(i);
        let Moments = cv.moments(cnt, false);
        let cX = Moments.m10 / Moments.m00;
        let cY = Moments.m01 / Moments.m00;

        // Destination - Center - Radius - Color
        cv.circle(dst, new cv.Point(cX, cY), 7, new cv.Scalar(0, 0, 0));

        points_storage.push(new cv.Point(cX, cY));
    }

    // Destination - Start Point - End Point - Color - [Thikness - LineType - shift]
    if (draw_line && points_storage.length === 2) {
        cv.line(dst, points_storage[0], points_storage[1], new cv.Scalar(0, 255, 0, 255), 2, cv.LINE_8, 0);
    }
    cv.imshow(canvas_dst_id, dst);


    low.delete();
    high.delete();
    mask.delete();
    dst.delete();
    border_mask.delete();
    contours.delete();
    hierarchy.delete();
    kernel_opening.delete();

    return points_storage;
}

function run_user_buttons_detection(joypad_imgs, green_points, magenta_points) {
    // Buttons detections (Invertire 'Sinistra' e 'Destra' poichè l'immagine src è specchiata!!!)
    let buttons_settings = buttons_detection(joypad_imgs, green_points, magenta_points);

    try {
        $("#joypad").attr("src", buttons_settings[0]);
        $("#joypad").css({
            "-webkit-transform": "rotate(" + (-buttons_settings[1]) + "deg)",
            "-moz-transform": "rotate(" + (-buttons_settings[1]) + "deg)",
            "transform": "rotate(" + (-buttons_settings[1]) + "deg)"
        });

        error_buttons = false;
    } catch (err) {
        //Se è la prima volta
        if (!error_buttons) {
            console.error(err);
            $("#buttons-compiler").append("<p class=\"text-danger\">" + err + "</p>");
            error_buttons = true;
        }
    }
}