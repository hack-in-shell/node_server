function UserModel(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phoneNo = data.phone_no;
    this.password = data.paasword;
    this.image = data.image;
    this.postalCode = data.postal_code;
    this.address = data.address;
    this.addressLongitude = data.address_longitude;
    this.addressLatitude = data.address_latitude;
    this.rating = data.rating;
}

module.exports = { UserModel };
