document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle");
  const themeToggle = document.getElementById("toggle-theme") || document.createElement("button");

  // === ESTIMASI CUACA ===
const API_KEY = 'ISI_DENGAN_API_KEY_MU'; // <-- Ganti dengan API key dari OpenWeatherMap
const weatherBoxes = document.querySelectorAll(".weather-estimate");

weatherBoxes.forEach(box => {
  const location = box.dataset.location || "Lombok";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric&lang=id`)
    .then(res => res.json())
    .then(data => {
      const temp = data.main?.temp;
      const desc = data.weather?.[0]?.description;
      if (temp && desc) {
        box.textContent = `Prakiraan cuaca: ${desc}, ${temp}°C`;
      } else {
        box.textContent = `Cuaca tidak tersedia`;
      }
    })
    .catch(() => {
      box.textContent = `Gagal memuat cuaca`;
    });
});


  // Buat wrapper tombol di kanan atas
  const topRightWrapper = document.createElement("div");
  topRightWrapper.style.position = "absolute";
  topRightWrapper.style.top = "1rem";
  topRightWrapper.style.right = "1rem";
  topRightWrapper.style.display = "flex";
  topRightWrapper.style.gap = "0.5rem";
  topRightWrapper.style.zIndex = "1000";

  // Styling umum tombol aksesibilitas
  const buttonStyle = btn => {
    btn.style.fontSize = "1.8rem";
    btn.style.padding = "0.6rem";
    btn.style.border = "none";
    btn.style.borderRadius = "0.5rem";
    btn.style.cursor = "pointer";
    btn.style.background = "rgba(0,0,0,0.05)";
  };

  // Tombol dark mode 🌙
  themeToggle.id = "toggle-theme";
  themeToggle.textContent = "🌙";
  themeToggle.title = "Ubah tema gelap/terang";
  buttonStyle(themeToggle);

  // Tombol bahasa 🇬🇧
  const langToggle = document.createElement("button");
  langToggle.id = "toggle-lang";
  langToggle.textContent = "🇬🇧";
  langToggle.title = "Ubah bahasa Indonesia / Inggris";
  buttonStyle(langToggle);

  // Tombol buta warna 👓
  const colorblindToggle = document.createElement("button");
  colorblindToggle.id = "toggle-colorblind";
  colorblindToggle.textContent = "👓";
  colorblindToggle.title = "Mode Buta Warna";
  buttonStyle(colorblindToggle);

  topRightWrapper.append(themeToggle, langToggle, colorblindToggle);
  document.body.appendChild(topRightWrapper);

  // Bahasa
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

  function updateLanguage() {
    document.querySelectorAll("[data-id][data-en]").forEach(el => {
      el.textContent = el.dataset[currentLang] || el.textContent;
    });
    searchInput.placeholder = translations[currentLang].search;
    const galleryHeader = document.getElementById("gallery-title");
    if (galleryHeader) galleryHeader.textContent = translations[currentLang].galleryTitle;
  }

  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "id" ? "en" : "id";
    langToggle.textContent = currentLang === "id" ? "🇬🇧" : "🇮🇩";
    updateLanguage();
  });

  // Input pencarian
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = translations[currentLang].search;
  searchInput.style.margin = "1rem";
  searchInput.style.padding = "0.5rem";
  searchInput.style.fontSize = "1rem";
  searchInput.style.width = "90%";
  searchInput.style.maxWidth = "400px";
  searchInput.style.display = "block";
  searchInput.style.marginInline = "auto";
  document.body.insertBefore(searchInput, document.body.firstChild);

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    circles.forEach(circle => {
      const targetId = circle.getAttribute("data-target");
      const targetCard = document.getElementById(targetId);
      const text = targetCard?.textContent.toLowerCase() || "";
      if (text.includes(query)) {
        circle.style.display = "inline-block";
        circle.classList.add("fade-in");
      } else {
        circle.style.display = "none";
      }
    });
  });

  // Fade-in animasi
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

  // Modal galeri
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <div class="modal-progress-container"></div>
      <div class="modal-images-wrapper"><div class="modal-images"></div></div>
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

  let currentIndex = 0, slides = [], autoScrollTimer, progressIntervals = [];

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
      if (width >= 100) clearInterval(interval);
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
  window.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  circles.forEach(circle => {
    circle.addEventListener("click", () => {
      const targetId = circle.getAttribute("data-target");
      const targetCard = document.getElementById(targetId);
      const images = targetCard?.querySelectorAll("img") || [];
      const paragraphs = targetCard?.querySelectorAll("p") || [];
      slides = Array.from(images).map((img, i) => ({
        image: img.src,
        text: paragraphs[i]?.textContent || "",
        text_en: paragraphs[i]?.dataset.en || paragraphs[i]?.textContent || ""
      }));
      updateModal();
      modal.style.display = "flex";
    });
  });

  // 🌙 DARK MODE
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // 👓 COLORBLIND MODE
  if (localStorage.getItem("colorblind") === "true") {
    document.body.classList.add("colorblind-mode");
  }

  colorblindToggle.addEventListener("click", () => {
    document.body.classList.toggle("colorblind-mode");
    const isEnabled = document.body.classList.contains("colorblind-mode");
    localStorage.setItem("colorblind", isEnabled);
  });

  updateLanguage();
});

// === SHARE TO SOCIAL MEDIA ===
const shareButtons = document.querySelectorAll(".share-buttons");

shareButtons.forEach(buttonGroup => {
  const card = buttonGroup.closest(".info-card");
  const locationId = card?.id || "";
  const locationName = card.querySelector("p")?.textContent || "Destinasi Lombok";
  const shareText = `Lihat destinasi wisata Lombok: ${locationName}`;
  const url = window.location.href + `#${locationId}`;

  // WhatsApp
  buttonGroup.querySelector(".share-wa")?.setAttribute("href", `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`);
  // Instagram (tidak bisa langsung post, arahkan ke profil)
  buttonGroup.querySelector(".share-ig")?.setAttribute("href", `https://www.instagram.com/`);
  // Telegram
  buttonGroup.querySelector(".share-tg")?.setAttribute("href", `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`);
  // Twitter
  buttonGroup.querySelector(".share-tw")?.setAttribute("href", `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`);
  // Facebook
  buttonGroup.querySelector(".share-fb")?.setAttribute("href", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  // TikTok (hanya bisa arahkan ke upload, tidak langsung share konten)
  buttonGroup.querySelector(".share-tt")?.setAttribute("href", `https://www.tiktok.com/upload`);
});
