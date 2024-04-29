let token; // token is updated upon login
let allTransactions = []; // store all transactions after fetching

async function login(credentials) {
  const loginUrl = "https://01.kood.tech/api/auth/signin";
  const headers = new Headers();
  headers.append("Authorization", "Basic " + btoa(credentials)); // 'btoa' encodes credentials to base64

  return fetch(loginUrl, {
    method: "POST",
    headers: headers,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed! " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      token = data;
      console.log("Token received:", token);
      return token;
    })
    .catch((error) => {
      console.error("Error during login:", error);
      return null;
    });
}

function performLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const credentials = username + ":" + password;

  login(credentials)
    .then((token) => {
      if (token) {
        console.log("Logged in successfully!");
        fetchUserData();
        fetchTransaction();
      } else {
        console.error("Login failed: Token is null");
        alert("Login failed!");
      }
    })
    .catch((error) => {
      console.error("An error occurred during login:", error);
      alert("An error occurred: " + error.message);
    });
}

function fetchUserData() {
  fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
            query{
                    user {
                        id
                        login
                        attrs
                    }
                }`,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Received user data:", data);
      const user = data.data.user[0];
      document.getElementById("userData").innerHTML = `
            <h2>User Data</h2>
            <p>ID: ${user.id}</p>
            <p>Username: ${user.login}</p>
            <p>Email: ${user.attrs.email}</p>
            <p>Telephone: ${user.attrs.tel}</p>
        `;
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      alert("Error fetching user data");
    });
}

async function fetchTransaction() {
  document.getElementById("transactionData").innerHTML = "";

  fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query {
            transaction(where: {type:{_eq:"xp"}}){
                amount
                type
                object{
                    name
                    type
                }
                event{
                    object{
                        name
                    }
                }
            }
        }`,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      allTransactions = data.data.transaction; // Store fetched transactions
      console.log("Transactions fetched and stored.");
    })
    .catch((error) => {
      console.error("Error fetching transactions:", error);
      alert("Error fetching transactions");
    });
}

async function displayCategory(category) {
  document.getElementById("transactionData").innerHTML = ""; // Clear previous data
  const filteredTransactions = allTransactions.filter((tx) =>
    tx.event.object.name.includes(category)
  );

  let transactionsHtml = filteredTransactions
    .map(
      (tx) => `
    <li>${tx.amount} XP - ${tx.object.name} (${tx.object.type})</li>
  `
    )
    .join("");

  document.getElementById("transactionData").innerHTML = `
    <h2>${category} Transactions</h2>
    <ul>${transactionsHtml}</ul>
  `;
}

function logout() {
  token = null;
  allTransactions = [];
  document.getElementById("userData").innerHTML = "";
  document.getElementById("transactionData").innerHTML = "";
  console.log("Logged out successfully!");
}
