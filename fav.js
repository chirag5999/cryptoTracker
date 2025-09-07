
let favlist = JSON.parse(localStorage.getItem("favourites")) || [];
let coins = [];
let pageNo = 1;
let itemsPerPage = 25;


function renderFavCoins(coins,startIndex){
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear previous rows
    coins.slice(startIndex,startIndex+25).forEach((coin, index) => {
        row = document.createElement("tr");
        // let isFav = favlist.includes(coin.id);
        row.classList.add("coin-row");
        row.setAttribute("data-id",coin.id);
        row.innerHTML = `
            <td>${(pageNo-1)*itemsPerPage + index + 1}</td>
            <td><img src="${coin.image}" alt="${coin.name}" width="30"></td>
            <td>${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td><i class="fa-solid fa-trash" style = "color:#ec0909" data-id = "${coin.id}"></i></td>
        `;
        tbody.appendChild(row);
    });
}


async function fetchFavCoins(){
    let res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favlist.join(",")},tether&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    coins = await res.json();
    if(coins.length == 0){
        console.error("No coin fetched");
        title.style.display = "block";
        table.style.display = "none";
        pagination.style.display = "none";
        return;
    }
    renderFavCoins(coins,0);
}

function savefavs(){
    localStorage.setItem("favourites",JSON.stringify(favlist));
}

function removeCoin(coinId){
    if(favlist.includes(coinId)){
        favlist = favlist.filter((el) => el !== coinId);
    }
    savefavs();
    fetchFavCoins();
}

document.addEventListener("click",(e) => {
    if(e.target.classList.contains("fa-trash")){
        removeCoin(e.target.dataset.id);
    }

    const row = e.target.closest(".coin-row");
    if(row && !e.target.classList.contains("fa-star")){
        const coinId = row.getAttribute("data-id");
        window.location.href = `coin.html?id=${coinId}`
    }
})

const handleSortPrice = (order) => {
    coins.sort((a,b) => {
        if(order === 'asc'){
            return a.current_price - b.current_price;
        }else{
            return b.current_price - a.current_price;
        }
    })
    renderFavCoins(coins);
}
const handleSortVolume = (order) => {
    coins.sort((a,b) => {
        if(order === 'asc'){    
            return a.total_volume - b.total_volume;
        }else{
            return b.total_volume - a.total_volume;
        }
    })
    renderFavCoins(coins);
}   
const handleSortMarketCap = (order) => {
    coins.sort((a,b) => {
        if(order === 'asc'){
            return a.market_cap - b.market_cap;
        }else{
            return b.market_cap - a.market_cap;
        }  
    })
    renderFavCoins(coins);
}              

const handleNext = () => {
    pageNo++;
    renderFavCoins(coins,(pageNo-1)*itemsPerPage);
    updatePagination();
}

const handlePrev = () => {
    pageNo--;
    renderFavCoins(coins,(pageNo-1)*itemsPerPage);
    updatePagination();
}


function updatePagination(){
    if(pageNo == 1){
        document.querySelector(".prev-btn").disabled = true;
    }else{
        document.querySelector(".prev-btn").disabled = false;
    }

    if(favlist.length < pageNo*itemsPerPage){
        document.querySelector(".next-btn").disabled = true;
    }else{
        document.querySelector(".next-btn").disabled = false;
    }
}




document.querySelector(".sort-asc-price").addEventListener('click', () => handleSortPrice('asc'));
document.querySelector(".sort-desc-price").addEventListener('click',() => handleSortPrice('desc'));
document.querySelector(".sort-asc-volume").addEventListener('click', () => handleSortVolume('asc'));
document.querySelector(".sort-desc-volume").addEventListener('click',() => handleSortVolume('desc'));
document.querySelector(".sort-asc-market").addEventListener('click', () => handleSortMarketCap('asc'));
document.querySelector(".sort-desc-market").addEventListener('click',() => handleSortMarketCap('desc'));

document.querySelector(".next-btn").addEventListener('click',handleNext);
document.querySelector(".prev-btn").addEventListener('click',handlePrev);


updatePagination();

document.addEventListener("DOMContentLoaded", fetchFavCoins);