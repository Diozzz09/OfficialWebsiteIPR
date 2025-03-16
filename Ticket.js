import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const db = window.db;  // Ambil Firestore dari global variable

if (!db) {
    console.error("❌ Firebase belum ter-inisialisasi. Periksa urutan pemanggilan script di HTML.");
} else {
    console.log("✅ Firestore siap digunakan.");
}

// Kuota awal jika belum ada di database
const defaultQuota = { secaba: 20, catar: 10 };

// Ambil data kuota dari Firestore
async function fetchQuota() {
    const docRef = doc(db, "kuota", "pendaftaran");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        await setDoc(docRef, defaultQuota);
        return defaultQuota;
    }
}

// Update kuota di Firestore
async function updateQuota(classType, newQuota) {
    await updateDoc(doc(db, "kuota", "pendaftaran"), { [classType]: newQuota });
}

// Fungsi utama
document.addEventListener("DOMContentLoaded", async function () {
    let quota = await fetchQuota();

    let secabaQuota = quota.secaba;
    let catarQuota = quota.catar;

    const form = document.getElementById("registrationForm");
    const classSelect = document.getElementById("class");
    const message = document.getElementById("message");

    // Update tampilan kuota
    function updateQuotaDisplay() {
        document.getElementById("secabaQuota").textContent = secabaQuota;
        document.getElementById("catarQuota").textContent = catarQuota;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

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

        if (selectedClass === "CATAR" && catarQuota === 0) {
            message.textContent = "Kuota CATAR telah habis!";
            return;
        }

        // Kurangi kuota dan update ke Firestore
        if (selectedClass === "SECABA") {
            secabaQuota--;
            await updateQuota("secaba", secabaQuota);
        }
        if (selectedClass === "CATAR") {
            catarQuota--;
            await updateQuota("catar", catarQuota);
        }

        // Simpan data ke Firestore
        try {
            await addDoc(collection(db, "pendaftaran"), {
                nama: name,
                discord: discordUsername,
                roblox: robloxUsername,
                kelas: selectedClass,
                timestamp: new Date()
            });
            console.log("✅ Data pendaftaran berhasil disimpan.");
        } catch (error) {
            console.error("❌ Gagal menyimpan data:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
            return;
        }

        // Kirim data ke Discord
        sendToDiscord(name, discordUsername, robloxUsername, selectedClass);

        updateQuotaDisplay();

        message.style.color = "green";
        message.textContent = `Pendaftaran ${name} ke kelas ${selectedClass} berhasil!`;

        form.reset();
    });

    function sendToDiscord(name, discordUsername, robloxUsername, selectedClass) {
        const WEBHOOK_URL_DISCORD = "https://discord.com/api/webhooks/1350740584683536395/FZ2ugpWSnENyTINgQdPFYVhwCUeSRkiUKrUPDyNLq8DJa5LegDAST9WI5fA1NGFnaxgt"; // Ganti dengan webhook Discord
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
        }).then(response => console.log("✅ Data dikirim ke Discord"))
        .catch(error => console.error("❌ Gagal mengirim ke Discord:", error));
    }

    updateQuotaDisplay();
});
