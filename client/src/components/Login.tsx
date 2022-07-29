/** @jsxImportSource solid-js */
import { Component, onMount } from "solid-js";

const Login: Component = () => {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { username, password } = e.target.elements;
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username.value,
          password: password.value,
        }),
      }
    );
    let data = await response.json();
    console.log(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
  };

  const payload: any = atob(localStorage.getItem("userInfo").split(".")[1]);

  const expiration = new Date(payload.exp);
  const now = new Date();
  const fiveMinutes = 1000 * 60 * 5;

  if (expiration.getTime() - now.getTime() < fiveMinutes) {
    console.log("JWT has expired or will expire soon");
  } else {
    console.log("JWT is valid for more than 5 minutes", payload);
  }

  return (
    <div class="row">
      <div class="six columns">
        <h4>Login</h4>
        <form onSubmit={handleSubmit}>
          <div class="row">
            <label html-for="username">Username</label>
            <input class="input" type="text" placeholder="" id="username" />
          </div>
          <div class="row">
            <label html-for="password">Password</label>
            <input class="input" type="password" placeholder="" id="password" />
          </div>
          <input class="button" type="submit" id="login" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default Login;
