
const save = document.getElementById("save");
const textArea = document.getElementById('textEditor');

save.addEventListener('click', async () => {
    const content = textArea.innerText
    try {
        const result = await window.api.saveFile(content)
        console.log(result)
        alert.result
    } catch (err) {
        console.log(err)
        alert('Failed to save file.')
    }
})

const newNotebook = document.getElementById('newNotebook')

let inputVisible = false

newNotebook.addEventListener('click', async () => {

    if (inputVisible) return
    inputVisible = true

    const inputDiv = document.getElementById("input-topbar")
    const newInput = document.createElement('input')
    const cancelButton = document.createElement('button')

    newInput.setAttribute('type', 'text')
    newInput.setAttribute('name', 'dynamicInput')
    newInput.setAttribute('placeholder', 'Enter Notebook Name')
    newInput.setAttribute('id', 'dynamicInputField')

    cancelButton.setAttribute('type', 'submit')
    cancelButton.addEventListener('click', async (event) => {
        cancelButton.remove()
        newInput.remove()
        inputVisible = false
    })

    inputDiv.appendChild(newInput)
    inputDiv.appendChild(cancelButton)
    cancelButton.textContent = 'Cancel'
    newInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            try {
                const result = await window.api.createNotebook(newInput.value)
                console.log(result)
                alert.result
            } catch (err) {
                console.log(err)
                alert('Failed to create Notebook.')
            }
        }
    })
})

const sidebar = document.getElementById('notebookViewer')

async function loadSidebar() {
    const notebooks = await window.api.getNotebooks()
    sidebar.innerHTML = ''

    for (const name of notebooks) {
        const notebookItem = document.createElement('div')
        notebookItem.classList.add('notebook')
        notebookItem.textContent = name
        notebookItem.addEventListener('click', () => loadNotes(name))
        sidebar.appendChild(notebookItem)
    }
}

async function loadNotes(notebookName) {
    const notes = await window.api.getNotesInNotebook(notebookName)
    const noteList = document.createElement('div')
    noteList.classList.add('note-list')

    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note')
        noteItem.textContent = note;
        noteItem.addEventListener('click', async () => {
            const content = await window.api.readNote(notebookName, note)
            textArea.innerText = content
        })
        noteList.appendChild(noteItem)
    })
    sidebar.appendChild(noteList)
}

loadSidebar()