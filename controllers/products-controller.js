const uuid = require('uuid').v4;

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const HttpError = require('../models/http-error');
const Product = require('../models/product');
const User = require('../models/user');

const bucketName = `${process.env.BUCKET_NAME}`;
const bucketRegion = `${process.env.BUCKET_REGION}`;
const accessKey = `${process.env.ACCESS_KEY}`;
const secretAccessKey = `${process.env.SECRET_ACCESS_KEY}`;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const getProductById = async (req, res, next) => {
  const prodId = req.params.pid;

  let product;

  try {
    prodId = await Product.find({ gtin: prodId });
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not find product', 500)
    );
  }

  if (!product)
    return next(
      new HttpError('Could not find a place for the provided id', 404)
    );

  res.json({ product: product[0].toObject({ getters: true }) });
};

const getProductsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithProducts;

  try {
    userWithProducts = await User.findById(userId).populate('products');
  } catch (err) {
    return next(
      new HttpError('Fetching user products failed, please try again', 500)
    );
  }

  if (!userWithProducts)
    return next(
      new HttpError('Could not find products for the provided user id', 404)
    );

  const returnProducts = userWithProducts.products.map((prod) =>
    prod.toObject({ getters: true })
  );

  for (product of returnProducts) {
    product.image = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: product.image,
      }),
      { expiresIn: 3600 } // 60 seconds
    );
  }

  res.json(returnProducts);
};

const createProduct = async (req, res, next) => {};

const updateProduct = async (req, res, next) => {};

const deleteProduct = async (req, res, next) => {};

exports.getProductById = getProductById;
exports.getProductsByUserId = getProductsByUserId;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
