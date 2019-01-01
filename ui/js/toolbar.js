window.addEventListener("load", function() {
    const icon = document.getElementById("toolbar-toggle-icon");
    const content = $("#toolbar-content");

    content.collapse();
    content.on("show.bs.collapse", function() {
        icon.classList.add("inverted");
    });
    content.on("hide.bs.collapse", function() {
        icon.classList.remove("inverted");
    });
});