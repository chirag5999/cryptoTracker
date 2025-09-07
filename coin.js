

document.addEventListener("DOMContentLoaded",async() => {

    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get('id');

    const coinContainer = document.getElementById("coin-container");
    const coinImg = document.getElementById("coin-img");
    const coinName = document.getElementById("coin-name");  
    const coinDesc = document.getElementById("coin-desc");
    const coinRank = document.getElementById("coin-rank");
    const coinPrice = document.getElementById("coin-price");
    const coinCap = document.getElementById("coin-cap");


  

    async function fetchCoinData(){
        try{
            
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            const data =  await res.json();
            displayData(data);
        }catch(err){
            console.log("Error fetching coin data",err);
        }
    }

    function displayData(data){
        if(!data || data.error){
            coinContainer.innerHTML = "<p>Coin data not found.</p>";
            return;
        }
        coinImg.src= data.image.large;
        coinName.innerText = data.name;
        coinDesc.innerHTML = data.description.en ? data.description.en.split(". ")[0] + "." : "Description not available.";
        coinRank.innerText = `Rank: ${data.market_cap_rank ? data.market_cap_rank : "N/A"}`;
        coinPrice.innerText = `Current Price: $${data.market_data.current_price.usd ? data.market_data.current_price.usd.toLocaleString() : "N/A"}`;
        coinCap.innerText = `Market Cap: $${data.market_data.market_cap.usd ? data.market_data.market_cap.usd.toLocaleString() : "N/A"}`;   
    }

    let coinData = await fetchCoinData();
    updateFavText();
    const ctx = document.getElementById('coinChart');

    let coinChart =  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Price(USD)',
        data: [],
        borderWidth: 1,
        borderColor:'brown',
        backgroundColor: 'gold',
        // fill:true,
      }]
    },
    options: {
      scales: {
        x:{
            grid:{display:false},
            title:{
                display:true,
                text:'Date',
            },
        },
        y: {
          beginAtZero: false,
          title:{
            display:true,
            text:'Price(USD)',
          },
          ticks:{
            callback: function(value){
                return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });

  async function fetchChartData(days){
    let res = await fetch(`http://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    let data = await res.json();
    updateChartData(data);
    }
    function updateChartData(data){
        const labels = data.prices.map((price) => {
            let date = new Date(price[0]);
            return date.toLocaleDateString();
        })
        const priceData = data.prices.map((price) => price[1])
        console.log(priceData);
        coinChart.data.labels = labels;
        coinChart.data.datasets[0].data = priceData;
        coinChart.update();
    }
    const buttons = document.querySelectorAll("#btn-container button");
    buttons.forEach(btn => {
        btn.addEventListener('click',(e) => {
            buttons.forEach((btn) => btn.classList.remove("active"));
            e.target.classList.add("active");
            const days = e.target.id == "24h" ? 1:(e.target.id == "30d")?30:90;
            fetchChartData(days);
        })
    })

    document.getElementById("24h").click();
    function getFavourites(){
    return JSON.parse(localStorage.getItem("favourites"));
}

function savefavs(favlist){
    localStorage.setItem("favourites",JSON.stringify(favlist));
}


function togglefav(){
  let favlist = getFavourites()
   if(favlist.includes(coinId)){
        favlist = favlist.filter((el) => el != coinId);
    }else{
        favlist.push(coinId);
    }
    savefavs(favlist);
    updateFavText();
}
function updateFavText(){
  let favlist = getFavourites();
  document.querySelector("#add-fav-btn").textContent = favlist.includes(coinId)?"Remove from favourites":"Add to favouties";
}

document.querySelector("#add-fav-btn").addEventListener('click',togglefav);
});

