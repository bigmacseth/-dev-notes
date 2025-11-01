const save = document.getElementById("save");
const textArea = document.getElementById('textEditor');

save.addEventListener('click', async () => {
    const content = textArea.innerText
    try {
        const result = await window.parseInt.saveFile(content)
        console.log(result)
        alert.result
    } catch (err) {
        console.log(err)
        alert('Failed to save file.')
    }
})