const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const uuid = require("uuid").v4;

exports.s3UploadSingle = async (file) => {
    const s3client = new S3Client();

    let filename = `${uuid()}-${file.originalname}`
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `asset/${filename}`,
        Body: file.buffer,
    };
    s3client.send(new PutObjectCommand(param));

    return filename
};

exports.s3UploadMulti = async (files) => {
    const s3client = new S3Client();

    let filenames = []
    const params = files.map((file) => {

        let filename = `${uuid()}-${file.originalname}`
        filenames.push(filename)

        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `asset/${filename}`,
            Body: file.buffer,
        }

    });
    await Promise.all(
        params.map((param) => s3client.send(new PutObjectCommand(param)))
    );

    return filenames
};