
(() => {
    const stamp = document.getElementById("stamp");
    const tagline = document.getElementById("tagline");
    const intro = document.getElementById("intro");
    const hint = document.getElementById("hint");

    const heroTrack = document.getElementById("scrollTrack");
    const heroStage = document.getElementById("stage");

    const galleryTrack = document.getElementById("galleryTrack");
    const gallerySticky = document.getElementById("gallerySticky");
    const galleryWall = document.getElementById("galleryWall");

    const clamp = (v, min, max) =>
        Math.min(max, Math.max(min, v));

    /* ==========================================
       HERO STAMP ANIMATION
    ========================================== */

    function updateHero() {
        if (!stamp || !heroTrack || !heroStage) return;

        const rect = heroTrack.getBoundingClientRect();

        const total =
            heroTrack.offsetHeight - heroStage.offsetHeight;

        const p = total > 0
            ? clamp(-rect.top / total, 0, 1)
            : 0;

        const scale = p < 0.5
            ? 1 + p * 1.7
            : 1.85 + (p - 0.5) * 5.1;

        stamp.style.transform =
            `translate(-50%, -50%) scale(${scale})`;

        stamp.style.opacity =
            1 - clamp((p - 0.68) / 0.24, 0, 1);

        if (tagline) {
            tagline.style.opacity =
                1 - clamp(p / 0.26, 0, 1);

            tagline.style.transform =
                `translate(-50%, ${-p * 26}px)`;
        }

        if (hint) {
            hint.style.opacity =
                1 - clamp(p / 0.12, 0, 1);
        }

        if (intro) {
            const opacity =
                clamp((p - 0.72) / 0.2, 0, 1);

            intro.style.opacity = opacity;
            intro.style.pointerEvents =
                opacity > 0.95 ? "auto" : "none";
        }
    }

    /* ==========================================
       STATIC GALLERY ARRANGEMENT
    ========================================== */

    function arrangeGallery() {
        if (!galleryWall) return;

        const frames = [
            ...galleryWall.querySelectorAll(".wall-frame")
        ];

        const rows = [[], [], []];
        const aspectSums = [0, 0, 0];

        const gap = window.innerWidth <= 600 ? 7 : 12;
        const padding = 14;

        /* Balance images across three rows */

        frames.forEach(frame => {
            const img = frame.querySelector("img");

            if (!img || !img.naturalWidth || !img.naturalHeight) {
                return;
            }

            const aspect = img.naturalWidth / img.naturalHeight;

            let row = aspectSums.indexOf(
                Math.min(...aspectSums)
            );

            rows[row].push({
                frame,
                img,
                aspect
            });

            aspectSums[row] += aspect;
        });

        const wallWidth = galleryWall.clientWidth;

        let currentTop = 0;

        rows.forEach(row => {
            if (!row.length) return;

            const totalGaps = gap * (row.length - 1);
            const totalPadding = padding * row.length;

            const totalAspect = row.reduce(
                (sum, item) => sum + item.aspect,
                0
            );

            const rowHeight = Math.max(
                75,
                (wallWidth - totalGaps - totalPadding) / totalAspect
            );

            let currentLeft = 0;

            row.forEach(item => {
                const imageWidth = rowHeight * item.aspect;
                const frameWidth = imageWidth + padding;
                const frameHeight = rowHeight + padding;

                item.frame.style.left = `${currentLeft}px`;
                item.frame.style.top = `${currentTop}px`;
                item.frame.style.width = `${frameWidth}px`;
                item.frame.style.height = `${frameHeight}px`;

                item.img.style.width = `${imageWidth}px`;
                item.img.style.height = `${rowHeight}px`;

                currentLeft += frameWidth + gap;
            });

            currentTop += rowHeight + gap;
        });

        galleryWall.style.height =
            `${Math.max(0, currentTop - gap)}px`;
    }

    /* ==========================================
       PAGE UPDATES
    ========================================== */

    let ticking = false;

    function updatePage() {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            updateHero();
            ticking = false;
        });
    }

    function refreshGallery() {
        arrangeGallery();
    }

    window.addEventListener("scroll", updatePage, {
        passive: true
    });

    window.addEventListener("resize", refreshGallery);
    window.addEventListener("load", refreshGallery);

    if (galleryWall) {
        galleryWall.querySelectorAll("img").forEach(img => {
            if (!img.complete) {
                img.addEventListener("load", refreshGallery);
            }
        });
    }

    updateHero();
    refreshGallery();

})();
