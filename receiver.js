const btnShowReceive = document.getElementById('btn-show-receive');
const btnStartReceive = document.getElementById('btn-start-receive');
const receiveProgress = document.getElementById('receive-progress');
const resultContainer = document.getElementById('result-container');

// Toggle UI
btnShowReceive.addEventListener('click', () => {
    document.getElementById('receiver-section').classList.remove('hidden');
    document.getElementById('sender-section').classList.add('hidden');
});

let receivedChunks = [];
let totalChunks = 0;
let scanner;

btnStartReceive.addEventListener('click', () => {
    btnStartReceive.disabled = true;
    scanner = new Html5Qrcode("reader");
    
    scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 300, height: 300 } },
        (decodedText) => handleScan(decodedText),
        (errorMessage) => { /* ignore normal scan errors */ }
    ).catch(err => alert("Camera error: " + err));
});

function handleScan(text) {
    const parts = text.split('|');
    if (parts.length < 2) return;
    
    const header = parts[0].split('/');
    const index = parseInt(header[0]);
    totalChunks = parseInt(header[1]);
    const data = parts[1];

    if (!receivedChunks[index]) {
        receivedChunks[index] = data; // Slot it into the exact right spot
        
        let count = receivedChunks.filter(Boolean).length;
        receiveProgress.innerText = `Caught ${count} of ${totalChunks} chunks`;

        if (count === totalChunks) {
            finishTransfer();
        }
    }
}

function finishTransfer() {
    scanner.stop();
    receiveProgress.innerText = "Transfer Complete! 🎉";
    const fullBase64 = receivedChunks.join('');
    resultContainer.innerHTML = `<a href="${fullBase64}" download="received_file">Download File</a>`;
}