let canvas = document.getElementById("canvas");
let tetris = canvas.getContext("2d");
let canvasPieza = document.createElement("canvas");
let piezaTetris = canvasPieza.getContext("2d");
piezaTetris.classList = "sig_pieza";

//Definicion de tamaños
const tamanioPixel = 30;//Tamaño de cada pixel
const anchoTablero = 14;//Numero de columnas del tablero
const largoTablero = 21;//Numero de filas del tablero

//Posicion inicial de la pieza
const posicionX = 6;
const posicionY = 1;
canvas.width = anchoTablero * tamanioPixel;
canvas.height = largoTablero * tamanioPixel;

//Colores de las piezas
const colores = ['rgba(242,86,240)', 'rgba(239,25,19)', 'rgba(32,191,85)', 'rgba(247,206,91)', 'rgba(41,170,222)', 'rgba(94,35,157)'];

//Formas de las piezas
const arrayPiezas = [
    [[1, 1], [1, 1]],
    [[1, 1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 1], [1, 0], [1, 1]]
]

let siguientePieza;
let pausarJuego = false;
let tablero = [];
let pieza = {};

let contadorFilas = 0;
let caidaFicha;

var formulario = document.getElementById("div_formulario");
var audio = document.querySelector("audio");
audio.volume = 0.4;
var boton;

//localStorage
let almacenamientoJSON = {};
let jugadores = JSON.parse(localStorage.getItem("Jugadores"));

//Responsive
function comprobarAncho() {
    if (window.innerWidth > 1024) {
        divBotonesDireccion.forEach(elemento => {
            elemento.style.display = 'none';
        });
    } else {
        divBotonesDireccion.forEach(elemento => {
            elemento.style.display = 'inline-block';
        });
    }
}

//Botones de audio
document.querySelectorAll(".audio>img").forEach(e => {
    e.addEventListener("click", cambiarAudio);
});
function cambiarAudio() {
    var src_audio = this.src.split("/");
    if (src_audio[src_audio.length - 1] == "mute.png") {
        src_audio[src_audio.length - 1] = "volume.png";
        src_audio = src_audio.join("/");
        document.querySelectorAll(".audio>img")[1].src = src_audio;
        audio.volume = 0;
    } else if (src_audio[src_audio.length - 1] == "down-vol.png") {
        audio.volume -= 0.1;
    } else if (src_audio[src_audio.length - 1] == "high-vol.png") {
        audio.volume += 0.1;
    } else {
        src_audio[src_audio.length - 1] = "mute.png";
        src_audio = src_audio.join("/");
        audio.volume = 0.4;
        document.querySelectorAll(".audio>img")[1].src = src_audio;
    }
}

// Guardar avatar
var src_avatar = "";
let avatares = document.querySelectorAll(".avatar > img");
avatares.forEach(avatar => {
    avatar.addEventListener("click", guardarAvatar);
})
function guardarAvatar() { //guardo src avatar seleccionado

    src_avatar = this.src;
    avatares.forEach(avatar => {
        if (avatar.src == this.src) {
            avatar.classList = "seleccionado";
            avatar.animate([
                { scale: 0.8 },
                { scale: 1 }
            ], { duration: 80 });
        } else {
            avatar.classList = "no_seleccionado";
        }
    })
}

// Guardar nombre usuario
document.getElementById("boton_form").addEventListener("click", guardarUsuario);
var usuario;
function guardarUsuario(e) {
    if (src_avatar == "") { //Asignar avatar Random si el usuario no ha seleccionado uno
        var num_avatar = Math.floor(Math.random() * 7 + 0);
        src_avatar = document.querySelectorAll(".avatar>img")[num_avatar].src;
    }
    e.preventDefault();
    usuario = document.getElementById("usuario").value.toLowerCase(); //Primera letra usuario en mayúscula
    // usuario = usuario.charAt(0).toUpperCase() + usuario.slice(1); 
    if (usuario != '') {
        formulario.style.display = "none"; //ocultamos el formulario

        // CREAR EN LA CABECERA LA IMG CON AVATAR Y NOMBRE DE USUARIO
        var divAvatar = document.createElement("div");
        var imgAvatar = document.createElement("img");
        var logo = document.querySelector(".cabecera > img");
        imgAvatar.src = src_avatar;
        imgAvatar.classList = "imgAvatar";
        divAvatar.appendChild(imgAvatar);
        divAvatar.appendChild(document.createElement("p").appendChild(document.createTextNode(usuario)));
        divAvatar.classList = "divAvatar";
        document.querySelector(".cabecera").insertBefore(divAvatar, logo);
        setInterval(tiempoJuego, 1000);
        caidaFicha = setInterval(mover_ficha_auto, 700);
        audio.play(); //reproducir en bucle
        actualizar();
    } else {
        alert("Debe introducir un nombre"); //validación usuario
    }
}

//Cambiar foto de boton de pause
document.getElementById("play_pause_game").addEventListener("click", play_pause);
let botonPlaySrc = document.getElementById("pause").src.split("/");
function play_pause() {
    if (botonPlaySrc[botonPlaySrc.length - 1] == "pause.png") {
        botonPlaySrc[botonPlaySrc.length - 1] = "play.png";
        audio.pause();
        document.getElementById("pause").src = `${botonPlaySrc[botonPlaySrc.length - 2]}/${botonPlaySrc[botonPlaySrc.length - 1]}`;
    } else {
        botonPlaySrc[botonPlaySrc.length - 1] = "pause.png";
        audio.play();
        document.getElementById("pause").src = `${botonPlaySrc[botonPlaySrc.length - 2]}/${botonPlaySrc[botonPlaySrc.length - 1]}`;
        document.body.addEventListener("keydown", mover_ficha);
        tiempoCaidaFicha(contadorFilas);
        actualizar();
    }
}

//Pausar el juego
document.body.addEventListener("keypress", pausar);
function pausar(e) {
    if (e.key == 'p') {
        play_pause();
    }
}

//Funcion para inicializar el tablero y las piezas
function crear_tablero() {
    for (var i = 0; i < largoTablero; i++) {
        tablero[i] = [];
        for (var j = 0; j < anchoTablero; j++) {
            tablero[i][j] = 0;
        }
    }
}
function comprobar_tablero() {
    tetris.fillStyle = "#1A2123";
    tetris.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < largoTablero; i++) {
        for (var j = 0; j < anchoTablero; j++) {
            if (tablero[i][j] != 0) {
                //Pintar el cuadrado
                tetris.fillStyle = colores[tablero[i][j] - 1];
                tetris.fillRect(j, i, 1, 1);

                //Borde de cada cuadrado de la pieza
                tetris.strokeStyle = 'white';
                tetris.lineWidth = 0.05;
                tetris.strokeRect(j, i, 1, 1);
            }
            //Borde de cada casilla del tablero
            tetris.strokeStyle = '#95ACB1';
            tetris.lineWidth = 0.03;
            tetris.strokeRect(j, i, 1, 1);
        }
    }
}
//Tamaño del tetris, mismo valor que el tamanioPixel para que quede en relacion a la dimension de donde va a estar dibujado(canvas)
tetris.scale(tamanioPixel, tamanioPixel);
function mostrar_pieza() {
    for (var i = 0; i < pieza.figura.length; i++) {
        for (var j = 0; j < pieza.figura[i].length; j++) {
            if (pieza.figura[i][j] == 1) {
                //Pintar el cuadrado
                tetris.fillStyle = pieza.color;
                tetris.fillRect(j + pieza.posicion.x, i + pieza.posicion.y, 1, 1);

                //Borde de cada cuadrado de la pieza
                tetris.strokeStyle = 'white';
                tetris.lineWidth = 0.05;
                tetris.strokeRect(j + pieza.posicion.x, i + pieza.posicion.y, 1, 1);
            }
        }
    }
}
//Funcion que muestra todo el rato el tablero y la pieza
function mostrar() {
    comprobar_tablero();
    mostrar_pieza();
}

//Botones de direccion para juego en tablet/movil
let divBotonesDireccion = document.querySelectorAll(".flechas_dir");
divBotonesDireccion.forEach(elemento => {
    elemento.addEventListener("click", mover_ficha);
});

//Movimiento de ficha
document.body.addEventListener("keydown", mover_ficha);
function mover_ficha(e) {
    if (!juegoPausado()) {
        if (e.key === "ArrowRight" || e.srcElement.id == 'flechaDer') {
            if (!hayObstaculoDerecho()) {
                pieza.posicion.x++;
            }
        }
        if (e.key === "ArrowLeft" || e.srcElement.id == 'flechaIzq') {
            if (!hayObstaculoIzquierdo()) {
                pieza.posicion.x--;
            }
        }
        if (e.key === "ArrowDown" || e.srcElement.id == 'flechaAbajo') {
            hayObstaculo() ? fijarFicha() : pieza.posicion.y++;
        }
        if (e.key === "ArrowUp" || e.srcElement.id == 'flechaArriba') {
            hayObstaculoRotacion();
        }
    }
}


//Como se hace la rotacion de la pieza
function rotacion() {
    let filas = pieza.figura.length - 1;
    let columnas = pieza.figura[0].length;
    let array = [];
    for (var i = 0; i < columnas; i++) {
        array[i] = [];
        for (var j = 0; j <= filas; j++) {
            array[i][j] = pieza.figura[filas - j][i];
        }
    }
    return array;
}
function rotarPieza() {
    pieza.figura = rotacion();
}

//COMPROBAR SI HAY OBSTACULOS
function hayObstaculo() {
    var valor = false;
    for (var i = 0; i < pieza.figura.length; i++) {
        for (var j = 0; j < pieza.figura[i].length; j++) {
            if ((pieza.figura[i][j] == 1 && pieza.posicion.y + pieza.figura.length - 1 == tablero.length - 1) || (pieza.figura[i][j] == 1 && tablero[i + pieza.posicion.y + 1][j + pieza.posicion.x] != 0)) {
                valor = true;
            }
        }
    }
    return valor;
}
function hayObstaculoIzquierdo() {
    var valor = false;
    var contador = 0;
    for (var i = 0; i < pieza.figura.length; i++) {
        for (var j = 0; j < pieza.figura[i].length; j++) {
            if (pieza.figura[i][j] == 1 && tablero[i + pieza.posicion.y + contador][j + pieza.posicion.x - 1] != 0) {
                valor = true;
                contador++;
            }
        }
    }
    return valor;
}
function hayObstaculoDerecho() {
    var valor = false;
    var contador = 0;
    for (var i = 0; i < pieza.figura.length; i++) {
        for (var j = 0; j < pieza.figura[i].length; j++) {
            if (pieza.figura[i][j] == 1 && tablero[i + pieza.posicion.y + contador][j + pieza.posicion.x + 1] != 0) {
                valor = true;
                contador++;
            }
        }
    }
    return valor;
}
function hayObstaculoRotacion() {
    let posicionAnterior = pieza.figura;
    if (hayObstaculoEnRotacion()) {
        pieza.figura = posicionAnterior;
    }
}
function hayObstaculoEnRotacion() {
    rotarPieza();
    var valor = false;
    for (var i = 0; i < pieza.figura.length; i++) {
        for (var j = 0; j < pieza.figura[i].length; j++) {
            if (Number(pieza.posicion.y + i) > tablero.length - 1 || pieza.figura[i][j] == 1 && tablero[i + pieza.posicion.y][j + pieza.posicion.x] != 0) {
                valor = true;
            }
        }
    }
    return valor;
} 

//Funcion para que la ficha baje automaticamente
function mover_ficha_auto() {
    hayObstaculo() ? fijarFicha() : pieza.posicion.y++;
}

function generarPieza(valor) {
    if (valor == 0) {
        pieza = {
            posicion: { x: posicionX, y: posicionY },
            figura: arrayPiezas[Math.floor(Math.random() * arrayPiezas.length + 0)],
            color: colores[Math.floor(Math.random() * colores.length + 0)]
        }
    } else {
        pieza = siguientePieza;
    }
    piezaSiguiente();
}

function piezaSiguiente() {
    if (!finalJuego()) {
        siguientePieza = {
            posicion: { x: posicionX, y: posicionY },
            figura: arrayPiezas[Math.floor(Math.random() * arrayPiezas.length + 0)],
            color: colores[Math.floor(Math.random() * colores.length + 0)]
        }
        crearElemento(siguientePieza);
    }
}

//Creacion de la figura de canvas de la siguiente pieza
function crearElemento(piezaSig) {
    canvasPieza.width = 5.5 * tamanioPixel;
    canvasPieza.height = 5.5 * tamanioPixel;
    mostrarSiguientePieza(piezaSig);
    document.querySelector(".pieza").appendChild(canvasPieza);
}
//Atributos del canvas donde se va a dibujar la siguiente pieza
function mostrarSiguientePieza(piezaSig) {
    //Tamaño de cada pixel del tablero
    piezaTetris.scale(40, 40);
    piezaTetris.fillStyle = "transparent";
    piezaTetris.lineWidth = 0;
    piezaTetris.fillRect(0, 0, canvasPieza.width, canvasPieza.height);
    for (var i = 0; i < piezaSig.figura.length; i++) {
        for (var j = 0; j < piezaSig.figura[i].length; j++) {
            if (piezaSig.figura[i][j] == 1) {
                piezaTetris.fillStyle = piezaSig.color;
                piezaTetris.fillRect(j, i, 1, 1);

                //Borde de cada cuadrado de la pieza
                piezaTetris.strokeStyle = 'white';
                piezaTetris.lineWidth = 0.06;
                piezaTetris.strokeRect(j, i, 1, 1);
            }
        }
    }
}

function fijarFicha() {
    for (var i = 0; i < pieza.figura.length; i++) {
        for (var j = 0; j < pieza.figura[i].length; j++) {
            if (pieza.figura[i][j] == 1) {
                tablero[i + pieza.posicion.y][j + pieza.posicion.x] = colores.indexOf(pieza.color) + 1;
            }
        }
    }
    completaLinea();
    generarPieza(1);
}

//Comprobacion de si una linea esta completa y su animacion
function completaLinea() {
    var contador = 0;
    for (var i = 0; i < largoTablero; i++) {
        for (var j = 0; j < anchoTablero; j++) {
            if (tablero[i][j] != 0) {
                contador++;
            }
        }
        if (contador == anchoTablero) { //toda la fila es != 0
            contadorFilas++;
            tiempoCaidaFicha(contadorFilas);
            animacionEliminacionFila(i);
            document.getElementById("score").innerHTML = contadorFilas;
            document.getElementById("score").style.fontWeight = "bold";
            document.getElementById("score").animate([
                { scale: 3 },
                { scale: 1 }
            ], { duration: 90 });
            
        }
        contador = 0;
    }
}
function animacionEliminacionFila(fila) {
    const duracionAnimacion = 300;  // Duración total de la animación en milisegundos
    const pasos = 15;  // Número de pasos para la animación

    let paso = 0;
    const tiempoPaso = duracionAnimacion / pasos;

    function pasoAnimacion() {
        for (var i = 0; i < paso; i++) {
            tablero[fila][i] = 0;
        }
        paso++;
        if (paso <= pasos) {
            setTimeout(pasoAnimacion, tiempoPaso);
        } else {
            bajarFichas(fila);
            comprobar_tablero();
        }
    }
    pasoAnimacion();
}

//Funcion cuando se completa una fila que las que esten por encima bajen
function bajarFichas(fila) {
    for (var i = fila; i > 0; i--) {
        for (var j = 0; j < anchoTablero; j++) {
            tablero[i][j] = tablero[i - 1][j];
        }
    }
}

//Tiempo de partida
let segundos = 0;
let minutos = 0;
function tiempoJuego() {
    //Parar el contador si el jugador a parado la partida
    if (botonPlaySrc[botonPlaySrc.length - 1] == "pause.png" && !finalJuego()) {
        segundos += 1;
        if (segundos == 60) {
            segundos = 0;
            minutos += 1;
        }
    }
    document.querySelector(".tiempo_juego").innerHTML = `${minutos.toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${segundos.toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
}
function resetTiempo() {
    segundos = 0;
    minutos = 0;
}
//Velocidad de caida
function tiempoCaidaFicha(contador) {
    clearInterval(caidaFicha);
    if (contador > 12) {
        caidaFicha = setInterval(mover_ficha_auto, 100);
    } else if (contador > 10) {
        caidaFicha = setInterval(mover_ficha_auto, 150);
    } else if (contador > 8) {
        caidaFicha = setInterval(mover_ficha_auto, 200);
    } else if (caidaFicha > 7) {
        caidaFicha = setInterval(mover_ficha_auto, 250);
    } else if (contador > 5) {
        caidaFicha = setInterval(mover_ficha_auto, 300);
    } else if (contador > 2) {
        caidaFicha = setInterval(mover_ficha_auto, 500);
    } else {
        caidaFicha = setInterval(mover_ficha_auto, 700);
    }
}

//Funcion cuando el juego esta en pausa
function pausa() {
    clearInterval(caidaFicha);
    document.body.removeEventListener("keydown", mover_ficha);
}
function juegoPausado() {
    if (botonPlaySrc[botonPlaySrc.length - 1] == "play.png") {
        return pausarJuego != true ? pausarJuego = true : pausarJuego = false;
    }
}

//FUNCION PPAL. Solo se llama una vez porque se llama a si misma constantemente
function actualizar() {
    comprobarAncho();
    if (!juegoPausado() && !finalJuego()) {
        mostrar();
        window.requestAnimationFrame(actualizar);
    } else {
        if (finalJuego()) {
            cambiarPistaAudio(1);
            setTimeout(fin, 2000);
        } else {
            pausa();
        }
    }
}
//Audio
function cambiarPistaAudio(vez) {
    var pruueba = document.querySelector("source");
    if (vez == 1) {
        pruueba.src = "audio/gameover.mp3";
        audio.loop = false;
    } else {
        pruueba.src = "audio/cancion.mp3";
    }
    audio.load();
    audio.play();
}

//Funcion que se ejecuta cuando se ha llegado al final del juego
function fin() {
    var valor = false;
    let div_fin = document.querySelector("div.ranking");
    let div = document.querySelector(".ranking_visible");

    div_fin.classList = "div_fin";
    document.getElementsByClassName("izquierda")[0].style.zIndex = 2;

    console.log("entra");
    let divUsu = document.createElement("div");
    divUsu.classList = "div_usuario_actual";
    div.appendChild(divUsu);

    let imagen = document.createElement("img");
    imagen.className = "imagen_ranking";
    imagen.src = document.querySelector(".imgAvatar").src;

    usu = document.getElementById("usuario").value.toLowerCase();
    numFilas = contadorFilas;

    divUsu.appendChild(imagen);

    let usuarioElement = document.createElement("p");
    usuarioElement.innerText = usu;
    divUsu.appendChild(usuarioElement);

    let numFilasElement = document.createElement("p");
    numFilasElement.innerText = numFilas;
    divUsu.appendChild(numFilasElement);

    //Crear boton al final
    boton = document.createElement("button");
    boton.appendChild(document.createTextNode("Volver a Jugar"));
    boton.classList = "boton_final";

    document.querySelector(".ranking_visible").appendChild(boton);
    document.querySelector(".ranking_visible").style.width = "40%";
    boton.addEventListener("click", volverJugar);

    //Creacion del objeto con los valores
    const almacenamientoJSON = {
        Usuario: document.getElementById("usuario").value.toLowerCase(),
        Imagen: document.querySelector(".imgAvatar").src,
        Filas: contadorFilas
    };
    //Si localStorage no tiene datos se inicializa el array vacio
    jugadores = JSON.parse(localStorage.getItem("Jugadores")) || [];
    if (jugadores != null) {
        jugadores.forEach(elemento => {
            if (elemento.Usuario == almacenamientoJSON.Usuario) {
                jugadores[jugadores.indexOf(elemento)].Imagen = document.querySelector(".imgAvatar").src;
                //SI LAS FILAS QUE HA HECHO SON MENORES QUE LAS QUE TIENE REGISTRADAS ACTUALICE SI NO NO
                if (jugadores[jugadores.indexOf(elemento)].Filas < contadorFilas) {
                    jugadores[jugadores.indexOf(elemento)].Filas = contadorFilas;
                }
                valor = true;
            }
        })
    }
    //Si el valor es falso es porque el usuario ya existe por lo tanto no crea otro usuario en el localStorage
    if (!valor) {
        jugadores.push(almacenamientoJSON);
    }
    //Volcado de datos al localStorage
    localStorage.setItem("Jugadores", JSON.stringify(jugadores));

    if (jugadores != null && jugadores != undefined) {
        compararScore();
    }
}
function finalJuego() {
    var valor = false;
    for (var i = 0; i < pieza.figura.length; i++) {
        for (var j = 0; j < pieza.figura[i].length; j++) {
            if (tablero[i + posicionY][j + posicionX] != 0) {
                valor = true;
            }
        }
    }
    return valor;
}

//RANKING FINAL
//Se cogen los 3 mejores usuarios
function cogerDatosLocalStorage() {
    if (jugadores != null && jugadores != undefined) {

        cambiarTitulosRanking();

        let div = document.querySelector(".ranking_visible");
        let filas = [];

        // Filtrar los datos por los que más líneas han hecho
        for (var i = 0; i < jugadores.length; i++) {
            filas[i] = {
                filas: jugadores[i].Filas,
                posicion: i
            };
        }

        // Ordenar el array filas en función del valor (número de filas)
        filas.sort(function (a, b) {
            return b.filas - a.filas; // Orden descendente
        });

        // El máximo es dependiendo cuántos queramos mostrar
        if (jugadores.length < 3) {
            for (var i = 0; i < jugadores.length; i++) {
                crearElementosJugador(div, jugadores[filas[i].posicion]);
            }
        } else {
            for (var i = 0; i < 3; i++) {
                crearElementosJugador(div, jugadores[filas[i].posicion]);
            }
        }
    }
}
//Crear los div de cada jugador que este en el ranking
function crearElementosJugador(div, jugador) {
    let divUsu = document.createElement("div");
    divUsu.classList = "div_usuario";
    div.appendChild(divUsu);

    let imagen = document.createElement("img");
    imagen.className = "imagen_ranking";
    imagen.src = jugador.Imagen;

    let usu = jugador.Usuario;

    let numFilas = jugador.Filas !== undefined ? jugador.Filas : 0;

    divUsu.appendChild(imagen);

    let usuarioElement = document.createElement("p");
    usuarioElement.innerText = usu;
    divUsu.appendChild(usuarioElement);

    let numFilasElement = document.createElement("p");
    numFilasElement.innerText = numFilas;
    divUsu.appendChild(numFilasElement);
}
function compararScore() {
    let usuarioValido = true;
    let actualizar_score = true;
    var valor = true;

    var array = Array.from(document.querySelectorAll(".div_usuario")); //Array con los 3 mejores usuarios
    var ultimoUsuario = document.querySelector(".div_usuario_actual");
    var score_antiguo, score_nuevo;
    array.forEach(elemento => { //Comparar si el usuario actual ya esta entre los 3 mejores
        //Si coincide en nombre de usuario y no tiene mas lineas que su mejor registro no hace cambios
        if (elemento.children[1].textContent == ultimoUsuario.children[1].textContent) {
            usuarioValido = false;
            if (elemento.children[2].textContent < ultimoUsuario.children[2].textContent) {
                actualizar_score = false;
                score_nuevo = ultimoUsuario.children[2].textContent;
                score_antiguo = elemento;
            }
        }
    })
    ultimoUsuario.animate([ //se hace grande
        { scale: 1 },
        { scale: 1.1 }
    ], {
        duration: 500,
        delay: 1000,
        fill: "forwards"
    });

    //Comparar con los 3 mejores usuarios para ver en que posicion hace un insertBefore en caso de que haya hecho mas lineas
    if (!usuarioValido && !actualizar_score) { //mismo usuario con mas score
        setTimeout(function () {
            score_antiguo.children[2].textContent = score_nuevo;
            score_antiguo.children[2].animate([
                { scale: 1 },
                { scale: 3 },
                { scale: 1 }
            ], { duration: 300 });
        }, 2700);
    }
    if (usuarioValido) {
        var boton = document.querySelector(".boton_final");
        setTimeout(function () {
            if (array.length == 0) { //SI NO HAY DATOS EN EL RANKING
                insertarAntes(ultimoUsuario, boton);
                cambiarTitulosRanking();
            } else { // si hay datos en el Ranking
                for (var i = 0; i < array.length; i++) {
                    if (array.length <= 2) { //si hay menos de 3 usuarios en el Ranking
                        if (array[i].children[2].textContent < ultimoUsuario.children[2].textContent && ultimoUsuario.classList != "div_usuario") {
                            insertarAntes(ultimoUsuario, array[i]);
                            valor = false;
                        }
                        if (i == array.length - 1 && valor) { //si no se ha metido en el if de arriba
                            insertarAntes(ultimoUsuario, boton);
                        }
                    } else if (array[i].children[2].textContent < ultimoUsuario.children[2].textContent && ultimoUsuario.classList != "div_usuario") {
                        insertarAntes(ultimoUsuario, array[i]);
                        array[array.length - 1].remove(); //Eliminar el ultimo elemento
                    }
                }
            }
        }, 2500);
    }
}
function resetRanking() {
    document.querySelectorAll(".div_usuario").forEach(div => {
        div.remove();
    })
}

//Insertar un elemento antes de otro en el Ranking
function insertarAntes(ultimoUsuario, elemento) {
    ultimoUsuario.parentElement.insertBefore(ultimoUsuario, elemento);
    ultimoUsuario.classList = "div_usuario";
    ultimoUsuario.animate([
        { scale: 1.2 },
        { scale: 1 }
    ], {
        duration: 1000,
        fill: "forwards"
    });
}
function cambiarTitulosRanking() {
    var div_titulos = document.querySelector(".titulos");
    var p1 = document.querySelector(".titulos>p");
    var p2 = document.createElement("p");
    var p3 = document.createElement("p");
    p1.innerHTML = "Avatar";
    p2.appendChild(document.createTextNode("Usuario"));
    p3.appendChild(document.createTextNode("Score"));

    div_titulos.appendChild(p2);
    div_titulos.appendChild(p3);
}

function jugar() {
    cogerDatosLocalStorage();
    crear_tablero();
    generarPieza(0);
    comprobar_tablero();
}
function volverJugar() {
    document.querySelector(".div_fin").classList = "ranking";
    document.querySelector(".ranking_visible").style.width = "80%";
    boton.remove();
    //Revisar si no se ha insertado en el ranking y entonces si que hay que hacer remove
    if (document.querySelector(".div_usuario_actual")) {
        document.querySelector(".div_usuario_actual").remove();
    }
    document.querySelectorAll(".titulos>p")[2].remove();
    document.querySelectorAll(".titulos>p")[1].remove();


    //////AÑADIDO PARA QUE SE RESETEE EL NUMERO DE LINEAS QUE LLEVA, EL CONTADOR DE FILAS Y LA VELOCIDAD DE CAIDA DE LA FICHA\\\\\\
    document.getElementById("score").innerHTML = 0;
    contadorFilas = 0;
    tiempoCaidaFicha(contadorFilas);
    resetTiempo();

    cambiarPistaAudio(2);
    resetRanking();
    jugar();
    actualizar();
}
jugar();