var eventBus = new Vue();

Vue.component("product-tabs", {
  props: {
    reviews: {
      type: Array,
      required: true,
    },
  },
  template: `
  <div>
      <span class="tab"
      :class="{activeTab : selectedTab === tab}"
        v-for="(tab,index) in tabs" 
        :key="index"
        @click="selectedTab = tab"
        >{{ tab }}</span>

    <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
            <li v-for="review in reviews">
                <p>{{ review.name }}</p>
                <p>{{ review.review }}</p>
                <p>Rating : {{ review.rating }}</p>
                <p>Recommend : {{ review.recommendation }}</p>
            </li>
        </ul>
    </div>
  
    <product-review v-show="selectedTab === 'Make a review'"></product-review>
  
  </div>

  `,
  data() {
    return {
      tabs: ["Reviews", "Make a review"],
      selectedTab: "Reviews",
    };
  },
});

Vue.component("product-review", {
  template: `
  <form class=review-form @submit.prevent="onSubmit">

  <p v-if="errors.length">
      <b>Please correct the following error(s) :</b>
      <ul>
          <li v-for="error in errors">{{ error }}</li>
      </ul>
  </p>

  <p>
      <label for="name">Name</label>
      <input type="text" id="name" v-model="name">
  </p>

  <p>
      <label for="review">Review</label>
      <textarea id="review" cols="30" rows="10" v-model="review"></textarea>
  </p>

  <p>
      <label for="rating">Rating :</label>
      <select id="rating" v-model.number="rating">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
      </select>
  </p>

  <p>
      <label for="no">I don't recommend this product !</label>
      <input type="radio" id="no" name="recommendation" value="no" v-model="recommendation">
  </p>

  <p>
      <label for="yes">I recommend this product !</label>
      <input type="radio" id="yes" name="recommendation" value="yes" v-model="recommendation">
  </p>

  <p>
      <input type="submit" value="Submit">
  </p>

</form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommendation: null,
      errors: [],
    };
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating && this.recommendation) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommendation: this.recommendation,
        };
        eventBus.$emit("review-submitted", productReview);
        (this.name = null),
          (this.review = null),
          (this.rating = null),
          (this.recommendation = null);
      } else {
        this.errors = [];
        if (!this.name) this.errors.push("Name required.");
        if (!this.review) this.errors.push("Review required.");
        if (!this.rating) this.errors.push("Rating required.");
        if (!this.recommendation) this.errors.push("Recommendation required.");
      }
    },
  },
});

Vue.component("product-details", {
  props: {
    details: {
      type: Array,
      required: true,
    },
  },
  template: `
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `,
});

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true,
    },
  },
  template: `
    <div class="product">
            
    <div class="product-image">
        <img :src="image" :alt="description">
    </div>
    <div class="product-info">
        <h1>{{ title }}</h1>

        <p v-if="inStock">In stock</p>
        <p v-else>Out of stock</p>
        <p>Shipping: {{ shipping }}</p>

        <product-details :details="details"></product-details>

        <div v-for="(variant, index) in variants" :key="variant.variantId" class="color-box"
            :style="{backgroundColor : variant.variantColor}" @mouseover="updateProduct(index)">
        </div>

        <button @click="addToCart" :disabled="!inStock" :class="{disabledButton : !inStock}">Add to
            cart</button>
        <button @click="remove"">Remove</button> 
        
        <product-tabs :reviews="reviews"></product-tabs>
        
    </div>

</div>
    `,
  data() {
    return {
      brand: "Vue Mastery",
      product: "socks",
      description: "A pair of warm, fuzzy socks",
      selectedVariant: 0,
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: "./assets/vmSocks-green-onWhite.jpg",
          variantQuantity: 10,
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: "./assets/vmSocks-blue-onWhite.jpg",
          variantQuantity: 0,
        },
      ],
      reviews: [],
    };
  },
  computed: {
    title() {
      return this.brand + " " + this.product;
    },
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    shipping() {
      if (this.premium) {
        return "Free";
      } else {
        return 2.99;
      }
    },
  },
  methods: {
    addToCart() {
      this.$emit("add-to-cart", this.variants[this.selectedVariant].variantId);
    },
    updateProduct(index) {
      this.selectedVariant = index;
    },
    remove() {
      this.$emit(
        "remove-from-cart",
        this.variants[this.selectedVariant].variantId
      );
    },
  },
  mounted() {
    eventBus.$on("review-submitted", (productReview) => {
      this.reviews.push(productReview);
    });
  },
});

var app = new Vue({
  el: "#app",
  data: {
    premium: true,
    cart: [],
  },
  methods: {
    updateCart(id) {
      this.cart.push(id);
    },
    remove(id) {
      this.cart.pop(id);
    },
  },
});
