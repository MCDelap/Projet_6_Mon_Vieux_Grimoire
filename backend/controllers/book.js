const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
   const bookObject = JSON.parse(req.body.book);
   delete bookObject._id;
   delete bookObject._userId;
   const book = new Book({
       ...bookObject,
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });
 
   book.save()
   .then(() => { res.status(201).json({message: 'Nouveau livre enregistré !'})})
   .catch(error => { res.status(400).json( { error })})
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
   const bookObject = req.file ? {
       ...JSON.parse(req.body.book),
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
 
   delete bookObject._userId;
   Book.findOne({_id: req.params.id})
       .then((book) => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({ message : 'Not authorized'});
           } else {
               // SI UNE NOUVELLE IMAGE EST ENVOYÉE
               if (req.file) {
                   // 1. On récupère le nom du VIEUX fichier à supprimer
                   const oldFilename = book.imageUrl.split('/images/')[1];
                   
                   // 2. On le supprime du dossier images
                   fs.unlink(`images/${oldFilename}`, (err) => {
                       if (err) console.log("Erreur suppression ancienne image:", err);
                   });
               }

               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Objet modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(400).json({ error });
       });
};

exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = book.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.createRating = (req, res, next) => {
    const ratingBook = {
        userId: req.auth.userId,
        grade: req.body.rating
    };

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !' });
            } else {
                // Vérification si l'utilisateur a déjà noté ce livre
                const alreadyRated = book.ratings.find(rating => rating.userId === req.auth.userId);

                if (alreadyRated) {
                    return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
                } else {
                    // Ajout de la note
                    book.ratings.push(ratingBook);

                    // Sauvegarde du livre mis à jour
                    return book.save()
                        .then((updatedBook) => {
                            // On renvoie le livre mis à jour comme attendu par le front
                            res.status(200).json(updatedBook);
                        })
                        .catch((error) => {
                            return res.status(400).json({ error });
                        });
                }
            }
        })
        .catch((error) => {
            return res.status(500).json({ error });
        });
};