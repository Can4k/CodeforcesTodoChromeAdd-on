// TODO
// DONE 1. parser для ссылки (http://codeforces.com/problemset/problem/${number}/{letter}), проверка на корректность, (если не указал https то пофиг, чекать на это)
// DONE 2. укрорачиваение слишком длинной ссылки
// DONE 3. удаление задачи из списка
// DONE 4. улучшить стиль для overflow-y
// DONE 4.1 сделать надписи под кнопками при наведении (для упрощения пользования)
// DONE 5. в надписи ссылки делать не ссылку, а строку вида 1804-H (а ссылку задавать нормально)
// DONE 6. почистить localstorage -> сделать кнопку для общей чистки
// DONE 7. сделать подгрузку данных при открытии дополнения
// DONE 7.1 сделать ссылку на свой ТГ в дополнении
// 8. нарисовать иконку
// 9. выложить дополнение на гитхаб
// 10. выложить дополнение в Google Store
// 11. Похвастаться в 17:35, ярусский, ясерб и 10И.

let showInput = 0;
let global_link;
let isCoolLink = false;

const add_current = document.getElementById('add_current');
const add_some = document.getElementById('add_some');
const add_input = document.querySelector('input');
const task_container = document.getElementById('task_container');
const txt = document.getElementById('txt');

setTimeout(() => txt.style.display = 'none', 2000);

chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    global_link = tabs[0].url;
    if (!linkParser(global_link).error) {
        isCoolLink = true;
        add_current.style.display = 'revert';
    }
});

let list = [];
let T = 0; // time, 

// chrome.storage.local.clear()
this.updateList();

function createTask(element) {
    return `<div style class="template">
                <b>|</b>
                <a target="_blank" href="${element.element.link}" class="link">${element.element.number}${element.element.letter}</a>
                <button id="button-${element.time}" class="close">DONE</button>
            </div>
    `;

}

function linkParser(link) {
    if (link[0] != 'h') {
        link = 'http://' + link;
    }

    let structure = link.split('/');
    if (structure.length != 7 || structure[2] != 'codeforces.com') {
        return {
            error: true
        }
    }
    return {
        link: link,
        type: structure[3],
        number: (structure[5] === 'problem' ? structure[4] : structure[5]),
        letter: structure[6]
    }
}

function updateList() {
    list = [];
    task_container.innerHTML = "";
    T = 0;
    chrome.storage.local.get('tasklist', (item) => {
        let cist = item.tasklist;
        if (cist != 'undefined') {
            cist = JSON.parse(cist);
            for (let i = 0; i < cist.length; i++) {
                insertInUpdate([linkParser(cist[i].element.link), cist[i].time]);
            }
            for (let i of list) {
                T = 1 + Math.max(T, i.time);
            }
        }
    });
}

function insertInUpdate(element) {
    list.push({
        element: element[0],
        time: element[1],
    });

    task_container.insertAdjacentHTML('beforeend', createTask(list[list.length - 1]));
    document.getElementById(`button-${list[list.length - 1].time}`).addEventListener('click', (item) => {
        remove(item.target.id);
    });
}

function insert(element) {
    list.push({
        element: element,
        time: ++T,
    });
    chrome.storage.local.set({ 'tasklist': JSON.stringify(list) });
    task_container.insertAdjacentHTML('beforeend', createTask(list[list.length - 1]));
    document.getElementById(`button-${T}`).addEventListener('click', (item) => {
        remove(item.target.id);
    });
}

function remove(id) {
    document.getElementById(id).parentElement.remove();
    let time = +id.split('-')[1];
    for (let i = 0; i < list.length; i++) {
        if (list[i].time === time) {
            id = i;
            break;
        }
    }
    list.splice(id, 1);
    chrome.storage.local.set({ 'tasklist': JSON.stringify(list) });
}

function stateSome() {
    if (!showInput) {
        add_some.innerText = "Save this url"
        add_some.style.color = "green";
    } else {
        add_some.innerText = "+ Task by url"
        add_some.style.color = "black";
    }
}

function stateCurr() {
    if (!showInput) {
        add_current.innerText = "Don't save"
        add_current.style.color = "red";
        add_current.style.display = 'revert';
    } else {
        add_current.innerText = "+ Task (this page)"
        add_current.style.color = "black";
        if (!isCoolLink) {
            add_current.style.display = 'none';
        }
    }
}

function stateInp() {
    add_input.style.backgroundColor = 'white';
    if (!showInput) {
        add_input.style.animation = "open .2s forwards";
    } else {
        add_input.style.animation = "close .2s forwards";
        add_input.value = '';
    }
}

function state() {
    stateCurr();
    stateSome();
    stateInp();
    showInput ^= 1;
}

add_input.addEventListener('click', () => {
    add_input.style.backgroundColor = 'white';
})

add_input.addEventListener('input', () => {
    add_input.style.backgroundColor = 'white';
})

add_some.addEventListener('click', () => {
    if (!showInput) {
        state();
    } else {
        let data = linkParser(add_input.value);
        if (data.error) {
            add_input.style.backgroundColor = 'red';
            return;
        }
        insert(data);
        state();
    }
});

add_current.addEventListener('click', () => {
    if (!showInput) {
        let data = linkParser(global_link);
        if (data.error) {
            return;
        }
        insert(data);
    } else {
        state();
    }
});

add_input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        let data = linkParser(add_input.value);
        if (data.error) {
            add_input.style.backgroundColor = 'red';
            return;
        }
        insert(data);
        state();
    }
});