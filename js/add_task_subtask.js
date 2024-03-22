function addSubtask() {
    let subtask = document.getElementById('subtasks').value;
    let subtaskcontainer = document.getElementById('subtask-container');
    let subtaskId = 'subtask-' + subtaskCounter++;

    subtaskcontainer.innerHTML += renderSubtaskHTML(subtask, subtaskId);

    document.getElementById('subtasks').value = '';
    document.getElementById('icon-container').innerHTML = `
    <img onclick="addSubtask()" class="icon-plus" src="assets/img/addtask_plus.svg" alt="">`;
}

function removeSubtask(subtaskId) {
    let subtaskElement = document.getElementById(subtaskId);
    if (subtaskElement) {
        subtaskElement.remove();
        subtaskCounter--;
    }
    document.getElementById('subtask-container').style.overflowY = 'auto';
}

function editSubtask(subtaskId) {
    let subtaskDiv = document.getElementById(subtaskId);
    subtaskDiv.classList.add('editing');
    let subtaskText = subtaskDiv.innerText;

    document.getElementById('subtask-container').style.overflowY = 'hidden';
    subtaskDiv.innerHTML = renderSubtaskListHTML(subtaskText, subtaskId);
    document.getElementById(`edit-${subtaskId}`).focus();
}

function saveEditedSubtask(subtaskId) {
    let subtaskDiv = document.getElementById(subtaskId);
    let inputField = document.getElementById(`edit-${subtaskId}`);
    let newValue = inputField.value;
    
    subtaskDiv.innerHTML = `
        <ul>
            <li>${newValue}</li>
        </ul>
        <div class="subtask-icons">
            <img onclick="editSubtask('${subtaskId}')" src="assets/img/pencil_grey.svg" alt="">
            <div class="subtask-line"></div>
            <img onclick="removeSubtask('${subtaskId}')" src="assets/img/delete.svg" alt="">
        </div>
    `;
    subtaskDiv.classList.remove('editing');
    document.getElementById('subtask-container').style.overflowY = 'auto';
}

function clearSubtasks() {
    let subtaskContainer = document.getElementById('subtask-container');
    subtaskContainer.innerHTML = '';
    subtaskCounter = 0; 
}

function cancelSubtask() {
    document.getElementById('subtasks').value = ''; 
    document.getElementById('icon-container').innerHTML = `
        <img onclick="addSubtask()" class="icon-plus" src="assets/img/addtask_plus.svg" alt="">
    `;
}

function addSubtaskEventListener(){
document.getElementById('subtasks').addEventListener('input', function() {
    let inputField = document.getElementById('subtasks');
    let iconContainer = document.getElementById('icon-container');

    if(inputField.value.trim() !== '') {
        iconContainer.innerHTML = `
            <img onclick="cancelSubtask()" class="icon-cancel" src="assets/img/cancel_dark.svg" alt="">
            <div class="subtask-line"></div>
            <img onclick="addSubtask()" class="icon-confirm" src="assets/img/addtask_check.svg" alt="">
        `;
    } else {
        iconContainer.innerHTML = `
            <img onclick="addSubtask()" class="icon-plus" src="assets/img/addtask_plus.svg" alt="">
        `;
    }
});
}

function setupInputEventListener() {
    document.getElementById('subtasks').addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === 13) {
            event.preventDefault(); 

            let isEditing = document.querySelector('.editing');

            if (isEditing) {
                let subtaskId = isEditing.id; 
                saveEditedSubtask(subtaskId);
            } else {
                addSubtask();
            }
        }
    });
}