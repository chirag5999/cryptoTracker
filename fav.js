let favList = JSON.parse(localStorage.getItem("favourites")) || [];
let coins = [];
let page = 1;
let itemsPerPage = 5;

function renderFavCoins(coins, startIndex) {
  console.log(coins, startIndex, "data");
  let tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  coins.slice(startIndex, startIndex + 5).forEach((coin, index) => {
    let row = renderCoinsByRow(coin, index);
    tbody.appendChild(row);
  });
}

function renderCoinsByRow(coin, index) {
  let row = document.createElement("tr");
  row.classList.add("coin-row");
  row.setAttribute("data-id", coin.id);

  row.innerHTML = `
    <td>${(page - 1) * itemsPerPage + index + 1}</td>
    <td><img src="${coin.image}" alt="${
    coin.name
  }" width="16px" height="16px"/></td>
    <td>${coin.name}</td>
    <td>$${coin.current_price.toLocaleString()}</td>
    <td>$${coin.total_volume.toLocaleString()}</td>
    <td>$${coin.market_cap.toLocaleString()}</td>
    <td><i class="fa-solid fa-trash" style="color: #ec0909;" data-id="${
      coin.id
    }"></i></td>
    `;

  return row;
}

async function fetchFavCoins() {
  let paginationContainer = document.querySelector(".pagination");
  let tbody = document.querySelector("tbody");

  if (favList.length == 0) {
    paginationContainer.style.display = "none";
    tbody.innerHTML = "";
    let row = document.createElement("tr");
    row.innerHTML = `<td colspan="7">No data to display</td>`;
    tbody.appendChild(row);
    return;
  }
  let res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favList.join(
      ","
    )}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
  );
  if (!res.ok) throw new Error("API failed to fetch the data");
  coins = await res.json();
  renderFavCoins(coins, 0);
}

function saveFav() {
  localStorage.setItem("favourites", JSON.stringify(favList));
}

function removeCoin(coinId) {
  if (favList.includes(coinId)) {
    favList = favList.filter((el) => el !== coinId);
  }
  saveFav();
  fetchFavCoins();
}

const handleSortPrice = (order) => {
  coins.sort((a, b) =>
    order == "asc"
      ? a.current_price - b.current_price
      : b.current_price - a.current_price
  );
  renderFavCoins(coins);
};
const handleSortVolume = (order) => {
  coins.sort((a, b) =>
    order == "asc"
      ? a.total_volume - b.total_volume
      : b.total_volume - a.total_volume
  );
  renderFavCoins(coins);
};
const handleSortMarketCap = (order) => {
  coins.sort((a, b) =>
    order == "asc" ? a.market_cap - b.market_cap : b.market_cap - a.market_cap
  );
  renderFavCoins(coins);
};

const handleNext = () => {
  page++;
  renderFavCoins(coins, (page - 1) * itemsPerPage);
  updatePagination();
};

const handlePrev = () => {
  page--;
  renderFavCoins(coins, (page - 1) * itemsPerPage);
  updatePagination();
};

function updatePagination() {
  if (page == 1) document.querySelector(".prev-btn").disabled = true;
  else document.querySelector(".prev-btn").disabled = false;

  if (favList.length < page * itemsPerPage)
    document.querySelector(".next-btn").disabled = true;
  else document.querySelector(".next-btn").disabled = false;
}

document.addEventListener("click", (e) => {
  console.log(e.target.classList.contains("fa-trash"), "boolean");
  if (e.target.classList.contains("fa-trash")) {
    removeCoin(e.target.dataset.id);
  }
});

document
  .querySelector(".sort-asc-price")
  .addEventListener("click", () => handleSortPrice("asc"));
document
  .querySelector(".sort-desc-price")
  .addEventListener("click", () => handleSortPrice("desc"));
document
  .querySelector(".sort-asc-vol")
  .addEventListener("click", () => handleSortVolume("asc"));
document
  .querySelector(".sort-desc-vol")
  .addEventListener("click", () => handleSortVolume("desc"));
document
  .querySelector(".sort-asc-market")
  .addEventListener("click", () => handleSortMarketCap("asc"));
document
  .querySelector(".sort-desc-market")
  .addEventListener("click", () => handleSortMarketCap("desc"));

document.addEventListener("click", (e) => {
  const row = e.target.closest(".coin-row");
  if (row && !e.target.classList.contains("fa-star")) {
    const coinId = row.getAttribute("data-id");
    window.location.href = `coin.html?id=${coinId}`;
  }
});

document.querySelector(".next-btn").addEventListener("click", handleNext);
document.querySelector(".prev-btn").addEventListener("click", handlePrev);

updatePagination();

document.addEventListener("DOMContentLoaded", fetchFavCoins);
