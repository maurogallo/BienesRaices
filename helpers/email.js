import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "aa9bd3f444a9e3",
          pass: "31680962706cc7"
        }
      });

      const {email, nombre, token}= datos

      //Envia el email

      await transport.sendMail({
        from: 'BieneRaice.com',
        to: email,
        subject:'Confirma tu cuenta en BienesRaices.com',
        text:'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>

            <p>Tu cuenta ya esta lista, solo debes confirmala en el siguiente enlace:
            <a href="http://localhost:3000/auth/confirmar/${token}">Confirmar Cuenta</a> </p>

            <p> Si tu no creaste esta cuenta, puedes ignorar el mendaje</p>
        `
      })


}

const emailOlvidePassword = async (datos) => {
  var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "aa9bd3f444a9e3",
        pass: "31680962706cc7"
      }
    });

    const {email, nombre, token}= datos

    //Envia el email

    await transport.sendMail({
      from: 'BieneRaice.com',
      to: email,
      subject:'Restablece tu password en BienesRaices.com',
      text:'Restablece tu password en BienesRaices.com',
      html: `
          <p>Hola ${nombre}, has solicitado restablecer tu  en BienesRaices.com</p>

          <p>Sigue el siguiente enlace para generar un password nuevo:
          <a href="http://localhost:3000/auth/olvide-password/${token}">Restablecer password</a> </p>

          <p> Si tu no solicitaste el cambio de password, puedes ignorar el mendaje</p>
      `
    })


}

export {
    emailRegistro,
    emailOlvidePassword
}