
const API_BASE_URL = "/api";


// ============================================
// STATE
// ============================================

let urls = [];


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
loadShortlinks();


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


        createWithBackend(url, alias);

    }
);


// ============================================
// BACKEND
// ============================================

async function loadShortlinks() {
    try {
        const data = await apiRequest("/urls");

        if (!Array.isArray(data.data)) {
            throw new Error("Invalid response received from server.");
        }

        urls = data.data.map(normalizeShortlink);
        render();
    } catch (error) {
        console.error(error);
        showMessage(error.message, "error");
    }
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status}).`);
    }

    return data;
}

function normalizeShortlink(item) {
    return {
        id: item.id,
        code: item.short_code,
        originalUrl: item.original_url,
        clicks: item.click_count,
        createdAt: item.created_at
    };
}

async function createWithBackend(
    url,
    alias
) {

    try {

        const data = await apiRequest("/urls", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url,
                custom_code: alias
            })
        });

        showBackendResult(
            new URL(data.short_url, window.location.origin).href
        );
        form.reset();

        showMessage(
            "Your short link is ready.",
            "success"
        );

        await loadShortlinks();

    } catch (error) {

        console.error(error);

        showMessage(error.message, "error");

    }

}


function showBackendResult(link) {
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
        `${window.location.origin}${API_BASE_URL}/${encodeURIComponent(item.code)}`;


    return `

        <div class="link-item">

            <div class="link-main">

                <a
                    href="${escapeHtml(short)}"
                    class="short-link"
                >
                    ${escapeHtml(short)}
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


    }
);


// ============================================
// DELETE
// ============================================

async function deleteUrl(id) {

    const confirmed =
        confirm(
            "Delete this shortened URL?"
        );


    if (!confirmed) {
        return;
    }


    try {
        await apiRequest(`/urls/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });
        await loadShortlinks();
    } catch (error) {
        console.error(error);
        showMessage(error.message, "error");
    }

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
    if (!date) {
        return "N/A";
    }

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