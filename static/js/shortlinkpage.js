
// ============================================
// SHORTLY FRONTEND
// ============================================
// Saat ini masih menggunakan localStorage.
// Nanti bagian ini bisa diganti dengan API Go.
//
// Contoh:
// const API_BASE_URL = "http://localhost:8080/api";
// ============================================


const API_BASE_URL = null;


// ============================================
// STATE
// ============================================

let urls = JSON.parse(
    localStorage.getItem("shortly_urls") || "[]"
);


// ============================================
// DOM
// ============================================

const form =
    document.getElementById("urlForm");

const originalUrl =
    document.getElementById("originalUrl");

const customCode =
    document.getElementById("customCode");

const formMessage =
    document.getElementById("formMessage");

const resultSection =
    document.getElementById("resultSection");

const shortUrl =
    document.getElementById("shortUrl");

const copyButton =
    document.getElementById("copyButton");

const emptyState =
    document.getElementById("emptyState");

const urlList =
    document.getElementById("urlList");

const urlCount =
    document.getElementById("urlCount");

const statLinks =
    document.getElementById("statLinks");

const statClicks =
    document.getElementById("statClicks");

const statAverage =
    document.getElementById("statAverage");


// ============================================
// INIT
// ============================================

render();


// ============================================
// FORM
// ============================================

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        clearMessage();


        const url =
            originalUrl.value.trim();

        const alias =
            customCode.value.trim();


        if (!isValidUrl(url)) {

            showMessage(
                "Please enter a valid URL.",
                "error"
            );

            return;
        }


        if (
            alias &&
            !/^[a-zA-Z0-9-_]+$/.test(alias)
        ) {

            showMessage(
                "Alias can only contain letters, numbers, - and _.",
                "error"
            );

            return;
        }


        if (API_BASE_URL) {

            createWithBackend(
                url,
                alias
            );

        } else {

            createMockUrl(
                url,
                alias
            );

        }

    }
);


// ============================================
// MOCK CREATE
// ============================================

function createMockUrl(url, alias) {

    let code;


    if (alias) {

        const exists =
            urls.some(
                item =>
                    item.code === alias
            );


        if (exists) {

            showMessage(
                "That alias is already taken.",
                "error"
            );

            return;

        }


        code = alias;

    } else {

        code = generateCode(6);

    }


    const item = {

        id: crypto.randomUUID(),

        code,

        originalUrl: url,

        clicks: 0,

        createdAt:
            new Date().toISOString()

    };


    urls.unshift(item);

    save();

    render();

    showResult(code);

    form.reset();


    showMessage(
        "Your short link is ready.",
        "success"
    );

}


// ============================================
// BACKEND
// ============================================

async function createWithBackend(
    url,
    alias
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/urls`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        url,

                        customCode:
                            alias || null
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to create URL"
            );

        }


        const data =
            await response.json();


        showBackendResult(data);

        form.reset();


        showMessage(
            "Your short link is ready.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "error"
        );

    }

}


// ============================================
// RESULT
// ============================================

function showResult(code) {

    const link =
        `https://sho.rt/${code}`;


    shortUrl.href = link;

    shortUrl.textContent = link;


    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function showBackendResult(data) {

    shortUrl.href =
        data.shortUrl;

    shortUrl.textContent =
        data.shortUrl;


    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================
// COPY
// ============================================

copyButton.addEventListener(
    "click",
    async function () {

        try {

            await navigator.clipboard.writeText(
                shortUrl.textContent
            );


            const oldText =
                copyButton.textContent;


            copyButton.textContent =
                "Copied ✓";


            setTimeout(
                () => {

                    copyButton.textContent =
                        oldText;

                },
                1500
            );


        } catch (error) {

            console.error(error);

        }

    }
);


// ============================================
// RENDER
// ============================================

function render() {

    renderStats();

    renderLinks();

}


// ============================================
// STATS
// ============================================

function renderStats() {

    const totalLinks =
        urls.length;


    const totalClicks =
        urls.reduce(
            (sum, item) =>
                sum + item.clicks,
            0
        );


    const average =
        totalLinks === 0
            ? 0
            : Math.round(
                totalClicks /
                totalLinks
            );


    urlCount.textContent =
        totalLinks;

    statLinks.textContent =
        totalLinks;

    statClicks.textContent =
        totalClicks;

    statAverage.textContent =
        average;

}


// ============================================
// LINK LIST
// ============================================

function renderLinks() {

    if (urls.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        urlList.classList.add(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );

    urlList.classList.remove(
        "hidden"
    );


    urlList.innerHTML =
        urls
            .map(
                item =>
                    createLinkHTML(item)
            )
            .join("");

}


// ============================================
// LINK HTML
// ============================================

function createLinkHTML(item) {

    const short =
        `https://sho.rt/${escapeHtml(
            item.code
        )}`;


    return `

        <div class="link-item">

            <div class="link-main">

                <a
                    href="#"
                    class="short-link"
                    data-code="${escapeHtml(
                        item.code
                    )}"
                >
                    ${short}
                </a>

                <span class="original-link">
                    ${escapeHtml(
                        item.originalUrl
                    )}
                </span>

            </div>


            <div class="link-date">
                ${formatDate(
                    item.createdAt
                )}
            </div>


            <div class="link-clicks">

                <strong>
                    ${item.clicks}
                </strong>

                <span>
                    clicks
                </span>

            </div>


            <button
                class="delete-button"
                data-id="${escapeHtml(
                    item.id
                )}"
                title="Delete"
            >
                ×
            </button>

        </div>

    `;

}


// ============================================
// CLICK HANDLER
// ============================================

urlList.addEventListener(
    "click",
    function (event) {


        // DELETE

        const deleteButton =
            event.target.closest(
                ".delete-button"
            );


        if (deleteButton) {

            deleteUrl(
                deleteButton.dataset.id
            );

            return;

        }


        // SHORT LINK

        const link =
            event.target.closest(
                ".short-link"
            );


        if (!link) {
            return;
        }


        event.preventDefault();


        const code =
            link.dataset.code;


        const item =
            urls.find(
                url =>
                    url.code === code
            );


        if (!item) {
            return;
        }


        item.clicks++;

        save();

        render();


        alert(
            `Redirecting to:\n\n${item.originalUrl}`
        );

    }
);


// ============================================
// DELETE
// ============================================

function deleteUrl(id) {

    const confirmed =
        confirm(
            "Delete this shortened URL?"
        );


    if (!confirmed) {
        return;
    }


    urls =
        urls.filter(
            item =>
                item.id !== id
        );


    save();

    render();

}


// ============================================
// GENERATE CODE
// ============================================

function generateCode(length) {

    const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let code;


    do {

        code = "";


        for (
            let i = 0;
            i < length;
            i++
        ) {

            code +=
                chars[
                    Math.floor(
                        Math.random() *
                        chars.length
                    )
                ];

        }

    } while (
        urls.some(
            item =>
                item.code === code
        )
    );


    return code;

}


// ============================================
// VALIDATE URL
// ============================================

function isValidUrl(value) {

    try {

        const url =
            new URL(value);


        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;

    }

}


// ============================================
// STORAGE
// ============================================

function save() {

    localStorage.setItem(
        "shortly_urls",
        JSON.stringify(urls)
    );

}


// ============================================
// MESSAGE
// ============================================

function showMessage(
    message,
    type
) {

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

}


function clearMessage() {

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";

}


// ============================================
// DATE
// ============================================

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

    }