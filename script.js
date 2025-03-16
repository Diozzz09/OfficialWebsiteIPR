// Menambahkan class 'scrolled' saat user melakukan scroll
window.addEventListener("scroll", function() {
    let header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// Buat modal dinamis
document.body.innerHTML += `
    <div id="myModal" class="modal">
        <span class="close">&times;</span>
        <img id="modalImg">
    </div>
`;

const modal = document.getElementById("myModal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close");

// Event: Klik dua kali pada gambar untuk menampilkan modal
document.querySelectorAll(".Bandara img, .pesawat img, .seat img").forEach(img => {
    img.addEventListener("dblclick", function () {
        modal.style.display = "flex";
        modalImg.src = this.src; // Tampilkan gambar yang diklik
    });
});

// Event: Klik tombol close untuk menutup modal
closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
});

// Event: Klik di luar gambar untuk menutup modal
modal.addEventListener("click", function (e) {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
