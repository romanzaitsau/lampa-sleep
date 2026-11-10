/*
 * Lampa «Автовыход» (Android).
 * Lampa на Android держит экран включённым (FLAG_KEEP_SCREEN_ON), поэтому системный сон в ней не срабатывает.
 * Плагин закрывает Lampa после IDLE_MIN минут без нажатий на пульт, если видео не играет
 * (на паузе, закончилось или плеер закрыт). Дальше приставку усыпляет её собственный таймер сна.
 * За WARN_SEC секунд до выхода показывает предупреждение; любое нажатие его отменяет.
 */
(function () {
    'use strict';

    if (window.autoexit_plugin_loaded) return;
    window.autoexit_plugin_loaded = true;

    var IDLE_MIN = 2;    // минут без нажатий
    var WARN_SEC = 30;   // предупреждение до выхода
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
            try { Lampa.Noty.show('Нет активности: Lampa закроется через 30 секунд. Нажмите любую кнопку, чтобы остаться.'); } catch (e) {}
        }
    }

    function start() {
        if (!canExit()) return; // не Android-приложение Lampa: ничего не делаем

        try { Lampa.Keypad.listener.follow('keydown', reset); } catch (e) {}
        window.addEventListener('keydown', reset, true);
        window.addEventListener('mousedown', reset, true);
        window.addEventListener('focus', reset);

        setInterval(tick, CHECK_MS);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });
})();
