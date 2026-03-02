import sharp from "sharp"

export const compressImage=async(buffer)=>{
    return await sharp(buffer)
        .resize({ width: 800 })
        .webp({ quality: 70 })
        .toBuffer();
}