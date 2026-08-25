const btnShowSend = document.getElementById('btn-show-send');
const senderSection = document.getElementById('sender-section');
const receiverSection = document.getElementById('receiver-section');
const fileInput = document.getElementById('file-input');
const btnStartSend = document.getElementById('btn-start-send');
const qrContainer = document.getElementById('qr-container');
const sendProgress = document.getElementById('send-progress');

// Grab our new buttons
const senderControls = document.getElementById('sender-controls');
const btnStopSend = document.getElementById('btn-stop-send');
const btnResumeSend = document.getElementById('btn-resume-send');

let chunks = [];
let currentFrame = 0;
let streamInterval = null; 
let qrcode = null;

fileInput.addEventListener('change', (e) => {
    // BUG FIX: Kill any running stream if the user selects a new file!
    clearInterval(streamInterval);
    
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const base64String = event.target.result;
        
        const size = 500; 
        const numChunks = Math.ceil(base64String.length / size);
        chunks = [];
        
        for (let i = 0; i < numChunks; i++) {
            chunks.push(`${i}/${numChunks}|${base64String.substring(i * size, (i + 1) * size)}`);
        }
        btnStartSend.classList.remove('hidden');
        senderControls.classList.add('hidden');
        qrContainer.classList.add('hidden');
        sendProgress.innerText = "";
        currentFrame = 0;
    };
    reader.readAsDataURL(file);
});

// Helper function to start/resume the rapid fire loop
function playStream() {
    // BUG FIX: Always clear the timer before starting to prevent duplicate "ghost" timers!
    clearInterval(streamInterval); 
    
    streamInterval = setInterval(() => {
        qrcode.clear();
        qrcode.makeCode(chunks[currentFrame]);
        sendProgress.innerText = `Flashing frame ${currentFrame + 1} of ${chunks.length}`;
        currentFrame = (currentFrame + 1) % chunks.length; 
    }, 80); 
}

btnStartSend.addEventListener('click', () => {
    btnStartSend.classList.add('hidden');
    senderControls.classList.remove('hidden');
    qrContainer.classList.remove('hidden');
    
    // Create the QR generator only once
    qrContainer.innerHTML = ''; 
    qrcode = new QRCode(qrContainer, { 
        width: 400, 
        height: 400,
        correctLevel: QRCode.CorrectLevel.L 
    });
    
    playStream();
    
    // Smooth scroll down to the QR code so it centers on the screen
    setTimeout(() => {
        qrContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
});

// Stop Button Logic
btnStopSend.addEventListener('click', () => {
    clearInterval(streamInterval); // Freezes the timer
    btnStopSend.classList.add('hidden');
    btnResumeSend.classList.remove('hidden');
    sendProgress.innerText = `Paused at frame ${currentFrame} of ${chunks.length}`;
});

// Resume Button Logic
btnResumeSend.addEventListener('click', () => {
    playStream(); // Fires the timer back up
    btnResumeSend.classList.add('hidden');
    btnStopSend.classList.remove('hidden');
});