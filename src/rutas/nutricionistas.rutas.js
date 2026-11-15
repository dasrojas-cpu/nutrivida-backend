const express = require('express');
const controlador = require('../controladores/nutricionistas.controlador');

const rutas = express.Router();

rutas.get('/', controlador.listar);

module.exports = rutas;
