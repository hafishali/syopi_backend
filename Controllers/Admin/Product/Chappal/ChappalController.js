const Chappal = require('../../../../Models/Admin/ChappalModel');
const fs = require('fs');
const path = require('path');

//create new chappal
exports.createChappal = async(req,res) => {
    const { sizes,colours } = req.body;
    if(!req.files){
        return res.status(400).json({message: "At least one chappal image is required"})
    }
    try {
        const imagePaths = req.files ? req.files.map((file) => file.filename) : [];

        const newChappal = new Chappal({
            ...req.body,
            sizes: JSON.parse(sizes),
            colours: JSON.parse(colours),
            images: imagePaths
        });
        await newChappal.save();
        res.status(201).json({message: 'chappal created successfully', chappal: newChappal});
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message});
    }
}

//get all chappals
exports.getChappals = async(req,res) => {
    try {
        const chappals = await Chappal.find();
        res.status(200).json(chappals);
    } catch (err) {
        res.status(500).json({message: 'Error fetching chappals', error:err.message})
    }
}

//get chappal by id
exports.getChappalById = async(req,res) => {
    const { id } = req.params;
    try {
        const chappal = await Chappal.findById(id).populate('category subcategory');
        if(!chappal){
            return res.status(404).json({ message: "chappal not found" });
        }
        res.status(200).json(chappal);
    } catch (err) {
        res.status(500).json({message: 'Error fetching chappal',error: err.message});
    }
}

//update chappal
exports.updateChappal = async(req,res) => {
    const { id } = req.params;
    const { colours,sizes } = req.body;
    try {
        const chappal = await Chappal.findById(id);
        if(!chappal){
            return res.status(404).json({ message: 'chappal not found' })
        }

        const existingImages = chappal.images;
        const newImages = req.files ? req.files.map((file) => file.filename) : [];
        if(existingImages.length + newImages.length > 5) {
            return res.status(400).json({ message: "Cannot have more than 5 images for a chappal" });
        }

        // Update logic for colours and sizes
        const updatedColours = colours ? Array.isArray(colours) ? colours : JSON.parse(colours) : chappal.colours;
        const updatedSizes = sizes ? Array.isArray(sizes) ? sizes : JSON.parse(sizes) : chappal.sizes;

        const updatedChappalData = {
            ...req.body,
            images: [...existingImages,...newImages],
            colours: updatedColours,
            sizes: updatedSizes
        }

        const updatedChappal = await Chappal.findByIdAndUpdate(id,updatedChappalData,{ new:true })

        res.status(200).json({
            message: "Chappal updated successfully",
            updatedChappal
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating chappal', error: err.message });
    }
}

// delete chappal
exports.deleteChappal = async(req,res) => {
    const { id } = req.params;
    try {
        const chappal = await Chappal.findById(id);
        if(!chappal){
            return res.status(404).json({ message: 'chappal not found' })
        }
        // Delete associated images
        const basePath = path.join('./uploads/admin/product');
        const imagePaths = chappal.images.map((image) => path.join(basePath, image));
        console.log(imagePaths);

        imagePaths.forEach((imagePath) => {
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Delete each image file
                console.log(`Deleted file: ${imagePath}`);
            }  else {
                console.log(`File does not exist: ${imagePath}`);
            }
        });
        await Chappal.findByIdAndDelete(id);
        res.status(200).json({ message: 'chappal deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting chappal', error: err.message });
    }
}

// delete a specific image by name
exports.deleteChappalImage = async (req,res) =>{
    try {
        const { id } = req.params;
        const { imageName } = req.body;
        const chappal = await Chappal.findById(id);
        if(!chappal){
            return res.status(404).json({ message: "Chappal not found" });
        }
        const imgExists = chappal.images.filter((img) => {
            const imgFileName = img.split("\\").pop().split("/").pop();
            return imgFileName === imageName;
        })
        if(!imgExists){
            return res.status(400).json({ message: "Image not found in Chappal" });
        }
         // Use $pull to remove the image directly in the database
        const updatedChappal = await Chappal.findByIdAndUpdate(
        id,
        { $pull: { images: { $regex: new RegExp(imageName, "i") } } },
        { new: true });
        res.status(200).json({ message: "Image deleted successfully", images: updatedChappal.images });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}