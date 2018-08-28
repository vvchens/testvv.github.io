// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

/**
 * Copyright (c) 2007-2014 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * @author Ariel Flesler
 * @version 1.4.13
 */
;(function(k){'use strict';k(['jquery'],function($){var j=$.scrollTo=function(a,b,c){return $(window).scrollTo(a,b,c)};j.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:!0};j.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(f,g,h){if(typeof g=='object'){h=g;g=0}if(typeof h=='function')h={onAfter:h};if(f=='max')f=9e9;h=$.extend({},j.defaults,h);g=g||h.duration;h.queue=h.queue&&h.axis.length>1;if(h.queue)g/=2;h.offset=both(h.offset);h.over=both(h.over);return this._scrollable().each(function(){if(f==null)return;var d=this,$elem=$(d),targ=f,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=win?$(targ):$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}var e=$.isFunction(h.offset)&&h.offset(d,targ)||h.offset;$.each(h.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=j.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(h.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=e[pos]||0;if(h.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*h.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(h.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&h.queue){if(old!=attr[key])animate(h.onAfterFirst);delete attr[key]}});animate(h.onAfter);function animate(a){$elem.animate(attr,g,h.easing,a&&function(){a.call(this,targ,h)})}}).end()};j.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return $.isFunction(a)||typeof a=='object'?a:{top:a,left:a}}return j})}(typeof define==='function'&&define.amd?define:function(a,b){if(typeof module!=='undefined'&&module.exports){module.exports=b(require('jquery'))}else{b(jQuery)}}));


/*! Hammer.JS - v1.0.5 - 2013-04-07
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2013 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function (t, e) { "use strict"; function n() { if (!i.READY) { i.event.determineEventTypes(); for (var t in i.gestures) i.gestures.hasOwnProperty(t) && i.detection.register(i.gestures[t]); i.event.onTouch(i.DOCUMENT, i.EVENT_MOVE, i.detection.detect), i.event.onTouch(i.DOCUMENT, i.EVENT_END, i.detection.detect), i.READY = !0 } } var i = function (t, e) { return new i.Instance(t, e || {}) }; i.defaults = { stop_browser_behavior: { userSelect: "none", touchAction: "none", touchCallout: "none", contentZooming: "none", userDrag: "none", tapHighlightColor: "rgba(0,0,0,0)" } }, i.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled, i.HAS_TOUCHEVENTS = "ontouchstart" in t, i.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i, i.NO_MOUSEEVENTS = i.HAS_TOUCHEVENTS && navigator.userAgent.match(i.MOBILE_REGEX), i.EVENT_TYPES = {}, i.DIRECTION_DOWN = "down", i.DIRECTION_LEFT = "left", i.DIRECTION_UP = "up", i.DIRECTION_RIGHT = "right", i.POINTER_MOUSE = "mouse", i.POINTER_TOUCH = "touch", i.POINTER_PEN = "pen", i.EVENT_START = "start", i.EVENT_MOVE = "move", i.EVENT_END = "end", i.DOCUMENT = document, i.plugins = {}, i.READY = !1, i.Instance = function (t, e) { var r = this; return n(), this.element = t, this.enabled = !0, this.options = i.utils.extend(i.utils.extend({}, i.defaults), e || {}), this.options.stop_browser_behavior && i.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior), i.event.onTouch(t, i.EVENT_START, function (t) { r.enabled && i.detection.startDetect(r, t) }), this }, i.Instance.prototype = { on: function (t, e) { for (var n = t.split(" "), i = 0; n.length > i; i++) this.element.addEventListener(n[i], e, !1); return this }, off: function (t, e) { for (var n = t.split(" "), i = 0; n.length > i; i++) this.element.removeEventListener(n[i], e, !1); return this }, trigger: function (t, e) { var n = i.DOCUMENT.createEvent("Event"); n.initEvent(t, !0, !0), n.gesture = e; var r = this.element; return i.utils.hasParent(e.target, r) && (r = e.target), r.dispatchEvent(n), this }, enable: function (t) { return this.enabled = t, this } }; var r = null, o = !1, s = !1; i.event = { bindDom: function (t, e, n) { for (var i = e.split(" "), r = 0; i.length > r; r++) t.addEventListener(i[r], n, !1) }, onTouch: function (t, e, n) { var a = this; this.bindDom(t, i.EVENT_TYPES[e], function (c) { var u = c.type.toLowerCase(); if (!u.match(/mouse/) || !s) { (u.match(/touch/) || u.match(/pointerdown/) || u.match(/mouse/) && 1 === c.which) && (o = !0), u.match(/touch|pointer/) && (s = !0); var h = 0; o && (i.HAS_POINTEREVENTS && e != i.EVENT_END ? h = i.PointerEvent.updatePointer(e, c) : u.match(/touch/) ? h = c.touches.length : s || (h = u.match(/up/) ? 0 : 1), h > 0 && e == i.EVENT_END ? e = i.EVENT_MOVE : h || (e = i.EVENT_END), h || null === r ? r = c : c = r, n.call(i.detection, a.collectEventData(t, e, c)), i.HAS_POINTEREVENTS && e == i.EVENT_END && (h = i.PointerEvent.updatePointer(e, c))), h || (r = null, o = !1, s = !1, i.PointerEvent.reset()) } }) }, determineEventTypes: function () { var t; t = i.HAS_POINTEREVENTS ? i.PointerEvent.getEvents() : i.NO_MOUSEEVENTS ? ["touchstart", "touchmove", "touchend touchcancel"] : ["touchstart mousedown", "touchmove mousemove", "touchend touchcancel mouseup"], i.EVENT_TYPES[i.EVENT_START] = t[0], i.EVENT_TYPES[i.EVENT_MOVE] = t[1], i.EVENT_TYPES[i.EVENT_END] = t[2] }, getTouchList: function (t) { return i.HAS_POINTEREVENTS ? i.PointerEvent.getTouchList() : t.touches ? t.touches : [{ identifier: 1, pageX: t.pageX, pageY: t.pageY, target: t.target }] }, collectEventData: function (t, e, n) { var r = this.getTouchList(n, e), o = i.POINTER_TOUCH; return (n.type.match(/mouse/) || i.PointerEvent.matchType(i.POINTER_MOUSE, n)) && (o = i.POINTER_MOUSE), { center: i.utils.getCenter(r), timeStamp: (new Date).getTime(), target: n.target, touches: r, eventType: e, pointerType: o, srcEvent: n, preventDefault: function () { this.srcEvent.preventManipulation && this.srcEvent.preventManipulation(), this.srcEvent.preventDefault && this.srcEvent.preventDefault() }, stopPropagation: function () { this.srcEvent.stopPropagation() }, stopDetect: function () { return i.detection.stopDetect() } } } }, i.PointerEvent = { pointers: {}, getTouchList: function () { var t = this, e = []; return Object.keys(t.pointers).sort().forEach(function (n) { e.push(t.pointers[n]) }), e }, updatePointer: function (t, e) { return t == i.EVENT_END ? this.pointers = {} : (e.identifier = e.pointerId, this.pointers[e.pointerId] = e), Object.keys(this.pointers).length }, matchType: function (t, e) { if (!e.pointerType) return !1; var n = {}; return n[i.POINTER_MOUSE] = e.pointerType == e.MSPOINTER_TYPE_MOUSE || e.pointerType == i.POINTER_MOUSE, n[i.POINTER_TOUCH] = e.pointerType == e.MSPOINTER_TYPE_TOUCH || e.pointerType == i.POINTER_TOUCH, n[i.POINTER_PEN] = e.pointerType == e.MSPOINTER_TYPE_PEN || e.pointerType == i.POINTER_PEN, n[t] }, getEvents: function () { return ["pointerdown MSPointerDown", "pointermove MSPointerMove", "pointerup pointercancel MSPointerUp MSPointerCancel"] }, reset: function () { this.pointers = {} } }, i.utils = { extend: function (t, n, i) { for (var r in n) t[r] !== e && i || (t[r] = n[r]); return t }, hasParent: function (t, e) { for (; t;) { if (t == e) return !0; t = t.parentNode } return !1 }, getCenter: function (t) { for (var e = [], n = [], i = 0, r = t.length; r > i; i++) e.push(t[i].pageX), n.push(t[i].pageY); return { pageX: (Math.min.apply(Math, e) + Math.max.apply(Math, e)) / 2, pageY: (Math.min.apply(Math, n) + Math.max.apply(Math, n)) / 2 } }, getVelocity: function (t, e, n) { return { x: Math.abs(e / t) || 0, y: Math.abs(n / t) || 0 } }, getAngle: function (t, e) { var n = e.pageY - t.pageY, i = e.pageX - t.pageX; return 180 * Math.atan2(n, i) / Math.PI }, getDirection: function (t, e) { var n = Math.abs(t.pageX - e.pageX), r = Math.abs(t.pageY - e.pageY); return n >= r ? t.pageX - e.pageX > 0 ? i.DIRECTION_LEFT : i.DIRECTION_RIGHT : t.pageY - e.pageY > 0 ? i.DIRECTION_UP : i.DIRECTION_DOWN }, getDistance: function (t, e) { var n = e.pageX - t.pageX, i = e.pageY - t.pageY; return Math.sqrt(n * n + i * i) }, getScale: function (t, e) { return t.length >= 2 && e.length >= 2 ? this.getDistance(e[0], e[1]) / this.getDistance(t[0], t[1]) : 1 }, getRotation: function (t, e) { return t.length >= 2 && e.length >= 2 ? this.getAngle(e[1], e[0]) - this.getAngle(t[1], t[0]) : 0 }, isVertical: function (t) { return t == i.DIRECTION_UP || t == i.DIRECTION_DOWN }, stopDefaultBrowserBehavior: function (t, e) { var n, i = ["webkit", "khtml", "moz", "ms", "o", ""]; if (e && t.style) { for (var r = 0; i.length > r; r++) for (var o in e) e.hasOwnProperty(o) && (n = o, i[r] && (n = i[r] + n.substring(0, 1).toUpperCase() + n.substring(1)), t.style[n] = e[o]); "none" == e.userSelect && (t.onselectstart = function () { return !1 }) } } }, i.detection = { gestures: [], current: null, previous: null, stopped: !1, startDetect: function (t, e) { this.current || (this.stopped = !1, this.current = { inst: t, startEvent: i.utils.extend({}, e), lastEvent: !1, name: "" }, this.detect(e)) }, detect: function (t) { if (this.current && !this.stopped) { t = this.extendEventData(t); for (var e = this.current.inst.options, n = 0, r = this.gestures.length; r > n; n++) { var o = this.gestures[n]; if (!this.stopped && e[o.name] !== !1 && o.handler.call(o, t, this.current.inst) === !1) { this.stopDetect(); break } } return this.current && (this.current.lastEvent = t), t.eventType == i.EVENT_END && !t.touches.length - 1 && this.stopDetect(), t } }, stopDetect: function () { this.previous = i.utils.extend({}, this.current), this.current = null, this.stopped = !0 }, extendEventData: function (t) { var e = this.current.startEvent; if (e && (t.touches.length != e.touches.length || t.touches === e.touches)) { e.touches = []; for (var n = 0, r = t.touches.length; r > n; n++) e.touches.push(i.utils.extend({}, t.touches[n])) } var o = t.timeStamp - e.timeStamp, s = t.center.pageX - e.center.pageX, a = t.center.pageY - e.center.pageY, c = i.utils.getVelocity(o, s, a); return i.utils.extend(t, { deltaTime: o, deltaX: s, deltaY: a, velocityX: c.x, velocityY: c.y, distance: i.utils.getDistance(e.center, t.center), angle: i.utils.getAngle(e.center, t.center), direction: i.utils.getDirection(e.center, t.center), scale: i.utils.getScale(e.touches, t.touches), rotation: i.utils.getRotation(e.touches, t.touches), startEvent: e }), t }, register: function (t) { var n = t.defaults || {}; return n[t.name] === e && (n[t.name] = !0), i.utils.extend(i.defaults, n, !0), t.index = t.index || 1e3, this.gestures.push(t), this.gestures.sort(function (t, e) { return t.index < e.index ? -1 : t.index > e.index ? 1 : 0 }), this.gestures } }, i.gestures = i.gestures || {}, i.gestures.Hold = { name: "hold", index: 10, defaults: { hold_timeout: 500, hold_threshold: 1 }, timer: null, handler: function (t, e) { switch (t.eventType) { case i.EVENT_START: clearTimeout(this.timer), i.detection.current.name = this.name, this.timer = setTimeout(function () { "hold" == i.detection.current.name && e.trigger("hold", t) }, e.options.hold_timeout); break; case i.EVENT_MOVE: t.distance > e.options.hold_threshold && clearTimeout(this.timer); break; case i.EVENT_END: clearTimeout(this.timer) } } }, i.gestures.Tap = { name: "tap", index: 100, defaults: { tap_max_touchtime: 250, tap_max_distance: 10, tap_always: !0, doubletap_distance: 20, doubletap_interval: 300 }, handler: function (t, e) { if (t.eventType == i.EVENT_END) { var n = i.detection.previous, r = !1; if (t.deltaTime > e.options.tap_max_touchtime || t.distance > e.options.tap_max_distance) return; n && "tap" == n.name && t.timeStamp - n.lastEvent.timeStamp < e.options.doubletap_interval && t.distance < e.options.doubletap_distance && (e.trigger("doubletap", t), r = !0), (!r || e.options.tap_always) && (i.detection.current.name = "tap", e.trigger(i.detection.current.name, t)) } } }, i.gestures.Swipe = { name: "swipe", index: 40, defaults: { swipe_max_touches: 1, swipe_velocity: .7 }, handler: function (t, e) { if (t.eventType == i.EVENT_END) { if (e.options.swipe_max_touches > 0 && t.touches.length > e.options.swipe_max_touches) return; (t.velocityX > e.options.swipe_velocity || t.velocityY > e.options.swipe_velocity) && (e.trigger(this.name, t), e.trigger(this.name + t.direction, t)) } } }, i.gestures.Drag = { name: "drag", index: 50, defaults: { drag_min_distance: 10, drag_max_touches: 1, drag_block_horizontal: !1, drag_block_vertical: !1, drag_lock_to_axis: !1, drag_lock_min_distance: 25 }, triggered: !1, handler: function (t, n) { if (i.detection.current.name != this.name && this.triggered) return n.trigger(this.name + "end", t), this.triggered = !1, e; if (!(n.options.drag_max_touches > 0 && t.touches.length > n.options.drag_max_touches)) switch (t.eventType) { case i.EVENT_START: this.triggered = !1; break; case i.EVENT_MOVE: if (t.distance < n.options.drag_min_distance && i.detection.current.name != this.name) return; i.detection.current.name = this.name, (i.detection.current.lastEvent.drag_locked_to_axis || n.options.drag_lock_to_axis && n.options.drag_lock_min_distance <= t.distance) && (t.drag_locked_to_axis = !0); var r = i.detection.current.lastEvent.direction; t.drag_locked_to_axis && r !== t.direction && (t.direction = i.utils.isVertical(r) ? 0 > t.deltaY ? i.DIRECTION_UP : i.DIRECTION_DOWN : 0 > t.deltaX ? i.DIRECTION_LEFT : i.DIRECTION_RIGHT), this.triggered || (n.trigger(this.name + "start", t), this.triggered = !0), n.trigger(this.name, t), n.trigger(this.name + t.direction, t), (n.options.drag_block_vertical && i.utils.isVertical(t.direction) || n.options.drag_block_horizontal && !i.utils.isVertical(t.direction)) && t.preventDefault(); break; case i.EVENT_END: this.triggered && n.trigger(this.name + "end", t), this.triggered = !1 } } }, i.gestures.Transform = { name: "transform", index: 45, defaults: { transform_min_scale: .01, transform_min_rotation: 1, transform_always_block: !1 }, triggered: !1, handler: function (t, n) { if (i.detection.current.name != this.name && this.triggered) return n.trigger(this.name + "end", t), this.triggered = !1, e; if (!(2 > t.touches.length)) switch (n.options.transform_always_block && t.preventDefault(), t.eventType) { case i.EVENT_START: this.triggered = !1; break; case i.EVENT_MOVE: var r = Math.abs(1 - t.scale), o = Math.abs(t.rotation); if (n.options.transform_min_scale > r && n.options.transform_min_rotation > o) return; i.detection.current.name = this.name, this.triggered || (n.trigger(this.name + "start", t), this.triggered = !0), n.trigger(this.name, t), o > n.options.transform_min_rotation && n.trigger("rotate", t), r > n.options.transform_min_scale && (n.trigger("pinch", t), n.trigger("pinch" + (1 > t.scale ? "in" : "out"), t)); break; case i.EVENT_END: this.triggered && n.trigger(this.name + "end", t), this.triggered = !1 } } }, i.gestures.Touch = { name: "touch", index: -1 / 0, defaults: { prevent_default: !1, prevent_mouseevents: !1 }, handler: function (t, n) { return n.options.prevent_mouseevents && t.pointerType == i.POINTER_MOUSE ? (t.stopDetect(), e) : (n.options.prevent_default && t.preventDefault(), t.eventType == i.EVENT_START && n.trigger(this.name, t), e) } }, i.gestures.Release = { name: "release", index: 1 / 0, handler: function (t, e) { t.eventType == i.EVENT_END && e.trigger(this.name, t) } }, "object" == typeof module && "object" == typeof module.exports ? module.exports = i : (t.Hammer = i, "function" == typeof t.define && t.define.amd && t.define("hammer", [], function () { return i })) })(this), function (t, e) { "use strict"; t !== e && (Hammer.event.bindDom = function (n, i, r) { t(n).on(i, function (t) { var n = t.originalEvent || t; n.pageX === e && (n.pageX = t.pageX, n.pageY = t.pageY), n.target || (n.target = t.target), n.which === e && (n.which = n.button), n.preventDefault || (n.preventDefault = t.preventDefault), n.stopPropagation || (n.stopPropagation = t.stopPropagation), r.call(this, n) }) }, Hammer.Instance.prototype.on = function (e, n) { return t(this.element).on(e, n) }, Hammer.Instance.prototype.off = function (e, n) { return t(this.element).off(e, n) }, Hammer.Instance.prototype.trigger = function (e, n) { var i = t(this.element); return i.has(n.target).length && (i = t(n.target)), i.trigger({ type: e, gesture: n }) }, t.fn.hammer = function (e) { return this.each(function () { var n = t(this), i = n.data("hammer"); i ? i && e && Hammer.utils.extend(i.options, e) : n.data("hammer", new Hammer(this, e || {})) }) }) }(window.jQuery || window.Zepto);

/*!
 * jQuery blockUI plugin
 * Version 2.66.0-2013.10.09
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */

; (function () {
    /*jshint eqeqeq:false curly:false latedef:false */
    "use strict";

    function setup($) {
        $.fn._fadeIn = $.fn.fadeIn;

        var noOp = $.noop || function () { };

        // this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
        // confusing userAgent strings on Vista)
        var msie = /MSIE/.test(navigator.userAgent);
        var ie6 = /MSIE 6.0/.test(navigator.userAgent) && ! /MSIE 8.0/.test(navigator.userAgent);
        var mode = document.documentMode || 0;
        var setExpr = $.isFunction(document.createElement('div').style.setExpression);

        // global $ methods for blocking/unblocking the entire page
        $.blockUI = function (opts) { install(window, opts); };
        $.unblockUI = function (opts) { remove(window, opts); };

        // convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
        $.growlUI = function (title, message, timeout, onClose) {
            var $m = $('<div class="growlUI"></div>');
            if (title) $m.append('<h1>' + title + '</h1>');
            if (message) $m.append('<h2>' + message + '</h2>');
            if (timeout === undefined) timeout = 3000;

            // Added by konapun: Set timeout to 30 seconds if this growl is moused over, like normal toast notifications
            var callBlock = function (opts) {
                opts = opts || {};

                $.blockUI({
                    message: $m,
                    fadeIn: typeof opts.fadeIn !== 'undefined' ? opts.fadeIn : 700,
                    fadeOut: typeof opts.fadeOut !== 'undefined' ? opts.fadeOut : 1000,
                    timeout: typeof opts.timeout !== 'undefined' ? opts.timeout : timeout,
                    centerY: false,
                    showOverlay: false,
                    onUnblock: onClose,
                    css: $.blockUI.defaults.growlCSS
                });
            };

            callBlock();
            var nonmousedOpacity = $m.css('opacity');
            $m.mouseover(function () {
                callBlock({
                    fadeIn: 0,
                    timeout: 30000
                });

                var displayBlock = $('.blockMsg');
                displayBlock.stop(); // cancel fadeout if it has started
                displayBlock.fadeTo(300, 1); // make it easier to read the message by removing transparency
            }).mouseout(function () {
                $('.blockMsg').fadeOut(1000);
            });
            // End konapun additions
        };

        // plugin method for blocking element content
        $.fn.block = function (opts) {
            if (this[0] === window) {
                $.blockUI(opts);
                return this;
            }
            var fullOpts = $.extend({}, $.blockUI.defaults, opts || {});
            this.each(function () {
                var $el = $(this);
                if (fullOpts.ignoreIfBlocked && $el.data('blockUI.isBlocked'))
                    return;
                $el.unblock({ fadeOut: 0 });
            });

            return this.each(function () {
                if ($.css(this, 'position') == 'static') {
                    this.style.position = 'relative';
                    $(this).data('blockUI.static', true);
                }
                this.style.zoom = 1; // force 'hasLayout' in ie
                install(this, opts);
            });
        };

        // plugin method for unblocking element content
        $.fn.unblock = function (opts) {
            if (this[0] === window) {
                $.unblockUI(opts);
                return this;
            }
            return this.each(function () {
                remove(this, opts);
            });
        };

        $.blockUI.version = 2.66; // 2nd generation blocking at no extra cost!

        // override these in your code to change the default behavior and style
        $.blockUI.defaults = {
            // message displayed when blocking (use null for no message)
            message: '<h1>Please wait...</h1>',

            title: null,		// title string; only used when theme == true
            draggable: true,	// only used when theme == true (requires jquery-ui.js to be loaded)

            theme: false, // set to true to use with jQuery UI themes

            // styles for the message when blocking; if you wish to disable
            // these and use an external stylesheet then do this in your code:
            // $.blockUI.defaults.css = {};
            css: {
                padding: '0',
                margin: '0',
		top: '2%',
		left: '30%',
                width: '30%',
                textAlign: 'center',
                color: '#000',
                border: '3px solid #aaa',
                backgroundColor: '#fff',
                cursor: 'wait'
            },

            // minimal style set used when themes are used
            themedCSS: {
                width: '30%',
                top: '2%',
                left: '35%'
            },

            // styles for the overlay
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0.6,
                cursor: 'wait'
            },

            // style to replace wait cursor before unblocking to correct issue
            // of lingering wait cursor
            cursorReset: 'default',

            // styles applied when using $.growlUI
            growlCSS: {
                width: '350px',
                top: '10px',
                left: '',
                right: '10px',
                border: 'none',
                padding: '5px',
                opacity: 0.6,
                cursor: 'default',
                color: '#fff',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                'border-radius': '10px'
            },

            // IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
            // (hat tip to Jorge H. N. de Vasconcelos)
            /*jshint scripturl:true */
            iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

            // force usage of iframe in non-IE browsers (handy for blocking applets)
            forceIframe: false,

            // z-index for the blocking overlay
            baseZ: 1000,

            // set these to true to have the message automatically centered
            centerX: true, // <-- only effects element blocking (page block controlled via css above)
            centerY: true,

            // allow body element to be stetched in ie6; this makes blocking look better
            // on "short" pages.  disable if you wish to prevent changes to the body height
            allowBodyStretch: true,

            // enable if you want key and mouse events to be disabled for content that is blocked
            bindEvents: true,

            // be default blockUI will supress tab navigation from leaving blocking content
            // (if bindEvents is true)
            constrainTabKey: true,

            // fadeIn time in millis; set to 0 to disable fadeIn on block
            fadeIn: 200,

            // fadeOut time in millis; set to 0 to disable fadeOut on unblock
            fadeOut: 400,

            // time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
            timeout: 0,

            // disable if you don't want to show the overlay
            showOverlay: true,

            // if true, focus will be placed in the first available input field when
            // page blocking
            focusInput: true,

            // elements that can receive focus
            focusableElements: ':input:enabled:visible',

            // suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
            // no longer needed in 2012
            // applyPlatformOpacityRules: true,

            // callback method invoked when fadeIn has completed and blocking message is visible
            onBlock: null,

            // callback method invoked when unblocking has completed; the callback is
            // passed the element that has been unblocked (which is the window object for page
            // blocks) and the options that were passed to the unblock call:
            //	onUnblock(element, options)
            onUnblock: null,

            // callback method invoked when the overlay area is clicked.
            // setting this will turn the cursor to a pointer, otherwise cursor defined in overlayCss will be used.
            onOverlayClick: null,

            // don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
            quirksmodeOffsetHack: 4,

            // class name of the message block
            blockMsgClass: 'blockMsg',

            // if it is already blocked, then ignore it (don't unblock and reblock)
            ignoreIfBlocked: false
        };

        // private data and functions follow...

        var pageBlock = null;
        var pageBlockEls = [];

        function install(el, opts) {
            var css, themedCSS;
            var full = (el == window);
            var msg = (opts && opts.message !== undefined ? opts.message : undefined);
            opts = $.extend({}, $.blockUI.defaults, opts || {});

            if (opts.ignoreIfBlocked && $(el).data('blockUI.isBlocked'))
                return;

            opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
            css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
            if (opts.onOverlayClick)
                opts.overlayCSS.cursor = 'pointer';

            themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
            msg = msg === undefined ? opts.message : msg;

            // remove the current block (if there is one)
            if (full && pageBlock)
                remove(window, { fadeOut: 0 });

            // if an existing element is being used as the blocking content then we capture
            // its current place in the DOM (and current display style) so we can restore
            // it when we unblock
            if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
                var node = msg.jquery ? msg[0] : msg;
                var data = {};
                $(el).data('blockUI.history', data);
                data.el = node;
                data.parent = node.parentNode;
                data.display = node.style.display;
                data.position = node.style.position;
                if (data.parent)
                    data.parent.removeChild(node);
            }

            $(el).data('blockUI.onUnblock', opts.onUnblock);
            var z = opts.baseZ;

            // blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
            // layer1 is the iframe layer which is used to supress bleed through of underlying content
            // layer2 is the overlay layer which has opacity and a wait cursor (by default)
            // layer3 is the message content that is displayed while blocking
            var lyr1, lyr2, lyr3, s;
            if (msie || opts.forceIframe)
                lyr1 = $('<iframe class="blockUI" style="z-index:' + (z++) + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + opts.iframeSrc + '"></iframe>');
            else
                lyr1 = $('<div class="blockUI" style="display:none"></div>');

            if (opts.theme)
                lyr2 = $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + (z++) + ';display:none"></div>');
            else
                lyr2 = $('<div class="blockUI blockOverlay" style="z-index:' + (z++) + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

            if (opts.theme && full) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + (z + 10) + ';position:fixed;">';
                if (opts.title) {
                    s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (opts.title || '&nbsp;') + '</div>';
                }
                s += '<div class="ui-widget-content ui-dialog-content"></div>';
                s += '</div>';
            }
            else if (opts.theme) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + (z + 10) + ';display:none;position:absolute">';
                if (opts.title) {
                    s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (opts.title || '&nbsp;') + '</div>';
                }
                s += '<div class="ui-widget-content ui-dialog-content"></div>';
                s += '</div>';
            }
            else if (full) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:' + (z + 10) + ';display:none;position:fixed"></div>';
            }
            else {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:' + (z + 10) + ';display:none;position:absolute"></div>';
            }
            lyr3 = $(s);

            // if we have a message, style it
            if (msg) {
                if (opts.theme) {
                    lyr3.css(themedCSS);
                    lyr3.addClass('ui-widget-content');
                }
                else
                    lyr3.css(css);
            }

            // style the overlay
            if (!opts.theme /*&& (!opts.applyPlatformOpacityRules)*/)
                lyr2.css(opts.overlayCSS);
            lyr2.css('position', full ? 'fixed' : 'absolute');

            // make iframe layer transparent in IE
            if (msie || opts.forceIframe)
                lyr1.css('opacity', 0.0);

            //$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
            var layers = [lyr1, lyr2, lyr3], $par = full ? $('body') : $(el);
            $.each(layers, function () {
                this.appendTo($par);
            });

            if (opts.theme && opts.draggable && $.fn.draggable) {
                lyr3.draggable({
                    handle: '.ui-dialog-titlebar',
                    cancel: 'li'
                });
            }

            // ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
            var expr = setExpr && (!$.support.boxModel || $('object,embed', full ? null : el).length > 0);
            if (ie6 || expr) {
                // give body 100% height
                if (full && opts.allowBodyStretch && $.support.boxModel)
                    $('html,body').css('height', '100%');

                // fix ie6 issue when blocked element has a border width
                if ((ie6 || !$.support.boxModel) && !full) {
                    var t = sz(el, 'borderTopWidth'), l = sz(el, 'borderLeftWidth');
                    var fixT = t ? '(0 - ' + t + ')' : 0;
                    var fixL = l ? '(0 - ' + l + ')' : 0;
                }

                // simulate fixed position
                $.each(layers, function (i, o) {
                    var s = o[0].style;
                    s.position = 'absolute';
                    if (i < 2) {
                        if (full)
                            s.setExpression('height', 'Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:' + opts.quirksmodeOffsetHack + ') + "px"');
                        else
                            s.setExpression('height', 'this.parentNode.offsetHeight + "px"');
                        if (full)
                            s.setExpression('width', 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
                        else
                            s.setExpression('width', 'this.parentNode.offsetWidth + "px"');
                        if (fixL) s.setExpression('left', fixL);
                        if (fixT) s.setExpression('top', fixT);
                    }
                    else if (opts.centerY) {
                        if (full) s.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
                        s.marginTop = 0;
                    }
                    else if (!opts.centerY && full) {
                        var top = (opts.css && opts.css.top) ? parseInt(opts.css.top, 10) : 0;
                        var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + ' + top + ') + "px"';
                        s.setExpression('top', expression);
                    }
                });
            }

            // show the message
            if (msg) {
                if (opts.theme)
                    lyr3.find('.ui-widget-content').append(msg);
                else
                    lyr3.append(msg);
                if (msg.jquery || msg.nodeType)
                    $(msg).show();
            }

            if ((msie || opts.forceIframe) && opts.showOverlay)
                lyr1.show(); // opacity is zero
            if (opts.fadeIn) {
                var cb = opts.onBlock ? opts.onBlock : noOp;
                var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
                var cb2 = msg ? cb : noOp;
                if (opts.showOverlay)
                    lyr2._fadeIn(opts.fadeIn, cb1);
                if (msg)
                    lyr3._fadeIn(opts.fadeIn, cb2);
            }
            else {
                if (opts.showOverlay)
                    lyr2.show();
                if (msg)
                    lyr3.show();
                if (opts.onBlock)
                    opts.onBlock();
            }

            // bind key and mouse events
            bind(1, el, opts);

            if (full) {
                pageBlock = lyr3[0];
                pageBlockEls = $(opts.focusableElements, pageBlock);
                if (opts.focusInput)
                    setTimeout(focus, 20);
            }
            else
                center(lyr3[0], opts.centerX, opts.centerY);

            if (opts.timeout) {
                // auto-unblock
                var to = setTimeout(function () {
                    if (full)
                        $.unblockUI(opts);
                    else
                        $(el).unblock(opts);
                }, opts.timeout);
                $(el).data('blockUI.timeout', to);
            }
        }

        // remove the block
        function remove(el, opts) {
            var count;
            var full = (el == window);
            var $el = $(el);
            var data = $el.data('blockUI.history');
            var to = $el.data('blockUI.timeout');
            if (to) {
                clearTimeout(to);
                $el.removeData('blockUI.timeout');
            }
            opts = $.extend({}, $.blockUI.defaults, opts || {});
            bind(0, el, opts); // unbind events

            if (opts.onUnblock === null) {
                opts.onUnblock = $el.data('blockUI.onUnblock');
                $el.removeData('blockUI.onUnblock');
            }

            var els;
            if (full) // crazy selector to handle odd field errors in ie6/7
                els = $('body').children().filter('.blockUI').add('body > .blockUI');
            else
                els = $el.find('>.blockUI');

            // fix cursor issue
            if (opts.cursorReset) {
                if (els.length > 1)
                    els[1].style.cursor = opts.cursorReset;
                if (els.length > 2)
                    els[2].style.cursor = opts.cursorReset;
            }

            if (full)
                pageBlock = pageBlockEls = null;

            if (opts.fadeOut) {
                count = els.length;
                els.stop().fadeOut(opts.fadeOut, function () {
                    if (--count === 0)
                        reset(els, data, opts, el);
                });
            }
            else
                reset(els, data, opts, el);
        }

        // move blocking element back into the DOM where it started
        function reset(els, data, opts, el) {
            var $el = $(el);
            if ($el.data('blockUI.isBlocked'))
                return;

            els.each(function (i, o) {
                // remove via DOM calls so we don't lose event handlers
                if (this.parentNode)
                    this.parentNode.removeChild(this);
            });

            if (data && data.el) {
                data.el.style.display = data.display;
                data.el.style.position = data.position;
                if (data.parent)
                    data.parent.appendChild(data.el);
                $el.removeData('blockUI.history');
            }

            if ($el.data('blockUI.static')) {
                $el.css('position', 'static'); // #22
            }

            if (typeof opts.onUnblock == 'function')
                opts.onUnblock(el, opts);

            // fix issue in Safari 6 where block artifacts remain until reflow
            var body = $(document.body), w = body.width(), cssW = body[0].style.width;
            body.width(w - 1).width(w);
            body[0].style.width = cssW;
        }

        // bind/unbind the handler
        function bind(b, el, opts) {
            var full = el == window, $el = $(el);

            // don't bother unbinding if there is nothing to unbind
            if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
                return;

            $el.data('blockUI.isBlocked', b);

            // don't bind events when overlay is not in use or if bindEvents is false
            if (!full || !opts.bindEvents || (b && !opts.showOverlay))
                return;

            // bind anchors and inputs for mouse and key events
            var events = 'mousedown mouseup keydown keypress keyup touchstart touchend touchmove';
            if (b)
                $(document).bind(events, opts, handler);
            else
                $(document).unbind(events, handler);

            // former impl...
            //		var $e = $('a,:input');
            //		b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
        }

        // event handler to suppress keyboard/mouse events when blocking
        function handler(e) {
            // allow tab navigation (conditionally)
            if (e.type === 'keydown' && e.keyCode && e.keyCode == 9) {
                if (pageBlock && e.data.constrainTabKey) {
                    var els = pageBlockEls;
                    var fwd = !e.shiftKey && e.target === els[els.length - 1];
                    var back = e.shiftKey && e.target === els[0];
                    if (fwd || back) {
                        setTimeout(function () { focus(back); }, 10);
                        return false;
                    }
                }
            }
            var opts = e.data;
            var target = $(e.target);
            if (target.hasClass('blockOverlay') && opts.onOverlayClick)
                opts.onOverlayClick(e);

            // allow events within the message content
            if (target.parents('div.' + opts.blockMsgClass).length > 0)
                return true;

            // allow events for content that is not being blocked
            return target.parents().children().filter('div.blockUI').length === 0;
        }

        function focus(back) {
            if (!pageBlockEls)
                return;
            var e = pageBlockEls[back === true ? pageBlockEls.length - 1 : 0];
            if (e)
                e.focus();
        }

        function center(el, x, y) {
            var p = el.parentNode, s = el.style;
            var l = ((p.offsetWidth - el.offsetWidth) / 2) - sz(p, 'borderLeftWidth');
            var t = ((p.offsetHeight - el.offsetHeight) / 2) - sz(p, 'borderTopWidth');
            if (x) s.left = l > 0 ? (l + 'px') : '0';
            if (y) s.top = t > 0 ? (t + 'px') : '0';
        }

        function sz(el, p) {
            return parseInt($.css(el, p), 10) || 0;
        }

    }


    /*global define:true */
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }

})();

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch (e) { }
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write

        if (arguments.length > 1 && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path ? '; path=' + options.path : '',
				options.domain ? '; domain=' + options.domain : '',
				options.secure ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };

}));

//! moment.js
//! version : 2.8.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function (a) { function b(a, b, c) { switch (arguments.length) { case 2: return null != a ? a : b; case 3: return null != a ? a : null != b ? b : c; default: throw new Error("Implement me") } } function c() { return { empty: !1, unusedTokens: [], unusedInput: [], overflow: -2, charsLeftOver: 0, nullInput: !1, invalidMonth: null, invalidFormat: !1, userInvalidated: !1, iso: !1 } } function d(a) { rb.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + a) } function e(a, b) { var c = !0; return l(function () { return c && (d(a), c = !1), b.apply(this, arguments) }, b) } function f(a, b) { nc[a] || (d(b), nc[a] = !0) } function g(a, b) { return function (c) { return o(a.call(this, c), b) } } function h(a, b) { return function (c) { return this.localeData().ordinal(a.call(this, c), b) } } function i() { } function j(a, b) { b !== !1 && E(a), m(this, a), this._d = new Date(+a._d) } function k(a) { var b = x(a), c = b.year || 0, d = b.quarter || 0, e = b.month || 0, f = b.week || 0, g = b.day || 0, h = b.hour || 0, i = b.minute || 0, j = b.second || 0, k = b.millisecond || 0; this._milliseconds = +k + 1e3 * j + 6e4 * i + 36e5 * h, this._days = +g + 7 * f, this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = rb.localeData(), this._bubble() } function l(a, b) { for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]); return b.hasOwnProperty("toString") && (a.toString = b.toString), b.hasOwnProperty("valueOf") && (a.valueOf = b.valueOf), a } function m(a, b) { var c, d, e; if ("undefined" != typeof b._isAMomentObject && (a._isAMomentObject = b._isAMomentObject), "undefined" != typeof b._i && (a._i = b._i), "undefined" != typeof b._f && (a._f = b._f), "undefined" != typeof b._l && (a._l = b._l), "undefined" != typeof b._strict && (a._strict = b._strict), "undefined" != typeof b._tzm && (a._tzm = b._tzm), "undefined" != typeof b._isUTC && (a._isUTC = b._isUTC), "undefined" != typeof b._offset && (a._offset = b._offset), "undefined" != typeof b._pf && (a._pf = b._pf), "undefined" != typeof b._locale && (a._locale = b._locale), Fb.length > 0) for (c in Fb) d = Fb[c], e = b[d], "undefined" != typeof e && (a[d] = e); return a } function n(a) { return 0 > a ? Math.ceil(a) : Math.floor(a) } function o(a, b, c) { for (var d = "" + Math.abs(a), e = a >= 0; d.length < b;) d = "0" + d; return (e ? c ? "+" : "" : "-") + d } function p(a, b) { var c = { milliseconds: 0, months: 0 }; return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c } function q(a, b) { var c; return b = J(b, a), a.isBefore(b) ? c = p(a, b) : (c = p(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c } function r(a, b) { return function (c, d) { var e, g; return null === d || isNaN(+d) || (f(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period)."), g = c, c = d, d = g), c = "string" == typeof c ? +c : c, e = rb.duration(c, d), s(this, e, a), this } } function s(a, b, c, d) { var e = b._milliseconds, f = b._days, g = b._months; d = null == d ? !0 : d, e && a._d.setTime(+a._d + e * c), f && lb(a, "Date", kb(a, "Date") + f * c), g && jb(a, kb(a, "Month") + g * c), d && rb.updateOffset(a, f || g) } function t(a) { return "[object Array]" === Object.prototype.toString.call(a) } function u(a) { return "[object Date]" === Object.prototype.toString.call(a) || a instanceof Date } function v(a, b, c) { var d, e = Math.min(a.length, b.length), f = Math.abs(a.length - b.length), g = 0; for (d = 0; e > d; d++) (c && a[d] !== b[d] || !c && z(a[d]) !== z(b[d])) && g++; return g + f } function w(a) { if (a) { var b = a.toLowerCase().replace(/(.)s$/, "$1"); a = gc[a] || hc[b] || b } return a } function x(a) { var b, c, d = {}; for (c in a) a.hasOwnProperty(c) && (b = w(c), b && (d[b] = a[c])); return d } function y(b) { var c, d; if (0 === b.indexOf("week")) c = 7, d = "day"; else { if (0 !== b.indexOf("month")) return; c = 12, d = "month" } rb[b] = function (e, f) { var g, h, i = rb._locale[b], j = []; if ("number" == typeof e && (f = e, e = a), h = function (a) { var b = rb().utc().set(d, a); return i.call(rb._locale, b, e || "") }, null != f) return h(f); for (g = 0; c > g; g++) j.push(h(g)); return j } } function z(a) { var b = +a, c = 0; return 0 !== b && isFinite(b) && (c = b >= 0 ? Math.floor(b) : Math.ceil(b)), c } function A(a, b) { return new Date(Date.UTC(a, b + 1, 0)).getUTCDate() } function B(a, b, c) { return fb(rb([a, 11, 31 + b - c]), b, c).week } function C(a) { return D(a) ? 366 : 365 } function D(a) { return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0 } function E(a) { var b; a._a && -2 === a._pf.overflow && (b = a._a[yb] < 0 || a._a[yb] > 11 ? yb : a._a[zb] < 1 || a._a[zb] > A(a._a[xb], a._a[yb]) ? zb : a._a[Ab] < 0 || a._a[Ab] > 23 ? Ab : a._a[Bb] < 0 || a._a[Bb] > 59 ? Bb : a._a[Cb] < 0 || a._a[Cb] > 59 ? Cb : a._a[Db] < 0 || a._a[Db] > 999 ? Db : -1, a._pf._overflowDayOfYear && (xb > b || b > zb) && (b = zb), a._pf.overflow = b) } function F(a) { return null == a._isValid && (a._isValid = !isNaN(a._d.getTime()) && a._pf.overflow < 0 && !a._pf.empty && !a._pf.invalidMonth && !a._pf.nullInput && !a._pf.invalidFormat && !a._pf.userInvalidated, a._strict && (a._isValid = a._isValid && 0 === a._pf.charsLeftOver && 0 === a._pf.unusedTokens.length)), a._isValid } function G(a) { return a ? a.toLowerCase().replace("_", "-") : a } function H(a) { for (var b, c, d, e, f = 0; f < a.length;) { for (e = G(a[f]).split("-"), b = e.length, c = G(a[f + 1]), c = c ? c.split("-") : null; b > 0;) { if (d = I(e.slice(0, b).join("-"))) return d; if (c && c.length >= b && v(e, c, !0) >= b - 1) break; b-- } f++ } return null } function I(a) { var b = null; if (!Eb[a] && Gb) try { b = rb.locale(), require("./locale/" + a), rb.locale(b) } catch (c) { } return Eb[a] } function J(a, b) { return b._isUTC ? rb(a).zone(b._offset || 0) : rb(a).local() } function K(a) { return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "") } function L(a) { var b, c, d = a.match(Kb); for (b = 0, c = d.length; c > b; b++) d[b] = mc[d[b]] ? mc[d[b]] : K(d[b]); return function (e) { var f = ""; for (b = 0; c > b; b++) f += d[b] instanceof Function ? d[b].call(e, a) : d[b]; return f } } function M(a, b) { return a.isValid() ? (b = N(b, a.localeData()), ic[b] || (ic[b] = L(b)), ic[b](a)) : a.localeData().invalidDate() } function N(a, b) { function c(a) { return b.longDateFormat(a) || a } var d = 5; for (Lb.lastIndex = 0; d >= 0 && Lb.test(a) ;) a = a.replace(Lb, c), Lb.lastIndex = 0, d -= 1; return a } function O(a, b) { var c, d = b._strict; switch (a) { case "Q": return Wb; case "DDDD": return Yb; case "YYYY": case "GGGG": case "gggg": return d ? Zb : Ob; case "Y": case "G": case "g": return _b; case "YYYYYY": case "YYYYY": case "GGGGG": case "ggggg": return d ? $b : Pb; case "S": if (d) return Wb; case "SS": if (d) return Xb; case "SSS": if (d) return Yb; case "DDD": return Nb; case "MMM": case "MMMM": case "dd": case "ddd": case "dddd": return Rb; case "a": case "A": return b._locale._meridiemParse; case "X": return Ub; case "Z": case "ZZ": return Sb; case "T": return Tb; case "SSSS": return Qb; case "MM": case "DD": case "YY": case "GG": case "gg": case "HH": case "hh": case "mm": case "ss": case "ww": case "WW": return d ? Xb : Mb; case "M": case "D": case "d": case "H": case "h": case "m": case "s": case "w": case "W": case "e": case "E": return Mb; case "Do": return Vb; default: return c = new RegExp(X(W(a.replace("\\", "")), "i")) } } function P(a) { a = a || ""; var b = a.match(Sb) || [], c = b[b.length - 1] || [], d = (c + "").match(ec) || ["-", 0, 0], e = +(60 * d[1]) + z(d[2]); return "+" === d[0] ? -e : e } function Q(a, b, c) { var d, e = c._a; switch (a) { case "Q": null != b && (e[yb] = 3 * (z(b) - 1)); break; case "M": case "MM": null != b && (e[yb] = z(b) - 1); break; case "MMM": case "MMMM": d = c._locale.monthsParse(b), null != d ? e[yb] = d : c._pf.invalidMonth = b; break; case "D": case "DD": null != b && (e[zb] = z(b)); break; case "Do": null != b && (e[zb] = z(parseInt(b, 10))); break; case "DDD": case "DDDD": null != b && (c._dayOfYear = z(b)); break; case "YY": e[xb] = rb.parseTwoDigitYear(b); break; case "YYYY": case "YYYYY": case "YYYYYY": e[xb] = z(b); break; case "a": case "A": c._isPm = c._locale.isPM(b); break; case "H": case "HH": case "h": case "hh": e[Ab] = z(b); break; case "m": case "mm": e[Bb] = z(b); break; case "s": case "ss": e[Cb] = z(b); break; case "S": case "SS": case "SSS": case "SSSS": e[Db] = z(1e3 * ("0." + b)); break; case "X": c._d = new Date(1e3 * parseFloat(b)); break; case "Z": case "ZZ": c._useUTC = !0, c._tzm = P(b); break; case "dd": case "ddd": case "dddd": d = c._locale.weekdaysParse(b), null != d ? (c._w = c._w || {}, c._w.d = d) : c._pf.invalidWeekday = b; break; case "w": case "ww": case "W": case "WW": case "d": case "e": case "E": a = a.substr(0, 1); case "gggg": case "GGGG": case "GGGGG": a = a.substr(0, 2), b && (c._w = c._w || {}, c._w[a] = z(b)); break; case "gg": case "GG": c._w = c._w || {}, c._w[a] = rb.parseTwoDigitYear(b) } } function R(a) { var c, d, e, f, g, h, i; c = a._w, null != c.GG || null != c.W || null != c.E ? (g = 1, h = 4, d = b(c.GG, a._a[xb], fb(rb(), 1, 4).year), e = b(c.W, 1), f = b(c.E, 1)) : (g = a._locale._week.dow, h = a._locale._week.doy, d = b(c.gg, a._a[xb], fb(rb(), g, h).year), e = b(c.w, 1), null != c.d ? (f = c.d, g > f && ++e) : f = null != c.e ? c.e + g : g), i = gb(d, e, f, h, g), a._a[xb] = i.year, a._dayOfYear = i.dayOfYear } function S(a) { var c, d, e, f, g = []; if (!a._d) { for (e = U(a), a._w && null == a._a[zb] && null == a._a[yb] && R(a), a._dayOfYear && (f = b(a._a[xb], e[xb]), a._dayOfYear > C(f) && (a._pf._overflowDayOfYear = !0), d = bb(f, 0, a._dayOfYear), a._a[yb] = d.getUTCMonth(), a._a[zb] = d.getUTCDate()), c = 0; 3 > c && null == a._a[c]; ++c) a._a[c] = g[c] = e[c]; for (; 7 > c; c++) a._a[c] = g[c] = null == a._a[c] ? 2 === c ? 1 : 0 : a._a[c]; a._d = (a._useUTC ? bb : ab).apply(null, g), null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() + a._tzm) } } function T(a) { var b; a._d || (b = x(a._i), a._a = [b.year, b.month, b.day, b.hour, b.minute, b.second, b.millisecond], S(a)) } function U(a) { var b = new Date; return a._useUTC ? [b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()] : [b.getFullYear(), b.getMonth(), b.getDate()] } function V(a) { if (a._f === rb.ISO_8601) return void Z(a); a._a = [], a._pf.empty = !0; var b, c, d, e, f, g = "" + a._i, h = g.length, i = 0; for (d = N(a._f, a._locale).match(Kb) || [], b = 0; b < d.length; b++) e = d[b], c = (g.match(O(e, a)) || [])[0], c && (f = g.substr(0, g.indexOf(c)), f.length > 0 && a._pf.unusedInput.push(f), g = g.slice(g.indexOf(c) + c.length), i += c.length), mc[e] ? (c ? a._pf.empty = !1 : a._pf.unusedTokens.push(e), Q(e, c, a)) : a._strict && !c && a._pf.unusedTokens.push(e); a._pf.charsLeftOver = h - i, g.length > 0 && a._pf.unusedInput.push(g), a._isPm && a._a[Ab] < 12 && (a._a[Ab] += 12), a._isPm === !1 && 12 === a._a[Ab] && (a._a[Ab] = 0), S(a), E(a) } function W(a) { return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (a, b, c, d, e) { return b || c || d || e }) } function X(a) { return a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") } function Y(a) { var b, d, e, f, g; if (0 === a._f.length) return a._pf.invalidFormat = !0, void (a._d = new Date(0 / 0)); for (f = 0; f < a._f.length; f++) g = 0, b = m({}, a), b._pf = c(), b._f = a._f[f], V(b), F(b) && (g += b._pf.charsLeftOver, g += 10 * b._pf.unusedTokens.length, b._pf.score = g, (null == e || e > g) && (e = g, d = b)); l(a, d || b) } function Z(a) { var b, c, d = a._i, e = ac.exec(d); if (e) { for (a._pf.iso = !0, b = 0, c = cc.length; c > b; b++) if (cc[b][1].exec(d)) { a._f = cc[b][0] + (e[6] || " "); break } for (b = 0, c = dc.length; c > b; b++) if (dc[b][1].exec(d)) { a._f += dc[b][0]; break } d.match(Sb) && (a._f += "Z"), V(a) } else a._isValid = !1 } function $(a) { Z(a), a._isValid === !1 && (delete a._isValid, rb.createFromInputFallback(a)) } function _(b) { var c, d = b._i; d === a ? b._d = new Date : u(d) ? b._d = new Date(+d) : null !== (c = Hb.exec(d)) ? b._d = new Date(+c[1]) : "string" == typeof d ? $(b) : t(d) ? (b._a = d.slice(0), S(b)) : "object" == typeof d ? T(b) : "number" == typeof d ? b._d = new Date(d) : rb.createFromInputFallback(b) } function ab(a, b, c, d, e, f, g) { var h = new Date(a, b, c, d, e, f, g); return 1970 > a && h.setFullYear(a), h } function bb(a) { var b = new Date(Date.UTC.apply(null, arguments)); return 1970 > a && b.setUTCFullYear(a), b } function cb(a, b) { if ("string" == typeof a) if (isNaN(a)) { if (a = b.weekdaysParse(a), "number" != typeof a) return null } else a = parseInt(a, 10); return a } function db(a, b, c, d, e) { return e.relativeTime(b || 1, !!c, a, d) } function eb(a, b, c) { var d = rb.duration(a).abs(), e = wb(d.as("s")), f = wb(d.as("m")), g = wb(d.as("h")), h = wb(d.as("d")), i = wb(d.as("M")), j = wb(d.as("y")), k = e < jc.s && ["s", e] || 1 === f && ["m"] || f < jc.m && ["mm", f] || 1 === g && ["h"] || g < jc.h && ["hh", g] || 1 === h && ["d"] || h < jc.d && ["dd", h] || 1 === i && ["M"] || i < jc.M && ["MM", i] || 1 === j && ["y"] || ["yy", j]; return k[2] = b, k[3] = +a > 0, k[4] = c, db.apply({}, k) } function fb(a, b, c) { var d, e = c - b, f = c - a.day(); return f > e && (f -= 7), e - 7 > f && (f += 7), d = rb(a).add(f, "d"), { week: Math.ceil(d.dayOfYear() / 7), year: d.year() } } function gb(a, b, c, d, e) { var f, g, h = bb(a, 0, 1).getUTCDay(); return h = 0 === h ? 7 : h, c = null != c ? c : e, f = e - h + (h > d ? 7 : 0) - (e > h ? 7 : 0), g = 7 * (b - 1) + (c - e) + f + 1, { year: g > 0 ? a : a - 1, dayOfYear: g > 0 ? g : C(a - 1) + g } } function hb(b) { var c = b._i, d = b._f; return b._locale = b._locale || rb.localeData(b._l), null === c || d === a && "" === c ? rb.invalid({ nullInput: !0 }) : ("string" == typeof c && (b._i = c = b._locale.preparse(c)), rb.isMoment(c) ? new j(c, !0) : (d ? t(d) ? Y(b) : V(b) : _(b), new j(b))) } function ib(a, b) { var c, d; if (1 === b.length && t(b[0]) && (b = b[0]), !b.length) return rb(); for (c = b[0], d = 1; d < b.length; ++d) b[d][a](c) && (c = b[d]); return c } function jb(a, b) { var c; return "string" == typeof b && (b = a.localeData().monthsParse(b), "number" != typeof b) ? a : (c = Math.min(a.date(), A(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a) } function kb(a, b) { return a._d["get" + (a._isUTC ? "UTC" : "") + b]() } function lb(a, b, c) { return "Month" === b ? jb(a, c) : a._d["set" + (a._isUTC ? "UTC" : "") + b](c) } function mb(a, b) { return function (c) { return null != c ? (lb(this, a, c), rb.updateOffset(this, b), this) : kb(this, a) } } function nb(a) { return 400 * a / 146097 } function ob(a) { return 146097 * a / 400 } function pb(a) { rb.duration.fn[a] = function () { return this._data[a] } } function qb(a) { "undefined" == typeof ender && (sb = vb.moment, vb.moment = a ? e("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.", rb) : rb) } for (var rb, sb, tb, ub = "2.8.1", vb = "undefined" != typeof global ? global : this, wb = Math.round, xb = 0, yb = 1, zb = 2, Ab = 3, Bb = 4, Cb = 5, Db = 6, Eb = {}, Fb = [], Gb = "undefined" != typeof module && module.exports, Hb = /^\/?Date\((\-?\d+)/i, Ib = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, Jb = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, Kb = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, Lb = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, Mb = /\d\d?/, Nb = /\d{1,3}/, Ob = /\d{1,4}/, Pb = /[+\-]?\d{1,6}/, Qb = /\d+/, Rb = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, Sb = /Z|[\+\-]\d\d:?\d\d/gi, Tb = /T/i, Ub = /[\+\-]?\d+(\.\d{1,3})?/, Vb = /\d{1,2}/, Wb = /\d/, Xb = /\d\d/, Yb = /\d{3}/, Zb = /\d{4}/, $b = /[+-]?\d{6}/, _b = /[+-]?\d+/, ac = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, bc = "YYYY-MM-DDTHH:mm:ssZ", cc = [["YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/], ["YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/], ["GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/], ["GGGG-[W]WW", /\d{4}-W\d{2}/], ["YYYY-DDD", /\d{4}-\d{3}/]], dc = [["HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/], ["HH:mm", /(T| )\d\d:\d\d/], ["HH", /(T| )\d\d/]], ec = /([\+\-]|\d\d)/gi, fc = ("Date|Hours|Minutes|Seconds|Milliseconds".split("|"), { Milliseconds: 1, Seconds: 1e3, Minutes: 6e4, Hours: 36e5, Days: 864e5, Months: 2592e6, Years: 31536e6 }), gc = { ms: "millisecond", s: "second", m: "minute", h: "hour", d: "day", D: "date", w: "week", W: "isoWeek", M: "month", Q: "quarter", y: "year", DDD: "dayOfYear", e: "weekday", E: "isoWeekday", gg: "weekYear", GG: "isoWeekYear" }, hc = { dayofyear: "dayOfYear", isoweekday: "isoWeekday", isoweek: "isoWeek", weekyear: "weekYear", isoweekyear: "isoWeekYear" }, ic = {}, jc = { s: 45, m: 45, h: 22, d: 26, M: 11 }, kc = "DDD w W M D d".split(" "), lc = "M D H h m s w W".split(" "), mc = { M: function () { return this.month() + 1 }, MMM: function (a) { return this.localeData().monthsShort(this, a) }, MMMM: function (a) { return this.localeData().months(this, a) }, D: function () { return this.date() }, DDD: function () { return this.dayOfYear() }, d: function () { return this.day() }, dd: function (a) { return this.localeData().weekdaysMin(this, a) }, ddd: function (a) { return this.localeData().weekdaysShort(this, a) }, dddd: function (a) { return this.localeData().weekdays(this, a) }, w: function () { return this.week() }, W: function () { return this.isoWeek() }, YY: function () { return o(this.year() % 100, 2) }, YYYY: function () { return o(this.year(), 4) }, YYYYY: function () { return o(this.year(), 5) }, YYYYYY: function () { var a = this.year(), b = a >= 0 ? "+" : "-"; return b + o(Math.abs(a), 6) }, gg: function () { return o(this.weekYear() % 100, 2) }, gggg: function () { return o(this.weekYear(), 4) }, ggggg: function () { return o(this.weekYear(), 5) }, GG: function () { return o(this.isoWeekYear() % 100, 2) }, GGGG: function () { return o(this.isoWeekYear(), 4) }, GGGGG: function () { return o(this.isoWeekYear(), 5) }, e: function () { return this.weekday() }, E: function () { return this.isoWeekday() }, a: function () { return this.localeData().meridiem(this.hours(), this.minutes(), !0) }, A: function () { return this.localeData().meridiem(this.hours(), this.minutes(), !1) }, H: function () { return this.hours() }, h: function () { return this.hours() % 12 || 12 }, m: function () { return this.minutes() }, s: function () { return this.seconds() }, S: function () { return z(this.milliseconds() / 100) }, SS: function () { return o(z(this.milliseconds() / 10), 2) }, SSS: function () { return o(this.milliseconds(), 3) }, SSSS: function () { return o(this.milliseconds(), 3) }, Z: function () { var a = -this.zone(), b = "+"; return 0 > a && (a = -a, b = "-"), b + o(z(a / 60), 2) + ":" + o(z(a) % 60, 2) }, ZZ: function () { var a = -this.zone(), b = "+"; return 0 > a && (a = -a, b = "-"), b + o(z(a / 60), 2) + o(z(a) % 60, 2) }, z: function () { return this.zoneAbbr() }, zz: function () { return this.zoneName() }, X: function () { return this.unix() }, Q: function () { return this.quarter() } }, nc = {}, oc = ["months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin"]; kc.length;) tb = kc.pop(), mc[tb + "o"] = h(mc[tb], tb); for (; lc.length;) tb = lc.pop(), mc[tb + tb] = g(mc[tb], 2); mc.DDDD = g(mc.DDD, 3), l(i.prototype, { set: function (a) { var b, c; for (c in a) b = a[c], "function" == typeof b ? this[c] = b : this["_" + c] = b }, _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), months: function (a) { return this._months[a.month()] }, _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), monthsShort: function (a) { return this._monthsShort[a.month()] }, monthsParse: function (a) { var b, c, d; for (this._monthsParse || (this._monthsParse = []), b = 0; 12 > b; b++) if (this._monthsParse[b] || (c = rb.utc([2e3, b]), d = "^" + this.months(c, "") + "|^" + this.monthsShort(c, ""), this._monthsParse[b] = new RegExp(d.replace(".", ""), "i")), this._monthsParse[b].test(a)) return b }, _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), weekdays: function (a) { return this._weekdays[a.day()] }, _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), weekdaysShort: function (a) { return this._weekdaysShort[a.day()] }, _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), weekdaysMin: function (a) { return this._weekdaysMin[a.day()] }, weekdaysParse: function (a) { var b, c, d; for (this._weekdaysParse || (this._weekdaysParse = []), b = 0; 7 > b; b++) if (this._weekdaysParse[b] || (c = rb([2e3, 1]).day(b), d = "^" + this.weekdays(c, "") + "|^" + this.weekdaysShort(c, "") + "|^" + this.weekdaysMin(c, ""), this._weekdaysParse[b] = new RegExp(d.replace(".", ""), "i")), this._weekdaysParse[b].test(a)) return b }, _longDateFormat: { LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY LT", LLLL: "dddd, MMMM D, YYYY LT" }, longDateFormat: function (a) { var b = this._longDateFormat[a]; return !b && this._longDateFormat[a.toUpperCase()] && (b = this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (a) { return a.slice(1) }), this._longDateFormat[a] = b), b }, isPM: function (a) { return "p" === (a + "").toLowerCase().charAt(0) }, _meridiemParse: /[ap]\.?m?\.?/i, meridiem: function (a, b, c) { return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM" }, _calendar: { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" }, calendar: function (a, b) { var c = this._calendar[a]; return "function" == typeof c ? c.apply(b) : c }, _relativeTime: { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" }, relativeTime: function (a, b, c, d) { var e = this._relativeTime[c]; return "function" == typeof e ? e(a, b, c, d) : e.replace(/%d/i, a) }, pastFuture: function (a, b) { var c = this._relativeTime[a > 0 ? "future" : "past"]; return "function" == typeof c ? c(b) : c.replace(/%s/i, b) }, ordinal: function (a) { return this._ordinal.replace("%d", a) }, _ordinal: "%d", preparse: function (a) { return a }, postformat: function (a) { return a }, week: function (a) { return fb(a, this._week.dow, this._week.doy).week }, _week: { dow: 0, doy: 6 }, _invalidDate: "Invalid date", invalidDate: function () { return this._invalidDate } }), rb = function (b, d, e, f) { var g; return "boolean" == typeof e && (f = e, e = a), g = {}, g._isAMomentObject = !0, g._i = b, g._f = d, g._l = e, g._strict = f, g._isUTC = !1, g._pf = c(), hb(g) }, rb.suppressDeprecationWarnings = !1, rb.createFromInputFallback = e("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.", function (a) { a._d = new Date(a._i) }), rb.min = function () { var a = [].slice.call(arguments, 0); return ib("isBefore", a) }, rb.max = function () { var a = [].slice.call(arguments, 0); return ib("isAfter", a) }, rb.utc = function (b, d, e, f) { var g; return "boolean" == typeof e && (f = e, e = a), g = {}, g._isAMomentObject = !0, g._useUTC = !0, g._isUTC = !0, g._l = e, g._i = b, g._f = d, g._strict = f, g._pf = c(), hb(g).utc() }, rb.unix = function (a) { return rb(1e3 * a) }, rb.duration = function (a, b) { var c, d, e, f, g = a, h = null; return rb.isDuration(a) ? g = { ms: a._milliseconds, d: a._days, M: a._months } : "number" == typeof a ? (g = {}, b ? g[b] = a : g.milliseconds = a) : (h = Ib.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: 0, d: z(h[zb]) * c, h: z(h[Ab]) * c, m: z(h[Bb]) * c, s: z(h[Cb]) * c, ms: z(h[Db]) * c }) : (h = Jb.exec(a)) ? (c = "-" === h[1] ? -1 : 1, e = function (a) { var b = a && parseFloat(a.replace(",", ".")); return (isNaN(b) ? 0 : b) * c }, g = { y: e(h[2]), M: e(h[3]), d: e(h[4]), h: e(h[5]), m: e(h[6]), s: e(h[7]), w: e(h[8]) }) : "object" == typeof g && ("from" in g || "to" in g) && (f = q(rb(g.from), rb(g.to)), g = {}, g.ms = f.milliseconds, g.M = f.months), d = new k(g), rb.isDuration(a) && a.hasOwnProperty("_locale") && (d._locale = a._locale), d }, rb.version = ub, rb.defaultFormat = bc, rb.ISO_8601 = function () { }, rb.momentProperties = Fb, rb.updateOffset = function () { }, rb.relativeTimeThreshold = function (b, c) { return jc[b] === a ? !1 : c === a ? jc[b] : (jc[b] = c, !0) }, rb.lang = e("moment.lang is deprecated. Use moment.locale instead.", function (a, b) { return rb.locale(a, b) }), rb.locale = function (a, b) { var c; return a && (c = "undefined" != typeof b ? rb.defineLocale(a, b) : rb.localeData(a), c && (rb.duration._locale = rb._locale = c)), rb._locale._abbr }, rb.defineLocale = function (a, b) { return null !== b ? (b.abbr = a, Eb[a] || (Eb[a] = new i), Eb[a].set(b), rb.locale(a), Eb[a]) : (delete Eb[a], null) }, rb.langData = e("moment.langData is deprecated. Use moment.localeData instead.", function (a) { return rb.localeData(a) }), rb.localeData = function (a) { var b; if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return rb._locale; if (!t(a)) { if (b = I(a)) return b; a = [a] } return H(a) }, rb.isMoment = function (a) { return a instanceof j || null != a && a.hasOwnProperty("_isAMomentObject") }, rb.isDuration = function (a) { return a instanceof k }; for (tb = oc.length - 1; tb >= 0; --tb) y(oc[tb]); rb.normalizeUnits = function (a) { return w(a) }, rb.invalid = function (a) { var b = rb.utc(0 / 0); return null != a ? l(b._pf, a) : b._pf.userInvalidated = !0, b }, rb.parseZone = function () { return rb.apply(null, arguments).parseZone() }, rb.parseTwoDigitYear = function (a) { return z(a) + (z(a) > 68 ? 1900 : 2e3) }, l(rb.fn = j.prototype, { clone: function () { return rb(this) }, valueOf: function () { return +this._d + 6e4 * (this._offset || 0) }, unix: function () { return Math.floor(+this / 1e3) }, toString: function () { return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ") }, toDate: function () { return this._offset ? new Date(+this) : this._d }, toISOString: function () { var a = rb(this).utc(); return 0 < a.year() && a.year() <= 9999 ? M(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : M(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]") }, toArray: function () { var a = this; return [a.year(), a.month(), a.date(), a.hours(), a.minutes(), a.seconds(), a.milliseconds()] }, isValid: function () { return F(this) }, isDSTShifted: function () { return this._a ? this.isValid() && v(this._a, (this._isUTC ? rb.utc(this._a) : rb(this._a)).toArray()) > 0 : !1 }, parsingFlags: function () { return l({}, this._pf) }, invalidAt: function () { return this._pf.overflow }, utc: function (a) { return this.zone(0, a) }, local: function (a) { return this._isUTC && (this.zone(0, a), this._isUTC = !1, a && this.add(this._d.getTimezoneOffset(), "m")), this }, format: function (a) { var b = M(this, a || rb.defaultFormat); return this.localeData().postformat(b) }, add: r(1, "add"), subtract: r(-1, "subtract"), diff: function (a, b, c) { var d, e, f = J(a, this), g = 6e4 * (this.zone() - f.zone()); return b = w(b), "year" === b || "month" === b ? (d = 432e5 * (this.daysInMonth() + f.daysInMonth()), e = 12 * (this.year() - f.year()) + (this.month() - f.month()), e += (this - rb(this).startOf("month") - (f - rb(f).startOf("month"))) / d, e -= 6e4 * (this.zone() - rb(this).startOf("month").zone() - (f.zone() - rb(f).startOf("month").zone())) / d, "year" === b && (e /= 12)) : (d = this - f, e = "second" === b ? d / 1e3 : "minute" === b ? d / 6e4 : "hour" === b ? d / 36e5 : "day" === b ? (d - g) / 864e5 : "week" === b ? (d - g) / 6048e5 : d), c ? e : n(e) }, from: function (a, b) { return rb.duration({ to: this, from: a }).locale(this.locale()).humanize(!b) }, fromNow: function (a) { return this.from(rb(), a) }, calendar: function (a) { var b = a || rb(), c = J(b, this).startOf("day"), d = this.diff(c, "days", !0), e = -6 > d ? "sameElse" : -1 > d ? "lastWeek" : 0 > d ? "lastDay" : 1 > d ? "sameDay" : 2 > d ? "nextDay" : 7 > d ? "nextWeek" : "sameElse"; return this.format(this.localeData().calendar(e, this)) }, isLeapYear: function () { return D(this.year()) }, isDST: function () { return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone() }, day: function (a) { var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay(); return null != a ? (a = cb(a, this.localeData()), this.add(a - b, "d")) : b }, month: mb("Month", !0), startOf: function (a) { switch (a = w(a)) { case "year": this.month(0); case "quarter": case "month": this.date(1); case "week": case "isoWeek": case "day": this.hours(0); case "hour": this.minutes(0); case "minute": this.seconds(0); case "second": this.milliseconds(0) } return "week" === a ? this.weekday(0) : "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this }, endOf: function (a) { return a = w(a), this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms") }, isAfter: function (a, b) { return b = "undefined" != typeof b ? b : "millisecond", +this.clone().startOf(b) > +rb(a).startOf(b) }, isBefore: function (a, b) { return b = "undefined" != typeof b ? b : "millisecond", +this.clone().startOf(b) < +rb(a).startOf(b) }, isSame: function (a, b) { return b = b || "ms", +this.clone().startOf(b) === +J(a, this).startOf(b) }, min: e("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function (a) { return a = rb.apply(null, arguments), this > a ? this : a }), max: e("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function (a) { return a = rb.apply(null, arguments), a > this ? this : a }), zone: function (a, b) { var c, d = this._offset || 0; return null == a ? this._isUTC ? d : this._d.getTimezoneOffset() : ("string" == typeof a && (a = P(a)), Math.abs(a) < 16 && (a = 60 * a), !this._isUTC && b && (c = this._d.getTimezoneOffset()), this._offset = a, this._isUTC = !0, null != c && this.subtract(c, "m"), d !== a && (!b || this._changeInProgress ? s(this, rb.duration(d - a, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, rb.updateOffset(this, !0), this._changeInProgress = null)), this) }, zoneAbbr: function () { return this._isUTC ? "UTC" : "" }, zoneName: function () { return this._isUTC ? "Coordinated Universal Time" : "" }, parseZone: function () { return this._tzm ? this.zone(this._tzm) : "string" == typeof this._i && this.zone(this._i), this }, hasAlignedHourOffset: function (a) { return a = a ? rb(a).zone() : 0, (this.zone() - a) % 60 === 0 }, daysInMonth: function () { return A(this.year(), this.month()) }, dayOfYear: function (a) { var b = wb((rb(this).startOf("day") - rb(this).startOf("year")) / 864e5) + 1; return null == a ? b : this.add(a - b, "d") }, quarter: function (a) { return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3) }, weekYear: function (a) { var b = fb(this, this.localeData()._week.dow, this.localeData()._week.doy).year; return null == a ? b : this.add(a - b, "y") }, isoWeekYear: function (a) { var b = fb(this, 1, 4).year; return null == a ? b : this.add(a - b, "y") }, week: function (a) { var b = this.localeData().week(this); return null == a ? b : this.add(7 * (a - b), "d") }, isoWeek: function (a) { var b = fb(this, 1, 4).week; return null == a ? b : this.add(7 * (a - b), "d") }, weekday: function (a) { var b = (this.day() + 7 - this.localeData()._week.dow) % 7; return null == a ? b : this.add(a - b, "d") }, isoWeekday: function (a) { return null == a ? this.day() || 7 : this.day(this.day() % 7 ? a : a - 7) }, isoWeeksInYear: function () { return B(this.year(), 1, 4) }, weeksInYear: function () { var a = this.localeData()._week; return B(this.year(), a.dow, a.doy) }, get: function (a) { return a = w(a), this[a]() }, set: function (a, b) { return a = w(a), "function" == typeof this[a] && this[a](b), this }, locale: function (b) { return b === a ? this._locale._abbr : (this._locale = rb.localeData(b), this) }, lang: e("moment().lang() is deprecated. Use moment().localeData() instead.", function (b) { return b === a ? this.localeData() : (this._locale = rb.localeData(b), this) }), localeData: function () { return this._locale } }), rb.fn.millisecond = rb.fn.milliseconds = mb("Milliseconds", !1), rb.fn.second = rb.fn.seconds = mb("Seconds", !1), rb.fn.minute = rb.fn.minutes = mb("Minutes", !1), rb.fn.hour = rb.fn.hours = mb("Hours", !0), rb.fn.date = mb("Date", !0), rb.fn.dates = e("dates accessor is deprecated. Use date instead.", mb("Date", !0)), rb.fn.year = mb("FullYear", !0), rb.fn.years = e("years accessor is deprecated. Use year instead.", mb("FullYear", !0)), rb.fn.days = rb.fn.day, rb.fn.months = rb.fn.month, rb.fn.weeks = rb.fn.week, rb.fn.isoWeeks = rb.fn.isoWeek, rb.fn.quarters = rb.fn.quarter, rb.fn.toJSON = rb.fn.toISOString, l(rb.duration.fn = k.prototype, { _bubble: function () { var a, b, c, d = this._milliseconds, e = this._days, f = this._months, g = this._data, h = 0; g.milliseconds = d % 1e3, a = n(d / 1e3), g.seconds = a % 60, b = n(a / 60), g.minutes = b % 60, c = n(b / 60), g.hours = c % 24, e += n(c / 24), h = n(nb(e)), e -= n(ob(h)), f += n(e / 30), e %= 30, h += n(f / 12), f %= 12, g.days = e, g.months = f, g.years = h }, abs: function () { return this._milliseconds = Math.abs(this._milliseconds), this._days = Math.abs(this._days), this._months = Math.abs(this._months), this._data.milliseconds = Math.abs(this._data.milliseconds), this._data.seconds = Math.abs(this._data.seconds), this._data.minutes = Math.abs(this._data.minutes), this._data.hours = Math.abs(this._data.hours), this._data.months = Math.abs(this._data.months), this._data.years = Math.abs(this._data.years), this }, weeks: function () { return n(this.days() / 7) }, valueOf: function () { return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * z(this._months / 12) }, humanize: function (a) { var b = eb(this, !a, this.localeData()); return a && (b = this.localeData().pastFuture(+this, b)), this.localeData().postformat(b) }, add: function (a, b) { var c = rb.duration(a, b); return this._milliseconds += c._milliseconds, this._days += c._days, this._months += c._months, this._bubble(), this }, subtract: function (a, b) { var c = rb.duration(a, b); return this._milliseconds -= c._milliseconds, this._days -= c._days, this._months -= c._months, this._bubble(), this }, get: function (a) { return a = w(a), this[a.toLowerCase() + "s"]() }, as: function (a) { var b, c; if (a = w(a), b = this._days + this._milliseconds / 864e5, "month" === a || "year" === a) return c = this._months + 12 * nb(b), "month" === a ? c : c / 12; switch (b += ob(this._months / 12), a) { case "week": return b / 7; case "day": return b; case "hour": return 24 * b; case "minute": return 24 * b * 60; case "second": return 24 * b * 60 * 60; case "millisecond": return 24 * b * 60 * 60 * 1e3; default: throw new Error("Unknown unit " + a) } }, lang: rb.fn.lang, locale: rb.fn.locale, toIsoString: e("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", function () { return this.toISOString() }), toISOString: function () { var a = Math.abs(this.years()), b = Math.abs(this.months()), c = Math.abs(this.days()), d = Math.abs(this.hours()), e = Math.abs(this.minutes()), f = Math.abs(this.seconds() + this.milliseconds() / 1e3); return this.asSeconds() ? (this.asSeconds() < 0 ? "-" : "") + "P" + (a ? a + "Y" : "") + (b ? b + "M" : "") + (c ? c + "D" : "") + (d || e || f ? "T" : "") + (d ? d + "H" : "") + (e ? e + "M" : "") + (f ? f + "S" : "") : "P0D" }, localeData: function () { return this._locale } }); for (tb in fc) fc.hasOwnProperty(tb) && pb(tb.toLowerCase()); rb.duration.fn.asMilliseconds = function () { return this.as("ms") }, rb.duration.fn.asSeconds = function () { return this.as("s") }, rb.duration.fn.asMinutes = function () { return this.as("m") }, rb.duration.fn.asHours = function () { return this.as("h") }, rb.duration.fn.asDays = function () { return this.as("d") }, rb.duration.fn.asWeeks = function () { return this.as("weeks") }, rb.duration.fn.asMonths = function () { return this.as("M") }, rb.duration.fn.asYears = function () { return this.as("y") }, rb.locale("en", { ordinal: function (a) { var b = a % 10, c = 1 === z(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th"; return a + c } }), Gb ? module.exports = rb : "function" == typeof define && define.amd ? (define("moment", function (a, b, c) { return c.config && c.config() && c.config().noGlobal === !0 && (vb.moment = sb), rb }), qb(!0)) : qb() }).call(this);