const sharp = require('sharp');
const path = require('path');

module.exports = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const name = req.file.originalname.split(' ').join('_').split('.')[0];
    const filename = `${name}_${Date.now()}.webp`;

    sharp(req.file.buffer)
        .resize({ width: 400 }) 
        .toFormat('webp')
        .toFile(path.join('images', filename))
        .then(() => {
            req.file.filename = filename;
            next();
        })
        .catch(error => res.status(500).json({ error }));
};