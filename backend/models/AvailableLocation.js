const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const availableLocationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        locations: [
            {
                type: Schema.Types.ObjectId,
                ref: "Polygon",
            },
        ],
        addedBy: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        publishDate: {
            type: String,
            required: true,
        },
        publishTime: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AvailableLocation", availableLocationSchema);
