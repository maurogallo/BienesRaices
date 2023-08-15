import { validationResult } from "express-validator";
import Precio from "../models/Precio.js";
import Categoria from "../models/Categoria.js";


const admin = (req, res) => {
  res.render("propiedades/admin", {
    pagina: "Mis Propiedades",
    barra: true,
  });
};

const crear = async (req, res) => {
  //Consultar modelo de Precio y categoria

  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    barra: true,
    csrfToken: req.csrfToken(),
    precios,
    categorias
  });
};

const guardar = async (req, res) => {
  // Validación
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Consultar modelo de Precio y categoria

    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      barra: true,
      csrfToken: req.csrfToken(),
      precios,
      categorias,
      errores: resultado.array(),
    });
  }
};

export { admin, crear, guardar };
