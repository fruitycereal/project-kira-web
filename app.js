import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { SUPABASE_ANON_KEY } from "./config.js";

const SUPABASE_URL = "https://xcrzzwbjsofjrguvbhfc.supabase.co"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function saveName(name) {
  try {
    await supabase.from("names").insert([{ name }]);
  } catch (err) {
    console.error("Error writing database logs:", err);
  }
}

// Global crossfade layout route dispatcher
function showPage(id) {
  const pages = document.querySelectorAll(".page");
  
  pages.forEach(page => {
    if (page.id === id) {
      page.classList.add("active");
      setTimeout(() => page.classList.add("visible"), 20);
    } else {
      page.classList.remove("visible");
      setTimeout(() => {
        if (!page.classList.contains("visible")) {
          page.classList.remove("active");
        }
      }, 1000);
    }
  });

  if (id === "page-end1") {
    initEnd1Page();
  } else if (id === "page-end2") {
    initEnd2Page();
  }
}

window.showPage = showPage;

// Audio Configuration Matrix
const music = document.getElementById("bg-music");
music.volume = 0.17;

document.addEventListener("click", () => {
  music.play().catch(() => {});
}, { once: true });

// Route Progression: Enter -> Rules Screen (4s delay) -> Entername Panel
document.getElementById("enter-btn").addEventListener("click", () => {
  showPage("page-rules");
  setTimeout(() => {
    showPage("page-entername");
  }, 4000);
});

// Capture and sanitize raw submission inputs
document.getElementById("name-submit-btn").addEventListener("click", () => {
  const nameInput = document.getElementById("nameBox").value.trim();
  if (!nameInput) return;

  sessionStorage.setItem("username", nameInput);
  showPage("page-writename");
  runWritingSequence(nameInput);
});

// Separate, clean function to handle the cinematic transition safely

async function finishSequence(name) {
  console.log("finishSequence called");
  const pencil = document.getElementById("pencil");
  const black = document.getElementById("black-screen");
  const video = document.getElementById("intro-video");

  if (name.trim()) {
    saveName(name).catch(err => console.error("Background save failed:", err));
  }

  setTimeout(() => {
    black.style.opacity = "1";

    setTimeout(() => {
      pencil.style.opacity = "0";

      const writePage = document.getElementById("page-writename");
      writePage.classList.remove("visible", "active");

      video.classList.add("active-play");
      video.currentTime = 0;
      video.muted = false;

      const music = document.getElementById("bg-music");
      if (music) music.volume = 0.17;

      setTimeout(() => {
        console.log("About to play video");

        video.play()
          .then(() => {
            console.log("Video started");

            // Fade the black screen away
            setTimeout(() => {
              black.style.opacity = "0";
            }, 300);

            if (music && music.paused) {
              music.play().catch(() => {});
            }
          })
          .catch(err => {
            console.error("Video failed:", err);
          });

      }, 50);

      video.addEventListener("ended", () => {
        video.classList.remove("active-play");
        showPage("page-end1");
      }, { once: true });

    }, 800);
  }, 1700);
}

// Section 4 Animation Runner Sequence
function runWritingSequence(name) {
  const nameElement = document.getElementById("writename-text");
  const pencil = document.getElementById("pencil");

  nameElement.textContent = "";
  pencil.style.opacity = "0";

  function movePencil() {
    const rect = nameElement.getBoundingClientRect();
    const pencilRect = pencil.getBoundingClientRect();

    const pencilX = rect.right - pencilRect.width * 0.12;
    const pencilY = rect.top + rect.height * 0.42 - pencilRect.height * 0.58;

    pencil.style.left = `${pencilX}px`;
    pencil.style.top = `${pencilY}px`;
  }

  setTimeout(() => {
    pencil.style.opacity = "1";
    let index = 0;

    const typing = setInterval(() => {
      if (index >= name.length) {
        clearInterval(typing);
        finishSequence(name); // Call the clean, external function
        return;
      }

      nameElement.textContent += name[index];
      index++;
      movePencil();
    }, 50);
    
    const handleResize = () => {
      if (nameElement.textContent.length > 0) movePencil();
    };
    window.addEventListener("resize", handleResize);
  }, 3000);
}

// ==========================================================================
// Section 5 & 6 Asynchronous Data Compilers
// ==========================================================================

async function initEnd1Page() {
  document.getElementById("end1-name").style.opacity = "0";
  document.getElementById("end1-details").style.opacity = "0";
  document.getElementById("end1-justice").style.opacity = "0";

  try {
    const { data } = await supabase
      .from("names")
      .select("*")
      .order("time", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return;
    const latest = data[0];

    document.getElementById("end1-name").textContent = latest.name;

    const time = new Date(latest.time);
    time.setSeconds(time.getSeconds() + 40);
    document.getElementById("end1-time").textContent = `Time: ${time.toLocaleTimeString()}`;

    setTimeout(() => {
      document.getElementById("end1-name").style.opacity = "1";
    }, 500);

    setTimeout(() => {
      document.getElementById("end1-details").style.opacity = "1";
    }, 1500);

    setTimeout(() => {
      document.getElementById("end1-justice").style.opacity = "1";
    }, 2500);

    setTimeout(() => {
      showPage("page-end2");
    }, 6000);

  } catch (err) {
    console.error("End1 data compilation error:", err);
  }
}

async function initEnd2Page() {
  try {
    const { data } = await supabase
      .from("names")
      .select("*")
      .order("time", { ascending: false });

    if (!data) return;

    const archiveList = document.getElementById("archive-list");
    archiveList.innerHTML = ""; 

    data.forEach(record => {
      const row = document.createElement("div");
      row.textContent = record.name; 
      archiveList.appendChild(row);
    });

    document.getElementById("total-records").textContent = `Total records: ${data.length}`;
  } catch (err) {
    console.error("Failed parsing system log data archive sets:", err);
  }
}

document.getElementById("rewrite-btn").addEventListener("click", () => {
  sessionStorage.removeItem("username");
  document.getElementById("nameBox").value = "";
  
  const video = document.getElementById("intro-video");
  video.style.display = "block";
  video.style.opacity = "0";
  
  showPage("page-entername");
});