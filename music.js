if (!window.bgMusic) {
  window.bgMusic = new Audio("kyrie.mp3");
  window.bgMusic.loop = true;
  window.bgMusic.volume = 0.20;
}

const music = window.bgMusic;

const savedTime = sessionStorage.getItem("musicTime");
if (savedTime && !isNaN(savedTime)) {
  music.currentTime = parseFloat(savedTime);
}

music.play().catch(() => {
});

setInterval(() => {
  sessionStorage.setItem("musicTime", music.currentTime);
}, 500);

window.addEventListener("beforeunload", () => {
  sessionStorage.setItem("musicTime", music.currentTime);
});