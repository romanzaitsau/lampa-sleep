# Lampa Autoexit (Android)

On Android, Lampa keeps the screen on, so the device's sleep timer never fires while it is open.
This plugin closes Lampa after 30 minutes without a remote key press; the device's own sleep timer
then puts it to sleep (and HDMI-CEC turns the TV off).

- Never fires during playback: the countdown runs only while the video is paused, has ended, or the player is closed.
- Shows a notice one minute before exiting; any key press cancels it.
- Works only in the Lampa Android app (it needs `AndroidJS.exit`); on other platforms it does nothing.

## Install

Lampa → Settings → Extensions → Add plugin:

```
https://romanzaitsau.github.io/lampa-sleep/autoexit.js
```

For a quick test, `autoexit-test.js` exits after 2 minutes (notice 30 seconds before).

The timings are at the top of `autoexit.js`: `IDLE_MIN` (minutes without a key press) and `WARN_SEC` (notice).
