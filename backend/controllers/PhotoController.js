const Photo = require("../models/Photo");

const mongoose = require("mongoose");
const User = require("../models/User");

// insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reqUser = req.user

  const user = await User.findById(reqUser._id);

  // create a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  // if photo was create successfully, return data
  if (!newPhoto) {

    res.status(422).json({
      errors: ["Houve um problema, por favor tente novamente mais tarde."]
    })
    return
  }

  res.status(201).json(newPhoto)
}

// remove a photo from DB
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    // Converter ID corretamente
    const objectId = new mongoose.Types.ObjectId(id);

    // Buscar a foto
    const photo = await Photo.findById(objectId);

    // Verificar se a foto existe
    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada!"] });
    }

    // Verificar se a foto pertence ao usuário autenticado
    if (!photo.userId.equals(reqUser._id)) {
      return res.status(403).json({
        errors: ["Você não tem permissão para excluir esta foto!"],
      });
    }

    // Excluir a foto
    await Photo.findByIdAndDelete(photo._id);

    return res.status(200).json({ id: photo._id, message: "Foto excluída com sucesso." });
  } catch (error) {
    return res.status(500).json({ errors: ["Erro ao excluir a foto, tente novamente mais tarde."] });
  }
};

// get al photos
const getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({}).sort([["createdAt", -1]]).exec();

    console.log("Fotos encontradas:", photos); // <-- Adicione esse log

    return res.status(200).json(photos);
  } catch (error) {
    return res.status(500).json({ errors: ["Erro ao buscar fotos"] });
  }
};

// get user photos
const getUserPhotos = async (req, res) => {

  const { id } = req.params

  const photos = await Photo.find({ userId: id })
    .sort([['createdAt', -1]])
    .exec()

  return res.status(200).json(photos)
}

// get photo by id
const getPhotoById = async (req, res) => {
  const { id } = req.params;

  // Verifica se o ID é válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID inválido!"] });
  }

  try {
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada."] });
    }

    res.status(200).json(photo);
  } catch (error) {
    console.error("Erro ao buscar foto:", error);
    res.status(500).json({ errors: ["Erro interno ao buscar a foto."] });
  }
};

// update a photo
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  let image;

  if (req.file) {
    image = req.file.filename;
  }

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }

  // Check if photo belongs to user
  if (!photo.userId.equals(reqUser._id)) {
    res
      .status(422)
      .json({ errors: ["Ocorreu um erro, tente novamente mais tarde"] });
    return;
  }

  if (title) {
    photo.title = title;
  }

  if (image) {
    photo.image = image;
  }

  await photo.save();

  res.status(200).json({ photo, message: "Foto atualizada com sucesso!" });
};

// Like functionality
const likePhoto = async (req, res) => {

  const { id } = req.params

  const reqUser = req.user

  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }

  // cheac if user already liked the photo
  if (photo.likes.includes(reqUser._id)) {
    res.status(422).json({ errors: ["Você já curtiu a foto."] })
    return
  }

  // put user id in likes array
  photo.likes.push(reqUser._id)

  photo.save()

  res.status(200).json({ photoId: id, userId: reqUser._id, message: "A foto foi curtida." })

}

// comment functionality
const commentPhoto = async (req, res) => {

  const { id } = req.params
  const { comment } = req.body

  const reqUser = req.user

  const user = await User.findById(reqUser._id)

  const photo = await Photo.findById(id)

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }

  // put comment in the array comments
  const userComment = {
    comment,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id
  }

  photo.comments.push(userComment)

  await photo.save()

  res.status(200).json({
    comment: userComment,
    message: "O comentário foi adicionado com sucesso!"
  })

}

// search photos by title
const searchPhotos = async (req, res) => {

  const { q } = req.query

  const photos = await Photo.find({title: new RegExp(q, "i")}).exec()

  res.status(200).json(photos)

}


module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commentPhoto,
  searchPhotos,
}