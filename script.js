let coins = [];
let currentPage = 1;
let itemsPerPage = 25;
let favlist = JSON.parse(localStorage.getItem("favourites")) || [];
let paginationContainer = document.querySelector(".pagination");

function renderCoinsByRow(coin, index) {
  let row = document.createElement("tr");
  row.classList.add("coin-row");
  row.setAttribute("data-id", coin.id);
  let isFav = favlist.includes(coin.id);

  row.innerHTML = `
    <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
    <td><img src="${coin.image}" alt="${
    coin.name
  }" width="16px" height="16px"/></td>
    <td>${coin.name}</td>
    <td>$${coin.current_price.toLocaleString()}</td>
    <td>$${coin.total_volume.toLocaleString()}</td>
    <td>$${coin.market_cap.toLocaleString()}</td>
    <td><i class="fa-solid fa-star fav-icon ${
      isFav ? "favourite" : ""
    }" data-id="${coin.id}"></i></td>
    `;

  return row;
}

function renderCoins(coins) {
  let tbody = document.querySelector("tbody");
  console.log(tbody);
  tbody.innerHTML = "";
  coins.forEach((coin, index) => {
    let row = renderCoinsByRow(coin, index);
    tbody.appendChild(row);
  });
}

const showShimmer = () => {
  document.querySelector(".shimmer-container").style.display = "block";
  paginationContainer.style.display = "none";
};

const hideShimmer = () => {
  document.querySelector(".shimmer-container").style.display = "none";
  paginationContainer.style.display = "flex";
};

async function fetchCoins() {
  let title = document.querySelector(".no-data-title");
  let table = document.querySelector("table");

  try {
    showShimmer();
    let res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemsPerPage}&page=${currentPage}`
    );
    coins = await res.json();

    if (coins.length == 0) {
      console.error("No coin fetched");
      title.style.display = "block";
      table.style.display = "none";
      paginationContainer.style.display = "none";
      return;
    }
    renderCoins(coins);
  } catch (err) {
    console.log("error fetching the coins", err);
  } finally {
    hideShimmer();
  }
}

function getFavs() {
  return JSON.parse(localStorage.getItem("favourites"));
}

function saveFav() {
  localStorage.setItem("favourites", JSON.stringify(favlist));
}

function handleFav(coinId, coinElement) {
  if (favlist.includes(coinId)) {
    favlist = favlist.filter((el) => el != coinId);
  } else {
    favlist.push(coinId);
  }
  saveFav();
  coinElement.classList.toggle("favourite", favlist.includes(coinId));
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("fa-star")) {
    let coinId = e.target.dataset.id;
    handleFav(coinId, e.target);
  }

  const row = e.target.closest(".coin-row");
  if (row && !e.target.classList.contains("fa-star")) {
    const coinId = row.getAttribute("data-id");
    window.location.href = `coin.html?id=${coinId}`;
  }
});

//debounce function
let timerId;
const debounce = (func, delay) => {
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
};

const handleCloseSearchDialog = () => {
  const searchDialog = document.querySelector(".dialog-box");
  searchDialog.style.display = "none";
};

const showSearchResults = (data) => {
  const searchDialog = document.querySelector(".dialog-box");
  const resultList = document.querySelector(".search-content");
  resultList.innerHTML = "";

  if (data.length) {
    data.forEach((coin) => {
      let listItem = document.createElement("li");
      listItem.innerHTML = `
        <img src="${coin.thumb}" alt="${coin.name}" width="16px" height="16px"/>
        <span>${coin.name}</span>
      `;
      listItem.dataset.id = coin.id;
      resultList.appendChild(listItem);
    });
  } else {
    resultList.innerHTML = `<li>No coins found</li>`;
  }

  resultList.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", (e) => {
      const coinId = e.currentTarget.dataset.id;
      window.location.href = `coin.html?id=${coinId}`;
    });
  });

  searchDialog.style.display = "block";
};

const fetchSearchResult = () => {
  debounce(async () => {
    let searchText = document.querySelector(".search-input").value.trim();
    if (searchText) {
      let results = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${searchText}`
      );
      let searchData = await results.json();
      console.log(searchData, "data");
      showSearchResults(searchData.coins);
    }
  }, 300);
};

function updatePagination() {
  document.querySelector(".prev-btn").disabled = currentPage === 1;
  document.querySelector(".next-btn").disabled = coins.length < itemsPerPage;
}

const handlePrevControls = () => {
  if (currentPage > 1) {
    currentPage--;
    fetchCoins();
    updatePagination();
  }
};

const handleNextControls = () => {
  currentPage++;
  fetchCoins();
  updatePagination();
};

const handleSortPrice = (order) => {
  console.log("hello");
  coins.sort((a, b) =>
    order == "asc"
      ? a.current_price - b.current_price
      : b.current_price - a.current_price
  );
  renderCoins(coins);
};
const handleSortVolume = (order) => {
  console.log("hello");
  coins.sort((a, b) =>
    order == "asc"
      ? a.total_volume - b.total_volume
      : b.total_volume - a.total_volume
  );
  renderCoins(coins);
};
const handleSortMarketCap = (order) => {
  console.log("hello");
  coins.sort((a, b) =>
    order == "asc" ? a.market_cap - b.market_cap : b.market_cap - a.market_cap
  );
  renderCoins(coins);
};

document
  .querySelector(".prev-btn")
  .addEventListener("click", handlePrevControls);
document
  .querySelector(".next-btn")
  .addEventListener("click", handleNextControls);

document.addEventListener("DOMContentLoaded", fetchCoins);
document
  .querySelector(".search-input")
  .addEventListener("input", fetchSearchResult);
document
  .querySelector(".search-icon")
  .addEventListener("click", fetchSearchResult);
document
  .querySelector(".close-icon")
  .addEventListener("click", handleCloseSearchDialog);

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
