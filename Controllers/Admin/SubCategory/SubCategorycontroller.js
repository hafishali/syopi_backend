const SubCategory = require('../../../Models/Admin/SubCategoryModel');
const fs = require('fs');

//create a new subcategory 
exports.createSubCategory = async (req,res) => {
    const { name,description,category } = req.body;
    const {image}=req.file

    console.log(image);

    if(!image){
        return res.status(400).json({message: "SubCategory Image is required"})
    }
    try {
        const newSubCategory = new SubCategory({name:name,category:category,image:image,description:description});
        await newSubCategory.save();
        res.status(201).json({message: 'SubCategory created successfully', SubCategory: newSubCategory});
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error});
    }
} 

// get all sub categories

exports.getSubCategories = async (req,res) => {
    try {
        const subCategories = await SubCategory.find().populate('category')
        res.status(200).json({subCategories});
    } catch (err) {
        res.status(500).json({message: 'Error fetching categories', error:err.message})
    }
}

// get a subCategory by id 

exports.getSubCategoryById = async(req,res) => {
    const { id } = req.params;
    try {
        const subCategory = await SubCategory.findById(id);
        if(!subCategory){
            return res.status(404).json({ message: "SubCategory not found" });
        }
        res.status(200).json(subCategory);
    } catch (err) {
        res.status(500).json({message: 'Error fetching subcategory',error: err.message});
    }
}

// update subcategory

exports.updateSubCategory = async (req,res) => {
    const { id } = req.params;
    const { name,description,image,category } = req.body;
    try {
        const subCategory = await SubCategory.findById(id);
        if(!subCategory){
            return res.status(404).json({ message: 'SubCategory not found' })
        }
        if(name) subCategory.name = name;
        if(description) subCategory.description = description;
        if(category) subCategory.category = category;
        if(image){
            const oldImagePath = `./uploads/subcategory/${subCategory.image}`
            if(fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath)
            }
            subCategory.image = image;
        }
        await subCategory.save();
        res.status(200).json({ message: 'SubCategory updated successfully', subCategory });

    } catch (err) {
        res.status(500).json({ message: 'Error updating SubCategory', error: err.message });
    }
}

exports.deleteSubCategory = async (req,res) => {
    const { id } = req.params;

    try {
        const subCategory = await SubCategory.findById(id);
        if(!subCategory){
            return res.status(404).json({ message: 'Category not found' })
        }

        const imagePath = `./uploads/subcategory/${subCategory.image}`
        if(fs.existsSync(imagePath)){
            fs.unlinkSync(imagePath);
        }

        await SubCategory.findByIdAndDelete(id);
        res.status(200).json({ message: 'SubCategory deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting category', error: err.message });
    }
}

//search subcategory
exports.searchSubCategory = async(req,res) => {
    const { name } = req.query;

    try {
        const query = {}
        if(name){
            query.name = { $regex: name, $options: 'i' };
        }

        const subCategory = await SubCategory.find(query);
        res.status(200).json(subCategory);
    } catch (err) {
        res.status(500).json({ message: 'Error searching SubCategories', error: err.message });
    }
}