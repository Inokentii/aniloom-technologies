const MAX_YEARS = 100;
const WEEKS_PER_YEAR = 52;
const DEFAULT_BIRTH = "2000-01-01";
const LONGEVITY_INTERVAL = 5;
const LONGEVITY_START = 60;

const longevityStats = {
  "United States": {
    male: { 60: 0.87, 65: 0.79, 70: 0.68, 75: 0.56, 80: 0.43, 85: 0.28, 90: 0.15, 95: 0.06 },
    female: { 60: 0.92, 65: 0.86, 70: 0.78, 75: 0.67, 80: 0.54, 85: 0.39, 90: 0.23, 95: 0.11 },
  },
  Spain: {
    male: { 60: 0.91, 65: 0.84, 70: 0.75, 75: 0.65, 80: 0.53, 85: 0.38, 90: 0.24, 95: 0.12 },
    female: { 60: 0.95, 65: 0.9, 70: 0.83, 75: 0.75, 80: 0.66, 85: 0.52, 90: 0.35, 95: 0.18 },
  },
  Ukraine: {
    male: { 60: 0.75, 65: 0.61, 70: 0.47, 75: 0.33, 80: 0.21, 85: 0.11, 90: 0.05 },
    female: { 60: 0.88, 65: 0.78, 70: 0.65, 75: 0.5, 80: 0.35, 85: 0.22, 90: 0.11 },
  },
  Canada: {
    male: { 60: 0.9, 65: 0.83, 70: 0.73, 75: 0.62, 80: 0.49, 85: 0.34, 90: 0.2, 95: 0.09 },
    female: { 60: 0.94, 65: 0.89, 70: 0.81, 75: 0.72, 80: 0.6, 85: 0.46, 90: 0.3, 95: 0.15 },
  },
  Japan: {
    male: { 60: 0.93, 65: 0.87, 70: 0.8, 75: 0.71, 80: 0.6, 85: 0.46, 90: 0.31, 95: 0.17 },
    female: { 60: 0.97, 65: 0.94, 70: 0.89, 75: 0.83, 80: 0.74, 85: 0.6, 90: 0.43, 95: 0.26 },
  },
  Australia: {
    male: { 60: 0.92, 65: 0.85, 70: 0.76, 75: 0.65, 80: 0.52, 85: 0.36, 90: 0.21, 95: 0.1 },
    female: { 60: 0.95, 65: 0.9, 70: 0.83, 75: 0.74, 80: 0.62, 85: 0.47, 90: 0.3, 95: 0.15 },
  },
  Germany: {
    male: { 60: 0.89, 65: 0.82, 70: 0.72, 75: 0.62, 80: 0.49, 85: 0.34, 90: 0.2, 95: 0.09 },
    female: { 60: 0.94, 65: 0.88, 70: 0.8, 75: 0.71, 80: 0.6, 85: 0.45, 90: 0.29, 95: 0.14 },
  },
  "United Kingdom": {
    male: { 60: 0.9, 65: 0.83, 70: 0.74, 75: 0.64, 80: 0.51, 85: 0.35, 90: 0.2, 95: 0.09 },
    female: { 60: 0.94, 65: 0.89, 70: 0.82, 75: 0.73, 80: 0.61, 85: 0.46, 90: 0.3, 95: 0.15 },
  },
  "New Zealand": {
    male: { 60: 0.91, 65: 0.84, 70: 0.75, 75: 0.65, 80: 0.52, 85: 0.36, 90: 0.2, 95: 0.09 },
    female: { 60: 0.95, 65: 0.9, 70: 0.83, 75: 0.74, 80: 0.62, 85: 0.47, 90: 0.3, 95: 0.14 },
  },
};

const countries = Object.keys(longevityStats).sort();

const clampDate = (value) => {
  const min = new Date("1920-01-01T00:00:00");
  const max = new Date();
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) return new Date(DEFAULT_BIRTH);
  if (candidate < min) return min;
  if (candidate > max) return max;
  return candidate;
};

const weeksBetween = (start, end) => {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor((end - start) / msInWeek);
};

const buildWeekElement = (isCompleted, isCurrent) => {
  const week = document.createElement("span");
  week.className = "week" + (isCompleted ? " week--complete" : "") + (isCurrent ? " week--current" : "");
  return week;
};

const buildLongevityRow = (year, probability) => {
  const wrapper = document.createElement("div");
  wrapper.className = "longevity-row";
  wrapper.setAttribute("role", "presentation");
  const label = document.createElement("span");
  label.className = "longevity-label";
  label.textContent = `${year} yrs survival`;
  wrapper.appendChild(label);

  const bar = document.createElement("div");
  bar.className = "longevity-bar";
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", "100");
  bar.setAttribute("aria-valuenow", Math.round(probability * 100).toString());

  const fill = document.createElement("div");
  fill.className = "longevity-fill";
  fill.style.width = `${(probability * 100).toFixed(0)}%`;
  bar.appendChild(fill);

  const value = document.createElement("span");
  value.className = "longevity-value";
  value.textContent = `${Math.round(probability * 100)}%`;

  wrapper.appendChild(bar);
  wrapper.appendChild(value);
  return wrapper;
};

const renderLifeGrid = () => {
  const birthInput = document.getElementById("birth-date");
  const countrySelect = document.getElementById("country");
  const sexInput = document.querySelector("input[name='sex']:checked");
  const lifeGrid = document.getElementById("life-grid");
  if (!birthInput || !countrySelect || !sexInput || !lifeGrid) return;

  const birthDate = clampDate(birthInput.value || DEFAULT_BIRTH);
  const now = new Date();
  const totalWeeks = weeksBetween(birthDate, now);
  const currentYear = Math.min(MAX_YEARS - 1, Math.floor(totalWeeks / WEEKS_PER_YEAR));
  const currentWeekIndex = totalWeeks % WEEKS_PER_YEAR;

  const stats = longevityStats[countrySelect.value][sexInput.value];

  lifeGrid.innerHTML = "";

  for (let year = 0; year < MAX_YEARS; year += 1) {
    const row = document.createElement("div");
    row.className = "life-row";
    row.dataset.year = year.toString();

    const label = document.createElement("span");
    label.className = "life-year";
    label.textContent = `${year + 1}`;
    row.appendChild(label);

    const weeksWrap = document.createElement("div");
    weeksWrap.className = "weeks-wrap";

    for (let week = 0; week < WEEKS_PER_YEAR; week += 1) {
      const weeksElapsed = year * WEEKS_PER_YEAR + week;
      const isCompleted = weeksElapsed < totalWeeks;
      const isCurrent = year === currentYear && week === currentWeekIndex;
      weeksWrap.appendChild(buildWeekElement(isCompleted, isCurrent));
    }

    row.appendChild(weeksWrap);
    lifeGrid.appendChild(row);

    if (year + 1 >= LONGEVITY_START && (year + 1 - LONGEVITY_START) % LONGEVITY_INTERVAL === 0) {
      const milestoneAge = year + 1;
      const probability = stats[milestoneAge];
      if (probability !== undefined) {
        lifeGrid.appendChild(buildLongevityRow(milestoneAge, probability));
      }
    }
  }

  const currentRow = lifeGrid.querySelector(`.life-row[data-year="${currentYear}"]`);
  if (currentRow) {
    const offset = currentRow.offsetTop - lifeGrid.clientHeight / 2 + currentRow.clientHeight / 2;
    lifeGrid.scrollTo({
      top: Math.max(0, offset),
      behavior: "smooth",
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const countrySelect = document.getElementById("country");
  if (!countrySelect) return;

  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });
  countrySelect.value = countrySelect.options[0].value;

  const birthInput = document.getElementById("birth-date");
  if (birthInput) {
    birthInput.value = DEFAULT_BIRTH;
  }

  document.addEventListener("change", (event) => {
    if (
      event.target &&
      (event.target.id === "birth-date" ||
        event.target.id === "country" ||
        (event.target.name === "sex" && event.target.type === "radio"))
    ) {
      renderLifeGrid();
    }
  });

  renderLifeGrid();
});
