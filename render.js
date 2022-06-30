const divAlerts = document.getElementById("divAlerts");
const divToasts = document.getElementById("divToasts");
const inputSelectedApp = document.getElementById("inputSelectedApp");
const btnSelectApp = document.getElementById("btnSelectApp");
const btnOpenApp = document.getElementById("btnOpenApp");
const btnDeleteBackupApp = document.getElementById("btnDeleteBackupApp");
const btnCopyBackupApp = document.getElementById("btnCopyBackupApp");
const btnModalYesDeleteBackupApp = document.getElementById("btnModalYesDeleteBackupApp");

function changedInputSelectedApp(){
    if (inputSelectedApp.value == ''){
        btnOpenApp.setAttribute('disabled','')
        btnCopyBackupApp.setAttribute('disabled','')
        btnDeleteBackupApp.setAttribute('disabled','')
        return;
    }
    btnOpenApp.removeAttribute('disabled')
    btnCopyBackupApp.removeAttribute('disabled')
    btnDeleteBackupApp.removeAttribute('disabled')
}

btnSelectApp.addEventListener('click', async () => {
    const appFilepath = await window.electronAPI.dialogSelectApp()
    inputSelectedApp.value = appFilepath
    changedInputSelectedApp()
});
btnOpenApp.addEventListener('click', async () => {
    if (inputSelectedApp.value == ''){
        createAlert('warning','Select an .app first.')
        return;
    }

    const result = await window.electronAPI.openApp(inputSelectedApp.value)

    if (result != ''){
        createAlert('error','An error occurred: '+result)
        return;
    }

    createAlert('info','App started successfully.')
});
btnModalYesDeleteBackupApp.addEventListener('click', async () => {
    if (inputSelectedApp.value == ''){
        createAlert('warning','Select an .app first.')
        return;
    }

    const result = await window.electronAPI.deleteBackupApp(inputSelectedApp.value)

    if (result != ''){
        createAlert('error','An error occurred: '+result)
        return;
    }
    inputSelectedApp.value = ''
    changedInputSelectedApp()
    createAlert('info','Backup app deleted successfully.')
});
btnCopyBackupApp.addEventListener('click', async () =>{
    if (inputSelectedApp.value == ''){
        createAlert('warning','Select an .app first.')
        return;
    }

    const result = await window.electronAPI.copyBackupApp(inputSelectedApp.value)

    if (result != ''){
        createAlert('error','An error occurred: '+result)
        return;
    }

    createAlert('info','Backup app copied successfully.')
});

window.electronAPI.enableSelectApp((_event, value) => {
    //console.log('value: '+value);
    if (value == 1){
        btnSelectApp.removeAttribute('disabled')
        btnOpenApp.removeAttribute('disabled')
        createAlert('info','App closed successfully')
        return;
    }
    btnSelectApp.setAttribute('disabled','')
    btnOpenApp.setAttribute('disabled','')
});

function createAlert(type,message){
    const icon = document.createElement('i')
    const alert = document.createElement('div')
    const closeButton = document.createElement('button')
    const tagMessage = document.createElement('p')
    const tagDate = document.createElement('small')

    const date = Date.now();
    const dateOptions = { day:"numeric", year:"numeric", month:"short", hour:"numeric",minute:"numeric"};

    closeButton.classList.add('btn-close')
    closeButton.setAttribute('data-bs-dismiss','alert')
    closeButton.setAttribute('aria-label','Close')

    tagMessage.classList.add('mb-0','me-auto')
    tagMessage.textContent = message

    tagDate.classList.add('mb-0')
    tagDate.textContent = new Date(date).toLocaleDateString('en-US', dateOptions);

    switch (type){
        case 'info':
            alert.classList.add('alert-primary')
            icon.classList.add('bi', 'bi-info-square-fill', 'me-2')
            break;
        case 'warning':
            alert.classList.add('alert-warning')
            icon.classList.add('bi', 'bi-exclamation-triangle-fill', 'me-2')
            break;
        case 'error':
            alert.classList.add('alert-danger')
            icon.classList.add('bi', 'bi-x-square-fill', 'me-2')
            break;
    }

    alert.classList.add('alert', 'alert-dismissible', 'd-flex', 'align-items-center','mb-2')
    alert.setAttribute('role','alert')
    alert.append(icon,tagMessage,tagDate,closeButton)

    divAlerts.prepend(alert)
}

function createToast(type,message){

    const icon = document.createElement('i')
    const toast = document.createElement('div')
    const toastHeader = document.createElement('div')
    const toastHeaderText = document.createElement('strong')
    const toastBody = document.createElement('div')
    const closeButton = document.createElement('button')

    closeButton.classList.add('btn-close')
    closeButton.setAttribute('data-bs-dismiss','toast')
    closeButton.setAttribute('aria-label','Close')

    switch (type){
        case 'info':
            toastHeaderText.innerText = 'Info'
            icon.classList.add('bi', 'bi-info-square-fill', 'me-2', 'text-primary')
            break;
        case 'warning':
            toastHeaderText.innerText = 'Warning'
            icon.classList.add('bi', 'bi-exclamation-triangle-fill', 'me-2','text-warning')
            break;
        case 'error':
            toastHeaderText.innerText = 'Error'
            icon.classList.add('bi', 'bi-x-square-fill', 'me-2','text-danger')
            break;
    }

    toast.classList.add('toast','fade','show','text-black','mb-2')
    toastHeader.classList.add('toast-header')
    toastBody.classList.add('toast-body')
    toastHeaderText.classList.add('me-auto')

    toastHeader.append(icon,toastHeaderText,closeButton)
    toastBody.append(message)

    toast.setAttribute('role','alert')
    toast.setAttribute('aria-live','assertive')
    toast.setAttribute('aria-atomic','true')
    toast.append(toastHeader,toastBody)

    divToasts.append(toast)

    /*`<div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <img src="..." class="rounded me-2" alt="...">
      <strong class="me-auto">Bootstrap</strong>
      <small>11 mins ago</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      Hello, world! This is a toast message.
    </div>
  </div>`*/
}