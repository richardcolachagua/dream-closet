const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const imageController = {
  retrieveImages: async (req, res) => {
    try {
      const {
        sortBy = "createdAt",
        filterBy,
        page = 1,
        itemsPerPage = 10,
      } = req.query;

      const pageNumber = parseInt(page, 10);
      const itemsPerPageNumber = parseInt(itemsPerPage, 10);

      const allImages = [];

      const startIndex = (pageNumber - 1) * itemsPerPageNumber;
      const endIndex = startIndex + itemsPerPageNumber;
      const paginatedImages = allImages.slice(startIndex, endIndex);

      const response = {
        currentPage: pageNumber,
        itemsPerPage: itemsPerPageNumber,
        totalItems: allImages.length,
        totalPages: Math.ceil(allImages.length / itemsPerPageNumber),
        images: paginatedImages,
      };

      res.json(response);
    } catch (error) {
      console.error("Image retrieval failed", error);
      res.status(500).json({
        success: false,
        error: "An error occurred while retrieving images",
      });
    }
  },
};

module.exports = imageController;
