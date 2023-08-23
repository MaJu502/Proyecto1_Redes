/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
  About:
  Client for connecting to an XMPP server using a JS script with the ability to manage accounts.
*/

const { xmClient } = require("./xmClient");
/* Se importa el módulo xmClient desde el archivo "xmClient.js".
   Este es utilizado para crear las instancias de conexión necesarias
   para comunicarse con el servidor XMPP.
*/

/* Se crea una función para permitir inputs async del usuario
   cuando se este usando el cliente. Esta función fue implementada
   con readline y posteriormente corregida y optimizada con la 
   ayuda de chat GPT. 
*/
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* Se importa el módulo readline para manejar la entrada de usuario desde la consola.
   Se crea una interfaz de lectura (rl) para leer las entradas del usuario.
   La función "input" se define como una función asíncrona que muestra un mensaje y
   espera la entrada del usuario. Se utiliza "rl.question" para obtener la entrada
   del usuario y se devuelve como una promesa. Esto permite que el input del usuario
   sea esperado por la ejecución asincrona del programa. 
*/
const input = async (msg) => {
    try {
        return await new Promise((resolve) => rl.question(msg, resolve));
    } catch (error) {
        console.error("Error al obtener la entrada:", error);
        throw error;
    }
};

// VARIABLES IMPORTANTES
let loggedInUser = "";
let loggedInPassword = "";
let loggedClient = null;

// Los menús definen las opciones que el usuario puede seleccionar en cada sección.
/* Menu principal con las opciones 
   para mensajería y administrador 
*/
const showMainMenu = async () => {
    console.log("\n\n\n--- Main Menu ---");
    console.log("1. Messaging");
    console.log("2. Manage Accounts");
    console.log("3. Exit");

    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};

/* Menu para mensajeria */
const showMensajeriaMenu = async () => {
    console.log("\n\n\n--- Messaging Menu ---");
    console.log("1. Private Message");
    console.log("2. Broadcast Chat");
    console.log("3. Show Contacts");
    console.log("4. Add Contact");
    console.log("5. Contact Info");
    console.log("6. Change Status");
    console.log("7. Notifications");
    console.log("8. Files");
    console.log("9. Back to Main Menu");


    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};
/* Menú para opciones de administración. */
const showAdministrarMenu = async () => {
    console.log("\n\n\n--- Manage Accounts Menu ---");
    console.log("1. Register");
    console.log("2. Log in");
    console.log("3. Log out");
    console.log("4. Delete account");
    console.log("5. Back to Main Menu");
    

    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};
/* Menú para enviar y recibir mensajes directos. */
const showDMmenu = async () => {
    console.log("\n\n\n--- Private Messages Menu ---");
    console.log("1. Send message");
    console.log("2. View messages");
    console.log("3. Back to Messaging Menu");
    const choice = await input("\n >> Select an option: ");    
    return parseInt(choice);
}
/* Menú para opciones de grupos y chat grupal. */
const showGroupMenu = async () => {
    console.log("\n\n\n--- Group Chats Menu ---");
    console.log("1. Send message to groups (view group chats)");
    console.log("2. View group messages");
    console.log("3. Create new group chat");
    console.log("4. Add user to a group chat");
    console.log("5. View groups");
    console.log("6. Back to Messaging Menu");    
    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
}

/* La función "main" es la función principal del programa. */
const main = async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    while (true) {
        const choice = await showMainMenu(); //Muestra el menu principal del programa

        switch (choice) {
            case 1:
                await handleMensajeria(); //opcion de mensajeria
                break;
            case 2:
                await handleAdministrar(); // opcion de administración de cuentas
                break;
            case 3:
                console.log("Thanks for using the xmpp client program! Bye :)");
                rl.close();
                return; // Finaliza el programa
            default:
                console.log("Invalid option. Please try again.");
        }
    }
};

/* La función "handleDMs" maneja las opciones del menú de Mensajes privados o directos. */
const handleDMs = async () => {
    while (true) {
        const choice = await showDMmenu();
        switch (choice) {
            case 1:
                console.log("Sending message...");
                
                const usuarioDM = await input("\n >> Who would you like to send the message to: ");
                const cuerpoDM = await input(" >> Your message: \n");


                await loggedClient.sendMessagesDM(usuarioDM,cuerpoDM);

                break;
            case 2:
                console.log("Searching for messages...\n >> You have messages from:");

                await loggedClient.getUniqueSenderUsernames();
                
                // pregnutar que usuario
                const usuariodmtemp = await input("\n >> Enter the username of the person whose messages you want to view: ");                

                // mostrar mensajes de ese usuario
                await loggedClient.getMessagesByUsername(usuariodmtemp);

                break;
            case 3:
                console.log("Returning to Administration Menu");
                return;
            default:
                console.log("Invalid option. Please try again.");
                
        }
    }
}

/* La función "handleGroup" maneja las opciones del menú de group chats. */
const handleGroup = async () => {
    while (true) {
        const choice = await showGroupMenu();
        switch (choice) {
            case 1:
                console.log("Sending message...");

                const groupDM = await input("\n >> Which group do you want to send the message to: ");
                const cuerpoDM = await input(" >> Your message: \n");                

                await loggedClient.sendMessagesGroup(groupDM,cuerpoDM);

                break;
            case 2:
                console.log("Searching for messages...\n >> You have messages from these group chats:");

                await loggedClient.getUniqueSenderUsernames();
                
                // pregnutar que usuario
                const usuariodmtemp = await input("\n >> Enter the name of the group whose messages you want to view: ");
                
                // mostrar mensajes de ese usuario
                await loggedClient.getMessagesByUsername(usuariodmtemp);


                break;

            case 3:
                const namedd = await input("\n >> Enter the name of the group you want to join/create: ");

                await loggedClient.joinGroup(namedd, "a");

                break;

            case 4:
                const userAddedGroup = await input("\n >> Enter the JID of the user you want to add to the group: ");
                const roomed = await input("\n >> Enter the name of the group chat you want to add the user to: ");                
                await loggedClient.invitedgroup(roomed, userAddedGroup);
                break

            case 5:
                await loggedClient.showGroupChats();
                break 

            case 6:
                console.log("Returning to Administration Menu");
                return;
                
            default:
                console.log("Invalid option. Please try again.");
                
        }
    }
}

/* La función "handleMensajeria" maneja las opciones del menú de mensajería. */
const handleMensajeria = async () => {
    while (true) {
        const choice = await showMensajeriaMenu();
        switch (choice) {
            case 1:
                await handleDMs();
                break;
            case 2:
                await handleGroup();
                break;
            case 3:
                console.log("Showing contacts: ");
                loggedClient.getRoster = true
                loggedClient.getContactList();
                break;
            case 4:
                console.log("Adding contact to contactlist");
                const usuarioADD = await input("Enter the JID of the user you want to add: ");
                await loggedClient.addContact(usuarioADD);
                break;
            case 5:
                console.log("Showing info from contact...");
                const usuarioINFO = await input("Enter the JID of the user you want to get information for: ");
                await loggedClient.getContactInfo(usuarioINFO);
                break;
            case 6:
                console.log('Changing status...');
                const presenceChoice = await input('Select presence status (chat/away/xa/dnd): ');
                const statusMessage = await input('Enter a status message to display to other users: ');                
                await loggedClient.changeUserPresence(presenceChoice, statusMessage);
                break;
            case 7:
                console.log("Showing notifications...");
                loggedClient.mostrarNOTIS();
                break;
            case 8:
                console.log("Accessing files");
                const rutero = await input('Enter the path of the file you want to send: ');
                const usuario = await input('Enter the JID of the user you want to send the file to: ');
                await loggedClient.sendFiles(rutero, usuario);
                break;
            case 9:
                console.log("Returning to main menu...");
                return;
            default:
                console.log("Invalid option. Please try again.");
        }
    }
};

/* La función "handleAdministrar" maneja las opciones del menú de administración de cuentas. */
const handleAdministrar = async () => {
    while (true) {
        const choice = await showAdministrarMenu();

        switch (choice) {
            case 1:
                loggedInUser = await input("Enter the username: ");
                loggedInPassword = await input("Enter the password: ");
                console.log("Registering user:", loggedInUser);
                console.log("Password:", loggedInPassword);

                
                handleClientConnect();
                await loggedClient.signup();

                break;
            case 2:
                loggedInUser = await input("Enter the username: ");
                loggedInPassword = await input("Enter the password: ");
                console.log("Logging in user:", loggedInUser);
                console.log("Password:", loggedInPassword);

                handleClientConnect();
                await loggedClient.login();

                break;
            case 3:
                console.log("Logging out");

                await loggedClient.logout();

                break;
            case 4:
                console.log("Deleting account");

                await loggedClient.deleteAccount();

                break;
            case 5:
                console.log("Returning to Main Menu");
                return;
            default:
                console.log("Invalid option. Please try again.");
        }
    }
};


/* La función "handleClientConnect" maneja la creación del objeto con la instancia de conexión al servidor XMPP. */
const handleClientConnect = async () => {
    loggedClient = new xmClient(loggedInUser, loggedInPassword);
}

main();/* Llama a la función principal para iniciar el programa. */