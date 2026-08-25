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
        // Chop string into 200 character pieces
        const size = 200;
        const numChunks = Math.ceil(base64String.length / size);
        chunks = [];
        
        for (let i = 0; i < numChunks; i++) {
            // Tag each chunk with its index (e.g., "0/50|data...")
            chunks.push(`${i}/${numChunks}|${base64String.substring(i * size, (i + 1) * size)}`);
        }
        btnStartSend.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
});

btnStartSend.addEventListener('click', () => {
    qrContainer.classList.remove('hidden');
    qrContainer.innerHTML = ''; 
    const qrcode = new QRCode(qrContainer, { width: 300, height: 300 });
    btnStartSend.disabled = true;
    
    // Rapid fire QR codes every 200ms
    setInterval(() => {
        qrcode.clear();
        qrcode.makeCode(chunks[currentFrame]);
        sendProgress.innerText = `Flashing frame ${currentFrame + 1} of ${chunks.length}`;
        currentFrame = (currentFrame + 1) % chunks.length; // Loop continuously 
    }, 200); 
});