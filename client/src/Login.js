import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { keccak } from "hash-wasm";

const Notarize = (props) => {
  useEffect(() => {
    console.log("fired");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = e.target.elements;
    const response = await fetch(
      `${process.env.API_BASE_URL}/api/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: username.value, password: password.value}),
      }
    );
    let data = await response.json();
    console.log("fired login: ", data );
    localStorage.setItem('userInfo', JSON.stringify(data))
    let token = JSON.parse(localStorage.getItem('userInfo')).token
    console.log("fired login: ", token );
  };

  return (
    <div class="row">
      <div class="six columns">
        <h4>Login</h4>
        <form onSubmit={handleSubmit}>
          <div class="row">
            <div class="six columns">
              <label for="username">Username</label>
              <input
                class="u-full-width"
                type="text"
                placeholder=""
                id="username"
                value=""
              />
            </div>
            <div class="six columns">
              <label for="password">Password</label>
              <input
                class="u-full-width"
                type="password"
                placeholder=""
                id="password"
                value=""
              />
            </div>
          </div>
          <input
            class="button-primary"
            type="submit"
            id="login"
            value="Login"
          />
        </form>
      </div>
    </div>
  );
};

export default Notarize;
