const save = document.getElementById("save");
const textArea = document.getElementById('textEditor');
const newNotebook = document.getElementById('newNotebook')
const inputDiv = document.getElementById('input-topbar')

let inputVisible = false
let currentNotebook = null
let currentNote = null

save.addEventListener('click', async () => {
    const content = textArea.innerText

    if (!currentNotebook) {
        return alert('No Notebook selected.  Please pick a notebook first.')
    }

    if (!currentNote) {
        const newNote = await window.api.promptUser({
            title: 'Enter note name',
            label: 'Name:',
            value: 'Untitled',
            type: 'input',
        })

        if (!newNote) return alert('Note name required.')
        if (newNote) {
            console.log('Saving note as: ', newNote)
        } else {
            console.log('User Canceled.')
        }

        currentNote = newNote + '.txt'
    }

    try {
        const result = await window.api.saveNote(currentNotebook, currentNote, content)
        console.log(result)
        alert.result
        await loadNotes(currentNotebook);
    } catch (err) {
        console.log(err)
        alert('Failed to save file.')
    }
})

newNotebook.addEventListener('click', async () => {

    if (inputVisible) return
    inputVisible = true

    const newInput = document.createElement('input')
    const cancelButton = document.createElement('button')

    newInput.setAttribute('type', 'text');
    newInput.setAttribute('placeholder', 'Enter Notebook Name');
    newInput.setAttribute('id', 'dynamicInputField');

    cancelButton.textContent = 'Cancel'
    cancelButton.setAttribute('id', 'newNotebookCancel')
    cancelButton.addEventListener('click', () => {
        newInput.remove()
        cancelButton.remove()
        inputVisible = false
    })

    inputDiv.appendChild(newInput)
    inputDiv.appendChild(cancelButton)
    newInput.focus()

    newInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            const name = newInput.value && newInput.value.trim()
            if (!name) {
                alert('Notebook cannot be empty.')
                return
            }
            
            try {
                const result = await window.api.createNotebook(name)
                console.log(result)
                newInput.remove()
                cancelButton.remove()
                inputVisible = false

                await loadSidebar()

                currentNotebook = name
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

    notebooks.forEach((name) => {
        const notebookItem = document.createElement('div')
        notebookItem.classList.add('notebook')

        const header = document.createElement('div')
        header.classList.add('notebook-header')
        header.textContent = name
        header.dataset.notebook = name

        const noteList = document.createElement('div')
        noteList.classList.add('note-list')

        header.addEventListener('click', async (e) => {
            const nbName = e.currentTarget.dataset.notebook
            header.classList.toggle('open')

            if (!noteList.hasChildNodes()) {
                await loadNotes(nbName, noteList)
            }

            const isOpen = notebookItem.classList.toggle('open')
            if (isOpen) {
                const scrollHeight = noteList.scrollHeight
                noteList.style.maxHeight = scrollHeight + 'px'
            } else {
                noteList.style.maxHeight = 0
            }
            
            currentNotebook = nbName
            currentNote = null
        })

        notebookItem.appendChild(header)
        notebookItem.appendChild(noteList)
        sidebar.appendChild(notebookItem)
    })
}

async function loadNotes(notebookName, noteListElement) {
    if (!notebookName) return
    const notes = await window.api.getNotesInNotebook(notebookName)

    let noteList = noteListElement
    if (!noteList) {
        noteList = document.createElement('div')
        noteList.classList.add('note-list')
    }

    noteList.innerHTML = ''

    notes.forEach(note => {
        const noteItem = document.createElement('div')
        noteItem.classList.add('note')
        noteItem.textContent = note.toString().replace('.txt', '')
        noteItem.dataset.note = note

        noteItem.addEventListener('click', async (e) => {
            const noteName = e.currentTarget.dataset.note

            currentNotebook = notebookName
            currentNote = noteName

            const content = await window.api.readNote(notebookName, noteName)
            textArea.innerText = content
        })

        noteList.appendChild(noteItem)
    })

    if (!noteListElement) {
        const notebookContainers = Array.from(document.querySelectorAll('.notebook'))
        const match = notebookContainers.find(c => c.querySelector('.notebook-header').dataset.notebook === notebookName);
        if (match) match.appendChild(noteList)
    }
}

loadSidebar()
loadNotes()
window.addEventListener('notebooks-updated', loadSidebar)