const timeFormatter = (timeZone) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  });

const dateFormatter = (timeZone) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    timeZone,
  });

const resolveTimeFormatter = (timeZone) => {
  try {
    return timeFormatter(timeZone);
  } catch {
    return timeFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }
};

const resolveDateFormatter = (timeZone) => {
  try {
    return dateFormatter(timeZone);
  } catch {
    return dateFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }
};

const startClock = () => {
  const localTimeEl = document.querySelector("[data-local-clock]");
  const localDateEl = document.querySelector("[data-local-date]");
  const clockCards = Array.from(document.querySelectorAll("[data-clock-item]"));

  const clocks = clockCards.map((card) => ({
    card,
    cityEl: card.querySelector(".city"),
    timeEl: card.querySelector(".time"),
    dateEl: card.querySelector(".date"),
    timeZone: card.dataset.tz,
  }));

  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let localTimeFmt = resolveTimeFormatter(localTimeZone);
  let localDateFmt = resolveDateFormatter(localTimeZone);

  const update = () => {
    const now = new Date();
    if (localTimeEl) {
      localTimeEl.textContent = localTimeFmt.format(now);
    }
    if (localDateEl) {
      localDateEl.textContent = localDateFmt.format(now);
    }
    clocks.forEach((clock) => {
      const formatter = resolveTimeFormatter(clock.timeZone);
      const dateFmt = resolveDateFormatter(clock.timeZone);
      clock.timeEl.textContent = formatter.format(now);
      clock.dateEl.textContent = dateFmt.format(now);
    });
  };

  update();
  return setInterval(update, 1000);
};

document.addEventListener("DOMContentLoaded", () => {
  const timerId = startClock();
  window.addEventListener("beforeunload", () => clearInterval(timerId));
});
