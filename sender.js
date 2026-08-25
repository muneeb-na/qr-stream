const btnShowSend = document.getElementById('btn-show-send');
const senderSection = document.getElementById('sender-section');
const receiverSection = document.getElementById('receiver-section');
const fileInput = document.getElementById('file-input');
const btnStartSend = document.getElementById('btn-start-send');
const qrContainer = document.getElementById('qr-container');
const sendProgress = document.getElementById('send-progress');

// Toggle UI
btnShowSend.addEventListener('click', () => {
    senderSection.classList.remove('hidden');
    receiverSection.classList.add('hidden');
});

let chunks = [];
let currentFrame = 0;

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const base64String = event.target.result;
        
        // FIX 1: Chunks are now 100 characters so they fit easily!
        const size = 100; 
        const numChunks = Math.ceil(base64String.length / size);
        chunks = [];
        
        for (let i = 0; i < numChunks; i++) {
            chunks.push(`${i}/${numChunks}|${base64String.substring(i * size, (i + 1) * size)}`);
        }
        btnStartSend.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
});

btnStartSend.addEventListener('click', () => {
    qrContainer.classList.remove('hidden');
    qrContainer.innerHTML = ''; 
    
    // FIX 2: Added CorrectLevel.L to maximize data capacity
    const qrcode = new QRCode(qrContainer, { 
        width: 300, 
        height: 300,
        correctLevel: QRCode.CorrectLevel.L 
    });
    
    btnStartSend.disabled = true;
    
    // Rapid fire QR codes every 200ms
    setInterval(() => {
        qrcode.clear();
        qrcode.makeCode(chunks[currentFrame]);
        sendProgress.innerText = `Flashing frame ${currentFrame + 1} of ${chunks.length}`;
        currentFrame = (currentFrame + 1) % chunks.length; 
    }, 200); 
});