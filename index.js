"use strict";

const configuration = {
  dayNames: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  months: [
    {
      name: "January",
      days: 31,
    },
    {
      name: "February",
      days: 28,
    },
    {
      name: "March",
      days: 31,
    },
    {
      name: "April",
      days: 30,
    },
    {
      name: "May",
      days: 31,
    },
    {
      name: "June",
      days: 30,
    },
    {
      name: "July",
      days: 31,
    },
    {
      name: "August",
      days: 31,
    },
    {
      name: "September",
      days: 30,
    },
    {
      name: "October",
      days: 31,
    },
    {
      name: "November",
      days: 30,
    },
    {
      name: "December",
      days: 31,
    },
  ],
  noSchool: [ // format: ddmmyyyy
    "01092025",
    "13102025",
    "04112025",
    "27112025",
    "28112025",
    "01122025",
    "22122025",
    "23122025",
    "24122025",
    "25122025",
    "26122025",
    "29122025",
    "30122025",
    "31122025",
  ],
  year: new Date().getFullYear(),
  startWeekdayIdx: (() => {
    const jan1 = new Date(new Date().getFullYear(), 0, 1);
    return (jan1.getDay() + 6) % 7;
  })(),
  autoLeapYearForFebruary: true,
  now: new Date(),
  notes: [
    {
      date: "13102025",
      notes: ["In Service Day - No Scnjjjjjjjjjjjjjjjjhool"],
    },
  ],
};

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

const normalizeDayNames = (arr) => {
  const a = arr.slice(0, 7);
  while (a.length < 7) a.push("Unnamed Day");
  return a;
};

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const isWeekendIdx = (weekdayIdx) => weekdayIdx === 5 || weekdayIdx === 6;

const dateId = (day, monthIndex, year) =>
  `${pad2(day)}${pad2(monthIndex + 1)}${year}`;

const getDaysNotes = (date) => {
  let notes = [];
  for (const days of configuration.notes)
    if (days.date === date) notes = days.notes;

  return notes;
};

const yearTing = (year) => {
  const end = Number(String(year).at(-1));
  if (!isFinite(end)) return NaN;
  if (end === 1) return `${year}st`;
  else if (end === 2) return `${year}nd`;
  else if (end === 3) return `${year}rd`;
  else return `${year}th`;
};

function gregorianToCalendr(date, config = configuration) {
  if (!(date instanceof Date)) throw new Error("Pass a Date");

  const year = date.getFullYear();

  const months = config.months.map((m) => ({ ...m }));
  if (config.autoLeapYearForFebruary) {
    const feb = months.find((m) => m.name.toLowerCase().startsWith("feb"));
    const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    if (feb && isLeap(year)) feb.days += 1;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const doy =
    Math.floor(
      (Date.UTC(year, date.getMonth(), date.getDate()) - Date.UTC(year, 0, 1)) /
        dayMs
    ) + 1;

  let acc = 0;
  let monthIndex = -1;
  let dayInMonth = -1;
  for (let i = 0; i < months.length; i++) {
    const next = acc + (months[i].days || 0);
    if (doy <= next) {
      monthIndex = i;
      dayInMonth = doy - acc;
      break;
    }
    acc = next;
  }
  if (monthIndex === -1) {
    throw new Error(
      "Date falls outside this cálɛnðr year (check month totals)."
    );
  }

  const normalizedNames = (() => {
    const a = (config.dayNames || []).slice(0, 7);
    while (a.length < 7) a.push("Unnamed Day");
    return a;
  })();
  const weekdayIdxMon0 = (date.getDay() + 6) % 7;
  const weekdayName = normalizedNames[weekdayIdxMon0];

  const isWeekend = weekdayIdxMon0 === 5 || weekdayIdxMon0 === 6;

  const id = `${pad2(dayInMonth)}${pad2(monthIndex + 1)}${year}`;

  return {
    year,
    monthIndex,
    monthName: months[monthIndex].name,
    day: dayInMonth,
    weekdayIndex: weekdayIdxMon0,
    weekdayName,
    isWeekend,
    id,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const dayNames = normalizeDayNames(configuration.dayNames);
  const year = configuration.year;
  const months = configuration.months.map((m) => ({ ...m }));
  const today = gregorianToCalendr(configuration.now).id;

  document.getElementById("year").textContent = yearTing(year);

  if (configuration.autoLeapYearForFebruary) {
    const feb = months.find((m) => m.name.toLowerCase().startsWith("feb"));
    if (feb) feb.days = isLeap(year) ? feb.days + 1 : feb.days;
  }

  const noSchoolSet = new Set(configuration.noSchool);

  const totalDays = months.reduce((sum, m) => sum + (m.days || 0), 0);
  const totalDaysEl = document.getElementById("totalDays");
  if (totalDaysEl) {
    totalDaysEl.textContent = `There are currently ${totalDays} days in the ${year} year!`;
  }

  const calendarMain = document.querySelector("main");
  if (!calendarMain) return;

  const frag = document.createDocumentFragment();

  let weekdayIdx = configuration.startWeekdayIdx % 7;

  for (let mIdx = 0; mIdx < months.length; mIdx++) {
    const m = months[mIdx];

    const monthHeader = document.createElement("header");
    monthHeader.classList.add("month");
    monthHeader.textContent = m.name || `Month ${mIdx + 1}`;
    frag.appendChild(monthHeader);

    const header = document.createElement("section");
    header.classList.add("header");
    for (const dayName of dayNames) {
      const p = document.createElement("p");
      p.classList.add("dayName");
      p.textContent = dayName;
      header.appendChild(p);
    }
    frag.appendChild(header);

    const monthSection = document.createElement("section");
    monthSection.classList.add("days");
    monthSection.setAttribute("role", "grid");
    monthSection.setAttribute("aria-label", `${m.name} ${year}`);

    for (let i = 0; i < ((weekdayIdx % 7) + 7) % 7; i++) {
      const blank = document.createElement("div");
      blank.classList.add("blank");
      blank.setAttribute("aria-hidden", "true");
      monthSection.appendChild(blank);
    }

    for (let dayNum = 1; dayNum <= m.days; dayNum++) {
      const cell = document.createElement("div");

      const id = dateId(dayNum, mIdx, year);
      cell.id = id;
      const notes = getDaysNotes(id);

      const isWeekend = isWeekendIdx(weekdayIdx);
      const isToday = id === today;
      const isNoSchoolExplicit = noSchoolSet.has(id);
      if (isToday) cell.classList.add("today");
      else
        cell.classList.add(
          isWeekend || isNoSchoolExplicit ? "neinschule" : "schuledeigh"
        );

      const num = document.createElement("p");
      num.classList.add("day");
      num.textContent = dayNum;
      cell.appendChild(num);

      cell.setAttribute(
        "aria-label",
        `${m.name} ${dayNum}, ${year}${
          isNoSchoolExplicit ? " — No school" : isWeekend ? " — Weekend" : ""
        }`
      );
      cell.setAttribute("role", "gridcell");

      if (notes && notes.length > 0) {
        const ul = document.createElement("ul");
        for (const note of notes) {
          const li = document.createElement("li");
          li.textContent = String(note);
          ul.append(li);
        }
        cell.appendChild(ul);
      }

      monthSection.appendChild(cell);

      weekdayIdx = (weekdayIdx + 1) % 7;
    }

    frag.appendChild(monthSection);
  }

  calendarMain.appendChild(frag);
});
