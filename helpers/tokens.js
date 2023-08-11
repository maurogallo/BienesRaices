
import jwt from 'jsonwebtoken'

const generarJWT = datos => jwt.sign({ id: datos.id, nombre: datos.nombre }, "palabrasupersecretaaaaaa", { expiresIn:'1d'})


const generarId = () =>   Math.random().toString(36).substring(2); 

export {
    generarId,
    generarJWT
}