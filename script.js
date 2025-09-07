let coins = [];
let pageNo = 1;
let itemsPerPage = 25;
let favlist = JSON.parse(localStorage.getItem("favourites")) || [];
const pagination = document.querySelector(".pagination")
function renderCoins(coins){
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear previous rows
    coins.forEach((coin, index) => {
        row = document.createElement("tr");
        row.classList.add("coin-row");
        row.setAttribute("data-id",coin.id);
        let isFav = favlist.includes(coin.id);
        row.innerHTML = `
            <td>${(pageNo-1)*itemsPerPage + index + 1}</td>
            <td><img src="${coin.image}" alt="${coin.name}" width="30"></td>
            <td>${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td><i class="fa-solid fa-star fav-icon ${isFav? "favourite" : ""}" data-id = "${coin.id}"></i></td>
        `;
        tbody.appendChild(row);
    });
}

const showShimmer = () => {
document.querySelector('.shimmer-container').style.display = "block";
pagination.style.display = "none";
}
const hideShimmer = () => {
    document.querySelector('.shimmer-container').style.display = "none";
    pagination.style.display = "flex";
}

async function fetchCoins(){
    const title = document.getElementsByClassName("no-data");
    const table = document.querySelector("table");
    
    try{
        showShimmer()
        let res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${itemsPerPage}&page=${pageNo}`)
        coins = await res.json();
        if(coins.length == 0){
            console.error("No coin fetched");
            title.style.display = "block";
            table.style.display = "none";
            pagination.style.display = "none";
            return;
        }
        renderCoins(coins);
    }catch(err){
        console.log("Error fetching the data");
    }finally{
        hideShimmer();
    }
}

function getfavs(){
    return JSON.parse(localStorage.getItem("favourites"));
}

function savefavs(){
    localStorage.setItem("favourites",JSON.stringify(favlist));
}

function handlefav(coinId,coinElement){
    if(favlist.includes(coinId)){
        favlist = favlist.filter((el) => el != coinId);
    }else{
        favlist.push(coinId);
    }
    savefavs(favlist);
    coinElement.classList.toggle("favourite",favlist.includes(coinId));
}

document.addEventListener('click',(e) => {
    if(e.target.classList.contains("fa-star")){
        let coinId = e.target.dataset.id;
        handlefav(coinId,e.target);
    }

    const row = e.target.closest(".coin-row");
    if(row && !e.target.classList.contains("fa-star")){
        const coinId = row.getAttribute("data-id");
        window.location.href = `coin.html?id=${coinId}`
    }
})

const handleCloseSearchDialog = () => {
    const searchDialog = document.querySelector(".dialog-box");
    searchDialog.style.display = "none";
}
const showSearchResults = (data) => {
    const searchDialog = document.querySelector(".dialog-box");
    const resultList = document.querySelector(".search-content");
    resultList.innerHTML = "";
    if(data.length){
        data.forEach((coin) => {
            let listItem = document.createElement("li");
            listItem.innerHTML = `
                <img src = "${coin.thumb}" alt = "${coin.name}" width = "16px" height = "16px"/>
                <span>${coin.name}</span>
            `;
            listItem.dataset.id = coin.id;
            resultList.appendChild(listItem);
        })
    }else{
        resultList.innerHTML = `<li>No coins found.</li>`;
    }
    resultList.querySelectorAll("li").forEach((item) => {
        item.addEventListener('click',(e) => {
            const coinId = e.currentTarget.dataset.id;
            console.log(coinId);
            window.location.href = `coin.html?id=${coinId}`;
        })
    })

    searchDialog.style.display = "block";
}
let timerId;
const debounce = (func,delay) => {
    clearTimeout(timerId);
    timerId = setTimeout(func,delay);
}
const fetchSearchResult = () => {
    debounce(async() => {
    let searchText = document.querySelector(".search-input").value.trim();
    if(searchText){
        let results = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchText}`);
        let searchData = await results.json();
        console.log(searchData);
        showSearchResults(searchData.coins);
    }
    },300);
}
function updatePagination(){
    document.querySelector('.prev-btn').disabled = pageNo == 1;
    document.querySelector('.next-btn').disabled = coins.length < itemsPerPage;
}

const handlePrevControls = () => {
    if(pageNo > 1){
        pageNo--;
        fetchCoins();
        updatePagination();
    }
}
const handleNextControls = () => {
    pageNo++;
    fetchCoins();
    updatePagination();
}

const handleSortPrice = (order) => {
    coins.sort((a,b) => {
        if(order === 'asc'){
            return a.current_price - b.current_price;
        }else{
            return b.current_price - a.current_price;
        }
    })
    renderCoins(coins);
}
const handleSortVolume = (order) => {
    coins.sort((a,b) => {
        if(order === 'asc'){
            return a.total_volume - b.total_volume;
        }else{
            return b.total_volume - a.total_volume;
        }
    })
    renderCoins(coins);
}
const handleSortMarketCap = (order) => {
    coins.sort((a,b) => {
        if(order === 'asc'){
            return a.market_cap - b.market_cap;
        }else{
            return b.market_cap - a.market_cap;
        }
    })
    renderCoins(coins);
}

document.querySelector(".prev-btn").addEventListener('click',handlePrevControls);
document.querySelector(".next-btn").addEventListener('click',handleNextControls);

document.addEventListener("DOMContentLoaded", fetchCoins);
document.querySelector(".search-input").addEventListener('input',fetchSearchResult);
document.querySelector(".search-icon").addEventListener('click',fetchSearchResult);
document.querySelector(".close-icon").addEventListener('click',handleCloseSearchDialog);

document.querySelector(".sort-asc-price").addEventListener('click', () => handleSortPrice('asc'));
document.querySelector(".sort-desc-price").addEventListener('click',() => handleSortPrice('desc'));
document.querySelector(".sort-asc-volume").addEventListener('click', () => handleSortVolume('asc'));
document.querySelector(".sort-desc-volume").addEventListener('click',() => handleSortVolume('desc'));
document.querySelector(".sort-asc-market").addEventListener('click', () => handleSortMarketCap('asc'));
document.querySelector(".sort-desc-market").addEventListener('click',() => handleSortMarketCap('desc'));
