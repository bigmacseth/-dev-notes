
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
                const result = await window.api.newNotebook(newInput.innerText)
                console.log(result)
                alert.result
            } catch (err) {
                console.log(err)
                alert('Failed to create Notebook.')
            }
        }
    })
})

const notebookViewer = document.getElementById('notebookViewer')

