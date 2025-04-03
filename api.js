require("dotenv").config();
const express = require('express');
const PORT = process.env.PORT || 5000;
const app = express();
const mongoose = require("mongoose");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const cors = require('cors');


app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
        .catch(err => console.error("MongoDB Connection Error:", err));


// Cloudinary Configuration
cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
        cloudinary,
        params: {
                folder: "uploads", // Folder in Cloudinary
                allowed_formats: ["jpg", "png", "jpeg"]
        },
});
const upload = multer({ storage });




// MongoDB Schema
const ImageSchema = new mongoose.Schema({
        imageUrl: String,
        productID: Number, productPrice: String,
        productName: String, productRate: String, productDiscount: String, productMarketPrice: String,
});
const Image = mongoose.model("Image", ImageSchema);



let URLpath;
let Id;
// Upload Endpoint
app.post("/uploadImage", upload.single("image"), async (req, res) => {
        try {

                /* const { imageUrl } = req.file.path; */ /* req.file.path is a string (the file path), not an object.
                You cannot destructure imageUrl from a string. */


                /* await newImage.save({ imageUrl });*//* newImage.save({ imageUrl }) is incorrect syntax because .save() does not take arguments.
                save() only works on an instance of the model that has already been created. */

                // const savedImage = await Image.create({ imageUrl: req.file.path });
                // res.json({ imageUrl: savedImage.imageUrl });/*This also good approach */

                const newImage = new Image({ imageUrl: req.file.path });

                const savedImage = await newImage.save();
                // res.json({ imageUrl: req.file.path });
                URLpath = savedImage.imageUrl;
                Id = savedImage._id;
                console.log("Id::;",savedImage._id);
                res.json({ imageID: savedImage._id });
        } catch (error) {
                res.status(500).json({ error: "Error uploading image" });
        }
});

app.post("/productInfo", async (req, res) => {
        const { productID, productPrice,
                productName, productRate, productDiscount, productMarketPrice } = req.body;

                console.log("ID::",URLpath);
                console.log("Product:::", req.body);
                
        // const productInfo = await Image.findOneAndUpdate({ URLpath },{
        //         $push: {
        //                 productID:productID,
        //                 productPrice:productPrice,
        //                 productName:productName,
        //                 productRate:productRate,
        //                 productDiscount:productDiscount,
        //                 productMarketPrice:productMarketPrice,
        //         }
                      
        //         });
                // console.log("productInfo:::",productInfo);
        // console.log("productInfo:::", req.body);

        const updatedImage = await Image.findByIdAndUpdate(
                Id,
                {
                    $set: {
                        productID,
                        productPrice,
                        productName,
                        productRate,
                        productDiscount,
                        productMarketPrice,
                    }
                },
                { new: true, upsert: false } // Return updated document
            );
        res.json({ inputValue: updatedImage });
});




// Get All Images
app.get("/images", async (req, res) => {
        try {
                const images = await Image.find();
                console.log("images:::", images);

                res.json(images);

        } catch (error) {
                res.status(500).json({ error: "Error fetching images" });
        }
});

app.get("/product", async (req, res) => {
        try{
               const data = await Image.find({});
               console.log("data is:::", data)
               res.json(data)
        } catch(error) {
                console.log("Some Error occure", error)
        }
     
})


app.listen(PORT, () => console.log(`Server is running on ${PORT}`));