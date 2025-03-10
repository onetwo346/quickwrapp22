// Variables
const enterChatBtn = document.getElementById("enter-chat-btn");
const generateCodeBtn = document.getElementById("generate-code-btn");
const joinChatBtn = document.getElementById("join-chat-btn");
const sendMsgBtn = document.getElementById("send-msg-btn");
const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const chatList = document.getElementById("chat-list");
const paymentModal = document.getElementById("payment-modal");
const mainPage = document.getElementById("main-page");
const introPage = document.getElementById("intro-page");
const stripePaymentBtn = document.getElementById("stripe-payment-btn");
const cryptoPaymentBtn = document.getElementById("crypto-payment-btn");

let peerConnection;
let localStream;
let remoteStream;
let currentCode = "";

// WebRTC and Media Stream Setup
function setupWebRTC() {
    localStream = new MediaStream();
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
            localStream.addTrack(stream.getAudioTracks()[0]);
        })
        .catch(err => console.error("Media Error:", err));
}

// Payment System (Stripe & Crypto)
function showPaymentModal() {
    paymentModal.classList.remove("hidden");
}

stripePaymentBtn.addEventListener("click", async () => {
    // Stripe payment integration
    const stripe = Stripe('your-stripe-public-key');
    const paymentIntent = await fetch('/create-payment-intent', { method: 'POST' }).then(res => res.json());
    const result = await stripe.confirmCardPayment(paymentIntent.client_secret);
    if (result.error) {
        alert("Payment failed");
    } else {
        alert("Payment successful");
        localStorage.setItem("premium", "true");
    }
});

cryptoPaymentBtn.addEventListener("click", () => {
    // Crypto payment integration (QR code logic here)
    alert("Crypto payment selected");
    localStorage.setItem("premium", "true");
});

// Code Generation & Joining Logic
generateCodeBtn.addEventListener("click", () => {
    currentCode = Math.floor(Math.random() * 1000000);
    chatList.innerHTML = `<p>Your code: ${currentCode}</p>`;
});

joinChatBtn.addEventListener("click", () => {
    const codeToJoin = prompt("Enter code to join:");
    if (codeToJoin) {
        connectToPeer(codeToJoin);
    }
});

// P2P Communication
function connectToPeer(code) {
    peerConnection = new RTCPeerConnection();
    peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
            sendMessageToPeer(code, { type: 'ice', candidate: event.candidate });
        }
    });

    // Establish connection using WebRTC
    peerConnection.createOffer().then(offer => {
        return peerConnection.setLocalDescription(offer);
    }).then(() => {
        sendMessageToPeer(code, { type: 'offer', offer: peerConnection.localDescription });
    });

    peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === "connected") {
            alert("Connected!");
        }
    };
}

// Send messages to peer
function sendMessageToPeer(code, message) {
    // You can use WebSocket or any signaling service here to send messages to the peer
    console.log("Sending message to peer: ", message);
}

// Chat Message Send
sendMsgBtn.addEventListener("click", () => {
    const msg = messageInput.value;
    if (msg) {
        messages.innerHTML += `<p>You: ${msg}</p>`;
        messageInput.value = "";
    }
});

// Handle User Session (IP Tracking)
(function trackIP() {
    let ip = localStorage.getItem("ip");
    if (!ip) {
        ip = Math.random().toString(36).substring(7);
        localStorage.setItem("ip", ip);
        showPaymentModal();
    } else if (localStorage.getItem("premium") !== "true") {
        alert("Welcome back!");
    }
})();

// Initial UI Handling
enterChatBtn.addEventListener("click", () => {
    introPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    setupWebRTC();
});
