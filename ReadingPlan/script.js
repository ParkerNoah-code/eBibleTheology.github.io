const STORAGE_KEY = "bibleReadingProgress";

let booksData = null;
let planData = null;
let progress = new Set();

document.addEventListener("DOMContentLoaded", async () => {
  booksData = await fetchJSON("books.json");
  planData = await fetchJSON("plan.json");
  loadProgress();
  generateCheckboxes();
  updateSuggestion();
  setupToggleButtons();

  // Start with OT visible only
  toggleTestament("Old");
  document.getElementById("show-old").classList.add("active");

  document.getElementById("reset-progress").addEventListener("click", () => {
    if (confirm("Reset all progress?")) {
      localStorage.removeItem(STORAGE_KEY);
      progress.clear();
      document
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => (cb.checked = false));
      updateSuggestion();
    }
  });
});

async function fetchJSON(url) {
  const response = await fetch(url);
  return await response.json();
}

function loadProgress() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(saved)) {
    progress = new Set(saved);
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...progress]));
}

function generateCheckboxes() {
  const container = document.getElementById("book-groups");
  container.innerHTML = "";

  // OLD TESTAMENT
  const otSections = ["Law", "Prophets", "Writings"];
  otSections.forEach((section) => {
    const sectionData = booksData.OldTestament[section];
    const sectionElement = document.createElement("div");
    sectionElement.className = "book-section";
    sectionElement.setAttribute("data-testament", "Old");
    sectionElement.innerHTML = `<h3>${section}</h3>`;

    if (typeof sectionData === "object" && !Array.isArray(sectionData)) {
      for (const subGroup in sectionData) {
        const groupElement = document.createElement("div");
        groupElement.innerHTML = `<h4>${subGroup}</h4>`;
        sectionData[subGroup].forEach((book) => {
          groupElement.appendChild(renderBook(book));
        });
        sectionElement.appendChild(groupElement);
      }
    } else {
      sectionData.forEach((book) => {
        sectionElement.appendChild(renderBook(book));
      });
    }

    container.appendChild(sectionElement);
  });

  // NEW TESTAMENT
  const ntElement = document.createElement("div");
  ntElement.className = "book-section";
  ntElement.setAttribute("data-testament", "New");
  ntElement.innerHTML = `<h3>New Testament</h3>`;

  for (const [groupName, books] of Object.entries(booksData.NewTestament)) {
    const groupElement = document.createElement("div");

    // Skip group headers for standalone categories
    if (groupName !== "Acts" && groupName !== "Revelation") {
      const title = document.createElement("h4");
      title.textContent = formatNTGroupTitle(groupName);
      groupElement.appendChild(title);
    }

    books.forEach((book) => {
      groupElement.appendChild(renderBook(book));
    });

    ntElement.appendChild(groupElement);
  }

  container.appendChild(ntElement);
}

function formatNTGroupTitle(name) {
  const map = {
    Gospels: "Gospels",
    PaulineEpistles: "Pauline Epistles",
    GeneralEpistles: "General Epistles",
  };
  return map[name] || name;
}

function renderBook(book) {
  const wrapper = document.createElement("div");
  wrapper.className = "book";
  const title = document.createElement("div");
  title.className = "book-title";
  title.textContent = book.name;
  wrapper.appendChild(title);

  const chaptersDiv = document.createElement("div");
  chaptersDiv.className = "chapter-checkboxes";
  for (let i = 1; i <= book.chapters; i++) {
    const label = document.createElement("label");
    const id = `${book.name} ${i}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.book = book.name;
    checkbox.dataset.chapter = i;
    checkbox.checked = progress.has(id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        progress.add(id);
      } else {
        progress.delete(id);
      }
      saveProgress();
      updateSuggestion();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(i));
    chaptersDiv.appendChild(label);
  }

  wrapper.appendChild(chaptersDiv);
  return wrapper;
}

function updateSuggestion() {
  const otSuggestion = getNextReading(planData.OldTestament);
  const ntSuggestion = getNextReading(planData.NewTestament);

  document.getElementById("ot-suggestion").textContent = otSuggestion
    ? `Old Testament: ${formatSuggestion(otSuggestion)}`
    : "Old Testament: Complete!";

  document.getElementById("nt-suggestion").textContent = ntSuggestion
    ? `New Testament: ${formatSuggestion(ntSuggestion)}`
    : "New Testament: Complete!";
}

function getNextReading(plan) {
  for (const entry of plan) {
    const { book, batchSize } = entry;
    const chapterCount = getChapterCount(book);
    for (let start = 1; start <= chapterCount; start += batchSize) {
      const end = Math.min(start + batchSize - 1, chapterCount);
      const range = [];
      for (let i = start; i <= end; i++) {
        range.push(`${book} ${i}`);
      }
      const allRead = range.every((ch) => progress.has(ch));
      if (!allRead) {
        return { book, start, end };
      }
    }
  }
  return null;
}

function getChapterCount(bookName) {
  const allBooks = [].concat(
    booksData.OldTestament.Law,
    ...Object.values(booksData.OldTestament.Prophets),
    ...Object.values(booksData.OldTestament.Writings),
    ...Object.values(booksData.NewTestament).flat()
  );
  const book = allBooks.find((b) => b.name === bookName);
  return book ? book.chapters : 0;
}

function formatSuggestion({ book, start, end }) {
  return start === end ? `${book} ${start}` : `${book} ${start}–${end}`;
}

// Toggle control logic
function setupToggleButtons() {
  const showOld = document.getElementById("show-old");
  const showNew = document.getElementById("show-new");

  showOld.addEventListener("click", () => {
    toggleTestament("Old");
    showOld.classList.add("active");
    showNew.classList.remove("active");
  });

  showNew.addEventListener("click", () => {
    toggleTestament("New");
    showNew.classList.add("active");
    showOld.classList.remove("active");
  });
}

function toggleTestament(target) {
  const sections = document.querySelectorAll(".book-section");
  sections.forEach((section) => {
    const testament = section.getAttribute("data-testament");
    if (target === "Old") {
      section.style.display = testament === "Old" ? "block" : "none";
    } else if (target === "New") {
      section.style.display = testament === "New" ? "block" : "none";
    }
  });
}
