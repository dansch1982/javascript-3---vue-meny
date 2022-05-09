const app = Vue.createApp({
    template: `
    <header>
    <h1>{{title}}</h1>
    <app-total-price :total-price="totalPrice()" />
    </header>

    <main :class="currentCategory">
    
    <nav>

    <h2>Filter</h2>
    
    <section>
    <article class="choices">
    <app-changer v-for="choice in choices" :settings="choice" @callback="callback" />
    </article>
    
    <article>
    <app-nav-range :priceinfo="{currentMaxPrice: currentMaxPrice, minPrice: minPrice, maxPrice: maxPrice}" @changePrice="changePrice" />
    </article>
    
    </section>
    </nav>

    <section class="menu">

    <h2>Menu</h2>

    <app-currentProducts :products="currentProducts" @addProduct="addProduct" />
    </section>

    <aside>
    <h2>Order</h2>
    <app-orders :orders="orders" @removeProduct="removeProduct" :temp="totalPrice()" />
    </aside>

    </main>

    <footer>

    <app-footer :text="footerInfo" />

    </footer>
            `,
    data() {
        return {
            title: "Resturangen Resturang",
            categories: ["Barn", "Vuxen", "Par"],
            choices: [],
            types: ["Appetizer", "Main", "Dessert"],
            temp:0,
            products: [
                {
                    name: "Skorpa",
                    price: 39,
                    categories: ["Vuxen"],
                    types: ["Appetizer"]
                },
                {
                    name: "Pannkakor",
                    price: 49,
                    categories: ["Barn", "Vuxen"],
                    types: ["Appetizer", "Main", "Dessert"]
                },
                {
                    name: "Pasta",
                    price: 109,
                    categories: ["Barn", "Vuxen", "Par"],
                    types: ["Main"]
                },
                {
                    name: "Räkor",
                    price: 149,
                    categories: ["Vuxen", "Par"],
                    types: ["Main"]
                },
            ],
            totalPrice: ()=>{
                let price = 0
                for (const [key, value] of this.orders) {
                    price += value.price
                }
                this.temp = price
                return price
            },
            minPrice: "",
            maxPrice: "",
            currentMaxPrice: 149,
            currentCategory: "",
            currentType: "",
            currentProducts: [],
            orders: new Map(),
            footerInfo: "This is a footer component."
        };
    },
    beforeMount() {
        this.currentProducts = this.products
        for (const {price} of this.products) {
            if (!this.minPrice || price < this.minPrice) {
                this.minPrice = price
            }
            if (!this.maxPrice || price > this.maxPrice) {
                this.currentMaxPrice = price
                this.maxPrice = price
            }
        }
        this.choices.push(
        {type: "Kategori", list: this.categories, event: "changeCategory"},
        {type: "Typ", list: this.types, event: "changeType"},
        )

    },
    components: ['app-title'],
    methods: {
        renderProducts() {
            //this.currentMaxPrice = maxPrice
            this.currentProducts = this.products.filter((product) => {
                if (
                    (product.categories.includes(this.currentCategory) || (!this.currentCategory))
                    && (product.types.includes(this.currentType) || (!this.currentType))
                    && (product.price <= this.currentMaxPrice)
                    ){
                    return true
                } else {
                    return false
                }
            })
        },
        changePrice(price) {
            this.currentMaxPrice = price
            this.renderProducts()
        },
        changeCategory(category) {
            //const active = document.querySelector('.activeCat')
            //if (active) active.classList.remove('activeCat')
            if (this.currentCategory === category) {
                this.currentCategory = null
            } else {
                this.currentCategory = category
                //this.$refs[category][0].classList.add("activeCat")
            }
            this.renderProducts()
        },
        changeType(type) {
            //const active = document.querySelector('.activeType')
            //if (active) active.classList.remove('activeType')
            if (this.currentType === type) {
                this.currentType = null
            } else {
                this.currentType = type
                //this.$refs[type][0].classList.add("activeType")
            }
            this.renderProducts()
        },
        addProduct(product) {
            this.orders.set(new Date(), product)
        },
        removeProduct(product) {
            this.orders.delete(product)
        },
        callback(value) {
            this[value.method](value.args)
        }
    }
});

app.component('app-total-price', {
    template: `
    <p>Nuvarande ordervärde: {{totalPrice}}:-</p>
    `,
    props: ["total-price"]
})

app.component('app-changer', {
    template: `
    <section>
    <h3>{{settings.type}}</h3>
    <section class="buttons">
    <button v-for="item in settings.list" @click="callback(item)" :ref="item" :type="settings.type">{{item}}</button>
    </section>
    </section>
    `,
    methods: {
        callback(value) {
            const button = event.target
            if (button.getAttribute('active')) {
                button.removeAttribute('active')
            } else {
                document.querySelectorAll(`[active][type=${this.settings.type}]`).forEach(element => {
                    element.removeAttribute('active')
                })
                button.setAttribute('active', true)
            }
            this.$emit("callback", {method:this.settings.event,args:value})
        }
    },
    props: ["settings"],
    emits: ["callback"]
})

app.component('app-nav-range', {
    template: `
    <section class="range">
    <h3>Pris</h3>
    <label>{{priceinfo.currentMaxPrice}}:-
    <input type="range" :min="priceinfo.minPrice" :max="priceinfo.maxPrice" @input="renderProducts" v-model="priceinfo.currentMaxPrice">
    </label>
    </section>
    `,
    methods: {
        renderProducts() {
            this.$emit("changePrice", this.priceinfo.currentMaxPrice)
        }
    },
    props: ["priceinfo"]
})

app.component('app-currentProducts', {
    template: `
    <h3>Filtrerade produkter</h3>
    <ul>
    <li v-for="product in products" class="product-card">
    <h1>{{product.name}}</h1>
    <img src="./images/placeholder.png" alt="">
    <span>{{product.price}}:-</span>
    <button @click="addProduct(product)">Köp</button>
    </li>



    </ul>
    `,
    methods: {
        addProduct(product) {
            this.$emit("addProduct", product)
        }
    },
    props: ["products"],
    emits: ["addProduct"]
})

app.component('app-orders', {
    template: `
    <ul>
    <li v-for="[key, value] in orders" class="product">
    <button @click="removeProduct(key)">Ta bort</button>
    {{value.name}}
    </li>
    </ul>
    {{temp}}
    `,
    methods: {
        removeProduct(key) {
            this.$emit("removeProduct", key)
        }
    },
    props: ["orders", "temp"],
    emits: ["removeProduct"]
})

app.component('app-footer', {
    template: `
    <h2>Footer</h2>
    {{text}}
    `,
    props: ["text"]
})

app.mount("#menu")