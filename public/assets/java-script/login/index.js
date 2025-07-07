document.kirim.onsubmit = (e) => {
    e.preventDefault();
    const username = document.kirim.username.value;
    const password = document.kirim.password.value;

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    }).then(async (response) => {
        if (response.ok) {
            location.href = "/";
        } else {
            const result = await response.text();

            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: result?.message || "Chek kembali Username or Password.",
                confirmButtonText: 'Tutup',
            });
            document.body.classList.remove('swal2-shown', 'swal2-height-auto');

        }
    });
};

document
    .querySelector(".sing-up")
    .addEventListener("click", () => (location.href = "./daftar-login/"));

document
    .querySelector(".forgot")
    .addEventListener("click", () => (location.href = "./lupa-password/"));


const togglePassword = document.getElementById('toggle-password');
const passwordField = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});
