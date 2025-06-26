document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle");
  const themeToggle = document.getElementById("toggle-theme");

  // Buat wrapper tombol di kanan atas
  const topRightWrapper = document.createElement("div");
  topRightWrapper.style.position = "absolute";
  topRightWrapper.style.top = "1rem";
  topRightWrapper.style.right = "1rem";
  topRightWrapper.style.display = "flex";
  topRightWrapper.style.gap = "0.5rem";

  // Ubah ikon mode gelap 🌙 / ☀️
  themeToggle.textContent = "🌙";
  themeToggle.title = "Ubah tema gelap/terang";

  // Tambahkan tombol bahasa dengan ikon
  const langToggle = document.createElement("button");
  langToggle.id = "toggle-lang";
  langToggle.textContent = "🇬🇧";
  langToggle.title = "Ubah bahasa Indonesia / Inggris";

  // Tambahkan tombol mode buta warna 👓
  const colorblindToggle = document.createElement("button");
  colorblindToggle.id = "toggle-colorblind";
  colorblindToggle.textContent = "👓";
  colorblindToggle.title = "Mode Buta Warna";

  topRightWrapper.appendChild(themeToggle);
  topRightWrapper.appendChild(langToggle);
  topRightWrapper.appendChild(colorblindToggle);
  document.body.appendChild(topRightWrapper);

  let currentLang = "id";

  const translations = {
    id: {
      cuaca: "Cuaca Lombok",
      close: "Tutup",
      search: "Cari destinasi...",
      galleryTitle: "Galeri Destinasi"
    },
    en: {
      cuaca: "Weather in Lombok",
      close: "Close",
      search: "Search destinations...",
      galleryTitle: "Destination Gallery"
    }
  };

  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "id" ? "en" : "id";
    langToggle.textContent = currentLang === "id" ? "🇬🇧" : "🇮🇩";
    updateLanguage();
  });

  function updateLanguage() {
    document.querySelectorAll("[data-id][data-en]").forEach(el => {
      el.textContent = el.dataset[currentLang] || el.textContent;
    });
    searchInput.placeholder = translations[currentLang].search;
    const galleryHeader = document.getElementById("gallery-title");
    if (galleryHeader) galleryHeader.textContent = translations[currentLang].galleryTitle;
  }

  // Search bar
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = translations[currentLang].search;
  searchInput.style.margin = "1rem";
  searchInput.style.padding = "0.5rem";
  document.body.insertBefore(searchInput, document.body.firstChild);

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    circles.forEach(circle => {
      const targetId = circle.getAttribute("data-target");
      const targetCard = document.getElementById(targetId);
      const text = targetCard.textContent.toLowerCase();
      if (text.includes(query)) {
        circle.style.display = "inline-block";
        circle.classList.add("fade-in");
      } else {
        circle.style.display = "none";
      }
    });
  });

  // Animasi fade-in
  const style = document.createElement("style");
  style.textContent = `
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Modal Gallery
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <div class="modal-progress-container"></div>
      <div class="modal-images-wrapper">
        <div class="modal-images"></div>
      </div>
      <div class="modal-dots"></div>
      <button class="fullscreen-toggle">⛶</button>
    </div>
  `;
  document.body.appendChild(modal);

  const modalImagesWrapper = modal.querySelector(".modal-images-wrapper");
  const modalImages = modal.querySelector(".modal-images");
  const closeBtn = modal.querySelector(".close-btn");
  const modalDots = modal.querySelector(".modal-dots");
  const modalProgress = modal.querySelector(".modal-progress-container");
  const fullscreenBtn = modal.querySelector(".fullscreen-toggle");

  let currentIndex = 0;
  let slides = [];
  let autoScrollTimer;
  let progressIntervals = [];

  function updateSlide() {
    const width = modalImagesWrapper.clientWidth;
    modalImages.scrollTo({ left: width * currentIndex, behavior: 'smooth' });
    updateDots();
    resetProgressBars();
    animateProgress(currentIndex);
  }

  function updateDots() {
    modalDots.querySelectorAll(".dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function resetProgressBars() {
    progressIntervals.forEach(clearInterval);
    progressIntervals = [];
    modalProgress.querySelectorAll(".bar").forEach(bar => bar.style.width = "0%");
  }

  function animateProgress(index) {
    const bar = modalProgress.querySelectorAll(".bar")[index];
    let width = 0;
    const interval = setInterval(() => {
      width += 0.4;
      if (width >= 100) {
        clearInterval(interval);
      }
      bar.style.width = `${width}%`;
    }, 100);
    progressIntervals.push(interval);
  }

  function createDots() {
    modalDots.innerHTML = slides.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('');
    modalDots.querySelectorAll(".dot").forEach(dot => {
      dot.addEventListener("click", () => {
        clearInterval(autoScrollTimer);
        currentIndex = parseInt(dot.getAttribute("data-index"));
        updateSlide();
      });
    });
  }

  function createProgressBars() {
    modalProgress.innerHTML = slides.map(() => `<div class="progress"><div class="bar"></div></div>`).join('');
  }

  function updateModal() {
    modalImages.innerHTML = slides.map(slide => `
      <div class="modal-slide">
        <img src="${slide.image}" class="modal-img-story" loading="lazy" />
        <p class="modal-text" data-id="${slide.text}" data-en="${slide.text_en || slide.text}">${slide.text}</p>
      </div>
    `).join("");
    createDots();
    createProgressBars();
    currentIndex = 0;
    updateSlide();
    startAutoScroll();
  }

  function startAutoScroll() {
    clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }, 25000);
  }

  function closeModal() {
    modal.style.display = "none";
    clearInterval(autoScrollTimer);
    resetProgressBars();
  }

  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) modal.requestFullscreen();
    else document.exitFullscreen();
  });

  closeBtn.addEventListener("click", closeModal);

  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  circles.forEach(circle => {
    circle.addEventListener("click", () => {
      const targetId = circle.getAttribute("data-target");
      const targetCard = document.getElementById(targetId);
      const images = targetCard.querySelectorAll("img");
      const paragraphs = targetCard.querySelectorAll("p");
      slides = Array.from(images).map((img, i) => ({
        image: img.src,
        text: paragraphs[i]?.textContent || "",
        text_en: paragraphs[i]?.dataset.en || paragraphs[i]?.textContent || ""
      }));
      updateModal();
      modal.style.display = "flex";
    });
  });

  // 🌙 DARK MODE toggle + localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // 👓 COLORBLIND MODE toggle + localStorage
  const savedColorblind = localStorage.getItem("colorblind");
  if (savedColorblind === "true") {
    document.body.classList.add("colorblind-mode");
  }

  colorblindToggle.addEventListener("click", () => {
    document.body.classList.toggle("colorblind-mode");
    const isEnabled = document.body.classList.contains("colorblind-mode");
    localStorage.setItem("colorblind", isEnabled);
  });

  // Inisialisasi bahasa di awal
  updateLanguage();
});
