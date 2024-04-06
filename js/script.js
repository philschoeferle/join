const STORAGE_TOKEN = "SUAP8YLQYG530FE8HDED8CKFONZBVXBSJ39FDPIR";
const STORAGE_URL = "https://remote-storage.developerakademie.org/item";
const publicPages = ['index.html', 'external_privacy.html', 'external_legal.html', 'sign_up.html'];
const colors = [
  "--user-orange",
  "--user-mid-orange",
  "--user-light-orange",
  "--user-green",
  "--user-light-green",
  "--user-purple",
  "--user-light-purple",
  "--user-red",
  "--user-light-red",
  "--user-yellow",
  "--user-light-yellow",
  "--user-pink",
  "--user-light-pink",
  "--user-blue",
  "--user-light-blue",
];

/* Asynchronously stores data in remote storage using a POST request with a unique token for authentication. */
async function setItem(key, value) {
  const payload = { key, value, token: STORAGE_TOKEN };
  return fetch(STORAGE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => res.json());
}

/* Retrieves data from remote storage using a token and key. */
async function getItem(key) {
  const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
  return fetch(url)
    .then((res) => res.json()).then(res => {
      if (res.data) {
        return res.data.value;
      } throw `Could not find data with key "${key}".`;
    });
}

/* Initializes page-specific functions. */
async function initPageFunctions() {
  updateUserIcon();
  setActive(); 
}

/* Initializes external pages */ 
async function externalInit() {
  await includeHTML();
  disableContent();
  initPageFunctions();
}

/* Hides or modifies elements not applicable to external or unauthenticated users. */
function disableContent() {
  const actions = [
    { id: 'menu-items', action: element => element.style.display = 'none' },
    { id: 'user-menu-icons', action: element => element.style.display = 'none' },
    { id: 'privacy-section', action: element => element.classList.add('external-privacy') },
    { id: 'privacy-link', action: element => element.setAttribute('href', 'external_privacy.html') },
    { id: 'legal-link', action: element => element.setAttribute('href', 'external_legal.html') }
  ];

  actions.forEach(({ id, action }) => {
    const element = document.getElementById(id);
    if (element) {
      action(element);
    }
  });
}

/* Special initialization for help pages, remove help icon. */
async function helpInit() {
  await includeHTML();
  document.getElementById('help-icon').style.display = 'none';
  initPageFunctions();
}

/* General initialization function for loading. */ 
async function init() {
  await includeHTML();
  initPageFunctions();
}

/* Checks if the user is logged in and redirects to the login page if accessing a non-public page without authentication. */ 
function checkIfIsLoggedIn() {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const currentPage = window.location.pathname.split('/').pop();

  if (!publicPages.includes(currentPage) && !isLoggedIn) {
    sessionStorage.setItem('loginRequired', 'true');
    window.location.href = 'index.html';
  }
}

/* Handles post-load activities like showing login prompts or initializing page content based on login status. */
document.addEventListener('DOMContentLoaded', async () => {
  if (sessionStorage.getItem('loginRequired') === 'true') {
    sessionStorage.removeItem('loginRequired');
    document.getElementById('checkLogin').classList.remove('d-none');
  }

  if (checkIfIsLoggedIn()) {
    await includeHTML();
    let isPublic = isPublicPage();
    if (isPublic) {
      disableContent();
    }
    initPageFunctions();
    await checkWindowSize();
  }
});

/* Dynamically includes templates. */
async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    const file = element.getAttribute("w3-include-html");
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
  initPageFunctions();
}

/* Marks the current navigation link as active based on the URL. */
function setActive() {
  let currentPagePath = window.location.pathname;
  document
    .querySelectorAll(".menu-link, .privacy-link-container a")
    .forEach((link) => {
      let isActive =
        new URL(link.href, document.baseURI).pathname === currentPagePath;
      link.classList.toggle("active", isActive);
      let parent = link.closest(".privacy-link-container");
      if (parent) parent.classList.toggle("active", isActive);
    });
}

/* Displays the user menu and disables page scrolling to focus on the menu. */
function openUserMenu() {
  document.getElementById("user-menu").classList.remove("d-none");
  document.body.style.overflow = "hidden";
  document.addEventListener("click", closeUserMenu, true);
}

/* Hides the user menu and re-enables scrolling when clicking outside the menu. */
function closeUserMenu(event) {
  const userMenu = document.getElementById("user-menu");
  if (userMenu.contains(event.target)) {
    return;
  }
  userMenu.classList.add("d-none");
  document.body.style.overflow = "";
  document.removeEventListener("click", closeUserMenu, true);
}

/* Assign color for user and get initials */ 
function getColorForInitials(initials) {
  let sum = 0;
  for (let i = 0; i < initials.length; i++) {
    sum += initials.charCodeAt(i);
  }
  return `var(${colors[sum % colors.length]})`;
}

/* Extracts initials from a full name. */
function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/* Clears session storage and redirects to the login page, effectively logging out the user. */
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

/* Navigates to the previous page in the browser history. */
function goBack() {
  window.history.back();
}

/* Redirects to the board page. */ 
function showBoardFromSummary() {
  window.location.href = 'board.html';
}

/* Updates the user icon display based on the stored username. */
function updateUserIcon() {
  let userIcon = document.querySelector('.user-icon');
  if (userIcon) {
    let username = sessionStorage.getItem('username');

    if (username && username !== 'Guest') {
      let names = username.split(' ');
      if (names.length > 1) {
        userIcon.textContent = names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
      } else {
        userIcon.textContent = names[0].charAt(0).toUpperCase();
      }
    } else {
      userIcon.textContent = 'G';
    }
  }
}

/* Determines if the current page is publicly accessible, affecting page behavior and content. */
function isPublicPage() {
  let currentPage = window.location.pathname.split('/').pop();
  return publicPages.includes(currentPage);
}

/* Dynamically switches between mobile and desktop templates based on screen size and public access.*/
async function switchTemplate(currentTemplate, isPublic) {
  let includeDiv = document.querySelector('[w3-include-html]');
  let cssLink = document.querySelector('link[href*="template.css"]');

  if (window.innerWidth < 1000) {
    await switchToMobileTemplate(currentTemplate, includeDiv, cssLink, isPublic);
  } else {
    await switchToDesktopTemplate(currentTemplate, includeDiv, cssLink, isPublic);
  }
}

/* Specific functions for switching to appropriate templates based on the current environment and device type. */
async function switchToMobileTemplate(currentTemplate, includeDiv, cssLink, isPublic) {
  if (currentTemplate !== 'assets/templates/mobile-template.html') {
    includeDiv.setAttribute('w3-include-html', 'assets/templates/mobile-template.html');
    cssLink.setAttribute('href', 'css/mobile-template.css');
    await includeHTML();
    if (isPublic) {
      disableContent();
    }
  }
}

async function switchToDesktopTemplate(currentTemplate, includeDiv, cssLink, isPublic) {
  if (currentTemplate !== 'assets/templates/desktop-template.html' || !currentTemplate) {
    includeDiv.setAttribute('w3-include-html', 'assets/templates/desktop-template.html');
    cssLink.setAttribute('href', 'css/desktop-template.css');
    await includeHTML();
    if (isPublic) {
      disableContent();
    }
  }
}

/* Checks the browser window size and switches templates as needed. */
async function checkWindowSize() {
  let includeDiv = document.querySelector('[w3-include-html]');
  if (includeDiv) {
    let currentTemplate = includeDiv.getAttribute('w3-include-html');
    let isPublic = isPublicPage();
    await switchTemplate(currentTemplate, isPublic);
  }
  setActive();
}

/* Ensures the template and layout adapt to window size changes, maintaining usability and appearance. */
window.addEventListener('resize', checkWindowSize);
document.addEventListener('DOMContentLoaded', () => {
  checkWindowSize();
});