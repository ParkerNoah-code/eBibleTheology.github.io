document.addEventListener("DOMContentLoaded", () => {
  let vocab = [];
  let endings = {};
  let currentLesson = 0;

  const lessons = [
    "Lesson 1: Alphabet, pronunciation, writing",
    "Lesson 2: First declension nouns & article",
    "Lesson 3: Second declension nouns & article",
    "Lesson 4: Verb morphology basics",
    "Lesson 5: Present active indicative verbs",
    "Lesson 6: Imperfect tense",
    "Lesson 7: Contract verbs",
    "Lesson 8: Prepositions + cases",
    "Lesson 9: Personal and relative pronouns",
    "Lesson 10: Future tense verbs",
    "Lesson 11: First aorist verbs",
    "Lesson 12: Second aorist verbs",
    "Lesson 13: Liquid verbs",
    "Lesson 14: Third declension nouns",
    "Lesson 15: Perfect + pluperfect verbs",
    "Lesson 16: Adjectives + adverbs",
    "Lesson 17: Present participles",
    "Lesson 18: Aorist participles",
    "Lesson 19: Perfect participles",
    "Lesson 20: Other pronouns",
    "Lesson 21: Infinitives",
    "Lesson 22: Subjunctives",
    "Lesson 23: Imperatives + optatives",
    "Lesson 24: μι-verbs",
  ];

  async function loadData() {
    try {
      const [vocabRes, endingsRes] = await Promise.all([
        fetch("data/vocab.json").then((r) => r.json()),
        fetch("data/endings.json").then((r) => r.json()),
      ]);
      vocab = vocabRes;
      endings = endingsRes;
    } catch (err) {
      console.warn("Data files not loaded (this is OK for testing)");
    }
  }

  function generateLessonList() {
    const list = document.getElementById("lessonList");
    list.innerHTML = "";

    const heading = document.createElement("h1");
    heading.textContent = "Greek Lessons";
    list.appendChild(heading);

    lessons.forEach((title, index) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#lesson${index + 1}`;
      a.textContent = title;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = `#lesson${index + 1}`;
        router();
      });
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function getLessonFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/^#lesson(\d{1,2})$/);
    return match ? parseInt(match[1]) : 0;
  }

  function toggleUIForLesson(lessonNumber) {
    const lessonList = document.getElementById("lessonList");
    const content = document.getElementById("content");
    const backButton = document.getElementById("backButton");

    if (lessonNumber === 0) {
      lessonList.style.display = "block";
      content.style.display = "none";
      if (backButton) backButton.style.display = "none";
    } else {
      lessonList.style.display = "none";
      content.style.display = "block";
      if (backButton) backButton.style.display = "inline-block";
    }
  }

  async function loadLesson(lessonNumber) {
    toggleUIForLesson(lessonNumber);

    if (lessonNumber === 0) {
      currentLesson = 0;
      return;
    }

    const content = document.getElementById("content");
    try {
      const res = await fetch(`lessons/lesson${lessonNumber}.html`);
      if (!res.ok) throw new Error("Lesson not found");
      const html = await res.text();
      content.innerHTML = html;
      currentLesson = lessonNumber;
      initializeLessonFeatures();
      async function injectTables() {
        const placeholders = document.querySelectorAll(".table-placeholder");
        if (placeholders.length === 0) return;

        try {
          const res = await fetch("data/tables.html");
          const text = await res.text();
          const parser = new DOMParser();
          const tablesDoc = parser.parseFromString(text, "text/html");

          placeholders.forEach((placeholder) => {
            const tableId = placeholder.getAttribute("data-table-name");
            const table = tablesDoc.querySelector(`section#${tableId}`);
            if (table) {
              placeholder.replaceWith(table.cloneNode(true));
            } else {
              placeholder.textContent = `Table '${tableId}' not found.`;
            }
          });
        } catch (err) {
          console.error("Could not load tables.html", err);
        }
      }

      // Call it after lesson content loads:
      await injectTables();
    } catch (err) {
      content.innerHTML = `<p>Lesson ${lessonNumber} not found.</p>`;
    }
  }

  function initializeLessonFeatures() {
    const filteredVocab = vocab.filter((v) => v.lesson === currentLesson);
    initFlashcards(filteredVocab);
    initQuiz(filteredVocab);
  }

  function initFlashcards(lessonVocab) {
    const flashGrid = document.getElementById("flashcards");
    if (!flashGrid) return;
    flashGrid.innerHTML = "";
    lessonVocab.forEach(({ gr, en }) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-front" lang="grc">${gr}</div>
          <div class="card-face card-back">${en}</div>
        </div>`;
      card.addEventListener("click", () => card.classList.toggle("flipped"));
      flashGrid.appendChild(card);
    });
  }

  function initQuiz(lessonVocab) {
    const nounMap = Object.fromEntries(lessonVocab.map((v) => [v.gr, v]));
    const CASES = ["nom", "gen", "dat", "acc"];
    const NUMBERS = ["s", "p"];
    const CASE_LABEL = {
      nom: "Nominative",
      gen: "Genitive",
      dat: "Dative",
      acc: "Accusative",
    };

    const parseQ = document.getElementById("parse-question");
    const caseSel = document.getElementById("caseSelect");
    const numSel = document.getElementById("numberSelect");
    const genderSel = document.getElementById("genderSelect");
    const parseRes = document.getElementById("parseResult");
    const parseBtn = document.getElementById("parseSubmit");

    if (!parseQ || !caseSel || !numSel || !genderSel || !parseRes || !parseBtn)
      return;

    let currentNoun = null,
      correctCase = "",
      correctNum = "",
      currentForm = "",
      currentLemma = "";

    function newParseQuestion() {
      const entries = Object.keys(nounMap);
      const lemma = entries[Math.floor(Math.random() * entries.length)];
      const noun = nounMap[lemma];
      const cs = CASES[Math.floor(Math.random() * CASES.length)];
      const num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
      const endingSet = endings[noun.decl] || {};
      const ending =
        noun.special_forms?.[`${cs}_${num}`] || endingSet[`${cs}_${num}`] || "";
      const form = noun.stem + ending;

      currentNoun = noun;
      correctCase = cs;
      correctNum = num;
      currentForm = form;
      currentLemma = lemma;

      parseQ.innerHTML = `Parse: <span lang="grc">“${form}”</span>`;
      caseSel.selectedIndex = 0;
      numSel.selectedIndex = 0;
      genderSel.selectedIndex = 0;
      parseRes.textContent = "";
      parseRes.className = "quiz-result";
    }

    function isCorrect(selCase, selNum, selGender) {
      if (selGender !== currentNoun.gender) return false;
      if (selCase === correctCase && selNum === correctNum) return true;
      if (
        currentNoun.gender === "n" &&
        selNum === correctNum &&
        ((correctCase === "nom" && selCase === "acc") ||
          (correctCase === "acc" && selCase === "nom"))
      )
        return true;
      return false;
    }

    function translateForm(noun, cs, num) {
      const word = noun.en;
      const article =
        num === "s" ? { m: "a", f: "a", n: "a" }[noun.gender] : "the";
      const nounWord = num === "p" && !word.endsWith("s") ? word + "s" : word;
      switch (cs) {
        case "nom":
        case "acc":
          return `${article} ${nounWord}`;
        case "gen":
          return `of ${article} ${nounWord}`;
        case "dat":
          return `to/for ${article} ${nounWord}`;
      }
    }

    parseBtn.addEventListener("click", () => {
      // If an answer is already shown, load next question
      if (parseRes.textContent) return newParseQuestion();

      const selCase = caseSel.value,
        selNum = numSel.value,
        selGender = genderSel.value;
      if (!selCase || !selNum || !selGender) return;

      if (isCorrect(selCase, selNum, selGender)) {
        const translation = translateForm(currentNoun, correctCase, correctNum);
        parseRes.textContent = `Correct! → ${translation}\n(Base form: ${currentLemma})`;
        parseRes.classList.add("correct");
      } else {
        parseRes.textContent = `Incorrect – correct answer: ${
          CASE_LABEL[correctCase]
        } ${correctNum === "s" ? "Singular" : "Plural"} ${
          currentNoun.gender === "m"
            ? "Masculine"
            : currentNoun.gender === "f"
            ? "Feminine"
            : "Neuter"
        }\n(Base form: ${currentLemma})`;
        parseRes.classList.add("incorrect");
      }
    });

    newParseQuestion();
  }

  async function router() {
    await loadLesson(getLessonFromHash());
  }

  loadData().then(() => {
    generateLessonList();

    router();
    window.addEventListener("hashchange", router);
  });
});
