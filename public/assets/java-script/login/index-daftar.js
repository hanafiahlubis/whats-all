document.kirim.onsubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("username", document.kirim.username.value);
    data.append("password", document.kirim.password.value);
    data.append("name", document.kirim.nama.value);
    data.append("file", document.kirim.file.files[0]);

    document.querySelector("#daftar-button button").disabled = true;

    try {
        const response = await fetch("/api/akun", {
            method: "POST",
            body: data,
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: result?.message || "Akun berhasil dibuat!",
                confirmButtonText: 'Tutup',
            }).then(() => {

                location.href = "/login";
            });
            document.body.classList.remove('swal2-shown', 'swal2-height-auto');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: result?.message || "Terjadi kesalahan! Periksa kembali input Anda.",
                confirmButtonText: 'Tutup',
            });
            document.body.classList.remove('swal2-shown', 'swal2-height-auto');

        }
    } catch (error) {
        // Catch and handle any errors that occurred during the request
        console.error('Error during form submission:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Terjadi kesalahan saat menghubungi server. Coba lagi nanti.',
            confirmButtonText: 'Tutup',
        });
        document.body.classList.remove('swal2-shown', 'swal2-height-auto');

    } finally {
        document.querySelector("#daftar-button button").disabled = false;
    }
};

document
    .querySelector(".forgot")
    .addEventListener("click", () => (location.href = "../lupa-password/"));
document
    .querySelector(".login")
    .addEventListener("click", () => (location.href = "/login"));


const togglePassword = document.getElementById('toggle-password');
const passwordField = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

const fileInput = document.getElementById('file');
const fileNameEl = document.getElementById('file-name');

fileInput.addEventListener('change', () => {
    fileNameEl.textContent = fileInput.files.length
        ? fileInput.files[0].name
        : 'You can attach a media file';
    const fileWrapper = document.querySelector(".file-wrapper");
    fileInput.files.length && (fileWrapper.style.flexDirection = "row");
    !fileInput.files.length && (fileWrapper.style.flexDirection = "column");
});
