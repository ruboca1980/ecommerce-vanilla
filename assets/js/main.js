async function getProducts() {
    try {
        const data = await fetch(
            "https://ecommercebackend.fundamentos-29.repl.co/"
        );

        const res = await data.json();

        window.localStorage.setItem("products", JSON.stringify(res));

        return res;
    } catch (error) {
        console.log(error);
    }
}
function printProducts(db) {
    const productsHTML = document.querySelector(".products")

    let html = ""

    for (const product of db.products) {
        html += `
        <div class="product ${product.category}">
            <div class="product__img">
                <img src="${product.image}" alt="imagen" />
            </div>

            <div class="product__info">
                <div class="product__info-priceStock">
                    <h4>$${product.price}.00</h4> 
                    ${product.quantity
                        ? `<span><b>Stock: ${product.quantity} </b></span>`
                        : `<p class='soldOut'> Sold out</p>`
                    }
                    
                </div>
                <h5 class="product__info-h5">${product.name}  </h5>
                <div class="product__info-plus">
                    ${product.quantity
                        ? `<i class='bx bx-plus' id='${product.id}'></i>`
                        : ` `
                    }
                </div>
            </div> 
        </div>
        `;
    }

    productsHTML.innerHTML = html
}
async function showMenu() {
    const iconClose= document.querySelector(".x-menu")
    const iconShowMenu = document.querySelector(".bxs-dashboard")
    const menuHome = document.querySelector(".menu__home")
    const menuProduct = document.querySelector(".menu__product")
    const menu = document.querySelector(".menu")
    
    await [iconClose, iconShowMenu, menuHome, menuProduct].forEach(icon => {
        icon.addEventListener("click", () => menu.classList.toggle("menu__show"));
    });
}
async function showCart() {
    const iconCloseCart = document.querySelector(".x-cart")
    const iconCartHTML = document.querySelector(".bx-shopping-bag")
    const cartHTML = document.querySelector(".cart")

    await [iconCloseCart, iconCartHTML].forEach(icon => {
        icon.addEventListener("click", () => cartHTML.classList.toggle("cart__show"));
    });
}
function navScroll() {
    const headerNavbar = document.querySelector(".header__navbar")
    window.addEventListener("scroll", () => {
        console.log()
        if (window.scrollY > 30) {
            headerNavbar.classList.add("header__navbar-animation")
        } else{
            headerNavbar.classList.remove("header__navbar-animation")
        }
    })
}
function addToCartFromProducts(db) {
    const productsHTML = document.querySelector(".products")

    productsHTML.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.id)

            const productFind = db.products.find(
                (product) => product.id === id
            )

            if (db.cart[productFind.id]) {
                if (productFind.quantity === db.cart[productFind.id].amount) 
                    return alert("Stcok agotado")
                db.cart[productFind.id].amount++
            } else {
                db.cart[productFind.id] = {...productFind, amount: 1}
            }

            window.localStorage.setItem("cart", JSON.stringify(db.cart))
            printProductsInCart(db)
            printTotal(db)
            handlePrintAmountProducts(db)
        }
    })
}
function printProductsInCart(db) {
    const cartProducts = document.querySelector(".cart__products")

    let html = ''
    for (const product in db.cart) {
        const { quantity, price, name, image, id, amount } = db.cart[product]

        html += `
            <div class="cart__product">
                <div class="cart__product--img">
                    <img src="${image}" alt="imagen" />
                </div>
                <div class="cart__product--body">
                    <h4 class="cart__product--body-h4">${name}</h4>
                    <p class="cart__product--body-p">Stock: ${quantity} | <span>$${price}.00</span></p>
                    <span>Subtotal: $${price*amount}</span>
                    <div class="cart__product--body--op" id="${id}">
                        <i class="bx bx-minus cart__product--body-h4"></i>
                        <p class="cart__product--body-h4" >${amount} units</p>
                        <i class="bx bx-plus cart__product--body-h4"></i>
                        <i class="bx bx-trash-alt cart__product--body-h4"></i>
                    </div>
                </div>
            </div>
        `
    }

    cartProducts.innerHTML = html
}
function handleProductsInCart(db) {
    const cartProducts = document.querySelector(".cart__products")

    cartProducts.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.parentElement.id)
            const productFind = db.products.find(
                (product) => product.id === id
            )
            if (productFind.quantity === db.cart[productFind.id].amount) 
                return alert("Stcok agotado")
            db.cart[id].amount++
        }
        if (e.target.classList.contains("bx-minus")) {
            const id = Number(e.target.parentElement.id)
            if (db.cart[id].amount === 1) {
                const response = confirm("Desea eliminar este producto?")
                if (!response) return;
                delete db.cart[id]
            } else {
                db.cart[id].amount--
            }
        }
        if (e.target.classList.contains("bx-trash-alt")) {
            const id = Number(e.target.parentElement.id)
            const response = confirm("Desea eliminar este producto?")
                if (!response) return;
            delete db.cart[id]
        }

        window.localStorage.setItem("cart", JSON.stringify(db.cart))
        printProductsInCart(db)
        printTotal(db)
        handlePrintAmountProducts(db)
    })
}
function printTotal(db) {
    const infoTotal = document.querySelector(".info__total")
    const infoAmount = document.querySelector(".info__amount")

    
    let totalProducts = 0
    let amountProducts = 0
    
    for (const product in db.cart) {
        const { amount, price } = db.cart[product]
        totalProducts += price * amount
        amountProducts += amount
    }

    infoTotal.textContent = "$" + totalProducts + ".00"
    infoAmount.textContent = amountProducts + " items"
}
function handleTotal(db) {
    const btnBuy = document.querySelector(".btn__buy")
    btnBuy.addEventListener("click", function () {
        if (!Object.values(db.cart).length) return alert("el carrito se encuentra vacio")
        const response = confirm("Desea realizar la compra?")
        if (!response) return
        
        const currentProducts = []

        for (const product of db.products) {
            const productsCart = db.cart[product.id] 
            if (product.id === productsCart?.id) {
                currentProducts.push({
                    ...product,
                    quantity: product.quantity - productsCart.amount
                })
            } else {
                currentProducts.push(product)
            }
        }

        db.products = currentProducts
        db.cart = {}
        
        window.localStorage.setItem("products", JSON.stringify(db.products))
        window.localStorage.setItem("cart", JSON.stringify(db.cart))
        printTotal(db)
        printProductsInCart(db)
        printProducts (db)
        handlePrintAmountProducts(db)
    })
}
function handlePrintAmountProducts(db) {
    const amountProducts = document.querySelector(".amountProducts")

    let amount = 0

    for (const product in db.cart) {
        amount += db.cart[product].amount
    }

    amountProducts.textContent = amount
}
function darkModo() {
    const iconDarkMode = document.querySelector(".bx-moon")
    const bodyDarkmode = document.querySelector(".body")

    iconDarkMode.addEventListener("click", () => bodyDarkmode.classList.toggle("dark-theme"));
}
function loading() {
    const load = document.querySelector(".loading")

    setTimeout(() => {
        load.classList.toggle("loading2")
    }, 2000);
}

async function main() {
    const db = {
        products: 
            JSON.parse(window.localStorage.getItem("products")) || 
            await getProducts(),
        cart: JSON.parse(window.localStorage.getItem("cart")) || {}
    }        

    printProducts (db)
    showCart()
    showMenu()
    navScroll()
    addToCartFromProducts(db)
    printProductsInCart(db)
    handleProductsInCart(db)
    printTotal(db)
    handleTotal(db)
    handlePrintAmountProducts(db)
    darkModo()
    loading()

    mixitup(".products", {
        selectors: {
            target: '.product'
        },
        animation: {
            duration: 300
        }
    });


}

main();







