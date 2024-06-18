const Book = require("../models/Book");
const fs = require("fs");

exports.allInfoBook = (req, res, next) => {
  Book.find()

    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.threeBest = (req, res, next) => {
  Book.find()
    .sort("-averageRating")
    .limit(3)
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Erreur serveur lors de la récupération des livres." });
    });
};

exports.findOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.addBook = (req, res, next) => {
  const object = JSON.parse(req.body.book);
  delete object._id;
  delete object._userId;
  const imageUrl = `${req.protocol}://${req.get(
    "host"
  )}/images/${req.file.filename.replace(/\.(jpg|jpeg|png)$/i, "_resized.$1")}`;
  const book = new Book({
    ...object,
    _userId: req.auth.userId,
    imageUrl: imageUrl,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Post réussi" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const object = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get(
          "host"
        )}/images/${req.file.filename.replace(
          /\.(jpg|jpeg|png)$/i,
          "_resized.$1"
        )}`,
      }
    : { ...req.body };
  delete object._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...object, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
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
        res.status(401).json({ error });
      } else {
        const imageFile = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${imageFile}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Validé" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const { userId, rating } = req.body;
  if (!userId || !rating) {
    return res.status(400).json({ error: "userId et rating sont inexistant" });
  }
  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Le livre n'existe pas." });
      }
      if (!Array.isArray(book.ratings)) {
        book.ratings = [];
      }
      const userNote = book.ratings.some((r) => r.userId.toString() === userId);
      if (userNote) {
        return res
          .status(400)
          .json({ error: "L'utilisateur a déjà noté ce livre." });
      }
      book.ratings.push({ userId, grade: rating });

      let totalRating = 0;
      book.ratings.forEach((r) => (totalRating += r.grade));
      book.averageRating = totalRating / book.ratings.length;

      return book.save();
    })
    .then((updatedBook) => {
      res.status(200).json(updatedBook);
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout de la note :", error);
      res
        .status(500)
        .json({ error: "Erreur serveur lors de l'ajout de la note." });
    });
};
