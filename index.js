const { xmClient } = require('./xmClient');

/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
  About:
  Client for connecting to an XMPP server using a JS script with the ability to manage accounts.
*/

/* Se crea una función para permitir inputs async del usuario
   cuando se este usando el cliente. Esta función fue implementada
   con readline y posteriormente corregida y optimizada con la 
   ayuda de chat GPT. 
*/
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const input = async (msg) => {
    try {
        return await new Promise((resolve) => rl.question(msg, resolve));
    } catch (error) {
        console.error('Error al obtener la entrada:', error);
        throw error;
    }
};

// VARIABLES IMPORTANTES
let loggedInUser = '';
let loggedInPassword = '';
let isLoged = false;
let loggedClient = new xmClient(loggedInPassword, loggedInPassword);


/* Menu principal con las opciones 
   para mensajería y administrador 
*/
const showMainMenu = async () => {
    console.log('\n\n\n--- Menú Principal ---');
    console.log('1. Mensajería');
    console.log('2. Administrar');
    console.log('3. Salir');

    const choice = await input('\n >> Seleccione una opción: ');
    return parseInt(choice);
};

/* Menu para mensajeria */
const showMensajeriaMenu = async () => {
    console.log('\n\n\n--- Menú de Mensajería ---');
    console.log('1. Mensaje privado');
    console.log('2. Chat broadcast');
    console.log('3. Mostrar contactos');
    console.log('4. Agregar contacto');
    console.log('5. Info de contacto');
    console.log('6. Mod. Estado');
    console.log('7. Notificaciones');
    console.log('8. Archivos');
    console.log('9. Volver al Menú Principal');

    const choice = await input('\n >> Seleccione una opción: ');
    return parseInt(choice);
};
/* Menu para adminstrar */
const showAdministrarMenu = async () => {
        console.log('\n\n\n--- Menú de Administración ---');
        console.log('1. Register');
        console.log('2. Log in');
        console.log('3. Log out');
        console.log('4. Delete account');
        console.log('5. Volver al Menú Principal');

        const choice = await input('\n >> Seleccione una opción: ');
        return parseInt(choice);
};

/* Función main del programa */
const main = async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    // VARIABLES IMPORTANTES
    const servidorREDES = '@alumchat.xyz';
    let usuario = '';
    let contra = '';

    while (true) {
        const choice = await showMainMenu();

        switch (choice) {
            case 1:
                await handleMensajeria();
                break;
            case 2:
                await handleAdministrar();
                break;
            case 3:
                console.log('Saliendo del menú.');
                rl.close();
                return;
            default:
                console.log('Opción no válida. Inténtalo nuevamente.');
        }
    }
};

const handleMensajeria = async () => {
    while (true) {
        const choice = await showMensajeriaMenu();

        switch (choice) {
            case 1:
                console.log('Realizando Mensaje privado');
                break;
            case 2:
                console.log('Realizando Chat broadcast');
                break;
            case 3:
                console.log('Mostrando contactos');
                break;
            case 4:
                console.log('Agregando contacto');
                break;
            case 5:
                console.log('Mostrando info de contacto');
                break;
            case 6:
                console.log('Modificando estado');
                break;
            case 7:
                console.log('Gestionando notificaciones');
                break;
            case 8:
                console.log('Accediendo a archivos');
                break;
            case 9:
                console.log('Volviendo al Menú Principal');
                return;
            default:
                console.log('Opción no válida. Inténtalo nuevamente.');
        }
    }
};

const handleAdministrar = async () => {
    while (true) {
        const choice = await showAdministrarMenu();

        switch (choice) {
            case 1:
                loggedInUser = await input('Ingrese el nombre de usuario: ');
                loggedInPassword = await input('Ingrese la contraseña: ');
                console.log('Registrando usuario:', loggedInUser);
                console.log('Contraseña:', loggedInPassword);

                // aqui va client
                handleClientConnect();
                await loggedClient.signup();

                break;
            case 2:
                loggedInUser = await input('Ingrese el nombre de usuario: ');
                loggedInPassword = await input('Ingrese la contraseña: ');
                console.log('Registrando usuario:', loggedInUser);
                console.log('Contraseña:', loggedInPassword);

                // aqui va client
                handleClientConnect();
                await loggedClient.login();

                break;
            case 3:
                console.log('Cerrando sesión');
                
                // aqui va client
                await loggedClient.logout();

                break;
            case 4:
                console.log('Eliminando cuenta');
                break;
            case 5:
                console.log('Volviendo al Menú Principal');
                return;
            default:
                console.log('Opción no válida. Inténtalo nuevamente.');
        }
    }
};

const handleLogin = async () => {
    const nombreUsuario = await input('Ingrese el nombre de usuario: ');
    const contraseña = await input('Ingrese la contraseña: ');

    // Aquí puedes verificar los datos ingresados para el inicio de sesión
    if (nombreUsuario === 'usuario' && contraseña === 'contraseña') {
        console.log('Iniciando sesión con usuario:', nombreUsuario);
        loggedInUser = nombreUsuario;
        loggedInPassword = contraseña;
        isLoged =  True;
        return { username: nombreUsuario, password: contraseña };
    } else {
        console.log('Credenciales incorrectas.');
        return null;
    }
};

const handleClientConnect = async () => {
    loggedClient = new xmClient(loggedInUser, loggedInPassword);
}





main();