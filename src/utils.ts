import { Countdown } from "./types";

// Thank you The KNVB (CC BY-SA 4.0)
// https://stackoverflow.com/a/54257394/1372424
export function startCountdown(result: Countdown) {
  return setInterval(function() {
    var toDate = new Date();
    var tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    var diffMS = tomorrow.getTime() / 1000 - toDate.getTime() / 1000;
    var diffHr = Math.floor(diffMS / 3600);
    diffMS = diffMS - diffHr * 3600;
    var diffMi = Math.floor(diffMS / 60);
    diffMS = diffMS - diffMi * 60;
    var diffS = Math.floor(diffMS);
    result.hours = (diffHr < 10) ? "0" + diffHr : diffHr;
    result.minutes = (diffMi < 10) ? "0" + diffMi : diffMi;
    result.seconds = (diffS < 10) ? "0" + diffS : diffS;
  }, 1000);
}