const app = Vue.createApp({
    template: `
    <header>
    <h1>{{titel}}</h1>
    <p>{{totalPrice()}}:-</p>
    </header>
    <main :class="currentCategory">
    <button v-for="category in categories" @click="changeCategory(category)" :ref="category">{{category}}</button>
    <span v-if="currentCategory">
    current: {{currentCategory}}
    </span>
    <br>
    <button v-for="type in types" @click="changeType(type)" :ref="type">{{type}}</button>
    <span v-if="currentType">
    current: {{currentType}}
    </span>
    <br>
    <label>Pris: {{currentMaxPrice}}:-
    <br>
    <input type="range" :min="minPrice" :max="maxPrice" @input="renderProducts" v-model="currentMaxPrice">
    </label>
    <section>
    <ul>
    <li v-for="product in currentProducts">
    {{product.name}}
    <button @click="addProduct(product)">Köp</button>
    </li>
    </ul>
    </section>

    <aside>
    <ul>
    <li v-for="[key, value] in orders">
    {{value.name}}
    <button @click="removeProduct(key)">Ta bort</button>
    </li>
    </ul>
    </aside>

    </main>
    <footer>
    {{footerInfo}}
    </footer>
            `,
    data() {
        return {
            titel: "Menu",
            categories: ["Barn", "Vuxen", "Par"],
            types: ["Appetizer", "Main", "Dessert"],
            products: [
                {
                    name: "Skorpa",
                    price: 29,
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
                return price
            },
            minPrice: "",
            maxPrice: "",
            currentMaxPrice: 149,
            currentCategory: "",
            currentType: "",
            currentProducts: [],
            orders: new Map(),
            footerInfo: "This is a footer."
        };
    },
    beforeMount() {
        this.currentProducts = this.products
        for (const {price} of this.products) {
            if (!this.minPrice || price < this.minPrice) {
                this.minPrice = price
            }
            if (!this.maxPrice || price > this.maxPrice) {
                this.maxPrice = price
            }
        }
    },
    components: [],
    methods: {
        renderProducts() {
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
        changeCategory(category) {
            const active = document.querySelector('.activeCat')
            if (active) active.classList.remove('activeCat')
            if (this.currentCategory === category) {
                this.currentCategory = null
            } else {
                this.currentCategory = category
                this.$refs[category][0].classList.add("activeCat")
            }
            this.renderProducts()
        },
        changeType(type) {
            const active = document.querySelector('.activeType')
            if (active) active.classList.remove('activeType')
            if (this.currentType === type) {
                this.currentType = null
            } else {
                this.currentType = type
                this.$refs[type][0].classList.add("activeType")
            }
            this.renderProducts()
        },
        addProduct(product) {
            this.orders.set(new Date(), product)
        },
        removeProduct(product) {
            this.orders.delete(product)
        }
    }
});
app.mount("#menu")