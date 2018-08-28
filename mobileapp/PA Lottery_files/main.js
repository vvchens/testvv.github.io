(function ($) {
    $.fn.cancelZoom = function () {
        return this.each(cancelZoom);
    };

    // Usage:
    $('input:text,select,textarea').cancelZoom();
})(jQuery);

function cancelZoom() {
    var d = document,
        viewport,
        content,
        maxScale = ',maximum-scale=',
        maxScaleRegex = /,*maximum\-scale\=\d*\.*\d*/;

    // this should be a focusable DOM Element
    if (!this.addEventListener || !d.querySelector) {
        return;
    }

    viewport = d.querySelector('meta[name="viewport"]');
    content = viewport.content;

    function changeViewport(event) {
        // http://nerd.vasilis.nl/prevent-ios-from-zooming-onfocus/
        viewport.content = content + (event.type == 'blur' ? (content.match(maxScaleRegex, '') ? '' : maxScale + 10) : maxScale + 1);
    }

    // We could use DOMFocusIn here, but it's deprecated.
    this.addEventListener('focus', changeViewport, true);
    this.addEventListener('blur', changeViewport, false);
}

var _gaq = _gaq || [];
//_gaq.push(['_setAccount', 'UA-3428891-1']);
//_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();