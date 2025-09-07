// fetch(`https://api.coingecko.com/api/v3/coins/${id}`);

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const coinId = urlParams.get("id");

  const coinContainer = document.getElementById("coin-container");
  const coinImg = document.getElementById("coin-image");
  const coinName = document.getElementById("coin-name");
  const coinDesc = document.getElementById("coin-desc");
  const coinRank = document.getElementById("coin-rank");
  const coinPrice = document.getElementById("coin-price");
  const coinCap = document.getElementById("coin-cap");
  //   const coinContainer = document.getElementById("coin-container");
  //   const coinContainer = document.getElementById("coin-container");

  // const showShimmer = () => {
  //   document.querySelector(".shimmer-container").style.display = "block";
  // };

  // const hideShimmer = () => {
  //   document.querySelector(".shimmer-container").style.display = "none";
  // };
  async function fetchCoinData() {
    try {
      //showShimmer();
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}`
      );
      const data = await res.json();
      displayData(data);
    } catch (err) {
      console.log(err);
    } finally {
      //hideShimmer();
    }
  }

  function displayData(coin) {
    if (!coin) {
      coinContainer.innerHTML = `<p>No data found</p>`;
    }
    coinImg.src = coin.image.large;
    coinName.innerHTML = coin.name;
    console.log(coin.description.en.split(". "), "desc");
    coinDesc.innerHTML = coin.description.en
      ? coin.description.en.split(". ")[0] + "."
      : "No description available";
    coinRank.innerHTML = coin.market_cap_rank || "NA";
    coinPrice.innerHTML = coin.market_data.current_price.usd.toLocaleString();
    coinCap.innerHTML = coin.market_data.market_cap.usd.toLocaleString();
  }

  let coinData = await fetchCoinData();
  updateFavText();

  const ctx = document.getElementById("coinChart").getContext("2d");

  let coinChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Price(USD)",
          data: [],
          borderWidth: 1,
          borderColor: "brown",
          backgroundColor: "gold",
          //   fill: true,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: { display: false },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Price(USD)",
          },
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (value) {
              return "$" + value;
            },
          },
        },
      },
    },
  });

  async function fetchChartData(days) {
    let res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    let data = await res.json();
    updateChart(data);
  }

  function updateChart(data) {
    const labels = data.prices.map((price) => {
      let date = new Date(price[0]);
      return date.toLocaleDateString();
    });
    const priceData = data.prices.map((price) => price[1]);
    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = priceData;
    coinChart.update();
  }

  const buttons = document.querySelectorAll(".btn-container button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");
      const days =
        event.target.id == "24h" ? 1 : event.target.id == "30d" ? 30 : 90;
      fetchChartData(days);
    });
  });

  document.getElementById("24h").click();

  function getFavourites() {
    return JSON.parse(localStorage.getItem("favourites"));
  }

  function saveFav(favlist) {
    localStorage.setItem("favourites", JSON.stringify(favlist));
  }

  function toggleFav() {
    console.log("hi");
    let favlist = getFavourites();
    if (favlist.includes(coinId)) {
      favlist = favlist.filter((el) => el != coinId);
    } else {
      favlist.push(coinId);
    }
    saveFav(favlist);
    updateFavText();
  }

  function updateFavText() {
    let favlist = getFavourites();
    document.querySelector("#add-fav-btn").textContent = favlist.includes(
      coinId
    )
      ? "Remove from Favourites"
      : "Add to Favourites";
  }

  document.querySelector("#add-fav-btn").addEventListener("click", toggleFav);
});
