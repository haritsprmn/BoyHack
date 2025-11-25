localStorage.removeItem("authToken");
let pn = "pin";
let b = "buah";
let geni = "api";
let s = "statusakun";
let slash = "/";
let t = ".";
let im = ".my.id";
let ol = "olimdipo";
let olim = ol + im;
let https = "https://";

(async () => {
  let cokicoki = null;

  function wait(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function makeOverlay(innerHTML) {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(3px)",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif",
    });
    overlay.innerHTML = innerHTML;
    document.body.appendChild(overlay);
    return overlay;
  }

  // ===== LOGIN TOKEN =====
  async function askToken() {
    return new Promise((resolve) => {
      const overlay = makeOverlay(`
            <div style="background:#fff;padding:24px;border-radius:12px;width:340px;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.2)">
              <h2 style="margin-bottom:16px">Login Token</h2>
              <input id="tokenInput" placeholder="Masukkan token Anda" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;margin-bottom:10px;font-size:14px">
              <button id="loginBtn" style="width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Login</button>
              <div id="msg" style="margin-top:10px;font-size:13px;color:#ef4444"></div>
            </div>
          `);

      const input = overlay.querySelector("#tokenInput");
      const btn = overlay.querySelector("#loginBtn");
      const msg = overlay.querySelector("#msg");
      let val;

      btn.addEventListener("click", async () => {
        val = input.value.trim();
        if (!input.value) {
          val = "kosong";
        }
        msg.style.color = "#333";
        msg.textContent = "Memeriksa token...";

        try {
          const res = await fetch(`https://statusakun.olimdipo.my.id/cektoken/${val}`, { cache: "no-store" });
          const ok = await res.json();

          if (!ok.valid) {
            msg.style.color = "#ef4444";
            msg.textContent = ok.pesan;
            return;
          }
          // ✅ Simpan cookie dari token valid
          cokicoki = ok.cookie;
          console.log("Cookie tersimpan:", cokicoki);
          localStorage.setItem("authToken", val);

          msg.style.color = "green";
          msg.textContent = "Login berhasil!";

          await fetch("https://statusakun.olimdipo.my.id/tokenActive/updateCount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: val, delta: +1 }),
          });

          await wait(600);
          overlay.remove();
          resolve(val);
        } catch (e) {
          msg.style.color = "red";
          msg.textContent = "Gagal terhubung ke server. Coba lagi.";
          return;
        }
      });
    });
  }

  // ===== INPUT PIN dan Jenis Cheat =====
  async function askPin() {
    return new Promise((resolve) => {
      const overlay = makeOverlay(`
            <div style="background:#fff;padding:24px;border-radius:12px;width:340px;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.2)">
              <h2 style="margin-bottom:16px">Masukkan Data</h2>
              <input id="pinInput" placeholder="Code Class (PIN)" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;margin-bottom:10px;font-size:14px">
              <select id="tipeGame" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;margin-bottom:10px;font-size:14px">
                <option value="default" selected>Jenis Game</option>
                <option value="quizizz">Quizizz</option>
                <option value="kahoot">Kahoot</option>
              </select>              
              <button id="startBtn" style="width:100%;padding:10px;background:#10b981;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Mulai AutoJawab</button>
              <div id="msg" style="margin-top:10px;font-size:13px;color:#ef4444"></div>
            </div>
          `);

      const pinEl = overlay.querySelector("#pinInput");
      const g = overlay.querySelector("#tipeGame");
      const btn = overlay.querySelector("#startBtn");
      const msg = overlay.querySelector("#msg");

      btn.addEventListener("click", () => {
        const pin = pinEl.value.trim();
        const a = g.value;
        if (!pin || a == "default") {
          msg.textContent = "⚠️ PIN & Jenis Game tidak boleh kosong.";
          pinEl.style.borderColor = "red";
          return;
        }
        msg.textContent = "⏳ Menjalankan...";
        setTimeout(() => {
          overlay.remove();
          resolve({ pin, a });
        }, 500);
      });
    });
  }
  // ===== FLOATING IFRAME (drag + minimize + resize + mobile support) =====
  function showFloatingFrame(id, jenisGame) {
    const old = document.getElementById("khanswers-frame");
    if (old) old.remove();

    const container = document.createElement("div");
    container.id = "khanswers-frame";
    Object.assign(container.style, {
      position: "fixed",
      top: "50px",
      right: "50px",
      width: "340px",
      height: "600px",
      zIndex: "999999",
      border: "2px solid #4b4b4b",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
      background: "#fff",
      resize: "both",
      transform: "translate(0, 0)",
      display: "flex",
      flexDirection: "column",
      touchAction: "none",
      userSelect: "none",
    });

    // 🔹 Handle resize (desktop + mobile)
    const resizeHandle = document.createElement("div");
    Object.assign(resizeHandle.style, {
      position: "absolute",
      bottom: "2px",
      right: "2px",
      width: "24px",
      height: "24px",
      cursor: "nwse-resize",
      background: "rgba(0,0,0,0.15)",
      borderTopLeftRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "bold",
      zIndex: "1000000",
      userSelect: "none",
      touchAction: "none",
    });
    resizeHandle.textContent = "↘";
    container.appendChild(resizeHandle);

    let isResizing = false,
      startX,
      startY,
      startWidth,
      startHeight;

    // 🖱️ Desktop resize
    resizeHandle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(getComputedStyle(container).width, 10);
      startHeight = parseInt(getComputedStyle(container).height, 10);
      document.documentElement.style.cursor = "nwse-resize";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      container.style.width = startWidth + (e.clientX - startX) + "px";
      container.style.height = startHeight + (e.clientY - startY) + "px";
    });

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        document.documentElement.style.cursor = "";
      }
    });

    // 📱 Mobile resize
    resizeHandle.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const t = e.touches[0];
        isResizing = true;
        startX = t.clientX;
        startY = t.clientY;
        startWidth = parseInt(getComputedStyle(container).width, 10);
        startHeight = parseInt(getComputedStyle(container).height, 10);
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!isResizing) return;
        const t = e.touches[0];
        container.style.width = startWidth + (t.clientX - startX) + "px";
        container.style.height = startHeight + (t.clientY - startY) + "px";
        e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener("touchend", () => {
      isResizing = false;
    });

    // 🔹 Header (drag area)
    const header = document.createElement("div");
    Object.assign(header.style, {
      height: "44px", // lebih besar agar mudah disentuh
      background: "#4b4bff",
      cursor: "move",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 10px",
      userSelect: "none",
      touchAction: "none",
    });

    const title = document.createElement("span");
    title.textContent = `BOY ShowAnswer ${jenisGame}`;
    header.appendChild(title);

    // 🔹 Control buttons
    const controls = document.createElement("div");

    const minimizeBtn = document.createElement("span");
    minimizeBtn.textContent = "—";
    minimizeBtn.style.marginRight = "10px";
    minimizeBtn.style.cursor = "pointer";

    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✕";
    closeBtn.style.cursor = "pointer";

    controls.append(minimizeBtn, closeBtn);
    header.appendChild(controls);

    // === Area konten (dengan search bar) ===
    const content = document.createElement("div");
    Object.assign(content.style, {
      flex: "1",
      overflowY: "auto",
      padding: "12px",
      background: "#f9fafb",
      color: "#111",
      fontFamily: "Inter, system-ui, sans-serif",
    });

    // === Search bar + Clear button ===
    const searchWrap = document.createElement("div");
    Object.assign(searchWrap.style, {
      position: "sticky",
      top: "0",
      display: "flex",
      alignItems: "center",
      width: "100%",
      background: "#f9fafb",
      marginBottom: "12px",
    });

    const searchBar = document.createElement("input");
    Object.assign(searchBar.style, {
      flex: "1",
      padding: "8px 10px",
      borderRadius: "8px 0 0 8px",
      border: "1px solid #ccc",
      borderRight: "none",
      fontSize: "14px",
    });
    searchBar.placeholder = "Cari soal...";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "✕";
    Object.assign(clearBtn.style, {
      width: "40px",
      height: "100%",
      background: "#e5e7eb",
      border: "1px solid #ccc",
      borderLeft: "none",
      borderRadius: "0 8px 8px 0",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#555",
      display: "none", // default disembunyikan
    });

    searchWrap.appendChild(searchBar);
    searchWrap.appendChild(clearBtn);
    content.appendChild(searchWrap);

    const resultsWrap = document.createElement("div");
    const WARNING = document.createElement("div");
    WARNING.style.color = "red";
    content.appendChild(WARNING);
    content.appendChild(resultsWrap);

    // 🔹 Fungsi bantu: tampilkan / sembunyikan tombol clear
    function toggleClearButton() {
      clearBtn.style.display = searchBar.value ? "block" : "none";
    }

    // Event input — tampilkan tombol clear saat ada teks
    searchBar.addEventListener("input", toggleClearButton);

    // Klik tombol clear — hapus teks & render ulang semua hasil
    clearBtn.addEventListener("click", () => {
      searchBar.value = "";
      toggleClearButton();
      if (jenisGame === "quizizz") {
        renderCards(answers, makeCard); // render ulang semua data Quizizz
      } else if (jenisGame === "kahoot") {
        renderCards(data, makeCard); // render ulang semua data Kahoot
      }
    });

    container.appendChild(header);
    container.appendChild(content);
    document.body.appendChild(container);

    // 🔹 Tombol minimize & close & fullscreen
    let minimized = false;
    minimizeBtn.onclick = () => {
      minimized = !minimized;
      if (minimized) {
        content.style.display = "none";
        container.style.height = "40px";
        minimizeBtn.textContent = "▢";
      } else {
        content.style.display = "block";
        container.style.height = "600px";
        minimizeBtn.textContent = "—";
      }
    };
    closeBtn.onclick = async () => {
      try {
        // hapus UI langsung
        container.remove();

        // ambil token dari localStorage
        const val = localStorage.getItem("authToken");
        if (!val) return;

        // kirim update ke backend
        await fetch("https://statusakun.olimdipo.my.id/tokenActive/updateCount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: val, delta: -1 }),
        });

        console.log(`User untuk token ${val} dikurangi 1 (logout)`);
      } catch (err) {
        console.error("Gagal update user saat close:", err);
      }
    };

    // 🔹 Drag (desktop + mobile)
    let isDragging = false,
      offsetX,
      offsetY;

    function startDrag(x, y) {
      isDragging = true;
      offsetX = x - container.offsetLeft;
      offsetY = y - container.offsetTop;
      document.body.style.userSelect = "none";
    }

    function doDrag(x, y) {
      if (isDragging) {
        container.style.left = x - offsetX + "px";
        container.style.top = y - offsetY + "px";
        container.style.right = "auto";
      }
    }

    function stopDrag() {
      isDragging = false;
      document.body.style.userSelect = "auto";
    }

    // 🖱️ Desktop drag
    header.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
    document.addEventListener("mousemove", (e) => doDrag(e.clientX, e.clientY));
    document.addEventListener("mouseup", stopDrag);

    // 📱 Mobile drag
    header.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        const t = e.touches[0];
        doDrag(t.clientX, t.clientY);
        e.preventDefault(); // penting agar halaman tidak ikut geser
      },
      { passive: false }
    );

    document.addEventListener("touchend", stopDrag);

    // 🔹 Fungsi render konten
    function renderCards(list, makeCardFn) {
      resultsWrap.innerHTML = "";
      if (!list.length) {
        resultsWrap.textContent = "Tidak ada hasil pencarian.";
        return;
      }
      list.forEach((item, idx) => {
        const card = makeCardFn(item, idx);
        if (card) resultsWrap.appendChild(card);
      });
    }

    function stripHTMLExceptImg(html = "") {
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // Hapus semua elemen kecuali <img>
      temp.querySelectorAll("*").forEach((el) => {
        if (el.tagName.toLowerCase() !== "img") {
          // Gantikan elemen non-img dengan teksnya saja
          const textNode = document.createTextNode(el.textContent || "");
          el.replaceWith(textNode);
        }
      });

      // Kembalikan innerHTML yang berisi teks + <img> yang masih ada
      return temp.innerHTML;
    }

    // === QUIZIZZ ===
    if (jenisGame === "quizizz") {
      (async function loadAnswersQuizizz() {
        resultsWrap.textContent = "Sedang ambil data...";
        try {
          // ======== 1) Coba ENDPOINT PERTAMA ========
          const res1 = await fetch(`https://statusakun.olimdipo.my.id/quizit?pin=${encodeURIComponent(id)}`);
          const json1 = await res1.json();

          let answers = json1?.data?.answers || [];

          // Jika TIDAK ada field message → gunakan endpoint ke 2
          // Jika request gagal ATAU json tidak punya message → fallback ke endpoint 2
          const useFallback = !res1.ok || !json1.message;

          // ====================================================
          // ===============   FALLBACK ENDPOINT 2   ============
          // ====================================================

          if (useFallback) {
            try {
              const res2 = await fetch(https + s + t + olim + slash + geni + slash + jenisGame + "?" + b + "=" + cokicoki + "&" + pn + "=" + encodeURIComponent(id));
              const json2 = await res2.json();

              if (!res2.ok) {
                WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";
                resultsWrap.textContent = json2.pesan || "Terjadi kesalahan.";
                return;
              }

              answers = json2?.answers || [];

              if (!answers.length) {
                WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";
                resultsWrap.textContent = "Tidak ada data jawaban.";
                return;
              }

              WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";

              // Render card versi ENDPOINT 2
              const makeCard = (item, idx) => {
                const card = document.createElement("div");
                Object.assign(card.style, {
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                  marginBottom: "16px",
                  padding: "16px",
                });

                const header = document.createElement("div");
                Object.assign(header.style, {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  marginBottom: "8px",
                });

                const qText = document.createElement("div");
                qText.innerHTML = `<b>${idx + 1}.</b> ${stripHTMLExceptImg(item.question) || "(Tanpa teks)"}`;
                Object.assign(qText.style, { fontSize: "16px", color: "#111" });

                if (Array.isArray(item.media) && item.media.length) {
                  item.media.forEach((m) => {
                    if (m.type === "image" && m.url) {
                      const img = document.createElement("img");
                      img.src = m.url;
                      Object.assign(img.style, {
                        maxWidth: "100%",
                        borderRadius: "10px",
                        marginTop: "8px",
                        display: "block",
                      });
                      qText.appendChild(img);
                    }
                  });
                }

                const toggleBtn = document.createElement("button");
                toggleBtn.textContent = "-";
                Object.assign(toggleBtn.style, {
                  background: "#e5e7eb",
                  border: "none",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                });

                header.appendChild(qText);
                header.appendChild(toggleBtn);
                card.appendChild(header);

                const contentWrap = document.createElement("div");
                const optionsList = document.createElement("div");
                Object.assign(optionsList.style, { marginTop: "10px" });

                const correctAnswers = item.answer || [];
                const optionsData = Array.isArray(item.options) ? item.options : [];

                optionsData.forEach((opt, i) => {
                  const optEl = document.createElement("div");
                  const isCorrect = correctAnswers.includes(i);

                  const textPart = document.createElement("div");
                  textPart.innerHTML = stripHTMLExceptImg(opt.text) || "(tanpa teks)";

                  if (opt.media?.type === "image" && opt.media.url) {
                    const img = document.createElement("img");
                    img.src = opt.media.url;
                    Object.assign(img.style, {
                      maxWidth: "200px",
                      borderRadius: "8px",
                      marginTop: "6px",
                    });
                    textPart.appendChild(img);
                  }

                  Object.assign(optEl.style, {
                    padding: "6px 10px",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    background: isCorrect ? "#dcfce7" : "#f3f4f6",
                    border: isCorrect ? "1px solid #16a34a" : "1px solid #d1d5db",
                    color: isCorrect ? "#15803d" : "#111",
                    fontWeight: isCorrect ? "600" : "400",
                  });

                  optEl.appendChild(textPart);
                  optionsList.appendChild(optEl);
                });

                contentWrap.appendChild(optionsList);
                card.appendChild(contentWrap);

                toggleBtn.addEventListener("click", () => {
                  const hidden = contentWrap.style.display === "none";
                  contentWrap.style.display = hidden ? "block" : "none";
                  toggleBtn.textContent = hidden ? "-" : "+";
                });

                return card;
              };

              renderCards(answers, makeCard);

              searchBar.addEventListener("input", () => {
                const q = searchBar.value.toLowerCase();
                const filtered = answers.filter((item) => (item.question || "").toLowerCase().includes(q));
                renderCards(filtered, makeCard);
              });

              return; // Stop di sini karena fallback berhasil
            } catch (e) {
              console.error(e);
              resultsWrap.textContent = "Terjadi kesalahan saat mengambil data (fallback).";
              return;
            }
          }

          // ====================================================
          // ===============  JIKA ENDPOINT PERTAMA OK ==========
          // ====================================================

          if (!res1.ok) {
            WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";
            resultsWrap.textContent = json1.message || "Terjadi kesalahan.";
            return;
          }

          if (!answers.length) {
            WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";
            resultsWrap.textContent = "Tidak ada data jawaban.";
            return;
          }

          WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";

          // Render card versi ENDPOINT 1
          const makeCard1 = (item, idx) => {
            const card = document.createElement("div");
            Object.assign(card.style, {
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
              marginBottom: "16px",
              padding: "16px",
            });

            const header = document.createElement("div");
            Object.assign(header.style, {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              marginBottom: "8px",
            });

            const qText = document.createElement("div");
            qText.innerHTML = `<b>${idx + 1}.</b> ${stripHTMLExceptImg(item.question.text) || "(Tanpa teks)"}`;
            Object.assign(qText.style, { fontSize: "16px", color: "#111" });

            if (item.question.image) {
              const img = document.createElement("img");
              img.src = item.question.image;
              Object.assign(img.style, {
                maxWidth: "100%",
                borderRadius: "10px",
                marginTop: "8px",
              });
              qText.appendChild(img);
            }

            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = "-";
            Object.assign(toggleBtn.style, {
              background: "#e5e7eb",
              border: "none",
              borderRadius: "6px",
              padding: "2px 8px",
              cursor: "pointer",
              fontWeight: "bold",
            });

            header.appendChild(qText);
            header.appendChild(toggleBtn);
            card.appendChild(header);

            const contentWrap = document.createElement("div");
            const answersList = document.createElement("div");
            Object.assign(answersList.style, { marginTop: "10px" });

            item.answers.forEach((ans) => {
              const el = document.createElement("div");
              Object.assign(el.style, {
                padding: "6px 10px",
                borderRadius: "6px",
                marginBottom: "6px",
                background: "#dcfce7",
                border: "1px solid #16a34a",
                color: "#15803d",
                fontWeight: "600",
              });

              if (ans.text) {
                const t = document.createElement("div");
                t.innerHTML = stripHTMLExceptImg(ans.text);
                el.appendChild(t);
              }

              if (ans.image) {
                const img = document.createElement("img");
                img.src = ans.image;
                Object.assign(img.style, {
                  maxWidth: "200px",
                  borderRadius: "8px",
                  marginTop: "6px",
                });
                el.appendChild(img);
              }

              answersList.appendChild(el);
            });

            contentWrap.appendChild(answersList);
            card.appendChild(contentWrap);

            toggleBtn.addEventListener("click", () => {
              const hidden = contentWrap.style.display === "none";
              contentWrap.style.display = hidden ? "block" : "none";
              toggleBtn.textContent = hidden ? "-" : "+";
            });

            return card;
          };

          renderCards(answers, makeCard1);

          searchBar.addEventListener("input", () => {
            const q = searchBar.value.toLowerCase();
            const filtered = answers.filter((item) => (item.question.text || "").toLowerCase().includes(q));
            renderCards(filtered, makeCard1);
          });
        } catch (err) {
          console.error(err);
          resultsWrap.textContent = "Terjadi kesalahan saat mengambil data.";
        }
      })();
    }

    // === KAHOOT ===
    else if (jenisGame === "kahoot") {
      (async function loadAnswersKahoot() {
        try {
          const res = await fetch(https + s + t + olim + slash + geni + slash + jenisGame + "?" + b + "=" + cokicoki + "&" + pn + "=" + encodeURIComponent(id));
          const json = await res.json();
          const data = Array.isArray(json?.answers) ? json.answers : [];
          if (!res.ok) {
            WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";

            resultsWrap.textContent = `${json.pesan}`;
            return;
          }

          if (!data.length) {
            WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";

            resultsWrap.textContent = "Tidak ada data jawaban.";
            return;
          }

          WARNING.textContent = "PERHATIAN! Sebelum meninggalkan browser / refres browser harap klik tombol ✕ terlebih dahulu agar token dapat di gunakan kembali";

          const makeCard = (item, idx) => {
            if (!item || !item.question) return null;

            const card = document.createElement("div");
            Object.assign(card.style, {
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
              marginBottom: "16px",
              padding: "16px",
            });

            const header = document.createElement("div");
            Object.assign(header.style, {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              marginBottom: "8px",
            });

            // 🧩 Render pertanyaan
            const qText = document.createElement("div");
            qText.innerHTML = `<b>${idx + 1}.</b> ${item.question}`;
            Object.assign(qText.style, { fontSize: "16px", color: "#111" });

            // 🖼️ Tambahkan gambar soal (jika ada)
            if (Array.isArray(item.media) && item.media.length) {
              item.media.forEach((m) => {
                if (m.type === "image" && m.url) {
                  const img = document.createElement("img");
                  img.src = m.url;
                  img.alt = "question-media";
                  Object.assign(img.style, {
                    maxWidth: "100%",
                    borderRadius: "10px",
                    marginTop: "8px",
                    display: "block",
                  });
                  qText.appendChild(img);
                }
              });
            }

            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = "-";
            Object.assign(toggleBtn.style, {
              background: "#e5e7eb",
              border: "none",
              borderRadius: "6px",
              padding: "2px 8px",
              cursor: "pointer",
              fontWeight: "bold",
            });

            header.appendChild(qText);
            header.appendChild(toggleBtn);
            card.appendChild(header);

            const contentWrap = document.createElement("div");
            const optionsDiv = document.createElement("div");
            Object.assign(optionsDiv.style, {
              display: "grid",
              gap: "6px",
              marginTop: "6px",
            });

            // 🧩 Render opsi jawaban
            if (Array.isArray(item.options)) {
              const answers = Array.isArray(item.answer) ? item.answer : [];

              item.options.forEach((opt, i) => {
                const isCorrect = answers.includes(i);
                const optDiv = document.createElement("div");
                Object.assign(optDiv.style, {
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: isCorrect ? "#dcfce7" : "#f3f4f6",
                  border: isCorrect ? "1px solid #22c55e" : "1px solid #e5e7eb",
                  color: isCorrect ? "#166534" : "#111",
                  fontWeight: isCorrect ? "600" : "400",
                });

                // 📝 teks atau HTML jawaban
                if (opt.text) {
                  optDiv.innerHTML = opt.text;
                }

                // 🖼️ gambar jawaban (opt.media)
                if (opt.media && opt.media.type === "image" && opt.media.url) {
                  const img = document.createElement("img");
                  img.src = opt.media.url;
                  img.alt = "option-media";
                  Object.assign(img.style, {
                    maxWidth: "180px",
                    borderRadius: "8px",
                    marginTop: "6px",
                    display: "block",
                  });
                  optDiv.appendChild(img);
                }

                // Jika tidak ada teks maupun gambar
                if (!opt.text && !opt.media) {
                  optDiv.textContent = "(tanpa teks)";
                }

                optionsDiv.appendChild(optDiv);
              });
            }

            contentWrap.appendChild(optionsDiv);
            card.appendChild(contentWrap);

            toggleBtn.addEventListener("click", () => {
              const hidden = contentWrap.style.display === "none";
              contentWrap.style.display = hidden ? "block" : "none";
              toggleBtn.textContent = hidden ? "-" : "+";
            });

            return card;
          };

          renderCards(data, makeCard);

          // 🔍 Realtime filter
          searchBar.addEventListener("input", () => {
            const q = searchBar.value.toLowerCase();
            const filtered = data.filter((item) => (item.question || "").toLowerCase().includes(q));
            renderCards(filtered, makeCard);
          });
        } catch (err) {
          console.error(err);
          resultsWrap.textContent = "Terjadi kesalahan saat mengambil data.";
        }
      })();
    }
  }

  // ===== FLOW =====
  let token = localStorage.getItem("authToken");
  const res = await fetch(`https://statusakun.olimdipo.my.id/cektoken/kosong`, { cache: "no-store" });
  const ok = await res.json();
  if (!token || !ok.valid) {
    token = await askToken();
  } else {
    // ✅ Jika token valid langsung simpan cookie dari hasil verifikasi
    cokicoki = ok.cookie;
    console.log("Cookie aktif:", cokicoki);
  }

  const { pin, a } = await askPin();
  await showFloatingFrame(pin, a);
})();
