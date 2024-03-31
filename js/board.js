let sections = [
    { id: 'board-todo-container', text: 'No tasks To do' },
    { id: 'board-in-progress-container', text: 'No tasks in progress' },
    { id: 'board-feedback-container', text: 'No tasks await feedback' },
    { id: 'board-done-container', text: 'No tasks done' }
];
const TASK_STATUSES = ['todo', 'in-progress', 'feedback', 'done'];

let isOverlayOpen = false;

async function renderBoard() {
    await init();
    initializeTaskData();
    loadTasksFromLocalStorage();
    displayAllTasks();
    checkAllSections();
}

// TASK OVERLAY --------------------------------------------------------------------------------------------------------
function handleTaskClick(index) {
    const task = tasksData[index];
    renderTaskOverlayHTML(task, index);
    const overlayContainer = document.getElementById('edit-task-overlay');
    overlayContainer.style.display = 'block'; 
}

function closeTaskOverlay() {
    const overlayContainer = document.getElementById('edit-task-overlay');
    overlayContainer.innerHTML = ''; 
    overlayContainer.style.display = 'none'; 
}

function openEditTask(index) {
    let editOverlay = document.getElementById('edit-task-overlay');
    let assignedContactsHtml = '';
    let subtasksHtml = '';
    let task = tasksData[index];

    for (let i = 0; i < task.assignedTo.length; i++) {
        let contact = task.assignedTo[i];
        assignedContactsHtml += `
        <div class="contact-icon-container">
            <p class="test-contact" style="background-color: ${contact.color}">${contact.initials}</p>
        </div>`;
    }

    for (let j = 0; j < task.subtasks.length; j++) {
        let subtask = task.subtasks[j];
        subtasksHtml += `
        <div class="subtasks-check-container">
            <span ${subtask.completed ? 'checked' : ''}>
            <span>${subtask.title}</span>
        </div>`;
    }

    let htmlContent = renderEditTaskOverlayHTML(task, assignedContactsHtml, subtasksHtml, index);
    editOverlay.innerHTML = htmlContent;
}

// ADD TASK OVERLAY ----------------------------------------------------------------------------------------------------
function openAddTask(progressStatus, category, selectedDiv, dropdown, itemsDiv, contact, optionDiv) {
    if (isOverlayOpen) return;
    populateEmptyColumns(sections);

    let container = document.getElementById('add-task-container-board');
    let overlay = document.getElementById('page-overlay');
    let body = document.body;

    overlay.classList.add('active');
    body.style.overflow = 'hidden';
    container.classList.remove('closing');
    container.classList.add('active');
    container.setAttribute('w3-include-html', 'assets/templates/task-form.html');

    includeHTML().then(() => {
        activateContainer(progressStatus);
        renderAddTask(category, selectedDiv, dropdown, itemsDiv, contact, optionDiv);
    });

    isOverlayOpen = true;
}

function activateContainer(progressStatus) {
    let container = document.getElementById('add-task-container-board');
    container.style.display = 'block';

    let closeButton = document.getElementById('close-task-btn');
    if (closeButton) {
        closeButton.addEventListener('click', closeAddTask, { once: true });
    }
    container.setAttribute('data-progress-status', progressStatus);
}

function closeAddTask() {
    if (!isOverlayOpen) return;
    populateEmptyColumns(sections)

    let container = document.getElementById('add-task-container-board');
    let overlay = document.getElementById('page-overlay');
    let body = document.body;

    container.classList.add('closing');
    overlay.classList.remove('active');
    body.style.overflow = '';
    container.removeAttribute('w3-include-html');

    isOverlayOpen = false; 
}

// COLUMN LOGIC ---------------------------------------------------------------------------------------------------
function displayAllTasks() {

    for (let j = 0; j < sections.length; j++) {
        let section = sections[j]; 
        let column = document.getElementById(section.id); 

        if (column) {
            column.innerHTML = ''; 

            for (let i = 0; i < tasksData.length; i++) {
                let task = tasksData[i]; 

                if (task.progress === section.id.replace('board-', '').replace('-container', '')) {
                    let taskElement = renderMiniTaskHTML(task, i); 
                    column.innerHTML += taskElement; 
                }
            }
        }
    }
    initializeDragAndDrop();
}

function isValidStatus(status) {
    return TASK_STATUSES.includes(status);
}

function checkAllSections() {
    sections.forEach(section => {
        const column = document.getElementById(section.id);
        if (column.children.length === 0 || (column.children.length === 1 && column.firstElementChild.classList.contains('empty-column'))) {
            column.innerHTML = `<div class='empty-column'><span>${section.text}</span></div>`;
            column.classList.add('empty');
        } else {
            const placeholder = column.querySelector('.empty-column');
            if (placeholder) placeholder.remove();
            column.classList.remove('empty');
        }
    });
}

function checkColumnEmpty(sectionId, emptyText) {
    let section = document.getElementById(sectionId);

    if (!section.hasChildNodes()) {
        section.classList.add('empty');
        section.innerHTML = `<div class='empty-column'><span>${emptyText}</span></div>`;
    } else {
        const emptyColumnDiv = section.querySelector('.empty-column');
        if (emptyColumnDiv) {
            emptyColumnDiv.remove();
        }
        section.classList.remove('empty');
    }
}

// FILTER FUNCTION TASK TITLES --------------------------------------------------------------------------------------------------

function getFilteredTasks(searchText, tasksData) {
    return tasksData.filter(task => {
        if (typeof task.title === 'string') {
            return task.title.split(' ').some(word => word.toLowerCase().startsWith(searchText));
        }
        return false;
    });
}

function clearColumns(sections) {
    for (let i = 0; i < sections.length; i++) {
        let column = document.getElementById(sections[i].id);
        column.classList.add('empty');
        column.innerHTML = '';
    }
}

function populateColumnsWithTasks(filteredTasks, tasksData) {
    for (let i = 0; i < filteredTasks.length; i++) {
        let task = filteredTasks[i];
        let sectionId = `board-${task.progress}-container`;
        let column = document.getElementById(sectionId);

        if (column) {
            column.classList.remove('empty');
            let taskIndex = tasksData.indexOf(task);
            let taskElement = renderMiniTaskHTML(task, taskIndex);
            column.innerHTML += taskElement;
        }
    }
}

function populateEmptyColumns(sections) {
    for (let i = 0; i < sections.length; i++) {
        let column = document.getElementById(sections[i].id);
        if (!column.innerHTML.trim()) {
            column.innerHTML = `
                <div class='empty-column dotted-container'>
                    <div class="dotted-container">
                        <span>${sections[i].text}</span>
                    </div>
                </div>`;
        }
    }
}

function filterTasks() {
    const searchText = document.getElementById('search-tasks').value.toLowerCase();
    const filteredTasks = getFilteredTasks(searchText, tasksData);

    clearColumns(sections);

    if (filteredTasks.length > 0) {
        populateColumnsWithTasks(filteredTasks, tasksData);
    }

    populateEmptyColumns(sections);
}