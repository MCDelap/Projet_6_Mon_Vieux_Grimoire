const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Nouveau livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        // Si une nouvelle image est envoyée
        if (req.file) {
          // On récupère le nom du vieux fichier à supprimer
          const oldFilename = book.imageUrl.split("/images/")[1];

          // On le supprime du dossier images
          fs.unlink(`images/${oldFilename}`, (err) => {
            if (err) console.log("Erreur suppression ancienne image:", err);
          });
        }

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id },
        )
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.createRating = (req, res, next) => {
  const ratingBook = {
    userId: req.auth.userId,
    grade: req.body.rating,
  };

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé !" });
      }

      // Vérification si l'utilisateur a déjà noté ce livre
      const alreadyRated = book.ratings.find(
        (rating) => rating.userId === req.auth.userId,
      );
      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "Vous avez déjà noté ce livre." });
      }

      // Ajout de la note
      book.ratings.push(ratingBook);

      // Calcul de la moyenne
      const totalGrades = book.ratings.reduce(
        (acc, rating) => acc + rating.grade,
        0,
      );
      book.averageRating = totalGrades / book.ratings.length;

      // Sauvegarde
      return book
        .save()
        .then((updatedBook) => {
          res.status(200).json(updatedBook);
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getBestRating = (req, res, next) => {
  // On utilise .sort() avec -1 pour l'ordre décroissant
  // On utilise .limit(3) pour ne récupérer que les 3 meilleurs
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
