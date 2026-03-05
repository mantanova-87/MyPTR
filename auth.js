// auth.js — Authenticator & Emergency Systems
document.addEventListener('DOMContentLoaded', () => {
    // 🔍 1. Initialize Firebase (Namespaced/Compat version)
    // Safely check for the environment bridge
    const firebaseConfig = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {
        apiKey: "LOCAL_BYPASS",
        authDomain: "LOCAL_BYPASS",
        projectId: "LOCAL_BYPASS",
        storageBucket: "LOCAL_BYPASS",
        messagingSenderId: "LOCAL_BYPASS",
        appId: "LOCAL_BYPASS"
    };

    console.log("IACON AUTH: System Initializing...");

    // Only initialize if firebase is actually loaded from the CDN
    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log("IACON AUTH: Cloud Services Linked.");
        } catch (e) {
            console.error("Firebase Init Error:", e);
        }
    } else {
        console.warn("IACON AUTH: Running in Offline/Local Mode.");
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const dangerOverlay = document.getElementById('dangerOverlay');
    const mainContainer = document.querySelector('.container');
    const countdownDisplay = document.getElementById('countdownDisplay');

    if (!loginForm) {
        console.error("IACON AUTH: Login form not found in DOM!");
        return;
    }

    console.log("IACON AUTH: System Ready.");

    let failedAttempts = 0;
    const maxAttempts = 3;

    // 🔐 2. Authentication Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Retrieve values
        const nameInput = document.getElementById('name').value.trim();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        // Reset error state
        errorMessage.classList.remove('show-error');

        // Validation against exact hardcoded credentials
        if (nameInput.toUpperCase() === "MANTAVYA KUMAR" &&
            usernameInput.toLowerCase() === "mantanova-87" &&
            passwordInput === "Man@7487") {

            try {
                // Success: If Firebase is available, perform silent anonymous login
                if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "LOCAL_BYPASS") {
                    document.querySelector('.submit-btn .button-text').textContent = "AUTHORIZING...";
                    await firebase.auth().signInAnonymously();
                }

                // Grant Access Effect
                loginForm.classList.add('access-granted');
                document.querySelector('.submit-btn .button-text').textContent = "ACCESS GRANTED";

                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1000);

            } catch (error) {
                console.error("Cloud Auth Error:", error);
                errorMessage.textContent = `CLOUD CONNECTION FAILED: ${error.message}`;
                errorMessage.classList.add('show-error');
            }

        } else {
            // ❌ 3. Attempt Tracking & Failure Logic
            failedAttempts++;

            if (failedAttempts >= maxAttempts) {
                triggerShutdownSequence();
            } else {
                errorMessage.textContent = `ACCESS DENIED. INVALID CREDENTIALS. (${maxAttempts - failedAttempts} ATTEMPTS REMAINING)`;
                errorMessage.classList.add('show-error');

                loginForm.classList.add('error-shake');
                setTimeout(() => {
                    loginForm.classList.remove('error-shake');
                }, 500);
            }
        }
    });

    // 🔊 4. Emergency Siren Logic
    let audioCtx, oscillator, gainNode, sirenInterval;

    function playSiren() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            oscillator = audioCtx.createOscillator();
            gainNode = audioCtx.createGain();
            oscillator.type = 'square';
            oscillator.frequency.value = 800;
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            gainNode.gain.value = 0.1;
            oscillator.start();

            let isHigh = true;
            sirenInterval = setInterval(() => {
                if (oscillator && audioCtx) {
                    oscillator.frequency.setValueAtTime(isHigh ? 600 : 800, audioCtx.currentTime);
                    isHigh = !isHigh;
                }
            }, 500);
        } catch (e) {
            console.error("Audio block:", e);
        }
    }

    function stopSiren() {
        if (sirenInterval) clearInterval(sirenInterval);
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
        }
    }

    // ⚠️ 5. Shutdown Sequence
    function triggerShutdownSequence() {
        mainContainer.style.display = 'none';
        dangerOverlay.classList.remove('hidden');
        playSiren();

        let secondsLeft = 10;
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            countdownDisplay.textContent = `SYSTEM SHUTDOWN IN ${secondsLeft} SECONDS`;

            if (secondsLeft <= 0) {
                clearInterval(countdownInterval);
                stopSiren();
                dangerOverlay.classList.add('hidden');
                initiateSystemOffline();
            }
        }, 1000);
    }

    // 🌑 6. System Offline & Reboot PIN
    const offlineOverlay = document.getElementById('offlineOverlay');
    const rebootOverlay = document.getElementById('rebootOverlay');
    const rebootPinInput = document.getElementById('rebootPin');
    const rebootError = document.getElementById('rebootError');
    let isOffline = false;
    let isRebooting = false;

    function initiateSystemOffline() {
        offlineOverlay.classList.remove('hidden');
        isOffline = true;
        document.addEventListener('keydown', () => {
            if (isOffline && !isRebooting) {
                isRebooting = true;
                rebootOverlay.classList.remove('hidden');
                rebootPinInput.focus();
            }
        });
    }

    rebootPinInput.addEventListener('input', (e) => {
        rebootError.textContent = '';
        if (rebootPinInput.value.length === 4) {
            if (rebootPinInput.value === "7487") {
                window.location.href = "/";
            } else {
                rebootError.textContent = "INVALID PIN. ACCESS DENIED.";
                rebootPinInput.value = '';
            }
        }
    });
});
