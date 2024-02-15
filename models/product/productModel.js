function ProductModel(data) {
    this.id = data.id;
    this.title = data.title;
    this.ownerId = data.owner_id;
    this.category = data.category;
    this.image = data.image;
    this.description = data.description;
    this.postalCode = data.postal_code;
    this.rating = data.rating;
    this.priceHourly = data.price_hourly;
    this.priceDaily = data.price_daily;
    this.priceWeekly = data.price_weekly;
    this.priceMonthly = data.price_monthly;
    this.productLongitude = data.product_longitude;
    this.productLatitude = data.product_latitude;
}

module.exports = { ProductModel };
