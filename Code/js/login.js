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

	const form = document.querySelector(".form-login");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const emailEl = document.getElementById("email");
		const passEl = document.getElementById("matkhau");
		const email = (emailEl?.value || "").trim().toLowerCase();
		const password = passEl?.value || "";

		if (!email || !password) { alert("Vui lòng nhập đầy đủ email và mật khẩu."); return; }

		const users = getUsers();
		const user = users[email];
		if (!user) { alert("Email không tồn tại."); return; }

		const computed = encodePasswordB64(password);
		if (computed !== user.passB64) { alert("Mật khẩu không đúng."); return; }

		localStorage.setItem("currentUser", JSON.stringify({ email, name: user.name }));
		alert("Đăng nhập thành công!");
		window.location.href = "home.html";
	});
})();
