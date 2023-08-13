/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
  About:
  Client for connecting to an XMPP server using a JS script with the ability to manage accounts.
*/

//const { client, xml } = require("@xmpp/client"); // variables de xmpp

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

const mainMenu = async () => {
    while (true) {
        console.log('\n\n\n--- Menú Principal ---');
        console.log('1. Mensajería');
        console.log('2. Administrar');
        console.log('3. Salir');

        const choice = await input('\n >> Seleccione una opción: ');

        switch (choice) {
            case '1':
                await messengerMenu();
                break;
            case '2':
                await adminMenu();
                break;
            case '3':
                console.log(" >> Gracias por utilizar el programa! Hasta pronto :)")
                rl.close();
                process.exit(0);
            default:
                console.log(' >> ERROR: Opción inválida. Por favor, seleccione una opción válida.');
                break;
        }
    }
};


const messengerMenu = async () => {
    console.log('\n\n\n--- Menú de Mensajería ---');
    console.log('1. Mostrar contactos');
    console.log('2. Agregar contacto');
    console.log('3. Info de contacto');
    console.log('4. Mensaje privado');
    console.log('5. Chat broadcast');
    console.log('6. Mod. Estado');
    console.log('7. Notificaciones');
    console.log('8. Archivos');
    console.log('9. Volver al Menú Principal');

    
    const choice = await input('\n >> Seleccione una opción: ');
    

    switch (choice) {
        case '1':
            console.log(' >> Opción seleccionada: Mostrar contactos');
            // Lógica para mostrar contactos
            break;
        case '2':
            console.log(' >> Opción seleccionada: Agregar contacto');
            // Lógica para agregar contacto
            break;
        case '3':
            console.log(' >> Opción seleccionada: Info de contacto');
            // Lógica para información de contacto
            break;
        case '4':
            console.log(' >> Opción seleccionada: Mensaje privado');
            // Lógica para mensaje privado
            break;
        case '5':
            console.log(' >> Opción seleccionada: Chat broadcast');
            // Lógica para chat broadcast
            break;
        case '6':
            console.log(' >> Opción seleccionada: Mod. Estado');
            // Lógica para modificar estado
            break;
        case '7':
            console.log(' >> Opción seleccionada: Notificaciones');
            // Lógica para notificaciones
            break;
        case '8':
            console.log(' >> Opción seleccionada: Archivos');
            // Lógica para archivos
            break;
        case '9':
            console.log(' >> Regresando al Menú Principal...');
            await mainMenu();
            break;
        default:
            console.log(' >> ERROR: Opción inválida. Por favor, seleccione una opción válida.');
            // No llamamos messengerMenu aquí para permitir al usuario intentar nuevamente.
            break;
    }

    // Después de manejar cada caso, llamamos a messengerMenu para mostrar el menú nuevamente.
    await messengerMenu();
};

const adminMenu = async () => {
    console.log('\n\n\n--- Menú de Administración ---');
    console.log('1. Log in');
    console.log('2. Log out');
    console.log('3. Register');
    console.log('4. Delete account');
    console.log('5. Volver al Menú Principal');

    
    const choice = await input('\n >> Seleccione una opción: ');
    

    switch (choice) {
        case '1':
            console.log(' >> Opción seleccionada: Log in');
            // Lógica para iniciar sesión
            break;
        case '2':
            console.log(' >> Opción seleccionada: Log out');
            // Lógica para cerrar sesión
            break;
        case '3':
            console.log(' >> Opción seleccionada: Register');
            // Lógica para registrar cuenta
            break;
        case '4':
            console.log(' >> Opción seleccionada: Delete account');
            // Lógica para eliminar cuenta
            break;
        case '5':
            console.log(' >> Regresando al Menú Principal...');
            await mainMenu();
            break;
        default:
            console.log(' >> ERROR: Opción inválida. Por favor, seleccione una opción válida.');
            await adminMenu();
            break;
    }

    // Después de manejar cada caso, llamamos a adminMenu para mostrar el menú nuevamente.
    await adminMenu();
};

// Uso de la función
(async () => {
    await mainMenu();
})();
