// Konfigurasi Firebase (Ganti dengan konfigurasi dari Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyASVIwxP79jvTR7-cGjnqOMlxZEzvcj4Jc",
    authDomain: "pendaftarankuota.firebaseapp.com",
    projectId: "pendaftarankuota",
    storageBucket: "pendaftarankuota.firebasestorage.app",
    messagingSenderId: "1093056904588",
    appId: "1:1093056904588:web:8b8c5956d1fde308d9aaa9"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Kuota awal jika belum ada di database
const defaultQuota = { secaba: 40, akpol: 20 };

// Ambil data kuota dari Firestore
async function fetchQuota() {
    const doc = await db.collection("kuota").doc("pendaftaran").get();
    if (doc.exists) {
        return doc.data();
    } else {
        // Jika belum ada, buat data awal di Firestore
        await db.collection("kuota").doc("pendaftaran").set(defaultQuota);
        return defaultQuota;
    }
}

// Update kuota di Firestore
async function updateQuota(classType, newQuota) {
    await db.collection("kuota").doc("pendaftaran").update({ [classType]: newQuota });
}

// Fungsi utama
document.addEventListener("DOMContentLoaded", async function () {
    let quota = await fetchQuota(); // Ambil kuota terbaru

    let secabaQuota = quota.secaba;
    let akpolQuota = quota.akpol;

    const form = document.getElementById("registrationForm");
    const classSelect = document.getElementById("class");
    const message = document.getElementById("message");

    // Update tampilan kuota
    function updateQuotaDisplay() {
        document.getElementById("secabaQuota").textContent = secabaQuota;
        document.getElementById("akpolQuota").textContent = akpolQuota;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Mencegah submit default

        let name = document.getElementById("name").value.trim();
        let discordUsername = document.getElementById("discordUsername").value.trim();
        let robloxUsername = document.getElementById("robloxUsername").value.trim();
        let selectedClass = classSelect.value;

        if (!name || !discordUsername || !robloxUsername || !selectedClass) {
            message.textContent = "Harap isi semua kolom!";
            return;
        }

        if (selectedClass === "SECABA" && secabaQuota === 0) {
            message.textContent = "Kuota SECABA telah habis!";
            return;
        }

        if (selectedClass === "AKPOL" && akpolQuota === 0) {
            message.textContent = "Kuota AKPOL telah habis!";
            return;
        }

        // Kurangi kuota dan update ke Firestore
        if (selectedClass === "SECABA") {
            secabaQuota--;
            await updateQuota("secaba", secabaQuota);
        }
        if (selectedClass === "AKPOL") {
            akpolQuota--;
            await updateQuota("akpol", akpolQuota);
        }

        // Kirim data ke Discord
        sendToDiscord(name, discordUsername, robloxUsername, selectedClass);

        updateQuotaDisplay();

        message.style.color = "green";
        message.textContent = `Pendaftaran ${name} ke kelas ${selectedClass} berhasil!`;

        form.reset();
    });

    function sendToDiscord(name, discordUsername, robloxUsername, selectedClass) {
        const WEBHOOK_URL_DISCORD = "https://discord.com/api/webhooks/1350740584683536395/FZ2ugpWSnENyTINgQdPFYVhwCUeSRkiUKrUPDyNLq8DJa5LegDAST9WI5fA1NGFnaxgt"; // Ganti dengan webhook Discord Anda
        const data = {
            username: "Pendaftaran Bot",
            embeds: [
                {
                    title: "Pendaftaran Baru 🎉",
                    color: 3066993,
                    fields: [
                        { name: "Nama", value: name, inline: true },
                        { name: "Username Discord", value: discordUsername, inline: true },
                        { name: "Username Roblox", value: robloxUsername, inline: true },
                        { name: "Kelas", value: selectedClass, inline: true }
                    ],
                    timestamp: new Date()
                }
            ]
        };

        fetch(WEBHOOK_URL_DISCORD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                console.log("Pendaftaran berhasil dikirim ke Discord!");
            } else {
                console.error("Gagal mengirim ke Discord.");
            }
        }).catch(error => {
            console.error("Terjadi kesalahan:", error);
        });
    }

    updateQuotaDisplay();
});
