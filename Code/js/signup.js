(function () {
	function toB64(data) {
		const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
		let s = "";
		for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
		return btoa(s);
	}
	function encodePasswordB64(password) {
		const enc = new TextEncoder();
		return toB64(enc.encode(password));
	}
	function getUsers() {
		try { return JSON.parse(localStorage.getItem("users")) || {}; } catch { return {}; }
	}
	function setUsers(users) {
		localStorage.setItem("users", JSON.stringify(users));
	}

	const form = document.querySelector(".form-login");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const nameEl = document.getElementById("ten");
		const emailEl = document.getElementById("email");
		const passEl = document.getElementById("matkhau");
		const agreeEl = document.getElementById("dongy");

		const name = (nameEl?.value || "").trim();
		const email = (emailEl?.value || "").trim().toLowerCase();
		const password = passEl?.value || "";
		const agreed = !!agreeEl?.checked;

		if (!name || !email || !password) { alert("Vui lòng nhập đầy đủ thông tin."); return; }
		if (!agreed) { alert("Vui lòng đồng ý với điều khoản và chính sách."); return; }

		const users = getUsers();
		if (users[email]) { alert("Email đã được đăng ký."); return; }

		try {
			const passB64 = encodePasswordB64(password);

			users[email] = { email, name, passB64 };
			setUsers(users);

			alert("Đăng ký thành công! Vui lòng đăng nhập.");
			window.location.href = "login.html";
		} catch (err) {
			console.error(err);
			alert("Có lỗi xảy ra khi xử lý đăng ký.");
		}
	});
})();