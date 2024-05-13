import { createGraph } from "./chart.js";

let token; // token is updated upon login
let allTransactions = []; // store all transactions after fetching
window.login = login;
window.logout = logout;
window.displayCategory = displayCategory;
window.auditsDone = auditsDone;

async function fetchGraphQL(query, variables = {}) {
  const response = await fetch(
    "https://01.kood.tech/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    console.error("Error with GraphQL request", response.statusText);
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error("GraphQL errors occurred");
  }

  return result.data;
}

async function auth(credentials) {
  const loginUrl = "https://01.kood.tech/api/auth/signin";
  const headers = new Headers();
  headers.append("Authorization", "Basic " + btoa(credentials));

  try {
    const response = await fetch(loginUrl, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error("Login failed! " + response.statusText);
    }

    const data = await response.json();
    token = data;
    console.log("Token received:", token);
    return token;
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
}

async function login() {
  window.login = login;

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const credentials = username + ":" + password;

  auth(credentials)
    .then((token) => {
      if (token) {
        console.log("Logged in successfully!");
        fetchUserData();
        fetchXP();
        document.getElementById("login").style.display = "none";
        document.getElementById("select").style.display = "flex";
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

async function fetchUserData() {
  const query = `
    query {
      user {
        id
        login
        attrs
      }
    }`;

  try {
    const data = await fetchGraphQL(query);
    const user = data.user[0];

    document.getElementById("userData").innerHTML = `
      <h2>User Data</h2>
      <p>ID: ${user.id}</p>
      <p>Username: ${user.login}</p>
      <p>Email: ${user.attrs.email}</p>
      <p>Telephone: ${user.attrs.tel}</p>
    `;
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Error fetching user data");
  }
}

// this basically fetches all of the projects/exercises the user has submitted for audit and earned xp from
async function fetchXP() {
  const query = `
    query {
      transaction(where: {type: {_eq: "xp"}}) {
        amount
        object {
          name
          type
        }
        event {
          object {
            name
          }
        }
      }
    }`;

  try {
    const data = await fetchGraphQL(query);
    allTransactions = data.transaction;
    console.log("XP transactions fetched and stored.");
  } catch (error) {
    console.error("Error fetching transactions:", error);
    alert("Error fetching transactions");
  }
}

// in displayCategory() it sorts the projects/exercises for each category it earned the xp in: Go Piscine, Div 01, JS Piscine
async function displayCategory(category) {
  document.getElementById("transactionData").innerHTML = "";
  const filteredTransactions = allTransactions.filter((tx) =>
    tx.event.object.name.includes(category)
  );

  displayTransactions(category, filteredTransactions);
}

async function auditsDone() {
  const query = `
    query {
      transaction(where: {type: {_eq: "up"}}) {
        amount
        object {
          name
          type
        }
      }
    }`;

  try {
    const data = await fetchGraphQL(query);
    const auditTransactions = data.transaction;

    displayTransactions("Audits Done", auditTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    alert("Error fetching transactions");
  }
}

function displayTransactions(title, transactions) {
  const transactionsHtml = transactions
    .map(
      (tx) => `
        <li>${tx.object.name} - ${tx.amount} XP</li>
      `
    )
    .join("");

  const groupedTransactions = transactions.reduce((acc, tx) => {
    const { name, type } = tx.object;
    const key = `${name}`;
    if (acc[key]) {
      acc[key].value += tx.amount;
    } else {
      acc[key] = { label: key, value: tx.amount };
    }
    return acc;
  }, {});

  const graphData = Object.values(groupedTransactions);

  const graphSvg = createGraph(graphData);

  document.getElementById("transactionData").innerHTML = `
    <div>
      <h2>${title}</h2>
      <ul>${transactionsHtml}</ul>
    </div>
    ${graphSvg.outerHTML}
  `;
}

function logout() {
  token = null;
  allTransactions = [];
  document.getElementById("userData").innerHTML = "";
  document.getElementById("transactionData").innerHTML = "";
  document.getElementById("login").style.display = "flex";
  document.getElementById("select").style.display = "none";
  console.log("Logged out successfully!");
}
