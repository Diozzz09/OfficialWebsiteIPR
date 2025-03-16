import { getFirestore, collection, addDoc, doc, getDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const db = getFirestore();

// Kuota awal jika belum ada di database
const defaultQuota = { secaba: 20, Catar: 10 };

// Ambil data kuota dari Firestore
async function fetchQuota() {
    const docRef = doc(db, "kuota", "pendaftaran");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        await updateDoc(docRef, defaultQuota);
        return defaultQuota;
    }
}

// Update kuota di Firestore
async function updateQuota(classType, newQuota) {
    const docRef = doc(db, "kuota", "pendaftaran");
    await updateDoc(docRef, { [classType]: newQuota });
}

// Fungsi utama
document.addEventListener("DOMContentLoaded", async function () {
    let quota = await fetchQuota(); // Ambil kuota terbaru

    let secabaQuota = quota.secaba;
    let CatarQuota = quota.Catar;

    const form = document.getElementById("registrationForm");
    const classSelect = document.getElementById("class");
    const message = document.getElementById("message");

    function updateQuotaDisplay() {
        document.getElementById("secabaQuota").textContent = secabaQuota;
        document.getElementById("CatarQuota").textContent = CatarQuota;
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

        if (selectedClass === "Catar" && CatarQuota === 0) {
            message.textContent = "Kuota Catar telah habis!";
            return;
        }

        if (selectedClass === "SECABA") {
            secabaQuota--;
            await updateQuota("secaba", secabaQuota);
        }
        if (selectedClass === "Catar") {
            CatarQuota--;
            await updateQuota("Catar", CatarQuota);
        }

        sendToDiscord(name, discordUsername, robloxUsername, selectedClass);

        updateQuotaDisplay();

        message.style.color = "green";
        message.textContent = `Pendaftaran ${name} ke kelas ${selectedClass} berhasil!`;

        form.reset();
    });

    function sendToDiscord(name, discordUsername, robloxUsername, selectedClass) {
        const WEBHOOK_URL_DISCORD = "https://discord.com/api/webhooks/1350740584683536395/FZ2ugpWSnENyTINgQdPFYVhwCUeSRkiUKrUPDyNLq8DJa5LegDAST9WI5fA1NGFnaxgt";
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

    async function daftar(event) {
        event.preventDefault();

        let nama = document.querySelector("input[name='nama']").value;
        let discord = document.querySelector("input[name='discord']").value;
        let roblox = document.querySelector("input[name='roblox']").value;
        let kelas = document.querySelector("select[name='kelas']").value;

        try {
            await addDoc(collection(db, "pendaftaran"), {
                nama, discord, roblox, kelas,
                timestamp: new Date()
            });
            alert("Pendaftaran berhasil!");
        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            alert("Terjadi kesalahan.");
        }
    }

    document.querySelector("button").addEventListener("click", daftar);
});
