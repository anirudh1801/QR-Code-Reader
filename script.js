const html5QrCode = new Html5Qrcode("reader");
const scanOption = document.getElementById('scan-option');
const uploadOption = document.getElementById('upload-option');
const fileInput = document.getElementById('file-input');
const reader = document.getElementById('reader');
const result = document.getElementById('result');
const qrResult = document.getElementById('qr-result');
const openLink = document.getElementById('open-link');
const copyText = document.getElementById('copy-text');
const scanNew = document.getElementById('scan-new');
const errorMessage = document.getElementById('error-message');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');

let scanning = false;

scanOption.addEventListener('click', () => {
    if (!scanning) {
        startScanner();
    }
});

uploadOption.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileUpload);

async function startScanner() {
    try {
        // First, get camera permission
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Configure scanner
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        // Start scanner
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanError
        );

        scanning = true;
        reader.style.display = 'block';
        previewContainer.style.display = 'none';
        result.style.display = 'none';
        errorMessage.style.display = 'none';

    } catch (err) {
        console.error("Error starting scanner:", err);
        showError("Error accessing camera. Please ensure camera permissions are granted and you're using a secure connection (HTTPS).");
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = 'block';
    reader.style.display = 'none';

    html5QrCode.scanFile(file, true)
        .then(decodedText => {
            handleResult(decodedText);
        })
        .catch(err => {
            showError("Could not read QR code from image. Please try another image.");
        });
}

function onScanSuccess(decodedText) {
    handleResult(decodedText);
    if (scanning) {
        html5QrCode.stop()
            .then(() => {
                scanning = false;
            })
            .catch(err => console.error("Error stopping scanner:", err));
    }
}

function onScanError(error) {
    // Only log errors, don't show to user unless it's critical
    console.warn(error);
}

function handleResult(decodedText) {
    qrResult.textContent = decodedText;
    result.style.display = 'block';
    reader.style.display = 'none';
    
    if (isValidUrl(decodedText)) {
        openLink.style.display = 'block';
        openLink.onclick = () => {
            const url = decodedText.startsWith('http') ? decodedText : 'https://' + decodedText;
            window.open(url, '_blank');
        };
    } else {
        openLink.style.display = 'none';
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return string.startsWith('www.') || string.includes('.');
    }
}

copyText.addEventListener('click', () => {
    navigator.clipboard.writeText(qrResult.textContent)
        .then(() => {
            copyText.textContent = 'Copied!';
            setTimeout(() => copyText.textContent = 'Copy Text', 2000);
        })
        .catch(() => showError("Failed to copy text"));
});

scanNew.addEventListener('click', () => {
    result.style.display = 'none';
    reader.style.display = 'none';
    previewContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    fileInput.value = '';
    
    if (scanning) {
        html5QrCode.stop()
            .then(() => {
                scanning = false;
                startScanner(); // Restart scanner
            })
            .catch(err => console.error("Error stopping scanner:", err));
    } else {
        startScanner(); // Start new scan
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}