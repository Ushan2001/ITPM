const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const polygonSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        coordinates: {
            type: Array,
            required: true,
        },
        addedBy: {
            type: Schema.Types.ObjectId,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Polygon", polygonSchema);