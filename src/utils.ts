import { Countdown } from "./types";

// Thank you The KNVB (CC BY-SA 4.0)
// https://stackoverflow.com/a/54257394/1372424
export function startCountdown(target: Date, result: Countdown, onReach: Function) {
  const updateTimer = () => {
    const toDate = new Date();
    let diffMS = target.getTime() / 1000 - toDate.getTime() / 1000;
    const diffHr = Math.floor(diffMS / 3600);
    diffMS = diffMS - diffHr * 3600;
    const diffMi = Math.floor(diffMS / 60);
    diffMS = diffMS - diffMi * 60;
    const diffS = Math.floor(diffMS);
    result.hours = (diffHr < 10) ? "0" + diffHr : diffHr;
    result.minutes = (diffMi < 10) ? "0" + diffMi : diffMi;
    result.seconds = (diffS < 10) ? "0" + diffS : diffS;

    if (result.hours === "00" && result.minutes === "00" && result.seconds === "00") {
      onReach()
    }
  }
  updateTimer()
  return setInterval(updateTimer, 1000);
}