const w = window;
const d = document;
const listTasks = d.querySelector("#listTasks");
const valueInput = d.querySelector("#taskName");
const saveTaskButton = d.querySelector("#btnSaveTask");
const deleteAllButton = d.querySelector("#btnRemoveAll");
const noTaskYet = d.querySelector("#zeroTasks");
const body = d.querySelector(".body")
let dragStartIndex;

const dateNow = new Date;
let arrTasks =[];

function runFunctions(){
    noTaskYetMessage();
    getDataFromLocalStorage();
    changePositionsDragging(arrTasks);
    activateDarkMode();
    hamburgerMenu();
}

runFunctions();

//Functions
function activateDarkMode(){
    const baseSlider = d.querySelector("#baseSlider");
    const sunIcon = d.querySelector(".fa-sun");
    const moonIcon = d.querySelector(".fa-moon");
    const header = d.querySelector(".header");

    
    baseSlider.addEventListener("click",()=>{
        baseSlider.classList.toggle("active");
        body.classList.toggle("dark-mode");
        header.classList.toggle("dark-mode");
        valueInput.classList.toggle("dark-mode");
        saveTaskButton.classList.toggle("dark-mode");
        moonIcon.classList.toggle("dark-mode");
        sunIcon.classList.toggle("dark-mode");
        listTasks.querySelectorAll("li").forEach(element => {
            element.classList.toggle("dark-mode")
        })
    })
}

function hamburgerMenu() {
    const panelHamburgerMenu = d.querySelector("#panelHamburgerMenu");
    d.addEventListener("mouseup",(e)=>{
        if(e.target.matches(".hamburger-menu") || e.target.matches(".hamburger-menu *")){
            panelHamburgerMenu.classList.toggle("active");
        }else if(e.target === panelHamburgerMenu || e.target.matches("#panelHamburgerMenu *")){
            panelHamburgerMenu.classList.add("active");
        }else{
            panelHamburgerMenu.classList.remove("active");
        }
        
    })
}

function saveTaskInArray(inputTask) {
    if(inputTask !== ""){
        const task = {date: Date.now(), description: inputTask, complete: false};
        arrTasks.unshift(task);
        setDataToLocalStorage(arrTasks);
        valueInput.value = "";
    }
}

function setDataToLocalStorage(arr){
    localStorage.setItem("to do list",JSON.stringify(arr))
    renderTasks(arr);
}

function getDataFromLocalStorage(){
    if(localStorage.getItem("to do list")){
        arrTasks = JSON.parse(localStorage.getItem("to do list"));
        renderTasks(arrTasks);
        noTaskYetMessage();
    }
}

function renderTasks(arr){
    listTasks.innerHTML = "";
    arr.forEach(item => {
        const darkMode = body.classList.contains("dark-mode") ? true : false;
        const checked = item.complete ? "checked" : null;
        const li = d.createElement("li");
        li.draggable = true;
        li.classList.add("task");
        li.setAttribute("data-date",`${item.date}`);

        if(darkMode){
            li.classList.add("dark-mode")
        }

        if(item.complete === true){
            li.classList.add("completed")
        }

        li.innerHTML = `<input class="checkbox" type="checkbox" ${checked}>${item.description}<i id="deleteTaskBtn" class="fa-solid fa-trash"></i><i id="editBtn" class="fa-solid fa-pen"></i>`;
        listTasks.appendChild(li);
    })
        
}

function changePositionsDragging(arr){
    listTasks.addEventListener("dragstart",e=>{
        if(e.target.classList.contains("task")){
            dragStartIndex = findIndexOfElement(e, arr, true);
        }
    })
    listTasks.addEventListener("dragenter",e=>{
       if(e.target.classList.contains("task")){
           e.target.classList.add("over")
       }
    })
    listTasks.addEventListener("dragleave", e =>{
        if( e.target.classList.contains("task")){
            e.target.classList.remove("over");
        }
    })
    listTasks.addEventListener("dragover", e =>{
        e.preventDefault();
    })
    listTasks.addEventListener("drop",e=>{
        if(e.target.classList.contains("task")){
            const dragEndIndex = findIndexOfElement(e, arr, true);
            e.target.classList.remove("over");
            swapItems(dragStartIndex, dragEndIndex,arr)
        }
    })
}


function swapItems(fromIndex, toIndex, arr) {
    const itemOne = arr[fromIndex];
    const itemTwo = arr[toIndex];
    arr[toIndex] = itemOne;
    arr[fromIndex] = itemTwo;
    setDataToLocalStorage(arr);
}

/////////////////////////////////////////////////////////////////////////////////////////////
//<============= DO SOME REFACTORING, TO GET ONE FUNCTION TO OBTAIN THE INDEX ============>//
/////////////////////////////////////////////////////////////////////////////////////////////
function findIndexOfElement(e,arr,itemIsTask=false){
    if(itemIsTask===true){
        const elementSelected = parseInt(e.target.getAttribute("data-date"));
        const findItemInArray = (item) => item.date === elementSelected;
        const result = arr.findIndex(findItemInArray);
        return result
    } else {
        const elementSelected = parseInt(e.target.parentElement.getAttribute("data-date"));
        const findItemInArray = (item) => item.date === elementSelected;
        const result = arr.findIndex(findItemInArray);
        return result
    }
}


function deleteTask(e, arr) {
    const indexOfElement = findIndexOfElement(e,arr);
    if(e.target.id === "deleteTaskBtn"){
        arr.splice(indexOfElement, 1);
        setDataToLocalStorage(arr);
        if(arr.length === 0){
            noTaskYetMessage()
        }
    }
    
}

function markAsReadyTask(e, arr) {
    const indexOfElement = findIndexOfElement(e,arr);
    if(e.target.classList.contains("checkbox")){
        if(arr[indexOfElement].complete === false){
            arr[indexOfElement].complete = true;
        } else {
            arr[indexOfElement].complete = false;
        }
        setDataToLocalStorage(arr)
    }
}

function editTaskName(e, arr) {
    if(e.target.id === "editBtn"){
        const indexOfElement = findIndexOfElement(e,arr);
                
        //Disable tab index in some elements to do not interact with tab key when overlay is active
        valueInput.tabIndex = -1;
        deleteAllButton.tabIndex = -1;

        // Creating all the elements
        
        const btnSaveEdit = d.createElement("button");
        btnSaveEdit.classList.add("btn-save-edit");
        btnSaveEdit.textContent = "Save";
        
        const btnExit = d.createElement("button");
        btnExit.classList.add("btn-exit");
        btnExit.textContent = "Exit"

        
        const inputEdit = d.createElement("input");
        inputEdit.classList.add("input-edit");
        inputEdit.value = arr[indexOfElement].description;
        inputEdit.type = "text";
        

        const windowEdit = d.createElement("div");
        windowEdit.classList.add("window-edit");
        windowEdit.append(inputEdit,btnSaveEdit,btnExit);
        
        const overlay = d.createElement("div");
        overlay.classList.add("overlay-edit");
        overlay.appendChild(windowEdit)
        
        body.appendChild(overlay);
        body.style.overflow = "hidden";
        
        // Select the actual text in the input
        inputEdit.select();
        
        //Taking value of the input
        overlay.addEventListener("click", (e)=>{
            if(e.target.classList.contains("btn-save-edit")){
                if(inputEdit.value){
                    arr[indexOfElement].description = inputEdit.value;
                    setDataToLocalStorage(arr);
                    valueInput.tabIndex = 0;
                    deleteAllButton.tabIndex = 0;
                    overlay.remove();
                    body.style.overflow = "initial";
                }
            }
            if(e.target.classList.contains("btn-exit")){
                valueInput.tabIndex = 0;
                deleteAllButton.tabIndex = 0;
                overlay.remove();
                body.style.overflow = "initial";
            }
        })
        d.addEventListener("keypress", (e) => {
            if(e.key === "Enter" && inputEdit.value){
                arr[indexOfElement].description = inputEdit.value;
                setDataToLocalStorage(arr);
                overlay.remove();
                valueInput.tabIndex = 0;
                deleteAllButton.tabIndex = 0;
            }
        })
    }    
}



// =============================> REFACTORING <========================================



function noTaskYetMessage(){
    if(listTasks.hasChildNodes()){
        noTaskYet.style.display = "none";
    }
    if(!listTasks.hasChildNodes()){
        noTaskYet.style.display = "block";
    }
    
}

function removeAllTasks() {
    arrTasks = [];
    listTasks.innerHTML = "";
    localStorage.clear();
    alert("Your list has been successfully cleaned");
}

//event listeners

 //save task
saveTaskButton.addEventListener("click",()=>{
    saveTaskInArray(valueInput.value);
    noTaskYetMessage();
});
d.addEventListener("keydown",e =>{
    if(e.key === "Enter"){
        saveTaskInArray(valueInput.value);
        noTaskYetMessage();
    }
})


//remove just one task
listTasks.addEventListener("click",(e)=>{
    deleteTask(e, arrTasks);
    markAsReadyTask(e, arrTasks);
    editTaskName(e, arrTasks);
})


//remove all tasks
deleteAllButton.addEventListener("click", ()=>{
    removeAllTasks();
    noTaskYetMessage();
});