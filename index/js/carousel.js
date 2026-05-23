document.addEventListener("DOMContentLoaded", function () {
  // Seleziona elementi del carousel
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".indicator");
  const carouselContainer = document.querySelector(".carousel-container");

  let currentSlide = 0;
  let slideInterval;
  const intervalTime = 5000; // Intervallo fisso di 5 secondi

  // Funzione per mostrare una slide specifica
  function showSlide(index) {
    // Rimuove la classe active da tutte le slides
    slides.forEach((slide) => {
      slide.classList.remove("active");
    });

    // Rimuove la classe active da tutti gli indicatori
    indicators.forEach((indicator) => {
      indicator.classList.remove("active");
    });

    // Aggiunge la classe active alla slide corrente
    slides[index].classList.add("active");
    indicators[index].classList.add("active");

    // Aggiorna l'indice della slide corrente
    currentSlide = index;
  }

  // Funzione per passare alla slide successiva
  function nextSlide() {
    let newIndex = currentSlide + 1;
    if (newIndex >= slides.length) {
      newIndex = 0; // Torna alla prima slide
    }
    showSlide(newIndex);
  }

  // Inizia la transizione automatica
  function startSlideInterval() {
    slideInterval = setInterval(nextSlide, intervalTime);
  }

  // Ferma la transizione automatica
  function stopSlideInterval() {
    clearInterval(slideInterval);
  }

  // Event listener per gli indicatori
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      if (currentSlide !== index) {
        showSlide(index);
        // Non stoppiamo l'intervallo automatico, lasciamo che continui
        // Riavviamo l'intervallo per sincronizzarlo con la nuova slide
        stopSlideInterval();
        startSlideInterval();
      }
    });
  });

  // Pausa/riavvia la transizione automatica quando il mouse è sopra/fuori dal carousel
  carouselContainer.addEventListener("mouseenter", () => {
    stopSlideInterval();
  });

  carouselContainer.addEventListener("mouseleave", () => {
    startSlideInterval();
  });

  // Pausa la transizione quando la finestra non è attiva
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSlideInterval();
    } else {
      startSlideInterval();
    }
  });

  // Inizializza il carousel
  showSlide(0);
  startSlideInterval();

  // Precarica le immagini per evitare ritardi durante le transizioni
  function preloadImages() {
    slides.forEach((slide) => {
      const bgImage = slide.querySelector(".carousel-image");
      if (bgImage && bgImage.style.backgroundImage) {
        const url = bgImage.style.backgroundImage.replace(
          /url\(['"]?([^'"]*)['"]?\)/g,
          "$1"
        );

        if (url) {
          const img = new Image();
          img.src = url;
        }
      }
    });
  }

  preloadImages();
});
