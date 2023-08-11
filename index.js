import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import db from './config/db.js'

// Crear la app

const app = express()

//Hanilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

//Habilitar Cookie parser

app.use( cookieParser())

// Habilitar CSRF
app.use(csrf({cookie: true}))

// Conexion a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log('Conexion Correcta a la Base de datos')

}catch (error){
    console.log(error)
}


// Habilitar pug
app.set('view engine','pug')
app.set('views', './views')

// Carpeta Publica
app.use(express.static('public'))

//Routing
app.use('/auth', usuarioRoutes)
app.use('/', propiedadesRoutes)



//Definir un puerto y arrancar el proyecto
const port = 3000;

app.listen(port, () =>{
    console.log(`El servidor esta funcionando en el pueto ${port}`)
})