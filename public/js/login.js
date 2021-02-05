const login = async (email, password) => {
  // console.log({ email, password });
  try {
    axios.defaults.withCredentials = true;
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:2000/api/v1/users/signin",
      data: {
        email,
        password,
      },
    });

    if (res.data) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }

    console.log(res);
  } catch (error) {
    console.log(error);
  }
};

document.querySelector(".form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  login(email, password);
});
