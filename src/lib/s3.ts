import AWS from "aws-sdk";

export async function uploadS3(file: File) {
  console.log(process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID);
  console.log(process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY);
  console.log(process.env.NEXT_PUBLIC_AWS_BUCKET_NAME);
  console.log(process.env.NEXT_PUBLIC_AWS_BUCKET_REGION);
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: { Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME },
      region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
    });
    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };
    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "uploading...",
          parseInt((evt.loaded * 100) / evt.total + "")
        );
      })
      .promise();
    await upload.then((data) => {
      console.log("success", data);
    });
    return Promise.resolve({
      file_key,
      file_name: file.name,
    });
  } catch (error) {
    console.log(error);
  }
}

export function getS3Url(file_key: string) {
  const s3 = new AWS.S3({
    params: { Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME },
    region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
  });
  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: file_key,
  };
  const url = s3.getSignedUrl("getObject", params);
  return url;
}
