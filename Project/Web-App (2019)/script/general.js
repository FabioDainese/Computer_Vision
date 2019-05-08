//$($("#WebcamMonitor .row")[1]).height($($("#WebcamMonitor .row")[0]).height());
$("#WebcamMonitor canvas").height($("#webcam").height());
$(".color-settings").css("margin-top", -$(".color-settings").height());
$("#joypad").height($("#webcam").height());

var video = document.getElementById("webcam");

var constraints = window.constraints = {
    audio: false,
    video: true
};

function handleSuccess(stream) {
    var videoTracks = stream.getVideoTracks()[0];

    stream.oninactive = function () {
        console.log('Video stream inactive!');
    };
    window.stream = stream; // make variable available to browser console
    video.srcObject = stream;
    video.play();
}

function handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
        errorMsg('The requested constraints can not be satisfied by the available hardware!', error);
    } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMsg('Permissions have not been granted to use your camera, you need to allow the page access to your devices in order for the demo to works!', error);
    } else if (error.name === 'NotFoundError') {
        errorMsg('No webcam found!', error);
    } else {
        errorMsg('getUserMedia error: ' + error.name, error);
    }
}

function errorMsg(msg, error) {
    if (typeof error !== 'undefined') {
        $(".compiler").append("<p class=\"text-danger\">" + msg + "</p>");
    }
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

video.addEventListener('loadedmetadata', (e) => {
    console.log("Webcam name: " + video.srcObject.getVideoTracks()[0].label +
        "\n\nList of constrainable properties the browser knows about: " + JSON.stringify(navigator.mediaDevices.getSupportedConstraints(), null, 4) +
        "\n\nList of supported constraints w/ the values or range of values which are supported: " + JSON.stringify(video.srcObject.getVideoTracks()[0].getCapabilities(), null, 4));

    let supportedConstraints = video.srcObject.getVideoTracks()[0].getCapabilities();
    let interestedConstraints = ["brightness", "contrast", "saturation"];
    interestedConstraints.forEach(function (constraint) {
        if (supportedConstraints.hasOwnProperty(constraint)) {
            $("#" + constraint + "-range").attr("min", supportedConstraints[constraint]['min']);
            $("#" + constraint + "-range").attr("max", supportedConstraints[constraint]['max']);
            //$("#"+constraint+"-range").attr("value", this.value);

            $("#" + constraint + "-range").change(function () {
                let constraints = video.srcObject.getVideoTracks()[0].getConstraints();
                constraints[constraint] = this.value;
                video.srcObject.getVideoTracks()[0].applyConstraints(constraints);

                $("#span-" + constraint + "-range").text(this.value);
            }).trigger("change");
        } else {
            /*$("#span-" + constraint + "-range").text("Not supported");
            $("#" + constraint + "-range").prop("disabled", true);*/
            $("#" + constraint + "-range").change(function () {
                /*$("#webcam").css('-webkit-filter', ((constraint==="saturation")?"saturate":constraint)+"("+$("#" + constraint + "-range").val()+")");*/
                $("#webcam").css('-webkit-filter', "saturate(" + $("#saturation-range").val() + ") brightness(" + $("#brightness-range").val() + ") contrast(" + $("#contrast-range").val() + ")");
                $("#span-" + constraint + "-range").text(this.value);
            }).trigger("change");
        }
    });
});