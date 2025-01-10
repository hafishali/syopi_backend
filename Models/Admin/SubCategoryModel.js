const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Name is required"],
    unique: true,
    index: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
});

const subCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = subCategory;
