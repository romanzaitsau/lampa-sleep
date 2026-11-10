/*
 * Lampa Autoexit (Android).
 * On Android, Lampa keeps the screen on (FLAG_KEEP_SCREEN_ON), so the device's own sleep timer never fires inside it.
 * This plugin closes Lampa after IDLE_MIN minutes without a remote key press, but only while no video is playing
 * (paused, ended, or the player is closed). The device's own sleep timer then puts it to sleep.
 * WARN_SEC seconds before exiting it shows a notice; any key press cancels it.
 */
(function () {
    'use strict';

    if (window.autoexit_plugin_loaded) return;
    window.autoexit_plugin_loaded = true;

    var IDLE_MIN = 30;   // minutes without a key press
    var WARN_SEC = 60;   // notice shown this long before exiting
    var CHECK_MS = 10000;

    var last = Date.now();
    var warned = false;

    function reset() {
        last = Date.now();
        warned = false;
    }

    function videoPlaying() {
        var list = document.querySelectorAll('video');
        for (var i = 0; i < list.length; i++) {
            var v = list[i];
            if (!v.paused && !v.ended && v.readyState > 2) return true;
        }
        return false;
    }

    function canExit() {
        return window.AndroidJS && typeof window.AndroidJS.exit === 'function';
    }

    function exitApp() {
        try { if (Lampa.Player && Lampa.Player.opened && Lampa.Player.opened()) Lampa.Player.close(); } catch (e) {}
        try { window.AndroidJS.exit(); } catch (e) {}
    }

    function tick() {
        if (videoPlaying()) { reset(); return; }

        var idle = Date.now() - last;
        var limit = IDLE_MIN * 60000;

        if (idle >= limit) {
            exitApp();
        } else if (!warned && idle >= limit - WARN_SEC * 1000) {
            warned = true;
            try { Lampa.Noty.show('No activity: Lampa will close in ' + WARN_SEC + ' seconds. Press any button to stay.'); } catch (e) {}
        }
    }

    function start() {
        if (!canExit()) return; // not the Lampa Android app: do nothing

        try { Lampa.Keypad.listener.follow('keydown', reset); } catch (e) {}
        window.addEventListener('keydown', reset, true);
        window.addEventListener('mousedown', reset, true);
        window.addEventListener('focus', reset);

        setInterval(tick, CHECK_MS);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });
})();
