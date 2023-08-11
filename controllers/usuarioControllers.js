import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar Sesión",
    csrfToken: req.csrfToken(),
  });
};

const autenticar = async (req, res) => {
  // validacion
  await check("email")
    .isEmail()
    .withMessage("El Email es Obligatorio.")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("El Password es Obligatorio.")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const {email, password } = req.body
  // comprobar si el usuario existe
  const usuario = await Usuario.findOne({where: {email}})
  if(!usuario){
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{msg: 'El Usuario No Existe'}]
    });
  }

  // Comprobar si el usuario esta confirmado
  if(!usuario.confirmado){
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{msg: 'Tu Cuenta No Esta Confirmada'}]
    });
  }

  // Revisar el password
  if(!usuario.verificarPassword(password)){
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{msg: 'El Password es Incorrecto'}]
    });
  }

  // Autenticar al usuario

  const token = generarJWT({id:usuario.id, nombre: usuario.nombre})

  console.log(token)

  // Almacenar en un cookie

  return res.cookie('_token', token,{
    httpOnly: true,
    //secure: true,
    //sameSite: true
  }).redirect('/mis-propiedades')

};

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrar = async (req, res) => {
  //Validación
  await check("nombre")
    .notEmpty()
    .withMessage("El Nombre no puede ir vacio.")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("Eso no parece un email.")
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El Password debe ser de al menos 6 caracteres.")
    .run(req);
  //await check('repetir_password').equals('password').withMessage('Los Passwords no son iguales.').run(req)

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  // Extraer los datos
  const { nombre, email, password } = req.body;

  // Verificar que el usuario no este duplicado
  const existeUsuario = await Usuario.findOne({ where: { email } });

  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario ya esta registrado" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Almacenar un usuario

  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  // Envia email de confirmacion

  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar mensaje de confirmación
  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje: "Hemos Enviado un Email de Confirmación, presiona en el enlace",
  });
};

// Finción que comprueba una cuenta

const confirmar = async (req, res) => {
  const { token } = req.params;

  // Verificar si el token es valido

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta , intenta de nuevo",
      error: true,
    });
  }

  //Confirmar la cuenta

  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta confirmada",
    mensaje: "La cuenta se confirmo correctamente",
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Recupera tu acceso a Bienes Raices",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  //Validación
  await check("email")
    .isEmail()
    .withMessage("Eso no parece un email.")
    .run(req);

  let resultado = validationResult(req);

  //return registrar.json(resultado.array())

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }
  // buscar el usuario
  const { email } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email no pertenece a nigun usuario" }],
    });
  }

  // Generara un token y enviar el email

  usuario.token = generarId();
  await usuario.save();

  // Enviar un email

  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  // Renderizar un mensaje
  res.render("templates/mensaje", {
    pagina: "Reestablece tu Password",
    mensaje: "Hemos Enviado un Email con las instrucciones",
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Reestablece tu password",
      mensaje: "Hubo un error al validar tu información, intenta de nuevo",
      error: true,
    });
  }

  // Mostrar formulario para modficar el password
  res.render("auth/reset-password", {
    pagina: "Reestablece tu password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  // validar el password
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El Password debe ser de al menos 6 caracteres.")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/reset-password", {
      pagina: "Reestablece tu password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar quien hace el cambio

  const usuario = await Usuario.findOne({ where: { token } });

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();
  res.render("auth/confirmar-cuenta", {
    pagina: "Password Reestablecido",
    mensaje: "El Password se guardó correctamente",
  });
};

export {
  formularioLogin,
  autenticar,
  formularioRegistro,
  registrar,
  confirmar,
  formularioOlvidePassword,
  resetPassword,
  comprobarToken,
  nuevoPassword,
};
